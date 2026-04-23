// combat-start-banner.js
// Manual GM macro — fires a dramatic narration when combat begins.
// Edit COMBAT_TEXT per-encounter, or drop multiple copies into the hotbar for different fights.

// === CONFIG ===
const COMBAT_TEXT = "Weapons spring free from sheaths — steel rings against the sudden silence as the party squares off against their enemies.";
// ==============

await ChatMessage.create({
  content: `!narrate ${COMBAT_TEXT}`,
});

// Optional: if you have a combat-start sound registered, uncomment and set the path:
// AudioHelper.play({src: "path/to/combat-start.ogg", volume: 0.6, autoplay: true, loop: false}, true);
