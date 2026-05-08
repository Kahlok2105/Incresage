import type { PlayerState } from "../types/game";
import { calculateLifespan, calculateTenacityRequired, calculateTPRequired } from "../utils/gameMath";
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
    const bodyStageIndex = state.currentBodyRealmIndex * 3 + state.currentBodyStage;
    const currentRealm = BODY_REALMS[bodyStageIndex];
    const baseChance = currentRealm.baseSuccessRate;

    // Tenacity ratio: min(1, currentTenacity / tenacityRequired)
    const tenacityRequired = calculateTenacityRequired(bodyStageIndex);
    const tenacityRatio = Math.min(1, state.tenacity / Math.max(1, tenacityRequired));

    // TP ratio: min(1, tribulationPoints / tpRequired)
    const tpRequired = calculateTPRequired(bodyStageIndex);
    const tpRatio = Math.min(1, state.tribulationPoints / Math.max(1, tpRequired));

    // Body level ratio: min(1.5, bodyLevel / requiredBodyLevel)
    const requiredBodyLevel = bodyStageIndex + 1;
    const levelRatio = Math.min(1.5, state.bodyLevel / Math.max(1, requiredBodyLevel));

    // Multiplicative chance formula from game_design
    const chance = baseChance * tenacityRatio * tpRatio * levelRatio;
    return Math.min(1, chance);
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
    const bodyStageIndex = state.currentBodyRealmIndex * 3 + state.currentBodyStage;
    const nextBodyIndex = bodyStageIndex + 1;
    const nextRealm = BODY_REALMS[nextBodyIndex];

    // Check if max realm reached
    if (!nextRealm) return false;

    // Check minimum requirements (50% of each resource)
    const tenacityRequired = calculateTenacityRequired(bodyStageIndex);
    const tpRequired = calculateTPRequired(bodyStageIndex);
    const requiredBodyLevel = bodyStageIndex + 1;

    const hasEnoughTenacity = state.tenacity >= tenacityRequired * 0.5;
    const hasEnoughTP = state.tribulationPoints >= tpRequired * 0.5;
    const hasEnoughLevel = state.bodyLevel >= requiredBodyLevel * 0.5;

    if (!hasEnoughTenacity || !hasEnoughTP || !hasEnoughLevel) return false;

    const successChance = calculateBodyBreakthroughChance();
    const roll = Math.random();

    if (roll < successChance) {
      setState(prev => {
        const newBodyIndex = prev.currentBodyRealmIndex * 3 + prev.currentBodyStage + 1;
        const newRealm = BODY_REALMS[newBodyIndex];
        if (!newRealm) return prev;

        const newRealmIndex = Math.floor(newBodyIndex / 3);
        const newStage = newBodyIndex % 3;

        const { vitalityCap, spiritCap } = calculateStatCaps({
          ...prev,
          currentBodyRealmIndex: newRealmIndex,
        });

        return {
          ...prev,
          currentBodyStage: newStage,
          currentBodyRealmIndex: newRealmIndex,
          bodyExp: 0,
          vitalityCap,
          spiritCap,
        };
      });
      return true;
    } else {
      setState(prev => {
        const reducedTenacity = Math.max(0, prev.tenacity * 0.7);
        const reducedBodyLevel = Math.max(1, prev.bodyLevel - 1);

        const { vitalityCap, spiritCap } = calculateStatCaps({
          ...prev,
          tenacity: reducedTenacity,
        });

        return {
          ...prev,
          tenacity: reducedTenacity,
          bodyLevel: reducedBodyLevel,
          vitalityCap,
          spiritCap,
        };
      });
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