import React from "react";
import { QI_REALMS, getCurrentRealm } from "../../constants/cultivationRealms";
import type { PlayerState } from "../../types/game";

/**
 * Displays the player's qi cultivation progress and breakthrough options.
 */
export const QiCultivationPanel: React.FC<{
  state: PlayerState;
  tryBreakthrough: () => { success: boolean };
  usableQi: number;
  totalQi: number;
}> = ({ state, tryBreakthrough, usableQi, totalQi }) => {
  // Add runtime safety for all numeric state properties - default to 0 if undefined
  const currentRealmIndex = state.currentQiRealmIndex ?? 0;
  const currentStage = state.currentQiStage ?? 0;

  const currentRealm = getCurrentRealm(QI_REALMS, currentRealmIndex, currentStage);
  const nextRealm = QI_REALMS[currentRealmIndex * 3 + currentStage + 1];
  
  const qiRequired = nextRealm ? nextRealm.qiRequired : 0;
  const qiRatio = nextRealm ? Math.min(1, usableQi / qiRequired) : 0;
  const currentChance = nextRealm
    ? (nextRealm.baseSuccessRate * qiRatio * 100).toFixed(1)
    : "0.0";

  const canAttempt = nextRealm && usableQi >= qiRequired * 0.5;

  const qiPercent = Math.min(100, (usableQi / totalQi * 100)).toFixed(1);

  const attemptLabel = nextRealm
    ? canAttempt
      ? "Attempt Qi Breakthrough"
      : "Gather More Qi"
    : "Maximum Realm Reached";

  const handleBreakthrough = () => {
    const result = tryBreakthrough();
    if (result.success) {
      alert("Qi breakthrough successful! You have advanced to the next realm.");
    } else {
      alert("Qi breakthrough failed! You lost 50% of your Qi.");
    }
  };

  return (
    <div className="qi-cultivation-panel" style={{ 
      padding: '20px', 
      border: '2px solid #8B4513', 
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #2a1810 0%, #1a0f0a 100%)',
      color: '#f0e6d3'
    }}>
      <h2 style={{ color: '#D4A574', marginBottom: '15px' }}>Qi Cultivation</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Current Realm:</strong> {currentRealm.displayName}</p>
        <p><strong>Qi:</strong> {usableQi.toFixed(0)} / {totalQi.toFixed(0)}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#D4A574', fontSize: '1rem' }}>Qi Progress</h3>
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Qi:</span>
            <span>{usableQi.toFixed(0)} / {totalQi.toFixed(0)} ({qiPercent}%)</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#3a2a1a', borderRadius: '4px' }}>
            <div style={{ 
              width: `${qiPercent}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #ff6b35 0%, #ff8c00 100%)',
              borderRadius: '4px'
            }} />
          </div>
        </div>
      </div>

      {nextRealm && (
        <div style={{ 
          padding: '15px', 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <h3 style={{ color: '#D4A574', fontSize: '1rem', marginBottom: '10px' }}>
            Next: {nextRealm.displayName}
          </h3>
          <p>Success Chance: <strong style={{ color: parseFloat(currentChance) > 50 ? '#50c878' : '#ff6b35' }}>{currentChance}%</strong></p>
          <button 
            disabled={!canAttempt}
            onClick={handleBreakthrough}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              background: canAttempt ? 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)' : '#555',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: canAttempt ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {attemptLabel}
          </button>
          <p style={{ fontSize: '0.8rem', color: '#ff6b6b', marginTop: '10px' }}>
            ⚠️ Failure penalty: Lose 50% Qi
          </p>
        </div>
      )}

      <div style={{ fontSize: '0.85rem', color: '#aaa', lineHeight: '1.5' }}>
        <p><strong>How it works:</strong></p>
        <ul style={{ margin: '5px 0', padding: '0 0 0 20px' }}>
          <li>Qi is gained passively over time</li>
          <li>Qi gain is doubled while meditating</li>
          <li>Breakthrough requires sufficient Qi for the next realm</li>
          <li>Success chance = min(100%, (Qi / Required) × 100)</li>
        </ul>
      </div>
    </div>
  );
};