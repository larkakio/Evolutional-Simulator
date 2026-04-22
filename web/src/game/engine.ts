import type { Direction, GameState, LevelBlueprint, Tile } from "@/game/types";

const CHAR_MAP: Record<string, Tile | "player"> = {
  "#": "wall",
  ".": "floor",
  p: "player",
  s: "shard",
  x: "hazard",
  b: "barrier",
  o: "portal",
};

export function parseBlueprint(bp: LevelBlueprint): GameState {
  const height = bp.rows.length;
  const width = bp.rows[0]?.length ?? 0;
  let px = 0;
  let py = 0;
  let shardsTotal = 0;
  const grid: Tile[][] = [];

  for (let y = 0; y < height; y++) {
    const row = bp.rows[y]!;
    const line: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const ch = row[x] ?? ".";
      const t = CHAR_MAP[ch] ?? "floor";
      if (t === "player") {
        px = x;
        py = y;
        line.push("floor");
      } else {
        if (t === "shard") shardsTotal++;
        line.push(t);
      }
    }
    grid.push(line);
  }

  return {
    width,
    height,
    player: { x: px, y: py },
    grid,
    shardsTotal,
    shardsCollected: 0,
    evolved: false,
    status: "playing",
  };
}

function dirDelta(d: Direction): { dx: number; dy: number } {
  switch (d) {
    case "up":
      return { dx: 0, dy: -1 };
    case "down":
      return { dx: 0, dy: 1 };
    case "left":
      return { dx: -1, dy: 0 };
    case "right":
      return { dx: 1, dy: 0 };
  }
}

function tileAt(g: GameState, x: number, y: number): Tile | undefined {
  if (x < 0 || y < 0 || x >= g.width || y >= g.height) return undefined;
  return g.grid[y]![x]!;
}

function setTile(g: GameState, x: number, y: number, t: Tile) {
  g.grid[y]![x] = t;
}

export function movePlayer(state: GameState, direction: Direction): GameState {
  if (state.status !== "playing") return state;

  const next: GameState = structuredClone(state);
  const { dx, dy } = dirDelta(direction);
  const nx = next.player.x + dx;
  const ny = next.player.y + dy;
  const target = tileAt(next, nx, ny);

  if (target === undefined || target === "wall") {
    return next;
  }

  if (target === "barrier" && !next.evolved) {
    return next;
  }

  if (target === "hazard") {
    next.status = "lost";
    return next;
  }

  next.player = { x: nx, y: ny };

  if (target === "shard") {
    setTile(next, nx, ny, "floor");
    next.shardsCollected += 1;
    if (next.shardsCollected >= next.shardsTotal) {
      next.evolved = true;
    }
  }

  if (target === "portal") {
    if (next.evolved) {
      next.status = "won";
    }
  }

  return next;
}
