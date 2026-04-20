---
skill: run-combat-round
purpose: Run D&D combat with structured turn order, per-turn action resolution, reactions, conditions, and damage tracking. Own the combat state machine so narration stays crisp and the table never argues about whose turn it is.
invoked_by: player-action-route (when combat starts or a combat_action arrives), resolve-roll (when initiative results aggregate), narrate-scene (when a scene transitions into combat).
---

# Skill: run-combat-round

## Purpose

Combat is the most structured scene type in D&D and the most prone to confusion, rule disputes, and pacing drags. This skill is the combat state machine: initiative order, per-turn action/bonus/reaction/movement budgets, condition tracking, HP/damage, death saves, and round-boundary bookkeeping. Narration stays crisp because the mechanical state is already resolved by the time `narrate-scene` is called.

## When to invoke

- Combat is about to start (encounter triggered) → build initiative
- A `combat_action` transcript arrives from the current-turn player
- An NPC/monster turn fires (driven by this skill itself)
- A `reaction` trigger condition is met mid-turn
- Round ends (after last combatant acts)
- Combat ends (one side defeated, surrender, flee)

## Inputs

- `combat_state` — persisted in `live/combat/<encounter_id>.json`:
  ```yaml
  encounter_id: <slug>
  round: <int>
  initiative: [ { id, kind: pc|npc, init_total, init_d20, is_current, has_acted } ]
  combatants: { <id>: { hp, max_hp, ac, conditions: [], resources: {}, position: {x,y} } }
  delayed: []   # combatants who delayed their turn
  concentrations: { <id>: <spell_or_ability> }
  ```
- `live_state` — location, present elements, tone
- `source` seed bank — for flavor on monster descriptions
- `active_trigger` — what fired this invocation (initiative done, player action, NPC turn, reaction, round end)

## State machine

```
COMBAT_START → ROLL_INITIATIVE → BUILD_ORDER → TURN_LOOP → COMBAT_END

TURN_LOOP (repeats until COMBAT_END):
  NEXT_TURN → TURN_START_TRIGGERS → AWAIT_ACTION → RESOLVE_ACTION → CHECK_REACTIONS → TURN_END_TRIGGERS
```

## Checklist by trigger

### On combat start
1. Build `live/combat/<encounter_id>.json` with combatants (PCs from `live/party.md`, NPCs/monsters from the scene).
2. Invoke `call-for-roll` with `roll_type: initiative`, player_ids = all PCs. DM/NPC initiative is rolled internally.
3. Wait for `resolve-roll` aggregation. On return, sort combatants desc by `init_total` (ties broken by Dex mod; further ties broken by PCs-first).
4. Narrate combat opening via `narrate-scene` (scene_type=combat_round, round 1 opening).
5. Set `is_current` on the top combatant and trigger their turn.

### On PC turn start (it's their turn)
1. Notify the player via their phone: "Your turn. You have: action, bonus action, movement (30 ft), reaction."
2. Show any active conditions affecting them on the phone.
3. Await their `combat_action` transcript.

### On combat_action arrival (current-turn PC)
1. Parse the transcript into an action bundle: primary action (attack / spell / dash / help / etc.), bonus action if any, movement, reaction-bait if any.
2. For each sub-action that needs a roll, invoke `call-for-roll` with the appropriate outcome tree.
3. On roll resolution: apply effects (damage, conditions, movement, resource spend).
4. Update combatant HP / conditions / resources in `combat_state`.
5. Check if the action triggers opportunity attacks or other reactions from adjacent enemies — if yes, issue those via `run-combat-round` recursion with `active_trigger: reaction`.
6. Narrate the resolved action via `narrate-scene` (scene_type=combat_round, short and crisp, 1–2 sentences).
7. Mark `has_acted: true`, advance to next combatant.

### On NPC/monster turn
1. Decide the monster's action based on its tactics (written in `live/combat/<encounter_id>.json` tactics field, or drawn from the monster's seed entry). Tactics should be simple: targeting priority, preferred action, break condition (flee at <N HP, etc.).
2. If the action requires a roll (attack, save against PC ability), invoke `call-for-roll` for the relevant PC(s) to roll saves, OR roll the attack internally and call `resolve-roll` with the result for damage-on-hit resolution.
3. Apply effects, narrate via `narrate-scene`, advance.

### On reaction trigger
1. Identify the reacting combatant (adjacent enemy, spell reaction, etc.).
2. If PC: prompt them on their phone with the reaction opportunity and a quick yes/no.
3. If NPC: decide per tactics (e.g., Sentinel opportunity attack if within reach).
4. Resolve inline; return to the originating turn.

### On turn end triggers
1. Tick down any time-bound conditions (spells with "until end of your next turn" tracked by owner-turn).
2. Check concentration: if the concentrating combatant took damage this round, invoke `call-for-roll` for a Con save at DC = max(10, damage/2).

### On round end
1. Increment `round`.
2. Tick round-duration effects (spells lasting "1 minute" = 10 rounds).
3. Return to top of initiative.

### On combat end
1. Detect end condition: all enemies defeated / surrendered / fled, OR all PCs defeated / fled / agree to stop.
2. Clear `live/combat/<encounter_id>.json` (archive to session log).
3. Award XP / milestone if using tracked progression.
4. Return control to `narrate-scene` (scene_type=transition) for post-combat narration.

## Concurrency and turn discipline

- Only the current-turn PC's `combat_action` advances the round. Other PCs' actions are queued or reflected back with "it's [current_player]'s turn."
- Reactions are the exception: reactions from non-current PCs can interrupt and resolve inline.
- Scott's helper input can override turn order if a mini gets knocked over or a rule clarification is needed — this bypasses the queue but logs an override.

## Failure modes this skill prevents

- **Combat drag.** By having mechanical state pre-resolved before narration, narration stays 1–2 sentences per action instead of becoming a rules explanation.
- **Initiative disputes.** Sorted `initiative` array is the single source of truth; phone shows next turn.
- **Forgotten conditions.** Start-of-turn and end-of-turn triggers tick conditions automatically.
- **Forgotten concentration saves.** Damage to a concentrating combatant auto-triggers a save.
- **Out-of-turn action bleeding into the round.** `player-action-route` enforces turn gating; this skill holds the authoritative state.

## Out of scope

- Building the encounter itself (that's part of ingestion / scene composition; encounters live in `live/encounters/` or are improvised via seed bank)
- Voicing NPCs during combat (`voice-npc` is invoked by `narrate-scene` as usual)
- Long-term campaign XP tracking (that's a separate state file)
