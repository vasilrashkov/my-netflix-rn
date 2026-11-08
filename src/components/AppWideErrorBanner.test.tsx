import { cleanup, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { ApiError } from '@/services/ApiError';
import { moviesApi } from '@/services/moviesApi';
import { omdbClient } from '@/services/omdb';
import { type AppStore, createStore, disposeStore } from '@/services/store';

import { AppWideErrorBanner } from './AppWideErrorBanner';

jest.mock('@/services/omdb', () => ({ omdbClient: { getMovie: jest.fn() } }));
jest.mock('@reduxjs/toolkit/query/react', () => ({
  ...jest.requireActual('@reduxjs/toolkit/query/react'),
  retry: (baseQuery: unknown) => baseQuery,
}));

const getMovie = jest.mocked(omdbClient.getMovie);

let store: AppStore;

const renderBanner = async () => {
  await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <Provider store={store}>
        <AppWideErrorBanner />
      </Provider>
    </SafeAreaProvider>,
  );
};

const failRequests = async (error: ApiError, ids: string[]) => {
  getMovie.mockRejectedValue(error);
  for (const id of ids) {
    await store.dispatch(moviesApi.endpoints.getMovie.initiate(id, { subscribe: false }));
  }
};

describe('AppWideErrorBanner', () => {
  beforeEach(() => {
    getMovie.mockReset();
    store = createStore();
  });
  afterEach(async () => {
    await cleanup();
    disposeStore(store);
  });

  it('explains an app-wide error once, however many requests failed', async () => {
    await failRequests(new ApiError('rate-limited', 'quota'), ['tt1', 'tt2', 'tt3']);

    await renderBanner();

    expect(screen.getAllByText('Daily limit reached')).toHaveLength(1);
  });

  it('stays hidden for errors that only affect one request', async () => {
    await failRequests(new ApiError('network', 'offline'), ['tt1']);

    await renderBanner();

    expect(screen.queryByText(/./)).toBeNull();
  });
});
