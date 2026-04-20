---
skill: narrate-scene
purpose: Deliver narration to the players that matches the campaign's tone, respects emphasis tiers, avoids railroading, and routes voiced lines to ElevenLabs.
invoked_by: session orchestrator on every scene transition, player action resolution, or revelation.
---

# Skill: narrate-scene

## Purpose

This is Claude's main runtime voice as DM. It takes scene context and produces the text that appears on the DM TV and (for NPC dialogue) the audio that plays through ElevenLabs. It is the discipline layer between raw Claude output and what players actually experience.

## When to invoke

- Scene transitions (party moves, time passes, perspective shift)
- Response to a player action after it's resolved mechanically
- Revelation of a secret whose reveal condition has just been met
- Opening/closing of a session

## Inputs

- `scene_type`: one of `transition | exploration | social | combat_round | revelation | downtime | session_open | session_close`
- `live_state`: current location, present NPCs, active beats, recent session log (last ~3 beats)
- `tone_profile`: `source/tone.md` — genre, mood, cadence
- `player_trigger`: if scene was caused by a player action, the action text + resolution
- `elements_in_scene`: list of element IDs present; each already has an `emphasis` tier

## Pre-flight checks (run before generating narration)

1. **New-element check.** If narration would introduce any element not already in `live/`, invoke `introduce-element` first and wait for the handoff. Do not narrate around an un-introduced element.
2. **Secret-reveal check.** If narration would commit to any secret or future beat not yet unlocked, invoke `commit-to-beat` (future skill) first. Never foreshadow a beat that hasn't been triggered — we're improvising, and committing accidentally constrains future play.
3. **Railroad check.** Narration must not contain: "you must," "you have no choice," "the only way forward is," or equivalent. Offer options organically or leave the next move to the players.

## Contract

| Dimension | Rule |
|---|---|
| Length | `transition`: 1–2 sentences. `exploration`: 2–4 sentences. `social`: dialogue-led, narration minimal. `combat_round`: crisp, 1–2 sentences per actor. `revelation`: up to 6 sentences; earn it. `downtime`: 2–3 sentences. `session_open`: recap + hook, 4–6 sentences. `session_close`: cliffhanger or breath, 2–3 sentences. |
| Sensory detail | At least one **non-visual** sense per scene (sound, smell, texture, temperature, taste). Default AI slop is all-visual; this is the antidote. |
| Tone fidelity | Match `tone_profile`. If the profile says "gothic horror with dry humor," don't slide into high-fantasy heroic cadence. |
| Name discipline | Use a name only if the element's `emphasis` is `recurring` or `keystone`. Flavor elements get descriptors, not names. See emphasis table in `introduce-element`. |
| Foreshadow discipline | Do not foreshadow beats that have not been triggered. Do not telegraph secrets that have not been committed. Improvising DMs do not write themselves into corners. |
| Railroad language | Banned list above. Present options; the party decides. |
| Second-person POV | Narration to players is "you" / "the party." Never "I" (Claude doesn't exist in the fiction). |

## Outputs

- `narration_text` → streamed to the DM TV app
- For each NPC line within the narration:
  - `{ speaker_id, voice_pool_id, text }` → routed to `voice-npc` skill for ElevenLabs synthesis; audio streams to the DM TV
- `scene_record` appended to `live/session_log/session_<N>.md`:
  - scene_type, elements_in_scene, player_trigger (if any), narration_text excerpt, outcomes

## Delivery timing

The DM TV displays text as it streams. For voiced NPC lines, the text appears on-screen as the audio plays (caption-style), so hard-of-hearing or noisy-room scenarios still work.

## Failure modes this skill prevents

- **Generic slop.** Claude defaults to all-visual, hero-cadence narration. The tone profile + non-visual-sense requirement forces texture.
- **Accidental commitments.** Claude's natural instinct is to foreshadow and set up future payoffs, which constrains future play. The foreshadow-discipline rule keeps improvisation doors open.
- **Railroading.** Claude tends toward helpful directing language ("you should go north"). The railroad ban keeps agency with the players.
- **Un-tracked introductions.** The new-element check forces `introduce-element` to run before any first mention with weight.
