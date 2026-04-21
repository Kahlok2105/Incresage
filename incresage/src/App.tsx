// React import removed; JSX runtime handles it automatically.
import "./App.css";
import { useGameLoop } from "./hooks/useGameLoop";
import { MeditationPanel } from "./components/MeditationPanel";
import { CombatSystem } from "./components/CombatSystem";
import { AlchemyPanel } from "./components/AlchemyPanel";
import { BodyCultivationPanel } from "./components/BodyCultivationPanel";
import { QiCultivationPanel } from "./components/QiCultivationPanel";
import { PlayerStatsPanel } from "./components/PlayerStatsPanel";
import { UnlockToast } from "./components/UnlockToast";
import { NotificationContainer } from "./components/NotificationContainer";
import { WelcomeModal } from "./components/WelcomeModal";
import { BattleTechniquesPanel } from "./components/BattleTechniquesPanel";
import { useNotifications } from "./hooks/useNotifications";
import { useEffect, useState } from "react";

/** Root component that wires the game loop and UI controls together. */
export default function App() {
  const {
    state,
    tryBreakthrough,
    addSpiritStones,
    addBodyExpNew,
    addTribulationPoints,
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
        {/* Cultivation Section: Side-by-side */}
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
        <BattleTechniquesPanel
          battleTechniques={battleTechniques}
          upgradeBattleTechnique={upgradeBattleTechnique}
          spiritStones={state.spiritStones}
          bodyLevel={state.bodyLevel}
        />
        {/* Other Panels: In a grid below */}
        <div className="other-panels">
          {state.unlockedFeatures.includes("monster") && (
            <CombatSystem
              playerAttack={totalAttack}
              playerDefense={totalDefense}
              addSpiritStones={addSpiritStones}
              addBodyExpNew={addBodyExpNew}
              addTribulationPoints={addTribulationPoints}
              playerVitality={totalVitality}
              playerVitalityCap={state.vitalityCap}
            />
          )}
          {/* Render alchemy UI when unlocked */}
          {state.unlockedFeatures.includes("alchemy") && <AlchemyPanel />}
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