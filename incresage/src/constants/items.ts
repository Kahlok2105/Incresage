import type {
  ItemDropEntry,
  ItemTemplate,
  InventoryItem,
  InventoryConsumableItem,
  InventoryEquipmentItem
} from "../types/game";

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const isEquipmentTemplate = (template: ItemTemplate): template is Exclude<ItemTemplate, { type: 'material' | 'pill' | 'currency' }> => {
  return template.type === 'equipment';
};

export const ITEM_TEMPLATES: Record<string, ItemTemplate> = {
  spirit_stone: {
    id: 'spirit_stone',
    type: 'currency',
    name: 'Spirit Stone',
    rarity: 'common',
    description: 'The standard currency for cultivators.',
    stackable: true,
    icon: '✨'
  },
  tier_1_core: {
    id: 'tier_1_core',
    type: 'material',
    name: 'Low-Grade Monster Core',
    rarity: 'common',
    description: 'A crystallized essence from a minor spirit beast.',
    stackable: true,
    icon: '💎'
  },
  tier_2_core: {
    id: 'tier_2_core',
    type: 'material',
    name: 'Medium-Grade Monster Core',
    rarity: 'uncommon',
    description: 'A more potent crystallized essence from a mid-tier spirit beast.',
    stackable: true,
    icon: '💎'
  },
  tier_3_core: {
    id: 'tier_3_core',
    type: 'material',
    name: 'High-Grade Monster Core',
    rarity: 'rare',
    description: 'A highly concentrated essence from a high-tier spirit beast.',
    stackable: true,
    icon: '💎'
  },
  foundation_pill: {
    id: 'foundation_pill',
    type: 'pill',
    name: 'Foundation Establishment Pill',
    rarity: 'uncommon',
    description: 'Stabilizes the Qi flow during breakthrough attempts.',
    stackable: true,
    icon: '💊'
  },
  iron_sword: {
    id: 'iron_sword',
    type: 'equipment',
    name: 'Iron Sword',
    rarity: 'common',
    description: 'A basic sword for a traveling cultivator.',
    stackable: false,
    icon: '🗡️',
    slot: 'weapon',
    level: 1,
    stats: {
      attack: 10
    }
  },
  jade_pendant: {
    id: 'jade_pendant',
    type: 'equipment',
    name: 'Jade Pendant',
    rarity: 'rare',
    description: 'A pendant that clears the mind and accelerates growth.',
    stackable: false,
    icon: '📿',
    slot: 'accessory',
    level: 5,
    stats: {
      mentalGrowthMultiplier: {
        qi: 0.1,
        knowledge: 0.05
      }
    }
  },
  bronze_ring: {
    id: 'bronze_ring',
    type: 'equipment',
    name: 'Bronze Ring',
    rarity: 'uncommon',
    description: 'A simple ring that provides basic protection.',
    stackable: false,
    icon: '📿',
    slot: 'accessory',
    level: 5,
    stats: {
      defense: 5,
      vitality: 10,
      mentalGrowthMultiplier: {
        tenacity: 0.1
      }
    }
  }
};

export const createItemInstance = (
  templateId: string,
  quantity: number = 1
): InventoryItem => {
  const template = ITEM_TEMPLATES[templateId];
  const instanceId = crypto.randomUUID();

  if (!template) {
    throw new Error(`Unknown item template: ${templateId}`);
  }

  if (isEquipmentTemplate(template)) {
    return {
      ...template,
      instanceId,
      quantity: 1,
      isEquipped: false
    } as InventoryEquipmentItem;
  }

  return {
    ...template,
    instanceId,
    quantity
  } as InventoryConsumableItem;
};

export const resolveItemDrops = (dropTable: ItemDropEntry[]): InventoryItem[] => {
  return dropTable.flatMap((entry) => {
    if (Math.random() > entry.chance) {
      return [];
    }

    const amount = entry.quantity ??
      (entry.min !== undefined && entry.max !== undefined
        ? randomInt(entry.min, entry.max)
        : entry.min ?? 1);

    const template = ITEM_TEMPLATES[entry.itemId];
    if (!template) {
      return [];
    }

    if (isEquipmentTemplate(template)) {
      return Array.from({ length: amount }, () => createItemInstance(entry.itemId));
    }

    return [createItemInstance(entry.itemId, amount)];
  });
};
