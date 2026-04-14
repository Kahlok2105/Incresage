import React from "react";
/**
 * Simple UI displayed when the "monster" feature is unlocked.
 * It provides a button that triggers a combat encounter via the
 * `encounterMonster` callback supplied by the game loop.
 */
export const MonsterEncounter: React.FC<{ encounterMonster: () => void }> = ({ encounterMonster }) => {
  return (
    <section className="monster-encounter">
      <h2>🗡️ Monster Encounter</h2>
      <p>You have unlocked the ability to face hostile spirits.</p>
      <button onClick={encounterMonster}>Challenge a monster</button>
    </section>
  );
};

