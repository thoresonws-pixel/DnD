// secret-door-reveal.js
// Reveals a hidden wall/door tagged with flag `dnd-table-skin.secret = true`.
// Fires a narration banner and a brief animated pulse on the door location.
//
// Setup (one-time per secret door):
//   1. Draw the wall as a secret door (Walls layer → Door Type: "Secret")
//   2. Open its configuration; go to the "Flags" tab and add: dnd-table-skin.secret = true
//   3. Mark it hidden initially (so players don't see it)
// Fire this macro on successful Perception or Investigation.

// === CONFIG ===
const NARRATION = "A faint seam in the stone catches your eye — a door hidden in plain sight slides open with a grinding whisper.";
// ==============

const secrets = canvas.walls.placeables.filter(w =>
  w.document.flags?.["dnd-table-skin"]?.secret === true && w.document.hidden === true
);

if (!secrets.length) {
  ui.notifications.warn("No hidden secret doors flagged on this scene.");
  return;
}

// Reveal each (there's usually just one; this supports multi-stage reveals too)
for (const wall of secrets) {
  await wall.document.update({ hidden: false });

  if (typeof Sequence !== "undefined") {
    try {
      const mid = {
        x: (wall.document.c[0] + wall.document.c[2]) / 2,
        y: (wall.document.c[1] + wall.document.c[3]) / 2,
      };
      new Sequence()
        .effect()
          .file("jb2a.magic_signs.circle.02.abjuration.intro.yellow")
          .atLocation(mid)
          .scale(0.4)
        .play();
    } catch (e) {
      console.warn("secret-door animation skipped:", e);
    }
  }
}

await ChatMessage.create({ content: `!narrate ${NARRATION}` });
