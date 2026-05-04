// Inventory and Item related types

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'material' | 'pill' | 'currency' | 'equipment';
export type ItemSlot = 'weapon' | 'armor' | 'accessory' | 'head' | 'body' | 'gloves' | 'shoes' | 'offhand';

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