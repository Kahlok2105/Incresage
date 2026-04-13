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
    addSpiritStones,
    tryBreakthrough,
    isMeditating,
    toggleMeditation,
    encounterMonster,
  } = useGameLoop();

  return (
    <div className="app">
      <h1>Cultivation Game</h1>
      <Status state={state} tryBreakthrough={tryBreakthrough} />
      <MeditationControls isMeditating={isMeditating} toggleMeditation={toggleMeditation} />
      <CombatControls encounterMonster={encounterMonster} />
    </div>
  );
}

