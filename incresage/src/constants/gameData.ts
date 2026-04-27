import type { Monster } from "../types/game";
import { calculateMonsterExp, calculateMonsterTP } from "../utils/gameMath";

/**
 * Monster definitions for combat encounters
 * Each monster has HP, Attack, EXP reward, difficulty level, and drop table
 */
export const MONSTERS: Monster[] = [
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
      items: [{ itemId: 'tier_1_core', chance: 1, min: 1, max: 1 }]
    }
  },
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
      items: [{ itemId: 'tier_1_core', chance: 1, min: 1, max: 2 }]
    }
  },
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
      items: [{ itemId: 'tier_1_core', chance: 1, min: 1, max: 2 }]
    }
  },
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
      items: [
        { itemId: 'tier_1_core', chance: 1, min: 1, max: 2 },
        { itemId: 'foundation_pill', chance: 0.12, min: 1, max: 1 }
      ]
    }
  },
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
      items: [
        { itemId: 'tier_2_core', chance: 1, min: 1, max: 2 },
        { itemId: 'foundation_pill', chance: 0.2, min: 1, max: 1 }
      ]
    }
  },
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
      items: [
        { itemId: 'tier_2_core', chance: 1, min: 1, max: 2 },
        { itemId: 'iron_sword', chance: 0.08, min: 1, max: 1 }
      ]
    }
  },
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
      items: [
        { itemId: 'tier_2_core', chance: 1, min: 1, max: 3 },
        { itemId: 'bronze_ring', chance: 0.04, min: 1, max: 1 }
      ]
    }
  },
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
      items: [
        { itemId: 'tier_3_core', chance: 1, min: 1, max: 2 },
        { itemId: 'foundation_pill', chance: 0.25, min: 1, max: 1 }
      ]
    }
  },
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
      items: [
        { itemId: 'tier_3_core', chance: 1, min: 1, max: 2 },
        { itemId: 'jade_pendant', chance: 0.05, min: 1, max: 1 }
      ]
    }
  },
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
      items: [
        { itemId: 'tier_3_core', chance: 1, min: 2, max: 3 },
        { itemId: 'jade_pendant', chance: 0.12, min: 1, max: 1 }
      ]
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

/**
 * Starting battle techniques available to players.
 */
export const BATTLE_TECHNIQUES = [
  {
    id: "iron_skin_mantra",
    name: "Iron Skin Mantra",
    stat: "defense" as const,
    baseValue: 2,
    level: 0
  },
  {
    id: "tigers_breath",
    name: "Tiger's Breath",
    stat: "attack" as const,
    baseValue: 2,
    level: 0
  },
  {
    id: "boundless_heart",
    name: "Boundless Heart",
    stat: "vitality" as const,
    baseValue: 5,
    level: 0
  },
  {
    id: "spirit_refinement",
    name: "Spirit Refinement",
    stat: "spirit" as const,
    baseValue: 5,
    level: 0
  }
];