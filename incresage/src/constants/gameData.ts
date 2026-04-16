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

/**
 * Starting meditation types available to players.
 */
export const MEDITATION_TYPES = [
  {
    id: "explore_surroundings",
    name: "Explore Surroundings",
    baseCuriosity: 1,
    baseTenacity: 0,
    baseQi: 1,
    baseKnowledge: 0,
    level: 1,
    currentExp: 0,
    expToNextLevel: 100,
    maxLevel: 100
  },
  {
    id: "explore_self",
    name: "Explore Self",
    baseCuriosity: 0,
    baseTenacity: 1,
    baseQi: 1,
    baseKnowledge: 0,
    level: 1,
    currentExp: 0,
    expToNextLevel: 100,
    maxLevel: 100
  },
  {
    id: "focus_mind",
    name: "Focus on Mind",
    baseCuriosity: 0,
    baseTenacity: 0,
    baseQi: 1,
    baseKnowledge: 1,
    level: 1,
    currentExp: 0,
    expToNextLevel: 100,
    maxLevel: 100
  }
];