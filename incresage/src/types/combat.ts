// Combat related types

import type {ItemDropEntry } from "./inventory";

export interface MonsterDrops {
  spiritStones: number;
  items?: ItemDropEntry[];
}

export interface Monster {
  id: string;
  name: string;
  hp: number;
  attack: number;
  expReward: number;
  difficulty: number;
  tpReward: number;
  drops: MonsterDrops;
}

export interface CombatState {
  isActive: boolean;
  monster: Monster | null;
  playerHP: number;
  monsterHP: number;
  log: string[];
  isPlayerTurn: boolean;
}