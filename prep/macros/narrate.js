// narrate.js
// Helper — fires a narration banner on the TV via the !narrate hook in dnd-table-skin.
// Usage (from another macro or console):   game.macros.getName("narrate").execute({text: "The door creaks open..."});
// Or drag to hotbar and run it; it will prompt for text.

const text = scope?.text ?? await Dialog.prompt({
  title: "Narrate",
  content: '<textarea id="narrate-text" rows="4" style="width: 100%"></textarea>',
  callback: (html) => html.find("#narrate-text").val(),
  rejectClose: false,
});

if (!text?.trim()) return;

await ChatMessage.create({
  content: `!narrate ${text.trim()}`,
});
