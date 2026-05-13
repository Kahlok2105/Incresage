import React from "react";
import type { CombatState } from "../../types/combat";

interface CombatViewProps {
  combatState: CombatState;
  playerAttack: number;
  playerDefense: number;
  playerVitalityCap: number;
  onFlee: () => void;
  onBack: () => void;
  repeatCountdown: number;
}

export const CombatView: React.FC<CombatViewProps> = ({
  combatState,
  playerAttack,
  playerDefense,
  playerVitalityCap,
  onFlee,
  onBack,
  repeatCountdown
}) => {
  // Calculate HP percentages for bars (capped at 100 to prevent overflow)
  const getPlayerHPPercent = () => {
    return Math.min(100, (combatState.playerHP / playerVitalityCap) * 100);
  };

  const getMonsterHPPercent = () => {
    if (!combatState.monster) return 0;
    return Math.min(100, (combatState.monsterHP / combatState.monster.hp) * 100);
  };

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
          <button onClick={onFlee} className="flee-btn">
            🏃 Flee
          </button>
        </div>
      )}

      {/* Auto-repeat countdown */}
      {!combatState.isActive && repeatCountdown > 0 && (
        <div className="combat-controls">
          <div className="battle-status repeat-status">
            ⏳ Next battle in {repeatCountdown}s...
          </div>
          <button onClick={onBack} className="back-btn">
            ← Stop & Back to List
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

      {/* Back Button (only shown when combat is finished and no repeat is scheduled) */}
      {!combatState.isActive && repeatCountdown === 0 && (
        <button onClick={onBack} className="back-btn">
          ← Back to Monster List
        </button>
      )}
    </section>
  );
};