---
paths:
  - 'src/**/*.test.ts'
  - 'src/**/*.test.tsx'
---

# Tests

- Screen tests render with a fresh `createStore()` from `@/services/store`, inside
  `SafeAreaProvider` with `initialMetrics` and a redux `Provider`. Copy the setup from an existing
  screen test.
- Teardown order matters: `await cleanup()` first, then `disposeStore(store)`. Resetting a store
  under a mounted screen makes it refetch and start skeleton animations that outlive the test.
- Mock the OMDb client (`jest.mock('@/services/omdb', ...)`), never the network.
- Mock RTK's `retry` to pass through, so failures don't wait for backoff:
  `retry: (baseQuery: unknown) => baseQuery` on top of `jest.requireActual('@reduxjs/toolkit/query/react')`.
- Find elements the way a user would: `findByText`, `findByLabelText`. Use `testID` only to reach
  list props such as `onEndReached` or `refreshControl`.
- A clean run has no "not wrapped in act", "torn down", "failed to exit" or "did not exit" lines.
  Treat any of them as a failure.
