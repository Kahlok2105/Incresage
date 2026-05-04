import type { InventoryItem } from "../../types/game";

interface InventoryPanelProps {
  inventory: InventoryItem[];
  onItemClick?: (item: InventoryItem) => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory, onItemClick }) => {
  const sortedItems = [...inventory]
  .filter(item => !(item.type === 'equipment' && item.isEquipped))
  .sort((a, b) => {
    if (a.rarity !== b.rarity) {
      const order = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
      return order.indexOf(a.rarity) - order.indexOf(b.rarity);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <section className="inventory-panel">
      <div className="inventory-header">
        <h2>Inventory</h2>
        <p>Your items are arranged in a responsive grid. Click consumables to use them or equipment to equip / unequip.</p>
      </div>

      {sortedItems.length === 0 ? (
        <p className="inventory-empty">Your inventory is empty. Defeat monsters or gather materials to fill it.</p>
      ) : (
        <div className="inventory-grid">
          {sortedItems.map((item) => (
            <button
              key={item.instanceId}
              type="button"
              className={`inventory-tile ${item.type === 'equipment' && item.isEquipped ? 'equipped' : ''}`}
              onClick={() => onItemClick?.(item)}
              title={`${item.name}\n${item.description}`}
            >
              <div className="inventory-icon">{item.icon}</div>
              <div className="inventory-name">{item.name}</div>
              <div className="inventory-meta">
                <span>{item.rarity}</span>
                <span>{item.type}</span>
              </div>
              {item.quantity > 1 && <span className="inventory-quantity">x{item.quantity}</span>}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
