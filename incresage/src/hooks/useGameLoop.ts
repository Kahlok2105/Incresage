import { useEffect, useRef, useState } from "react";
import type { PlayerState, MeditationType } from "../types/game";
import { REALMS, MONSTERS, MEDITATION_TYPES } from "../constants/gameData";

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
  curiosity: 0,
  unlockedFeatures: [],
  meditationTypes: [...MEDITATION_TYPES],
  activeMeditationId: null,
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
        curiosity: 0,
        unlockedFeatures: [],
        meditationTypes: [...MEDITATION_TYPES],
        activeMeditationId: null,
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

  // Helper: calculate meditation stat multiplier based on level
  const calculateMeditationMultiplier = (level: number) => {
    return 1 + Math.floor(level / 10);
  };

  // Helper: get active meditation stats
  const getActiveMeditationStats = (currentState: PlayerState) => {
    if (!currentState.activeMeditationId) {
      return { curiosity: 0, tenacity: 0, qi: 0 };
    }

    const activeMeditation = currentState.meditationTypes.find(
      (m) => m.id === currentState.activeMeditationId
    );

    if (!activeMeditation) {
      return { curiosity: 0, tenacity: 0, qi: 0 };
    }

    // (Base × Level) × Multiplier
    const multiplier = calculateMeditationMultiplier(activeMeditation.level);

    return {
      curiosity: activeMeditation.baseCuriosity * activeMeditation.level * multiplier,
      tenacity: activeMeditation.baseTenacity * activeMeditation.level * multiplier,
      qi: activeMeditation.baseQi * activeMeditation.level * multiplier,
    };
  };

  // Helper: calculate experience required for next level
  const calculateExpRequired = (level: number) => {
    // Base exp: 100, doubles every 5 levels
    const expMultiplier = Math.pow(2, Math.floor((level - 1) / 5));
    return 100 * expMultiplier;
  };

  // Helper: gain experience for active meditation
  const gainMeditationExperience = (prevState: PlayerState, deltaTimeSeconds: number) => {
    if (!prevState.activeMeditationId) return prevState.meditationTypes;

    return prevState.meditationTypes.map(meditation => {
      if (meditation.id !== prevState.activeMeditationId) return meditation;

      // Gain 1 exp per second of active meditation
      const expGained = deltaTimeSeconds;
      let newExp = meditation.currentExp + expGained;
      let newLevel = meditation.level;
      let newExpToNextLevel = meditation.expToNextLevel;

      // Check for level ups
      while (newExp >= newExpToNextLevel && newLevel < meditation.maxLevel) {
        newExp -= newExpToNextLevel;
        newLevel += 1;
        newExpToNextLevel = calculateExpRequired(newLevel);
      }

      return {
        ...meditation,
        level: newLevel,
        currentExp: newExp,
        expToNextLevel: newExpToNextLevel
      };
    });
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

        //2. Calculate base Qi gain from realm
        const realm = REALMS[prev.currentRealmIndex];
        const baseGain = 1 * realm.qiGainMultiplier;
        const multiplier = isMeditatingRef.current ? 2 : 1;
        const realmQiGain = baseGain * multiplier * deltaTimeSeconds;

        //3. Calculate meditation stats
        const meditationStats = getActiveMeditationStats(prev);
        const meditationQiGain = meditationStats.qi * deltaTimeSeconds;
        const curiosityGain = meditationStats.curiosity * deltaTimeSeconds;
        const tenacityGain = meditationStats.tenacity * deltaTimeSeconds;

        //4. Update meditation experience
        const updatedMeditationTypes = gainMeditationExperience(prev, deltaTimeSeconds);

        //5. Update all stats while capped by realm's limit.
        return {
            ...prev,
            qi: Math.min(prev.qi + realmQiGain + meditationQiGain, realm.qiCap), // Cap Qi at realm limit
            curiosity: prev.curiosity + curiosityGain,
            vitality: prev.vitality + tenacityGain, // Using vitality field for tenacity
            meditationTypes: updatedMeditationTypes,
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

  /** Set active meditation type */
  const setActiveMeditation = (meditationId: string | null) => {
    setState((prev) => ({
      ...prev,
      activeMeditationId: meditationId,
    }));
  };

  /** Level up a meditation type */
  const levelUpMeditation = (meditationId: string) => {
    setState((prev) => {
      const updatedMeditationTypes = prev.meditationTypes.map((meditation) => {
        if (meditation.id === meditationId && meditation.level < meditation.maxLevel) {
          return { ...meditation, level: meditation.level + 1 };
        }
        return meditation;
      });

      return {
        ...prev,
        meditationTypes: updatedMeditationTypes,
      };
    });
  };

  /** Get current meditation stats */
  const getCurrentMeditationStats = () => {
    return getActiveMeditationStats(state);
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

  return {
    state,
    addSpiritStones,
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
    meditationTypes: state.meditationTypes,
    activeMeditationId: state.activeMeditationId
  };
}



