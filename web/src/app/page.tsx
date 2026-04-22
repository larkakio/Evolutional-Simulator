"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";

import { CheckInPanel } from "@/components/CheckInPanel";
import { WalletBar } from "@/components/WalletBar";
import { LEVELS } from "@/game/levels";
import {
  getServerUnlockedLevel,
  getUnlockedLevel,
  subscribeUnlockedLevel,
} from "@/lib/progress";

const GameBoard = dynamic(
  () =>
    import("@/components/game/GameBoard").then((m) => ({ default: m.GameBoard })),
  { ssr: false },
);

export default function Home() {
  const unlockedLevel = useSyncExternalStore(
    subscribeUnlockedLevel,
    getUnlockedLevel,
    getServerUnlockedLevel,
  );

  const [selectedId, setSelectedId] = useState(1);

  const blueprint = LEVELS.find((l) => l.id === selectedId) ?? LEVELS[0]!;
  const maxId = LEVELS.length;
  const showNextStage = selectedId < maxId && selectedId < unlockedLevel;

  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <WalletBar />

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-3 pb-8 pt-4">
        <div className="text-center">
          <h1 className="neon-title font-[family-name:var(--font-display)] text-2xl font-bold tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-lime-300">
            EVOLUTION
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-cyan-500/70">
            Simulator // Base
          </p>
        </div>

        <section aria-label="Stage selection" className="flex flex-col gap-2">
          <h2 className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
            Stages
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {LEVELS.map((lvl) => {
              const locked = lvl.id > unlockedLevel;
              const active = lvl.id === selectedId;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  disabled={locked}
                  onClick={() => setSelectedId(lvl.id)}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${
                    active
                      ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_16px_rgba(34,211,238,0.2)]"
                      : "border-white/10 bg-slate-950/50 hover:border-cyan-500/30"
                  } ${locked ? "cursor-not-allowed opacity-35" : ""}`}
                >
                  <div className="font-[family-name:var(--font-display)] text-xs text-cyan-100">
                    {locked ? "Locked · " : ""}
                    {lvl.id}. {lvl.name}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <GameBoard
          key={blueprint.id}
          blueprint={blueprint}
          unlockedLevel={unlockedLevel}
        />

        {showNextStage ? (
          <div className="flex justify-center">
            <button
              type="button"
              className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-950/30 px-5 py-2 text-sm font-semibold text-fuchsia-100 shadow-[0_0_20px_rgba(217,70,239,0.15)]"
              onClick={() => setSelectedId((id) => Math.min(maxId, id + 1))}
            >
              Next stage →
            </button>
          </div>
        ) : null}

        <CheckInPanel />
      </main>
    </div>
  );
}
