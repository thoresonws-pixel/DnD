---
skill: session-start-load
purpose: Boot a play session — load the right slice of live/ and source/ into Claude's working context, reconnect player phones, surface unresolved threads from last session, and narrate the opening.
invoked_by: session orchestrator when Scott (or the helper channel) signals "start session."
---

# Skill: session-start-load

## Purpose

A campaign's total memory vastly exceeds any single Claude context window. This skill is the discipline that loads *only what's needed* for today's session — current location, active beats, referenced NPCs, a rolling summary of recent history — and leaves the rest unloaded. It also reconnects the real-world pieces (player phones, voice pool, DM TV) so by the end of this skill, the table is ready to play.

## When to invoke

Exactly once per session, before any player action is accepted.

## Inputs

- `campaign_id` — which campaign (for multi-campaign setups)
- `session_number` — incrementing per-campaign (new session = last + 1)
- `party_present` — list of player IDs actually at the table today (may be fewer than full party)
- `helper_context` — any Scott-side notes about today's session (optional)

## Checklist

1. **Load rolling summary.** Read `live/plot.md` top summary (the current-state-of-the-story, updated by `session-end-audit`). One page max.
2. **Load active beats only.** Read `live/beats.md`, filter to beats with status in `{active, pending_reconnection}`. Skip `invalidated` and `completed`.
3. **Load current location.** Read `live/locations/<current_location_id>.md` plus its referenced NPCs from `live/npcs/`.
4. **Load last N session recaps.** Read last 3 session summaries from `live/session_log/` for context. Full transcripts are NOT loaded — just the end-of-session summary sections.
5. **Load tone profile.** Read `source/tone.md` — always loaded, drives every narration.
6. **Load pools.** Load `config/voice_pool.json` and `config/image_pool.json`. Validate both are populated; warn via helper channel if any pool entries are missing assets.
7. **Check party completeness.** If `party_present` != full party, flag: who's absent, and how to handle their characters (run as NPCs, sidelined narratively, etc.). Default: sideline narratively ("Bob's ranger is scouting ahead this session").
8. **Reconnect player phones.** Open Firebase session namespace `sessions/<campaign_id>/<session_number>`. Each present player's phone joins and shows their character sheet summary + the Action button.
9. **Initialize session log file.** Create `live/session_log/session_<session_number>.md` with session start header (date, party_present, current_location, active_beats summary).
10. **Surface pending-reconnection beats.** If any active beats are flagged `pending_reconnection` from last session (party bypassed them), note them for the opening narration — they should feel like natural re-emergence, not a railroad pull.
11. **Compose opening.** Invoke `narrate-scene` with `scene_type: session_open`, passing: rolling summary, last session's end, pending threads, current location, party_present.
12. **Mark session started.** Update session log with `status: in_session`.

## What NOT to load

- Full `live/beats.md` archive (only active)
- Full session log transcripts (only recent summaries)
- `source/` seed banks not needed for current location (they load on-demand when `introduce-element` runs)
- Completed / invalidated beats
- NPCs not present or not referenced by active beats

Discipline matters: loading everything defeats the whole chunked-memory design and eats context we need for play.

## Outputs

- Claude's working context populated with today's session slice
- Player phones connected and ready
- Session log started
- Opening narration delivered via `narrate-scene`

## Failure modes this skill prevents

- **Context overflow.** Loading the entire campaign would exceed Claude's window within minutes. Strict filter rules stop this.
- **Missing threads.** `pending_reconnection` beats would vanish without this skill surfacing them.
- **Cold start confusion.** Without the rolling summary + recent recaps, Claude would start each session as if it were the first.
- **Pool misconfiguration.** Voice/image pool validation catches broken setups before a scene exposes them.

## Out of scope

- Running the session itself (every other runtime skill)
- Writing the end-of-session summary (`session-end-audit`)
- Campaign ingestion (runs once, way before any session; not session-boot)
