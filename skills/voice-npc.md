---
skill: voice-npc
purpose: Turn an NPC's text line into audio on the DM TV using the NPC's locked voice pool entry via ElevenLabs, with on-screen captions as the mandatory fallback.
invoked_by: narrate-scene (whenever a scene contains an NPC line).
---

# Skill: voice-npc

## Purpose

The DM TV is Claude's "face." NPCs don't feel real unless their voices are consistent across sessions. This skill enforces that consistency: an NPC's voice is locked at introduction time (by `introduce-element`) and never re-picked. It also guarantees the scene never stalls on a TTS failure — if audio fails, text still reaches the table.

## When to invoke

Every NPC line emitted by `narrate-scene`. Not invoked for DM narration itself (that's either on-screen text or a separate DM-voice skill later).

## Inputs

- `speaker_id` — NPC element ID (e.g., `npc_aldric`)
- `voice_pool_id` — voice assignment locked at introduction time
- `text` — the line as it should be spoken
- `emotion_hint` — optional: `whispering | angry | heartbroken | smug | urgent | neutral`

## Checklist

1. **Lookup voice pool entry.** Resolve `voice_pool_id` → ElevenLabs voice ID + per-voice parameters (stability, similarity, style). Voice pool config lives in `config/voice_pool.json` (Scott-curated ~10 voices).
2. **Sanitize text.** Strip stage directions in parens (`(trembling)`) — those are display hints, not spoken. Keep punctuation that affects delivery (ellipses, em-dashes, question marks).
3. **Apply emotion hint.** If ElevenLabs supports the hint for this voice, pass as style param. Otherwise, shape via punctuation/caps in the text layer — do not modify meaning.
4. **Call ElevenLabs streaming TTS.** Use streaming endpoint so audio starts playing before generation finishes.
5. **Route audio to DM TV.** Stream plays through the DM TV speakers.
6. **Emit captions.** Simultaneously post caption text (with speaker name) to DM TV display — covers hard-of-hearing players and noisy-table moments.
7. **Log.** Append to `live/session_log/session_<N>.md`: `speaker_id`, `voice_pool_id`, `text` (first 80 chars), `duration_ms`, `success`.

## Outputs

- Audio stream → DM TV speakers
- Caption text → DM TV display
- Log entry

## Fallback behavior (mandatory)

If ElevenLabs fails (API error, rate limit, voice not found, network):
- Display the line on DM TV with `[voice unavailable]` marker
- Do NOT halt the scene
- Log the failure with reason; session-end-audit can surface if failures are chronic

## Failure modes this skill prevents

- **Voice inconsistency.** An NPC who sounded like a gruff old warrior last session must sound the same this session. Voice pool ID is locked at introduction time in the NPC's `live/npcs/` file — this skill never re-picks it.
- **Stage direction leaks.** Actors don't say "(angrily)" out loud; neither should the TTS.
- **Silent scene stall.** TTS will fail sometimes. The scene must keep moving via captions.

## Out of scope (handle elsewhere)

- Choosing the voice (that's `introduce-element` matching to the pool at first introduction)
- Pre-generating voice samples (that's `config/voice_pool.json` setup, done once by Scott)
- DM narration voice (separate skill if/when we decide DM narration is voiced too — currently assumed to be text-only on DM TV)
