import type { PlayerState } from "../types/game";
import type { InventoryItem } from "../types/inventory";
import { mergeInventoryItems } from "../utils/inventoryUtils";

export function useInventory(
  _state: PlayerState,
  setState: React.Dispatch<React.SetStateAction<PlayerState>>
) {

  const addInventoryItems = (items: InventoryItem[]) => {
    setState(prev => ({
      ...prev,
      inventory: mergeInventoryItems(prev.inventory, items)
    }));
  };

  const useInventoryItem = (itemId: string, quantity: number = 1) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          quantity: Math.max(0, item.quantity - quantity)
        };
      }).filter(item => item.quantity > 0)
    }));
  };

  const toggleEquipItem = (instanceId: string) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => {
        if (item.instanceId !== instanceId) return item;
        if (item.type !== 'equipment') return item;

        return {
          ...item,
          isEquipped: !item.isEquipped
        };
      })
    }));
  };

  return {
    mergeInventoryItems,
    addInventoryItems,
    useInventoryItem,
    toggleEquipItem
  };
}