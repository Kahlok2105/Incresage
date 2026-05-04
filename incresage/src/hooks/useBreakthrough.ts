import type { PlayerState } from "../types/game";
import { calculateLifespan } from "../utils/gameMath";
import { QI_REALMS, BODY_REALMS } from "../constants/cultivationRealms";
import { calculateStatCaps } from "../utils/statCalc";

export function useBreakthrough(
  state: PlayerState,
  setState: React.Dispatch<React.SetStateAction<PlayerState>>
) {

  const calculateBreakthroughChance = (): number => {
    const currentIndex = state.currentQiRealmIndex * 3 + state.currentQiStage;
    const nextRealm = QI_REALMS[currentIndex + 1];
    if (!nextRealm) return 0;
    const ratio = Math.min(1, state.qi / nextRealm.qiRequired);
    return nextRealm.baseSuccessRate * ratio;
  };

  const calculateBodyBreakthroughChance = (): number => {
    const currentRealm = BODY_REALMS[state.currentBodyRealmIndex];
    const baseChance = currentRealm.baseSuccessRate;
    const tenacityBonus = Math.min(0.5, state.tenacity / 1000);
    return Math.min(0.95, baseChance + tenacityBonus);
  };

  const getBodyStageIndex = () => {
    return state.currentBodyRealmIndex * 3 + state.currentBodyStage;
  };

  const applyBreakthrough = (currentIndex: number) => {
    setState(prev => {
    const newIndex = currentIndex + 1;
    const newRealmIndex = Math.floor(newIndex / 3);
    const newStage = newIndex % 3;
    const nextRealm = QI_REALMS[newIndex];

    if (!nextRealm) return prev;

    const { vitalityCap, spiritCap } = calculateStatCaps({
      ...prev,
      currentQiRealmIndex: newRealmIndex,
      currentQiStage: newStage,
    });

    const newFeatures = [...prev.unlockedFeatures];
    if (newRealmIndex >= 1 && !newFeatures.includes("monster")) newFeatures.push("monster");
    if (newRealmIndex >= 2 && !newFeatures.includes("alchemy")) newFeatures.push("alchemy");
    if (newRealmIndex >= 3 && !newFeatures.includes("bodyCultivation")) newFeatures.push("bodyCultivation");

    return {
      ...prev,
      currentQiRealmIndex: newRealmIndex,
      currentQiStage: newStage,
      qi: 0,
      vitalityCap,
      spiritCap,
      maxLifespan: calculateLifespan(newIndex),
      unlockedFeatures: newFeatures,
    };
  });
};

  const tryBreakthrough = (): { success: boolean; chance: number } => {
    const currentIndex = state.currentQiRealmIndex * 3 + state.currentQiStage;
    const nextRealm = QI_REALMS[currentIndex + 1];
    if (!nextRealm) return { success: false, chance: 0 };

    const chance = calculateBreakthroughChance();
    const canAttempt = state.qi >= nextRealm.qiRequired / 2;
    if (!canAttempt) return { success: false, chance };

    const roll = Math.random();
    const success = roll < chance;

    if (success) {
      applyBreakthrough(currentIndex);
    } else {
      setState(prev => ({ ...prev, qi: Math.max(0, prev.qi * 0.5) }));
    }

    return { success, chance };
  };

  const tryBreakthroughGuaranteed = (): { success: boolean; chance: number } => {
    const currentIndex = state.currentQiRealmIndex * 3 + state.currentQiStage;
    const nextRealm = QI_REALMS[currentIndex + 1];
    if (!nextRealm) return { success: false, chance: 0 };

    const chance = calculateBreakthroughChance();
    const canAttempt = state.qi >= nextRealm.qiRequired / 2;
    if (!canAttempt) return { success: false, chance };

    applyBreakthrough(currentIndex);
    return { success: true, chance: 1 };
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