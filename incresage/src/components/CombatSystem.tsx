import React, { useState, useEffect } from "react";
import { MONSTERS } from "../constants/gameData";
import type { Monster, CombatState } from "../types/game";

interface CombatSystemProps {
  playerAttack: number;
  playerDefense: number;
  playerVitality: number;
  playerVitalityCap: number;
  addSpiritStones: (amount: number) => void;
  addBodyExp: (amount: number) => void;
}

export const CombatSystem: React.FC<CombatSystemProps> = ({
  playerAttack,
  playerDefense,
  playerVitality,
  playerVitalityCap,
  addSpiritStones,
  addBodyExp
}) => {
  const [combatState, setCombatState] = useState<CombatState>({
    isActive: false,
    monster: null,
    playerHP: playerVitality,
    monsterHP: 0,
    log: [],
    isPlayerTurn: true
  });

  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);

  // Start combat with a specific monster
  const startCombat = (monster: Monster) => {
    setSelectedMonster(monster);
    setCombatState({
      isActive: true,
      monster,
      playerHP: playerVitality,
      monsterHP: monster.hp,
      log: [`A wild ${monster.name} appears! (Difficulty: ${monster.difficulty})`],
      isPlayerTurn: true
    });
  };

  // Player attacks the monster
  const playerAttackAction = () => {
    if (!combatState.isActive || !combatState.isPlayerTurn || !combatState.monster) return;

    // Calculate damage: player attack - monster defense (min 1)
    // Monsters have no defense stat, so damage = player attack with variance
    const baseDamage = playerAttack;
    const damage = Math.floor(baseDamage * (0.8 + Math.random() * 0.4));
    const newMonsterHP = Math.max(0, combatState.monsterHP - damage);

    const newLog = [...combatState.log, `You deal ${damage} damage to ${combatState.monster.name}!`];

    // Check if monster is defeated
    if (newMonsterHP <= 0) {
      const monster = combatState.monster;
      const stonesGained = monster.drops.spiritStones;
      const expGained = monster.expReward;

      // Award drops
      addSpiritStones(stonesGained);
      addBodyExp(expGained);

      setCombatState({
        ...combatState,
        monsterHP: 0,
        log: [
          ...newLog,
          `🎉 Victory! Defeated ${monster.name}!`,
          `Received ${stonesGained} spirit stones and ${expGained} body EXP!`,
          `Received ${monster.drops.monsterCores.map(c => `${c.amount}x Tier ${c.tier} Monster Core`).join(", ")}`
        ],
        isActive: false
      });

      return;
    }

    // Monster's turn to attack
    setCombatState({
      ...combatState,
      monsterHP: newMonsterHP,
      isPlayerTurn: false,
      log: newLog
    });

    // Monster counterattacks after a short delay
    setTimeout(() => monsterAttack(newMonsterHP), 500);
  };

  // Monster attacks the player
  const monsterAttack = (currentMonsterHP: number) => {
    if (!combatState.monster) return;

    // Calculate monster damage: monster attack - player defense (min 1)
    const baseDamage = Math.max(1, combatState.monster.attack - playerDefense);
    const damage = Math.floor(baseDamage * (0.8 + Math.random() * 0.4));
    const newPlayerHP = Math.max(0, combatState.playerHP - damage);

    const newLog = [...combatState.log, `${combatState.monster.name} deals ${damage} damage to you!`];

    // Check if player is defeated
    if (newPlayerHP <= 0) {
      setCombatState({
        ...combatState,
        playerHP: 0,
        isPlayerTurn: true,
        log: [
          ...newLog,
          "💀 You were defeated! The monster escapes...",
          "Rest and try again!"
        ],
        isActive: false
      });
      return;
    }

    setCombatState({
      ...combatState,
      playerHP: newPlayerHP,
      isPlayerTurn: true,
      log: newLog
    });
  };

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
      playerHP: playerVitality,
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
            <span>{combatState.monsterHP} / {combatState.monster.hp} HP</span>
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
          <span>{combatState.playerHP} / {playerVitalityCap} HP</span>
        </div>
        <p className="player-stats">ATK: {playerAttack} | DEF: {playerDefense}</p>
      </div>

      {/* Combat Controls */}
      {combatState.isActive && combatState.isPlayerTurn && (
        <div className="combat-controls">
          <button onClick={playerAttackAction} className="attack-btn">
            ⚔️ Attack
          </button>
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