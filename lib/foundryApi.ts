const baseUrl = process.env.FOUNDRY_REST_API_URL;
const apiKey = process.env.FOUNDRY_REST_API_KEY;
const clientId = process.env.FOUNDRY_REST_CLIENT_ID;

function requireEnv() {
  if (!baseUrl || !apiKey || !clientId) {
    throw new Error(
      "FOUNDRY_REST_API_URL / FOUNDRY_REST_API_KEY / FOUNDRY_REST_CLIENT_ID missing in env.local"
    );
  }
  return { baseUrl, apiKey: apiKey!, clientId: clientId! };
}

export async function foundryGet(path: string, query: Record<string, string> = {}) {
  const { baseUrl, apiKey, clientId } = requireEnv();
  const qs = new URLSearchParams({ clientId, ...query }).toString();
  const res = await fetch(`${baseUrl}${path}?${qs}`, {
    headers: { "x-api-key": apiKey },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Foundry GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function foundryPost(path: string, body: unknown, query: Record<string, string> = {}) {
  const { baseUrl, apiKey, clientId } = requireEnv();
  const qs = new URLSearchParams({ clientId, ...query }).toString();
  const res = await fetch(`${baseUrl}${path}?${qs}`, {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Foundry POST ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export interface FoundryChatMessage {
  id: string;
  content: string;
  speaker?: { scene?: string | null; actor?: string | null; token?: string | null; alias?: string };
  timestamp: number;
  author?: { id: string; name: string };
  whisper?: string[];
  isRoll?: boolean;
  rolls?: unknown[];
  flags?: Record<string, unknown>;
}

export interface FoundryActorSummary {
  id: string;
  name: string;
  uuid: string;
  img?: string;
  subType?: string;
}

export interface FoundryActor {
  _id: string;
  name: string;
  img?: string;
  type: string;
  system?: {
    details?: {
      biography?: { value?: string };
    };
  };
}

export async function listChat(): Promise<FoundryChatMessage[]> {
  const res = await foundryGet("/chat");
  return res?.data?.messages ?? [];
}

export async function sendChat(content: string): Promise<unknown> {
  return foundryPost("/chat", { content });
}

export async function getActor(uuid: string): Promise<FoundryActor> {
  const res = await foundryGet("/get", { uuid });
  return res?.data ?? null;
}

export async function searchActors(query = ""): Promise<FoundryActorSummary[]> {
  const res = await foundryGet("/search", { query: query || "", filter: "type:Actor" });
  const results = res?.results ?? [];
  return results
    .filter((r: { documentType?: string; resultType?: string }) =>
      r.documentType === "Actor" && r.resultType === "WorldEntity"
    )
    .map((r: { id: string; name: string; uuid: string; icon?: string; subType?: string }) => ({
      id: r.id,
      name: r.name,
      uuid: r.uuid,
      img: r.icon,
      subType: r.subType,
    }));
}
