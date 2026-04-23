// boss-skarvax-phase2.js
// Manual GM macro — fire when Skarvax hits 50% HP.
// Plays narration + applies a visual red tint to his token to signal rage.
// Undo with the boss-skarvax-reset macro or by clearing the tint manually.

// === CONFIG ===
const BOSS_NAME = "Skarvax";
const NARRATION = "Skarvax staggers, wipes blood from his tusk, and roars — 'You mortals will NOT take this tomb!' — his eyes smolder red as he draws a second blade.";
const RAGE_TINT = "#ff3030";
// ==============

const boss = canvas.tokens.placeables.find(t => t.name === BOSS_NAME);
if (!boss) {
  ui.notifications.warn(`No token named "${BOSS_NAME}" on this scene.`);
  return;
}

await ChatMessage.create({ content: `!narrate ${NARRATION}` });

await boss.document.update({ "texture.tint": RAGE_TINT });

// Sequencer pulse if available
if (typeof Sequence !== "undefined") {
  try {
    new Sequence()
      .effect()
        .file("jb2a.impact.ground_crack.orange.01")
        .atLocation(boss)
        .belowTokens()
        .scaleToObject(2)
      .play();
  } catch (e) {
    console.warn("boss-phase2 animation skipped:", e);
  }
}
