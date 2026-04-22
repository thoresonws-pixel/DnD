"use client";

import { use, useEffect, useState } from "react";
import { ensureSession, subscribeSession } from "@/lib/session";
import { colorForName, iconForName } from "@/lib/identity";
import type {
  ActionEntry,
  NarrationEntry,
  PlayerMeta,
  SessionState,
} from "@/lib/types";

type Params = { id: string };

export default function TvPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const [state, setState] = useState<SessionState>({});

  useEffect(() => {
    ensureSession(id).catch((err) => console.error("ensureSession", err));
    const unsub = subscribeSession(id, (s) => setState(s));
    return () => unsub();
  }, [id]);

  const players = Object.values(state.players ?? {});
  const actions = sortedActions(state.actions).slice(0, 10);
  const narration = sortedNarration(state.narration).slice(0, 6);

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <header className="text-center mb-10">
        <h1 className="text-6xl font-bold tracking-tight drop-shadow">
          🐉 {state.scene?.title ?? "The Tavern of Mysteries"}
        </h1>
        <p className="mt-2 text-xl opacity-80">Session: {id}</p>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl bg-white/5 p-8 backdrop-blur">
          <h2 className="mb-4 text-3xl font-semibold text-center">📖 Current Scene</h2>
          <p className="text-xl leading-relaxed opacity-90">
            {state.scene?.body ?? "Loading scene…"}
          </p>

          {narration.length > 0 && (
            <>
              <h3 className="mt-8 mb-3 text-2xl font-semibold text-center">🎙 Narration</h3>
              <div className="space-y-3 max-h-[24rem] overflow-y-auto pr-2">
                {narration.map((n) => (
                  <div key={n.key} className="rounded-lg bg-black/30 px-4 py-3">
                    <div className="text-sm opacity-70 mb-1">{n.speaker}</div>
                    <div className="text-lg">{n.text}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          <h3 className="mt-8 mb-3 text-2xl font-semibold text-center">🎬 Recent actions</h3>
          <div className="space-y-3 max-h-[20rem] overflow-y-auto pr-2">
            {actions.length === 0 && (
              <p className="italic opacity-60 text-center text-lg">
                Waiting for brave adventurers…
              </p>
            )}
            {actions.map((a) => {
              const label = `Player ${a.slot}`;
              return (
                <div
                  key={a.key}
                  className={`rounded-lg border-l-4 ${colorForName(label)} bg-black/30 px-4 py-3`}
                >
                  <div className="flex items-center justify-between text-sm opacity-80">
                    <span className="font-bold text-lg">
                      {iconForName(label)} {label}
                    </span>
                    <span>{formatTs(a.ts)}</span>
                  </div>
                  <div className="text-lg mt-1">{a.text}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white/5 p-6 backdrop-blur">
          <h2 className="mb-4 text-2xl font-semibold text-center">
            👥 Party ({players.filter((p) => p.connected).length})
          </h2>
          <ul className="space-y-2">
            {players.length === 0 && (
              <li className="italic opacity-60 text-center">No players yet…</li>
            )}
            {players.map((p) => (
              <PlayerCard key={p.slot} p={p} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function PlayerCard({ p }: { p: PlayerMeta }) {
  const label = `Player ${p.slot}`;
  return (
    <li
      className={`rounded-lg border-l-4 ${colorForName(label)} bg-white/10 px-4 py-3 flex items-center gap-3`}
    >
      <span className="text-2xl">{iconForName(label)}</span>
      <div className="flex-1">
        <div className="font-semibold">{label}</div>
        <div className="text-xs opacity-70">
          {p.connected ? "● ready" : "○ disconnected"}
        </div>
      </div>
    </li>
  );
}

function sortedActions(
  actions: Record<string, ActionEntry> | undefined
): Array<ActionEntry & { key: string }> {
  if (!actions) return [];
  return Object.entries(actions)
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
}

function sortedNarration(
  narration: Record<string, NarrationEntry> | undefined
): Array<NarrationEntry & { key: string }> {
  if (!narration) return [];
  return Object.entries(narration)
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
}

function formatTs(ts: number | undefined): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
