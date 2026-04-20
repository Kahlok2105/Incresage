/**
 * Universal game math utilities
 * Clean number formatting and calculation helpers
 */

/**
 * Converts raw calculated values into clean, player-friendly numbers
 * Works consistently across all stats: Qi, lifespan, experience, combat values etc.
 */
export const getCleanNumber = (value: number, options: {
  allowDecimals?: boolean;
  significantDigits?: number;
  roundDirection?: 'up' | 'down' | 'nearest';
  minStep?: number;
} = {}): number => {
  const {
    allowDecimals = false,
    significantDigits = 2,
    roundDirection = 'nearest',
    minStep = 1
  } = options;

  if (value === 0) return 0;
  if (!Number.isFinite(value)) return 0;

  // Get magnitude of the number
  const absolute = Math.abs(value);
  const magnitude = Math.pow(10, Math.floor(Math.log10(absolute)));
  const normalized = absolute / magnitude;

  // Round to requested significant digits
  const multiplier = Math.pow(10, significantDigits - 1);
  let rounded: number;
  
  switch (roundDirection) {
    case 'up':
      rounded = Math.ceil(normalized * multiplier) / multiplier;
      break;
    case 'down':
      rounded = Math.floor(normalized * multiplier) / multiplier;
      break;
    default:
      rounded = Math.round(normalized * multiplier) / multiplier;
  }

  let cleanValue = rounded * magnitude;

  // Apply minimum step rounding
  if (minStep > 1) {
    cleanValue = Math.round(cleanValue / minStep) * minStep;
  }

  // Remove decimals unless explicitly allowed
  if (!allowDecimals) {
    cleanValue = Math.round(cleanValue);
  }

  // Preserve original sign
  return value < 0 ? -cleanValue : cleanValue;
};

/**
 * Calculate lifespan based on total realm index (realm * 3 + stage)
 */
export const calculateLifespan = (totalRealmIndex: number): number => {
  const BASE_LIFE = 100;
  const realmNumber = Math.floor((totalRealmIndex + 2) / 3);
  const rawLife = BASE_LIFE * Math.pow(2.15, realmNumber);
  return getCleanNumber(rawLife);
};

/**
 * Calculate Qi Cap for a given realm and stage
 */
export const calculateQiCap = (realmIndex: number, stage: number = 0): number => {
  const BASE = 100;
  const MULTIPLIER = 3;
  
  if (realmIndex <= 0) return 1000;
  
  const exponent = Math.pow(realmIndex, 1.8) + stage;
  const rawCap = BASE * Math.pow(MULTIPLIER, exponent);
  
  return getCleanNumber(rawCap);
};

/**
 * Calculate required Qi for breakthrough to next realm/stage
 */
export const calculateQiRequired = (realmIndex: number, stage: number = 0): number => {
  return Math.round(calculateQiCap(realmIndex, stage) / 5);
};

/**
 * Calculate experience required to reach next body cultivation level
 */
export const calculateBodyExpRequired = (level: number): number => {
  return 100 * Math.floor(Math.pow(level, 1.8));
};

/**
 * Calculate tenacity required for body breakthrough at current level
 */
export const calculateTenacityRequired = (bodyStageIndex: number): number => {
  return 50 * Math.pow(1.8, bodyStageIndex);
};

/**
 * Calculate tribulation points required for body breakthrough at current level
 */
export const calculateTPRequired = (bodyStageIndex: number): number => {
  return 5 * Math.pow(bodyStageIndex, 1.2);
};

/**
 * Calculate experience reward from defeating a monster
 */
export const calculateMonsterExp = (difficulty: number): number => {
  return Math.floor(Math.pow(difficulty, 1.5)) * 10;
};

/**
 * Calculate tribulation points reward from defeating a monster (one-time only)
 */
export const calculateMonsterTP = (difficulty: number): number => {
  return Math.floor(Math.pow(difficulty, 1.5));
};
