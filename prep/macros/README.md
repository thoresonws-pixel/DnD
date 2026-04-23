# Scene macros

Foundry macros that wire up Delian Tomb triggers. Copy-paste each into a new Foundry macro (Macro Directory → create new → Script type → paste → save).

## How to paste

1. In Foundry, press **/** or click the macro hotbar icon to open the Macro Directory
2. **Create Macro**
3. Name it (use the filename without `.js`)
4. Type: **Script**
5. Paste the content of the `.js` file
6. Save

Then either:
- Drag to hotbar for one-click use
- Fire via Monk's Active Tile Trigger → Execute Macro

## Required modules (in addition to Foundry core + dnd5e)

- **dnd-table-skin** (custom) — for `!narrate` banner support
- **Monk's Active Tile Triggers** — for proximity-based trigger tiles
- **Sequencer** — for scripted canvas animations
- **JB2A Free** — animation asset library

## Macros

| File | Purpose |
|---|---|
| `narrate.js` | Helper: fires a narration banner via `!narrate`. Call from other macros or via hotbar for ad-hoc narration. |
| `combat-start-banner.js` | Manual macro — fires a dramatic narration when combat starts. Edit the text per-encounter. |
| `arrow-trap.js` | Tile-triggered trap. Plays arrow animation at affected tokens, rolls 1d6 piercing damage per hit, fires narration. |
| `boss-skarvax-phase2.js` | Manual macro — GM fires when Skarvax hits 50% HP. Narration + visual tint on token. |
| `secret-door-reveal.js` | Reveals a hidden wall/door flagged `secret=true`, fires narration. |
| `scene-transition-fade.js` | Template for fading to black and activating a target scene. Edit `TARGET_SCENE_NAME`. |

## Editing

Each macro has a **CONFIG** block at the top where you tweak per-scene text, token names, scene targets, etc. Touch only that block; leave the logic below.

## Future

As the adventure grows, add new macros here, keep one file per behavior. When stable, migrate to the `dnd-table-skin` module as a built-in behavior.
