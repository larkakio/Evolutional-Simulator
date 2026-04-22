"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { movePlayer, parseBlueprint } from "@/game/engine";
import type { Direction, GameState, LevelBlueprint } from "@/game/types";
import { recordLevelComplete } from "@/lib/progress";

const SWIPE_MIN = 28;

type GameBoardProps = {
  blueprint: LevelBlueprint;
  unlockedLevel: number;
};

function classifySwipe(dx: number, dy: number): Direction | null {
  if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) return null;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}

export function GameBoard({ blueprint, unlockedLevel }: GameBoardProps) {
  const [game, setGame] = useState<GameState>(() =>
    parseBlueprint(blueprint),
  );
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const winRecorded = useRef(false);

  const applyMove = useCallback((dir: Direction) => {
    setGame((g) => (g ? movePlayer(g, dir) : g));
  }, []);

  useEffect(() => {
    if (!game || game.status !== "won" || winRecorded.current) return;
    winRecorded.current = true;
    recordLevelComplete(blueprint.id);
  }, [game, blueprint.id]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (!start) return;
    const dir = classifySwipe(e.clientX - start.x, e.clientY - start.y);
    if (dir) applyMove(dir);
  };

  if (!game) return null;

  const locked = blueprint.id > unlockedLevel;
  const hue = blueprint.hue;
  const meter =
    game.shardsTotal > 0
      ? Math.min(100, (game.shardsCollected / game.shardsTotal) * 100)
      : 100;

  if (locked) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-fuchsia-500/30 bg-slate-950/60 p-6 text-center">
        <p className="font-[family-name:var(--font-display)] text-fuchsia-200">
          Sector locked
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Clear the previous stage to open this one.
        </p>
      </div>
    );
  }

  const cells = [];
  for (let y = 0; y < game.height; y++) {
    for (let x = 0; x < game.width; x++) {
      const tile = game.grid[y]![x]!;
      const here = game.player.x === x && game.player.y === y;

      let inner: ReactNode;
      if (tile === "wall") {
        inner = (
          <div className="aspect-square rounded-md bg-[#0a0d18] ring-1 ring-cyan-900/40" />
        );
      } else if (tile === "shard") {
        inner = (
          <div className="relative flex aspect-square items-center justify-center">
            <div
              className="h-3/5 w-3/5 rotate-45 rounded-sm ring-2"
              style={{
                boxShadow: `0 0 14px hsla(${hue}, 100%, 60%, 0.9)`,
                borderColor: `hsl(${hue}, 100%, 65%)`,
                background: `linear-gradient(135deg, hsla(${hue}, 100%, 55%, 0.5), hsla(${(hue + 40) % 360}, 100%, 45%, 0.35))`,
              }}
            />
          </div>
        );
      } else if (tile === "hazard") {
        inner = (
          <div className="relative flex aspect-square items-center justify-center rounded-md bg-red-950/40 ring-1 ring-red-500/50">
            <span className="text-xs font-bold text-red-400">✕</span>
          </div>
        );
      } else if (tile === "barrier") {
        const open = game.evolved;
        inner = (
          <div
            className={`relative flex aspect-square items-center justify-center rounded-md ring-1 ${open ? "bg-emerald-950/20 ring-emerald-400/30" : "bg-violet-950/50 ring-violet-400/60"}`}
          >
            <span
              className={`text-[10px] font-mono ${open ? "text-emerald-300/70" : "text-violet-200"}`}
            >
              {open ? "◇" : "⬡"}
            </span>
          </div>
        );
      } else if (tile === "portal") {
        inner = (
          <div className="relative flex aspect-square items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600/25 to-cyan-500/25 ring-2 ring-fuchsia-400/50">
            <span className="text-sm text-fuchsia-100">◎</span>
          </div>
        );
      } else {
        inner = (
          <div className="aspect-square rounded-md bg-slate-900/50 ring-1 ring-white/5" />
        );
      }

      if (here) {
        inner = (
          <div className="relative">
            {inner}
            <div
              className={`pointer-events-none absolute inset-0 flex items-center justify-center ${game.evolved ? "motion-safe:animate-pulse" : ""}`}
            >
              <div
                className="h-[55%] w-[55%]"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                  background: game.evolved
                    ? `radial-gradient(circle at 30% 30%, hsl(${hue}, 100%, 70%), hsl(${(hue + 60) % 360}, 95%, 45%))`
                    : `radial-gradient(circle at 30% 30%, hsl(${(hue + 120) % 360}, 100%, 72%), hsl(${hue}, 90%, 42%))`,
                  boxShadow: game.evolved
                    ? `0 0 18px hsla(${(hue + 60) % 360}, 100%, 55%, 0.95)`
                    : `0 0 14px hsla(${hue}, 100%, 55%, 0.85)`,
                }}
              />
            </div>
          </div>
        );
      }

      cells.push(
        <div key={`c-${x}-${y}`} className="min-w-0">
          {inner}
        </div>,
      );
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative touch-none select-none rounded-2xl border p-2"
        style={{
          borderColor: `hsla(${hue}, 85%, 55%, 0.35)`,
          boxShadow: `0 0 32px hsla(${hue}, 100%, 50%, 0.12), inset 0 0 60px hsla(${hue}, 80%, 40%, 0.06)`,
          background:
            "linear-gradient(145deg, rgba(5,8,20,0.95), rgba(12,6,28,0.92))",
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerStart.current = null;
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(hsla(${hue}, 100%, 70%, 0.4) 1px, transparent 1px), linear-gradient(90deg, hsla(${hue}, 100%, 70%, 0.4) 1px, transparent 1px)`,
            backgroundSize: "14px 14px",
          }}
        />
        <div
          className="relative grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${game.width}, minmax(0, 1fr))`,
          }}
        >
          {cells}
        </div>
      </div>

      <div className="space-y-1 px-1">
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500">
          <span>Evolution</span>
          <span>{game.evolved ? "Stable form" : "Gather shards"}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-900 ring-1 ring-cyan-500/20">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${meter}%`,
              background: `linear-gradient(90deg, hsl(${hue}, 100%, 45%), hsl(${(hue + 80) % 360}, 100%, 55%))`,
              boxShadow: `0 0 12px hsla(${hue}, 100%, 50%, 0.6)`,
            }}
          />
        </div>
      </div>

      <p className="px-1 text-center text-[11px] text-slate-500">
        Swipe on the field to move · Collect all shards, then enter the portal
      </p>

      {game.status === "lost" ? (
        <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-center">
          <p className="text-sm text-red-200">Signal lost — hazard contact</p>
          <button
            type="button"
            className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-100 ring-1 ring-red-400/50"
            onClick={() => {
              winRecorded.current = false;
              setGame(parseBlueprint(blueprint));
            }}
          >
            Reboot stage
          </button>
        </div>
      ) : null}

      {game.status === "won" ? (
        <div className="rounded-xl border border-lime-400/40 bg-emerald-950/30 p-4 text-center">
          <p className="font-[family-name:var(--font-display)] text-sm text-lime-200">
            Stage synchronized
          </p>
          <button
            type="button"
            className="mt-3 rounded-lg bg-lime-400/15 px-4 py-2 text-xs font-semibold text-lime-100 ring-1 ring-lime-400/40"
            onClick={() => {
              winRecorded.current = false;
              setGame(parseBlueprint(blueprint));
            }}
          >
            Replay
          </button>
        </div>
      ) : null}
    </div>
  );
}
