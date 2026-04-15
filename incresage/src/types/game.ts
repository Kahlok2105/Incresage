// Types for the cultivation game

/**
 * Represents a cultivation realm.
 */
export interface Realm {
  /** Unique identifier for the realm */
  id: string;
  /** Human readable name */
  name: string;
  /** Qi required to reach this realm */
  qiRequired: number;
  /** Spirit stones required for breakthrough */
  stonesRequired: number;
  /** Multiplier applied to passive Qi gain while in this realm */
  qiGainMultiplier: number;
  /** Maximum Qi capacity for this realm */
  qiCap: number;
  baseSuccessRate: number; // Base success rate for breakthroughs to this realm (0 to 1)
}

/**
 * Meditation type definition.
 */
export interface MeditationType {
  /** Unique identifier for the meditation type */
  id: string;
  /** Display name */
  name: string;
  /** Base curiosity gain per second */
  baseCuriosity: number;
  /** Base tenacity gain per second */
  baseTenacity: number;
  /** Base qi gain per second */
  baseQi: number;
  /** Current level (1-100) */
  level: number;
  /** Current experience points */
  currentExp: number;
  /** Experience required for next level */
  expToNextLevel: number;
  /** Maximum level */
  maxLevel: number;
}

  /**
   * Player's mutable state.
   */
  export interface PlayerState {
    /** Current Qi amount */
    qi: number;
    /** Accumulated spirit stones */
    spiritStones: number;
    /** Index into the REALMS array indicating the current realm */
    currentRealmIndex: number;
    /** Timestamp of the last game‑loop tick (ms since epoch) */
    lastUpdate: number;
    /** Timestamp when the user was last active (for away time tracking) */
    lastActive: number;
    /** Health points for combat */
    vitality: number;
    /** Mana/energy points for combat abilities */
    spirit: number;
    /** Maximum vitality capacity */
    vitalityCap: number;
    curiosity: number;
    /** Mental fortitude for meditation */
    tenacity: number;
    /** Maximum curiosity capacity (half of current realm's qiCap) */
    curiosityCap: number;
    /** Maximum tenacity capacity (half of current realm's qiCap) */
    tenacityCap: number;
    unlockedFeatures: string[]; // e.g., ["combat", "meditation"]
    /** Available meditation types */
    meditationTypes: MeditationType[];
    /** Currently active meditation type ID, or null if none */
    activeMeditationId: string | null;
  }

