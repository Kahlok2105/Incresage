import type { PlayerState } from "../types/game";
import type { Monster } from "../types/combat";
import { MONSTERS } from "../constants/monsters";
import { resolveItemDrops, mergeInventoryItems } from "../utils/inventoryUtils";

export function useCombat(
  state: PlayerState,
  setState: React.Dispatch<React.SetStateAction<PlayerState>>
) {

  const addBodyExp = (amount: number) => {
    setState(prev => {
      const newBodyExp = prev.bodyExp + amount;
      const newBodyLevel = newBodyExp > 0
        ? Math.floor(Math.pow(newBodyExp / 100, 1 / 1.8)) + 1
        : 1;
      return { ...prev, bodyExp: newBodyExp, bodyLevel: newBodyLevel };
    });
  };

  const processMonsterVictory = (monster: Monster) => {
    setState(prev => {
      // Get item drops
      const droppedItems = monster.drops.items
      ? resolveItemDrops(monster.drops.items)
        : [];

        const alreadyDefeated = prev.defeatedMonsters.includes(monster.id);
        const tpGained = alreadyDefeated ? 0 : (monster.tpReward ?? 0);
      
        return {
        ...prev,
        spiritStones: prev.spiritStones + monster.drops.spiritStones,
        defeatedMonsters: [...new Set([...prev.defeatedMonsters, monster.id])],
        inventory: mergeInventoryItems(prev.inventory, droppedItems),
        unlockedFeatures: [...new Set([...prev.unlockedFeatures, `defeated_${monster.id}`])],
        tribulationPoints: prev.tribulationPoints + tpGained,
      };
    });

    // Add body experience
    addBodyExp(Math.floor(monster.expReward / 2));
  };

  const getRandomMonster = () => {
    const maxDifficulty = Math.max(1, Math.floor(state.bodyLevel / 5) + 1);
    const availableMonsters = MONSTERS.filter(m => m.difficulty <= maxDifficulty);
    return availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
  };

  return {
    processMonsterVictory,
    addBodyExp,
    getRandomMonster
  };
}