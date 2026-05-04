// Types for the cultivation game

export type { InventoryItem, InventoryEquipmentItem } from './inventory';
import type { InventoryItem } from './inventory';

/**
 * Represents a cultivation realm.
 */
export interface CultivationRealm {
  id: string;
  name: string;
  stage: number;
  displayName: string;
  qiRequired: number;
  qiCap: number;
  gainMultiplier: number;
  baseSuccessRate: number;
}

export type CultivationType = 'qi' | 'body';

/**
 * Meditation type definition.
 */
export interface MeditationType {
  id: string;
  name: string;
  baseCuriosity: number;
  baseTenacity: number;
  baseQi: number;
  baseKnowledge: number;
  level: number;
  currentExp: number;
  expToNextLevel: number;
  maxLevel: number;
}

/**
 * Battle technique definition.
 */
export interface BattleTechnique {
  id: string;
  name: string;
  stat: 'attack' | 'defense' | 'vitality' | 'spirit';
  baseValue: number;
  level: number;
}

export interface PlayerState {
  qi: number;
  spiritStones: number;
  currentQiRealmIndex: number;
  currentQiStage: number;
  currentBodyRealmIndex: number;
  currentBodyStage: number;
  lastUpdate: number;
  lastActive: number;
  vitality: number;
  spirit: number;
  vitalityCap: number;
  spiritCap: number;
  attack: number;
  defense: number;
  knowledge: number;
  curiosity: number;
  tenacity: number;
  lifespan: number;
  maxLifespan: number;
  unlockedFeatures: string[];
  meditationTypes: MeditationType[];
  battleTechniques: BattleTechnique[];
  activeMeditationId: string | null;
  bodyExp: number;
  bodyLevel: number;
  tribulationPoints: number;
  defeatedMonsters: string[];
  inventory: InventoryItem[];
}
