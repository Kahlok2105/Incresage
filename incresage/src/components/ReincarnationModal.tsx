import React from "react";
import type { ReincarnationSummary } from "../types/game";

interface ReincarnationModalProps {
  summary: ReincarnationSummary;
  onClose: () => void;
}

export const ReincarnationModal: React.FC<ReincarnationModalProps> = ({ summary, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content reincarnation-modal">
        <h2>🌀 Reincarnation</h2>
        <p className="reincarnation-subtitle">
          Life #{summary.lifeNumber} has come to an end...
        </p>

        <div className="reincarnation-summary">
          <div className="summary-section">
            <h3>📖 Life Summary</h3>
            <div className="summary-row">
              <span>Lifespan Lived:</span>
              <span>{summary.lifespanLived.toFixed(1)} years</span>
            </div>
            <div className="summary-row">
              <span>Highest Qi Realm:</span>
              <span>Stage {summary.highestQiRealm}</span>
            </div>
            <div className="summary-row">
              <span>Highest Body Realm:</span>
              <span>Stage {summary.highestBodyRealm}</span>
            </div>
            <div className="summary-row">
              <span>Monsters Defeated:</span>
              <span>{summary.totalMonstersDefeated}</span>
            </div>
            <div className="summary-row">
              <span>Qi Breakthroughs:</span>
              <span>{summary.totalQiBreakthroughs}</span>
            </div>
            <div className="summary-row">
              <span>Body Breakthroughs:</span>
              <span>{summary.totalBodyBreakthroughs}</span>
            </div>
          </div>

          <div className="summary-section rewards-section">
            <h3>🎁 Rewards Gained</h3>
            <div className="summary-row karma-row righteous">
              <span>☀️ Righteous Karma:</span>
              <span className="accent-text">+{summary.righteousKarmaGained}</span>
            </div>
            <div className="summary-row karma-row demonic">
              <span>🌑 Demonic Karma:</span>
              <span className="accent-text">+{summary.demonicKarmaGained}</span>
            </div>
            <div className="summary-row">
              <span>💭 Memories:</span>
              <span className="accent-text">+{summary.memoriesGained}</span>
            </div>
          </div>
        </div>

        <p className="reincarnation-footer-text">
          Your meditation techniques have been preserved across lifetimes.
          <br />
          All other cultivation has returned to the mortal path.
        </p>

        <button onClick={onClose} className="reincarnation-btn">
          🌱 Begin Next Life
        </button>
      </div>
    </div>
  );
};