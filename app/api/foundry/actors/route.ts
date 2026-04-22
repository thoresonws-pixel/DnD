import { NextResponse } from "next/server";
import { searchActors } from "@/lib/foundryApi";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const actors = await searchActors(q);
    return NextResponse.json({ actors });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
