import React from "react";

/** Simple control to start/stop meditation. */
export const MeditationControls: React.FC<{ isMeditating: boolean; toggleMeditation: () => void }> = ({
  isMeditating,
  toggleMeditation,
}) => {
  return (
    <div className="meditation-controls">
      <button onClick={toggleMeditation}>
        {isMeditating ? "Stop Meditation" : "Start Meditation"}
      </button>
    </div>
  );
};

