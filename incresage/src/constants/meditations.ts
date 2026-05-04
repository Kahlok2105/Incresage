import type { MeditationType } from "../types/game";

/**
 * Starting meditation types available to players.
 */
export const MEDITATION_TYPES: MeditationType[] = [
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