---
skill: resolve-roll
purpose: When a player submits a dice result from their phone, match it to the pending roll, pick the outcome bucket, walk the outcome tree, and hand off to narrate-scene.
invoked_by: session orchestrator on incoming roll-result events from Firebase.
---

# Skill: resolve-roll

## Purpose

`call-for-roll` paused the scene and is waiting for this player's number. When the number arrives, this skill does the comparison, picks the consequence, logs it, and un-pauses the scene by handing off to `narrate-scene`.

## When to invoke

A player submits their roll result via the phone webapp. The session orchestrator gets a Firebase event with the roll_id and the numbers. Fires once per submitted result.

For group/initiative rolls, this skill runs once per submission, but only dispatches downstream when the full group has submitted (or timeout forces an early resolution).

## Inputs

- `roll_id` — must match a pending record
- `player_id` — the submitting player
- `result_total` — the final number the player typed
- `result_d20` — optional raw d20 value (if provided, used for crit detection)
- `pending_record` — loaded from `live/pending_rolls/<roll_id>.json`

## Checklist

1. **Match.** Load pending record by `roll_id`. Confirm `player_id` is in the record's targets. If mismatch, log and drop (stray submission).
2. **Crit detection** (for attacks and anywhere campaign house-rules enable skill-check crits):
   - If `result_d20 == 20` → `critical_success`
   - If `result_d20 == 1` → `critical_failure`
   - Crits bypass DC comparison for attacks; for skill checks they modify narration tone but still compare to DC for the pass/fail bucket.
3. **Pick outcome bucket** from `result_total` vs. `dc`:
   - `result_total >= dc` → `success`
   - `result_total < dc` → `failure`
   - `critical_success` / `critical_failure` from step 2 take precedence when present
4. **Walk the outcome tree.** Look up the consequence for the chosen bucket from the pending record's `outcome_tree`. This is the narrative consequence that will be narrated.
5. **For group rolls / initiative:**
   - Store this player's result; do NOT advance yet
   - If all targets have submitted (or timeout fired), aggregate:
     - Group check: count successes, compare to required threshold (in pending record)
     - Initiative: sort by result_total desc → hand off to `run-combat-round` to build turn order
   - Only after aggregation is complete, proceed to step 6
6. **Clear pending record.** Delete or archive `live/pending_rolls/<roll_id>.json`.
7. **Log resolution.** Session log entry: `roll_id`, `player_id`, `result_total`, `result_d20`, outcome bucket, consequence summary.
8. **Hand off to `narrate-scene`** with:
   - `scene_type` matching the follow-up (combat_round → run-combat-round takes over instead; exploration → narrate outcome; social → narrate outcome; revelation → narrate the unlocked content)
   - `player_trigger` = the original player action + the roll outcome
   - The consequence from the outcome tree as the core of what should be narrated

## Outputs

- Outcome bucket determined and logged
- Pending record cleared
- Hand off to `narrate-scene` (non-combat) or `run-combat-round` (combat, initiative)

## Natural-1 / natural-20 policy (default; overridable per campaign)

- **Attacks:** nat 20 = auto-hit + crit damage; nat 1 = auto-miss
- **Saving throws:** no automatic crit/fail on the d20 alone; compare to DC as normal (this matches standard 5e)
- **Skill checks:** by default, nat 20 / nat 1 are flavor only — still compare to DC. Per-campaign house-rules file can enable "auto-success/fail on nat 20/1" for skill checks.

Per-campaign house rules live in `live/house_rules.md` and are consulted here.

## Failure modes this skill prevents

- **Untracked consequences.** Outcome tree is the single source of truth for what happens on each bucket; narration can't improvise an outcome that wasn't planned at `call-for-roll` time.
- **Crit confusion.** Crit detection is explicit and house-rules-aware.
- **Group rolls half-resolving.** Aggregation gate prevents narrating "two of you succeed" while two players still haven't submitted.
- **Stray submissions.** Pending-record match check drops stale / mismatched events.

## Trust boundary

Players self-report their dice results. This skill does not verify honesty. That's a social contract at the table, same as any tabletop game. If Scott notices a mis-entry as a helper, he can issue an override via the helper channel.

## Out of scope

- Running combat turn order (that's `run-combat-round`, which resolve-roll hands off to for combat)
- Narrating the outcome (that's `narrate-scene`)
- Modifier math (player's responsibility)
