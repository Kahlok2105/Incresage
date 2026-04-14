# Cultivation Game Design Documentation

This document summarizes the implementation that was added to the **Incresage** project to turn the starter Vite+React template into a simple cultivation‑style idle game.

---

## 1. High‑level Game Flow

1. **Game Loop** – A custom hook `useGameLoop` runs a tick every second.
2. **Meditation** – When the player toggles meditation, the passive Qi gain per tick is doubled.
3. **Combat** – The player can trigger a random monster encounter. Success awards spirit stones.
4. **Breakthrough** – If the player has enough Qi **and** spirit stones for the next realm, they can breakthrough, consuming the required resources and advancing to the next realm.
5. **Persistence** – The entire `PlayerState` is saved to `localStorage` after each tick so progress survives page reloads.

The UI components (`Status`, `MeditationControls`, `CombatControls`) simply call the functions exposed by the hook.

---

## 2. Data Structures

### Player State (`src/types/game.ts`)
```typescript
export interface PlayerState {
  qi: number;                // Current Qi amount
  spiritStones: number;      // Accumulated spirit stones
  currentRealmIndex: number; // Index into the REALMS array
  lastUpdate: number;        // Timestamp of the last tick
  vitality: number;          // Vitality stat from meditation
  spirit: number;            // Spirit stat (future use)
  curiosity: number;         // Curiosity stat from meditation
  unlockedFeatures: string[]; // Unlocked game features
  meditationTypes: MeditationType[]; // Available meditation techniques
  activeMeditationId: string | null; // Currently active meditation
}
```

### Meditation Type (`src/types/game.ts`)
```typescript
export interface MeditationType {
  id: string;               // Unique identifier
  name: string;             // Display name
  baseCuriosity: number;    // Base curiosity gain per second
  baseVitality: number;     // Base vitality gain per second
  baseQi: number;           // Base qi gain per second
  level: number;            // Current level (1-100)
  maxLevel: number;         // Maximum level
}
```
Reference: [`incresage/src/types/game.ts:30`]

### Realm Definition (`src/types/game.ts`)
```typescript
export interface Realm {
  id: string;
  name: string;
  qiRequired: number;        // Qi needed to reach this realm
  stonesRequired: number;    // Spirit stones needed for breakthrough
  qiGainMultiplier: number; // Multiplier applied to passive Qi gain
}
```
Reference: [`incresage/src/types/game.ts:12`]

### Monster Definition (`src/constants/gameData.ts`)
```typescript
export interface Monster {
  id: string;
  name: string;
  stoneReward: number; // Stones granted on victory
  difficulty: number;  // Higher values lower success chance
}
```
Reference: [`incresage/src/constants/gameData.ts:23`]

---

## 3. Core Logic (`src/hooks/useGameLoop.ts`)

### Tick handling
* Every `tickMs` (default 1000 ms) the hook calls `computeQiGain` and updates `state.qi`.
* `computeQiGain` multiplies a base gain of **1 Qi** by the current realm’s `qiGainMultiplier` and, if `isMeditating` is true, applies an additional **×2** factor.

### Meditation System
* **Meditation Types**: Three starting meditation techniques with different stat focuses:
  - **Explore Surroundings**: Generates Curiosity +1/s and Qi +1/s (base)
  - **Explore Self**: Generates Tenacity +1/s and Qi +1/s (base)
  - **Focus on Mind**: Generates Qi +3/s (base)

* **Experience System**:
  - Players gain 1 experience point per second for active meditation
  - Experience required doubles every 5 levels: `expRequired = 100 * 2^Math.floor((level - 1) / 5)`
  - Example: Level 1 = 100 exp, Level 6 = 200 exp, Level 11 = 400 exp, etc.
  - Automatic level-up when experience threshold is reached

* **Stat Calculation Formula**:
  - **Base Stats**: Each meditation has base values (e.g., Explore Surroundings: 1 Curiosity, 1 Qi)
  - **Level Multiplier**: Stats increase linearly with level (Base × Level)
  - **Progression Multiplier**: Increments every 10 levels (1×, 2×, 3×...) using `multiplier = 1 + Math.floor(level / 10)`
  - **Final Formula**: `(Base × Level) × Multiplier`

  **Examples for "Explore Surroundings" (Base: 1 Curiosity, 1 Qi):**
  - **Level 1**: `(1 × 1) × 1 = 1 Curiosity/s, 1 Qi/s`
  - **Level 2**: `(1 × 2) × 1 = 2 Curiosity/s, 2 Qi/s`
  - **Level 5**: `(1 × 5) × 1 = 5 Curiosity/s, 5 Qi/s`
  - **Level 10**: `(1 × 10) × 2 = 20 Curiosity/s, 20 Qi/s` (multiplier becomes 2)
  - **Level 20**: `(1 × 20) × 3 = 60 Curiosity/s, 60 Qi/s` (multiplier becomes 3)
  - **Level 30**: `(1 × 30) × 4 = 120 Curiosity/s, 120 Qi/s` (multiplier becomes 4)

* **Activation**:
  - Players can activate one meditation at a time via `setActiveMeditation()`
  - Active meditation stats are calculated and applied every tick
  - Stats include Qi, Curiosity, and Tenacity gains

* **Stat Caps**:
  - Curiosity cap: 50% of current realm's Qi capacity
  - Tenacity cap: 30% of current realm's Qi capacity
  - Displayed as "Current/Max" in Status panel

* **Legacy Meditation**:
  - `isMeditating` is a boolean state toggled via `toggleMeditation` (exposed to the UI).
  - When true, Qi gain per tick is doubled (additive with meditation system).

### Combat Encounter (`encounterMonster`)
* Picks a random monster from `MONSTERS`.
* Success chance = `0.8 - 0.1 * (monster.difficulty - 1)` (minimum 0.1).
* On success, `addSpiritStones(monster.stoneReward)` is called.

### Breakthrough (`tryBreakthrough`)
* Checks the next realm’s `qiRequired` and `stonesRequired` against the current state.
* If requirements are met, advances `currentRealmIndex` and deducts the spent resources.

### Persistence
* On initial load the hook reads `localStorage.getItem('gameState')` and parses it.
* After every state change a `useEffect` writes the JSON string back to `localStorage`.

Reference for the hook implementation: [`incresage/src/hooks/useGameLoop.ts:1`]

---

## 4. UI Components

* **Status** (`src/components/Status.tsx`) – Shows current realm, Qi, spirit stones, curiosity, vitality and a breakthrough button.
* **MeditationPanel** (`src/components/MeditationPanel.tsx`) – Comprehensive meditation system with multiple meditation types, activation controls, leveling, and stat displays.
* **MeditationControls** (`src/components/MeditationControls.tsx`) – Legacy button to start/stop basic meditation (kept for backwards compatibility).
* **CombatControls** (`src/components/CombatControls.tsx`) – Button to trigger a monster encounter and display the result.
* **MonsterEncounter** (`src/components/MonsterEncounter.tsx`) – New panel that appears once the "monster" feature is unlocked (after the first breakthrough). Allows the player to challenge a random monster.
* **AlchemyPanel** (`src/components/AlchemyPanel.tsx`) – New panel that appears once the "alchemy" feature is unlocked (after the second breakthrough). Placeholder for future alchemy mechanics.
* **UnlockToast** (`src/components/UnlockToast.tsx`) – Small toast notification that briefly shows the name of a newly unlocked feature.

All components receive the necessary callbacks from `useGameLoop` via the root `App` component (`src/App.tsx`).

---

## 5. Integration (`src/App.tsx`)

The root component imports the hook and UI components, wires the callbacks together, and renders a simple layout:

```tsx
const { state, tryBreakthrough, isMeditating, toggleMeditation, encounterMonster } = useGameLoop();
return (
  <div className="app">
    <header className="status-panel">
      <Status state={state} tryBreakthrough={tryBreakthrough} qiPerSecond={qiPerSecond} usableQi={usableQi} totalQi={totalQi} resetGame={resetGame} />
    </header>
    <main className="game-panel">
      <MeditationControls isMeditating={isMeditating} toggleMeditation={toggleMeditation} />
      <CombatControls encounterMonster={encounterMonster} />
      {state.unlockedFeatures.includes("monster") && <MonsterEncounter encounterMonster={encounterMonster} />}
      {state.unlockedFeatures.includes("alchemy") && <AlchemyPanel />}
      <UnlockToast feature={lastFeature} />
    </main>
  </div>
);
```
Reference: [`incresage/src/App.tsx:1`]

---

## 6. Summary of Changes

| File | Purpose |
|------|---------|
| `src/types/game.ts` | Data models for realms, player state, and meditation types |
| `src/constants/gameData.ts` | Realm list, monster pool, and meditation type definitions |
| `src/hooks/useGameLoop.ts` | Game loop, meditation system, combat, breakthrough, persistence |
| `src/components/Status.tsx` | UI for displaying player status, stats, and breakthrough |
| `src/components/MeditationPanel.tsx` | Comprehensive meditation system UI with multiple types and leveling |
| `src/components/MeditationControls.tsx` | Legacy meditation toggle (backwards compatibility) |
| `src/components/CombatControls.tsx` | UI for combat encounters |
| `src/App.tsx` | Root component that composes everything |
| `src/App.css` | Styling for all components including meditation panel |

With these files the project now runs a functional idle‑cultivation game that can be extended with more realms, monsters, and UI polish.

