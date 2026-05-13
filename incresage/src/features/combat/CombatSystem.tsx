import React, { useState, useEffect, useRef } from "react";
import type { Monster } from "../../types/combat";
import type { CombatState } from "../../types/combat";
import { MonsterList } from "./MonsterList";
import { CombatView } from "./CombatView";

interface CombatSystemProps {
  playerAttack: number;
  playerDefense: number;
  playerVitality: number;
  playerVitalityCap: number;
  onVictory: (monster: Monster) => void;
  defeatedMonsters: string[];
}

export const CombatSystem: React.FC<CombatSystemProps> = ({
  playerAttack,
  playerDefense,
  playerVitality,
  playerVitalityCap,
  onVictory,
  defeatedMonsters
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
  const [repeatCountdown, setRepeatCountdown] = useState<number>(0);
  const repeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear repeat timer on unmount
  useEffect(() => {
    return () => {
      if (repeatTimerRef.current) clearTimeout(repeatTimerRef.current);
    };
  }, []);

  //1. Start combat with a specific monster
  const startCombat = (monster: Monster) => {
      setSelectedMonster(monster);
      setCombatState({
        isActive: true,
        monster,
        playerHP: Math.floor(playerVitality),
        monsterHP: monster.hp,
        log: [`A wild Tier ${monster.difficulty} ${monster.name} appears!`],
        isPlayerTurn: true
      });
      setRepeatCountdown(0);
    };

  // Auto-repeat combat after 2-second delay
  const scheduleRepeat = (monster: Monster) => {
    setRepeatCountdown(2);
    repeatTimerRef.current = setInterval(() => {
      setRepeatCountdown(prev => {
        if (prev <= 1) {
          if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
          repeatTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      repeatTimerRef.current = null;
      setRepeatCountdown(0);
      startCombat(monster);
    }, 2000);
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
        const monster = prev.monster!;

        setTimeout(() => {
          onVictory(monster);
        }, 0);

        const isFirstDefeat = !defeatedMonsters.includes(monster.id);
        const tpMessage = monster.tpReward > 0 && isFirstDefeat
          ? ` and ${monster.tpReward} Tribulation Points!`
          : "";

        const lootMessage = monster.drops.items?.length
          ? "Loot has been added to your inventory."
          : "No item drops were found.";

        // Schedule auto-repeat after victory
        setTimeout(() => {
          scheduleRepeat(monster);
        }, 500);

        return {
          ...prev,
          monsterHP: 0,
          isActive: false,
          log: [
            ...newLog,
            `Defeated ${monster.name}!`,
            `Received ${monster.drops.spiritStones} spirit stones and ${monster.expReward} body EXP!`,
            `${lootMessage}${tpMessage}`
          ],
        };
      }

      return {
        ...prev,
        monsterHP: newMonsterHP,
        isPlayerTurn: false,
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
        isPlayerTurn: true,
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
    // Cancel any pending repeat
    if (repeatTimerRef.current) {
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    setRepeatCountdown(0);

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
    // Cancel any pending repeat
    if (repeatTimerRef.current) {
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    setRepeatCountdown(0);

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

  // Monster List View
  if (!selectedMonster) {
    return <MonsterList onSelect={startCombat} />;
  }

  // Combat View
  return (
    <CombatView
      combatState={combatState}
      playerAttack={playerAttack}
      playerDefense={playerDefense}
      playerVitalityCap={playerVitalityCap}
      onFlee={fleeCombat}
      onBack={goBackToList}
      repeatCountdown={repeatCountdown}
    />
  );
};