import { NextResponse } from "next/server";
import { listChat, sendChat } from "@/lib/foundryApi";

export async function GET() {
  try {
    const messages = await listChat();
    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { content?: string };
    if (!body?.content) return NextResponse.json({ error: "content required" }, { status: 400 });
    const result = await sendChat(body.content);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
