---
skill: player-action-route
purpose: Classify an incoming player action and advise Scott on how to handle it — NPC response, skill check, narration, rules question, or no response.
invoked_by: Scott pasting an `[Action Routing]` block into the Claude.ai Project chat when he's unsure how to handle a player's input.
---

# Skill: player-action-route

## Purpose

Not every player utterance needs the same response. A rules question gets a short answer privately. An in-character line to an NPC needs `voice-npc`. A creative attempt ("I try to balance on the chandelier") needs a skill-check adjudication. Scott can usually tell these apart instantly, but some inputs are ambiguous or multi-modal and a quick classifier helps.

This skill is advisory. Scott makes the call; Claude suggests the path.

## When to invoke

When the Project sees input tagged `[Action Routing]`. Typically Scott invokes this sparingly — for genuinely ambiguous inputs, or when he wants a second opinion on how to handle something.

## Expected input format

```
[Action Routing]
Player (<speaker>): "<what the player said>"
Context: <optional — current scene, active NPC if any, combat state>
```

## Classification buckets

| Bucket | Example | Recommended handling |
|---|---|---|
| `dialogue_to_npc` | "I ask the barkeep about the missing caravan." | → `voice-npc` with the active NPC |
| `combat_declaration` | "I swing my warhammer at the goblin." | → Foundry's combat tracker / attack roll. Claude not needed. |
| `skill_check_needed` | "I try to balance on the chandelier to get the drop on them." | → `call-for-roll` — suggest ability + DC |
| `movement` | "I move around behind the pillar." | → Scott moves the token in Foundry. Claude not needed. |
| `exploration_action` | "I search the bookshelf for hidden compartments." | → `call-for-roll` (Perception/Investigation), then narrate outcome |
| `rules_query` | "Can I use my reaction to counter that?" | → Short rules answer to Scott. Do not POST to Foundry. |
| `ooc` | "Wait, how many HP do I have left?" | → No action. Scott can tell the player directly. Do not POST. |
| `creative_improvisation` | "I try to knock over the chandelier onto the goblins." | → Suggest a skill check + narrative ruling; Scott adjudicates |
| `ambiguous` | "Umm, I do... something with the thing." | → Ask Scott to clarify / ask the player for specifics |

## Output format

Short. Don't over-think.

```
Bucket: <bucket name>
Suggested: <1-2 sentences on how to handle>
Details (if relevant): <roll ability + DC, NPC to use, rules note>
```

## Checklist

1. **Classify** using the buckets above. Pick the single best match.
2. **Suggest action.** Keep it terse. If the action is "Scott handles in Foundry," say that plainly — don't elaborate.
3. **Do not POST to Foundry.** This skill is advisory. If Scott agrees with the suggestion, he (or a follow-up `voice-npc` / `narrate-scene` call) handles the actual POST.

## Out of scope

- Actually generating the NPC response (use `voice-npc`)
- Actually generating narration (use `narrate-scene`)
- Making the mechanical ruling (that's Scott's call; Claude only suggests)
- Adjudicating success / failure (that's Scott after the roll)

## Failure modes this prevents

- **Scott over-thinking ambiguous inputs.** Fast classification unblocks pacing.
- **Claude acting autonomously on inputs Scott didn't intend to route.** This skill is advisory only — Claude doesn't POST or act, just classifies.
