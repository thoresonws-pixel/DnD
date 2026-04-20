---
skill: player-action-route
purpose: Classify a player's spoken action (arriving as transcript from their phone via Firebase) into the right response type and dispatch to the appropriate downstream skill.
invoked_by: session orchestrator on every incoming player action event.
---

# Skill: player-action-route

## Purpose

The player's phone is the only input channel (no mic array at the table). Each press of the Action button produces one transcript. That transcript could be anything — an in-character action, an out-of-character question, a rules query, a half-formed thought. This skill is the classifier that keeps the scene state clean: in-character actions advance the scene, OOC noise does not.

## When to invoke

Every time a player hits their Action button and a transcript arrives via Firebase. One invocation per transcript.

## Inputs

- `player_id`
- `transcript` — the player's spoken words, transcribed
- `live_state` — current location, active scene type, present NPCs, pending rolls
- `recent_context` — last ~3 scene events (helps disambiguate)

## Classification (pick exactly one)

| Class | Example transcripts | Dispatch |
|---|---|---|
| `combat_action` | "I swing at the goblin with my axe" | → `run-combat-round` |
| `movement` | "I move around behind the pillar" | update position state, → `narrate-scene` (brief) |
| `social` | "I try to convince the guard to let us pass" | → may call for roll → `narrate-scene` |
| `exploration` | "I search the bookshelf for hidden compartments" | → may call for roll → `narrate-scene` |
| `dialogue` | "I ask the innkeeper if she's seen a hooded stranger" | → `narrate-scene` (scene_type=social, NPC response) |
| `ooc` | "Wait, how many HP does my ranger have?" | → private reply to player's phone; NO scene update |
| `rules_query` | "Can I use my reaction to do that?" | → rules answer to player's phone; NO scene update |
| `ambiguous` | "Umm, maybe I try... something with the thing?" | → clarifying question to player's phone; hold scene |

## Checklist

1. **Classify** using the table above, with `recent_context` to disambiguate.
2. **If `ooc` or `rules_query`:** respond privately to the asking player's phone. Do NOT touch `live/` state. Do NOT narrate on the DM TV.
3. **If `ambiguous`:** send a short clarifying question to that player's phone. Hold the scene until they re-submit.
4. **If in combat and it's not this player's turn:** queue the action or gently redirect ("you'll act on your turn"). Combat turn discipline is enforced in `run-combat-round`.
5. **If `dialogue`:** forward to `narrate-scene` with scene_type=social, including target NPC and the player's question as `player_trigger`. The responding NPC must be vetted through `introduce-element` if new.
6. **If `social` or `exploration`:** decide if a roll is needed.
   - Roll needed → `call-for-roll` → wait → `resolve-roll` → `narrate-scene`
   - No roll → `narrate-scene` directly with the outcome
7. **If `movement`:** consult Foundry state (or Scott's manual helper input) for the target; update `live/` positional state; emit brief narration via `narrate-scene` (scene_type=transition).
8. **If `combat_action`:** dispatch to `run-combat-round`.
9. **Log** the classification + dispatch to `live/session_log/session_<N>.md`.

## Outputs

- Dispatch to exactly one downstream skill (or a private reply for OOC/rules)
- Entry in session log

## Multi-player concurrency

- **Outside combat:** first-come-first-served with natural conversation flow. If two transcripts arrive within a short window, handle the first fully, then the second. Acknowledge the second player on their phone ("one sec — [first player] is acting").
- **In combat:** only the current-turn player's `combat_action` advances the round. Others' actions queue. `run-combat-round` owns the turn order.

## Failure modes this skill prevents

- **OOC pollution.** A player asking "wait, what's my AC?" should not appear in the DM narration or trigger an NPC response.
- **Ambiguity-driven misdirection.** If the transcript is unclear, clarify rather than guess. A wrong guess can introduce elements or commit to narrative beats Claude can't walk back.
- **Accidental un-gated introductions.** Every skill this routes to invokes `introduce-element` for new NPCs/places; this skill never narrates new elements itself.

## Out of scope

- Voice-to-text itself (handled by player phone webapp / Firebase pipeline)
- Actually resolving rolls (that's `call-for-roll` + `resolve-roll`)
- Choosing which NPC responds in a `dialogue` action (that's `narrate-scene` with scene context)
