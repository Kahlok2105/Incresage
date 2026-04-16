import React from "react";
import type { MeditationType } from "../types/game";

/**
 * Meditation panel that displays available meditation types and allows selection.
 */
export const MeditationPanel: React.FC<{
  meditationTypes: MeditationType[];
  activeMeditationId: string | null;
  setActiveMeditation: (meditationId: string | null) => void;
  getCurrentMeditationStats: () => { curiosity: number; tenacity: number; knowledge: number; qi: number };
}> = ({
  meditationTypes,
  activeMeditationId,
  setActiveMeditation,
  getCurrentMeditationStats,
}) => {
  const currentStats = getCurrentMeditationStats();

  // Handle undefined/legacy game states
  if (!meditationTypes || meditationTypes.length === 0) {
    return (
      <div className="meditation-panel">
        <h2>Meditation Techniques</h2>
        <p className="no-active">Meditation system loading...</p>
      </div>
    );
  }

  return (
    <div className="meditation-panel">
      <h2>Meditation Techniques</h2>

          {currentStats.curiosity > 0 || currentStats.tenacity > 0 || currentStats.qi > 0 ? (
        <div className="active-meditation-stats">
          <h3>Active Effects:</h3>
          {currentStats.curiosity > 0 && <p>Curiosity: +{currentStats.curiosity}/s</p>}
          {currentStats.tenacity > 0 && <p>Tenacity: +{currentStats.tenacity}/s</p>}
          {currentStats.knowledge > 0 && <p>Knowledge: +{currentStats.knowledge}/s</p>}
          {currentStats.qi > 0 && <p>Qi: +{currentStats.qi}/s</p>}
        </div>
      ) : (
        <p className="no-active">No active meditation effects</p>
      )}

      <div className="meditation-list">
        {meditationTypes.map((meditation) => {
          const isActive = activeMeditationId === meditation.id;
          const multiplier = 1 + Math.floor(meditation.level / 10);
          const currentCuriosity = meditation.baseCuriosity * meditation.level * multiplier;
          const currentVitality = meditation.baseTenacity * meditation.level * multiplier;
          const currentKnowledge = meditation.baseKnowledge * meditation.level * multiplier;
          const currentQi = meditation.baseQi * meditation.level * multiplier;

          return (
            <div key={meditation.id} className={`meditation-item ${isActive ? "active" : ""}`}>
              <h3>{meditation.name} (Lv. {meditation.level})</h3>
              <div className="meditation-effects">
                {currentCuriosity > 0 && <span title={`Base ${meditation.baseCuriosity} × Level ${meditation.level} × Multiplier ${multiplier}`}>Curiosity: +{currentCuriosity}/s</span>}
                {currentVitality > 0 && <span title={`Base ${meditation.baseTenacity} × Level ${meditation.level} × Multiplier ${multiplier}`}>Tenacity: +{currentVitality}/s</span>}
                {currentKnowledge > 0 && <span title={`Base ${meditation.baseKnowledge} × Level ${meditation.level} × Multiplier ${multiplier}`}>Knowledge: +{currentKnowledge}/s</span>}
                {currentQi > 0 && <span title={`Base ${meditation.baseQi} × Level ${meditation.level} × Multiplier ${multiplier}`}>Qi: +{currentQi}/s</span>}
              </div>
              <div className="meditation-controls">
                <button
                  onClick={() => setActiveMeditation(isActive ? null : meditation.id)}
                  className={isActive ? "active-btn" : ""}
                >
                  {isActive ? "Stop" : "Activate"}
                </button>
              </div>
              {isActive && (
                <div className="meditation-exp">
                  <div className="exp-bar" style={{ width: `${(meditation.currentExp / meditation.expToNextLevel) * 100}%` }}></div>
                  <span>Level {meditation.level}: {Math.floor(meditation.currentExp)}/{meditation.expToNextLevel} exp</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};