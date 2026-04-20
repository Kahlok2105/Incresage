import type { Monster, MonsterCore } from "../types/game";
import { calculateMonsterExp, calculateMonsterTP } from "../utils/gameMath";

/**
 * Monster definitions for combat encounters
 * Each monster has HP, Attack, EXP reward, difficulty level, and drop table
 */
export const MONSTERS: Monster[] = [
  // Difficulty 1 - Starter mob
  {
    id: "spirit_wisp",
    name: "Spirit Wisp",
    hp: 50,
    attack: 5,
    expReward: calculateMonsterExp(1),
    difficulty: 1,
    tpReward: calculateMonsterTP(1),
    drops: {
      spiritStones: 5,
      monsterCores: [{ tier: 1, amount: 1 }] as MonsterCore[]
    }
  },
  // Difficulty 2
  {
    id: "forest_wolf",
    name: "Forest Wolf",
    hp: 100,
    attack: 10,
    expReward: calculateMonsterExp(2),
    difficulty: 2,
    tpReward: calculateMonsterTP(2),
    drops: {
      spiritStones: 10,
      monsterCores: [{ tier: 1, amount: 1 }] as MonsterCore[]
    }
  },
  // Difficulty 3
  {
    id: "earth_golem",
    name: "Earth Golem",
    hp: 200,
    attack: 15,
    expReward: calculateMonsterExp(3),
    difficulty: 3,
    tpReward: calculateMonsterTP(3),
    drops: {
      spiritStones: 15,
      monsterCores: [{ tier: 1, amount: 1 }] as MonsterCore[]
    }
  },
  // Difficulty 4
  {
    id: "fire_imp",
    name: "Fire Imp",
    hp: 150,
    attack: 25,
    expReward: calculateMonsterExp(4),
    difficulty: 4,
    tpReward: calculateMonsterTP(4),
    drops: {
      spiritStones: 20,
      monsterCores: [{ tier: 1, amount: 1 }] as MonsterCore[]
    }
  },
  // Difficulty 5
  {
    id: "shadow_stalker",
    name: "Shadow Stalker",
    hp: 300,
    attack: 30,
    expReward: calculateMonsterExp(5),
    difficulty: 5,
    tpReward: calculateMonsterTP(5),
    drops: {
      spiritStones: 30,
      monsterCores: [{ tier: 1, amount: 1 }] as MonsterCore[]
    }
  },
  // Difficulty 6
  {
    id: "rock_elemental",
    name: "Rock Elemental",
    hp: 500,
    attack: 35,
    expReward: calculateMonsterExp(6),
    difficulty: 6,
    tpReward: calculateMonsterTP(6),
    drops: {
      spiritStones: 40,
      monsterCores: [{ tier: 1, amount: 1 }] as MonsterCore[]
    }
  },
  // Difficulty 7
  {
    id: "wind_spirit",
    name: "Wind Spirit",
    hp: 400,
    attack: 50,
    expReward: calculateMonsterExp(7),
    difficulty: 7,
    tpReward: calculateMonsterTP(7),
    drops: {
      spiritStones: 50,
      monsterCores: [{ tier: 1, amount: 1 }] as MonsterCore[]
    }
  },
  // Difficulty 8
  {
    id: "ice_golem",
    name: "Ice Golem",
    hp: 800,
    attack: 60,
    expReward: calculateMonsterExp(8),
    difficulty: 8,
    tpReward: calculateMonsterTP(8),
    drops: {
      spiritStones: 75,
      monsterCores: [{ tier: 1, amount: 1 }] as MonsterCore[]
    }
  },
  // Difficulty 9
  {
    id: "thunder_beast",
    name: "Thunder Beast",
    hp: 700,
    attack: 80,
    expReward: calculateMonsterExp(9),
    difficulty: 9,
    tpReward: calculateMonsterTP(9),
    drops: {
      spiritStones: 100,
      monsterCores: [{ tier: 1, amount: 1 }] as MonsterCore[]
    }
  },
  // Difficulty 10 - Elite mob
  {
    id: "ancient_guardian",
    name: "Ancient Guardian",
    hp: 1200,
    attack: 100,
    expReward: calculateMonsterExp(10),
    difficulty: 10,
    tpReward: calculateMonsterTP(10),
    drops: {
      spiritStones: 150,
      monsterCores: [{ tier: 1, amount: 2 }] as MonsterCore[]
    }
  }
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