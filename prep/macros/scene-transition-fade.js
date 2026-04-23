// scene-transition-fade.js
// Fades the canvas to black, activates a target scene, fades in.
// Use to transition Village → Forest (picture) → Tomb.

// === CONFIG ===
const TARGET_SCENE_NAME = "Tomb Interior";   // change per transition
const FADE_MS = 800;
const TRANSITION_NARRATION = "";             // optional — leave "" to skip
// ==============

const target = game.scenes.getName(TARGET_SCENE_NAME);
if (!target) {
  ui.notifications.warn(`Scene "${TARGET_SCENE_NAME}" not found.`);
  return;
}

// Fade overlay — injected as a temporary full-viewport div
function fadeOverlay(duration, targetOpacity) {
  return new Promise((resolve) => {
    let el = document.getElementById("dnd-scene-fade");
    if (!el) {
      el = document.createElement("div");
      el.id = "dnd-scene-fade";
      Object.assign(el.style, {
        position: "fixed", inset: "0", background: "#000",
        opacity: "0", transition: `opacity ${duration}ms ease`,
        zIndex: "10000", pointerEvents: "none",
      });
      document.body.appendChild(el);
    }
    requestAnimationFrame(() => {
      el.style.opacity = String(targetOpacity);
      setTimeout(resolve, duration);
    });
  });
}

function removeFade() {
  document.getElementById("dnd-scene-fade")?.remove();
}

// Fade out → activate scene → fade in
await fadeOverlay(FADE_MS, 1);

if (TRANSITION_NARRATION) {
  await ChatMessage.create({ content: `!narrate ${TRANSITION_NARRATION}` });
}

await target.activate();

// Give scene time to load
await new Promise(r => setTimeout(r, 400));

await fadeOverlay(FADE_MS, 0);
setTimeout(removeFade, FADE_MS + 100);
