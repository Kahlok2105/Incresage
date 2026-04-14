import React from "react";
import type { Realm } from "../types/game";
import { REALMS } from "../constants/gameData";

/**
 * Displays the player's current realm, Qi and Spirit Stones.
 * Provides a button to attempt a breakthrough when requirements are met.
 */
export const Status: React.FC<{
  state: { qi: number; spiritStones: number; currentRealmIndex: number };
  // Updated to reflect actual return shape from useGameLoop
  tryBreakthrough: () => { success: boolean; chance: number };
  qiPerSecond: number;
  usableQi: number;
  totalQi: number;
  resetGame: () => void;
}> = ({ state, tryBreakthrough, qiPerSecond, usableQi, totalQi, resetGame }) => {
  const currentRealm: Realm = REALMS[state.currentRealmIndex];
  const nextRealm: Realm | undefined = REALMS[state.currentRealmIndex + 1];

  const currentChance = nextRealm
    ? (nextRealm.baseSuccessRate * Math.min(1, state.qi / nextRealm.qiRequired) * 100).toFixed(1)
    : "0.0";

  const canAttempt = nextRealm
    ? state.qi >= nextRealm.qiRequired / 2 && state.spiritStones >= nextRealm.stonesRequired
    : false;

  const attemptLabel = nextRealm
    ? canAttempt
      ? "Attempt Breakthrough"
      : state.spiritStones < nextRealm.stonesRequired
      ? "Need More Spirit Stones"
      : "Accumulate More Qi"
    : "No Further Realms";

  return (
    <div className="status">
      <h2>Current Realm: {currentRealm.name}</h2>
      <p>Qi/sec: {qiPerSecond.toFixed(1)}</p>
      <p>Usable Qi / Total Qi: {usableQi.toFixed(0)} / {totalQi.toFixed(0)}</p>
      <p>Spirit Stones: {state.spiritStones}</p>
      {nextRealm && (
        <div className="breakthrough">
          <h3>Next Realm: {nextRealm.name}</h3>
          <p>Success Chance: <strong>{currentChance}%</strong></p>
          <button disabled={!canAttempt} onClick={tryBreakthrough}>
            {attemptLabel}
          </button>
          <p className="hint">Failure will result in Qi loss!</p>
        </div>
      )}
      <div className="debug-controls" style={{ marginTop: '20px', opacity: 0.6 }}>
        <button 
          onClick={resetGame} 
          style={{ background: '#ff4444', fontSize: '0.8rem', padding: '8px 12px' }}
        >
          Hard Reset Data
        </button>
      </div>
    </div>
  );
};

