"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PLAYER_SLOTS } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("demo");

  const id = () => sessionId.trim() || "demo";

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">D&D Digital Table</h1>
          <p className="mt-2 text-sm text-zinc-500">Pick a session and a role to join.</p>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Session ID</span>
          <input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="demo"
          />
        </label>

        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Join as a player
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {PLAYER_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => router.push(`/session/${id()}/player/${slot}`)}
                className="rounded-md bg-indigo-600 px-4 py-3 text-white font-medium hover:bg-indigo-500"
              >
                Player {slot}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Game surfaces
          </h2>
          <button
            onClick={() => router.push(`/session/${id()}/dm`)}
            className="w-full rounded-md bg-amber-600 px-4 py-3 text-white font-medium hover:bg-amber-500"
          >
            DM control (Scott's laptop)
          </button>
          <button
            onClick={() => router.push(`/session/${id()}/tv`)}
            className="w-full rounded-md bg-emerald-700 px-4 py-3 text-white font-medium hover:bg-emerald-600"
          >
            TV display (audience)
          </button>
        </section>
      </div>
    </div>
  );
}
