import React from "react";
/**
 * Placeholder UI for the alchemy feature. In a full implementation this would
 * provide controls for transmuting spirit stones into Qi or other resources.
 * For now it simply informs the player that the feature is unlocked.
 */
export const AlchemyPanel: React.FC = () => {
  return (
    <section className="alchemy-panel">
      <h2>⚗️ Alchemy</h2>
      <p>Alchemy unlocked! Combine spirit stones to boost your cultivation.</p>
      {/* Future controls go here */}
    </section>
  );
};

