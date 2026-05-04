import { useEffect, useRef, useState } from "react";
import type { PlayerState } from "../types/game";
import { QI_REALMS } from "../constants/cultivationRealms";
import { calculateStatCaps, getActiveMeditationStats } from "../utils/statCalc";
import { useMeditation } from "./useMeditation";

export function useGameTick(
  state: PlayerState,
  setState: React.Dispatch<React.SetStateAction<PlayerState>>,
  tickMs: number = 1_000
) {
  const [isMeditating, setMeditating] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMeditatingRef = useRef(isMeditating);

  const meditation = useMeditation(state, setState);

  // Keep ref in sync
  useEffect(() => {
    isMeditatingRef.current = isMeditating;
  }, [isMeditating]);

  const tick = () => {
    if (!isMeditatingRef.current) return;

    setState(prev => {
      const now = Date.now();
      const delta = now - prev.lastUpdate;

      if (delta < tickMs) return prev;

      const meditationStats = getActiveMeditationStats(prev);
      const currentQiRealm = QI_REALMS[prev.currentQiRealmIndex];

      // Calculate stat caps
      const { vitalityCap, spiritCap } = calculateStatCaps(prev);

      return {
        ...prev,
        lastUpdate: now,

        // Apply passive stat gains
        curiosity: prev.curiosity + meditationStats.curiosity,
        tenacity: prev.tenacity + meditationStats.tenacity,
        knowledge: prev.knowledge + meditationStats.knowledge,
        qi: Math.min(
          currentQiRealm.qiCap,
          prev.qi + (currentQiRealm.gainMultiplier * meditationStats.qi)
        ),

        vitality: Math.min(vitalityCap, prev.vitality),
        spirit: Math.min(spiritCap, prev.spirit),

        vitalityCap,
        spiritCap
      };
    });

    // Gain meditation experience once per tick
    meditation.gainMeditationExperience();
  };

  // Handle offline progress
  const catchUpOfflineProgress = () => {
    const now = Date.now();
    const offlineTime = now - state.lastActive;

    if (offlineTime > 10_000) {
      // Only catch up if offline for more than 10 seconds
      const tickCount = Math.floor(offlineTime / tickMs);

      for (let i = 0; i < Math.min(tickCount, 3600); i++) { // Max 1 hour catch up
        tick();
      }
    }
  };

  // Main game interval
  useEffect(() => {
    catchUpOfflineProgress();

    intervalRef.current = setInterval(tick, tickMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Page visibility handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        catchUpOfflineProgress();
      } else {
        setState(prev => ({
          ...prev,
          lastActive: Date.now()
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return {
    isMeditating,
    setMeditating,
    tick
  };
}