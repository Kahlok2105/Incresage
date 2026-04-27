// Types for the cultivation game

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

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'material' | 'pill' | 'currency' | 'equipment';
export type ItemSlot = 'weapon' | 'armor' | 'accessory';

export interface ItemStats {
  vitality?: number;
  spirit?: number;
  attack?: number;
  defense?: number;
  mentalGrowthMultiplier?: {
    tenacity?: number;
    curiosity?: number;
    knowledge?: number;
    qi?: number;
  };
}

export interface ItemTemplateBase {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  rarity: ItemRarity;
  icon: string;
  stackable: boolean;
}

export interface ConsumableTemplate extends ItemTemplateBase {
  type: 'material' | 'pill' | 'currency';
  effectId?: string;
}

export interface EquipmentTemplate extends ItemTemplateBase {
  type: 'equipment';
  slot: ItemSlot;
  level: number;
  stats: ItemStats;
}

export type ItemTemplate = ConsumableTemplate | EquipmentTemplate;

export interface InventoryItemBase extends ItemTemplateBase {
  instanceId: string;
  quantity: number;
}

export interface InventoryConsumableItem extends InventoryItemBase {
  type: 'material' | 'pill' | 'currency';
  effectId?: string;
}

export interface InventoryEquipmentItem extends InventoryItemBase {
  type: 'equipment';
  slot: ItemSlot;
  level: number;
  stats: ItemStats;
  isEquipped: boolean;
}

export type InventoryItem = InventoryConsumableItem | InventoryEquipmentItem;

export interface ItemDropEntry {
  itemId: string;
  chance: number; // 0-1 probability
  min?: number;
  max?: number;
  quantity?: number;
}

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
