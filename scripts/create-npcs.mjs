#!/usr/bin/env node
// Batch-create Delian Tomb NPCs in Foundry via REST API.
import fs from "node:fs";

const API_URL = "https://foundryrestapi.com";
const API_KEY = (process.env.FOUNDRY_REST_API_KEY || "").trim();
const CLIENT_ID = (process.env.FOUNDRY_REST_CLIENT_ID || "").trim();

if (!API_KEY || !CLIENT_ID) {
  console.error("Missing FOUNDRY_REST_API_KEY / FOUNDRY_REST_CLIENT_ID in env");
  process.exit(1);
}

const NAME_MAP = {
  "Elder Marta (quest-giver)": "Elder Marta",
  "Barkeep Dain (rumormonger)": "Barkeep Dain",
  "Brena the Blacksmith": "Brena",
  "Old Pell, the Hermit": "Old Pell",
  "Merchant Hollis (supplies)": "Merchant Hollis",
  "Garrin, the Surviving Militiaman (found in tomb, Room C or D)": "Garrin",
  'Goblin Boss "Skarvax" (final encounter)': "Skarvax",
  "Elric (hostage)": "Elric",
  "Owlbear (forest encounter)": "Owlbear",
  "Giant Spider (tomb side room)": "Giant Spider",
  "Animated Skeleton ×2 (tomb — post-hidden-door chamber)": "Skeleton",
  "Generic Goblin (×2, first-room encounter)": "Goblin",
};

function parseNpcs(md) {
  const sections = md.split(/^### /m).slice(1);
  const out = [];
  for (const section of sections) {
    const nl = section.indexOf("\n");
    if (nl < 0) continue;
    const heading = section.slice(0, nl).trim();
    const body = section.slice(nl + 1);
    const m = body.match(/```\n([\s\S]*?)```/);
    if (!m) continue;
    const tagBlock = m[1].replace(/\s+$/, "");
    const name = NAME_MAP[heading] || heading;
    out.push({ name, biography: `<pre>${tagBlock}</pre>` });
  }
  return out;
}

async function createActor(name, biography) {
  const url = `${API_URL}/create?clientId=${CLIENT_ID}`;
  const payload = {
    entityType: "Actor",
    data: {
      name,
      type: "npc",
      system: { details: { biography: { value: biography, public: "" } } },
    },
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.uuid || `HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`;
  } catch (err) {
    return `ERROR: ${err.message}`;
  }
}

const mdPath = process.argv[2] || "/tmp/npcs.md";
const md = fs.readFileSync(mdPath, "utf-8");
const npcs = parseNpcs(md);
console.log(`Parsed ${npcs.length} NPC(s):\n`);

for (const npc of npcs) {
  const uuid = await createActor(npc.name, npc.biography);
  console.log(`  ${npc.name.padEnd(22)} → ${uuid}`);
}

console.log(`\nDone.`);
