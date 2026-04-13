import type { Realm } from "../types/game";

/**
 * Pre‑defined cultivation realms. The order of the array defines the progression
 * – the player's `currentRealmIndex` points to an element in this list.
 */
export const REALMS: Realm[] = [
  { id: "mortal", name: "Mortal", qiRequired: 100, stonesRequired: 0, qiGainMultiplier: 1, qiCap: 100 },
  { id: "qi_condensation", name: "Qi Condensation", qiRequired: 1_000, stonesRequired: 50, qiGainMultiplier: 2, qiCap: 1_000 },
  { id: "foundation", name: "Foundation Establishment", qiRequired: 10_000, stonesRequired: 500, qiGainMultiplier: 5, qiCap: 10_000 },
  // Additional realms can be added here following the same shape
];

/**
 * Simple monster definition used for combat encounters.
 */
export interface Monster {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Base spirit stone reward on defeat */
  stoneReward: number;
  /** Difficulty multiplier that can affect success chance */
  difficulty: number;
}

/** Example monster pool – in a real game this could be loaded from a JSON file */
export const MONSTERS: Monster[] = [
  { id: "spirit_wisp", name: "Spirit Wisp", stoneReward: 5, difficulty: 1 },
  { id: "earth_golem", name: "Earth Golem", stoneReward: 20, difficulty: 2 },
  { id: "celestial_beast", name: "Celestial Beast", stoneReward: 100, difficulty: 5 },
];

