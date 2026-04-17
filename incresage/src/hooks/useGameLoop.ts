import { useEffect, useRef, useState } from "react";
import type { PlayerState } from "../types/game";
import { MONSTERS, MEDITATION_TYPES } from "../constants/gameData";
import { QI_REALMS, getCurrentRealm } from "../constants/cultivationRealms";
import { calculateLifespan } from "../utils/gameMath";

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
    
    currentQiRealmIndex: 0,
    currentQiStage: 0,
    
    currentBodyRealmIndex: 0,
    currentBodyStage: 0,
    
    lastUpdate: Date.now(),
    lastActive: Date.now(),
    
    vitality: 0,
    spirit: 0,
    vitalityCap: 100,
    spiritCap: 100,
    knowledge: 0,

    curiosity: 0,
    tenacity: 0,
    
    lifespan: 0,
    maxLifespan: 100,
    
    unlockedFeatures: [],
    meditationTypes: [...MEDITATION_TYPES],
    activeMeditationId: null,
  };

export function useGameLoop(tickMs: number = 1_000) {
  // Initialise player state – start at the first realm with no resources.
  // Load persisted state if available
  const persisted = typeof localStorage !== "undefined" ? localStorage.getItem("gameState") : null;
  const initialState: PlayerState = persisted
    ? (() => {
        const parsed = JSON.parse(persisted);
        
        // Migrate old vitality field to tenacity for backward compatibility
        const migratedTenacity = parsed.tenacity || parsed.vitality || 0;
        
        // Migrate old single realm system to new dual cultivation system
        const oldRealmIndex = parsed.currentRealmIndex || 0;
        
        // Calculate lifespan based on highest attained realm
        const maxLifespan = calculateLifespan(oldRealmIndex);
        
        return {
          ...parsed,
          lastActive: parsed.lastActive || Date.now(),
          
          // Migrate old realm index to new dual system
          currentQiRealmIndex: parsed.currentQiRealmIndex ?? oldRealmIndex,
          currentQiStage: parsed.currentQiStage ?? 0,
          currentBodyRealmIndex: parsed.currentBodyRealmIndex ?? 0,
          currentBodyStage: parsed.currentBodyStage ?? 0,
          
          vitality: parsed.vitality || 0,
          tenacity: migratedTenacity,
          
          // Calculate proper stat caps
          vitalityCap: parsed.vitalityCap || Math.max(
            100,
            (100 * ((parsed.currentQiRealmIndex ?? oldRealmIndex) + 1) * ((parsed.currentBodyRealmIndex ?? 0) + 1)) + Math.sqrt(Math.max(0, migratedTenacity))
          ),
          spiritCap: parsed.spiritCap || Math.max(
            100,
            (100 * ((parsed.currentQiRealmIndex ?? oldRealmIndex) + 1) * ((parsed.currentBodyRealmIndex ?? 0) + 1)) + Math.sqrt(Math.max(0, parsed.knowledge ?? 0))
          ),

          lifespan: parsed.lifespan ?? maxLifespan,
          maxLifespan: parsed.maxLifespan ?? maxLifespan
        };
      })()
    : {
        qi: 0,
        spiritStones: 0,
        
        currentQiRealmIndex: 0,
        currentQiStage: 0,
        currentBodyRealmIndex: 0,
        currentBodyStage: 0,
        
        lastUpdate: Date.now(),
        lastActive: Date.now(),
        
        vitality: 0,
        spirit: 0,
        vitalityCap: QI_REALMS[0].qiCap / 2,
        spiritCap: QI_REALMS[0].qiCap / 2,
        
        curiosity: 0,
        tenacity: 0,
        
        lifespan: 0,
        maxLifespan: 100,
        
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

  // Helper: calculate stat caps based on current realm
  const calculateStatCaps = (state: PlayerState) => {
    // Base values
    const BASE_VITALITY = 100;
    const BASE_SPIRIT = 100;
    
    // Realm multipliers (proper 0-index scaling: realm 0 = 1x, realm 1 = 2x etc.)
    const qiMultiplier = state.currentQiRealmIndex + 1;
    const bodyMultiplier = state.currentBodyRealmIndex + 1;
    
    // ✅ Vitality formula: (base * qiRealmIndex * BodyRealmIndex) + sqrt(Tenacity)
    const vitalityCap = (BASE_VITALITY * qiMultiplier * bodyMultiplier) + Math.sqrt(Math.max(0, state.tenacity));
    
    // ✅ Spirit formula: (base * qiRealmIndex * BodyRealmIndex) + sqrt(Knowledge)
    const spiritCap = (BASE_SPIRIT * qiMultiplier * bodyMultiplier) + Math.sqrt(Math.max(0, state.knowledge));
    
    return {
      vitalityCap: Math.max(100, vitalityCap),
      spiritCap: Math.max(100, spiritCap),
    };
  };

  // Helper: get active meditation stats
  const getActiveMeditationStats = (currentState: PlayerState) => {
    if (!currentState.activeMeditationId) {
      return { curiosity: 0, tenacity: 0, knowledge: 0, qi: 0 };
    }

    const activeMeditation = currentState.meditationTypes.find(
      (m) => m.id === currentState.activeMeditationId
    );

    if (!activeMeditation) {
      return { curiosity: 0, tenacity: 0, knowledge: 0, qi: 0 };
    }

    // (Base × Level) × Multiplier
    const multiplier = calculateMeditationMultiplier(activeMeditation.level);

    return {
      curiosity: activeMeditation.baseCuriosity * activeMeditation.level * multiplier,
      tenacity: activeMeditation.baseTenacity * activeMeditation.level * multiplier,
      knowledge: activeMeditation.baseKnowledge * activeMeditation.level * multiplier,
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
    const qiRealm = getCurrentRealm(QI_REALMS, currentState.currentQiRealmIndex, currentState.currentQiStage);
    // Base gain of 1 Qi per tick, multiplied by the realm's multiplier.
    const base = 1 * qiRealm.gainMultiplier;
    // If the player is meditating, apply an extra 2x multiplier.
    return isMeditatingRef.current ? base * 2 : base;
  };

  // Derived: current Qi per second (QPS)
  const qiPerSecond = computeQiGain(state);

  // Derived: usable Qi (current) and total Qi (cap)
  const usableQi = state.qi;
  const currentQiRealm = getCurrentRealm(QI_REALMS, state.currentQiRealmIndex, state.currentQiStage);
  const totalQi = currentQiRealm.qiCap;

  // Tick handler – updates Qi and timestamps.
  const tick = () => {
    setState((prev) => {
        const now = Date.now();
        //1. Calculate how much seconds have passed
        const deltaTimeSeconds = (now - prev.lastUpdate) / 1000;

        //2. Calculate base Qi gain from realm
        const qiRealm = getCurrentRealm(QI_REALMS, prev.currentQiRealmIndex, prev.currentQiStage);
        const baseGain = 1 * qiRealm.gainMultiplier;
        const multiplier = isMeditatingRef.current ? 2 : 1;
        const realmQiGain = baseGain * multiplier * deltaTimeSeconds;

        //3. Calculate meditation stats
        const meditationStats = getActiveMeditationStats(prev);
        const meditationQiGain = meditationStats.qi * deltaTimeSeconds;
        const curiosityGain = meditationStats.curiosity * deltaTimeSeconds;
        const tenacityGain = meditationStats.tenacity * deltaTimeSeconds;
        const knowledgeGain = meditationStats.knowledge * deltaTimeSeconds;

        //4. Update meditation experience
        const updatedMeditationTypes = gainMeditationExperience(prev, deltaTimeSeconds);

        //5. Update all stats while capped by realm's limit.
        // Increase lifespan by 0.1 per second when player is active (meditating or in activity)
        const isPlayerActive = isMeditatingRef.current || prev.activeMeditationId !== null;
        const lifespanGain = isPlayerActive ? 0.1 * deltaTimeSeconds : 0;

        const newTenacity = prev.tenacity + tenacityGain;
        const newKnowledge = prev.knowledge + knowledgeGain;
        const { vitalityCap, spiritCap } = calculateStatCaps({
          ...prev,
          tenacity: newTenacity,
          knowledge: newKnowledge,
        });

        // Calculate vitality & spirit regeneration (0.5% per second rounded up)
        const vitalityRegen = Math.ceil(vitalityCap * 0.005) * deltaTimeSeconds;
        const spiritRegen = Math.ceil(spiritCap * 0.005) * deltaTimeSeconds;

        return {
            ...prev,
            qi: Math.min(prev.qi + realmQiGain + meditationQiGain, qiRealm.qiCap), // Cap Qi at realm limit
            curiosity: prev.curiosity + curiosityGain,
            tenacity: newTenacity,
            knowledge: newKnowledge,
            vitality: Math.min(prev.vitality + vitalityRegen, vitalityCap),
            spirit: Math.min(prev.spirit + spiritRegen, spiritCap),
            vitalityCap,
            spiritCap,
            lifespan: Math.min(prev.lifespan + lifespanGain, prev.maxLifespan), // Cap lifespan at max
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

  // Track visibility changes for away time calculation
  const [welcomeData, setWelcomeData] = useState<{
    showModal: boolean;
    secondsAway: number;
    statsGained: Record<string, number>;
    totalQiGained: number;
  } | null>(null);

  // Helper: calculate all stats gained while away
  const calculateAwayStats = (currentState: PlayerState, secondsAway: number): Record<string, number> => {
    const statsGained: Record<string, number> = {};

    // 1. Calculate realm Qi gain
    const qiRealm = getCurrentRealm(QI_REALMS, currentState.currentQiRealmIndex, currentState.currentQiStage);
    const baseRealmQiGain = 1 * qiRealm.gainMultiplier;
    const realmMultiplier = isMeditatingRef.current ? 2 : 1;
    const realmQiGained = baseRealmQiGain * realmMultiplier * secondsAway;
    statsGained.qi = realmQiGained;

    // 2. Calculate meditation stats if active
    const meditationStats = getActiveMeditationStats(currentState);
    if (currentState.activeMeditationId) {
      const meditationQiGained = meditationStats.qi * secondsAway;
      const curiosityGained = meditationStats.curiosity * secondsAway;
      const tenacityGained = meditationStats.tenacity * secondsAway;
      const knowledgeGained = meditationStats.knowledge * secondsAway;
      // Add meditation Qi to total Qi
      statsGained.qi += meditationQiGained;
      statsGained.curiosity = curiosityGained;
      statsGained.tenacity = tenacityGained;
      statsGained.knowledge = knowledgeGained;
    }

    // 3. Calculate meditation experience gained
    if (currentState.activeMeditationId) {
      const expGained = secondsAway;
      statsGained.meditationExp = expGained;
    }

    // 4. Calculate lifespan gain when active while away
    if (isMeditatingRef.current || currentState.activeMeditationId !== null) {
      statsGained.lifespan = 0.1 * secondsAway;
    }

    // 5. Calculate vitality & spirit regeneration for away time
    const { vitalityCap, spiritCap } = calculateStatCaps(currentState);
    statsGained.vitality = Math.ceil(vitalityCap * 0.005) * secondsAway;
    statsGained.spirit = Math.ceil(spiritCap * 0.005) * secondsAway;

    return statsGained;
  };

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User has returned to the page
        const now = Date.now();
        const secondsAway = (now - state.lastActive) / 1000;

        if (secondsAway > 60) {
          // User was away for more than 60 seconds, calculate gains
          const statsGained = calculateAwayStats(state, secondsAway);
          const totalQiGained = statsGained.qi || 0;

          setWelcomeData({
            showModal: true,
            secondsAway,
            statsGained,
            totalQiGained
          });

          // Apply the gains to the state
          setState(prev => {
            // Calculate meditation experience gains
            let updatedMeditationTypes = prev.meditationTypes;
            if (prev.activeMeditationId && statsGained.meditationExp) {
              updatedMeditationTypes = gainMeditationExperience(prev, statsGained.meditationExp);
            }

            const { vitalityCap, spiritCap } = calculateStatCaps(prev);
            
            return {
              ...prev,
              qi: Math.min(prev.qi + statsGained.qi, getCurrentRealm(QI_REALMS, prev.currentQiRealmIndex, prev.currentQiStage).qiCap),
              curiosity: prev.curiosity + (statsGained.curiosity || 0),
              tenacity: prev.tenacity + (statsGained.tenacity || 0),
              knowledge: prev.knowledge + (statsGained.knowledge || 0), // No cap for knowledge yet
              vitality: Math.min(prev.vitality + (statsGained.vitality || 0), vitalityCap),
              spirit: Math.min(prev.spirit + (statsGained.spirit || 0), spiritCap),
              lifespan: Math.min(prev.lifespan + (statsGained.lifespan || 0), prev.maxLifespan),
              meditationTypes: updatedMeditationTypes,
              lastUpdate: now
            };
          });
        }
      } else {
        // User is leaving the page, update lastActive timestamp
        setState(prev => ({
          ...prev,
          lastActive: Date.now()
        }));
      }
    };

    // Add event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.lastActive, state.activeMeditationId, state.currentQiRealmIndex, state.currentQiStage, state.qi, state.curiosity, state.vitality, state.meditationTypes]);

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
  const currentIndex = state.currentQiRealmIndex * 3 + state.currentQiStage;
  const nextRealm = QI_REALMS[currentIndex + 1];
  
  if (!nextRealm) return 0;

  const ratio = Math.min(1, state.qi / nextRealm.qiRequired);
  return nextRealm.baseSuccessRate * ratio;
};




const tryBreakthrough = (): { success: boolean; chance: number } => {
  const currentIndex = state.currentQiRealmIndex * 3 + state.currentQiStage;
  const nextRealm = QI_REALMS[currentIndex + 1];
  
  if (!nextRealm) return { success: false, chance: 0 };

  //1. Calculate the dynamic chance based on current Qi progress
  const chance = calculateBreakthroughChance();
  const canAttempt = state.qi >= nextRealm.qiRequired / 2;

  if (!canAttempt) return {success: false, chance};
  
  //2. Roll the Dice on the breakthrough
    const roll = Math.random();
    const success = roll < chance;

    setState((prev) => {
      if(success) {
        const newIndex = currentIndex + 1;
        const newRealmIndex = Math.floor(newIndex / 3);
        const newStage = newIndex % 3;
        
        const newFeatures = [...prev.unlockedFeatures];

         // Progression Logic:
         if (newRealmIndex >= 1 && !newFeatures.includes("monster")) newFeatures.push("monster");
         if (newRealmIndex >= 2 && !newFeatures.includes("alchemy")) newFeatures.push("alchemy");
         if (newRealmIndex >= 3 && !newFeatures.includes("bodyCultivation")) newFeatures.push("bodyCultivation");
         
        const newMaxLifespan = calculateLifespan(newIndex);
        const { vitalityCap, spiritCap } = calculateStatCaps({
          ...prev,
          currentQiRealmIndex: newRealmIndex,
          currentQiStage: newStage,
        });
        
        return {
          ...prev,
          currentQiRealmIndex: newRealmIndex,
          currentQiStage: newStage,
          qi: 0,
          vitalityCap,
          spiritCap,
          maxLifespan: newMaxLifespan,
          unlockedFeatures: newFeatures,        
        };
       } else {
         // Penalty: Deduct 50% of current Qi on failure
         return {
           ...prev,
           qi: Math.max(0, prev.qi * 0.5),
         };
       }
    });
  return { success, chance };
};

  /** Add a percentage of total Qi for testing purposes */
  const addTestQi = (percentage: number) => {
    setState((prev) => {
      const realm = getCurrentRealm(QI_REALMS, prev.currentQiRealmIndex, prev.currentQiStage);
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
    activeMeditationId: state.activeMeditationId,
    welcomeData,
    clearWelcomeData: () => setWelcomeData(null)
  };
}



