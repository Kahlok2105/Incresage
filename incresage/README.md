# Incresage – A Simple Cultivation Idle Game

This project started from the official **React + TypeScript + Vite** starter template and has been extended into a minimal idle‑cultivation game.

## Game Overview

* **Cultivation realms** – Players progress through a series of realms, each requiring a specific amount of Qi and Spirit Stones.
* **Meditation** – Toggling meditation doubles the passive Qi gain per tick.
* **Combat** – Players can encounter random monsters; successful fights award Spirit Stones.
* **Breakthrough** – When the required resources are met, players can advance to the next realm, consuming the resources.
* **Persistence** – Game state is saved to `localStorage` so progress survives page reloads.
* **New Features** – After the first breakthrough the **monster** UI unlocks, allowing combat encounters via the `MonsterEncounter` panel. After the second breakthrough the **alchemy** UI unlocks, showing the `AlchemyPanel`. Feature unlocks are announced with a brief toast notification.

The core game loop lives in `src/hooks/useGameLoop.ts`, UI components are in `src/components/`, and the entry point is `src/App.tsx`.

---

## Original Vite + React Setup

The repository still includes the original Vite + React configuration, ESLint setup, and React Compiler support.

### React Compiler

The React Compiler is enabled on this template. See the [React Compiler documentation](https://react.dev/learn/react-compiler) for more information. Note: this impacts Vite dev & build performance.

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type‑aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Replace the default with type‑checked configs
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
```

You can also install `eslint-plugin-react-x` and `eslint-plugin-react-dom` for React‑specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [reactX.configs['recommended-typescript'], reactDom.configs.recommended],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
```

