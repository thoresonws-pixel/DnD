/**
 * DnD Table Skin
 *  - Body classes for role/user CSS targeting
 *  - /narrate chat command interceptor (!narrate prefix)
 *  - Narration banner on TV Display
 *  - Action dialog on Player phones (tap ACTION)
 *  - Auto-open character sheet on login (players)
 *  - Combat mode: "Your Turn" banner + auto-switch to Actions tab
 *  - Leader mode: arrow pad, toggled via !leader on/off (GM only)
 */

/* =========================================================
   Body-class tagging (fires on every user)
   ========================================================= */
Hooks.once("ready", () => {
  const body = document.body;
  const roles = CONST.USER_ROLES;
  const role = game.user.role;

  if (role >= roles.GAMEMASTER) body.classList.add("user-gm");
  else if (role >= roles.ASSISTANT) body.classList.add("user-assistant");
  else if (role >= roles.TRUSTED) body.classList.add("user-trusted-player");
  else if (role >= roles.PLAYER) body.classList.add("user-player");

  const nameSlug = (game.user.name || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  body.classList.add(`user-${nameSlug}`);

  console.log(`[dnd-table-skin] ready for "${game.user.name}" (role ${role})`);

  const isExactlyPlayer = role === roles.PLAYER;
  if (isExactlyPlayer && window.innerWidth <= 900) {
    injectActionButton();
    autoOpenCharacterSheet();
  }
});

/* =========================================================
   Player: auto-open the assigned character sheet
   ========================================================= */
function autoOpenCharacterSheet() {
  const character = game.user.character;
  if (!character) {
    console.log("[dnd-table-skin] no character assigned to user; skipping auto-open");
    return;
  }
  setTimeout(() => {
    try {
      character.sheet?.render(true);
    } catch (err) {
      console.error("[dnd-table-skin] failed to auto-open sheet", err);
    }
  }, 400);
}

/* =========================================================
   Chat interceptor — !narrate, !leader, !tactical commands
   ========================================================= */
Hooks.on("preCreateChatMessage", (document, data, options, userId) => {
  const raw = data.content ?? document?.content ?? "";
  const plain = stripHtml(raw).trim();

  const narrateMatch = plain.match(/^!(narrate|nar)\s+([\s\S]+)$/i);
  if (narrateMatch) {
    const text = narrateMatch[2].trim();
    document.updateSource({
      content: text,
      speaker: { alias: "Narrator" },
      flags: { "dnd-table-skin": { narration: true } },
    });
    return true;
  }

  // GM-only toggles: !leader on|off|player1|player2... and !tactical on|off
  if (game.user?.role >= CONST.USER_ROLES.GAMEMASTER) {
    const leaderMatch = plain.match(/^!leader\s+(on|off|\S+)$/i);
    if (leaderMatch) {
      const arg = leaderMatch[1].toLowerCase();
      const target = arg === "off" ? null : (arg === "on" ? (game.user.character?.id ?? null) : arg);
      game.settings.set("dnd-table-skin", "leaderUserOrActor", target ?? "");
      ui.notifications?.info(`Leader set to: ${target ?? "none"}`);
      document.updateSource({ content: `<em>Leader mode: ${target ?? "off"}</em>` });
      return true;
    }
    const tacticalMatch = plain.match(/^!tactical\s+(on|off)$/i);
    if (tacticalMatch) {
      const on = tacticalMatch[1].toLowerCase() === "on";
      game.settings.set("dnd-table-skin", "tactical", on);
      ui.notifications?.info(`Tactical mode: ${on ? "on" : "off"}`);
      document.updateSource({ content: `<em>Tactical mode: ${on ? "on" : "off"}</em>` });
      return true;
    }
  }

  return true;
});

/* =========================================================
   Module settings (tactical + leader)
   ========================================================= */
Hooks.once("init", () => {
  game.settings.register("dnd-table-skin", "tactical", {
    name: "Tactical mode",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
    onChange: updateLeaderUI,
  });
  game.settings.register("dnd-table-skin", "leaderUserOrActor", {
    name: "Leader user/actor ID",
    scope: "world",
    config: false,
    type: String,
    default: "",
    onChange: updateLeaderUI,
  });
});

Hooks.once("ready", () => updateLeaderUI());

function updateLeaderUI() {
  const tactical = game.settings.get("dnd-table-skin", "tactical");
  const leaderId = game.settings.get("dnd-table-skin", "leaderUserOrActor");
  const isLeader =
    !!leaderId &&
    (game.user.character?.id === leaderId || game.user.id === leaderId);
  const showArrows = tactical && isLeader;
  document.body.classList.toggle("dnd-leader-mode", showArrows);
  if (showArrows) injectArrowPad();
  else removeArrowPad();
}

function injectArrowPad() {
  if (document.getElementById("dnd-arrow-pad")) return;
  const pad = document.createElement("div");
  pad.id = "dnd-arrow-pad";
  pad.className = "dnd-arrow-pad";

  const btn = (label, dir) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `dnd-arrow-btn dir-${dir}`;
    b.textContent = label;
    b.addEventListener("click", () => onArrow(dir));
    return b;
  };

  pad.appendChild(btn("↑", "up"));
  pad.appendChild(btn("←", "left"));
  pad.appendChild(btn("→", "right"));
  pad.appendChild(btn("↓", "down"));

  document.body.appendChild(pad);
  document.body.classList.add("dnd-has-arrow-pad");
}

function removeArrowPad() {
  document.getElementById("dnd-arrow-pad")?.remove();
  document.body.classList.remove("dnd-has-arrow-pad");
}

function onArrow(dir) {
  const name = game.user.character?.name ?? game.user.name;
  ChatMessage.create({
    content: `<em>${name} moves <strong>${dir}</strong></em>`,
    speaker: ChatMessage.getSpeaker(),
    flags: { "dnd-table-skin": { move: dir } },
  });
}

/* =========================================================
   Combat mode — "Your Turn" banner + Actions-tab auto-switch
   ========================================================= */
Hooks.on("combatStart", () => refreshCombatUI());
Hooks.on("updateCombat", () => refreshCombatUI());
Hooks.on("deleteCombat", () => exitCombatUI());
Hooks.on("combatTurnChange", () => refreshCombatUI());

function refreshCombatUI() {
  const combat = game.combat;
  if (!combat?.started) {
    exitCombatUI();
    return;
  }

  document.body.classList.add("dnd-in-combat");
  const current = combat.combatant;
  const myCharacterId = game.user.character?.id;
  const myTurn = !!current && current.actorId === myCharacterId;
  document.body.classList.toggle("dnd-my-turn", myTurn);

  showTurnBanner(myTurn ? "Your Turn" : `Waiting for ${current?.name ?? "…"}`);

  if (myTurn) switchSheetToActionsTab();
}

function exitCombatUI() {
  document.body.classList.remove("dnd-in-combat", "dnd-my-turn");
  hideTurnBanner();
}

function showTurnBanner(label) {
  let banner = document.getElementById("dnd-turn-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "dnd-turn-banner";
    banner.className = "dnd-turn-banner";
    document.body.appendChild(banner);
  }
  banner.textContent = label;
  banner.classList.toggle("is-my-turn", label === "Your Turn");
}

function hideTurnBanner() {
  document.getElementById("dnd-turn-banner")?.remove();
}

function switchSheetToActionsTab() {
  setTimeout(() => {
    const candidates = document.querySelectorAll(
      '[data-tab="actions"], .tabs .item[data-tab="actions"], a.tab[data-tab="actions"]'
    );
    for (const c of candidates) {
      if (typeof c.click === "function") {
        c.click();
        break;
      }
    }
  }, 150);
}

/* =========================================================
   Custom ACTION button for player phones
   ========================================================= */
function injectActionButton() {
  if (document.getElementById("dnd-action-btn")) return;
  const btn = document.createElement("button");
  btn.id = "dnd-action-btn";
  btn.type = "button";
  btn.textContent = "ACTION";
  btn.addEventListener("click", onActionButtonClick);
  document.body.appendChild(btn);
  document.body.classList.add("dnd-has-action-btn");
}

function onActionButtonClick() {
  if (document.getElementById("dnd-action-dialog")) return;

  const overlay = document.createElement("div");
  overlay.id = "dnd-action-dialog";
  overlay.className = "dnd-action-dialog-overlay";

  const panel = document.createElement("div");
  panel.className = "dnd-action-dialog";

  const heading = document.createElement("h2");
  heading.textContent = "Describe your action";
  panel.appendChild(heading);

  const textarea = document.createElement("textarea");
  textarea.id = "dnd-action-textarea";
  textarea.placeholder = "I want to…";
  textarea.rows = 4;
  panel.appendChild(textarea);

  const buttons = document.createElement("div");
  buttons.className = "dnd-action-dialog-buttons";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.id = "dnd-action-cancel";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => overlay.remove());

  const sendBtn = document.createElement("button");
  sendBtn.type = "button";
  sendBtn.id = "dnd-action-send";
  sendBtn.textContent = "Send";
  sendBtn.addEventListener("click", async () => {
    const text = textarea.value.trim();
    if (!text) return;
    try {
      await ChatMessage.create({
        content: text,
        speaker: ChatMessage.getSpeaker(),
      });
    } catch (err) {
      console.error("[dnd-table-skin] failed to send action", err);
    }
    overlay.remove();
  });

  buttons.appendChild(cancelBtn);
  buttons.appendChild(sendBtn);
  panel.appendChild(buttons);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  setTimeout(() => textarea.focus(), 50);
}

/* =========================================================
   Narration banner (TV Display only)
   ========================================================= */
const BANNER_ID = "dnd-narration-banner";
const BANNER_DISMISS_MS = 15000;

function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html ?? "";
  return (tmp.textContent || tmp.innerText || "").trim();
}

function typewrite(el, text, delayMs = 22) {
  el.textContent = "";
  let i = 0;
  const tick = () => {
    if (!el.isConnected) return;
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, delayMs);
  };
  tick();
}

function showBanner({ portrait, name, text }) {
  const existing = document.getElementById(BANNER_ID);
  if (existing) existing.remove();

  const el = document.createElement("div");
  el.id = BANNER_ID;
  el.className = "dnd-banner";

  if (portrait) {
    const img = document.createElement("img");
    img.className = "dnd-banner-portrait";
    img.src = portrait;
    img.onerror = () => img.remove();
    el.appendChild(img);
  }

  const textWrap = document.createElement("div");
  textWrap.className = "dnd-banner-text-wrap";

  const nameEl = document.createElement("div");
  nameEl.className = "dnd-banner-name";
  nameEl.textContent = name || "Narrator";
  textWrap.appendChild(nameEl);

  const textEl = document.createElement("div");
  textEl.className = "dnd-banner-text";
  textWrap.appendChild(textEl);

  el.appendChild(textWrap);

  let dismissTimer = setTimeout(() => el.remove(), BANNER_DISMISS_MS);
  el.addEventListener("click", () => {
    clearTimeout(dismissTimer);
    el.remove();
  });

  document.body.appendChild(el);
  typewrite(textEl, text);
}

function isBannerMessage(message) {
  const isNarrationFlag = message.flags?.["dnd-table-skin"]?.narration === true;
  const speaker = message.speaker ?? {};
  const isNarratorAlias = (speaker.alias || "").toLowerCase() === "narrator";
  const actor = speaker.actor ? game.actors.get(speaker.actor) : null;
  const isNpcDialogue = !!actor && !(message.whisper?.length > 0);
  return { isNarrationFlag, isNarratorAlias, isNpcDialogue, actor, speaker };
}

Hooks.on("createChatMessage", (message) => {
  if (game.user.name !== "TV Display") return;

  const info = isBannerMessage(message);
  if (!(info.isNarrationFlag || info.isNarratorAlias || info.isNpcDialogue)) return;

  const text = stripHtml(message.content);
  const treatAsNarration = info.isNarrationFlag || info.isNarratorAlias;
  const name = treatAsNarration
    ? info.speaker.alias || "Narrator"
    : info.speaker.alias || info.actor?.name || "—";
  const portrait = treatAsNarration ? null : info.actor?.img || null;

  showBanner({ portrait, name, text });
});

function markBannerClass(message, element) {
  if (game.user.name !== "TV Display") return;
  if (!element) return;
  const el = element.classList ? element : element[0];
  if (!el?.classList) return;

  const info = isBannerMessage(message);
  if (info.isNarrationFlag || info.isNarratorAlias || info.isNpcDialogue) {
    el.classList.add("banner-message");
  }
}

Hooks.on("renderChatMessageHTML", markBannerClass);
Hooks.on("renderChatMessage", markBannerClass);
