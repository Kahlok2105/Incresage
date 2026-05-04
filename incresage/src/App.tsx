// React import removed; JSX runtime handles it automatically.
import "./App.css";
import { useGameLoop } from "./hooks/useGameLoop";
import { MeditationPanel } from "./features/cultivation/MeditationPanel";
import { CombatSystem } from "./features/combat/CombatSystem";
import { AlchemyPanel } from "./features/alchemy/AlchemyPanel";
import { BodyCultivationPanel } from "./features/cultivation/BodyCultivationPanel";
import { QiCultivationPanel } from "./features/cultivation/QiCultivationPanel";
import { Cultivator } from "./components/Cultivator";
import { InventoryPanel } from "./features/inventory/InventoryPanel";
import { UnlockToast } from "./components/UnlockToast";
import { NotificationContainer } from "./components/NotificationContainer";
import { WelcomeModal } from "./components/WelcomeModal";
import { BattleTechniquesPanel } from "./features/upgrades/BattleTechniquesPanel";
import { useNotifications } from "./hooks/useNotifications";
import { useState, useEffect } from "react";

type TabId = "cultivation" | "combat" | "battle" | "alchemy";

/** Root component that wires the game loop and UI controls together. */
export default function App() {
  const {
    state,
    resetGame,
    tryBreakthrough,
    processMonsterVictory,
    usableQi,
    totalQi,
    setActiveMeditation,
    getCurrentMeditationStats,
    meditationTypes,
    activeMeditationId,
    welcomeData,
    clearWelcomeData,
    tryBodyBreakthrough,
    calculateBodyBreakthroughChance,
    getBodyStageIndex,
    totalAttack,
    totalDefense,
    totalVitality,
    totalSpirit,
    battleTechniques,
    upgradeBattleTechnique,
    useInventoryItem,
    toggleEquipItem
  } = useGameLoop();

  // Notification system
  const { notifications, showSuccess, showFailure, dismissNotification } = useNotifications();

  const [selectedTab, setSelectedTab] = useState<TabId>("cultivation");

  const tabs = [
    { id: "cultivation" as TabId, label: "Cultivation", visible: true },
    { id: "combat" as TabId, label: "Combat", visible: state.unlockedFeatures.includes("monster") },
    { id: "battle" as TabId, label: "Upgrades", visible: true },
    { id: "alchemy" as TabId, label: "Alchemy", visible: state.unlockedFeatures.includes("alchemy") }
  ];

  const visibleTabs = tabs.filter((tab) => tab.visible);
  const visibleTabIds = visibleTabs.map((tab) => tab.id).join(",");

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.id === selectedTab)) {
      setSelectedTab(visibleTabs[0]?.id ?? "cultivation");
    }
  }, [selectedTab, visibleTabIds, visibleTabs]);


  return (
    <div className="app">
        <div style={{ textAlign: 'right', padding: '8px 16px' }}>
          <button onClick={resetGame} style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}>
            🔄 Reset Game
          </button>
        </div>
        <header className="status-panel">
            <Cultivator
              vitality={totalVitality}
              vitalityCap={state.vitalityCap}
              spirit={totalSpirit}
              spiritCap={state.spiritCap}
              attack={totalAttack}
              defense={totalDefense}
              knowledge={state.knowledge}
              curiosity={state.curiosity}
              tenacity={state.tenacity}
              lifespan={state.lifespan}
              maxLifespan={state.maxLifespan}
              spiritStones={state.spiritStones}
              inventory={state.inventory.filter(item => !(item.type === 'equipment' && item.isEquipped))}
              onToggleEquip={toggleEquipItem}
            />
        </header>
        <main className="game-panel">
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
              {selectedTab === "cultivation" && (
                <>
                  <div className="cultivation-section">
                    <QiCultivationPanel
                      state={state}
                      tryBreakthrough={() => {
                        const success = tryBreakthrough();
                        if (success) {
                          showSuccess("🎉 Breakthrough Successful! Welcome to the next realm!");
                        } else {
                          showFailure("⚠️ Breakthrough Failed! You lost 50% of your Qi.");
                        }
                        return { success };
                      }}
                      usableQi={usableQi}
                      totalQi={totalQi}
                    />
                    <BodyCultivationPanel
                      state={state}
                      tryBodyBreakthrough={() => {
                        const success = tryBodyBreakthrough();
                        const chance = calculateBodyBreakthroughChance();
                        if (success) {
                          showSuccess("🎉 Body Breakthrough Successful! Your physique has advanced!");
                        } else if (chance > 0) {
                          showFailure("⚠️ Body Breakthrough Failed! You lost 30% tenacity and 1 body level.");
                        }
                        return { success, chance };
                      }}
                      calculateBodyBreakthroughChance={calculateBodyBreakthroughChance}
                      getBodyStageIndex={getBodyStageIndex}
                    />
                  </div>
                  <MeditationPanel
                  meditationTypes={meditationTypes}
                  activeMeditationId={activeMeditationId}
                  setActiveMeditation={setActiveMeditation}
                  getCurrentMeditationStats={getCurrentMeditationStats}
                />
              </>
            )}

            {selectedTab === "combat" && (
              <>
                {state.unlockedFeatures.includes("monster") && (
                  <CombatSystem
                    playerAttack={totalAttack}
                    playerDefense={totalDefense}
                    onVictory={processMonsterVictory}
                    playerVitality={totalVitality}
                    playerVitalityCap={state.vitalityCap}
                    defeatedMonsters={state.defeatedMonsters}
                  />
                )}
                <InventoryPanel inventory={state.inventory} onItemClick={(item) => useInventoryItem(item.instanceId)} />
              </>
            )}

            {selectedTab === "battle" && (
              <BattleTechniquesPanel
                battleTechniques={battleTechniques}
                upgradeBattleTechnique={upgradeBattleTechnique}
                spiritStones={state.spiritStones}
                bodyLevel={state.bodyLevel}
              />
            )}

            {selectedTab === "alchemy" && state.unlockedFeatures.includes("alchemy") && (
              <AlchemyPanel />
            )}
          </div>
        </div>

          {/* Unlock toast notification */}
          <UnlockToast unlockedFeatures={state.unlockedFeatures} />
        </main>
        {/* Welcome back modal */}
        {welcomeData?.showModal && (
          <WelcomeModal
            secondsAway={welcomeData.secondsAway}
            totalQiGained={welcomeData.totalQiGained}
            statsGained={welcomeData.statsGained}
            onClose={clearWelcomeData}
          />
        )}

        {/* Global notification container */}
        <NotificationContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
    </div>
  );
}