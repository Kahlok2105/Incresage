import React from "react";

interface WelcomeModalProps {
    amount: number;
    seconds: number;
    onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ amount, seconds, onClose }) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Welcome Back, Cultivator</h2>
        <p>You meditated for **{hours}h {minutes}m** while away.</p>
        <div className="gain-display">
          <span>Qi Gained:</span>
          <span className="accent-text">+{amount.toFixed(0)}</span>
        </div>
        <button onClick={onClose}>Continue Cultivation</button>
      </div>
    </div>
  );
};