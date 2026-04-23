// arrow-trap.js
// Fires when a PC steps on the trap tile. Configure as action on the Monk's Active Tile Trigger:
//   Trigger: "When an actor enters"
//   Filter:  "Player-only tokens"
//   Action:  "Execute Macro" → this macro
//
// The token that triggered will be in `args[0]?.tokens` (Monk's Active Tiles convention).
// Falls back to the selected token if run manually.

// === CONFIG ===
const NARRATION = "Arrows whip from hidden murder holes — steel whispers through the air!";
const DAMAGE_FORMULA = "1d6";           // per affected token
const DAMAGE_TYPE = "piercing";         // for log display only
const ANIM_FILE = "jb2a.arrow.physical.white.01.90ft";  // fallback swaps below if missing
// ==============

// Resolve targets — Monk's passes them, otherwise use selected / all PCs
const monkTargets = args?.[0]?.tokens ?? args?.[0]?.tokenId;
let targets;
if (Array.isArray(monkTargets) && monkTargets.length) {
  targets = monkTargets
    .map(t => canvas.tokens.get(t?.id ?? t))
    .filter(Boolean);
} else if (canvas.tokens.controlled.length) {
  targets = canvas.tokens.controlled;
} else {
  targets = canvas.tokens.placeables.filter(t => t.actor?.type === "character");
}

if (!targets.length) {
  ui.notifications.warn("Arrow trap: no targets found");
  return;
}

// Fire narration banner
await ChatMessage.create({ content: `!narrate ${NARRATION}` });

// Animate + damage each target
for (const token of targets) {
  // Animation (Sequencer + JB2A)
  if (typeof Sequence !== "undefined") {
    try {
      new Sequence()
        .effect()
          .file(ANIM_FILE)
          .atLocation({ x: token.document.x - 250, y: token.document.y + token.document.height * canvas.grid.size / 2 })
          .stretchTo(token)
          .waitUntilFinished(-200)
        .play();
    } catch (e) {
      console.warn("arrow-trap animation skipped:", e);
    }
  }

  // Damage roll
  const roll = await new Roll(DAMAGE_FORMULA).evaluate();
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ alias: "Arrow Trap" }),
    flavor: `${token.name} takes ${DAMAGE_TYPE} damage.`,
  });

  // Apply damage if actor is present
  if (token.actor?.applyDamage) {
    await token.actor.applyDamage(roll.total);
  }
}
