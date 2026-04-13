# Copilot instructions for Incresage

- Workspace root contains a nested app folder: `incresage/`. All package scripts and source code live under that directory.
- Use `cd incresage` before running commands.

## Build / run
- `npm install`
- `npm run dev` starts the Vite development server.
- `npm run build` runs `tsc -b` and then `vite build`.
- `npm run lint` runs ESLint across the repository.
- `npm run preview` serves the production build locally.

## Architecture overview
- `src/App.tsx` is the root component and wires together the game hook and UI components.
- `src/hooks/useGameLoop.ts` is the core state engine: passive tick updates, localStorage persistence, meditation toggle, combat encounter, and breakthrough logic.
- `src/constants/gameData.ts` defines the progression model:
  - `REALMS` array order defines progression and is indexed by `PlayerState.currentRealmIndex`
  - `MONSTERS` is the combat encounter pool
- `src/types/game.ts` contains shared domain typings like `PlayerState` and `Realm`.
- UI components are presentational and receive state/callbacks from `App`:
  - `src/components/Status.tsx`
  - `src/components/MeditationControls.tsx`
  - `src/components/CombatControls.tsx`

## Important patterns
- State is centralized in `useGameLoop` and passed down as props.
- `useGameLoop` persists state to browser `localStorage` on every state change. Keep the shape of `PlayerState` consistent when changing persistence.
- Realm progression is governed by `REALMS` ordering. A breakthrough checks the next realm's `qiRequired` and `stonesRequired` and consumes those resources.
- Combat is randomized in `useGameLoop.encounterMonster()` and returns a result object; the component handles only display text and does not store combat state globally.
- The app uses the React Compiler via `vite.config.ts` with `@vitejs/plugin-react` and `@rolldown/plugin-babel`.

## Agent guidance
- Prefer editing `src/hooks/useGameLoop.ts` for game logic changes and `src/constants/gameData.ts` for balance/progression data.
- Keep presentation logic inside `src/components/` small and callback-driven.
- Do not assume a separate test suite exists; no test scripts are defined in `incresage/package.json`.
- If you update build or lint settings, modify `incresage/vite.config.ts`, `incresage/eslint.config.js`, or `incresage/tsconfig.*`.

## Notes
- The project is a minimal React + TypeScript + Vite app.
- The game is browser-only, but `useGameLoop` checks `typeof localStorage !== 'undefined'` for safe environment detection.
