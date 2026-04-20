---
skill: spoiler-safe-report
purpose: Format any Scott-facing status, progress, or error message that touches story content so names, plot beats, and causal hints are replaced with aggregates and coded IDs. Scott self-polices file browsing; this skill enforces the one-way contract that Claude never pushes story content at him.
invoked_by: any skill that needs to report to Scott's helper channel or console — session-end-audit, ingestion pipeline, error handlers, status displays.
---

# Skill: spoiler-safe-report

## Purpose

The entire point of this project is that Scott plays without knowing the story. Every message Claude generates toward Scott is a potential leak — a raw error trace that mentions "Prince Aldric not found in factions/" tells Scott Prince Aldric exists and is faction-relevant. That's a spoiler even if Scott never opens a file.

This skill is a sanitizer. Inputs: any raw content destined for Scott. Outputs: a version with story content redacted into coded IDs and aggregates, safe to send.

## When to invoke

Every message bound for Scott that could touch:
- Campaign content (`live/` or `source/` data)
- Ingestion progress (module contents)
- Session audits (what happened narratively)
- Errors or logs mentioning story elements

Do NOT invoke for messages that are purely technical and pre-loaded-content (version numbers, file paths that don't include IDs, API status, Claude system state, etc.).

## Inputs

- `raw_content` — the message as Claude would naturally emit it
- `content_type` — `progress | status | error | question | recap | log`
- `redaction_scope` — optional: `full` (everything story-adjacent) | `aggregate_ok` (counts and categories allowed) | `technical_only` (strip all narrative completely, leave only mechanical/technical facts)
- `loaded_indexes` — snapshot of known-unsafe tokens from `live/` and `source/` (all names, IDs, and identifiers)

## Checklist

1. **Tokenize.** Parse `raw_content` into spans.
2. **Unsafe-token scan.** For each span, check against `loaded_indexes`. If a span matches any of:
   - NPC names from `source/villains/`, `source/` or `live/npcs/`
   - Location names from `source/places/` or `live/locations/`
   - Faction names from `source/factions/` or `live/`
   - Item names from any content file
   - Secret descriptors from `live/secrets.md`
   - Beat summaries or titles from `live/beats.md`
   → flag for redaction.
3. **Replace with coded ID.** Redacted spans become:
   - NPCs → `npc_<N>` (stable ID per element)
   - Locations → `loc_<N>`
   - Factions → `faction_<N>`
   - Items → `item_<N>`
   - Beats → `beat_<N>`
   - Secrets → `secret_<N>`
   Aggregates preferred over IDs where meaning is preserved: "3 NPCs" > "npc_12, npc_47, npc_83."
4. **Causal/predictive scrub.** Remove phrases that imply future events or consequences, even without names. Patterns to strip:
   - "the party will likely..."
   - "eventually they'll have to..."
   - "this sets up the reveal that..."
   - "once they meet..."
   - "when they discover..."
5. **Preserve mechanics.** Pass through unchanged:
   - File paths that don't contain story names (`live/beats.md` is fine; `live/npcs/aldric.md` is NOT — redact to `live/npcs/npc_12.md`)
   - Timings, counts, token counts, round counts
   - Error codes, HTTP statuses, Claude API model names
   - Session numbers, timestamps
   - Mechanical game terms (Dex save, initiative, DC 15) — these are rules-language, not story
6. **Aggregate if possible.** Prefer "7 elements flagged for re-pass" over "npc_12, npc_47, loc_03, faction_02... flagged."
7. **Final sweep.** After redaction, re-scan for partial-match leaks (e.g., an NPC named "Shadowsong" — "the Shadowsong letter" still reveals). Redact partials.
8. **Return** sanitized message.

## Tone of sanitized output

Terse and operational — this is a status line, not narrative. The cost of being boring is low; the cost of a leak is permanent.

✅ "Ingestion pass 4/7 complete. 23 locations, 47 NPCs, 3 flagged for re-pass. ETA 12 min."

❌ "Ingestion pass 4/7 complete. Extracted Castle Ravenloft, 22 other locations, 47 NPCs including Strahd and Ireena, 3 flagged for re-pass."

## Exceptions (must be explicit)

If Scott is setting up and specifically asks a non-spoilery question ("how many locations total?"), aggregate answers are fine. If he asks something that can't be answered without leaking ("who's the villain?"), refuse politely and ask for a coded-ID question instead ("I can tell you there are N villains categorized as X, Y, Z archetypes — want that?").

## Audit log (optional)

Original + sanitized can be written to `logs/spoiler_audit.log` for debugging (visible to neither Scott nor any spoiler-risk path). Useful if sanitization bugs slip through — post-mortem can check if content was leaked in a known-safe channel.

## Failure modes this skill prevents

- **Name leaks in errors.** Stack traces and error messages naturally include IDs and names; without this skill they go straight to Scott.
- **Causal leaks in progress reports.** "The ingestion found the main villain's weakness" tells Scott a weakness exists; aggregates strip this.
- **Partial-match leaks.** A campaign with "Shadowsong" as an NPC would leak through any mention of the word; final sweep catches it.
- **Scope creep.** Without a rule, Claude will default to friendly, informative messages that naturally include names for clarity. This skill forces the opposite default.

## Out of scope

- Preventing Scott from reading files directly (that's a social contract, not a technical control)
- Redacting player-facing content (players are supposed to know the story)
- Rewriting narrative content for players (that's `narrate-scene`)
