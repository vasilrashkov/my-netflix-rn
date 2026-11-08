import { cleanup, render, screen, waitFor } from '@testing-library/react-native';
import type { ComponentProps } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { REHYDRATE } from 'redux-persist';

import { ApiError } from '@/services/ApiError';
import { CACHE_MAX_AGE_SECONDS, CACHE_STALE_SECONDS, moviesApi } from '@/services/moviesApi';
import { omdbClient } from '@/services/omdb';
import { type AppStore, createStore as createAppStore, disposeStore } from '@/services/store';
import type { MovieDetails, MovieSummary } from '@/types/movie';

import { MovieDetailsScreen } from './MovieDetailsScreen';

jest.mock('@/services/omdb', () => ({ omdbClient: { getMovie: jest.fn() } }));

jest.mock('@reduxjs/toolkit/query/react', () => ({
  ...jest.requireActual('@reduxjs/toolkit/query/react'),
  retry: (baseQuery: unknown) => baseQuery,
}));

const getMovie = jest.mocked(omdbClient.getMovie);

const preview: MovieSummary = {
  id: 'tt1',
  title: 'Heat',
  year: '1995',
  posterUrl: 'https://img/heat.jpg',
};
const details: MovieDetails = {
  ...preview,
  plot: 'A thief meets a detective.',
  rated: 'R',
  runtime: '170 min',
  released: null,
  genres: ['Crime'],
  director: 'Michael Mann',
  writer: null,
  cast: ['Al Pacino'],
  language: null,
  awards: null,
  boxOffice: null,
  ratings: [{ source: 'imdb', label: 'IMDb', value: '8.3/10' }],
};

const stores: AppStore[] = [];

const createStore = () => {
  const store = createAppStore();
  stores.push(store);
  return store;
};

const renderScreen = async (
  params: { movieId: string; preview?: MovieSummary },
  store: AppStore = createStore(),
) => {
  const props = { route: { params } } as ComponentProps<typeof MovieDetailsScreen>;

  await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <Provider store={store}>
        <MovieDetailsScreen {...props} />
      </Provider>
    </SafeAreaProvider>,
  );
};

describe('MovieDetailsScreen', () => {
  beforeEach(() => getMovie.mockReset());
  afterEach(async () => {
    // Unmount first: resetting the store under a mounted screen makes it refetch.
    await cleanup();
    stores.splice(0).forEach(disposeStore);
  });

  it('paints the preview immediately, then fills in the details', async () => {
    getMovie.mockResolvedValue(details);

    await renderScreen({ movieId: 'tt1', preview });

    expect(screen.getByText('Heat')).toBeTruthy();
    expect(await screen.findByText('A thief meets a detective.')).toBeTruthy();
    expect(screen.getByLabelText('IMDb: 8.3/10')).toBeTruthy();
    expect(screen.getByText('Michael Mann')).toBeTruthy();
  });

  it('loads a deep link that arrives without a preview', async () => {
    getMovie.mockResolvedValue(details);

    await renderScreen({ movieId: 'tt1' });

    expect(await screen.findByText('Heat')).toBeTruthy();
  });

  it('keeps the preview and offers a retry when details fail', async () => {
    getMovie.mockRejectedValue(new ApiError('timeout', 'slow'));

    await renderScreen({ movieId: 'tt1', preview });

    expect(await screen.findByText('Retry')).toBeTruthy();
    expect(screen.getByText('Heat')).toBeTruthy();
  });

  it('shows not found without a pointless retry', async () => {
    getMovie.mockRejectedValue(new ApiError('not-found', 'Incorrect IMDb ID.'));

    await renderScreen({ movieId: 'tt1', preview });

    expect(await screen.findByText('Not found')).toBeTruthy();
    expect(screen.queryByText('Retry')).toBeNull();
  });

  describe('with a saved cache', () => {
    // Reopens the app: a new store restores what the last session saved, aged by `ageSeconds`.
    const reopenApp = async (ageSeconds: number) => {
      const session = createStore();
      await session.dispatch(moviesApi.endpoints.getMovie.initiate('tt1', { subscribe: false }));
      getMovie.mockClear();

      const saved = session.getState()[moviesApi.reducerPath];
      const entries = Object.entries(saved.queries).map(([key, entry]) => [
        key,
        { ...(entry as object), fulfilledTimeStamp: Date.now() - ageSeconds * 1000 },
      ]);
      const reopened = createStore();
      reopened.dispatch({
        type: REHYDRATE,
        key: moviesApi.reducerPath,
        payload: { ...saved, queries: Object.fromEntries(entries) },
      });
      return reopened;
    };

    beforeEach(() => {
      getMovie.mockResolvedValue(details);
    });

    it('makes no API call when the data is under a day old', async () => {
      await renderScreen({ movieId: 'tt1' }, await reopenApp(CACHE_STALE_SECONDS - 60));

      expect(await screen.findByText('A thief meets a detective.')).toBeTruthy();
      expect(getMovie).not.toHaveBeenCalled();
    });

    it('shows older data immediately and refreshes it in the background', async () => {
      await renderScreen({ movieId: 'tt1' }, await reopenApp(CACHE_STALE_SECONDS + 60));

      expect(await screen.findByText('A thief meets a detective.')).toBeTruthy();
      await waitFor(() => expect(getMovie).toHaveBeenCalledTimes(1));
    });

    it('discards data past the maximum age', async () => {
      getMovie.mockRejectedValue(new ApiError('network', 'offline'));

      await renderScreen({ movieId: 'tt1' }, await reopenApp(CACHE_MAX_AGE_SECONDS + 60));

      expect(await screen.findByText("Can't connect")).toBeTruthy();
      expect(screen.queryByText('A thief meets a detective.')).toBeNull();
    });
  });
});
