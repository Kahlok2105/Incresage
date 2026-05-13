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

/**
 * Tracks lifetime achievements for reincarnation summary.
 */
export interface LifetimeStats {
  totalLifespanLived: number;
  highestQiRealm: number;
  highestBodyRealm: number;
  totalMonstersDefeated: number;
  totalQiBreakthroughs: number;
  totalBodyBreakthroughs: number;
}

/**
 * Data shown in the reincarnation modal.
 */
export interface ReincarnationSummary {
  lifeNumber: number;
  lifespanLived: number;
  highestQiRealm: number;
  highestBodyRealm: number;
  totalMonstersDefeated: number;
  totalQiBreakthroughs: number;
  totalBodyBreakthroughs: number;
  righteousKarmaGained: number;
  demonicKarmaGained: number;
  memoriesGained: number;
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
  totalTenacityEarned: number;
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

  // --- Reincarnation System ---
  righteousKarma: number;
  demonicKarma: number;
  memories: number;
  reincarnationCount: number;
  showReincarnationModal: boolean;
  reincarnationSummary: ReincarnationSummary | null;
  lifetimeStats: LifetimeStats;
  monsterKarmaEarned: Record<string, number>; // monsterId -> demonic karma earned this life
}