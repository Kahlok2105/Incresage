import React from "react";
import type { Monster } from "../../types/combat";
import { MONSTERS } from "../../constants/monsters";

interface MonsterListProps {
  onSelect: (monster: Monster) => void;
}

export const MonsterList: React.FC<MonsterListProps> = ({ onSelect }) => {
  return (
    <section className="combat-system">
      <h2>⚔️ Monster Hunt</h2>
      <p>Challenge monsters to earn spirit stones and body cultivation experience!</p>
      <div className="monster-list">
        {MONSTERS.map((monster) => (
          <button
            key={monster.id}
            onClick={() => onSelect(monster)}
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
};