# Build-time scripts

Node scripts that hit the Foundry REST API for bulk content prep (actors, items, journals). Run from any machine with the Foundry REST API module paired.

## Setup

Requires three env vars (same as the Next.js app's `.env.local`):

```
FOUNDRY_REST_API_URL=https://foundryrestapi.com
FOUNDRY_REST_API_KEY=<your master key from foundryrestapi.com>
FOUNDRY_REST_CLIENT_ID=<your client id, e.g. fvtt_xxxx>
```

Load them before running any script:

```bash
set -a; . /path/to/.env.local; set +a
node scripts/<name>.mjs [args]
```

## Scripts

### `create-npcs.mjs`

Batch-creates NPC actors in Foundry from a `prep/<adventure>-npcs.md` file. Each `### Heading` + triple-backtick tag block becomes one Foundry NPC actor with the tag block stored in its biography field.

```bash
node scripts/create-npcs.mjs prep/delian-tomb-npcs.md
```

Name-cleanup map is inline in the script — for new adventures, extend `NAME_MAP` or just let the raw heading be the actor name.

Output: list of created actor UUIDs. Idempotency is NOT handled — re-running will create duplicates. If you need to re-run, delete the actors first (Foundry GUI or `/delete` endpoint) or we add a cleanup step to the script.
