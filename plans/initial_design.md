# Cultivation Game Plan

## Game Loop Overview
1. **Meditation**: Passive gain of Qi (Cultivation Base).
2. **Combat**: Simple encounter system to gain Spirit Stones.
3. **Breakthrough**: Use Spirit Stones + Accumulated Qi to reach the next Realm.

## Proposed Data Structures

### Realms
### Realms
```typescript
interface Realm {
  id: string;
  name: string;
  qiRequired: number;
  stonesRequired: number;
  qiGainMultiplier: number;
  monsterCombatPower: number; // Base combat power of monsters in this realm
}
```

### Player State
```typescript
interface PlayerState {
  qi: number;
  spiritStones: number;
  currentRealmIndex: number;
  lastMeditationTime: number; // Timestamp of last meditation for passive Qi gain
  lastCombatTime: number;     // Timestamp of last combat for cooldowns
}
```

## Game Constants

### Realms Data
```typescript
const REALMS: Realm[] = [
  { id: 'mortal', name: 'Mortal', qiRequired: 100, stonesRequired: 0, qiGainMultiplier: 1, monsterCombatPower: 10 },
  { id: 'qi_condensation', name: 'Qi Condensation', qiRequired: 1000, stonesRequired: 50, qiGainMultiplier: 2, monsterCombatPower: 20 },
  { id: 'foundation', name: 'Foundation Establishment', qiRequired: 10000, stonesRequired: 500, qiGainMultiplier: 5, monsterCombatPower: 50 },
  { id: 'core_formation', name: 'Core Formation', qiRequired: 100000, stonesRequired: 5000, qiGainMultiplier: 10, monsterCombatPower: 100 },
  // Add more realms as needed
];
```

### Monster Data
```typescript
interface Monster {
  id: string;
  name: string;
  baseCombatPower: number;
  spiritStoneReward: number;
  qiReward: number; // Monsters can also give a small amount of Qi
}

const MONSTERS: Monster[] = [
  { id: 'wild_boar', name: 'Wild Boar', baseCombatPower: 15, spiritStoneReward: 5, qiReward: 10 },
  { id: 'forest_wolf', name: 'Forest Wolf', baseCombatPower: 25, spiritStoneReward: 10, qiReward: 20 },
  { id: 'mountain_tiger', name: 'Mountain Tiger', baseCombatPower: 40, spiritStoneReward: 20, qiReward: 40 },
  // Add more monsters per realm or as general encounters
];
```

## Game Loop (useGameLoop)

This custom React hook will be the heart of the game, managing time-based mechanics and state updates.

- **Ticking Mechanism**: Uses `setInterval` or `requestAnimationFrame` to create a game tick, updating `lastMeditationTime` and `lastCombatTime` to calculate passive gains.
- **Passive Qi Gain**: Based on the `qiGainMultiplier` of the current `Realm` and the time elapsed since `lastMeditationTime`.
- **State Management**: Manages `PlayerState` and `currentRealmIndex`, providing functions to update them.

## Meditation Mechanic

Meditation provides passive Qi gain over time. The `useGameLoop` hook will:

1. Calculate elapsed time since `lastMeditationTime`.
2. Apply Qi gain: `elapsedTime / 1000 * currentRealm.qiGainMultiplier` (per second).
3. Update `PlayerState.qi` and `lastMeditationTime`.

## Combat Mechanic (Monster Encounters & Spirit Stone Gain)

Players can engage in combat to gain Spirit Stones.

1. **Encounter Trigger**: A button click or an event within the `useGameLoop` could trigger an encounter.
2. **Monster Selection**: Based on the `currentRealmIndex`, a suitable `Monster` is selected from `MONSTERS`.
3. **Combat Resolution (Simplified)**:
   - Player wins if `PlayerState.qi` is greater than `Monster.baseCombatPower * currentRealm.monsterCombatPower`.
   - If the player wins:
     - Gain `Monster.spiritStoneReward`.
     - Gain `Monster.qiReward`.
     - Update `PlayerState.spiritStones` and `PlayerState.qi`.
     - Update `lastCombatTime` to enforce a cooldown.
   - If the player loses: No rewards, perhaps a small Qi penalty or simply a cooldown.

## UI Components

- `CultivationStatus.tsx`: Displays current Qi, Spirit Stones, and current Realm.
- `MeditationButton.tsx`: Initiates or enhances meditation (if active mechanic).
- `CombatArena.tsx`: Displays monster, combat button, and combat results.
- `BreakthroughButton.tsx`: Allows player to attempt breakthrough if requirements are met.
- `GameContainer.tsx`: Orchestrates and integrates all major UI components.

## Local Storage Persistence

- A custom hook, e.g., `useLocalStorage<T>(key: string, initialState: T)`, will be used to:
  - Save `PlayerState` to `localStorage` whenever it changes.
  - Load `PlayerState` from `localStorage` on game initialization.
  - Handle hydration (recalculating passive gains based on `lastMeditationTime` when loading).

## Integration with App.tsx

`src/App.tsx` will serve as the main entry point:

- Initialize `useGameLoop` to provide game state and actions.
- Render `GameContainer.tsx` which will then render other UI components, passing necessary state and callbacks as props.
- The overall structure will be component-based, allowing for clear separation of concerns.
