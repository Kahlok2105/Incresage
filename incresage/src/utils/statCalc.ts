import type { PlayerState, BattleTechnique } from "../types/game";

/**
 * Calculate meditation stat multiplier based on level
 */
export const calculateMeditationMultiplier = (level: number) => {
  return 1 + Math.floor(level / 10);
};

/**
 * Calculate stat caps based on current realm
 */
export const calculateStatCaps = (state: PlayerState) => {
  // Base values
  const BASE_VITALITY = 100;
  const BASE_SPIRIT = 100;

  // Realm multipliers (proper 0-index scaling: realm 0 = 1x, realm 1 = 2x etc.)
  const qiMultiplier = state.currentQiRealmIndex + 1;
  const bodyMultiplier = state.currentBodyRealmIndex + 1;

  // ✅ Vitality formula: (base * qiRealmIndex * BodyRealmIndex) + sqrt(totalTenacityEarned)
  const vitalityCap = (BASE_VITALITY * qiMultiplier * bodyMultiplier) + Math.sqrt(Math.max(0, state.totalTenacityEarned));

  // ✅ Spirit formula: (base * qiRealmIndex * BodyRealmIndex) + sqrt(Knowledge)
  const spiritCap = (BASE_SPIRIT * qiMultiplier * bodyMultiplier) + Math.sqrt(Math.max(0, state.knowledge));

  return {
    vitalityCap: Math.max(100, vitalityCap),
    spiritCap: Math.max(100, spiritCap),
  };
};

/**
 * Get active meditation stats
 */
export const getActiveMeditationStats = (currentState: PlayerState) => {
  if (!currentState.activeMeditationId) {
    return { curiosity: 0, tenacity: 0, knowledge: 0, qi: 0 };
  }

  const activeMeditation = currentState.meditationTypes.find(
    (m) => m.id === currentState.activeMeditationId
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

/**
 * Calculate bonus value for a single battle technique
 */
export const calculateBattleBonus = (technique: BattleTechnique) => {
  return Math.floor(technique.baseValue * Math.pow(technique.level, 1.5));
};

/**
 * Get total battle bonuses from all techniques
 */
export const getBattleBonuses = (state: PlayerState) => {
  return state.battleTechniques.reduce((bonuses, technique) => {
    const bonus = calculateBattleBonus(technique);
    return {
      ...bonuses,
      [technique.stat]: (bonuses[technique.stat as keyof typeof bonuses] || 0) + bonus
    };
  }, { attack: 0, defense: 0, vitality: 0, spirit: 0 });
};

/**
 * Calculate upgrade cost for battle technique
 */
export const calculateBattleUpgradeCost = (technique: BattleTechnique) => {
  return Math.floor(technique.baseValue * Math.pow(1.15, technique.level));
};
