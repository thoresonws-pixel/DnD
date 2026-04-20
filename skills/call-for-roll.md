---
skill: call-for-roll
purpose: Issue a structured roll request to one or more players' phones when Claude needs mechanical resolution, and pause the scene until the result arrives.
invoked_by: player-action-route, run-combat-round, narrate-scene (revelations that depend on a check).
---

# Skill: call-for-roll

## Purpose

Claude calls for a roll when the outcome of a situation is uncertain and deserves dice. Players physically roll their own dice and type the result into their phone. This skill formats the request, ships it to the right phone(s), and sets up the pending-roll record that `resolve-roll` will consume.

## When to invoke

- `player-action-route` determined a skill check, save, or attack is needed
- `run-combat-round` is issuing initiative, attack, damage, or save prompts
- `narrate-scene` gates a revelation behind a check (perception, insight, investigation)

## Inputs

- `player_ids` — one player, a subset, or "everyone" (for group checks or initiative)
- `roll_type` — `skill_check | saving_throw | attack | damage | initiative | custom`
- `ability_or_skill` — e.g., "Dexterity (Stealth)", "Wisdom saving throw", "Perception", "longsword attack"
- `dc` — difficulty class (if applicable; NOT shown to player)
- `advantage` — `normal | advantage | disadvantage`
- `context` — one-sentence narrative framing of what they're trying and what's at stake ("you try to slip past the guard without being spotted")
- `outcome_tree` — what happens on each outcome bucket (passed through to `resolve-roll`):
  ```yaml
  critical_success: <narrative consequence>
  success:         <narrative consequence>
  failure:         <narrative consequence>
  critical_failure:<narrative consequence>
  ```
- `timeout_seconds` — how long to wait before escalating (default 60; shorter in combat)

## Checklist

1. **Validate inputs.**
   - Players exist in `live/party.md`
   - `roll_type` is a known value
   - `dc` is reasonable for scene stakes (soft warning if DC > 25 or < 5; override allowed)
   - `context` is narrative, not mechanical (see "Context discipline" below)
2. **Format the request.** See "Roll request format" below. Clear, short, mechanically complete.
3. **Generate `roll_id`** — unique per roll for matching on resolve.
4. **Write pending record** to `live/pending_rolls/<roll_id>.json` with: player_ids, roll_type, ability_or_skill, dc, advantage, outcome_tree, issued_at.
5. **Dispatch to phones** via Firebase. Each targeted player's phone shows the request.
6. **Pause the scene.** Do NOT narrate any outcome. Do NOT invoke `narrate-scene` for the result. The scene is frozen until `resolve-roll` fires.
7. **Set timer.** On timeout, escalate: notification nudge on the player's phone; if still no response after a second timeout, prompt Scott via helper channel to nudge the player in-person.
8. **Log.** Session log gets an "awaiting roll" entry with `roll_id` and who's rolling.

## Roll request format (on player's phone)

```
ROLL REQUESTED

Roll:      Dexterity (Stealth)
Advantage: Normal
Context:   You try to slip past the guard without being spotted.

[ input: total result ____ ]   [ input: raw d20 ____ (optional) ]

[ Submit ]
```

Mechanical notes on the phone UI:
- If character sheet is available, show the player's modifier as a hint (e.g., "modifier: +5") but do not auto-fill — players are responsible for their own math.
- Raw d20 field is optional but encouraged; lets `resolve-roll` detect natural 20s / natural 1s for crits.

## Context discipline

The `context` field is shown to the player verbatim. It must be **narrative**, not mechanical:

| ✅ Good | ❌ Bad |
|---|---|
| "You try to slip past the guard without being spotted." | "If you beat DC 15 you're hidden." |
| "You reach for the door — it may or may not be trapped." | "Make a Perception check to detect the pressure plate." |
| "The dragon's breath washes over you." | "On a failed save, take 42 fire damage." |

Leak the DC or the consequence and you've broken the tension.

## Outputs

- Pending roll record in `live/pending_rolls/`
- Roll request dispatched to target player phone(s)
- Scene paused
- Session log entry

## Concurrency and group rolls

- **Single-player roll:** standard flow.
- **Group check** (e.g., everyone makes a perception): one `roll_id`, multiple player targets, `resolve-roll` aggregates results before advancing.
- **Initiative** (combat start): all players + DM roll; `run-combat-round` consumes the aggregated results to build the turn order.

## Failure modes this skill prevents

- **DC leakage.** DC never appears in the request; only narrative stakes.
- **Outcome leakage in framing.** Rules above force narrative-only context.
- **Silent scene advancement without mechanical resolution.** Scene pause is mandatory; the next `narrate-scene` can't fire until the pending record is cleared by `resolve-roll`.
- **Forgotten rolls.** Timer + escalation catches this.

## Out of scope

- Interpreting the result (`resolve-roll`)
- Telling the player their modifier or making the math for them (player responsibility; sheets are reference only)
