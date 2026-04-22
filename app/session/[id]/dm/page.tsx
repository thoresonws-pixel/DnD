"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Params = { id: string };

interface FoundryChatMessage {
  id: string;
  content: string;
  speaker?: {
    scene?: string | null;
    actor?: string | null;
    token?: string | null;
    alias?: string;
  };
  timestamp: number;
  author?: { id: string; name: string };
  whisper?: string[];
  isRoll?: boolean;
  flags?: Record<string, unknown>;
}

interface FoundryActorSummary {
  id: string;
  name: string;
  uuid: string;
  img?: string;
  subType?: string;
}

interface ParsedNpcProfile {
  personality?: string;
  open?: string;
  guarded?: string;
  secret?: string;
  voiceId?: string;
  relationships?: string;
  raw?: string;
}

const POLL_INTERVAL_MS = 5000;
const DEFAULT_SPEAKERS = ["Thorin", "Player 2", "Player 3", "Player 4"];

function stripHtml(html: string): string {
  if (typeof window === "undefined") return html.replace(/<[^>]+>/g, "").trim();
  const tmp = document.createElement("div");
  tmp.innerHTML = html ?? "";
  return (tmp.textContent || tmp.innerText || "").trim();
}

function parseNpcBio(bioHtml: string): ParsedNpcProfile {
  const plain = stripHtml(bioHtml);
  const extract = (tag: string) => {
    const re = new RegExp(`\\[${tag}\\]\\s*:?\\s*([\\s\\S]*?)(?=\\[[a-z-]+\\]|$)`, "i");
    const m = plain.match(re);
    return m?.[1]?.trim() || undefined;
  };
  return {
    personality: extract("personality"),
    open: extract("knowledge-open"),
    guarded: extract("knowledge-guarded"),
    secret: extract("knowledge-secret"),
    voiceId: extract("voice-id"),
    relationships: extract("relationships"),
    raw: plain,
  };
}

export default function DmPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);

  const [messages, setMessages] = useState<FoundryChatMessage[]>([]);
  const [actors, setActors] = useState<FoundryActorSummary[]>([]);
  const [activeNpcUuid, setActiveNpcUuid] = useState<string>("");
  const [activeNpcProfile, setActiveNpcProfile] = useState<ParsedNpcProfile | null>(null);
  const [activeNpcName, setActiveNpcName] = useState<string>("");

  const [activeSpeaker, setActiveSpeaker] = useState<string>(DEFAULT_SPEAKERS[0]);

  const [narrationText, setNarrationText] = useState("");

  const [rollPlayer, setRollPlayer] = useState<string>(DEFAULT_SPEAKERS[0]);
  const [rollCheck, setRollCheck] = useState("");
  const [rollResult, setRollResult] = useState("");

  const [micListening, setMicListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  const foundryUrl = process.env.NEXT_PUBLIC_FOUNDRY_URL;

  /* --- Poll Foundry chat --- */
  const fetchChat = useCallback(async () => {
    try {
      const res = await fetch("/api/foundry/chat", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data?.messages)) {
        setMessages(data.messages.sort((a: FoundryChatMessage, b: FoundryChatMessage) => b.timestamp - a.timestamp));
      }
    } catch (err) {
      console.error("chat poll failed", err);
    }
  }, []);

  useEffect(() => {
    fetchChat();
    const t = setInterval(fetchChat, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [fetchChat]);

  /* --- Load actors for NPC selector --- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/foundry/actors?q=", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data?.actors)) setActors(data.actors);
      } catch (err) {
        console.error("actor load failed", err);
      }
    })();
  }, []);

  /* --- When active NPC changes, fetch profile --- */
  useEffect(() => {
    if (!activeNpcUuid) {
      setActiveNpcProfile(null);
      setActiveNpcName("");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/foundry/actors/${encodeURIComponent(activeNpcUuid)}`);
        const data = await res.json();
        const actor = data?.actor;
        if (actor) {
          setActiveNpcName(actor.name ?? "");
          const bio = actor?.system?.details?.biography?.value ?? "";
          setActiveNpcProfile(parseNpcBio(bio));
        }
      } catch (err) {
        console.error("actor fetch failed", err);
      }
    })();
  }, [activeNpcUuid]);

  /* --- Send chat message to Foundry --- */
  const sendToFoundry = useCallback(async (content: string) => {
    try {
      const res = await fetch("/api/foundry/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchChat();
    } catch (err) {
      console.error("send failed", err);
      alert(`Send failed: ${err}`);
    }
  }, [fetchChat]);

  /* --- Voice: Web Speech API --- */
  const toggleMic = useCallback(() => {
    if (micListening) {
      recognitionRef.current?.stop();
      return;
    }
    const SR: SpeechRecognitionCtor =
      (window as WindowWithSpeech).SpeechRecognition ||
      (window as WindowWithSpeech).webkitSpeechRecognition;
    if (!SR) {
      alert("Web Speech API not supported in this browser — use Chrome.");
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    let transcript = "";

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let latest = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) latest += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (latest) transcript += latest;
      setFinalTranscript(transcript);
      setLiveTranscript(interim);
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error("speech error", e);
    };

    rec.onend = () => {
      setMicListening(false);
    };

    rec.start();
    recognitionRef.current = rec;
    setMicListening(true);
    setFinalTranscript("");
    setLiveTranscript("");
  }, [micListening]);

  const commitTranscript = useCallback(async () => {
    const text = (finalTranscript + " " + liveTranscript).trim();
    if (!text) return;
    await sendToFoundry(`${activeSpeaker} says: ${text}`);
    setFinalTranscript("");
    setLiveTranscript("");
  }, [finalTranscript, liveTranscript, activeSpeaker, sendToFoundry]);

  /* --- Gamepad: Start button (idx 9) starts/stops mic --- */
  useEffect(() => {
    const prevStart: Record<number, boolean> = {};
    let raf = 0;
    const poll = () => {
      const pads = navigator.getGamepads?.() ?? [];
      for (let i = 0; i < pads.length; i++) {
        const p = pads[i];
        if (!p) continue;
        const startBtn = p.buttons[9];
        const pressed = !!startBtn?.pressed;
        if (pressed && !prevStart[i]) {
          toggleMic();
        }
        prevStart[i] = pressed;
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(raf);
  }, [toggleMic]);

  /* --- Derived: player-facing messages (exclude whispers and module spam) --- */
  const playerFeed = useMemo(() => {
    return messages
      .filter((m) => (m.whisper?.length ?? 0) === 0)
      .filter((m) => m.speaker?.alias !== "REST API Module")
      .filter((m) => m.speaker?.alias !== "Dice So Nice!")
      .filter((m) => m.speaker?.alias !== "Foundry Virtual Tabletop")
      .filter((m) => m.speaker?.alias !== "Tidy 5e Sheets")
      .slice(0, 30);
  }, [messages]);

  /* --- Prompt builder — assumes Claude Project has the API instructions preloaded --- */
  const buildClaudePromptForMessage = useCallback(
    (msg: FoundryChatMessage) => {
      const player = msg.speaker?.alias || msg.author?.name || "A player";
      const content = stripHtml(msg.content);

      if (activeNpcName) {
        const profile = activeNpcProfile ?? {};
        const lines = [
          `[NPC Exchange]`,
          `Active NPC: ${activeNpcName}`,
          profile.personality ? `Personality: ${profile.personality}` : "",
          profile.open ? `Knowledge-open: ${profile.open}` : "",
          profile.guarded ? `Knowledge-guarded: ${profile.guarded}` : "",
          profile.secret ? `Knowledge-secret (never reveal): ${profile.secret}` : "",
          `Player (${player}): "${content}"`,
        ].filter(Boolean);
        return lines.join("\n");
      }

      return [
        `[Rules Query or Assist]`,
        `Player (${player}) said: "${content}"`,
        `Suggest a response or ruling. No active NPC.`,
      ].join("\n");
    },
    [activeNpcName, activeNpcProfile]
  );

  const copyPrompt = useCallback((msg: FoundryChatMessage) => {
    const prompt = buildClaudePromptForMessage(msg);
    navigator.clipboard.writeText(prompt);
  }, [buildClaudePromptForMessage]);

  const copyGamestate = useCallback(() => {
    const recent = playerFeed
      .slice(0, 10)
      .map((m) => `- ${m.speaker?.alias ?? m.author?.name}: ${stripHtml(m.content)}`)
      .reverse()
      .join("\n");

    const npc = activeNpcName
      ? `Active NPC: ${activeNpcName}\n${activeNpcProfile?.raw ?? ""}`
      : "Active NPC: (none)";

    const out = [
      `=== Gamestate for session ${id} ===`,
      npc,
      ``,
      `Recent chat (oldest first):`,
      recent || "(none)",
    ].join("\n");
    navigator.clipboard.writeText(out);
  }, [id, playerFeed, activeNpcName, activeNpcProfile]);

  /* --- Actions --- */
  const sendNarration = useCallback(async () => {
    const text = narrationText.trim();
    if (!text) return;
    await sendToFoundry(`!narrate ${text}`);
    setNarrationText("");
  }, [narrationText, sendToFoundry]);

  const submitRoll = useCallback(async () => {
    const r = rollResult.trim();
    if (!r || !rollCheck.trim() || !rollPlayer) return;
    await sendToFoundry(`${rollPlayer} — ${rollCheck.trim()}: ${r}`);
    setRollResult("");
  }, [rollPlayer, rollCheck, rollResult, sendToFoundry]);

  /* --- Render --- */
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h1 className="text-xl font-semibold">DM Control · {id}</h1>
            <p className="text-xs text-zinc-500">Scott-as-DM companion. Paste Claude output, manage NPC voice, fire narration.</p>
          </div>
          {foundryUrl && (
            <a href={foundryUrl} target="_blank" rel="noopener noreferrer"
               className="rounded-md bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-sm">
              Open Foundry ↗
            </a>
          )}
        </header>

        {/* Active Speaker + Active NPC */}
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Panel title="Active Speaker (for voice input)">
            <select value={activeSpeaker} onChange={(e) => setActiveSpeaker(e.target.value)}
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-2 py-1.5">
              {DEFAULT_SPEAKERS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <p className="mt-1 text-xs text-zinc-500">Used to attribute mic transcription when sent.</p>
          </Panel>

          <Panel title={`Active NPC ${activeNpcName ? `— ${activeNpcName}` : ""}`}>
            <select value={activeNpcUuid} onChange={(e) => setActiveNpcUuid(e.target.value)}
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-2 py-1.5">
              <option value="">(none)</option>
              {actors
                .filter((a) => a.subType === "npc" || a.subType === "character")
                .map((a) => <option key={a.uuid} value={a.uuid}>{a.name} ({a.subType})</option>)}
            </select>
            {activeNpcProfile && (
              <div className="mt-2 text-xs text-zinc-400 space-y-0.5">
                {activeNpcProfile.personality && <div><span className="text-zinc-500">Personality:</span> {activeNpcProfile.personality}</div>}
                {activeNpcProfile.open && <div><span className="text-zinc-500">Open:</span> {activeNpcProfile.open}</div>}
                {activeNpcProfile.guarded && <div><span className="text-zinc-500">Guarded:</span> {activeNpcProfile.guarded}</div>}
                {activeNpcProfile.secret && <div className="text-rose-300/80"><span className="text-zinc-500">Secret:</span> {activeNpcProfile.secret}</div>}
                {!activeNpcProfile.personality && !activeNpcProfile.open && !activeNpcProfile.secret &&
                  <div className="italic text-zinc-500">No structured tags found. Edit this actor&apos;s biography and add lines like <code>[personality]: ...</code></div>}
              </div>
            )}
          </Panel>
        </section>

        {/* Voice Input */}
        <Panel title="Voice input (Razer mic → Web Speech API)">
          <div className="flex items-center gap-3">
            <button onClick={toggleMic}
                    className={`rounded-md px-3 py-2 font-medium ${micListening ? "bg-rose-600 hover:bg-rose-500" : "bg-indigo-600 hover:bg-indigo-500"}`}>
              {micListening ? "⏹ Stop Listening" : "🎙 Start Listening"}
            </button>
            <span className="text-xs text-zinc-500">Or press Start on any paired controller.</span>
          </div>
          <div className="mt-2 min-h-[4rem] rounded bg-zinc-900 border border-zinc-800 p-2 text-sm">
            <span>{finalTranscript}</span>
            <span className="text-zinc-500">{liveTranscript}</span>
            {!finalTranscript && !liveTranscript && <span className="text-zinc-600 italic">Transcription appears here.</span>}
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={commitTranscript}
                    disabled={!finalTranscript.trim() && !liveTranscript.trim()}
                    className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 px-3 py-1.5 text-sm">
              Commit as {activeSpeaker}
            </button>
            <button onClick={() => { setFinalTranscript(""); setLiveTranscript(""); }}
                    className="rounded-md bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 text-sm">
              Clear
            </button>
          </div>
        </Panel>

        {/* Player feed */}
        <Panel title={`Player actions (auto-refresh every ${POLL_INTERVAL_MS / 1000}s)`}>
          {playerFeed.length === 0 && <p className="italic text-zinc-500">No player actions yet.</p>}
          <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {playerFeed.map((m) => {
              const who = m.speaker?.alias ?? m.author?.name ?? "?";
              const text = stripHtml(m.content);
              const isRoll = m.isRoll;
              return (
                <li key={m.id} className="rounded bg-zinc-900 border border-zinc-800 p-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <div className="font-semibold">
                      {who}
                      {isRoll && <span className="ml-2 text-amber-400 text-xs">🎲 roll</span>}
                    </div>
                    <div className="text-xs text-zinc-500">{new Date(m.timestamp).toLocaleTimeString()}</div>
                  </div>
                  <div className="mt-1 break-words">{text}</div>
                  <div className="mt-1.5 flex gap-2">
                    <button onClick={() => copyPrompt(m)}
                            className="rounded bg-indigo-700 hover:bg-indigo-600 px-2 py-0.5 text-xs">
                      📋 Copy Claude prompt
                    </button>
                    <button onClick={() => navigator.clipboard.writeText(`${who}: ${text}`)}
                            className="rounded bg-zinc-700 hover:bg-zinc-600 px-2 py-0.5 text-xs">
                      📋 Copy line
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Narration direct */}
        <Panel title="Narration (fires as banner on TV)">
          <textarea value={narrationText} onChange={(e) => setNarrationText(e.target.value)}
                    rows={4} placeholder="The tavern door creaks open and a cloaked figure steps inside…"
                    className="w-full rounded bg-zinc-900 border border-zinc-700 p-2 text-sm" />
          <div className="mt-2 flex gap-2">
            <button onClick={sendNarration}
                    disabled={!narrationText.trim()}
                    className="rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-3 py-1.5 text-sm font-medium">
              🎙 Send as Narrator
            </button>
            <button onClick={() => setNarrationText("")}
                    className="rounded-md bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 text-sm">
              Clear
            </button>
          </div>
        </Panel>

        {/* Roll entry */}
        <Panel title="Roll entry">
          <div className="grid grid-cols-12 gap-2 text-sm">
            <select value={rollPlayer} onChange={(e) => setRollPlayer(e.target.value)}
                    className="col-span-4 rounded bg-zinc-900 border border-zinc-700 px-2 py-1.5">
              {DEFAULT_SPEAKERS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input value={rollCheck} onChange={(e) => setRollCheck(e.target.value)}
                   placeholder="Perception / Attack / Saving Throw…"
                   className="col-span-5 rounded bg-zinc-900 border border-zinc-700 px-2 py-1.5" />
            <input value={rollResult} onChange={(e) => setRollResult(e.target.value)}
                   placeholder="18" inputMode="numeric"
                   className="col-span-2 rounded bg-zinc-900 border border-zinc-700 px-2 py-1.5" />
            <button onClick={submitRoll}
                    disabled={!rollResult.trim() || !rollCheck.trim()}
                    className="col-span-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-sm font-medium">
              ↑
            </button>
          </div>
        </Panel>

        {/* Utility */}
        <div className="flex gap-2">
          <button onClick={copyGamestate}
                  className="rounded bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-sm">
            📋 Copy Gamestate (for Claude context)
          </button>
          <button onClick={fetchChat}
                  className="rounded bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-sm">
            🔄 Refresh chat
          </button>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">{title}</h2>
      {children}
    </section>
  );
}

/* ---- TS helpers for SpeechRecognition ---- */
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } } & { length: number; [i: number]: { transcript: string } }>;
};
type SpeechRecognitionErrorEvent = { error: string };
type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (e: SpeechRecognitionEvent) => void;
  onerror: (e: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionType;
type WindowWithSpeech = typeof window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};
