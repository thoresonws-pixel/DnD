import {
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  set,
  update,
  type Unsubscribe,
} from "firebase/database";
import { getDb } from "./firebase";
import type {
  ActionEntry,
  ActionType,
  Direction,
  NarrationEntry,
  NarrationSpeaker,
  PendingRoll,
  PlayerSlot,
  Scene,
  SessionMode,
  SessionState,
} from "./types";

const sessionPath = (id: string) => `sessions/${id}`;

export function subscribeSession(
  sessionId: string,
  onState: (state: SessionState) => void
): Unsubscribe {
  const db = getDb();
  return onValue(ref(db, sessionPath(sessionId)), (snap) => {
    onState((snap.val() as SessionState) ?? {});
  });
}

export async function ensureSession(sessionId: string): Promise<void> {
  const db = getDb();
  const metaRef = ref(db, `${sessionPath(sessionId)}/meta`);
  await update(metaRef, {
    name: sessionId,
    createdAt: serverTimestamp(),
  });
  const sceneRef = ref(db, `${sessionPath(sessionId)}/scene`);
  const defaultScene: Scene = {
    title: "The Dragon's Head Tavern",
    body: "You find yourselves in a dimly lit tavern filled with the smell of ale and roasted meat. A hooded figure in the corner gestures mysteriously toward your party. What do you do?",
  };
  await update(sceneRef, defaultScene);
}

export async function joinSession(sessionId: string, slot: PlayerSlot): Promise<void> {
  const db = getDb();
  const playerRef = ref(db, `${sessionPath(sessionId)}/players/${slot}`);
  await set(playerRef, {
    slot,
    joinedAt: serverTimestamp(),
    connected: true,
  });
  onDisconnect(playerRef).update({ connected: false });
}

export async function sendAction(
  sessionId: string,
  slot: PlayerSlot,
  actionType: ActionType,
  text: string
): Promise<void> {
  const db = getDb();
  const actionsRef = ref(db, `${sessionPath(sessionId)}/actions`);
  const entry = {
    slot,
    actionType,
    text,
    ts: serverTimestamp() as object,
  };
  await push(actionsRef, entry);
}

export async function updateScene(sessionId: string, scene: Scene): Promise<void> {
  const db = getDb();
  const sceneRef = ref(db, `${sessionPath(sessionId)}/scene`);
  await set(sceneRef, scene);
}

export async function pushNarration(
  sessionId: string,
  text: string,
  speaker: NarrationSpeaker = "narrator"
): Promise<void> {
  const db = getDb();
  const narrationRef = ref(db, `${sessionPath(sessionId)}/narration`);
  await push(narrationRef, {
    text,
    speaker,
    ts: serverTimestamp() as object,
  });
}

export async function setMode(sessionId: string, mode: SessionMode): Promise<void> {
  const db = getDb();
  await set(ref(db, `${sessionPath(sessionId)}/mode`), mode);
}

export async function setLeader(
  sessionId: string,
  slot: PlayerSlot,
  isLeader: boolean
): Promise<void> {
  const db = getDb();
  const leaderRef = ref(db, `${sessionPath(sessionId)}/leaders/${slot}`);
  if (isLeader) await set(leaderRef, true);
  else await remove(leaderRef);
}

export async function setPlayerFoundryUrl(
  sessionId: string,
  slot: PlayerSlot,
  url: string
): Promise<void> {
  const db = getDb();
  await update(ref(db, `${sessionPath(sessionId)}/players/${slot}`), { foundryUrl: url });
}

export async function requestRoll(
  sessionId: string,
  slot: PlayerSlot,
  formula: string,
  label: string
): Promise<void> {
  const db = getDb();
  const roll: Omit<PendingRoll, "requestedAt"> & { requestedAt: object } = {
    formula,
    label,
    requestedAt: serverTimestamp() as object,
  };
  await set(ref(db, `${sessionPath(sessionId)}/pendingRolls/${slot}`), roll);
}

export async function resolveRoll(
  sessionId: string,
  slot: PlayerSlot,
  result: number
): Promise<void> {
  const db = getDb();
  await update(ref(db, `${sessionPath(sessionId)}/pendingRolls/${slot}`), {
    result,
    resolvedAt: serverTimestamp(),
  });
}

export async function cancelRoll(sessionId: string, slot: PlayerSlot): Promise<void> {
  const db = getDb();
  await remove(ref(db, `${sessionPath(sessionId)}/pendingRolls/${slot}`));
}

export async function sendMove(
  sessionId: string,
  slot: PlayerSlot,
  direction: Direction
): Promise<void> {
  const db = getDb();
  const movesRef = ref(db, `${sessionPath(sessionId)}/moves`);
  await push(movesRef, {
    slot,
    direction,
    ts: serverTimestamp() as object,
  });
}

export async function wipeSession(sessionId: string): Promise<void> {
  const db = getDb();
  await remove(ref(db, sessionPath(sessionId)));
}
