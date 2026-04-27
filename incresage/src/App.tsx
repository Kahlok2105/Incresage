// React import removed; JSX runtime handles it automatically.
import "./App.css";
import { useGameLoop } from "./hooks/useGameLoop";
import { MeditationPanel } from "./components/MeditationPanel";
import { CombatSystem } from "./components/CombatSystem";
import { AlchemyPanel } from "./components/AlchemyPanel";
import { BodyCultivationPanel } from "./components/BodyCultivationPanel";
import { QiCultivationPanel } from "./components/QiCultivationPanel";
import { PlayerStatsPanel } from "./components/PlayerStatsPanel";
import { InventoryPanel } from "./components/InventoryPanel";
import { UnlockToast } from "./components/UnlockToast";
import { NotificationContainer } from "./components/NotificationContainer";
import { WelcomeModal } from "./components/WelcomeModal";
import { BattleTechniquesPanel } from "./components/BattleTechniquesPanel";
import { useNotifications } from "./hooks/useNotifications";
import { useEffect, useState } from "react";

type TabId = "cultivation" | "combat" | "battle" | "alchemy";

/** Root component that wires the game loop and UI controls together. */
export default function App() {
  const {
    state,
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
    upgradeBattleTechnique
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

  // Track the most recently unlocked feature to show a toast notification.
  const [lastFeature, setLastFeature] = useState<string | null>(null);
  useEffect(() => {
    // When unlockedFeatures length increases, capture the newly added feature.
    const features = state.unlockedFeatures;
    if (features.length) {
      const stored = (lastFeature && features.includes(lastFeature)) ? lastFeature : null;
      if (!stored) {
        // Assume the last element is the newest unlock.
        setLastFeature(features[features.length - 1]);
      }
    }
  }, [state.unlockedFeatures]);


  return (
    <div className="app">
        <header className="status-panel">
            <PlayerStatsPanel
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
                        const result = tryBreakthrough();
                        if (result.success) {
                          showSuccess("🎉 Breakthrough Successful! Welcome to the next realm!");
                        } else {
                          showFailure("⚠️ Breakthrough Failed! You lost 50% of your Qi.");
                        }
                        return result;
                      }}
                      usableQi={usableQi}
                      totalQi={totalQi}
                    />
                  <BodyCultivationPanel
                    state={state}
                    tryBodyBreakthrough={() => {
                      const result = tryBodyBreakthrough();
                      if (result.success) {
                        showSuccess("🎉 Body Breakthrough Successful! Your physique has advanced!");
                      } else if (result.chance > 0) {
                        showFailure("⚠️ Body Breakthrough Failed! You lost 30% tenacity and 1 body level.");
                      }
                      return result;
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
                  />
                )}
                <InventoryPanel inventory={state.inventory} />
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
          <UnlockToast feature={lastFeature} />
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