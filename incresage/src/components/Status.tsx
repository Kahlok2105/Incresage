import React from "react";
import type { Realm } from "../types/game";
import { REALMS } from "../constants/gameData";

/**
 * Displays the player's current realm, Qi and Spirit Stones.
 * Provides a button to attempt a breakthrough when requirements are met.
 */
export const Status: React.FC<{
  state: { qi: number; spiritStones: number; currentRealmIndex: number };
  tryBreakthrough: () => boolean;
}> = ({ state, tryBreakthrough }) => {
  const currentRealm: Realm = REALMS[state.currentRealmIndex];
  const nextRealm: Realm | undefined = REALMS[state.currentRealmIndex + 1];

  const canBreak = nextRealm &&
    state.qi >= nextRealm.qiRequired &&
    state.spiritStones >= nextRealm.stonesRequired;

  return (
    <div className="status">
      <h2>Current Realm: {currentRealm.name}</h2>
      <p>Qi: {state.qi}</p>
      <p>Spirit Stones: {state.spiritStones}</p>
      {nextRealm && (
        <div className="breakthrough">
          <h3>Next Realm: {nextRealm.name}</h3>
          <p>Requires {nextRealm.qiRequired} Qi and {nextRealm.stonesRequired} Stones</p>
          <button disabled={!canBreak} onClick={tryBreakthrough}>
            {canBreak ? "Breakthrough!" : "Not enough resources"}
          </button>
        </div>
      )}
    </div>
  );
};

