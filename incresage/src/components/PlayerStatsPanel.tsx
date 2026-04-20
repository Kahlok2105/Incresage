import React from "react";

/**
 * Displays the player's stats in a unified panel.
 */
export const PlayerStatsPanel: React.FC<{
  vitality: number;
  vitalityCap: number;
  spirit: number;
  spiritCap: number;
  attack: number;
  defense: number;
  knowledge: number;
  curiosity: number;
  tenacity: number;
  lifespan: number;
  maxLifespan: number;
  spiritStones: number;
}> = ({
  vitality,
  vitalityCap,
  spirit,
  spiritCap,
  attack,
  defense,
  knowledge,
  curiosity,
  tenacity,
  lifespan,
  maxLifespan,
  spiritStones,
}) => {
  const vitalityPercent = (vitality / vitalityCap * 100).toFixed(1);
  const spiritPercent = (spirit / spiritCap * 100).toFixed(1);

  return (
    <div className="player-stats-panel" style={{ 
      padding: '16px', 
      margin: '0 auto', 
      border: '2px solid #4a90d9', 
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: '#f0e6d3',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ color: '#6bb5ff', marginBottom: '12px', fontSize: '1rem' }}>Player Stats</h2>
      
      {/* Vitality Bar */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', fontSize: '0.9rem', minHeight: '18px' }}>
          <span style={{ fontWeight: 'bold' }}>Vitality</span>
          <span>{vitality.toFixed(0)} / {vitalityCap.toFixed(0)}</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: '#3a2a1a', borderRadius: '3px' }}>
          <div style={{ width: `${vitalityPercent}%`, height: '100%', background: '#50c878', borderRadius: '3px' }} />
        </div>
      </div>
      
      {/* Spirit Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', fontSize: '0.9rem', minHeight: '18px' }}>
          <span style={{ fontWeight: 'bold' }}>Spirit</span>
          <span>{spirit.toFixed(0)} / {spiritCap.toFixed(0)}</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: '#3a2a1a', borderRadius: '3px' }}>
          <div style={{ width: `${spiritPercent}%`, height: '100%', background: '#4a90d9', borderRadius: '3px' }} />
        </div>
      </div>
      
      {/* Other Stats Grid - Compact */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px 12px', fontSize: '0.85rem' }}>
        <p style={{ margin: 0, textAlign: 'left' }}><strong>Attack:</strong> {attack.toFixed(0)}</p>
        <p style={{ margin: 0, textAlign: 'left' }}><strong>Defense:</strong> {defense.toFixed(0)}</p>
        <p style={{ margin: 0, textAlign: 'left' }}><strong>Knowledge:</strong> {knowledge.toFixed(1)}</p>
        <p style={{ margin: 0, textAlign: 'left' }}><strong>Curiosity:</strong> {curiosity.toFixed(1)}</p>
        <p style={{ margin: 0, textAlign: 'left' }}><strong>Tenacity:</strong> {tenacity.toFixed(1)}</p>
        <p style={{ margin: 0, textAlign: 'left' }}><strong>Spirit Stones:</strong> {spiritStones}</p>
        <p style={{ margin: 0, textAlign: 'left' }}><strong>Lifespan:</strong> {lifespan.toFixed(0)} / {maxLifespan.toFixed(0)}</p>
      </div>
    </div>
  );
};