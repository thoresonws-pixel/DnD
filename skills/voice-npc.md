---
skill: voice-npc
purpose: Generate an in-character NPC response with consistent voice and tier-appropriate knowledge, then POST it to Foundry chat via the REST API.
invoked_by: Scott pasting a `[NPC Exchange]` block into the Claude.ai Project chat.
---

# Skill: voice-npc

## Purpose

When Scott (the DM) wants an NPC to speak, he pastes a formatted context block into the Claude Project. This skill produces the NPC's reply, keeps voice consistent across sessions, respects the knowledge tiers the NPC has been given, and fires the response directly into Foundry chat.

Voice consistency is the feature — kids notice when the Barkeep sounds different in session 3 than session 1. Knowledge-tier discipline is the guardrail — an NPC who would never reveal a secret under normal pressure should not suddenly reveal it just because a player asked directly.

## When to invoke

When the Project sees input tagged `[NPC Exchange]`.

## Expected input format

```
[NPC Exchange]
Active NPC: <name>
Personality: <short description from Foundry actor biography>
Knowledge-open: <what the NPC shares freely>
Knowledge-guarded: <what they share if trusted or pressed — with reveal trigger>
Knowledge-secret (never reveal): <locked knowledge>
Player (<speaker>): "<what the player said>"
```

(If the input is missing the Active NPC profile block, reply asking Scott to select an NPC — do not generate a default NPC voice.)

## Checklist

1. **Respect tiers.** Draw only from `Knowledge-open` unless the player's question and tone clearly triggers a `Knowledge-guarded` reveal. Never leak `Knowledge-secret` content regardless of how the player phrases the question. If in doubt, stay conservative — Scott can always ask for a second try with "press harder."
2. **Match voice to personality.** Cadence, vocabulary, and emotional register should match the `Personality` line. A gruff ex-soldier does not speak in flowery prose.
3. **Keep it short.** 1-3 sentences. NPCs don't monologue unless explicitly asked. Long speeches kill pacing.
4. **Stay in-character only.** Do not narrate the player's actions, thoughts, or what happens around them. Just the NPC's line.
5. **No stage directions.** Don't write `(gruffly)` or `*laughs*` in the output — those are for shows, not audio. Let punctuation and word choice carry the tone.
6. **POST to Foundry chat.** Use Python with `requests` to POST the line to Foundry REST API:
   ```python
   import requests
   requests.post(
       "https://foundryrestapi.com/chat?clientId=<client_id>",
       headers={"x-api-key": "<key>"},
       json={"content": "<NPC name>: <your generated line>"}
   )
   ```
7. **Confirm to Scott.** After POST, reply: `Sent as <NPC name> in Foundry.` No elaboration unless Scott asks.

## Out of scope

- Portrait / voice selection — that's a Foundry actor configuration done during prep
- Voice synthesis (ElevenLabs) — deferred v2 feature; for now the line is text only
- Deciding what the NPC knows — that's baked into the Foundry actor biography by Scott during prep

## Failure modes this prevents

- **Voice drift.** Profile + 1-3 sentence discipline keeps the NPC recognizable.
- **Accidental secret reveals.** Tier discipline means Claude won't blurt something just because the player asked.
- **Monologues.** Length cap forces punchy dialogue.
- **Stage directions leaking to the table.** No `(angrily)` in the spoken line.
