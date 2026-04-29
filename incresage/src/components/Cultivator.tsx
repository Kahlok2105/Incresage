import { useState, useEffect } from "react";
import type { InventoryItem, InventoryEquipmentItem } from "../types/game";
import { PlayerStatsPanel } from "./PlayerStatsPanel";
import { EquipmentPanel } from "./EquipmentPanel.tsx";

type CultivatorTabId = "stats" | "equipment";

/**
 * Tabbed container for player stats and equipped items.
 * Uses EXACT same tab system pattern and CSS as main App tabs.
 */
export const Cultivator: React.FC<{
  vitality: number;
  vitalityCap: number;
  spirit: number;
  spiritCap: number;
  attack: number;
  defense: number;
  knowledge: number;
  curiosity: number;
  tenacity: number;
  lifespan: number;
  maxLifespan: number;
  spiritStones: number;
  inventory: InventoryItem[];
  onToggleEquip?: (instanceId: string) => void;
}> = ({
  vitality,
  vitalityCap,
  spirit,
  spiritCap,
  attack,
  defense,
  knowledge,
  curiosity,
  tenacity,
  lifespan,
  maxLifespan,
  spiritStones,
  inventory,
  onToggleEquip
}) => {
  const [selectedTab, setSelectedTab] = useState<CultivatorTabId>("stats");

  const tabs = [
    { id: "stats" as CultivatorTabId, label: "Stats", visible: true },
    { id: "equipment" as CultivatorTabId, label: "Equipment", visible: true }
  ];

  const visibleTabs = tabs.filter((tab) => tab.visible);
  const visibleTabIds = visibleTabs.map((tab) => tab.id).join(",");

  const equippedItems = inventory.filter(
    (item): item is InventoryEquipmentItem => item.type === "equipment" && item.isEquipped
  );

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.id === selectedTab)) {
      setSelectedTab(visibleTabs[0]?.id ?? "stats");
    }
  }, [selectedTab, visibleTabIds, visibleTabs]);

  return (
    <div className="tab-shell">
      <div className="tab-bar">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button ${selectedTab === tab.id ? "active" : ""}`}
            onClick={() => setSelectedTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {selectedTab === "stats" && (
          <PlayerStatsPanel
            vitality={vitality}
            vitalityCap={vitalityCap}
            spirit={spirit}
            spiritCap={spiritCap}
            attack={attack}
            defense={defense}
            knowledge={knowledge}
            curiosity={curiosity}
            tenacity={tenacity}
            lifespan={lifespan}
            maxLifespan={maxLifespan}
            spiritStones={spiritStones}
          />
        )}

        {selectedTab === "equipment" && (
          <EquipmentPanel equippedItems={equippedItems} onToggleEquip={onToggleEquip} />
        )}
      </div>
    </div>
  );
};