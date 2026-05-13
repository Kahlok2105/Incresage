import React from "react";

interface WelcomeModalProps {
    secondsAway: number;
    totalQiGained: number;
    statsGained: Record<string, number>;
    onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ secondsAway, totalQiGained, statsGained, onClose }) => {
  const hours = Math.floor(secondsAway / 3600);
  const minutes = Math.floor((secondsAway % 3600) / 60);

  // Filter out stats that have values and format them for display
  const gainedStats = Object.entries(statsGained)
    .filter(([_, value]) => value > 0)
    .map(([statName, value]) => {
      // Format stat names for display
      const displayName = statName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      return { name: displayName, value: Math.round(value) };
    });

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Welcome Back, Cultivator</h2>
        <p>You meditated for <strong>{hours}h {minutes}m</strong> while away.</p>

        <div className="gain-display">
          <span>Qi Gained:</span>
          <span className="accent-text">+{totalQiGained.toFixed(0)}</span>
        </div>

        {/* Display all other gained stats dynamically */}
        {gainedStats.length > 0 && (
          <div className="other-stats">
            {gainedStats
              .filter(stat => stat.name !== 'Qi') // Exclude Qi since it's already shown
              .map((stat, index) => (
                <div key={index} className="stat-gain">
                  <span>{stat.name}:</span>
                  <span className="accent-text">+{stat.value}</span>
                </div>
              ))}
          </div>
        )}

        <button onClick={onClose}>Continue Cultivation</button>
      </div>
    </div>
  );
};
