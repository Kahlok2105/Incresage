import { useEffect, useRef, useState } from "react";
import type { PlayerState, Monster } from "../types/game";
import { MONSTERS, MEDITATION_TYPES, BATTLE_TECHNIQUES } from "../constants/gameData";
import { QI_REALMS, BODY_REALMS, getCurrentRealm } from "../constants/cultivationRealms";
import { calculateLifespan, calculateTenacityRequired, calculateTPRequired } from "../utils/gameMath";

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
    attack: 5,
    defense: 5,
    knowledge: 0,

    curiosity: 0,
    tenacity: 0,
    
    lifespan: 0,
    maxLifespan: 100,
    
    unlockedFeatures: [],
    meditationTypes: [...MEDITATION_TYPES],
    battleTechniques: [...BATTLE_TECHNIQUES],
    activeMeditationId: null,
    bodyExp: 0,
    bodyLevel: 1,
    tribulationPoints: 0,
    defeatedMonsters: []
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
          maxLifespan: parsed.maxLifespan ?? maxLifespan,
          
          // Ensure battleTechniques exists for migration
          battleTechniques: parsed.battleTechniques || [...BATTLE_TECHNIQUES]
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
        attack: 5,
        defense: 5,
        
        curiosity: 0,
        tenacity: 0,
        
        lifespan: 0,
        maxLifespan: 100,
        
        unlockedFeatures: [],
        meditationTypes: [...MEDITATION_TYPES],
        battleTechniques: [...BATTLE_TECHNIQUES],
        activeMeditationId: null,
        bodyExp: 0,
        bodyLevel: 1,
        tribulationPoints: 0,
        defeatedMonsters: []
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

  // Helper: calculate battle technique stat bonus
  const calculateBattleBonus = (technique: { baseValue: number; level: number }) => {
    if (technique.level === 0) return 0;
    return Math.floor(technique.baseValue * Math.pow(technique.level, 1.5) * 100) / 100;
  };

  // Helper: calculate spirit stones required for next level
  const calculateBattleUpgradeCost = (technique: { baseValue: number; level: number }) => {
    const nextLevel = technique.level + 1;
    return Math.floor(technique.baseValue * Math.pow(1.15, nextLevel));
  };

  // Helper: get total battle bonuses
  const getBattleBonuses = (currentState: PlayerState) => {
    const bonuses = { attack: 0, defense: 0, vitality: 0, spirit: 0 };
    if (!currentState.battleTechniques) return bonuses;
    currentState.battleTechniques.forEach(technique => {
      const bonus = calculateBattleBonus(technique);
      bonuses[technique.stat] += bonus;
    });
    return bonuses;
  };

  // Helper: upgrade battle technique
  const upgradeBattleTechnique = (techniqueId: string) => {
    setState(prev => {
      if (!prev.battleTechniques) return prev;
      
      const technique = prev.battleTechniques.find(t => t.id === techniqueId);
      if (!technique) return prev;

      const maxLevel = Math.min(100, prev.bodyLevel * 5);
      if (technique.level >= maxLevel) return prev;

      const cost = calculateBattleUpgradeCost(technique);
      if (prev.spiritStones < cost) return prev;

      return {
        ...prev,
        spiritStones: prev.spiritStones - cost,
        battleTechniques: prev.battleTechniques.map(t =>
          t.id === techniqueId ? { ...t, level: t.level + 1 } : t
        )
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

  // Derived: battle bonuses
  const battleBonuses = getBattleBonuses(state);
  const totalAttack = state.attack + battleBonuses.attack;
  const totalDefense = state.defense + battleBonuses.defense;
  const totalVitality = state.vitality + battleBonuses.vitality;
  const totalSpirit = state.spirit + battleBonuses.spirit;

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

  /** Add body experience – typically called after a successful combat encounter. */
  const addBodyExp = (amount: number) => {
    setState((prev) => {
      const newBodyExp = prev.bodyExp + amount;
      // Calculate body level based on EXP (simple formula: level = floor(sqrt(exp/10)) + 1)
      const newBodyLevel = Math.floor(Math.sqrt(newBodyExp / 10)) + 1;
      return { 
        ...prev, 
        bodyExp: newBodyExp,
        bodyLevel: newBodyLevel
      };
    });
  };

  /** Get a random monster from the pool */
  const getRandomMonster = () => {
    return MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
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

  /** Attempt to breakthrough to the next realm with 100% success chance (debug/cheat).
   * Returns true if the breakthrough succeeded, false otherwise.
   */
  const tryBreakthroughGuaranteed = (): { success: boolean; chance: number } => {
    const currentIndex = state.currentQiRealmIndex * 3 + state.currentQiStage;
    const nextRealm = QI_REALMS[currentIndex + 1];
    
    if (!nextRealm) return { success: false, chance: 0 };

    const chance = calculateBreakthroughChance();
    const canAttempt = state.qi >= nextRealm.qiRequired / 2;

    if (!canAttempt) return { success: false, chance };
    
    // Always succeed with 100% chance
    const success = true;

    setState((prev) => {
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
    });
    
    return { success, chance: 1 };
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

  /** Add tribulation points from defeating a monster (one-time per monster type) */
  const addTribulationPoints = (monster: Monster) => {
    setState((prev) => {
      // Check if monster has already been defeated
      const defeatedMonsters = prev.defeatedMonsters ?? [] ;
      if (defeatedMonsters.includes(monster.id)) {
        return prev; // Already defeated, no TP gain
      }

      const tpGained = monster.tpReward || 0;
      return {
        ...prev,
        tribulationPoints: prev.tribulationPoints + tpGained,
        defeatedMonsters: [...defeatedMonsters, monster.id]
      };
    });
  };

  /** Calculate body stage index (0-17) */
  const getBodyStageIndex = () => {
    return state.currentBodyRealmIndex * 3 + state.currentBodyStage;
  };

  /** Calculate body breakthrough chance */
  const calculateBodyBreakthroughChance = () => {
    const bodyStageIndex = getBodyStageIndex();
    const nextBodyRealm = BODY_REALMS[bodyStageIndex + 1];
    
    if (!nextBodyRealm) return 0;

    const requiredBodyLevel = bodyStageIndex + 1;
    const tenacityRequired = calculateTenacityRequired(bodyStageIndex);
    const tpRequired = calculateTPRequired(bodyStageIndex);
    
    const tenacityRatio = state.tenacity / tenacityRequired;
    const tpRatio = state.tribulationPoints / tpRequired;
    const levelRatio = Math.min(state.bodyLevel / requiredBodyLevel, 1.5);
    
    return nextBodyRealm.baseSuccessRate * tenacityRatio * tpRatio * levelRatio;
  };

  /** Attempt body breakthrough */
  const tryBodyBreakthrough = (): { success: boolean; chance: number } => {
    const bodyStageIndex = getBodyStageIndex();
    const nextBodyRealm = BODY_REALMS[bodyStageIndex + 1];
    
    if (!nextBodyRealm) return { success: false, chance: 0 };

    const tenacityRequired = calculateTenacityRequired(bodyStageIndex);
    const tpRequired = calculateTPRequired(bodyStageIndex);
    
    // Check if requirements are met (at least 50% of each requirement)
    const canAttempt = state.tenacity >= tenacityRequired * 0.5 && 
                       state.tribulationPoints >= tpRequired * 0.5;

    const chance = calculateBodyBreakthroughChance();
    
    if (!canAttempt) return { success: false, chance };

    // Roll the dice
    const roll = Math.random();
    // Cap internal roll check at 100% for guaranteed success, while keeping displayed chance intact
    const success = roll < Math.min(chance, 1.0);

    setState((prev) => {
      if (success) {
        const newIndex = bodyStageIndex + 1;
        const newRealmIndex = Math.floor(newIndex / 3);
        const newStage = newIndex % 3;
        
        const { vitalityCap, spiritCap } = calculateStatCaps({
          ...prev,
          currentBodyRealmIndex: newRealmIndex,
          currentBodyStage: newStage,
        });

        return {
          ...prev,
          currentBodyRealmIndex: newRealmIndex,
          currentBodyStage: newStage,
          vitalityCap,
          spiritCap,
          // Consume resources on success (TP are preserved as checkpoints)
          tenacity: Math.max(0, prev.tenacity - tenacityRequired),
        };
      } else {
        // Failure penalty: lose 30% tenacity and 1 body level
        const newTenacity = prev.tenacity * 0.7;
        const newBodyLevel = Math.max(1, prev.bodyLevel - 1);
        
        return {
          ...prev,
          tenacity: newTenacity,
          bodyLevel: newBodyLevel
        };
      }
    });

    return { success, chance };
  };

  /** Add body experience with new formula */
  const addBodyExpNew = (amount: number) => {
    setState((prev) => {
      const newBodyExp = prev.bodyExp + amount;
      // Calculate body level from EXP using inverse of: expRequired = 100 * floor(level^1.8)
      // level = floor((exp / 100)^(1/1.8))
      let newBodyLevel = 1;
      if (newBodyExp > 0) {
        newBodyLevel = Math.floor(Math.pow(newBodyExp / 100, 1 / 1.8)) + 1;
      }
      return { 
        ...prev, 
        bodyExp: newBodyExp,
        bodyLevel: newBodyLevel
      };
    });
  };

  return {
    state,
    addSpiritStones,
    addBodyExp,
    addBodyExpNew,
    addTribulationPoints,
    getRandomMonster,
    tryBreakthrough,
    tryBreakthroughGuaranteed,
    tryBodyBreakthrough,
    calculateBodyBreakthroughChance,
    getBodyStageIndex,
    isMeditating,
    toggleMeditation,
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
    battleTechniques: state.battleTechniques,
    upgradeBattleTechnique,
    totalAttack,
    totalDefense,
    totalVitality,
    totalSpirit,
    welcomeData,
    clearWelcomeData: () => setWelcomeData(null)
  };
}



