import { useState } from "react";
import type { PlayerState } from "../types/game";
import { MEDITATION_TYPES } from "../constants/meditations";
import { BATTLE_TECHNIQUES } from "../constants/techniques";
import { calculateLifespan } from "../utils/gameMath";
import { calculateStatCaps } from "../utils/statCalc";

export const DEFAULT_STATE: PlayerState = {
  qi: 0,
  spiritStones: 0,

  currentQiRealmIndex: 0,
  currentQiStage: 0,

  currentBodyRealmIndex: 0,
  currentBodyStage: 0,

  lastUpdate: Date.now(),
  lastActive: Date.now(),

  vitality: 0,
  spirit: 0,
  vitalityCap: 100,
  spiritCap: 100,
  attack: 5,
  defense: 5,
  knowledge: 0,

  curiosity: 0,
  tenacity: 0,
  totalTenacityEarned: 0,

  lifespan: 0,
  maxLifespan: 100,

  unlockedFeatures: [],
  meditationTypes: [...MEDITATION_TYPES],
  battleTechniques: [...BATTLE_TECHNIQUES],
  activeMeditationId: null,
  bodyExp: 0,
  bodyLevel: 1,
  tribulationPoints: 0,
  defeatedMonsters: [],
  inventory: [],

  // Reincarnation system defaults
  righteousKarma: 0,
  demonicKarma: 0,
  memories: 0,
  reincarnationCount: 0,
  showReincarnationModal: false,
  reincarnationSummary: null,
  lifetimeStats: {
    totalLifespanLived: 0,
    highestQiRealm: 0,
    highestBodyRealm: 0,
    totalMonstersDefeated: 0,
    totalQiBreakthroughs: 0,
    totalBodyBreakthroughs: 0,
  },
  monsterKarmaEarned: {},
};

export function useGameState() {
  // Load persisted state if available
  const persisted = typeof localStorage !== "undefined" ? localStorage.getItem("gameState") : null;

  const initialState: PlayerState = persisted
    ? (() => {
        const parsed = JSON.parse(persisted);

        // Migrate old vitality field to tenacity for backward compatibility
        const migratedTenacity = parsed.tenacity || parsed.vitality || 0;
        const migratedTotalTenacity = parsed.totalTenacityEarned ?? migratedTenacity;

        // Migrate old single realm system to new dual cultivation system
        const oldRealmIndex = parsed.currentRealmIndex || 0;

        // Calculate lifespan based on highest attained realm
        const maxLifespan = calculateLifespan(oldRealmIndex);

        return {
          ...parsed,
          lastActive: parsed.lastActive || Date.now(),

          // Migrate old realm index to new dual system
          currentQiRealmIndex: parsed.currentQiRealmIndex ?? oldRealmIndex,
          currentQiStage: parsed.currentQiStage ?? 0,
          currentBodyRealmIndex: parsed.currentBodyRealmIndex ?? 0,
          currentBodyStage: parsed.currentBodyStage ?? 0,

          vitality: parsed.vitality || 0,
          tenacity: migratedTenacity,
          totalTenacityEarned: migratedTotalTenacity,

          // Calculate proper stat caps
          ...calculateStatCaps({
            ...parsed,
            currentQiRealmIndex: parsed.currentQiRealmIndex ?? oldRealmIndex,
            currentBodyRealmIndex: parsed.currentBodyRealmIndex ?? 0,
            tenacity: migratedTenacity,
            knowledge: parsed.knowledge ?? 0
          }),

          lifespan: parsed.lifespan ?? maxLifespan,
          maxLifespan: parsed.maxLifespan ?? maxLifespan,

          // Ensure battleTechniques exists for migration
          battleTechniques: parsed.battleTechniques || [...BATTLE_TECHNIQUES],
          inventory: (parsed.inventory || []).map((item: any) => {
            if (item.type === 'equipment' || 'slot' in item) {
              return { ...item, type: 'equipment', isEquipped: item.isEquipped ?? false };
            }
            return item;
          }),

          // Reincarnation system defaults for migration
          righteousKarma: parsed.righteousKarma ?? 0,
          demonicKarma: parsed.demonicKarma ?? 0,
          memories: parsed.memories ?? 0,
          reincarnationCount: parsed.reincarnationCount ?? 0,
          showReincarnationModal: parsed.showReincarnationModal ?? false,
          reincarnationSummary: parsed.reincarnationSummary ?? null,
          lifetimeStats: parsed.lifetimeStats ?? {
            totalLifespanLived: 0,
            highestQiRealm: 0,
            highestBodyRealm: 0,
            totalMonstersDefeated: 0,
            totalQiBreakthroughs: 0,
            totalBodyBreakthroughs: 0,
          },
          monsterKarmaEarned: parsed.monsterKarmaEarned ?? {},
        };
      })()
    : { ...DEFAULT_STATE, lastUpdate: Date.now(), lastActive: Date.now() };

  const [state, setState] = useState<PlayerState>(initialState);

  // Auto-persist state on change
  const setStateAndPersist: React.Dispatch<React.SetStateAction<PlayerState>> = (updater) => {
    setState(prev => {
      const newState = typeof updater === 'function'
        ? (updater as (prev: PlayerState) => PlayerState)(prev)
        : updater;

      if (typeof localStorage !== "undefined") {
        localStorage.setItem("gameState", JSON.stringify(newState));
      }

      return newState;
    });
  };

  const resetGame = () => {
    if (window.confirm("Are you sure? This will wipe all cultivation progress.")) {
      localStorage.removeItem("gameState");
      setStateAndPersist(DEFAULT_STATE);
    }
  };

  return {
    state,
    setState: setStateAndPersist,
    resetGame
  };
}