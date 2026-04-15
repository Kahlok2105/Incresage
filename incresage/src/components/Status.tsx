import React from "react";
import { QI_REALMS, BODY_REALMS, getCurrentRealm } from "../constants/cultivationRealms";

/**
 * Displays the player's current realm, Qi and Spirit Stones.
 * Provides a button to attempt a breakthrough when requirements are met.
 */
export const Status: React.FC<{
  state: { 
    qi: number; 
    spiritStones: number; 
    currentQiRealmIndex: number; 
    currentQiStage: number;
    currentBodyRealmIndex: number;
    currentBodyStage: number;
    curiosity: number; 
    vitality: number; 
    tenacity: number; 
    vitalityCap: number; 
    tenacityCap: number;
    lifespan: number;
    maxLifespan: number;
  };
  // Updated to reflect actual return shape from useGameLoop
  tryBreakthrough: () => { success: boolean; chance: number };
  usableQi: number;
  totalQi: number;
  resetGame: () => void;
  addTestQi?: (percentage: number) => void;
}> = ({ state, tryBreakthrough, usableQi, totalQi, resetGame, addTestQi }) => {
  // Get current realms
  const currentQiRealm = getCurrentRealm(QI_REALMS, state.currentQiRealmIndex, state.currentQiStage);
  const currentBodyRealm = getCurrentRealm(BODY_REALMS, state.currentBodyRealmIndex, state.currentBodyStage);
  
  const curiosityCap = currentQiRealm.qiCap * 0.5; // 50% of Qi cap
  
  const currentQiIndex = state.currentQiRealmIndex * 3 + state.currentQiStage;
  const nextRealm = QI_REALMS[currentQiIndex + 1];

  const currentChance = nextRealm
    ? (nextRealm.baseSuccessRate * Math.min(1, state.qi / nextRealm.qiRequired) * 100).toFixed(1)
    : "0.0";

  const canAttempt = nextRealm
    ? state.qi >= nextRealm.qiRequired / 2
    : false;

  const attemptLabel = nextRealm
    ? canAttempt
      ? "Attempt Breakthrough"
      : "Accumulate More Qi"
    : "No Further Realms";

  return (
    <div className="status">
      <h2>Qi Cultivation: {currentQiRealm.displayName}</h2>
      <p>Body Cultivation: {currentBodyRealm.displayName}</p>
      <p>Qi: {usableQi.toFixed(0)} / {totalQi.toFixed(0)}</p>
      <p>Spirit Stones: {state.spiritStones}</p>
      <p>Lifespan: {state.lifespan.toFixed(0)} / {state.maxLifespan.toFixed(0)} years</p>
      <p>Vitality: {(state.vitality || 0).toFixed(1)} / {state.vitalityCap.toFixed(0)}</p>
      <p>Curiosity: {(state.curiosity || 0).toFixed(1)} / {curiosityCap.toFixed(0)}</p>
      <p>Tenacity: {(state.tenacity || 0).toFixed(1)} / {state.tenacityCap.toFixed(0)}</p>
      {nextRealm && (
        <div className="breakthrough">
          <h3>Next: {nextRealm.displayName}</h3>
          <p>Success Chance: <strong>{currentChance}%</strong></p>
          <button disabled={!canAttempt} onClick={tryBreakthrough}>
            {attemptLabel}
          </button>
          <p className="hint">Failure will result in 50% Qi loss!</p>
        </div>
      )}
      <div className="debug-controls" style={{ marginTop: '20px', opacity: 0.6 }}>
        <button
          onClick={resetGame}
          style={{ background: '#ff4444', fontSize: '0.8rem', padding: '8px 12px' }}
        >
          Hard Reset Data
        </button>
        {addTestQi && (
          <button
            onClick={() => addTestQi(10)}
            style={{ background: '#4CAF50', fontSize: '0.8rem', padding: '8px 12px', marginLeft: '8px' }}
          >
            +10% Qi (Test)
          </button>
        )}
      </div>
    </div>
  );
};

