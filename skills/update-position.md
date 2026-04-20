---
skill: update-position
purpose: Keep Claude's tactical understanding of the table in sync with what's physically on the Foundry TV, using Foundry state events as ground truth and Scott's manual helper input as the override/backfill channel.
invoked_by: Foundry bridge (on token move events), helper channel (when Scott pushes a manual correction), narrate-scene (to snapshot current positions for scene context).
---

# Skill: update-position

## Purpose

The game board is a horizontal TV running Foundry with 3D-printed minis placed on the screen. When a mini moves, the player (or Scott) drags the underlying Foundry token to match. This skill listens for those changes, updates Claude's internal positional state, and provides read access to any other skill that needs tactical context (`narrate-scene`, `run-combat-round`, `handle-off-script`).

No camera, no CV. Foundry is the source of truth. Scott's helper channel is the override when Foundry is wrong.

## When to invoke

- **On Foundry event:** a token's position, visibility, or relevant state (prone, invisible, elevation) changes.
- **On helper event:** Scott pushes a manual correction via the helper channel ("mini for token npc_14 got knocked to the southeast corner").
- **On read:** another skill asks for the current positional snapshot.

## Inputs (write path)

- `source` — `foundry` | `helper`
- `token_id` — Foundry token ID
- `element_id` — mapped internal ID (NPC/PC) from `live/` state
- `changes`:
  ```yaml
  position: { x, y, elevation? }
  visibility: visible | hidden | invisible
  conditions: [...]    # Foundry-tracked conditions
  hp_current: <int>    # if Foundry is tracking HP too
  dropped_from_play: <bool>   # for knocked-over minis that leave play
  ```
- `timestamp`

## Inputs (read path)

- `scope` — `scene | encounter | specific_element_ids`
- Returns the current positional snapshot for the scope.

## Checklist (write path)

1. **Resolve `token_id` → `element_id`.** The mapping lives in `live/token_map.json` (built when elements are introduced; Foundry token IDs stored on each element's frontmatter).
2. **Validate scope.** Ignore updates for tokens not currently in play (archived or pre-spawn).
3. **Apply changes to `live/positions.json`.** This is the live positional state, flat and cheap to read.
4. **Conflict detection.** If this update contradicts a very recent update from a different source (e.g., Foundry says "moved 5 ft" but helper said "knocked off the board" 2 seconds earlier), prefer `helper`. Log the conflict; Scott's push beats Foundry's auto-save race.
5. **Notify downstream:** if combat is active and this token is the current-turn combatant, `run-combat-round` is informed so its movement budget can be tracked. Otherwise no cascade.
6. **Log** to `live/session_log/session_<N>.md` in a compact form: `pos_update`, `element_id`, `from → to`, `source`.

## Checklist (read path)

1. **Load `live/positions.json`.**
2. **Filter to scope** (scene = present elements; encounter = combatants; specific = requested IDs).
3. **Return snapshot** with: element_id, grid position, elevation, visibility, conditions, HP if tracked.

## Foundry integration

The Foundry-side integration publishes events when tokens change. Two realistic shapes, decide later:

- **Foundry module** that emits events to our Firebase / WebSocket endpoint on `updateToken` hooks.
- **Foundry API polling** by our bridge if a module isn't feasible.

This skill consumes the events; it doesn't care how they arrive. The adapter layer normalizes both shapes.

## Helper channel (override path)

Scott's device has a simple panel:
- Pick a token (search by visible portrait/name)
- Push one of: `moved to <grid ref>`, `prone`, `dead`, `knocked off map`, `back in play at <grid ref>`, `HP set to <N>`
- Free-text note ("bob's mini fell into his soda")

Helper events arrive at this skill with `source: helper` and are trusted over concurrent Foundry events.

## Narration consumption

Any skill that needs tactical context (`narrate-scene` before describing a scene, `run-combat-round` to know who's in melee range, `handle-off-script` to know if players are clustered or scattered) calls the read path and gets the snapshot. This skill never narrates — it just serves positional truth.

## Failure modes this skill prevents

- **Desync.** Foundry saying one thing and Claude thinking another leads to "the goblin attacks you" when the goblin is actually 40 feet away. The Foundry event stream is authoritative.
- **Stale state from dropped events.** Periodic full-snapshot sync (low frequency) reconciles; if Foundry and local state diverge, full snapshot wins.
- **Helper/Foundry races.** Explicit precedence rule (helper beats Foundry on conflict within a short window).
- **Silent scene drift.** Every position change logs; session-end-audit can surface if anything looked wrong.

## Out of scope

- Camera / computer vision (explicitly scratched, see PROJECT_KNOWLEDGE.MD)
- Rendering maps (Foundry does this)
- Deciding what moves — movement decisions live in `run-combat-round` or `player-action-route`; this skill just records what happened.
