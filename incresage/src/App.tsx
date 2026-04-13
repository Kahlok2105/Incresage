import React from "react";
import "./App.css";
import { useGameLoop } from "./hooks/useGameLoop";
import { Status } from "./components/Status";
import { MeditationControls } from "./components/MeditationControls";
import { CombatControls } from "./components/CombatControls";

/** Root component that wires the game loop and UI controls together. */
export default function App() {
  const {
    state,
    tryBreakthrough,
    isMeditating,
    toggleMeditation,
    encounterMonster,
    qiPerSecond,
    usableQi,
    totalQi,
  } = useGameLoop();

  return (
    <div className="app">
        <header className="status-panel">
            <Status state={state} tryBreakthrough={tryBreakthrough} qiPerSecond={qiPerSecond} usableQi={usableQi} totalQi={totalQi} />
        </header>
        <main className="game-panel">
            <MeditationControls isMeditating={isMeditating} toggleMeditation={toggleMeditation} />
      <CombatControls encounterMonster={encounterMonster} />
        </main>  
    </div>
  );
}

