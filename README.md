# My Netflix

A streaming-style movie home screen built with React Native, Expo and TypeScript, using live data
from the [OMDb API](https://www.omdbapi.com/).

- **Home:** a featured hero, horizontal rails, and a vertical "Worth Discovering" list with infinite
  scroll, all in one virtualized feed
- **Movie details:** opens instantly from the data already on screen, then fills in ratings, plot
  and credits
- **See all:** a paginated grid for any collection, added as a third screen to prove out the
  structure
- **Offline launches:** the RTK Query cache is persisted, so previously loaded content still appears
- **Deep links:** `mynetflix://movie/tt0468569` and `mynetflix://collection/star-wars`

## Getting started

Requires Node 22 and, for the iOS Simulator, Xcode. Expo Go on a phone also works.

```bash
npm install
cp .env.example .env.local   # then add your free OMDb key
npx expo start --ios         # runs in Expo Go on the iOS Simulator
```

Every native module the app uses is included in Expo Go, so no native build is needed. For a
standalone development build, use `npx expo run:ios`, which needs a current CocoaPods.

| Command             | Purpose           |
| ------------------- | ----------------- |
| `npm test`          | Unit and UI tests |
| `npm run typecheck` | TypeScript        |
| `npm run lint`      | ESLint            |
| `npm run format`    | Prettier          |

## Architecture

```
src/
├── components/         UI shared between screens, plus the app shell and navigator
├── screens/
│   ├── Home/           One folder per screen
│   │   ├── HomeScreen.tsx
│   │   ├── components/ Used only by this screen
│   │   └── hooks/      Used only by this screen
│   ├── MovieDetails/
│   └── Collection/
├── services/           API calls: OMDb client, errors, RTK Query API and store
├── utils/              Helper functions
├── hooks/              Hooks shared between screens
├── theme/              Design tokens and the navigation theme
├── types/              Domain models and navigation types
└── config/             Environment values and the curated home collections
```

Tests sit next to the file they cover. A component or hook lives with its screen until a second
screen needs it, then moves to `components/` or `hooks/`. Only the `omdb*` files in `services/` know
what an OMDb response looks like. The rest of the app uses the models in `types/movie.ts`, so
replacing OMDb with an in-house API means rewriting those files, and nothing in the screens.

**Adding a screen:** create a folder for it in `screens/`, add its params to
`types/navigation.ts`, and register it in `components/RootNavigator.tsx`. A home rail is one
line in `config/collections.ts`.

## Key decisions

**Expo.** The app needs nothing unusual on the native side, and it's the recommended path, with
faster setup and upgrades. Custom native code stays possible through development builds. `ios/` and
`android/` are generated, not committed.

**React Navigation over Expo Router.** It uses native stack navigation, and keeps the cost of ever
leaving Expo low, because routes aren't tied to the file system.

**Redux Toolkit Query for server state.** Caching, deduplication and loading state are solved
problems, and Redux gives client state an obvious home as the app grows. RTK Query doesn't persist
to disk by itself, so `redux-persist` saves the cache, `PersistGate` stops screens fetching before
it has loaded, and `restoreCache` drops failed or expired entries. Retries use RTK Query's `retry`,
with a condition that only repeats transient failures.

**React Compiler instead of manual memoization.** It memoizes at build time, so the code has no
`useMemo`, `useCallback` or `memo`. It only covers this app's code, not `node_modules`.

**One flat FlashList for the home feed.** Hero, rails and list rows are a single list of typed
items, built by the `useHomeFeed` hook. Nesting vertical lists in a `ScrollView` would
disable virtualization and fetch every rail on mount.

**Each rail has its own recycling type.** Otherwise a recycled cell would hand one rail's horizontal
scroll position to another rail.

**API responses are validated with Zod.** TypeScript can't see across the network, so an unexpected
response becomes a typed, retryable error at the boundary rather than a crash inside a component.

**Rails fetch their own data.** An off-screen rail spends no quota, and one failed rail shows an
inline retry while the rest of the screen keeps working.

**A rail and its "See all" screen share one query.** Opening a collection reuses pages already
loaded instead of requesting them again.

## Working within OMDb

| Constraint                                  | Response                                                                                      |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| No genres, trending or popularity endpoints | Rails are curated title searches, named for what they contain; the hero is a curated rotation |
| Search returns only title, year and poster  | Lists never need per-card detail requests; details load on demand                             |
| 1,000 requests a day                        | Cache refreshed after 24 hours, kept for 7 days, no per-card lookups                          |
| Missing values are the string `"N/A"`       | Normalised to `null` in the mappers; missing posters get a designed fallback                  |
| Failures arrive as HTTP 200 with a message  | Classified into typed `ApiError` codes, and only transient ones are retried                   |
| "No results" is reported as an error        | Mapped to an empty page, so the UI shows an empty state rather than a failure                 |
| Posters are capped at 380px                 | The CDN URL is rewritten for hero images, with the small poster as the placeholder            |

## API key security

`EXPO_PUBLIC_*` values are inlined into the JavaScript bundle, so **the key can be extracted from a
shipped app**. Keeping it in `.env.local` only keeps it out of git. That's acceptable for a free,
read-only key in a demo. A production app should call a backend proxy that holds the key, adds
caching and enforces rate limits. `omdbClient` would then point at that proxy with no changes to the
features.

## Testing

Tests target the logic most likely to break quietly: response mapping, error classification,
timeouts and cancellation, response validation, pagination de-duplication and feed construction.
Screen-level tests run against a mocked client. They cover the details screen's loading, deep link,
error and not-found states, and on the home screen, opening movies, opening a collection and a
failed rail recovering on its own.

Verified in Expo Go on the iOS Simulator. Android has not been run.

## Next steps

- Backend proxy for the API key
- Search screen, which `useMovieSearch` already supports
- List and scroll-performance monitoring, with Reassure or Flashlight
- NetInfo wired into RTK Query's `setupListeners`, to pause requests while offline
- End-to-end tests with Maestro
- CI running lint, typecheck and tests
