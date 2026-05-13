import { QI_REALMS, getCurrentRealm } from "../constants/cultivationRealms";
import { useGameState } from "./useGameState";
import { useGameTick } from "./useGameTick";
import { useBreakthrough } from "./useBreakthrough";
import { useCombat } from "./useCombat";
import { useUpgrades } from "./useUpgrades";
import { useInventory } from "./useInventory";
import { useMeditation } from "./useMeditation";
import { getBattleBonuses } from "../utils/statCalc";

/**
 * Core game loop orchestrator
 * 
 * Thin composition wrapper that initializes all domain hooks
 * and composes their actions into a single API
 */
export function useGameLoop(tickMs: number = 1_000) {
  // Single source of truth for game state
  const { state, setState, resetGame: resetGameState } = useGameState();
  // Initialize all domain hooks
  const gameTick = useGameTick(state, setState, tickMs);
  const breakthrough = useBreakthrough(state, setState);
  const combat = useCombat(state, setState);
  const upgrades = useUpgrades(state, setState);
  const inventory = useInventory(state, setState);
  const meditation = useMeditation(state, setState);
  
  // Clear the reincarnation modal
  const clearReincarnation = () => {
    setState(prev => ({
      ...prev,
      showReincarnationModal: false,
      reincarnationSummary: null,
    }));
  };

  const resetGame = () => {
    resetGameState();
    gameTick.resetMeditationState();
  };

  // Debug helper
  const addTestQi = () => {
    setState(prev => ({
      ...prev,
      qi: prev.qi + 1000
    }));
  };

  // Compose and return full game API
  // type WelcomeData = {
  //   showModal: boolean;
  //   secondsAway: number;
  //   totalQiGained: number;
  //   statsGained: Record<string, number>;
  // };

  const battleBonuses = getBattleBonuses(state);

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
    totalQi: getCurrentRealm(QI_REALMS, state.currentQiRealmIndex, state.currentQiStage).qiCap,
    meditationTypes: state.meditationTypes,
    activeMeditationId: state.activeMeditationId,
    totalAttack: state.attack + battleBonuses.attack,
    totalDefense: state.defense + battleBonuses.defense,
    totalVitality: state.vitality + battleBonuses.vitality,
    totalSpirit: state.spirit + battleBonuses.spirit,
    battleTechniques: state.battleTechniques,

    // Reincarnation data
    righteousKarma: state.righteousKarma,
    demonicKarma: state.demonicKarma,
    memories: state.memories,
    reincarnationSummary: state.reincarnationSummary,
    showReincarnationModal: state.showReincarnationModal,
    clearReincarnation,

    // Welcome modal
    welcomeData: gameTick.welcomeData,
    clearWelcomeData: gameTick.clearWelcomeData,
  };
}