"use client";

import { use } from "react";

type Params = { id: string; slot: string };

export default function PlayerPage({ params }: { params: Promise<Params> }) {
  const { id, slot } = use(params);
  const foundryUrl = process.env.NEXT_PUBLIC_FOUNDRY_URL ?? "http://<your-foundry-ip>:30000";

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-zinc-950 text-zinc-100">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Player {slot}</h1>
        <p className="text-zinc-400 text-sm">Session: {id}</p>
        <p className="text-zinc-300">
          Player experience lives in <strong>Foundry VTT</strong>, not here. Open Foundry
          on your phone and log in as Player {slot}.
        </p>
        <a
          href={foundryUrl}
          className="inline-block rounded-md bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-500"
        >
          Open Foundry →
        </a>
        <p className="text-xs text-zinc-500 mt-6">
          This page exists as a placeholder. The real game UI is in Foundry VTT with our
          custom player-skin module applied.
        </p>
      </div>
    </div>
  );
}
