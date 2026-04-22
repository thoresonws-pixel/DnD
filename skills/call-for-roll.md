---
skill: call-for-roll
purpose: Advise Scott on what roll a situation calls for — ability, skill, DC, advantage — when he's uncertain.
invoked_by: Scott pasting a `[Roll Call]` block into the Claude.ai Project chat.
---

# Skill: call-for-roll

# Purpose

Scott calls for rolls at the table verbally. Most of the time he knows what to ask for instantly. Occasionally — novel situation, edge case, spell interaction, creative improvisation — he wants a second opinion on ability/skill and an appropriate DC.

This skill gives a short, opinionated answer. Scott makes the final call.

## When to invoke

When the Project sees input tagged `[Roll Call]`. Rare compared to `voice-npc` / `narrate-scene`.

## Expected input format

```
[Roll Call]
Player (<speaker>) attempts: "<what they want to do>"
Scene context: <terse — location, threat level, relevant conditions>
PC relevant info: <optional — class, level, known feats/abilities relevant to the attempt>
```

## Output format

Keep it short and structured:

```
Ability / Skill: <e.g., Strength (Athletics)>
DC:             <number, 5-25>
Advantage:      <normal | advantage | disadvantage> — with one-line reason
Notes:          <optional — edge case or alternative ability that's also defensible>
```

## DC guidance (5e scale — reference only)

| DC | Label | Use for |
|---|---|---|
| 5 | Very easy | Routine task with slight hindrance |
| 10 | Easy | Ordinary task under pressure |
| 15 | Medium | Standard adventuring difficulty |
| 20 | Hard | Requires skill, concentration, or luck |
| 25 | Very hard | Few mortals can do it |
| 30 | Nearly impossible | Heroic feat, should feel legendary |

Most Delian Tomb-scale rolls fall DC 10-15. Dragons-of-Stormwreck-scale: 10-18. Epic tier: 15-25+.

## Checklist

1. **Pick the ability + skill** that best fits the attempt. If two are defensible, name both in the `Notes` line.
2. **Pick a DC** from the scale above. Lean toward the lower end if the PC has strong relevant proficiency or a narrative setup makes sense; higher if the situation is dramatic or the PC is improvising.
3. **Advantage / disadvantage** — cite the reason in one line. No reason = normal.
4. **Respond.** Do not POST to Foundry. Scott is the one calling at the table.

## Out of scope

- Resolving the roll (Scott does, after the player reports the result; Foundry applies damage/effects)
- Deciding whether a roll is needed at all (Scott's judgment, or `player-action-route`)
- Keeping track of modifiers (player's responsibility; Foundry has them on the sheet)

## Failure modes this prevents

- **DC drift under pressure.** Quick reference scale keeps Scott calibrated.
- **Ability-pick arguments.** Claude gives one recommendation; Scott accepts or overrides without derailing pacing.
- **Claude acting autonomously.** This skill is advisory, never executing.
