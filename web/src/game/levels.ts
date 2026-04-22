import type { LevelBlueprint } from "@/game/types";

/** Legend: # wall, . floor, p start, s shard, x hazard, b barrier, o portal */
export const LEVELS: LevelBlueprint[] = [
  {
    id: 1,
    name: "Primordial Soup",
    hue: 175,
    rows: [
      "#####",
      "#p..#",
      "#ss.#",
      "#..o#",
      "#####",
    ],
  },
  {
    id: 2,
    name: "Voltage Marsh",
    hue: 300,
    rows: [
      "#######",
      "#p....#",
      "#.x.s.#",
      "#...s.#",
      "#..o..#",
      "#######",
    ],
  },
  {
    id: 3,
    name: "Chrome Hive",
    hue: 130,
    rows: [
      "#########",
      "#p......#",
      "#..s.s..#",
      "#..b.b..#",
      "#...s...#",
      "#....o..#",
      "#########",
    ],
  },
  {
    id: 4,
    name: "Neon Depths",
    hue: 265,
    rows: [
      "###########",
      "#p........#",
      "#.x...x...#",
      "#..s.b.s..#",
      "#...x.x...#",
      "#....s....#",
      "#.....o...#",
      "###########",
    ],
  },
  {
    id: 5,
    name: "Singularity",
    hue: 45,
    rows: [
      "#############",
      "#p..........#",
      "#.x.s.x.s.x.#",
      "#..b.....b..#",
      "#.s.x.s.x.s.#",
      "#..b.....b..#",
      "#....s.s....#",
      "#......o....#",
      "#############",
    ],
  },
];
