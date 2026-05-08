# Incresage - Cultivation Game Design Documentation

This document provides a comprehensive overview of the **Incresage** cultivation idle game's architecture, systems, and implementation details.

---

## 1. High-Level Game Flow

1. **Game Loop** – A custom hook `useGameLoop` orchestrates domain hooks (`useGameTick`, `useBreakthrough`, `useCombat`, `useUpgrades`, `useInventory`, `useMeditation`), running a tick every second to calculate passive gains and update player state.
2. **Meditation** – Players can activate meditation techniques to gain stats (Curiosity, Tenacity, Knowledge, Qi) and level up those techniques over time.
3. **Combat** – Players can challenge monsters from a list to earn spirit stones, body EXP, tribulation points (one-time per monster), and item drops.
4. **Breakthrough** – Players attempt to advance to the next cultivation realm/stage (Qi or Body) with probabilistic success chance based on current resources.
5. **Feature Unlocks** – New game features are unlocked as players advance through Qi cultivation realms (monster at Qi Condensation, alchemy at Foundation Establishment, bodyCultivation at Core Formation).
6. **Dual Cultivation** – Players can cultivate both Qi (spiritual) and Body (physical) paths independently, each with 6 realms × 3 stages = 18 steps.
7. **Equipment** – Items with equipment type can be equipped/unequipped to grant stat bonuses and mental growth multipliers.
8. **Persistence** – The entire `PlayerState` is saved to `localStorage` after each tick, with offline progress calculated on return.

---

## 2. Data Structures

### Player State (`src/types/game.ts`)
```typescript
export interface PlayerState {
  // Resources
  qi: number;                    // Current Qi amount
  spiritStones: number;          // Currency for battle technique upgrades

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
  attack: number;                // Base attack power (enhanced by battle techniques & equipment)
  defense: number;               // Base defense (enhanced by battle techniques & equipment)

  // Mental Stats
  curiosity: number;             // Mental exploration stat
  tenacity: number;              // Mental fortitude
  knowledge: number;             // Mental ability for spirit growth

  // Lifetime tracking
  totalTenacityEarned: number;   // Cumulative tenacity earned (used in vitality cap formula)
  lifespan: number;              // Current lifespan in years
  maxLifespan: number;           // Maximum lifespan based on cultivation

  // Body Cultivation
  bodyExp: number;               // Experience points for body cultivation
  bodyLevel: number;             // Current body cultivation level
  tribulationPoints: number;     // Resource for body breakthroughs (earned from monsters)
  defeatedMonsters: string[];    // List of monster IDs defeated (for one-time TP rewards)

  // Inventory System
  inventory: InventoryItem[];    // Player's collected items (consolidated type from `src/types/inventory.ts`)

  // Features & Systems
  unlockedFeatures: string[];    // ["monster", "alchemy", "bodyCultivation"]
  meditationTypes: MeditationType[]; // Available meditation techniques
  battleTechniques: BattleTechnique[]; // Available battle techniques
  activeMeditationId: string | null; // Currently active meditation
}
```

### Inventory System Types (`src/types/inventory.ts`)
```typescript
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'material' | 'pill' | 'currency' | 'equipment';
export type ItemSlot = 'weapon' | 'armor' | 'accessory' | 'head' | 'body' | 'gloves' | 'shoes' | 'offhand';

export interface ItemStats {
  vitality?: number;
  spirit?: number;
  attack?: number;
  defense?: number;
  mentalGrowthMultiplier?: {
    tenacity?: number;
    curiosity?: number;
    knowledge?: number;
    qi?: number;
  };
}

export interface ItemTemplateBase {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  rarity: ItemRarity;
  icon: string;
  stackable: boolean;
}

export interface ConsumableTemplate extends ItemTemplateBase {
  type: 'material' | 'pill' | 'currency';
  effectId?: string;
}

export interface EquipmentTemplate extends ItemTemplateBase {
  type: 'equipment';
  slot: ItemSlot;
  level: number;
  stats: ItemStats;
}

export type ItemTemplate = ConsumableTemplate | EquipmentTemplate;

export interface InventoryItemBase extends ItemTemplateBase {
  instanceId: string;           // Unique per-instance identifier (for equipment tracking)
  quantity: number;
}

export interface InventoryConsumableItem extends InventoryItemBase {
  type: 'material' | 'pill' | 'currency';
  effectId?: string;
}

export interface InventoryEquipmentItem extends InventoryItemBase {
  type: 'equipment';
  slot: ItemSlot;
  level: number;
  stats: ItemStats;
  isEquipped: boolean;          // Whether this item is currently equipped
}

export type InventoryItem = InventoryConsumableItem | InventoryEquipmentItem;

export interface ItemDropEntry {
  itemId: string;
  chance: number; // 0-1 probability
  min?: number;   // Minimum drop quantity
  max?: number;   // Maximum drop quantity
  quantity?: number; // Fixed quantity (alternative to min/max)
}
```

### Meditation Type (`src/types/game.ts`)
```typescript
export interface MeditationType {
  id: string;
  name: string;
  baseCuriosity: number;
  baseTenacity: number;
  baseQi: number;
  baseKnowledge: number;
  level: number;            // Current level (1-100)
  currentExp: number;
  expToNextLevel: number;
  maxLevel: number;         // 100
}
```

### Battle Technique (`src/types/game.ts`)
```typescript
export interface BattleTechnique {
  id: string;
  name: string;
  stat: 'attack' | 'defense' | 'vitality' | 'spirit'; // Which stat this technique affects
  baseValue: number;
  level: number;            // Current level (0-100, starts at 0)
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

### Monster (`src/types/combat.ts`)
```typescript
export interface MonsterDrops {
  spiritStones: number;
  items?: ItemDropEntry[];
}

export interface Monster {
  id: string;
  name: string;
  hp: number;
  attack: number;
  expReward: number;                // Body cultivation EXP on victory
  difficulty: number;               // 1-10 scale
  tpReward: number;                 // Tribulation Points reward (one-time per monster)
  drops: MonsterDrops;              // Drop table
}

export interface CombatState {
  isActive: boolean;
  monster: Monster | null;
  playerHP: number;
  monsterHP: number;
  log: string[];
  isPlayerTurn: boolean;
}
```

---

## 3. Core Systems

### 3.1 Game Loop (`src/hooks/useGameLoop.ts`)

The game runs on a 1-second tick cycle orchestrated through a composition of domain hooks:

```
useGameState    → Single source of truth (state + setState)
useGameTick     → 1Hz interval: passive gains, regen, lifespan, meditation exp, welcome modal
useBreakthrough → Qi & Body breakthrough attempts
useCombat       → Combat simulation and victory processing
useUpgrades     → Battle technique upgrades
useInventory    → Item use/equip/unequip
useMeditation   → Active meditation selection, meditation leveling
```

**Tick Processing (useGameTick.ts):**
1. Calculate time delta since last update (supports delta-time for smooth offline progress)
2. Apply realm-based Qi gain (`gainMultiplier × (isMeditating ? 2 : 1)`)
3. Apply active meditation technique stats (Curiosity, Tenacity, Knowledge, Qi)
4. Update meditation experience and check for level-ups
5. Recalculate stat caps using updated stats
6. Regenerate Vitality and Spirit (0.5% of cap per second)
7. Update lifespan if player is active (0.1 years per second) — active = meditating OR has active meditation technique
8. Cap Qi at realm's Qi cap, cap all stats at their respective maximums
9. Track `totalTenacityEarned` cumulatively (used in vitality cap formula)

**Delta-Time System:**
- Tracks `lastUpdate` and `lastActive` timestamps
- Calculates offline progress when player returns via `visibilitychange` event
- Shows WelcomeModal with summary of gains after 60+ seconds away

**Hook Composition:**
- `useGameLoop` returns a unified API:
  - `state`, `setState`, `resetGame`
  - `isMeditating`, `setMeditating` (legacy meditation toggle)
  - `totalAttack`, `totalDefense`, `totalVitality`, `totalSpirit` (base + battle bonuses)
  - `usableQi`, `totalQi`, `welcomeData`, `clearWelcomeData`
  - Spreads all domain hook actions: `tryBreakthrough`, `tryBodyBreakthrough`, `processMonsterVictory`, `upgradeBattleTechnique`, `useInventoryItem`, `toggleEquipItem`, etc.

### 3.2 Dual Cultivation System

Players progress through two independent cultivation paths, each with 6 realms × 3 stages = 18 steps.

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

### 3.3 Body Cultivation Mechanics

**Body EXP and Leveling:**
- Body EXP gained from defeating monsters: `floor(difficulty^1.5) × 10`
- EXP required for next level: `100 × floor(level^1.8)`
- Body Level increases combat effectiveness and unlocks higher battle technique levels

**Tribulation Points (TP):**
- Earned by defeating monsters (one-time per monster type)
- TP reward: `floor(difficulty^1.5)`
- Used exclusively for body breakthroughs

**Body Breakthrough Requirements:**
- **Tenacity:** Required amount = `50 × 1.8^bodyStageIndex`
- **Tribulation Points:** Required amount = `5 × bodyStageIndex^1.2`
- **Body Level:** Must be at least `bodyStageIndex + 1`
- Must have 50% of required resources to attempt (each resource checked independently)

**Body Breakthrough Success Calculation:**
```typescript
const tenacityRatio = Math.min(1, currentTenacity / tenacityRequired);
const tpRatio = Math.min(1, tribulationPoints / tpRequired);
const levelRatio = Math.min(1.5, bodyLevel / requiredBodyLevel);
const chance = baseSuccessRate × tenacityRatio × tpRatio × levelRatio;
```

**Body Breakthrough Outcomes:**
- **Success:** Advance to next realm/stage, reset bodyExp to 0, update stat caps
- **Failure:** Lose 30% of current tenacity and 1 body level, update stat caps

### 3.4 Qi Breakthrough System

**Attempt Requirements:**
- Player must have Qi ≥ 50% of next realm's qiRequired

**Success Calculation:**
```typescript
const ratio = Math.min(1, currentQi / nextRealm.qiRequired);
const chance = nextRealm.baseSuccessRate × ratio;
```

**Outcomes (returns `{ success: boolean, chance: number }`):**
- **Success:** Advance to next realm/stage, reset Qi to 0, update stat caps, check feature unlocks
- **Failure:** Lose 50% of current Qi, remain at current realm

**Feature Unlocks on Breakthrough:**
- **Qi Realm 1 (Qi Condensation):** "monster" feature unlocked (Combat tab)
- **Qi Realm 2 (Foundation Establishment):** "alchemy" feature unlocked (Alchemy tab)
- **Qi Realm 3 (Core Formation):** "bodyCultivation" feature unlocked (stat bonuses from body)

### 3.5 Meditation System (`src/hooks/useMeditation.ts`, `src/constants/meditations.ts`)

**Available Techniques:**

| Technique | Curiosity | Tenacity | Knowledge | Qi |
|-----------|-----------|----------|-----------|-----|
| Explore Surroundings | 1 | 0 | 0 | 1 |
| Explore Self | 0 | 1 | 0 | 1 |
| Focus on Mind | 0 | 0 | 1 | 1 |

**Experience System:**
- Gain 1 experience point per second of active meditation
- Experience required for next level: `100 × 1.15^(level-1)`
- Leveling happens instantly when experience threshold is reached (can level up multiple times in one tick)

**Stat Calculation Formula:**
```typescript
// Multiplier:
const multiplier = 1 + Math.floor(level / 10);

// Final Stat:
const stat = base × level × multiplier;
```

**Examples for "Explore Surroundings" (Base: 1 Curiosity, 1 Qi):**
- Level 1: (1 × 1) × 1 = 1/s
- Level 5: (1 × 5) × 1 = 5/s
- Level 10: (1 × 10) × 2 = 20/s
- Level 20: (1 × 20) × 3 = 60/s
- Level 30: (1 × 30) × 4 = 120/s

**Legacy Meditation Toggle:**
- `isMeditating` boolean provides additional 2× Qi multiplier on realm-based Qi gain
- Separate from meditation technique system for backwards compatibility
- `resetMeditationState()` called on game reset

### 3.6 Battle Techniques System (`src/constants/techniques.ts`)

**Available Techniques:**

| Technique | Stat | Base Value | Description |
|-----------|------|------------|-------------|
| Iron Skin Mantra | Defense | 2 | Increases damage reduction |
| Tiger's Breath | Attack | 2 | Increases damage dealt |
| Boundless Heart | Vitality | 5 | Increases maximum health |
| Spirit Refinement | Spirit | 5 | Increases maximum mana |

**Leveling System:**
- Levels range from 0-100
- Maximum level capped at `bodyLevel × 5`
- Upgrade cost: `baseValue × 1.15^level` spirit stones
- Stat bonus: `floor(baseValue × level^1.5)`

**Stat Calculation:**
```typescript
// Per technique:
const bonus = Math.floor(technique.baseValue × Math.pow(technique.level, 1.5));

// Total (aggregated from all techniques):
finalAttack  = baseAttack  + Σ(attack bonuses)
finalDefense = baseDefense + Σ(defense bonuses)
finalVitality = baseVitality + Σ(vitality bonuses)
finalSpirit  = baseSpirit  + Σ(spirit bonuses)
```

**Examples:**
- Iron Skin Mantra Level 5: +`floor(2 × 5^1.5)` = +22 defense
- Tiger's Breath Level 10: +`floor(2 × 10^1.5)` = +63 attack

### 3.7 Stat System (`src/utils/statCalc.ts`)

**Mental Stats:**
- **Curiosity:** Gained from "Explore Surroundings" meditation
- **Tenacity:** Gained from "Explore Self" meditation
  - Increases Vitality cap via cumulative tracking
- **Knowledge:** Gained from "Focus on Mind" meditation
  - Increases Spirit cap

**Combat Stats:**
- **Vitality:** Health points, regenerates at 0.5% of cap per second
- **Spirit:** Mana/energy, regenerates at 0.5% of cap per second

**Stat Cap Formulas:**
```typescript
vitalityCap = (100 × (qiRealm+1) × (bodyRealm+1)) + sqrt(totalTenacityEarned)
spiritCap   = (100 × (qiRealm+1) × (bodyRealm+1)) + sqrt(knowledge)
```

**Lifespan:**
- Increases by 0.1 years per second when player is active (meditating or has active meditation technique)
- Capped at `maxLifespan` based on highest realm achieved
- Formula: `100 × 2.15^realmNumber` where `realmNumber = Math.floor((totalIndex + 2) / 3)`

**Equipment Bonuses:**
- Equipment items can provide flat stat bonuses (attack, defense, vitality, spirit)
- Equipment items can provide mental growth multipliers (e.g. +10% Qi gain, +5% Knowledge gain)
- Multiple equipment items equipped simultaneously stack their bonuses

### 3.8 Combat System (`src/hooks/useCombat.ts`, `src/constants/monsters.ts`)

**Monster Encounters:**
- Unlocked at Qi Realm 1 (Qi Condensation)
- 10 unique monsters available (player selects which to fight from a list)
- Turn-based combat with HP tracking

**Player Combat Stats:**
- **Attack:** Base + battle technique bonuses + equipment bonuses
- **Defense:** Base + battle technique bonuses + equipment bonuses (flat damage reduction)
- **Vitality:** Enhanced by battle techniques + equipment for maximum health
- **Spirit:** Enhanced by battle techniques + equipment for maximum mana

**Monster Stats & Drops:**

| Monster | Difficulty | HP | Attack | EXP | TP | Spirit Stones | Item Drops |
|---------|------------|-----|--------|-----|----|---------------|------------|
| Spirit Wisp | 1 | 50 | 5 | 10 | 1 | 5 | 1x Low-Grade Monster Core |
| Forest Wolf | 2 | 100 | 10 | 28 | 2 | 10 | 1-2x Low-Grade Monster Core |
| Earth Golem | 3 | 200 | 15 | 51 | 5 | 15 | 1-2x Low-Grade Monster Core |
| Fire Imp | 4 | 150 | 25 | 80 | 8 | 20 | 1-2x Low-Grade Core, 12% Foundation Pill |
| Shadow Stalker | 5 | 300 | 30 | 111 | 11 | 30 | 1-2x Medium-Grade Core, 20% Foundation Pill |
| Rock Elemental | 6 | 500 | 35 | 146 | 14 | 40 | 1-2x Medium-Grade Core, 8% Iron Sword |
| Wind Spirit | 7 | 400 | 50 | 185 | 18 | 50 | 1-3x Medium-Grade Core, 4% Bronze Ring |
| Ice Golem | 8 | 800 | 60 | 226 | 22 | 75 | 1-2x High-Grade Core, 25% Foundation Pill |
| Thunder Beast | 9 | 700 | 80 | 270 | 27 | 100 | 1-2x High-Grade Core, 5% Jade Pendant |
| Ancient Guardian | 10 | 1200 | 100 | 316 | 31 | 150 | 2-3x High-Grade Core, 12% Jade Pendant |

**Combat Mechanics:**
- Player damage: `playerAttack × (0.8 to 1.2 variance)`
- Monster damage: `max(1, monsterAttack - playerDefense) × (0.8 to 1.2 variance)`
- Turn-based: Player attacks first, then monster counterattacks
- Victory: Gain spirit stones, body EXP, tribulation points (one-time per monster type), and item drops (added to inventory)
- Defeat: Monster escapes, player can try again

**Item Drop System:**
- Items defined in `src/constants/items.ts` with full templates (id, name, rarity, icon, type, stackable, slot, stats)
- Drop chances and quantities configured per monster in `src/constants/monsters.ts`
- Items automatically added to player inventory on victory
- Stackable items consolidate in inventory; non-stackable (equipment) items get unique instance IDs
- Equipment items can be equipped/unequipped from the Cultivator header panel

### 3.9 Equipment System

**Equipping Items:**
- Equipment items have a `slot` (weapon, armor, accessory, head, body, gloves, shoes, offhand)
- Players can toggle equip/unequip from the Cultivator header panel
- Equipped items grant their `stats` bonuses to the player's effective stats
- `mentalGrowthMultiplier` stats increase the rate of mental stat gains during meditation

**Available Equipment Items:**
| Item | Slot | Rarity | Stats |
|------|------|--------|-------|
| Iron Sword | weapon | common | +10 Attack |
| Bronze Ring | accessory | uncommon | +5 Defense, +10 Vitality, +10% Tenacity growth |
| Jade Pendant | accessory | rare | +10% Qi growth, +5% Knowledge growth |

### 3.10 Inventory System

**Pill Items:**
- `Foundation Pill` (uncommon, consumable): Can be used from inventory
- Future effect: Stabilizes Qi flow during breakthrough attempts (effectId TBD)

**Material Items:**
- Low-Grade Monster Core (common), Medium-Grade (uncommon), High-Grade (rare)
- Stackable, used as crafting materials (future alchemy system)

**Inventory Display:**
- Shown in the Combat tab alongside the combat system
- Items displayed with name, quantity (for stackable), rarity, and description
- Equipment items show equip/unequip toggle

### 3.11 Persistence & Offline Progress

**Save System:**
- State saved to localStorage after every tick via `useGameState`
- Key: `"gameState"`

**Offline Progress:**
- Tracks `lastActive` timestamp when page loses visibility (via `visibilitychange` event)
- On return, resets `lastUpdate` to now (preventing delta spikes)
- Shows WelcomeModal with summary if away > 60 seconds:
  - Time away
  - Total Qi gained
  - Stats gained
  - Meditation experience gained
  - Lifespan gained

---

## 4. Mathematical Systems (`src/utils/gameMath.ts`)

### Clean Number Formatting
```typescript
getCleanNumber(value, {
  allowDecimals?: boolean,      // Default false — always rounds to integer
  significantDigits?: number,    // Default 2
  roundDirection?: 'up'|'down'|'nearest',  // Default 'nearest'
  minStep?: number               // Default 1 (round to multiples of step)
}): number
```
Rounds large numbers for player-friendly display using significant digits and magnitude-based rounding.

### Qi Cap Calculation
```typescript
qiCap = 100 × 3^(totalStageIndex / 2)
```
Where totalStageIndex = realmIndex × 3 + stage (ranges 0-17). Smooth exponential scaling across all 18 stages.

### Qi Required for Breakthrough
```typescript
qiRequired = qiCap / 5
```
Players need to fill 20% of their realm's capacity to have the full base success rate.

### Lifespan Calculation
```typescript
lifespan = 100 × 2.15^realmNumber
realmNumber = Math.floor((totalRealmIndex + 2) / 3)
```
Where totalRealmIndex = realmIndex × 3 + stage.

### Meditation Experience Required
```typescript
expToNextLevel = 100 × 1.15^(level - 1)
```
Exponential growth, increasing every level.

### Body Experience Required
```typescript
expRequired = 100 × Math.floor(level^1.8)
```

### Battle Technique Bonus
```typescript
bonus = Math.floor(baseValue × level^1.5)
```

### Stat Cap Formulas
```typescript
vitalityCap = (100 × (qiRealmIndex + 1) × (bodyRealmIndex + 1)) + sqrt(totalTenacityEarned)
spiritCap   = (100 × (qiRealmIndex + 1) × (bodyRealmIndex + 1)) + sqrt(knowledge)
```

---

## 5. UI Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **Cultivator** | `src/components/Cultivator.tsx` | Header panel: displays all current stats (vitality, spirit, attack, defense, mental stats, lifespan, spirit stones), inventory with equip/unequip, and contains the Cultivator header UI |
| **QiCultivationPanel** | `src/features/cultivation/QiCultivationPanel.tsx` | Qi cultivation progress bar, breakthrough button, success chance display |
| **BodyCultivationPanel** | `src/features/cultivation/BodyCultivationPanel.tsx` | Body cultivation EXP/level, breakthrough requirements and attempt |
| **MeditationPanel** | `src/features/cultivation/MeditationPanel.tsx` | Meditation technique list, activate/deactivate, current stats display |
| **BattleTechniquesPanel** | `src/features/upgrades/BattleTechniquesPanel.tsx` | Battle technique list, level up buttons with spirit stone costs, stat bonuses |
| **CombatSystem** | `src/features/combat/CombatSystem.tsx` | Monster list selection, combat UI (HP bars, attack/flee), combat log |
| **MonsterList** | `src/features/combat/MonsterList.tsx` | Monster selection list with HP/reward display |
| **CombatView** | `src/features/combat/CombatView.tsx` | Active combat view with turn-based actions |
| **InventoryPanel** | `src/features/inventory/InventoryPanel.tsx` | Player inventory display with item quantities and use/equip actions |
| **EquipmentPanel** | `src/components/EquipmentPanel.tsx` | Equipment slots display for equipped items |
| **PlayerStatsPanel** | `src/components/PlayerStatsPanel.tsx` | Detailed player stat breakdown |
| **AlchemyPanel** | `src/features/alchemy/AlchemyPanel.tsx` | Placeholder for future alchemy system |
| **UnlockToast** | `src/components/UnlockToast.tsx` | Brief notification when new features are unlocked |
| **WelcomeModal** | `src/components/WelcomeModal.tsx` | Shows offline progress summary when returning |
| **Notification** | `src/components/Notification.tsx` | Individual notification item |
| **NotificationContainer** | `src/components/NotificationContainer.tsx` | Global notification stack for success/failure messages |

---

## 6. Integration (`src/App.tsx`)

The root component wires together:
- `useGameLoop` hook with all composed actions
- Tabbed navigation system: Cultivation, Combat, Upgrades, Alchemy
- Feature-gated components and tabs
- Welcome modal for offline progress
- Global notification container
- Reset Game button in top-right

**Tabs:**
```tsx
type TabId = "cultivation" | "combat" | "battle" | "alchemy";

const tabs = [
  { id: "cultivation", label: "Cultivation", visible: true },  // Always visible
  { id: "combat",      label: "Combat",      visible: state.unlockedFeatures.includes("monster") },
  { id: "battle",      label: "Upgrades",    visible: true },  // Always visible
  { id: "alchemy",     label: "Alchemy",     visible: state.unlockedFeatures.includes("alchemy") }
];
```

**Cultivation Tab Content:**
- QiCultivationPanel (with tryBreakthrough callbacks)
- BodyCultivationPanel (with tryBodyBreakthrough callbacks)
- MeditationPanel (with meditation type list, active selection, stats)

**Combat Tab Content:**
- CombatSystem (receives totalAttack, totalDefense, totalVitality, vitalityCap, defeatedMonsters, onVictory)
- InventoryPanel (receives inventory array and onItemClick handler)

**Upgrades Tab Content:**
- BattleTechniquesPanel (receives techniques, upgrade handler, spirit stones, body level)

**Alchemy Tab Content:**
- AlchemyPanel (placeholder)

**Feature Gating in Breakthrough Logic:**
```typescript
if (newRealmIndex >= 1 && !features.includes("monster")) features.push("monster");
if (newRealmIndex >= 2 && !features.includes("alchemy")) features.push("alchemy");
if (newRealmIndex >= 3 && !features.includes("bodyCultivation")) features.push("bodyCultivation");
```

---

## 7. File Structure

| File | Purpose |
|------|---------|
| `src/types/game.ts` | Core TypeScript interfaces (PlayerState, CultivationRealm, MeditationType, BattleTechnique) |
| `src/types/inventory.ts` | Inventory system types (ItemTemplate, InventoryItem, ItemDropEntry, ItemStats, ItemSlot) |
| `src/types/combat.ts` | Combat types (Monster, MonsterDrops, CombatState) |
| `src/constants/cultivationRealms.ts` | Qi and Body realm definitions (18 stages each with dynamic caps via gameMath) |
| `src/constants/monsters.ts` | 10 monster definitions with HP, attack, EXP, TP, and item drop tables |
| `src/constants/meditations.ts` | 3 starting meditation techniques |
| `src/constants/techniques.ts` | 4 starting battle techniques |
| `src/constants/items.ts` | Item templates (cores, pills, equipment) |
| `src/utils/gameMath.ts` | Mathematical utilities (clean numbers, caps, exp requirements, breakthrough costs) |
| `src/utils/statCalc.ts` | Stat calculation functions (caps, meditation stats, battle bonuses, upgrade costs) |
| `src/utils/inventoryUtils.ts` | Inventory utility functions (drop resolution, inventory management) |
| `src/hooks/useGameLoop.ts` | Core game loop orchestrator (composes all domain hooks) |
| `src/hooks/useGameState.ts` | Single source of truth with localStorage persistence |
| `src/hooks/useGameTick.ts` | 1Hz tick with passive gains, regen, offline detection, welcome modal |
| `src/hooks/useBreakthrough.ts` | Qi and Body breakthrough attempt logic |
| `src/hooks/useCombat.ts` | Combat simulation and victory processing |
| `src/hooks/useUpgrades.ts` | Battle technique upgrade logic |
| `src/hooks/useInventory.ts` | Inventory add/use/equip/unequip logic |
| `src/hooks/useMeditation.ts` | Meditation selection and experience gain |
| `src/hooks/useNotifications.ts` | Notification system hook |
| `src/components/Cultivator.tsx` | Main status header with stats, inventory, equipment |
| `src/components/EquipmentPanel.tsx` | Equipped items display |
| `src/components/PlayerStatsPanel.tsx` | Detailed stat breakdown |
| `src/components/UnlockToast.tsx` | Feature unlock toast notification |
| `src/components/WelcomeModal.tsx` | Offline progress summary modal |
| `src/components/Notification.tsx` | Individual notification item |
| `src/components/NotificationContainer.tsx` | Global notification display |
| `src/features/cultivation/QiCultivationPanel.tsx` | Qi cultivation progress and breakthrough UI |
| `src/features/cultivation/BodyCultivationPanel.tsx` | Body cultivation progress and breakthrough UI |
| `src/features/cultivation/MeditationPanel.tsx` | Meditation system UI with technique list and activation |
| `src/features/combat/CombatSystem.tsx` | Full combat UI (monster list + active combat) |
| `src/features/combat/CombatView.tsx` | Active turn-based combat view |
| `src/features/combat/MonsterList.tsx` | Monster selection list |
| `src/features/inventory/InventoryPanel.tsx` | Player inventory display |
| `src/features/upgrades/BattleTechniquesPanel.tsx` | Battle techniques UI with leveling and upgrades |
| `src/features/alchemy/AlchemyPanel.tsx` | Placeholder for future alchemy system |
| `src/App.tsx` | Root component composition with tabbed navigation |
| `src/App.css` | Styling for all components including tab system |

---

## 8. Current Implementation Status

### ✅ Fully Implemented
- Dual cultivation system (Qi and Body paths fully active, 18 stages each)
- Probabilistic breakthrough system with different penalties per path (Qi: -50% Qi, Body: -30% tenacity, -1 body level)
- Meditation system with 3 techniques, exponential experience, level-based stat multipliers
- Battle techniques system with 4 techniques, spirit stone upgrades, body-level-based level cap
- Complete stat system (Curiosity, Tenacity, Knowledge, Vitality, Spirit, Attack, Defense)
- Lifespan system with activity-based growth and realm-based max
- Turn-based combat system with 10 monsters, body EXP, and tribulation points
- Body cultivation with EXP, levels, and tribulation point requirements
- Equipment system with weapon/accessory slots, stat bonuses, and mental growth multipliers
- Full inventory system with stackable materials, consumable pills, and equippable items
- Universal item drop system for monsters with probability-based loot tables
- Tabbed navigation (Cultivation, Combat, Upgrades, Alchemy)
- Offline progress calculation with WelcomeModal
- Notification system for user feedback
- Feature unlocking based on realm progression
- Persistent save/load with localStorage
- Reset Game button

### 🔄 Partially Implemented
- Alchemy system (placeholder component, mechanics TBD)
- Pill item effects (Foundation Pill exists in constants but consumable action TBD)

### 📋 Future Considerations
- Spirit stone consumption for Qi breakthroughs
- Combat system expansion (vitality/spirit usage)
- Additional meditation techniques
- More monster varieties
- Alchemy recipes and effects
- Achievement system
- Leaderboards/social features

---

## 9. Summary

Incresage is a sophisticated cultivation idle game with:
- **Dual progression paths** (Qi and Body cultivation, both fully implemented)
- **18 total stages** across 6 realms per path with independent advancement
- **Deep meditation system** with 3 techniques, experience, and leveling
- **Battle techniques system** with 4 upgradeable techniques providing combat bonuses
- **Equipment system** with equippable items granting stat bonuses and growth multipliers
- **Probabilistic breakthroughs** with path-specific risk/reward mechanics
- **Comprehensive stat system** with 8+ interconnected stats
- **Full combat system** with turn-based battles, tribulation points, body EXP, and item drops
- **Universal item drop system** with inventory management, stacking, and equipment
- **Tabbed navigation** with feature-gated tabs
- **Offline progress** with detailed return summaries
- **Feature gating** that unlocks content as players advance
- **Clean mathematical scaling** using exponential formulas
- **Full persistence** with automatic save/load
- **Hook composition architecture** for clean separation of domain logic

The architecture is designed for extensibility, allowing easy addition of new realms, monsters, meditation techniques, battle techniques, items, equipment, and game systems.