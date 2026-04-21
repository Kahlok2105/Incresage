import React from "react";
import type { BattleTechnique } from "../types/game";

/**
 * Battle techniques panel that displays available battle techniques and allows upgrading.
 */
export const BattleTechniquesPanel: React.FC<{
  battleTechniques: BattleTechnique[];
  upgradeBattleTechnique: (techniqueId: string) => void;
  spiritStones: number;
  bodyLevel: number;
}> = ({
  battleTechniques,
  upgradeBattleTechnique,
  spiritStones,
  bodyLevel,
}) => {
  return (
    <div className="battle-techniques-panel">
      <h2>Battle Techniques</h2>

      <div className="battle-techniques-list">
        {battleTechniques.map((technique) => {
          const maxLevel = Math.min(100, bodyLevel * 5);
          const canUpgrade = technique.level < maxLevel;
          const cost = canUpgrade ? Math.floor(technique.baseValue * Math.pow(1.15, technique.level + 1)) : 0;
          const canAfford = spiritStones >= cost;
          const bonus = technique.level > 0 ? (technique.baseValue * Math.pow(technique.level, 1.5)).toFixed(2) : "0.00";

          return (
            <div key={technique.id} className="battle-technique-item">
              <h3>{technique.name}</h3>
              <div className="battle-technique-stats">
                <span>Level: {technique.level}/{maxLevel}</span>
                <span>Stat: {technique.stat.charAt(0).toUpperCase() + technique.stat.slice(1)}</span>
                <span>Bonus: +{bonus}</span>
              </div>
              {canUpgrade && (
                <div className="battle-technique-controls">
                  <button
                    onClick={() => upgradeBattleTechnique(technique.id)}
                    disabled={!canAfford}
                    className={canAfford ? "upgrade-btn" : "upgrade-btn disabled"}
                  >
                    Upgrade ({cost} Spirit Stones)
                  </button>
                </div>
              )}
              {!canUpgrade && technique.level >= 100 && (
                <div className="battle-technique-maxed">
                  <span>Max Level Reached</span>
                </div>
              )}
              {!canUpgrade && technique.level < 100 && (
                <div className="battle-technique-capped">
                  <span>Capped by Body Level ({bodyLevel * 5})</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

