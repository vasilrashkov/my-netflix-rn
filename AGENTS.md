This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- This project uses **React Navigation** (native stack), not Expo Router, so it stays portable if Expo is ever removed. Don't create a `src/app/` directory: Expo CLI treats it as an Expo Router root.
- Screens are registered in `src/components/RootNavigator.tsx`, params are typed in `src/types/navigation.ts`, and deep links live in `src/utils/linking.ts`.
- Docs: https://reactnavigation.org/docs/getting-started

## Code style

- `src/` has eight folders: `components/`, `screens/`, `services/`, `utils/`, `hooks/`, `theme/`, `types/` and `config/`. All are flat except `screens/`. Tests sit next to the file they cover.
- Each screen has its own folder, `screens/<Name>/<Name>Screen.tsx`. A component or hook used by one screen goes in that screen's `components/` or `hooks/` folder, created only when it has something in it. A component used by two or more screens goes in `src/components/` and is exported from its barrel; a shared hook goes in `src/hooks/`. `src/components/` also holds the app shell (`AppProviders`, `RootNavigator`), which isn't exported from the barrel.
- Write every function as an arrow function: `const name = () => {}`. ESLint bans function declarations and non-arrow callbacks, but doesn't catch `const name = function () {}`, so don't write that either.
- React Compiler is on (`experiments.reactCompiler` in `app.json`), so don't write `useMemo`, `useCallback` or `memo`.
- Validate external data at the boundary with the Zod schemas in `src/services/omdbDto.ts`, and don't cast it with `as`. The one exception is the saved cache read back from disk (`restoreCache(...) as never` in `src/services/moviesApi.ts`, commented there); its shape is protected by `CACHE_VERSION` in `src/services/persistedStore.ts`.
- Repeated visual values come from `src/theme/theme.ts`; one-off values get a named constant.
- Arrow functions aren't hoisted, so module-level code must not call one before its definition.

## Building

EAS isn't set up (there's no `eas.json`); the app runs in Expo Go. If builds are added later, use EAS and run its CLI as `npx eas-cli@latest <command>`. Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
