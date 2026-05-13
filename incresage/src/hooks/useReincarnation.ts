import type { PlayerState, ReincarnationSummary } from "../types/game";
import { BATTLE_TECHNIQUES } from "../constants/techniques";
import { calculateStatCaps } from "../utils/statCalc";

/**
 * Calculate the righteous karma gained from meditation.
 * Called per tick from useMeditation.
 */
export function calculateRighteousKarmaFromMeditation(meditationLevel: number, deltaTimeSeconds: number): number {
  return 0.01 * meditationLevel * deltaTimeSeconds;
}

/**
 * Calculate demonic karma from a monster kill (capped per monster per life).
 */
export function calculateDemonicKarmaFromKill(monsterDifficulty: number): number {
  return 2 * monsterDifficulty;
}

/**
 * Righteous karma from a successful Qi breakthrough.
 */
export function calculateRighteousKarmaFromQiBreakthrough(realmTier: number): number {
  return 10 * (realmTier + 1);
}

/**
 * Demonic karma from a successful Body breakthrough.
 */
export function calculateDemonicKarmaFromBodyBreakthrough(bodyRealmTier: number): number {
  return 15 * (bodyRealmTier + 1);
}

/**
 * Demonic karma from consuming a pill.
 */
export function calculateDemonicKarmaFromPill(): number {
  return 5;
}

/**
 * Calculate memories earned for reincarnation.
 * Based on lifetime achievements.
 */
export function calculateMemoriesFromLife(summary: {
  highestQiRealm: number;
  highestBodyRealm: number;
  totalMonstersDefeated: number;
  totalQiBreakthroughs: number;
  totalBodyBreakthroughs: number;
}): number {
  let memories = 0;
  // 1 memory per unique realm breakthrough (qi)
  memories += summary.highestQiRealm;
  // 1 memory per unique realm breakthrough (body)
  memories += summary.highestBodyRealm;
  // 1 memory per 10 monsters defeated
  memories += Math.floor(summary.totalMonstersDefeated / 10);
  // Bonus memories for milestones
  if (summary.highestQiRealm >= 3) memories += 3; // Core Formation+
  if (summary.highestBodyRealm >= 3) memories += 3;
  if (summary.totalMonstersDefeated >= 100) memories += 5;
  return Math.max(1, Math.floor(memories));
}

/**
 * Calculate karma gained on reincarnation from lifetime stats.
 */
export function calculateKarmaFromLife(summary: {
  totalLifespanLived: number;
  highestQiRealm: number;
  totalMonstersDefeated: number;
}, totalTenacityEarned: number): { righteousKarma: number; demonicKarma: number } {
  // Righteous: from lifespan lived + tenacity earned + qi realm
  const righteousFromLifespan = Math.floor(summary.totalLifespanLived / 10);
  const righteousFromTenacity = Math.floor(totalTenacityEarned / 100);
  const righteousFromRealm = summary.highestQiRealm * 5;

  // Demonic: from monsters defeated
  const demonicFromKills = Math.floor(summary.totalMonstersDefeated * 1.5);

  return {
    righteousKarma: righteousFromLifespan + righteousFromTenacity + righteousFromRealm,
    demonicKarma: demonicFromKills,
  };
}

/**
 * Reset player to mortal state for reincarnation, preserving:
 * - Meditation levels
 * - Karma and Memories totals
 * - Reincarnation count
 */
export function createReincarnatedState(prev: PlayerState): PlayerState {
  const caps = calculateStatCaps({
    ...prev,
    currentQiRealmIndex: 0,
    currentQiStage: 0,
    currentBodyRealmIndex: 0,
    currentBodyStage: 0,
    tenacity: 0,
    knowledge: 0,
  });

  return {
    ...prev,
    // Reset reincarnation modal flag
    showReincarnationModal: false,
    reincarnationSummary: null,

    // Reset cultivation
    qi: 0,
    spiritStones: 0,
    currentQiRealmIndex: 0,
    currentQiStage: 0,
    currentBodyRealmIndex: 0,
    currentBodyStage: 0,

    // Reset vitality/spirit
    vitality: 0,
    spirit: 0,
    vitalityCap: caps.vitalityCap,
    spiritCap: caps.spiritCap,
    attack: 5,
    defense: 5,

    // Reset mental stats
    curiosity: 0,
    tenacity: 0,
    totalTenacityEarned: 0,
    knowledge: 0,

    // Reset lifespan
    lifespan: 0,
    maxLifespan: 100,

    // Reset combat-related
    bodyExp: 0,
    bodyLevel: 1,
    tribulationPoints: 0,
    defeatedMonsters: [],
    monsterKarmaEarned: {},

    // Reset upgrades
    battleTechniques: BATTLE_TECHNIQUES.map(bt => ({ ...bt })),

    // Keep meditation types but DON'T reset their levels (per user request)
    // Keep inventory

    // Reset active meditation
    activeMeditationId: null,

    // Reset feature unlocks
    unlockedFeatures: [],

    // Increment reincarnation count
    reincarnationCount: prev.reincarnationCount + 1,

    // lastUpdate / lastActive timestamps
    lastUpdate: Date.now(),
    lastActive: Date.now(),
  };
}

/**
 * Build a reincarnation summary from the current lifetime stats.
 */
export function buildReincarnationSummary(
  prev: PlayerState
): ReincarnationSummary {
  const { lifetimeStats } = prev;

  // Calculate karma from lifetime achievements
  const karmaFromLife = calculateKarmaFromLife(lifetimeStats, prev.totalTenacityEarned);

  // Calculate memories
  const memoriesGained = calculateMemoriesFromLife(lifetimeStats);

  return {
    lifeNumber: prev.reincarnationCount + 1,
    lifespanLived: prev.lifespan,
    highestQiRealm: Math.max(lifetimeStats.highestQiRealm, prev.currentQiRealmIndex),
    highestBodyRealm: Math.max(lifetimeStats.highestBodyRealm, prev.currentBodyRealmIndex),
    totalMonstersDefeated: lifetimeStats.totalMonstersDefeated,
    totalQiBreakthroughs: lifetimeStats.totalQiBreakthroughs,
    totalBodyBreakthroughs: lifetimeStats.totalBodyBreakthroughs,
    righteousKarmaGained: karmaFromLife.righteousKarma,
    demonicKarmaGained: karmaFromLife.demonicKarma,
    memoriesGained,
  };
}

/**
 * Process reincarnation: calculate rewards, reset state, apply rewards.
 */
export function processReincarnation(
  prev: PlayerState
): PlayerState {
  // Build summary from current life
  const summary = buildReincarnationSummary(prev);

  // Create reset state
  const resetState = createReincarnatedState(prev);

  // Apply karma and memories gains
  return {
    ...resetState,
    righteousKarma: prev.righteousKarma + summary.righteousKarmaGained,
    demonicKarma: prev.demonicKarma + summary.demonicKarmaGained,
    memories: prev.memories + summary.memoriesGained,
    showReincarnationModal: true,
    reincarnationSummary: summary,
    // Reset lifetime stats for the new life
    lifetimeStats: {
      totalLifespanLived: 0,
      highestQiRealm: 0,
      highestBodyRealm: 0,
      totalMonstersDefeated: 0,
      totalQiBreakthroughs: 0,
      totalBodyBreakthroughs: 0,
    },
  };
}