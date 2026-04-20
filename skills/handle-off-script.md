---
skill: handle-off-script
purpose: When players do something the current beat didn't anticipate, decide whether to improvise into the world, redirect toward intended beats, or let the party go fully off-rails — and capture the decision so future play stays consistent.
invoked_by: narrate-scene (when about to resolve an action with no matching beat branch), player-action-route (when a transcript doesn't fit current scene context).
---

# Skill: handle-off-script

## Purpose

Real D&D sessions go off-script constantly. Players ignore the plot hook, befriend the villain, burn down the quest-giver's tavern, or wander into the wrong dungeon. A good DM rolls with it; a bad DM railroads. This skill is the decision framework for what Claude-as-DM does in those moments — and it writes the outcome back to `live/` so the next session doesn't re-litigate.

## When to invoke

- `player-action-route` gets a transcript that doesn't fit any active beat or expected scene branch
- `narrate-scene` is about to resolve an outcome and the current beat has no matching path
- A PC's declared intent contradicts an assumption made by a loaded beat (e.g., beat assumes "party follows the trail north"; party heads south)

## Inputs

- `deviation` — description of what players are doing that's off-script
- `active_beats` — which beats are currently in play, from `live/beats.md`
- `seed_bank` — `source/` for improvisation material
- `live_state` — location, present elements
- `narrative_weight` — rough estimate: is this a minor detour or a major story deviation?

## Decision framework

Three paths, picked in order:

### Path 1: Let it be (default for minor deviations)
If the deviation doesn't threaten any active beat's payoff AND doesn't introduce major new obligations:
- Just improvise the next scene using the seed bank.
- Don't force the party back toward the original hook.
- Log the deviation in `live/session_log/` as an "off-script branch" with its resolution.

**Example:** Party skips the merchant quest-giver and goes fishing. There's no beat that depends on the merchant interaction right now. Narrate a fishing scene; move on.

### Path 2: Improvise a bridge (default for moderate deviations)
If the deviation bypasses a beat but can be reconnected via a new, organic hook:
- Draw from the seed bank to create a new bridging element (NPC, location, event) that would plausibly route the party toward an active beat — without railroading.
- Invoke `introduce-element` for the bridge element.
- The bridge must be *findable*, not forced. Leave the party free to ignore it too.
- Mark the bypassed beat as "pending reconnection" in `live/beats.md`.

**Example:** Party refuses to enter the cursed forest where beat_03 takes place. An NPC traveler arrives at the tavern with a rumor that partly overlaps beat_03's content, giving the party a reason to return later — but they can still refuse.

### Path 3: Rewrite the beat (major deviations)
If the deviation fundamentally obsoletes an active beat (party killed the villain early, allied with the antagonist, destroyed the MacGuffin):
- Don't try to rescue the original beat.
- Mark the beat `invalidated: true` in `live/beats.md` with the reason.
- Draw on `source/` for unused villain archetypes, factions, or set-pieces to compose a new direction.
- Compose a new beat in `live/beats.md` that responds to what just happened — the consequence of the party's choice becomes the new engine of the story.
- Commit any required introductions via `introduce-element`.

**Example:** Party turns the BBEG's lieutenant into an ally via a brilliant social scene. The "lieutenant betrays the party" beat is dead. Pull the "shadow faction" seed from `source/factions/` and have that emerge as the new primary threat, possibly with the ally providing inside information.

## Checklist

1. **Assess `narrative_weight`.** Minor / moderate / major? Use the examples above as calibration.
2. **Pick path** per framework.
3. **If Path 2 or 3:** consult `source/` seed bank before inventing. Invoke `introduce-element` for any named additions.
4. **Update `live/beats.md`:**
   - Path 1: note the branch; beats unchanged.
   - Path 2: mark bypassed beat `pending_reconnection: true`, add bridge.
   - Path 3: mark bypassed beat `invalidated: true`, append new beat(s).
5. **Update `live/plot.md`** with a one-line summary of the story's new direction (used by next session's `session-start-load` for context).
6. **Log** the deviation, decision, and new state to `live/session_log/session_<N>.md`.
7. **Hand off** to `narrate-scene` to deliver the scene that results.

## Narration discipline when off-script

- Never punish creativity by making improvised scenes feel "less real" than scripted ones — same sensory detail, same tone fidelity, same promise-keeping discipline.
- Never retcon (silently change prior established facts to make a new beat work). If the party contradicts a fact, the fact stands; the world adapts around it.
- Do not telegraph "this is an improvised scene" — the seam should be invisible.

## Failure modes this skill prevents

- **Railroading.** Without a framework, Claude will default to nudging players back toward scripted beats. Path 1 and Path 2 keep player agency intact.
- **Story collapse.** Without Path 3, a major deviation leaves Claude running a campaign whose beats no longer match the state of the world. Explicitly rewriting is better than silently running dead beats.
- **Inconsistency across sessions.** Without writing deviations to `live/beats.md` and `live/plot.md`, next session will re-enter as if the deviation didn't happen. Persisting the decision is mandatory.
- **Wasted seed bank.** Forcing Claude to check `source/` before inventing keeps the campaign feeling like *this* campaign even when improvising.

## Out of scope

- Deciding whether a specific action succeeds mechanically (that's `call-for-roll` / `resolve-roll`)
- Narrating the resulting scene (that's `narrate-scene`)
- Running combat that results from the deviation (that's `run-combat-round`)
