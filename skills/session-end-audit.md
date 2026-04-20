---
skill: session-end-audit
purpose: Wrap a session — enforce the Chekhov rule on everything introduced today, update rolling summaries, persist seed usage, archive completed beats, and compose the session recap that next session's session-start-load will read.
invoked_by: session orchestrator when the DM or helper channel signals "wrap up," or when a natural stopping point is detected and confirmed.
---

# Skill: session-end-audit

## Purpose

Between sessions is where campaigns fail quietly. Promises made this session get forgotten; the rolling summary drifts out of sync; seed usage doesn't get logged and reused seeds stale the world. This skill is the mandatory close-out — it runs before Claude is allowed to declare the session over, and it is the *only* place where `live/beats.md`, `live/plot.md`, and `source/seed_usage.json` should be updated in bulk.

## When to invoke

- DM/helper says "end session"
- Natural stopping point confirmed (long rest, cliffhanger, scene end where no one has more to do)
- Hard timebox reached (optional: if session has a pre-set duration)

## Inputs

- `session_number`
- `session_delta` — everything that happened this session (derived from `live/session_log/session_<N>.md`)
- `live_state` — current post-session state (location, HP, inventory, flags)
- `source` — seed bank

## Checklist (run all in order; none are optional)

### 1. Chekhov audit
For every element with `emphasis: keystone` or `emphasis: recurring` introduced this session:
- Does it have a scheduled payoff hook in `live/beats.md`?
- Has any prior scheduled payoff for it been bypassed?
- If no scheduled payoff → pick one: (a) plant a new payoff hook into an upcoming beat; (b) silently downgrade the element's `emphasis` to `flavor` in `live/<type>s/<id>.md` and add a note so future narration stops emphasizing it.
- Log each decision.

### 2. Beat status updates
- Beats the party completed this session → mark `status: completed`, archive summary into `live/plot.md` history section.
- Beats the party bypassed but still relevant → `status: pending_reconnection` with a one-line "what the party did instead."
- Beats the party invalidated (killed the villain early, etc.) → `status: invalidated` with reason; a new responsive beat must already exist (created by `handle-off-script` during play).

### 3. Seed usage log
- For every seed drawn from `source/` during this session (by `introduce-element` or `handle-off-script`), confirm `source/seed_usage.json` records it.
- Reconcile any missed logging.
- Report remaining unused seed counts by category in the recap (aggregates, no names).

### 4. Rolling summary update
- Update `live/plot.md` top section ("current state of the story") so it reflects the world as of end-of-session. Keep to ~1 page; history beyond that goes into a history section or is elided.
- Update current location, party relationships with named NPCs, current threats, current goals.
- This is what next session's `session-start-load` reads — write for that reader.

### 5. Session recap
- Write end-of-session block in `live/session_log/session_<N>.md`:
  - **What happened** (4–8 bullet points, narrative not mechanical)
  - **Unresolved threads** (explicit list of open payoff hooks, pending_reconnection beats, undelivered secrets)
  - **Suggested opening hook for session N+1** (one sentence — optional, but helps next boot)
  - **Party state** (levels, significant inventory changes, conditions persisting across rest)
  - **Deviations and decisions** (off-script moments, improvised elements, stored for continuity)

### 6. Closing narration
- Invoke `narrate-scene` with `scene_type: session_close`. Delivery matches the energy of where the session landed (cliffhanger = sharp and short; long rest = calm breath).

### 7. Ephemeral cleanup
- Drop any timed-out `live/pending_rolls/` entries.
- Archive or clear any combat state from aborted encounters.
- Disconnect player phones from the session namespace.

### 8. Mark session ended
- Update session log header: `status: ended`, `ended_at: <timestamp>`.

## Outputs

- Updated `live/plot.md` (rolling summary)
- Updated `live/beats.md` (statuses, new hooks, invalidations)
- Updated `source/seed_usage.json`
- Updated `live/<type>s/*.md` (any emphasis downgrades from Chekhov audit)
- Complete `live/session_log/session_<N>.md` with recap
- Closing narration on DM TV
- Clean pending state

## Spoiler-safe reporting to Scott

If Scott is in helper mode during wrap-up, the audit can report *what happened mechanically* (session length, scenes, rolls) but not story content. Use `spoiler-safe-report` to format any helper-channel output. Example: "Session 4 wrapped. 12 scenes, 1 combat (3 rounds). 4 new elements (2 keystone, 2 flavor). 3 seeds drawn. 1 beat pending reconnection." — never names.

## Failure modes this skill prevents

- **Chekhov violations across sessions.** A character introduced last session as keystone, ignored this session, never flagged — now silent rot in the campaign. The audit catches this.
- **Rolling summary drift.** Without a mandatory update step, `live/plot.md` goes stale and `session-start-load` begins loading an out-of-date world.
- **Lost deviations.** Off-script moments that didn't get captured during play get reconstructed from session log and persisted.
- **Seed exhaustion blindness.** If 80% of villain seeds are used, the next campaign arc will feel repetitive; the aggregate report gives Scott visibility without spoiling.
- **Dirty state into next session.** Ephemeral cleanup prevents stale combat or pending rolls from polluting next boot.

## Out of scope

- Running the session (every runtime skill)
- The full campaign-level summary (that's a separate `campaign-end` skill if/when a campaign wraps)
- Re-ingesting source material (that's the one-time ingestion pipeline)
