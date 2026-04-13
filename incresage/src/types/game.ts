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
}

