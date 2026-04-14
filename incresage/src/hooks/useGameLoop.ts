import { useEffect, useRef, useState } from "react";
import type { PlayerState } from "../types/game";
import { REALMS, MONSTERS } from "../constants/gameData";

/**
 * Core game‑loop hook.
 *
 * - Advances the game on a fixed tick (default 1 second).
 * - Applies passive Qi gain based on the current realm's `qiGainMultiplier`.
 * - Exposes helpers to manually add spirit stones (e.g., after combat) and to
 *   attempt a breakthrough when requirements are met.
 */

const DEFAULT_STATE: PlayerState = {
  qi: 0,
  spiritStones: 0,
  currentRealmIndex: 0,
  lastUpdate: Date.now(),
  vitality: 0,
  spirit: 0,
  unlockedFeatures: [],
};

export function useGameLoop(tickMs: number = 1_000) {
  // Initialise player state – start at the first realm with no resources.
  // Load persisted state if available
  const persisted = typeof localStorage !== "undefined" ? localStorage.getItem("gameState") : null;
  const initialState: PlayerState = persisted
    ? JSON.parse(persisted)
    : {
        qi: 0,
        spiritStones: 0,
        currentRealmIndex: 0,
        lastUpdate: Date.now(),
        vitality: 0,
        spirit: 0,
        unlockedFeatures: [],
      };

  const [state, setState] = useState<PlayerState>(initialState);

  // Meditation flag – when true, Qi gain is multiplied by an additional factor.
  const [isMeditating, setMeditating] = useState<boolean>(false);

  // Keep a stable reference to the interval ID so we can clear it on unmount.
  // In a browser environment setInterval returns a numeric ID.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ref to keep isMeditating current for the tick function
  const isMeditatingRef = useRef(isMeditating);

  const resetGame = () => {
    if (window.confirm("Are you sure? This will wipe all cultivation progress.")) {
      localStorage.removeItem("gameState");
      setState(DEFAULT_STATE);
      setMeditating(false);
      isMeditatingRef.current = false;
    }
  };

  // Helper: calculate passive Qi gain for the current tick.
  const computeQiGain = (currentState: PlayerState) => {
    const realm = REALMS[currentState.currentRealmIndex];
    // Base gain of 1 Qi per tick, multiplied by the realm's multiplier.
    const base = 1 * realm.qiGainMultiplier;
    // If the player is meditating, apply an extra 2x multiplier.
    return isMeditatingRef.current ? base * 2 : base;
  };

  // Derived: current Qi per second (QPS)
  const qiPerSecond = computeQiGain(state);

  // Derived: usable Qi (current) and total Qi (cap)
  const usableQi = state.qi;
  const totalQi = REALMS[state.currentRealmIndex].qiCap;

  // Tick handler – updates Qi and timestamps.
  const tick = () => {
    setState((prev) => {
        const now = Date.now();
        //1. Calculate how much seconds have passed
        const deltaTimeSeconds = (now - prev.lastUpdate) / 1000;
        
        //2. Calculate Qi gain based on current realm stats and time elapsed

        const realm = REALMS[prev.currentRealmIndex];
        const baseGain = 1 * realm.qiGainMultiplier
        const multiplier = isMeditatingRef.current ? 2 : 1;
        const totalGain = baseGain * multiplier * deltaTimeSeconds;
       
        //3. Update Qi while capped by realm's limit.
        return {
            ...prev,
            qi: Math.min(prev.qi + totalGain, realm.qiCap), // Cap Qi at realm limit
            lastUpdate: now,
        };
    });
  };

  // Start the interval when the hook mounts.
  useEffect(() => {
    intervalRef.current = setInterval(tick, tickMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state on every change
  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("gameState", JSON.stringify(state));
    }
  }, [state]);

  /** Add spirit stones – typically called after a successful combat encounter. */
  const addSpiritStones = (amount: number) => {
    setState((prev) => ({ ...prev, spiritStones: prev.spiritStones + amount }));
  };

  /** Simulate a combat encounter with a random monster.
   * The success chance is inversely proportional to the monster's difficulty.
   * On success, the player gains the monster's stoneReward.
   */
  const encounterMonster = () => {
    const monster = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
    // Simple success formula: 80% base chance reduced by 10% per difficulty level above 1.
    const baseChance = 0.8;
    const chance = Math.max(0.1, baseChance - (monster.difficulty - 1) * 0.1);
    const success = Math.random() < chance;
    if (success) {
      addSpiritStones(monster.stoneReward);
    }
    return { monster, success };
  };

  /** Toggle meditation on/off. */
  const toggleMeditation = () => {
    setMeditating((prev) => {
      const newValue = !prev;
      isMeditatingRef.current = newValue;
      return newValue;
    });
  };



  /** Attempt to breakthrough to the next realm.
   * Returns true if the breakthrough succeeded, false otherwise.
   */
// 1. Add a helper to calculate the current chance
const calculateBreakthroughChance = () => {
  const nextRealm = REALMS[state.currentRealmIndex + 1];
  if (!nextRealm) return 0;

  const ratio = Math.min(1, state.qi / nextRealm.qiRequired);
  return nextRealm.baseSuccessRate * ratio;
};




const tryBreakthrough = (): { success: boolean; chance: number } => {
  // const currentRealm = REALMS[state.currentRealmIndex]; // No longer needed for logic
  const nextRealm = REALMS[state.currentRealmIndex + 1];
  
  if (!nextRealm) return { success: false, chance: 0 };

  //1. Calculate the dynamic chance based on current Qi progress
  const chance = calculateBreakthroughChance();
  const canAttempt =  state.qi >= nextRealm.qiRequired / 2 &&
                      state.spiritStones >= nextRealm.stonesRequired;

  if (!canAttempt) return {success: false, chance};
  
  //2. Roll the Dice on the breakthrough
    const roll = Math.random();
    const success = roll < chance;

    setState((prev) => {
      if(success) {

        const nextIndex = prev.currentRealmIndex + 1;
        const newFeatures = [...prev.unlockedFeatures];

         // Progression Logic:
         //   - Unlock "monster" (combat encounters) after the first breakthrough (index >= 1)
         //   - Unlock "alchemy" after the second breakthrough (index >= 2)
         if (nextIndex >= 1 && !newFeatures.includes("monster")) newFeatures.push("monster");
         if (nextIndex >= 2 && !newFeatures.includes("alchemy")) newFeatures.push("alchemy");
        return {
          ...prev,
          currentRealmIndex: nextIndex,
          qi: 0,
          spiritStones: prev.spiritStones - nextRealm.stonesRequired,
          unlockedFeatures: newFeatures,        
        };
       } else {
         // Penalty: Deduct 50% of current Qi on failure, but don't drop below 0.
         // Also consume spirit stones on failure to add risk/reward balance
         return {
           ...prev,
           qi: Math.max(0, prev.qi * 0.5),
           spiritStones: prev.spiritStones - nextRealm.stonesRequired,
         };
       }
    });
  return { success, chance };
};

  /** Add a percentage of total Qi for testing purposes */
  const addTestQi = (percentage: number) => {
    setState((prev) => {
      const realm = REALMS[prev.currentRealmIndex];
      const amountToAdd = realm.qiCap * (percentage / 100);
      return {
        ...prev,
        qi: Math.min(prev.qi + amountToAdd, realm.qiCap),
      };
    });
  };

  return { state, addSpiritStones, tryBreakthrough, isMeditating, toggleMeditation, encounterMonster, qiPerSecond, usableQi, totalQi, resetGame, addTestQi };
}



