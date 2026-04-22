export type SessionMode = "abstracted" | "tactical";

export type PlayerSlot = "1" | "2" | "3" | "4";

export const PLAYER_SLOTS: readonly PlayerSlot[] = ["1", "2", "3", "4"] as const;

export type ActionType = "attack" | "talk" | "search" | "move" | "custom" | "system";

export interface ActionEntry {
  slot: PlayerSlot;
  actionType: ActionType;
  text: string;
  ts: number;
}

export interface Scene {
  title: string;
  body: string;
}

export interface PlayerMeta {
  slot: PlayerSlot;
  joinedAt: number;
  connected: boolean;
  foundryUrl?: string;
}

export interface SessionMeta {
  name: string;
  createdAt: number;
}

export type NarrationSpeaker = "narrator" | string;

export interface NarrationEntry {
  text: string;
  speaker: NarrationSpeaker;
  ts: number;
}

export interface PendingRoll {
  formula: string;
  label: string;
  requestedAt: number;
  resolvedAt?: number;
  result?: number;
}

export type Direction = "up" | "down" | "left" | "right";

export interface MoveEntry {
  slot: PlayerSlot;
  direction: Direction;
  ts: number;
}

export interface SessionState {
  meta?: SessionMeta;
  scene?: Scene;
  mode?: SessionMode;
  players?: Partial<Record<PlayerSlot, PlayerMeta>>;
  leaders?: Partial<Record<PlayerSlot, boolean>>;
  actions?: Record<string, ActionEntry>;
  narration?: Record<string, NarrationEntry>;
  pendingRolls?: Partial<Record<PlayerSlot, PendingRoll>>;
  moves?: Record<string, MoveEntry>;
}
