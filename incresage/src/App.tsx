// React import removed; JSX runtime handles it automatically.
import "./App.css";
import { useGameLoop } from "./hooks/useGameLoop";
import { Status } from "./components/Status";
import { MeditationPanel } from "./components/MeditationPanel";
import { CombatControls } from "./components/CombatControls";
import { MonsterEncounter } from "./components/MonsterEncounter";
import { AlchemyPanel } from "./components/AlchemyPanel";
import { UnlockToast } from "./components/UnlockToast";
import { NotificationContainer } from "./components/NotificationContainer";
import { useNotifications } from "./hooks/useNotifications";
import { useEffect, useState } from "react";

/** Root component that wires the game loop and UI controls together. */
export default function App() {
  const {
    state,
    tryBreakthrough,
    isMeditating,
    toggleMeditation,
    encounterMonster,
    qiPerSecond,
    usableQi,
    totalQi,
    resetGame,
    addTestQi,
    setActiveMeditation,
    levelUpMeditation,
    getCurrentMeditationStats,
    meditationTypes,
    activeMeditationId
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
            <Status
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
              qiPerSecond={qiPerSecond}
              usableQi={usableQi}
              totalQi={totalQi}
              resetGame={resetGame}
              addTestQi={addTestQi}
            />
        </header>
        <main className="game-panel">
        <MeditationPanel
          meditationTypes={meditationTypes}
          activeMeditationId={activeMeditationId}
          setActiveMeditation={setActiveMeditation}
          levelUpMeditation={levelUpMeditation}
          getCurrentMeditationStats={getCurrentMeditationStats}
        />
        <CombatControls encounterMonster={encounterMonster} />
        {/* Render monster encounter UI when unlocked */}
        {state.unlockedFeatures.includes("monster") && (
          <MonsterEncounter encounterMonster={encounterMonster} />
        )}
        {/* Render alchemy UI when unlocked */}
        {state.unlockedFeatures.includes("alchemy") && <AlchemyPanel />}
        {/* Unlock toast notification */}
        <UnlockToast feature={lastFeature} />
        </main>
        {/* Global notification container */}
        <NotificationContainer
          notifications={notifications}
          onDismiss={dismissNotification}
        />
    </div>
  );
}

