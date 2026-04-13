import React, { useState } from "react";
import type { Monster } from "../constants/gameData";

/** Props required to trigger a combat encounter. */
export const CombatControls: React.FC<{
  encounterMonster: () => { monster: Monster; success: boolean };
}> = ({ encounterMonster }) => {
  const [lastResult, setLastResult] = useState<string>("");

  const handleFight = () => {
    const { monster, success } = encounterMonster();
    const msg = success
      ? `Defeated ${monster.name}, gained ${monster.stoneReward} stones.`
      : `Failed to defeat ${monster.name}.`;
    setLastResult(msg);
  };

  return (
    <div className="combat-controls">
      <button onClick={handleFight}>Encounter Monster</button>
      {lastResult && <p>{lastResult}</p>}
    </div>
  );
};

