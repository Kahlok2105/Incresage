import type { PlayerState } from "../types/game";
import { calculateMeditationMultiplier } from "../utils/statCalc";

/**
 * Calculate experience required for next meditation level
 */
const calculateExpRequired = (level: number) => {
  return Math.floor(100 * Math.pow(1.15, level - 1));
};

export function useMeditation(state: PlayerState, setState: React.Dispatch<React.SetStateAction<PlayerState>>) {

  const gainMeditationExperience = () => {
    if (!state.activeMeditationId) return;

    setState(prev => {
      const meditationTypes = prev.meditationTypes.map(meditation => {
        if (meditation.id !== prev.activeMeditationId) return meditation;

        const newExp = meditation.currentExp + 1;
        let { level, currentExp, expToNextLevel } = meditation;

        if (newExp >= expToNextLevel) {
          level += 1;
          currentExp = 0;
          expToNextLevel = calculateExpRequired(level);
        } else {
          currentExp = newExp;
        }

        return {
          ...meditation,
          level,
          currentExp,
          expToNextLevel
        };
      });

      return {
        ...prev,
        meditationTypes
      };
    });
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
      curiosity: activeMeditation.baseCuriosity * multiplier,
      tenacity: activeMeditation.baseTenacity * multiplier,
      knowledge: activeMeditation.baseKnowledge * multiplier,
      qi: activeMeditation.baseQi * multiplier,
    };
  };

  return {
    gainMeditationExperience,
    calculateExpRequired,
    setActiveMeditation,
    levelUpMeditation,
    getCurrentMeditationStats
  };
}