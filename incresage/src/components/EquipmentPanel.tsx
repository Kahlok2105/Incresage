import type { InventoryEquipmentItem } from "../types/game";

interface EquipmentPanelProps {
  equippedItems: InventoryEquipmentItem[];
  onToggleEquip?: (instanceId: string) => void;
}

const renderSlot = (
  label: string,
  item: InventoryEquipmentItem | undefined,
  onToggleEquip?: (instanceId: string) => void
) => {
  const isEmpty = !item;
  return (
    <button
      type="button"
      className={`equipment-slot ${isEmpty ? "empty" : "filled"}`}
      onClick={() => item && onToggleEquip?.(item.instanceId)}
      disabled={!item}
      title={item ? `${item.name}\n${item.description}` : `Empty ${label} slot`}
    >
      <div className="slot-label">{label}</div>
      {item ? (
        <>
          <div className="slot-icon">{item.icon}</div>
          <div className="slot-name">{item.name}</div>
          <div className="slot-detail">Lvl {item.level}</div>
        </>
      ) : (
        <div className="slot-empty">Empty</div>
      )}
    </button>
  );
};

export const EquipmentPanel: React.FC<EquipmentPanelProps> = ({ equippedItems, onToggleEquip }) => {
  const accessoryItems = equippedItems.filter((item) => item.slot === "accessory");
  const accessorySlots = Array.from({ length: 4 }, (_, index) => accessoryItems[index]);

  return (
    <section className="equipment-panel">
      <div className="equipment-header">
        <h2>Equipped Gear</h2>
        <p>Choose any equipped item to unequip it. Accessory slots may hold up to 4 items.</p>
      </div>

      <div className="equipment-layout">
        <div className="equipment-column">
          {renderSlot("Head Gear", equippedItems.find((item) => item.slot === "head"), onToggleEquip)}
          {renderSlot("Body", equippedItems.find((item) => item.slot === "body"), onToggleEquip)}
          {renderSlot("Gloves", equippedItems.find((item) => item.slot === "gloves"), onToggleEquip)}
        </div>

        <div className="equipment-avatar">
          <div className="avatar-shell">
            <div className="avatar-head" />
            <div className="avatar-neck" />
            <div className="avatar-torso" />
            <div className="avatar-hips" />
            <div className="avatar-legs" />
          </div>
        </div>

        <div className="equipment-column">
          {renderSlot("Weapon", equippedItems.find((item) => item.slot === "weapon"), onToggleEquip)}
          {renderSlot("Offhand", equippedItems.find((item) => item.slot === "offhand"), onToggleEquip)}
          {renderSlot("Shoes", equippedItems.find((item) => item.slot === "shoes"), onToggleEquip)}
        </div>
      </div>

      <div className="equipment-accessory-row">
        {accessorySlots.map((item, index) => (
          <div key={`accessory-${index}`} className="equipment-accessory-slot">
            {renderSlot(`Accessory ${index + 1}`, item, onToggleEquip)}
          </div>
        ))}
      </div>
    </section>
  );
};
