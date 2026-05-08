import React from "react";
import { BODY_REALMS, getCurrentRealm } from "../../constants/cultivationRealms";
import { calculateTenacityRequired, calculateTPRequired } from "../../utils/gameMath";

/**
 * Displays the player's body cultivation progress and breakthrough options.
 */
export const BodyCultivationPanel: React.FC<{
  state: {
    currentBodyRealmIndex: number;
    currentBodyStage: number;
    bodyLevel: number;
    bodyExp: number;
    tenacity: number;
    tribulationPoints: number;
  };
  tryBodyBreakthrough: () => { success: boolean; chance: number };
  calculateBodyBreakthroughChance: () => number;
  getBodyStageIndex: () => number;
}> = ({ state, tryBodyBreakthrough, calculateBodyBreakthroughChance, getBodyStageIndex }) => {
  // Add runtime safety for all numeric state properties - default to 0 if undefined
  const tenacity = state.tenacity ?? 0;
  const tribulationPoints = state.tribulationPoints ?? 0;
  const bodyLevel = state.bodyLevel ?? 0;
  const bodyExp = state.bodyExp ?? 0;
  const currentBodyRealmIndex = state.currentBodyRealmIndex ?? 0;
  const currentBodyStage = state.currentBodyStage ?? 0;

  const currentBodyRealm = getCurrentRealm(BODY_REALMS, currentBodyRealmIndex, currentBodyStage);
  const bodyStageIndex = getBodyStageIndex();
  const nextBodyRealm = BODY_REALMS[bodyStageIndex + 1];
  
  const requiredBodyLevel = bodyStageIndex + 1;
  const tenacityRequired = calculateTenacityRequired(bodyStageIndex);
  const tpRequired = calculateTPRequired(bodyStageIndex);
  
  const currentChance = nextBodyRealm
    ? (calculateBodyBreakthroughChance() * 100).toFixed(1)
    : "0.0";

  const canAttempt = nextBodyRealm && 
                     tenacity >= tenacityRequired * 0.5 && 
                     tribulationPoints >= tpRequired * 0.5 &&
                     bodyLevel >= requiredBodyLevel * 0.5;

  const tenacityRatio = (tenacity / tenacityRequired * 100).toFixed(1);
  const tpRatio = (tribulationPoints / tpRequired * 100).toFixed(1);
  const levelRatio = Math.min(bodyLevel / requiredBodyLevel, 1.5);

  const attemptLabel = nextBodyRealm
    ? canAttempt
      ? "Attempt Body Breakthrough"
      : "Gather More Resources"
    : "Maximum Realm Reached";

  const handleBreakthrough = () => {
    const result = tryBodyBreakthrough();
    if (result.success) {
      alert("Body breakthrough successful! You have advanced to the next realm.");
    } else if (result.chance > 0) {
      alert(`Body breakthrough failed! You lost 30% of your tenacity and 1 body level.`);
    }
  };

  return (
    <div className="body-cultivation-panel" style={{ 
      padding: '20px', 
      border: '2px solid #8B4513', 
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #2a1810 0%, #1a0f0a 100%)',
      color: '#f0e6d3'
    }}>
      <h2 style={{ color: '#D4A574', marginBottom: '15px' }}>Body Cultivation</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Current Realm:</strong> {currentBodyRealm.displayName}</p>
        <p><strong>Body Stage Index:</strong> {bodyStageIndex} (Realm {currentBodyRealmIndex}, Stage {currentBodyStage})</p>
        <p><strong>Body Level:</strong> {bodyLevel} (EXP: {bodyExp.toFixed(0)})</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#D4A574', fontSize: '1rem' }}>Breakthrough Requirements</h3>
        
        {/* Tenacity */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Tenacity:</span>
            <span>{tenacity.toFixed(1)} / {tenacityRequired.toFixed(1)} ({tenacityRatio}%)</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#3a2a1a', borderRadius: '4px' }}>
            <div 
              style={{ 
              width: `${Math.min(100, (tenacity / tenacityRequired) * 100)}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #ff6b35 0%, #ff8c00 100%)',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        {/* Tribulation Points */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Tribulation Points:</span>
            <span>{tribulationPoints.toFixed(1)} / {tpRequired.toFixed(1)} ({tpRatio}%)</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#3a2a1a', borderRadius: '4px' }}>
            <div 
              style={{ 
              width: `${Math.min(100, (tribulationPoints / tpRequired) * 100)}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #4a90d9 0%, #6bb5ff 100%)',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        {/* Body Level */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Body Level:</span>
            <span>{bodyLevel} / {requiredBodyLevel} (×{levelRatio.toFixed(2)})</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#3a2a1a', borderRadius: '4px' }}>
            <div 
              style={{ 
                width: `${Math.min(100, (bodyLevel / requiredBodyLevel) * 100)}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #50c878 0%, #7ddc9e 100%)',
                borderRadius: '4px'
              }}
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '3px' }}>
            Level ratio capped at 1.5x
          </p>
        </div>
      </div>

      {nextBodyRealm && (
        <div style={{ 
          padding: '15px', 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <h3 style={{ color: '#D4A574', fontSize: '1rem', marginBottom: '10px' }}>
            Next: {nextBodyRealm.displayName}
          </h3>
          <p>Success Chance: <strong style={{ color: currentChance && parseFloat(currentChance) > 50 ? '#50c878' : '#ff6b35' }}>{currentChance}%</strong></p>
          
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
            ⚠️ Failure penalty: Lose 30% tenacity and 1 body level
          </p>
        </div>
      )}

      <div style={{ fontSize: '0.85rem', color: '#aaa', lineHeight: '1.5' }}>
        <p><strong>How it works:</strong></p>
        <ul style={{ margin: '5px 0', padding: '0 0 0 20px' }}>
          <li>Tenacity is gained from "Explore Self" meditation</li>
          <li>Tribulation Points are earned by defeating monsters (one-time per monster type)</li>
          <li>Body Level increases by defeating monsters and gaining EXP</li>
          <li>Success chance = Base Rate × (Tenacity/Required) × (TP/Required) × min(Level/Required, 1.5)</li>
        </ul>
      </div>
    </div>
  );
};