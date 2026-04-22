---
skill: narrate-scene
purpose: Generate atmospheric scene narration on Scott's request and POST it to Foundry chat with the `!narrate` prefix so the theatrical TV banner fires.
invoked_by: Scott pasting a `[Narration]` block into the Claude.ai Project chat.
---

# Skill: narrate-scene

## Purpose

Scott asks for narration when he wants prose on the theatrical TV — scene descriptions, transitions, revelations, atmospheric beats. This skill produces text that matches the scene type and tone, avoids slop, and fires the `!narrate` chat message that triggers the TV banner (handled by `dnd-table-skin` Foundry module).

## When to invoke

When the Project sees input tagged `[Narration]`.

## Expected input format

```
[Narration]
Scene type: <transition | exploration | social | combat_beat | revelation | opening | closing>
Location: <where the scene is set, terse>
Context: <1-2 lines of what's just happened or what Scott wants described>
Tone hint: <optional — e.g., "gothic, cold, dread" or "warm, hopeful, small">
```

## Contract

| Dimension | Rule |
|---|---|
| Length | `transition`: 1-2 sentences. `exploration`: 2-4 sentences. `revelation`: up to 6 sentences. `opening`/`closing`: 2-4 sentences. `combat_beat`: 1-2 sentences per beat. |
| Sensory detail | At least one **non-visual** sense (sound, smell, texture, temperature). Default LLM output is all-visual; this is the antidote. |
| Second-person POV | "You" or "the party." Never "I." Claude is not a character in the fiction. |
| No railroading | Avoid "you must," "you have no choice," "the only way forward is." Offer options implicitly; the party decides. |
| No un-triggered foreshadow | Do not foreshadow beats that haven't been set up. Do not telegraph secrets that haven't been triggered. Improvising DMs who accidentally commit lose future options. |
| Tone fidelity | If Scott gave a `Tone hint`, match it. If not, lean toward the scene's implicit mood rather than high-fantasy heroic cadence. |

## Checklist

1. **Generate narration** per the contract above.
2. **POST to Foundry chat** with the `!narrate` prefix (the module's hook strips the prefix and tags as Narrator):
   ```python
   import requests
   requests.post(
       "https://foundryrestapi.com/chat?clientId=<client_id>",
       headers={"x-api-key": "<key>"},
       json={"content": f"!narrate {narration_text}"}
   )
   ```
3. **Confirm to Scott.** Reply: `Narration fired to TV banner.` No elaboration unless Scott asks.

## Out of scope

- Deciding _when_ to narrate — that's Scott's pacing judgment
- Voice synthesis for narration (deferred v2)
- Player dialogue / NPC lines — use `voice-npc` for those
- Committing to future plot beats — never foreshadow beats Scott hasn't set up

## Failure modes this prevents

- **All-visual slop.** Non-visual-sense requirement forces texture.
- **Railroad language.** Banned phrases keep agency with players.
- **Future-beat commitments.** Rule against un-triggered foreshadow keeps improvisation doors open.
- **Wall-of-text on transitions.** Length rules by scene type keep pacing crisp.
