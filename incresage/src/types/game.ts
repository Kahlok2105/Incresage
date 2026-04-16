// Types for the cultivation game

/**
 * Represents a cultivation realm.
 */
export interface CultivationRealm {
  /** Unique identifier for the realm */
  id: string;
  /** Human readable name */
  name: string;
  /** Stage within realm: 0 = Early, 1 = Middle, 2 = Late */
  stage: number;
  /** Display name including stage */
  displayName: string;
  /** Qi required to reach this realm */
  qiRequired: number;
  /** Maximum Qi capacity for this realm */
  qiCap: number;
  /** Multiplier applied to passive gain while in this realm */
  gainMultiplier: number;
  /** Base success rate for breakthroughs to this realm (0 to 1) */
  baseSuccessRate: number;
}

export type CultivationType = 'qi' | 'body';

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
  /** Base knowledge gain per second */
  baseKnowledge: number;
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
    
    /** Qi Cultivation progress */
    currentQiRealmIndex: number;
    currentQiStage: number;
    
    /** Body Cultivation progress */
    currentBodyRealmIndex: number;
    currentBodyStage: number;
    
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
    
    /** Maximum spirit capacity */
    spiritCap: number;
    
    /**Mental Ability */
    knowledge: number;

    curiosity: number;
    /** Mental fortitude for meditation */
    tenacity: number;
    
    /** Current lifespan in years */
    lifespan: number;
    /** Maximum lifespan based on cultivation */
    maxLifespan: number;
    
    unlockedFeatures: string[]; // e.g., ["combat", "meditation", "bodyCultivation"]
    /** Available meditation types */
    meditationTypes: MeditationType[];
    /** Currently active meditation type ID, or null if none */
    activeMeditationId: string | null;
  }

