---
skill: introduce-element
purpose: Gate every introduction of a new named/emphasized story element so promises are tracked, Chekhov's gun is enforced, and the source seed bank actually gets used.
invoked_by: narrate-scene (before narration), handle-off-script, any runtime moment where Claude is about to give a narrative element a name, face, or spotlight.
---

# Skill: introduce-element

## Purpose

Players will forgive a missed sidebar. They will not forgive **a character introduced as "the prince" who never matters again**. This skill exists to stop Claude from making promises it doesn't keep, and to ensure every campaign draws on the source seed bank (not generic AI improvisation).

## When to invoke

Before Claude introduces into narration any of the following, for the first time:
- An NPC with a name or distinctive role
- A location with a name or distinctive feel
- An object with weight (magic item, keepsake, relic)
- A faction
- A persistent environmental element (cursed river, watching eye in the sky)

Do **not** invoke for anonymous extras ("a tavern patron," "a guard at the gate") — those bypass this skill and stay flavor-tier by default.

## Inputs

- `proposed_type`: one of `npc | location | object | faction | environmental`
- `why_now`: the narrative reason this element is surfacing right now (e.g., "party entered a new city and needs a contact")
- `current_live_state`: snapshot of `live/` — active beats, present NPCs, current location
- `seed_bank`: contents of `source/` relevant to `proposed_type`
- `seed_usage`: `source/seed_usage.json` so we know which seeds are already spent

## Checklist (enforced in order; do not skip)

1. **Decide emphasis tier.** Pick exactly one:
   - `keystone` — structurally necessary; removal would break the emergent story
   - `recurring` — non-structural but will return in 2+ scenes; ties to a beat/faction/secret
   - `flavor` — single-scene ambient color, no future weight
2. **Forward-link (keystone or recurring only).** Declare which existing element this connects to: a beat in `live/beats.md`, a faction in `live/` or `source/factions/`, a secret in `live/secrets.md`, another keystone/recurring NPC, etc. If no real link exists, **downgrade to flavor** and return to step 1.
3. **Seed-bank consultation.** Scan `seed_bank` for unused seeds matching `proposed_type` and compatible with `why_now`. If a fitting seed exists, draw from it. Invent from scratch only if no seed fits — and note why in the element's `notes` field.
4. **Mark seed usage.** If a seed was drawn, update `source/seed_usage.json` to mark it spent.
5. **Write element to live/.** Create the file in the right subdirectory with frontmatter:
   ```yaml
   ---
   id: <type>_<short_slug>
   type: <npc|location|object|faction|environmental>
   emphasis: <keystone|recurring|flavor>
   source_ref: <seed_id | "invented">
   forward_links: [<beat_id>, <faction_id>, ...]   # empty array only if flavor
   introduced_in_session: <N>
   notes: <short free text>
   ---
   ```
   Then a short body: description, voice/mannerism, visual, what they want.
6. **Schedule payoff (keystone or recurring only).** Append a payoff hook to `live/beats.md` — a condition under which this element pays off (e.g., "prince Aldric returns with a warning when party reaches the capital"). Without this, the promise is unkept.
7. **Emit narration-ready handoff.** Return to the caller:
   - `element_id`
   - `narration_tier` (drives delivery discipline in narrate-scene)
   - `voice_pool_id` and `image_pool_id` (if npc and keystone/recurring — looked up from Scott's curated pools)

## Narration discipline (consumed by narrate-scene)

| Tier | Name? | Portrait? | ElevenLabs voice? | Time in spotlight |
|---|---|---|---|---|
| flavor | no | no | no (text narration only) | seconds |
| recurring | yes | yes (small) | yes | a beat or two |
| keystone | yes | yes (featured on DM TV) | yes, distinctive | full scene |

Match delivery to tier. A flavor musician is "a bard plays a sad tune in the corner." A recurring musician is "Eldan, the half-elven bard from the Crossed Keys, catches your eye and nods." A keystone musician is introduced by name with a portrait on the DM TV and a voice.

## Outputs

- New file in `live/<type>s/<id>.md`
- Updated `source/seed_usage.json` (if seed drawn)
- Updated `live/beats.md` (if payoff scheduled)
- Handoff object to caller with `element_id`, `narration_tier`, `voice_pool_id`, `image_pool_id`

## Failure mode this skill prevents

Claude introduces "Prince Aldric" in a tavern scene because naming feels dramatic, does not link him to anything, does not schedule a payoff, and never mentions him again. Players remember. Trust in the DM erodes.

## Post-session auditing

After every session, `session-end-audit` (separate skill) scans all `recurring` and `keystone` elements introduced that session. If any lacks a scheduled payoff OR its payoff hook has been bypassed without new linkage, the audit either:
- plants a new payoff hook into an upcoming beat, OR
- silently downgrades the element to `flavor` and stops emphasizing it in future narration.

Either is acceptable. Unresolved promises are not.
