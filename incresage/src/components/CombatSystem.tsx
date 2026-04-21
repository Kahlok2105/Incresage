import React, { useState, useEffect } from "react";
import { MONSTERS } from "../constants/gameData";
import type { Monster, CombatState } from "../types/game";

interface CombatSystemProps {
  playerAttack: number;
  playerDefense: number;
  playerVitality: number;
  playerVitalityCap: number;
  addSpiritStones: (amount: number) => void;
  addBodyExpNew: (amount: number) => void;
  addTribulationPoints: (monster: Monster) => void;
}

export const CombatSystem: React.FC<CombatSystemProps> = ({
  playerAttack,
  playerDefense,
  playerVitality,
  playerVitalityCap,
  addSpiritStones,
  addBodyExpNew,
  addTribulationPoints
}) => {
  const [combatState, setCombatState] = useState<CombatState>({
    isActive: false,
    monster: null,
    playerHP: Math.floor(playerVitality),
    monsterHP: 0,
    log: [],
    isPlayerTurn: true
  });

  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);

  //1. Start combat with a specific monster
  const startCombat = (monster: Monster) => {
      setSelectedMonster(monster);
      setCombatState({
        isActive: true,
        monster,
        playerHP: Math.floor(playerVitality), // Initialize from prop
        monsterHP: monster.hp,    // Initialize from monster data
        log: [`A wild Tier ${monster.difficulty} ${monster.name} appears!`],
        isPlayerTurn: true
      });
    };

  //2. Player attacks the monster

  const playerAttackAction = () => {
    if (!combatState.isActive || !combatState.isPlayerTurn || !combatState.monster) return;

    const damage = Math.floor(playerAttack * (0.8 + Math.random() * 0.4));
    
    // Use functional update to ensure we have the latest monsterHP
    setCombatState(prev => {
      const newMonsterHP = Math.max(0, prev.monsterHP - damage);
      const newLog = [...prev.log, `You deal ${damage} damage to ${prev.monster?.name}!`];

      if (newMonsterHP <= 0) {
        // Victory Logic
        const monster = prev.monster!;
        const tpGained = monster.tpReward || 0;

        // 1. Call parent reward functions
        setTimeout(() => {

        addSpiritStones(monster.drops.spiritStones);
        addBodyExpNew(monster.expReward);
        addTribulationPoints(monster);
        }, 0); // Delay to allow log to update before rewards are added

        // 2. Construct the reward messages
        const tpMessage = tpGained > 0 
          ? ` and ${tpGained} Tribulation Points!` 
          : " (TP already collected)";

        const coreMessage = monster.drops.monsterCores.length > 0
          ? `Received ${monster.drops.monsterCores.map(c => `${c.amount}x Tier ${c.tier} Core`).join(", ")}`
          : "No cores found";

        return {
          ...prev,
          monsterHP: 0,
          isActive: false,
          log: [
            ...newLog,
            `Defeated ${monster.name}!`,
            `Received ${monster.drops.spiritStones} spirit stones and ${monster.expReward} body EXP!`,
            `${coreMessage}${tpMessage}`
          ],
        };
      }

      return {
        ...prev,
        monsterHP: newMonsterHP,
        isPlayerTurn: false, // Switch turn to disable button
        log: newLog
      };
    });
  }


  //3. Monster attacks the player

  const monsterAttack = () => {
    setCombatState(prev => {
      if (!prev.isActive || !prev.monster) return prev;

      const baseDamage = Math.max(1, prev.monster.attack - playerDefense);
      const damage = Math.floor(baseDamage * (0.8 + Math.random() * 0.4));
      const newPlayerHP = Math.max(0, prev.playerHP - damage);
      const newLog = [...prev.log, `${prev.monster.name} deals ${damage} damage to you!`];

      if (newPlayerHP <= 0) {
        return {
          ...prev,
          playerHP: 0,
          isActive: false,
          log: [...newLog, "💀 You were defeated!"]
        };
      }

      return {
        ...prev,
        playerHP: newPlayerHP,
        isPlayerTurn: true, // Re-enable player button
        log: newLog
      };
    });
  };

  // Monster auto attack when it's monster turn
  useEffect(() => {
    if (!combatState.isPlayerTurn && combatState.isActive) {
      const timer = setTimeout(() => {
        monsterAttack();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [combatState.isPlayerTurn, combatState.isActive]);

  // Player auto attack when it's player turn (automatic battle loop)
  useEffect(() => {
    if (combatState.isPlayerTurn && combatState.isActive) {
      const timer = setTimeout(() => {
        playerAttackAction();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [combatState.isPlayerTurn, combatState.isActive]);

  // Flee from combat
  const fleeCombat = () => {
    setCombatState({
      ...combatState,
      log: [...combatState.log, "You fled from the battle!"],
      isActive: false
    });
    setTimeout(() => {
      setSelectedMonster(null);
    }, 1000);
  };

  // Go back to monster list
  const goBackToList = () => {
    setSelectedMonster(null);
      setCombatState({
        isActive: false,
        monster: null,
        playerHP: Math.floor(playerVitality),
        monsterHP: 0,
        log: [],
        isPlayerTurn: true
      });
  };

  // Calculate HP percentages for bars
  const getPlayerHPPercent = () => {
    return (combatState.playerHP / playerVitalityCap) * 100;
  };

  const getMonsterHPPercent = () => {
    if (!combatState.monster) return 0;
    return (combatState.monsterHP / combatState.monster.hp) * 100;
  };

  // Monster List View
  if (!selectedMonster) {
    return (
      <section className="combat-system">
        <h2>⚔️ Monster Hunt</h2>
        <p>Challenge monsters to earn spirit stones and body cultivation experience!</p>
        <div className="monster-list">
          {MONSTERS.map((monster) => (
            <button
              key={monster.id}
              onClick={() => startCombat(monster)}
              className="monster-card"
            >
              <div className="monster-card-header">
                <span className="monster-name">{monster.name}</span>
                <span className={`difficulty-badge diff-${monster.difficulty}`}>
                  ★ {monster.difficulty}
                </span>
              </div>
              <div className="monster-card-stats">
                <span>HP: {monster.hp}</span>
                <span>ATK: {monster.attack}</span>
              </div>
              <div className="monster-card-rewards">
                <span>🪨 {monster.drops.spiritStones}</span>
                <span>⭐ {monster.expReward} EXP</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  }

  // Combat View
  return (
    <section className="combat-system active">
      <h2>⚔️ Combat</h2>
      
      {/* Monster Display */}
      {combatState.monster && (
        <div className="monster-display">
          <div className="monster-display-header">
            <h3>{combatState.monster.name}</h3>
            <span className={`difficulty-badge diff-${combatState.monster.difficulty}`}>
              ★ {combatState.monster.difficulty}
            </span>
          </div>
          <div className="hp-bar monster-hp">
            <div 
              className="hp-fill" 
              style={{ width: `${getMonsterHPPercent()}%` }}
            />
            <span>{Math.floor(combatState.monsterHP)} / {Math.floor(combatState.monster.hp)} HP</span>
          </div>
          <p className="monster-stats">ATK: {combatState.monster.attack}</p>
        </div>
      )}

      {/* Player HP Display */}
      <div className="player-display">
        <h3>Your HP</h3>
        <div className="hp-bar player-hp">
          <div 
            className="hp-fill" 
            style={{ width: `${getPlayerHPPercent()}%` }}
          />
          <span>{Math.floor(combatState.playerHP)} / {Math.floor(playerVitalityCap)} HP</span>
        </div>
        <p className="player-stats">ATK: {playerAttack} | DEF: {playerDefense}</p>
      </div>

      {/* Combat Controls */}
      {combatState.isActive && (
        <div className="combat-controls">
          <div className="battle-status">
            {combatState.isPlayerTurn ? "⏳ Preparing attack..." : "⚔️ Monster is attacking..."}
          </div>
          <button onClick={fleeCombat} className="flee-btn">
            🏃 Flee
          </button>
        </div>
      )}

      {/* Combat Log */}
      <div className="combat-log">
        {combatState.log.slice(-5).map((entry, index) => (
          <p key={index} className={index === combatState.log.length - 1 ? "latest" : ""}>
            {entry}
          </p>
        ))}
      </div>

      {/* Back Button */}
      {!combatState.isActive && (
        <button onClick={goBackToList} className="back-btn">
          ← Back to Monster List
        </button>
      )}
    </section>
  );
};