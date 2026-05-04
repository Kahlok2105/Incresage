import type { PlayerState } from "../types/game";
import { calculateMeditationMultiplier } from "../utils/statCalc";

/**
 * Calculate experience required for next meditation level
 */
const calculateExpRequired = (level: number) => {
  return Math.floor(100 * Math.pow(1.15, level - 1));
};

    export const gainMeditationExperience = (
      prev: PlayerState,
      deltaTimeSeconds: number
    ) => {
      if (!prev.activeMeditationId) return prev.meditationTypes;

      return prev.meditationTypes.map(meditation => {
        if (meditation.id !== prev.activeMeditationId) return meditation;

        let newExp = meditation.currentExp + deltaTimeSeconds;
        let newLevel = meditation.level;
        let newExpToNextLevel = meditation.expToNextLevel;

        while (newExp >= newExpToNextLevel && newLevel < meditation.maxLevel) {
          newExp -= newExpToNextLevel;
          newLevel += 1;
          newExpToNextLevel = calculateExpRequired(newLevel);
        }

        return { ...meditation, level: newLevel, currentExp: newExp, expToNextLevel: newExpToNextLevel };
      });
    };

export function useMeditation(state: PlayerState, setState: React.Dispatch<React.SetStateAction<PlayerState>>) {

    const gainMeditationExperienceTick = () => {
    if (!state.activeMeditationId) return;
    setState(prev => ({
      ...prev,
      meditationTypes: gainMeditationExperience(prev, 1)
    }));
  };

  const setActiveMeditation = (meditationId: string | null) => {
    setState(prev => ({
      ...prev,
      activeMeditationId: meditationId
    }));
  };

  const levelUpMeditation = (meditationId: string) => {
    setState(prev => {
      const meditationTypes = prev.meditationTypes.map(meditation => {
        if (meditation.id !== meditationId) return meditation;

        const level = meditation.level + 1;
        return {
          ...meditation,
          level,
          expToNextLevel: calculateExpRequired(level)
        };
      });

      return {
        ...prev,
        meditationTypes
      };
    });
  };

  const getCurrentMeditationStats = () => {
    if (!state.activeMeditationId) {
      return { curiosity: 0, tenacity: 0, knowledge: 0, qi: 0 };
    }

    const activeMeditation = state.meditationTypes.find(
      (m) => m.id === state.activeMeditationId
    );

    if (!activeMeditation) {
      return { curiosity: 0, tenacity: 0, knowledge: 0, qi: 0 };
    }

    const multiplier = calculateMeditationMultiplier(activeMeditation.level);

    return {
      curiosity: activeMeditation.baseCuriosity * activeMeditation.level * multiplier,
      tenacity: activeMeditation.baseTenacity * activeMeditation.level * multiplier,
      knowledge: activeMeditation.baseKnowledge * activeMeditation.level * multiplier,
      qi: activeMeditation.baseQi * activeMeditation.level * multiplier,
    };
  };

  return {
    gainMeditationExperience: gainMeditationExperienceTick,
    calculateExpRequired,
    setActiveMeditation,
    levelUpMeditation,
    getCurrentMeditationStats
  };
}