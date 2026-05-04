import type { PlayerState } from "../types/game";
import { QI_REALMS, BODY_REALMS } from "../constants/cultivationRealms";
import { calculateStatCaps } from "../utils/statCalc";

export function useBreakthrough(
  state: PlayerState,
  setState: React.Dispatch<React.SetStateAction<PlayerState>>
) {

  const calculateBreakthroughChance = (): number => {
    const currentRealm = QI_REALMS[state.currentQiRealmIndex];
    const baseChance = currentRealm.baseSuccessRate;
    const tenacityBonus = Math.min(0.5, state.tenacity / 1000);
    return Math.min(0.95, baseChance + tenacityBonus);
  };

  const calculateBodyBreakthroughChance = (): number => {
    const currentRealm = BODY_REALMS[state.currentBodyRealmIndex];
    const baseChance = currentRealm.baseSuccessRate;
    const tenacityBonus = Math.min(0.5, state.tenacity / 1000);
    return Math.min(0.95, baseChance + tenacityBonus);
  };

  const getBodyStageIndex = () => {
    return state.currentBodyStage % 9;
  };

  const applyBreakthrough = () => {
    setState(prev => {
      const nextRealmIndex = prev.currentQiRealmIndex + 1;
      const nextRealm = QI_REALMS[nextRealmIndex];

      if (!nextRealm) return prev;

      const { vitalityCap, spiritCap } = calculateStatCaps({
        ...prev,
        currentQiRealmIndex: nextRealmIndex
      });

      return {
        ...prev,
        currentQiRealmIndex: nextRealmIndex,
        currentQiStage: 0,
        qi: 0,
        vitalityCap,
        spiritCap,
        unlockedFeatures: [...new Set([...prev.unlockedFeatures, `qi_realm_${nextRealmIndex}`])]
      };
    });
  };

  const tryBreakthrough = () => {
    const successChance = calculateBreakthroughChance();
    const roll = Math.random();

    if (roll < successChance) {
      applyBreakthrough();
      return true;
    } else {
      setState(prev => ({
        ...prev,
        qi: Math.floor(prev.qi * 0.7)
      }));
      return false;
    }
  };

  const tryBreakthroughGuaranteed = () => {
    applyBreakthrough();
    return true;
  };

  const tryBodyBreakthrough = () => {
    const successChance = calculateBodyBreakthroughChance();
    const roll = Math.random();

    if (roll < successChance) {
      setState(prev => {
        const nextStage = prev.currentBodyStage + 1;
        const nextRealmIndex = Math.floor(nextStage / 9);
        const { vitalityCap, spiritCap } = calculateStatCaps({
          ...prev,
          currentBodyRealmIndex: nextRealmIndex
        });

        return {
          ...prev,
          currentBodyStage: nextStage,
          currentBodyRealmIndex: nextRealmIndex,
          bodyExp: 0,
          vitalityCap,
          spiritCap,
          unlockedFeatures: [...new Set([...prev.unlockedFeatures, `body_stage_${nextStage}`])]
        };
      });
      return true;
    } else {
      setState(prev => ({
        ...prev,
        bodyExp: Math.floor(prev.bodyExp * 0.8)
      }));
      return false;
    }
  };

  return {
    applyBreakthrough,
    tryBreakthrough,
    tryBreakthroughGuaranteed,
    tryBodyBreakthrough,
    calculateBreakthroughChance,
    calculateBodyBreakthroughChance,
    getBodyStageIndex
  };
}