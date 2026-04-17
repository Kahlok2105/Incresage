# Incresage - Cultivation Game Design Documentation

This document provides a comprehensive overview of the **Incresage** cultivation idle game's architecture, systems, and implementation details.

---

## 1. High-Level Game Flow

1. **Game Loop** – A custom hook `useGameLoop` runs a tick every second, calculating passive gains and updating player state.
2. **Meditation** – Players can activate meditation techniques to gain stats (Curiosity, Tenacity, Knowledge, Qi) and level up those techniques over time.
3. **Combat** – Players can challenge random monsters to earn spirit stones, with success based on monster difficulty.
4. **Breakthrough** – Players attempt to advance to the next cultivation realm/stage with a probabilistic success chance based on current Qi vs required Qi.
5. **Feature Unlocks** – New game features are unlocked as players advance through Qi cultivation realms.
6. **Dual Cultivation** – Players can cultivate both Qi (spiritual) and Body (physical) paths independently.
7. **Persistence** – The entire `PlayerState` is saved to `localStorage` after each tick, with offline progress calculated on return.

---

## 2. Data Structures

### Player State (`src/types/game.ts`)
```typescript
export interface PlayerState {
  // Resources
  qi: number;                    // Current Qi amount
  spiritStones: number;          // Currency for breakthroughs
  
  // Qi Cultivation Progress
  currentQiRealmIndex: number;   // 0-5 (Mortal to Spirit Severing)
  currentQiStage: number;        // 0=Early, 1=Middle, 2=Late
  
  // Body Cultivation Progress
  currentBodyRealmIndex: number; // 0-5 (Mortal to Golden Body)
  currentBodyStage: number;      // 0=Early, 1=Middle, 2=Late
  
  // Time Tracking
  lastUpdate: number;            // Timestamp of last tick (ms)
  lastActive: number;            // Timestamp when user was last active
  
  // Combat Stats
  vitality: number;              // Health points
  spirit: number;                // Mana/energy points
  vitalityCap: number;           // Maximum vitality
  spiritCap: number;             // Maximum spirit
  
  // Mental Stats
  curiosity: number;             // Mental exploration stat
  tenacity: number;              // Mental fortitude
  knowledge: number;             // Mental ability for spirit growth
  
  // Lifespan
  lifespan: number;              // Current lifespan in years
  maxLifespan: number;           // Maximum lifespan based on cultivation
  
  // Features & Meditation
  unlockedFeatures: string[];    // ["monster", "alchemy", "bodyCultivation"]
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
  baseTenacity: number;     // Base tenacity gain per second
  baseQi: number;           // Base qi gain per second
  baseKnowledge: number;    // Base knowledge gain per second
  level: number;            // Current level (1-100)
  currentExp: number;       // Current experience points
  expToNextLevel: number;   // Experience required for next level
  maxLevel: number;         // Maximum level (100)
}
```

### Cultivation Realm (`src/types/game.ts`)
```typescript
export interface CultivationRealm {
  id: string;
  name: string;
  stage: number;                    // 0=Early, 1=Middle, 2=Late
  displayName: string;              // e.g., "Qi Condensation (Early)"
  qiRequired: number;               // Qi needed to attempt breakthrough
  qiCap: number;                    // Maximum Qi capacity
  gainMultiplier: number;           // Multiplier for passive Qi gain
  baseSuccessRate: number;          // Base breakthrough success chance (0-1)
}
```

### Monster (`src/constants/gameData.ts`)
```typescript
export interface MonsterCore {
  tier: number;                     // 1-10, corresponds to difficulty tiers
  amount: number;
}

export interface MonsterDrops {
  spiritStones: number;             // Spirit stones on victory
  monsterCores: MonsterCore[];      // Monster cores dropped
}

export interface Monster {
  id: string;
  name: string;
  hp: number;                       // Monster health points
  attack: number;                   // Monster attack power
  expReward: number;                // Body cultivation EXP on victory
  difficulty: number;               // 1-100 scale
  drops: MonsterDrops;              // Drop table
}
```

---

## 3. Core Systems

### 3.1 Game Loop (`src/hooks/useGameLoop.ts`)

The game runs on a 1-second tick cycle with delta-time calculations for smooth offline progress.

**Tick Processing:**
1. Calculate time delta since last update
2. Apply realm-based Qi gain (with meditation bonus if active)
3. Apply meditation technique stats (Curiosity, Tenacity, Knowledge, Qi)
4. Update meditation experience and check for level-ups
5. Regenerate Vitality and Spirit (0.5% of cap per second)
6. Update lifespan if player is active (0.1 years per second)
7. Cap all stats at their respective maximums

**Delta-Time System:**
- Tracks `lastUpdate` and `lastActive` timestamps
- Calculates offline progress when player returns
- Shows WelcomeModal with summary of gains after 60+ seconds away

### 3.2 Dual Cultivation System

Players progress through two independent cultivation paths:

#### Qi Cultivation Realms (`src/constants/cultivationRealms.ts`)
| Realm | Stages | Gain Multiplier | Base Success Rate |
|-------|--------|-----------------|-------------------|
| Mortal | Early/Middle/Late | 1.0 - 1.0 | 90% |
| Qi Condensation | Early/Middle/Late | 2.0 - 2.7 | 85% - 75% |
| Foundation Establishment | Early/Middle/Late | 3.0 - 4.0 | 75% - 65% |
| Core Formation | Early/Middle/Late | 5.0 - 7.0 | 65% - 55% |
| Nascent Soul | Early/Middle/Late | 10 - 15 | 55% - 45% |
| Spirit Severing | Early/Middle/Late | 20 - 30 | 45% - 35% |

#### Body Cultivation Realms
| Realm | Stages | Gain Multiplier | Base Success Rate |
|-------|--------|-----------------|-------------------|
| Mortal | Early/Middle/Late | 1.0 - 1.0 | 90% |
| Body Refining | Early/Middle/Late | 1.5 - 2.0 | 85% - 75% |
| Body Tempering | Early/Middle/Late | 2.5 - 3.5 | 75% - 65% |
| Bone Forging | Early/Middle/Late | 4.0 - 5.0 | 65% - 55% |
| Blood Transformation | Early/Middle/Late | 6.0 - 8.0 | 55% - 45% |
| Golden Body | Early/Middle/Late | 10 - 15 | 45% - 35% |

**Total Progression:** 6 realms × 3 stages = 18 steps per cultivation path

### 3.3 Breakthrough System

**Attempt Requirements:**
- Player must have Qi ≥ 50% of next realm's requirement
- No spirit stone cost (consumed on success in future versions)

**Success Calculation:**
```typescript
const ratio = Math.min(1, currentQi / nextRealm.qiRequired);
const chance = nextRealm.baseSuccessRate × ratio;
```

**Outcomes:**
- **Success:** Advance to next realm/stage, reset Qi to 0, update stat caps
- **Failure:** Lose 50% of current Qi, remain at current realm

**Feature Unlocks on Breakthrough:**
- **Qi Realm 1 (Qi Condensation):** Monster encounters unlocked
- **Qi Realm 2 (Foundation Establishment):** Alchemy unlocked
- **Qi Realm 3 (Core Formation):** Body Cultivation unlocked

### 3.4 Meditation System

**Available Techniques:**

| Technique | Curiosity | Tenacity | Knowledge | Qi |
|-----------|-----------|----------|-----------|-----|
| Explore Surroundings | 1 | 0 | 0 | 1 |
| Explore Self | 0 | 1 | 0 | 1 |
| Focus on Mind | 0 | 0 | 1 | 1 |

**Experience System:**
- Gain 1 experience point per second of active meditation
- Experience required doubles every 5 levels: `100 × 2^floor((level-1)/5)`
- Examples: Level 1 = 100 exp, Level 6 = 200 exp, Level 11 = 400 exp

**Stat Calculation Formula:**
```
Final Stat = (Base × Level) × Multiplier
where Multiplier = 1 + floor(Level / 10)
```

**Examples for "Explore Surroundings" (Base: 1 Curiosity, 1 Qi):**
- Level 1: (1 × 1) × 1 = 1/s
- Level 5: (1 × 5) × 1 = 5/s
- Level 10: (1 × 10) × 2 = 20/s (multiplier increases)
- Level 20: (1 × 20) × 3 = 60/s
- Level 30: (1 × 30) × 4 = 120/s

**Legacy Meditation Toggle:**
- `isMeditating` boolean provides additional 2× Qi multiplier
- Separate from meditation technique system for backwards compatibility

### 3.5 Stat System

**Mental Stats:**
- **Curiosity:** Gained from "Explore Surroundings" meditation
  - Cap: 50% of current Qi realm's Qi capacity
- **Tenacity:** Gained from "Explore Self" meditation
  - Cap: 30% of current Qi realm's Qi capacity
  - Increases Vitality cap: `sqrt(Tenacity)` bonus
- **Knowledge:** Gained from "Focus on Mind" meditation
  - No current cap
  - Increases Spirit cap: `sqrt(Knowledge)` bonus

**Combat Stats:**
- **Vitality:** Health points, regenerates at 0.5% of cap per second
- **Spirit:** Mana/energy, regenerates at 0.5% of cap per second

**Stat Cap Formulas:**
```typescript
vitalityCap = (100 × (qiRealm+1) × (bodyRealm+1)) + sqrt(tenacity)
spiritCap = (100 × (qiRealm+1) × (bodyRealm+1)) + sqrt(knowledge)
```

**Lifespan:**
- Increases by 0.1 years per second when player is active (meditating or has active meditation technique)
- Capped at `maxLifespan` based on highest realm achieved
- Formula: `100 × 2.15^realmNumber` where realmNumber = floor((totalIndex + 2) / 3)

### 3.6 Combat System

**Monster Encounters:**
- Unlocked at: Qi Realm 1 (Qi Condensation)
- Turn-based combat with HP tracking
- 10 unique monsters available from the start (player selects which to fight)
- Player progresses through monsters at their own pace

**Player Combat Stats:**
- **Attack:** Base 5 (placeholder for future stat source)
- **Defense:** Base 5 (placeholder for future stat source) - reduces incoming damage by flat amount

**Monster Stats:**
| Monster | Difficulty | HP | Attack | EXP | Spirit Stones | Monster Cores |
|---------|------------|-----|--------|-----|---------------|---------------|
| Spirit Wisp | 1 | 50 | 5 | 10 | 5 | 1x Tier 1 |
| Forest Wolf | 2 | 100 | 10 | 20 | 10 | 1x Tier 1 |
| Earth Golem | 3 | 200 | 15 | 35 | 15 | 1x Tier 1 |
| Fire Imp | 4 | 150 | 25 | 50 | 20 | 1x Tier 1 |
| Shadow Stalker | 5 | 300 | 30 | 75 | 30 | 1x Tier 1 |
| Rock Elemental | 6 | 500 | 35 | 100 | 40 | 1x Tier 1 |
| Wind Spirit | 7 | 400 | 50 | 150 | 50 | 1x Tier 1 |
| Ice Golem | 8 | 800 | 60 | 200 | 75 | 1x Tier 1 |
| Thunder Beast | 9 | 700 | 80 | 300 | 100 | 1x Tier 1 |
| Ancient Guardian | 10 | 1200 | 100 | 500 | 150 | 2x Tier 1 |

**Combat Mechanics:**
- Player damage: `playerAttack × (0.8 to 1.2 variance)`
- Monster damage: `max(1, monsterAttack - playerDefense) × (0.8 to 1.2 variance)`
- Turn-based: Player attacks first, then monster counterattacks
- Victory: Gain spirit stones, body EXP, and monster cores
- Defeat: Monster escapes, player can try again

**Monster Core System:**
- Tier 1 cores: Dropped by difficulty 1-10 monsters
- Future tiers: Higher tiers for higher difficulty monsters (planned)
- Used for: Body cultivation (future implementation)

### 3.7 Persistence & Offline Progress

**Save System:**
- State saved to `localStorage` after every tick
- Key: `"gameState"`

**Offline Progress:**
- Tracks `lastActive` timestamp when page loses visibility
- On return, calculates gains for entire away period if > 60 seconds
- Shows WelcomeModal with summary:
  - Time away
  - Total Qi gained
  - Stats gained (Curiosity, Tenacity, Knowledge, Vitality, Spirit)
  - Meditation experience gained
  - Lifespan gained

---

## 4. Mathematical Systems (`src/utils/gameMath.ts`)

### Clean Number Formatting
Rounds large numbers for player-friendly display using significant digits and magnitude-based rounding.

### Qi Cap Calculation
```typescript
qiCap = 100 × 3^(realmIndex^1.8 + stage)
```
Exponential scaling ensures meaningful progression across 18 stages.

### Qi Required for Breakthrough
```typescript
qiRequired = qiCap / 5
```
Players need to fill 20% of their realm's capacity to attempt breakthrough.

### Lifespan Calculation
```typescript
lifespan = 100 × 2.15^realmNumber
```
Where realmNumber accounts for both realm index and stage progression.

---

## 5. UI Components

| Component | Purpose |
|-----------|---------|
| **Status** | Displays realm, Qi, spirit stones, stats, breakthrough button |
| **MeditationPanel** | Shows available meditation techniques, activation, leveling, stats |
| **MeditationControls** | Legacy meditation toggle (backwards compatibility) |
| **CombatSystem** | Full combat UI with HP bars, attack/flee buttons, combat log (unlocked at Qi Realm 1) |
| **AlchemyPanel** | Placeholder for alchemy system (unlocked at Qi Realm 2) |
| **UnlockToast** | Brief notification when new features are unlocked |
| **WelcomeModal** | Shows offline progress summary when returning |
| **NotificationContainer** | Global notification system for success/failure messages |

---

## 6. Integration (`src/App.tsx`)

The root component wires together:
- Game loop hook with all callbacks
- Notification system for user feedback
- Feature-gated components based on `unlockedFeatures`
- Welcome modal for offline progress
- Global notification container

**Feature Gating:**
```tsx
{state.unlockedFeatures.includes("monster") && <CombatSystem />}
{state.unlockedFeatures.includes("alchemy") && <AlchemyPanel />}
```

---

## 7. File Structure

| File | Purpose |
|------|---------|
| `src/types/game.ts` | TypeScript interfaces for all game data |
| `src/constants/cultivationRealms.ts` | Qi and Body realm definitions (18 stages each) |
| `src/constants/gameData.ts` | Monster pool and meditation type definitions |
| `src/utils/gameMath.ts` | Mathematical utilities for scaling and formatting |
| `src/hooks/useGameLoop.ts` | Core game loop, state management, persistence |
| `src/hooks/useNotifications.ts` | Notification system hook |
| `src/components/Status.tsx` | Player status display and breakthrough UI |
| `src/components/MeditationPanel.tsx` | Meditation system UI with techniques and leveling |
| `src/components/MeditationControls.tsx` | Legacy meditation toggle |
| `src/components/CombatSystem.tsx` | Full combat UI with HP bars, turn-based combat, combat log |
| `src/components/AlchemyPanel.tsx` | Placeholder for future alchemy system |
| `src/components/UnlockToast.tsx` | Feature unlock notification |
| `src/components/WelcomeModal.tsx` | Offline progress summary modal |
| `src/components/NotificationContainer.tsx` | Global notification display |
| `src/App.tsx` | Root component composition |
| `src/App.css` | Styling for all components |

---

## 8. Current Implementation Status

### ✅ Fully Implemented
- Dual cultivation system (Qi path active, Body path framework ready)
- 18-stage realm progression with exponential scaling
- Probabilistic breakthrough system with failure penalties
- Meditation system with 3 techniques, experience, and leveling
- Complete stat system (Curiosity, Tenacity, Knowledge, Vitality, Spirit)
- Lifespan system with activity-based growth
- Offline progress calculation with WelcomeModal
- Notification system for user feedback
- Feature unlocking based on realm progression
- Persistent save/load with localStorage

### 🔄 Partially Implemented
- Body Cultivation (framework exists, UI not yet built)
- Alchemy system (placeholder component, mechanics TBD)

### 📋 Future Considerations
- Spirit stones consumption for breakthroughs
- Combat system expansion (vitality/spirit usage)
- Additional meditation techniques
- More monster varieties
- Alchemy recipes and effects
- Body cultivation UI and mechanics
- Achievement system
- Leaderboards/social features

---

## 9. Summary

Incresage is a sophisticated cultivation idle game with:
- **Dual progression paths** (Qi and Body cultivation)
- **18 total stages** across 6 realms per path
- **Deep meditation system** with 3 techniques, experience, and leveling
- **Probabilistic breakthroughs** with meaningful risk/reward
- **Comprehensive stat system** with 6+ interconnected stats
- **Offline progress** with detailed return summaries
- **Feature gating** that unlocks content as players advance
- **Clean mathematical scaling** using exponential formulas
- **Full persistence** with automatic save/load

The architecture is designed for extensibility, allowing easy addition of new realms, monsters, meditation techniques, and game systems.