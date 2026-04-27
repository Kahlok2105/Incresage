import type { InventoryItem } from "../types/game";

interface InventoryPanelProps {
  inventory: InventoryItem[];
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory }) => {
  const sortedItems = [...inventory].sort((a, b) => {
    if (a.rarity !== b.rarity) {
      const order = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
      return order.indexOf(a.rarity) - order.indexOf(b.rarity);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <section className="inventory-panel" style={{
      padding: '16px',
      borderRadius: '12px',
      border: '2px solid #7f5af0',
      background: 'linear-gradient(180deg, rgba(22, 22, 39, 0.96), rgba(15, 15, 31, 0.94))',
      color: '#f7f4ff',
      width: '100%',
      boxSizing: 'border-box',
      marginTop: '16px'
    }}>
      <h2 style={{ marginBottom: '12px', color: '#c084fc' }}>Inventory</h2>
      {sortedItems.length === 0 ? (
        <p style={{ margin: 0, lineHeight: 1.6 }}>Your inventory is empty. Defeat monsters or gather materials to fill it.</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {sortedItems.map((item) => (
            <div
              key={item.instanceId}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px minmax(0, 1fr) auto',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)'
              }}
            >
              <div style={{ fontSize: '1.4rem' }}>{item.icon}</div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                  <span style={{ opacity: 0.8 }}>x{item.quantity}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem', opacity: 0.8 }}>
                  <span>{item.type}</span>
                  <span>{item.rarity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
