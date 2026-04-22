export type Direction = "up" | "down" | "left" | "right";

export type Tile =
  | "floor"
  | "wall"
  | "shard"
  | "hazard"
  | "barrier"
  | "portal";

export type LevelBlueprint = {
  id: number;
  name: string;
  /** Accent hue 0–360 for visual variety */
  hue: number;
  rows: string[];
};

export type GameStatus = "playing" | "won" | "lost";

export type GameState = {
  width: number;
  height: number;
  player: { x: number; y: number };
  grid: Tile[][];
  shardsTotal: number;
  shardsCollected: number;
  evolved: boolean;
  status: GameStatus;
};
