# Delian Tomb — NPC profile prep

Profiles for the first adventure. Tags formatted for pasting into each actor's **Biography** field in Foundry (Tidy 5e Sheets parses them when the DM control page reads the actor).

Designed for 2 players (Scott + wife). Tone: classic introductory dungeon crawl with light stakes. Villain clearly telegraphed but not cartoonish.

---

## Village NPCs

### Elder Marta (quest-giver)

**Role:** The town's unofficial mayor. Her nephew was taken by goblins a week ago. Hiring adventurers as last resort — the militia went and didn't return.

```
[personality]
Stern, grief-edged, practical. Speaks in short sentences. Accustomed to being heard.
Doesn't waste words on pleasantries. Under the stoicism is a woman terrified for her nephew.

[knowledge-open]
Her nephew Elric (a baker's apprentice, age 16) was taken by goblins a week ago.
The goblins nest in an old barrow — the Delian Tomb — north of the village along the forest road.
Offers 50 gold + provisions for Elric's safe return.
The tomb is said to be ancient; the goblins moved in only recently.

[knowledge-guarded]
Reveal trigger: genuine sympathy or direct question about the nephew.
She raised Elric after his parents died of fever three winters ago. He is all she has.
Two militia went in and did not return; she thinks they are dead but hopes otherwise.

[knowledge-secret]
Never reveal unprompted.
She suspects the elf ranger she hired (who then vanished) may have been scouting
for the goblins, not against them. No proof. Tell the party ONLY if they bring it up
and she trusts them — otherwise fear of accusing innocents keeps her silent.

[voice-id]
(placeholder — assign ElevenLabs voice in v2)
```

---

### Barkeep Dain (rumormonger)

**Role:** Runs the local tavern ("The Creaking Oak"). Former soldier. Knows everyone and their business. Not a quest-giver — an information source if players think to ask around.

```
[personality]
Gruff, suspicious of strangers for the first ten minutes then warms up.
Wipes mugs while talking. Short laugh, long memory. Ex-soldier, favors his left leg.

[knowledge-open]
The tomb is old — predates the village. Local kids dare each other to go near but never inside.
Strange lights were seen on the tomb hill two weeks before the goblins arrived. Some said cult.
He served in the northern wars. Knows a thing or two about goblin tactics — they fight dirty,
ambush in packs, break and run when outmatched.

[knowledge-guarded]
Reveal trigger: shared drink or direct question about the elf.
A hooded elf came through a month back — asked about the tomb, paid for a room, left at dawn.
Dain didn't see her again. Thought nothing of it until the goblins showed up.

[knowledge-secret]
Never reveal.
He keeps a locked box under the bar with his old war medals. One of them is for
a battle he was not technically at — a secret shame. Nothing relevant to the quest.

[voice-id]
(placeholder)
```

---

### Brena the Blacksmith

**Role:** Repairs weapons / armor for a fee. Gruff, competent, reasonably well-informed about the militia. Optional stop for party.

```
[personality]
Focused, economical with words, forge-tempered patience. Mid-50s, broad-shouldered,
soot-streaked. Speaks in short deliberate sentences. Faint warm humor when earned.
Doesn't look up from the anvil unless the conversation warrants it.

[knowledge-open]
Repairs weapons/armor (standard PHB rates). Forged sword + axe for the local militia.
Knows Garrin and Hollis well; knew the two militiamen who went to the tomb by name.
Believes goblin groups usually move on; these have been here suspiciously long.

[knowledge-guarded]
Reveal trigger: party asks about unusual commissions recently.
A month ago, the hooded elf commissioned a plain iron bracelet — no decoration,
specific weight. Would not say what it was for. Paid in gold coins Brena hadn't seen before
(slightly heavier than standard mint — she noted it but didn't ask).

[knowledge-secret]
Never reveal unprompted.
Her late husband was in the same northern regiment as Dain. Dain knows her
grief; they do not speak of it publicly. Not plot-relevant.

[voice-id]
(placeholder — middle-aged, terse, warm when unguarded)
```

---

### Old Pell, the Hermit

**Role:** Lives on the forest edge in a leaning cottage. Half-drunk, half-prophetic. Seen things in the forest. Optional encounter on the way to the tomb.

```
[personality]
Rambling, cryptic, flickers of lucidity. Speaks in fragments.
Smells of pipe smoke and wet wool. Interrupts himself mid-sentence.
Rural accent, thick. Warm with kids, wary of armed strangers until they share drink.

[knowledge-open]
Lives alone. Sees "things in the trees" at dusk. Claims the forest "breathes different" this month.
Has a pet crow called Wick who acts as his eyes. Will trade gossip for strong drink.

[knowledge-guarded]
Reveal trigger: share a drink or offer food.
Saw the hooded elf walk into the forest three weeks ago. She did not come out the way she went in.
Also heard a new sound in the woods — "big. wet. clicking." — fears it may be an owlbear that
wandered down from the northern ridges. Warns the party to stay on the path.

[knowledge-secret]
Never reveal.
In his youth Pell was a druid who lost his circle. The forest does speak to him,
a little. He tells himself it's the drink. Not plot-relevant for Delian Tomb;
reserved as a hook for later woodland adventures.

[voice-id]
(placeholder — older, slurred, alternates between mumbling and sudden clarity)
```

---

### Merchant Hollis (supplies)

**Role:** Runs the village's general store. Will sell basic adventuring gear at standard PHB prices. Not a plot NPC — a mechanical convenience.

```
[personality]
Chatty, transactional, nervously optimistic. Talks himself into sales.
Uses filler phrases ("you'll want one of these, I'd wager") while rummaging.
Ends every exchange with "anything else I can help you find?"

[knowledge-open]
Stocks: rope (50 ft, 2gp), torches (1cp each), rations (5sp/day), healing potion (50gp).
Also: basic adventuring gear per PHB; one minor magic item if party seems desperate
(Scott decides — e.g., Potion of Climbing or a single Bead of Force).

[knowledge-guarded]
Reveal trigger: direct question, or if party spends over 30gp.
The two militia who went to the tomb bought rope and torches from him — he saw
one of them (Garrin) was trembling when he paid. Not brave enough to follow up.

[knowledge-secret]
None. Hollis is a simple merchant; no hidden agenda.

[voice-id]
(placeholder)
```

---

## Tomb NPCs and monsters

### Garrin, the Surviving Militiaman (found in tomb, Room C or D)

**Role:** One of the two militia who went into the tomb. Alive but wounded and tied up in a side room or alcove. Party finds him mid-dungeon. Gives intel on boss room layout if rescued.

```
[personality]
Shaken but composed, mid-30s, guard-trained. Tries to joke through the fear.
Rough voice from dehydration. Does not resist rescue but also doesn't fawn.
Asks about his friend (the other militiaman) — that friend is dead; be careful how
the party breaks it.

[knowledge-open]
Name is Garrin. Village militia. Came with his friend Tomas a week ago — they were
ambushed at the antechamber and he was captured; Tomas fell in the fight.
Has been fed moldy bread, kept tied up, overheard patrols.

[knowledge-guarded]
Reveal trigger: once safe, any follow-up question about the layout.
Knows: the boss's chamber is at the end; the boss has at least two lieutenants;
there is a hidden passage behind the altar in the treasure room (he heard goblins
complain about "cleaning out the narrow way"). Volunteers this info to help the party.

[knowledge-secret]
Never reveal.
Tomas died because Garrin froze; he has been replaying it for a week. Do not surface
unless the party probes emotionally — and only then as a heavy beat, not a twist.

[voice-id]
(placeholder — 30s, hoarse, dry humor masking trauma)
```

---

### Goblin Boss "Skarvax" (final encounter)

**Role:** Leader of the goblin band. Holds Elric captive. Larger and meaner than a regular goblin, wears a scavenged chainmail coat and carries a scimitar.

```
[personality]
Brash, cruel, showboating. Speaks in broken Common with a sing-song cadence.
Loves his own voice. Monologues when winning, hisses when losing.
Cowardly when cornered — will offer trades or try to flee rather than die.

[knowledge-open]
Claims the tomb as "Skarvax's place." Calls the party "soft meat" and "tomb-crashers."
Threatens Elric's life if pressed; does not actually want to kill the hostage
(Elric is leverage, not food).

[knowledge-guarded]
Reveal trigger: intimidated, charmed, or losing badly.
The elf ranger (hooded woman from Dain's story) hired the goblins to take Elric.
She paid in gold and promised more. Skarvax does not know why she wants the boy.
He is happy to sell her out to save his skin.

[knowledge-secret]
Never reveal.
The gold was marked with a cult symbol Skarvax doesn't recognize. The cult is a
hook for future sessions — do not surface this in the Delian Tomb adventure itself.

[voice-id]
(placeholder — low gravelly voice, slightly theatrical)
```

---

### Elric (hostage)

**Role:** The kidnap victim. 16, pale, terrified. Does not fight. Rescued → follow the party out of the tomb.

```
[personality]
Shaky, grateful, adolescent. Talks too much when nervous. Asks obvious questions.
Once safe, relaxes quickly into a relieved chatter — wants to tell the story of
his ordeal in self-aggrandizing terms.

[knowledge-open]
Was grabbed in the forest while gathering firewood for Aunt Marta.
The goblins kept him tied up in the back room. He ate moldy bread and cried.
Overheard "the pale woman" mentioned once — in the elf ranger's voice — but thought
he imagined it from hunger.

[knowledge-guarded]
Reveal trigger: gentle questioning back in the village.
He recognizes the elf ranger's voice — he saw her once at the market before his capture.
She bought a carved charm from Hollis. This ties the elf to the village, possibly
useful for future follow-up plots.

[knowledge-secret]
None. Elric is an honest kid.

[voice-id]
(placeholder — young, nervous)
```

---

### Owlbear (forest encounter)

**Role:** Optional forest encounter en route to the tomb. Not a pre-planned combat; triggered on failed Survival check (players miss the tracks + wandered too close). Either one tense combat round + retreat, or skill-check avoidance. Not in the tomb at all.

```
[personality]
Not an NPC — a dangerous wild animal. No dialogue. Territorial screeches, heavy breathing,
snuffling roars. Smashes first and thinks second. Will break off pursuit if wounded
below half HP — it's protecting territory, not hunting specifically.

[knowledge-open]
Not applicable (monster, not NPC).

[knowledge-guarded]
Not applicable.

[knowledge-secret]
Not applicable.

[encounter-design]
Trigger: failed Survival DC 13 during forest travel. Success → party spots tracks,
circles wide, avoids encounter (narrate tension without combat).
Failure → owlbear bursts through undergrowth; roll initiative.

Stats: standard 5e Owlbear (CR 3, HP 59, AC 13, Multiattack: beak + claws).
Scaled for 2 PCs (level 1-3): consider starting at half HP OR fleeing at 1/2 HP
(which the RAW owlbear does not do — override as "wounded territorial animal").

Outcome: survive a round or two → owlbear retreats wounded. XP awarded.
Corpse scenario: if killed, owlbear has nothing useful; flavor narration of grief
for the beast (no one cheers a dead owlbear — sets tone for serious fantasy, not pulp).

[voice-id]
(placeholder — use SFX not voice; deep territorial roar + hissing screech)
```

---

### Giant Spider (tomb side room)

**Role:** Ambush predator in an unused burial alcove that goblins avoid. Rewards players who poke into a side door they didn't need to. Exercises the Restrained condition + movement-on-webs mechanics.

```
[personality]
Not an NPC. Silent. Skitters. Waits for prey to enter the web.

[knowledge-open]
Not applicable.

[encounter-design]
Trigger: opening the door to the unused side alcove. Room is webbed floor-to-ceiling.
Movement halved, DEX save DC 12 or become Restrained by webs.

Stats: standard 5e Giant Spider (CR 1, HP 26, AC 14). Single combatant.
Bite deals poison damage — introduces Poisoned condition to the group.
Web action can Restrain a PC (exercise the restrained-condition cleanup).

Loot: a half-cocooned past-adventurer corpse in the room has a silver ring (30gp) +
a half-torn map fragment hinting at another dungeon in the region (future hook).

[voice-id]
(placeholder — SFX only: clicks, hissing air, chitin scrape)
```

---

### Animated Skeleton ×2 (tomb — post-hidden-door chamber)

**Role:** The tomb was a real tomb once. Behind the secret door in Room D, skeletons of the original interred rise to defend the inner sanctum. Exercises undead mechanics: immune to poison, vulnerable to bludgeoning.

```
[personality]
Not NPCs. Mindless. No dialogue, only the clack of bone on stone floor.
Move with deliberate purpose, not goblin frenzy. Eerie stillness between actions.

[knowledge-open]
Not applicable.

[encounter-design]
Trigger: players open the secret door in Room D (the treasure/puzzle room) and cross
the threshold. Two skeletons rise from sarcophagi.

Stats: standard 5e Skeleton (CR 1/4, HP 13, AC 13) ×2. Armed with shortswords.
Mechanics to exercise:
- Vulnerability to bludgeoning (warhammer users do double damage — Thorin's moment)
- Immunity to poison + poisoned condition (if party already got poisoned by spider,
  teaches that "Poisoned is a condition, not everyone has it")
- Immunity to exhaustion / being frightened

Narrative beat: the skeletons wear tarnished amulets with the same tomb-sigil
(flavor only, sets up that the tomb has a history). Worth ~5gp each as curios.

[voice-id]
(placeholder — SFX: bone clatter, distant howling wind, no voice)
```

---

### Generic Goblin (×2, first-room encounter)

**Role:** Mook combatants. Minimal dialogue. Primarily a combat obstacle.

```
[personality]
Snarling, cowardly, pack-loyal. Mostly gutter-speak and threats.
Break morale when one drops. Bark a short phrase in Goblin before attacking.

[knowledge-open]
Not much. They fight, they swear, they die.

[knowledge-guarded]
Reveal trigger: intimidated survivor offers to talk.
Confirm the boss is in the back room with the hostage. Nothing more tactical than that.

[knowledge-secret]
None.

[voice-id]
(placeholder — any generic goblin voice, interchangeable)
```

---

## Combat variety check

Enemies above give the party exposure to four distinct encounter archetypes across one adventure:

| Enemy | Archetype | Mechanic exercised |
|---|---|---|
| Generic goblins ×2 | Mook horde | Action economy, pack tactics |
| Owlbear | Brute boss (CR 3) | Single high-HP target, Multiattack, optional retreat/skill avoidance |
| Giant spider | Ambush controller | Restrained condition, web terrain, poison damage |
| Skeletons ×2 | Undead with damage type | Bludgeoning vulnerability, poison/condition immunity |
| Skarvax + minion | Boss + adds | Phase 2 trigger, hostage mechanics, boss cowardice |

That covers: positioning (web), damage types (bludgeoning), conditions (poisoned, restrained), creature types (humanoid, beast, monstrosity, undead), and encounter flow (mook → wilderness brute → ambush → undead → boss).

## Voice pool planning (v2)

When ElevenLabs integration lands, these are the distinct voices we'll need:

| NPC | Voice character |
|---|---|
| Elder Marta | Older woman, tired, grave |
| Barkeep Dain | Middle-aged man, gruff, northern accent |
| Brena the Blacksmith | Middle-aged woman, terse, understated warmth |
| Old Pell the Hermit | Older man, slurred/rambling, cryptic flashes |
| Merchant Hollis | Middle-aged man, breezy / unctuous, chatty |
| Garrin (surviving militiaman) | 30s man, hoarse, dry dark humor |
| Skarvax | Goblin — gravelly, theatrical, cackling |
| Elric | Teenage boy, thin voice, nervous |
| Generic goblin | Goblin — any; not personality-distinct |

= ~9 distinct voice IDs (6 human, 2 goblin, 1 pooled goblin). Comfortably within the free-tier ElevenLabs sample library. Monsters (owlbear, spider, skeletons) use SFX rather than voice.

---

## How to use

1. When the Delian Tomb Foundry scene is built, create each actor above as a Foundry NPC.
2. Paste the tagged block into each actor's **Biography** field (Tidy 5e Sheets supports rich-text there).
3. The DM control page's "Active NPC" dropdown will parse the tags and present the profile to Claude in `[NPC Exchange]` blocks during play.
4. Claude reads the tags verbatim to keep voice + knowledge-tier discipline across sessions.

## Future NPC hooks (breadcrumbs for follow-up campaigns)

- **The pale elf / hooded ranger** — unnamed, unseen. Hooks in Dain + Skarvax reference her. Foreshadows a later campaign arc. Do not introduce her as a character in the Delian Tomb scene itself.
- **The cult** — implied by Skarvax's secret (gold with cult symbol). Keep fully offscreen in Delian Tomb.
- **Runara** (from the family's prior *Dragons of Stormwreck Isle* run) — not in Delian Tomb but reserved for later sessions as a returning mentor-figure NPC.
