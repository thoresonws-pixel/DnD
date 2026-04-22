import { NextResponse } from "next/server";
import { getActor } from "@/lib/foundryApi";

type Params = { uuid: string };

export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  try {
    const { uuid } = await ctx.params;
    const actor = await getActor(decodeURIComponent(uuid));
    if (!actor) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ actor });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
