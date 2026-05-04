import type { BattleTechnique } from "../types/game";

/**
 * Starting battle techniques available to players.
 */
export const BATTLE_TECHNIQUES: BattleTechnique[] = [
  {
    id: "iron_skin_mantra",
    name: "Iron Skin Mantra",
    stat: "defense",
    baseValue: 2,
    level: 0
  },
  {
    id: "tigers_breath",
    name: "Tiger's Breath",
    stat: "attack",
    baseValue: 2,
    level: 0
  },
  {
    id: "boundless_heart",
    name: "Boundless Heart",
    stat: "vitality",
    baseValue: 5,
    level: 0
  },
  {
    id: "spirit_refinement",
    name: "Spirit Refinement",
    stat: "spirit",
    baseValue: 5,
    level: 0
  }
];