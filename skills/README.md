# Claude DM-assist skills

These skill specs are reference docs for **Claude's role** in the hybrid workflow (see `../PROJECT_KNOWLEDGE.MD` and `../claude-project-instructions.md`).

Scott is the DM. Claude is an assistant that:
- Generates NPC dialogue in consistent voice (`voice-npc`)
- Generates atmospheric narration on demand (`narrate-scene`)
- Classifies player actions and advises on handling (`player-action-route`)
- Advises on roll requirements when Scott asks (`call-for-roll`)

Each skill is invoked when Scott pastes a tagged block (`[NPC Exchange]`, `[Narration]`, `[Action Routing]`, `[Roll Call]`) into his Claude.ai Project chat. Claude then responds in-format and, where appropriate, executes the Foundry REST API call directly.

## How to use

1. Paste the relevant skill content into your Claude.ai Project's custom instructions, combined with `claude-project-instructions.md`.
2. During play, paste tagged blocks from the DM control page into the Project chat.
3. Claude acts per the skill spec — generating content and POSTing to Foundry where applicable.

## What changed in the 2026-04-21 pivot

The original 12-skill spec assumed Claude-as-DM with autonomous control of combat, rolls, positioning, Chekhov discipline, and session memory. Under Scott-as-DM, most of that is Scott's job or Foundry's job. The skills below are the four that remain — **the places where Claude's language model still adds clear value over what Scott + Foundry can do alone**.

The deleted skills (`introduce-element`, `resolve-roll`, `run-combat-round`, `handle-off-script`, `update-position`, `session-start-load`, `session-end-audit`, `spoiler-safe-report`) are preserved in git history if ever needed.
