import type { PlayerState } from "../types/game";
import { calculateBattleBonus, calculateBattleUpgradeCost } from "../utils/statCalc";

export function useUpgrades(
  state: PlayerState,
  setState: React.Dispatch<React.SetStateAction<PlayerState>>
) {

  const upgradeBattleTechnique = (techniqueId: string) => {
    const technique = state.battleTechniques.find(t => t.id === techniqueId);
    if (!technique) return false;

    const cost = calculateBattleUpgradeCost(technique);
    if (state.spiritStones < cost) return false;

    setState(prev => ({
      ...prev,
      spiritStones: prev.spiritStones - cost,
      battleTechniques: prev.battleTechniques.map(t => {
        if (t.id !== techniqueId) return t;
        return {
          ...t,
          level: t.level + 1
        };
      })
    }));

    return true;
  };

  return {
    upgradeBattleTechnique,
    calculateBattleUpgradeCost,
    calculateBattleBonus
  };
}