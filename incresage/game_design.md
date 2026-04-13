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

### Meditation
* `isMeditating` is a boolean state toggled via `toggleMeditation` (exposed to the UI).
* When true, Qi gain per tick is doubled.

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

* **Status** (`src/components/Status.tsx`) – Shows current realm, Qi, spirit stones and a breakthrough button.
* **MeditationControls** (`src/components/MeditationControls.tsx`) – Button to start/stop meditation.
* **CombatControls** (`src/components/CombatControls.tsx`) – Button to trigger a monster encounter and display the result.

All components receive the necessary callbacks from `useGameLoop` via the root `App` component (`src/App.tsx`).

---

## 5. Integration (`src/App.tsx`)

The root component imports the hook and UI components, wires the callbacks together, and renders a simple layout:

```tsx
const { state, tryBreakthrough, isMeditating, toggleMeditation, encounterMonster } = useGameLoop();
return (
  <div className="app">
    <h1>Cultivation Game</h1>
    <Status state={state} tryBreakthrough={tryBreakthrough} />
    <MeditationControls isMeditating={isMeditating} toggleMeditation={toggleMeditation} />
    <CombatControls encounterMonster={encounterMonster} />
  </div>
);
```
Reference: [`incresage/src/App.tsx:1`]

---

## 6. Summary of Changes

| File | Purpose |
|------|---------|
| `src/types/game.ts` | Data models for realms and player state |
| `src/constants/gameData.ts` | Realm list and monster pool |
| `src/hooks/useGameLoop.ts` | Game loop, meditation, combat, breakthrough, persistence |
| `src/components/Status.tsx` | UI for displaying player status and breakthrough |
| `src/components/MeditationControls.tsx` | UI for toggling meditation |
| `src/components/CombatControls.tsx` | UI for combat encounters |
| `src/App.tsx` | Root component that composes everything |

With these files the project now runs a functional idle‑cultivation game that can be extended with more realms, monsters, and UI polish.

