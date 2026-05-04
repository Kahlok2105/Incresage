import { useEffect, useRef, useState } from "react";
import type { PlayerState } from "../types/game";
import { QI_REALMS } from "../constants/cultivationRealms";
import { calculateStatCaps, getActiveMeditationStats } from "../utils/statCalc";
import { gainMeditationExperience } from "./useMeditation";

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
    const qiRealm = QI_REALMS[prev.currentQiRealmIndex];
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

    return {
      ...prev,
      qi: Math.min(prev.qi + realmQiGain + meditationQiGain, qiRealm.qiCap),
      curiosity: prev.curiosity + curiosityGain,
      tenacity: newTenacity,
      knowledge: newKnowledge,
      vitality: Math.min(prev.vitality + vitalityRegen, vitalityCap),
      spirit: Math.min(prev.spirit + spiritRegen, spiritCap),
      vitalityCap,
      spiritCap,
      lifespan: Math.min(prev.lifespan + lifespanGain, prev.maxLifespan),
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

  // Page visibility handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reset lastUpdate so the next tick doesn't produce a massive delta spike
        const now = Date.now();
        const secondsAway = (now - state.lastActive) / 1000;  // ← must be here, before the if

          if (secondsAway > 60) {
            setWelcomeData({
              showModal: true,
              secondsAway,
              statsGained: {},
              totalQiGained: 0,
            });
          }
        setState(prev => ({ ...prev, lastUpdate: Date.now() }));
        
      } else {
        // Stamp when the player left so we can show how long they were away
        setState(prev => ({ ...prev, lastActive: Date.now() }));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);



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