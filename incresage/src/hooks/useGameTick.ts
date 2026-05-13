import { useEffect, useRef, useState } from "react";
import type { PlayerState } from "../types/game";
import { QI_REALMS } from "../constants/cultivationRealms";
import { calculateStatCaps, getActiveMeditationStats } from "../utils/statCalc";
import { gainMeditationExperience } from "./useMeditation";
import { processReincarnation } from "./useReincarnation";

export function useGameTick(
  state: PlayerState,
  setState: React.Dispatch<React.SetStateAction<PlayerState>>,
  tickMs: number = 1_000
) {
  const [isMeditating, setMeditating] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMeditatingRef = useRef(isMeditating);

  
  // Keep ref in sync
  useEffect(() => {
    isMeditatingRef.current = isMeditating;
  }, [isMeditating]);

  const tick = () => {
    setState(prev => {
    const now = Date.now();
    const deltaTimeSeconds = (now - prev.lastUpdate) / 1000;

    // 1. Realm Qi gain — multiplied by 2 if meditation toggle is on
    const qiTotalIndex = prev.currentQiRealmIndex * 3 + prev.currentQiStage;
    const qiRealm = QI_REALMS[Math.min(qiTotalIndex, QI_REALMS.length - 1)];
    const baseQiGain = qiRealm.gainMultiplier * (isMeditatingRef.current ? 2 : 1);
    const realmQiGain = baseQiGain * deltaTimeSeconds;

    // 2. Active meditation technique gains
    const meditationStats = getActiveMeditationStats(prev);
    const meditationQiGain = meditationStats.qi * deltaTimeSeconds;
    const curiosityGain = meditationStats.curiosity * deltaTimeSeconds;
    const tenacityGain = meditationStats.tenacity * deltaTimeSeconds;
    const knowledgeGain = meditationStats.knowledge * deltaTimeSeconds;

    // 3. Recalculate caps using the new tenacity/knowledge values
    const newTenacity = prev.tenacity + tenacityGain;
    const newKnowledge = prev.knowledge + knowledgeGain;
    const { vitalityCap, spiritCap } = calculateStatCaps({
      ...prev,
      tenacity: newTenacity,
      knowledge: newKnowledge,
    });

    // 4. Vitality and spirit regen: 0.5% of cap per second
    const vitalityRegen = Math.ceil(vitalityCap * 0.005) * deltaTimeSeconds;
    const spiritRegen = Math.ceil(spiritCap * 0.005) * deltaTimeSeconds;

    // 5. Lifespan only grows when actively cultivating
    const isActive = isMeditatingRef.current || prev.activeMeditationId !== null;
    const lifespanGain = isActive ? 0.1 * deltaTimeSeconds : 0;

    // 6. Meditation experience
    const updatedMeditationTypes = gainMeditationExperience(prev, deltaTimeSeconds);

    const newLifespan = Math.min(prev.lifespan + lifespanGain, prev.maxLifespan);

    // 7. Check for reincarnation: lifespan reached maxLifespan
    if (newLifespan >= prev.maxLifespan && prev.lifespan < prev.maxLifespan) {
      // Lifespan just hit the cap - trigger reincarnation
      return processReincarnation(prev);
    }

    return {
      ...prev,
      qi: Math.min(prev.qi + realmQiGain + meditationQiGain, qiRealm.qiCap),
      curiosity: prev.curiosity + curiosityGain,
      tenacity: newTenacity,
      totalTenacityEarned: (prev.totalTenacityEarned || 0) + tenacityGain,
      knowledge: newKnowledge,
      vitality: Math.min(prev.vitality + vitalityRegen, vitalityCap),
      spirit: Math.min(prev.spirit + spiritRegen, spiritCap),
      vitalityCap,
      spiritCap,
      lifespan: newLifespan,
      meditationTypes: updatedMeditationTypes,
      lastUpdate: now,
    };
  });

    // Gain meditation experience once per tick
  };

  // Main game interval
  useEffect(() => {
    intervalRef.current = setInterval(tick, tickMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    const [welcomeData, setWelcomeData] = useState<{
    showModal: boolean;
    secondsAway: number;
    statsGained: Record<string, number>;
    totalQiGained: number;
  } | null>(null);

  // Snapshot of stats when the player leaves, used to compute gains on return
  const awaySnapshotRef = useRef<Record<string, number> | null>(null);

  // Process offline gains when the player returns, using the same logic as the tick
  const processOfflineGains = (secondsAway: number, prev: PlayerState) => {
    const qiTotalIndex = prev.currentQiRealmIndex * 3 + prev.currentQiStage;
    const qiRealm = QI_REALMS[Math.min(qiTotalIndex, QI_REALMS.length - 1)];
    const baseQiGain = qiRealm.gainMultiplier * (isMeditatingRef.current ? 2 : 1);
    const realmQiGain = baseQiGain * secondsAway;

    const meditationStats = getActiveMeditationStats(prev);
    const meditationQiGain = meditationStats.qi * secondsAway;
    const curiosityGain = meditationStats.curiosity * secondsAway;
    const tenacityGain = meditationStats.tenacity * secondsAway;
    const knowledgeGain = meditationStats.knowledge * secondsAway;

    const newTenacity = prev.tenacity + tenacityGain;
    const newKnowledge = prev.knowledge + knowledgeGain;
    const { vitalityCap, spiritCap } = calculateStatCaps({
      ...prev,
      tenacity: newTenacity,
      knowledge: newKnowledge,
    });

    const vitalityRegen = Math.ceil(vitalityCap * 0.005) * secondsAway;
    const spiritRegen = Math.ceil(spiritCap * 0.005) * secondsAway;

    const isActive = isMeditatingRef.current || prev.activeMeditationId !== null;
    const lifespanGain = isActive ? 0.1 * secondsAway : 0;

    const totalQiGained = realmQiGain + meditationQiGain;

    return {
      qi: Math.min(prev.qi + totalQiGained, qiRealm.qiCap),
      curiosity: prev.curiosity + curiosityGain,
      tenacity: newTenacity,
      totalTenacityEarned: (prev.totalTenacityEarned || 0) + tenacityGain,
      knowledge: newKnowledge,
      vitality: Math.min(prev.vitality + vitalityRegen, vitalityCap),
      spirit: Math.min(prev.spirit + spiritRegen, spiritCap),
      vitalityCap,
      spiritCap,
      lifespan: Math.min(prev.lifespan + lifespanGain, prev.maxLifespan),
      statsGained: {
        curiosity: curiosityGain,
        tenacity: tenacityGain,
        knowledge: knowledgeGain,
        vitality: vitalityRegen,
        spirit: spiritRegen,
        lifespan: lifespanGain,
      } as Record<string, number>,
      totalQiGained,
    };
  };

  // Page visibility handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const secondsAway = (now - state.lastActive) / 1000;

        if (secondsAway > 60) {
          // Process offline gains synchronously and show the modal
          setState(prev => {
            const { statsGained, totalQiGained, ...updatedFields } = processOfflineGains(secondsAway, prev);

            // Show modal with actual gain data
            setWelcomeData({
              showModal: true,
              secondsAway,
              statsGained,
              totalQiGained,
            });

            return {
              ...prev,
              ...updatedFields,
              lastUpdate: now,
            };
          });
        } else {
          setState(prev => ({ ...prev, lastUpdate: now }));
        }

        awaySnapshotRef.current = null;
        
      } else {
        // Stamp when the player left so we can show how long they were away
        setState(prev => ({ ...prev, lastActive: Date.now() }));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.lastActive]);



    const resetMeditationState = () => {
    setMeditating(false);
    isMeditatingRef.current = false;
  };

  return {
    isMeditating,
    setMeditating,
    resetMeditationState,
    welcomeData,
    clearWelcomeData: () => setWelcomeData(null),
  };
}