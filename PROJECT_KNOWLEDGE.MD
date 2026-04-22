# D&D Digital Table System - Project Knowledge

Last Updated: 2026-04-21 (v2)

## Product goal

A fully immersive, in-person D&D experience where **Claude is the DM** and Scott plays as a player (must not know the story, by default). The system runs pre-existing published adventures loaded on demand. Scott's group is new to D&D — the AI DM is also a teacher.

## Physical setup

- **Game board** = flat-screen TV laid horizontally, running Foundry VTT as the map. 3D-printed minis placed physically on top of the screen.
- **DM screen** = separate TV acting as Claude's "face" — shows NPC portraits, character cards, scene art, plays DM/NPC voices.
- **Player devices** = each family member's own phone, loaded directly with Foundry in **Chrome** (no Next.js wrapper — players open Foundry's web URL). A custom Foundry module called **`dnd-table-skin`** strips the UI: no scene toolbar, no navigation, no compendium, no players list, no DM chrome. Character sheet auto-opens full-screen via **Tidy 5e Sheets** on login. The phone is a **pure cheat sheet**; the game is played with physical dice, the shared TV, and **Nintendo Switch Joy-Cons as the primary input**.
  - **Controller-first input (Joy-Con per player):** every family member already has a Switch with plenty of Joy-Cons. Each player holds one Joy-Con sideways. Input via browser Gamepad API; voice via Web Speech API.
    - `D-pad` — grid movement (only when this player is the marching-order leader + tactical scene + their turn in combat; otherwise scrolls lists)
    - `X` — Spells panel (`←` `→` navigate known spells)
    - `Y` — Inventory panel
    - `A` — Features panel (Second Wind, Action Surge, racial traits)
    - `B` — Back / close current panel → return to character-sheet home view
    - `ZL` / `ZR` — Page up/down within the current panel
    - `+` (Start) — toggle voice-to-DM: first press activates the microphone (Web Speech API), phone shows live transcription with a pulsing-mic overlay, second press posts the transcription to Foundry chat as the player's action
    - `−` (Select) — toggle minimal mode (hide phone UI entirely, "I'm looking at the table")
    - HD Rumble on ACTION press, combat hit landed, level-up
  - **Fallback UI when no controller is paired:** an on-screen ACTION button pins to the bottom 15% of the phone. Tap → slide-up dialog with textarea + Cancel/Send (the OS keyboard's mic icon is available for dictation). Detection via `gamepadconnected` / `gamepaddisconnected` — if a Joy-Con dies mid-session, the ACTION button reappears automatically.
  - **Phone UI in combat:** when Foundry's Combat Tracker is active, a top banner reads **"YOUR TURN"** (pulsing gold) or *"Waiting for [current combatant]"*; character sheet auto-switches to the **Actions** tab so attacks + combat spells are front-and-center. Driven by `combatStart`, `updateCombat`, `deleteCombat`, `combatTurnChange` hooks in the skin module.
  - **Browser mandate: Chrome.** Web Speech API is reliable on Chrome/Edge across iOS/Android/desktop. Safari over LAN HTTP has blocked microphone access historically. iOS users install Chrome from the App Store.
  - **No phone mini-map** — the table TV is the shared map.
- **Dice input:** physical dice at the table. Player reads the die face, announces the result out loud. The DM types the number into a roll-entry field on the DM control page, which posts a formatted roll to Foundry chat attributed to the player. No dice-roller UI on phone; no post-roll UI. Mid-roll effects (Guidance, Lucky, Bardic Inspiration) are resolved verbally — player presses `B` to cancel any pending dialog and `+` to ask the DM; DM may issue a new roll with the modifier baked in.
- **Scott's laptop** = Foundry GM view for updating PC positions; also the future site of the curator pane if/when that role lands.

## Stack

- **Next.js** (modified; see `AGENTS.md` — always read `node_modules/next/dist/docs/` before writing Next code)
- **Firebase Realtime DB** as sync substrate between player phones and the DM brain
- **Claude API** is the DM brain
- **ElevenLabs** for NPC/DM voice synthesis
- **Foundry VTT** as the tabletop map; Claude writes to Foundry directly (enemy spawns, token moves, conditions) via a module or websocket API

## Campaign scale and structure

- Total sessions over ~2 years: **10–15** (realistic group cadence)
- Shape: 1–2 short intro campaigns (~3 sessions total, level 1–4) → 1 medium campaign (~4 sessions, level 4–15) → 1 final epic campaign (6–8 sessions, level 15–20).
- **Final epic module picked UPFRONT** — locks the end-boss framework so early campaigns can opportunistically foreshadow.
- Other modules picked just-in-time, by description not title, to preserve Scott's player-blind experience.
- Same world across all campaigns. Characters and items persist. Loose continuity; episodes don't need to interlock.

## Architectural principles

### Claude proposes, the app disposes

Claude is the narrative intelligence on top of a state machine with strict invariants. Claude never writes directly to mechanical state. The app owns all character/combat data behind typed accessors; Claude reads via query tools and proposes changes via mutation tools; the app validates and applies.

**App-owned:** class, level, ability scores, HP current/max, XP (level-up triggered by threshold crossing only), spell slots, hit dice, inventory, equipment, conditions, death saves, combat HP tracking, and a derived **combat power** metric (offensive/defensive/control/healing ratings, current resource state, composition type, composite score) used for encounter calibration.

**Claude-owned:** plot, beats, secrets, NPC personalities, locations, factions, session logs, rolling summaries, character narrative arc (relationships/goals, NOT sheet data).

**Tools (not setters):** `getCharacter`, `getParty`, `getInventory`, `getCombatPower`, `getPartyCombatPower`, `applyDamage`, `applyHealing`, `awardXP` (only path to level-ups), `useSpellSlot`, `addCondition`, `equipItem`, etc. No `setLevel`, `setHP`, `setXP`.

### Build-time vs. runtime separation

At the table, latency breaks immersion. Expensive work (web search, multi-pass reasoning, image generation, PDF ingestion) runs offline into local files. Runtime reads files and does selection + fill-in within ~1–3 seconds per turn.

**Build-time artifacts (two tiers):**

- **Shared library** (once, carries across campaigns):
  - `library/puzzles/` — ~10 curated puzzles with rich tags (math: 10–15 sessions × 1 non-combat per 2 hrs × ~40% puzzles ≈ 6–10 used; a library of 10 is right-sized with reskinning)
  - `library/scene_templates/` — tavern arrival, camp, dungeon entrance skeletons
  - `library/prop_templates/` — reusable frames (letter textures, map frames, seal designs)
  - `library/voices/` — ~10 ElevenLabs voice samples with metadata
  - `library/images/` — reusable art frames
  - `library/monsters/`, `library/spells/`, `library/items/` — SRD data
- **Per-campaign bank** (fresh per campaign):
  - `campaigns/<slug>/source/villains/`, `places/`, `factions/`, `hooks/`, `setpieces/`

**Runtime:** local file reads + Claude API only. No web-fetch, no multi-pass self-critique, no new image generation.

**Prep workflow:** incremental preferred over front-load. Minimum-viable library to start campaign 1, expand as we learn what's missing.

### Memory schema — source (immutable) + live (emergent)

The downloaded module is **creative fuel**, not a script. Claude extracts seeds at ingestion; runtime runs from `live/` and draws unused seeds from `source/` when improvising.

**`source/` — extracted once per campaign:**
`tone.md`, `villains/`, `places/`, `factions/`, `setpieces/`, `hooks/`, `seed_usage.json`

**`live/` — emergent, mutable:**
`plot.md`, `beats.md`, `npcs/`, `locations/`, `secrets.md`, `session_log/`, `party_state.json` (marching order, sub-groups), `pending_rolls/`, `combat/`, `props/`, `revealed_knowledge/`

**Runtime rule:** when improvising new named content (villain, place, NPC), Claude MUST consult `source/` first and draw unused seeds before inventing. Invention is the rare case, not the default.

### Promise-keeping rule (Chekhov discipline)

Players won't notice missing content; they will notice "Prince Aldric" being introduced and never mattering again. Every introduced element has an `emphasis` tier:

- `keystone` — structurally necessary; forward-link required; named, portraited, voiced
- `recurring` — returns 2+ times; forward-link required; named, small portrait
- `flavor` — single-scene ambient; no name, no portrait, no spotlight

Enforced by `introduce-element`: pick tier → declare forward-link (else downgrade to flavor) → consult seed bank → schedule payoff hook for keystone/recurring. Post-session audit scans for unkept promises and plants hooks or silently downgrades.

### Skills architecture

DM behaviors live as markdown skill specs in `skills/`. Each has: trigger, inputs, checklist (the contract), outputs, failure modes. Two tiers (to be reflected in frontmatter):
- `tier: runtime` — runs during play via Claude API
- `tier: build_time` — runs during prep (Claude Code / batch jobs)

**Written (all runtime tier):** `introduce-element`, `narrate-scene`, `voice-npc`, `player-action-route`, `call-for-roll`, `resolve-roll`, `run-combat-round`, `handle-off-script`, `update-position`, `session-start-load`, `session-end-audit`, `spoiler-safe-report`.

**Planned runtime skills:** `compose-encounter`, `run-puzzle`, `run-skill-challenge`, `run-social-encounter`, `generate-prop`, `resolve-movement`, `handle-split`, `handle-merge`.

**Planned build-time skills:** ingestion pipeline (`module-*-extract` by lens: tone, villains, places, factions, setpieces, hooks), `seed-bank-audit`, `puzzle-library-ingest`, `voice-pool-prebuild`.

**Known TODO:** clarifying pass on `resolve-roll` and `run-combat-round` — current specs mention "apply damage / update HP" as if Claude writes directly. Must be refactored to route all mechanical mutations through app tools per Claude-proposes-app-disposes.

## Teaching ramp

Scott's group is new to D&D. Per-campaign flag `teaching_mode: heavy | moderate | light | off` controls difficulty calibration (target encounter-power ratio), narration mechanical hints, rules-query tone, level-up guidance, NPC tactics aggression. Default schedule: intros `heavy`, medium `moderate`, final epic `off`.

## Encounter variety

D&D is most fun when non-combat encounters are first-class: puzzles, skill challenges, social/negotiation, stealth/infiltration, investigation. Target ~1 combat + ~1 non-combat per 2 hours of play. Future `compose-encounter` skill picks type and calibration.

### Puzzle sourcing (hard rule)

Never generate puzzles from scratch. Always pull from pre-existing sources: current module's puzzle library, curated corpora (published puzzle packs, community lists), project's `source/puzzles/` library. Claude's job is selection + calibration + reskinning surface details — **never changing logic**. Required sanity check: Claude must self-solve from the presentation it plans to give players (failure or instant-solve = broken presentation).

## Props (hybrid physical/digital)

Scott pre-builds a library of GENERIC physical props (tied scrolls, sealed envelopes, 3D keys, tokens) with opaque IDs. Catalog in `props/physical_catalog.json` lists physical attributes only (no plot content). At session time Claude binds narrative content to a physical_id in `live/props/`; helper channel tells Scott "hand them CLUE 14D"; physical prop crosses the table; on "prop opened," DM TV renders the real content.

**Hard guardrail:** physical props must be genuinely generic. Any plot-specific visual (royal sigil, cult symbol) renders on the DM TV, not on the object. Physical is tactile carrier only. Same philosophy applies to enemy minis — generic humanoid / beast / large-beast / dragon-sized minis represent any creature in that size category.

## NPC schema with knowledge tiers

To prevent LLM drift (premature reveals, under-reveals, voice drift), NPC files include structured knowledge tiers: `open` (freely shared), `guarded` (shared under pressure/rapport with a `reveal_trigger`), `secret` (hidden with strict `reveal_trigger`). A pre-speak QC gate in `voice-npc` / `narrate-scene` checks planned lines against these tiers and rewrites to open-knowledge if a trigger isn't met. This is Layer 1 structural QC — catches the murder-mystery-reveal problem without human judgment.

Full schema in `memory/project_npc_schema_knowledge_tiers.md`.

## Foundry bridge (asymmetric)

- **Foundry → Claude:** Claude reads all state (token positions, visibility, fog reveals, conditions).
- **Claude → Foundry:** Claude writes directly — enemy spawns, token moves, status overlays. Tokens appear instantly on the table TV, no latency through Scott.
- **Scott → Foundry:** clicks grid cells to update PC positions when minis physically move.
- **Spoiler-surface risk:** Scott running Foundry GM view exposes monster stats, hidden notes, fog reveals. Fix options (undecided): lock down Foundry permissions ("Trusted Player" with PC-drag-only) OR build a custom helper UI on top of Foundry. Default: permissions first.

### Position tracking via local JSON (Wizard-of-Oz compatible)

A Foundry module writes a live snapshot of positional state — token positions, patrol paths, fog-of-war reveals — to a local JSON file in real time. Consumers read the file directly; nothing goes through an API.

- **During Wizard-of-Oz testing** (human-Claude simulating the DM via Claude Code), the human reads the JSON file on Scott's laptop to know who is where without any API roundtrip. Pairs naturally with the Wizard-of-Oz approach: zero Anthropic spend during testing, same data shape as production.
- **Once the real Claude API is wired,** the same JSON file becomes one of the `update-position` skill's query-tool input sources. No architectural change at that boundary — the file is the interface; only the reader changes.
- **Foundry module** that performs the write is TODO. Options: write from scratch, fork an existing position-broadcaster module, or script via Foundry's macro + hook system.

## Movement

### Modes (per scene)
- **Abstracted** — overland travel; no grid; Claude narrates. Marching order still matters for ambush surprise checks.
- **Tactical** — grid-based interiors; fog of war enabled; arrow movement enabled.

### Arrow-key exploration (primary for tactical spaces)
Leader phone shows ↑ ↓ ← →. One tap = one grid square (5 ft) in absolute direction. Whole sub-group follows in marching order — each token shifts one cell maintaining relative formation. Dungeon-crawler feel. Zero cognitive load.

### Marching order
Party state is a list of **sub-groups**, each with ordered marching order and a leader (front = arrow controller). Declared via drag-sort UI on phones. Front character is first to trigger surprise checks on hostile fog reveals — the "bard leading" party learns fast.

### Split-party (first-class)
Player voices "I'm heading X with [PC]" via Action button → `handle-split` creates a new sub-group with declared members, new leader gets arrows. Merge via spatial overlap or "we regroup" voice action. Narration cuts between groups like a DM film-editing. Foundry's per-player vision handles fog independently per sub-group.

### Social dynamic preserved
Only the Action button sends voice to Claude. Party discussion ("let's head north") is table chatter, off-mic to the DM. The leader presses the arrow when consensus is reached. No move timer; real D&D pacing.

## Spoiler-avoidance (default)

Scott plays as a player and must not see story content. Claude never pushes spoilers through Scott-facing channels; progress and status messages use aggregates and coded IDs. Scott curates a pool of ~10 NPC voices + portraits upfront and Claude matches at introduction time.

**Open question (deferred 2026-04-19):** whether Scott's role should shift from player-blind to co-DM curator (reviewing Claude's drafts before they hit the table) for QC reasons. Motivated by real concern: LLM drift on NPC consistency, generic creative output, first-session risk. Three paths on the table:
- Pure self-QC + player-blind (structural QC catches ~70–80% of issues; creative-taste layer is the risk)
- Self-QC + post-session player feedback (trains Claude over time; first sessions still a gamble)
- Scott curates drafts (trades player-blind experience for creative safety net)

To be resolved next session.

## Known hard problems / scope flags

- **Creative-taste QC ceiling.** AI can't reliably self-check "is this NPC interesting / scene fun / villain memorable" — only structural rules. Real risk for first sessions.
- **Claude-proposes-app-disposes skill spec alignment.** Existing skill specs (`resolve-roll`, `run-combat-round`) mention direct mutations; need clarifying pass.
- **v1 scope flag:** prove the session-loop on a small hand-structured encounter before attempting full-module ingestion. Ingestion is the ambitious part; the runtime loop is the uncertain part. Validate the loop first.
