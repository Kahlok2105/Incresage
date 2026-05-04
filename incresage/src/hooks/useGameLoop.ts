import { useGameState } from "./useGameState";
import { useGameTick } from "./useGameTick";
import { useBreakthrough } from "./useBreakthrough";
import { useCombat } from "./useCombat";
import { useUpgrades } from "./useUpgrades";
import { useInventory } from "./useInventory";
import { useMeditation } from "./useMeditation";

/**
 * Core game loop orchestrator
 * 
 * Thin composition wrapper that initializes all domain hooks
 * and composes their actions into a single API
 */
export function useGameLoop(tickMs: number = 1_000) {
  // Single source of truth for game state
  const { state, setState, resetGame } = useGameState();

  // Initialize all domain hooks
  const gameTick = useGameTick(state, setState, tickMs);
  const breakthrough = useBreakthrough(state, setState);
  const combat = useCombat(state, setState);
  const upgrades = useUpgrades(state, setState);
  const inventory = useInventory(state, setState);
  const meditation = useMeditation(state, setState);

  // Debug helper
  const addTestQi = () => {
    setState(prev => ({
      ...prev,
      qi: prev.qi + 1000
    }));
  };

  // Compose and return full game API
  type WelcomeData = {
    showModal: boolean;
    secondsAway: number;
    totalQiGained: number;
    statsGained: Record<string, number>;
  };

  return {
    state,
    setState,

    // Game control
    resetGame,
    addTestQi,

    // Meditation
    isMeditating: gameTick.isMeditating,
    setMeditating: gameTick.setMeditating,
    ...meditation,

    // Breakthrough
    ...breakthrough,

    // Combat
    ...combat,

    // Upgrades
    ...upgrades,

    // Inventory
    ...inventory,

    // Calculated stats for UI
    usableQi: state.qi,
    totalQi: state.qi,
    meditationTypes: state.meditationTypes,
    activeMeditationId: state.activeMeditationId,
    totalAttack: state.attack,
    totalDefense: state.defense,
    totalVitality: state.vitality,
    totalSpirit: state.spirit,
    battleTechniques: state.battleTechniques,

    // Welcome modal
    welcomeData: null as WelcomeData | null,
    clearWelcomeData: () => {}
  };
}