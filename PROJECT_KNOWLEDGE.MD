# D&D Digital Table System - Project Knowledge

Last Updated: 2026-04-19

## Product goal

A fully immersive, in-person D&D experience where **Claude is the DM** and Scott plays as a player (must not know the story). The system runs pre-existing published adventures loaded on demand.

## Physical setup

- **Game board** = flat-screen TV laid horizontally, running Foundry VTT as the map. 3D-printed minis placed physically on top of the screen.
- **DM screen** = separate TV acting as Claude's "face" — shows NPC portraits, character cards, scene art, plays DM/NPC voices.
- **Player devices** = each player has a phone webapp. Single "Action" button → hold-to-talk → action routed to Claude API. Players also input dice results manually when Claude calls for rolls.

## Stack

- **Next.js** (modified; see `AGENTS.md` — always read `node_modules/next/dist/docs/` before writing Next code)
- **Firebase Realtime DB** as sync substrate between player phones and the DM brain
- **Claude API** is the DM brain
- **ElevenLabs** for NPC/DM voice synthesis
- **Foundry VTT** as the tabletop map; integration likely via a Foundry module or websocket bridge

## Claude's role (fully immersive AI DM)

Runs the entire campaign: narration, NPC voicing, rules calls, initiative, encounter flow. Calls for rolls; players physically roll and type results. Takes positional ground-truth from Foundry state + occasional human helper input. No camera / no computer vision.

## Decision log

- **2026-04-19:** Overhead camera SCRATCHED — no camera-based miniature position detection.
- **2026-04-19:** Assistant-DM framing INVERTED — Claude is the DM; Scott is a player who occasionally feeds the AI DM helper input (load this module, a mini got bumped to X).
- **2026-04-19:** Skills-based architecture adopted — DM behaviors live as discrete invokable skills in `skills/`, not as one giant system prompt.

## Spoiler-avoidance design constraint

Scott must **not see story content**. Practical compromises:
- Scott curates a *pool* of ~10 NPC voices + portraits upfront. Claude matches invented/encountered NPCs from the pool.
- Scott self-polices repo file browsing. Claude must never *push* story content at him — progress reports use aggregates and coded IDs only, never names.
- No clarifying questions about plot to Scott. Structural/technical questions only.

## Campaign ingestion — seed bank, not script

The downloaded module is **creative fuel**, not a script to execute. The final story played can bear little resemblance to the source module. The module's job is to fix what Claude is bad at (novel premises, memorable villains with texture, distinctive world-building, tone commitment, avoiding AI-generic slop).

**Pipeline:**
- Fully automated, no Scott-in-the-loop review.
- Multi-pass with specific extraction lenses (tone, villain texture, places, factions, set-pieces, hooks, self-critique, gap-fill). 5–8 well-designed passes, not 20 identical re-reads.
- Checkpointed; passes re-runnable individually.
- Progress reports use aggregates and coded IDs only.

## Memory schema — source (immutable) + live (emergent)

**`source/` — extracted once from the module, immutable seed bank:**
- `tone.md` — genre, mood, cadence
- `villains/` — antagonist archetypes with texture (NOT a planned arc)
- `places/` — distinctive locations with sensory/mood detail
- `factions/` — tensions and alignments
- `setpieces/` — memorable scenes/images/mechanics
- `hooks/` — premise seeds
- `seed_usage.json` — tracks which seeds have been drawn on

**`live/` — emergent, mutable, the actual story being told:**
- `plot.md`, `beats.md`, `npcs/`, `locations/`, `secrets.md`, `session_log/`

**Runtime rule:** Claude runs from `live/`. When improvising, it MUST consult `source/` first and draw on unused seeds before inventing. Otherwise the module ingestion was wasted effort.

## Promise-keeping rule (Chekhov discipline)

Players won't notice missing content. They *will* notice a character introduced as "the prince" who never matters again. Every introduced element gets an emphasis tier:

- `keystone` — structurally necessary; forward-link required
- `recurring` — returns 2+ times; forward-link required
- `flavor` — single-scene ambient; no name, no portrait, no spotlight

Rules enforced by the `introduce-element` skill:
1. Pick tier before introducing.
2. Keystone/recurring require a declared forward-link (beat, faction, secret, other element) — else downgrade to flavor.
3. Schedule a payoff hook for keystone/recurring at introduction time.
4. Post-session audit scans for unkept promises and either plants a hook or silently downgrades.

## Skills architecture

DM behaviors live as markdown skill specs in `skills/`. Each skill has: trigger conditions, inputs, a checklist (the contract), outputs, and failure modes it prevents.

Skill categories (not all written yet):
- **Ingestion skills** — `module-*-extract`, `seed-bank-audit` (one-time per campaign, can run inside Claude Code as Anthropic Skills)
- **Session-runtime skills** — `narrate-scene`, `introduce-element`, `voice-npc`, `call-for-roll`, `resolve-roll`, `run-combat-round`, `handle-off-script`, `update-position` (run via Claude API from Next.js server during sessions)
- **Session-boundary skills** — `session-start-load`, `session-end-audit`
- **Operational/safety skills** — `spoiler-safe-report`, `player-action-route`

**Currently written:** `introduce-element`, `narrate-scene`, `voice-npc`, `player-action-route`, `call-for-roll`, `resolve-roll`.

## Known hard problem (scope flag)

v1 should prove the session-loop on a small hand-structured encounter before attempting full-module ingestion. Ingestion is the ambitious part; the runtime loop is the uncertain part. Validate the loop first.
