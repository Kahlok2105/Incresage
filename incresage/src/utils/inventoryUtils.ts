import type {
  ItemDropEntry,
  ItemTemplate,
  InventoryItem,
  InventoryConsumableItem,
  InventoryEquipmentItem
} from "../types/inventory";
import { ITEM_TEMPLATES } from "../constants/items";

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const isEquipmentTemplate = (template: ItemTemplate): template is Exclude<ItemTemplate, { type: 'material' | 'pill' | 'currency' }> => {
  return template.type === 'equipment';
};

/**
 * Create a new inventory item instance from a template ID
 */
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

/**
 * Resolve item drops from a drop table
 */
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

/**
 * Merge new items into existing inventory stack
 */
export const mergeInventoryItems = (existingInventory: InventoryItem[], newItems: InventoryItem[]): InventoryItem[] => {
  const merged = [...existingInventory];

  newItems.forEach(newItem => {
    if (!newItem.stackable) {
      merged.push(newItem);
      return;
    }

    const existingIndex = merged.findIndex(item =>
      item.id === newItem.id &&
      item.stackable
    );

    if (existingIndex !== -1) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        quantity: merged[existingIndex].quantity + newItem.quantity
      };
    } else {
      merged.push(newItem);
    }
  });

  return merged;
};