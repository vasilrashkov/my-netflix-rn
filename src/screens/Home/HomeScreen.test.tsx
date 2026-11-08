import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { ApiError } from '@/services/ApiError';
import { omdbClient } from '@/services/omdb';
import { type AppStore, createStore, disposeStore } from '@/services/store';
import type { MovieDetails, MoviePage, MovieSummary } from '@/types/movie';

import { HomeScreen } from './HomeScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock('@/services/omdb', () => ({
  omdbClient: { getMovie: jest.fn(), searchMovies: jest.fn() },
}));

jest.mock('@reduxjs/toolkit/query/react', () => ({
  ...jest.requireActual('@reduxjs/toolkit/query/react'),
  retry: (baseQuery: unknown) => baseQuery,
}));

const getMovie = jest.mocked(omdbClient.getMovie);
const searchMovies = jest.mocked(omdbClient.searchMovies);

const FAILING_RAIL_QUERY = 'batman';

const pageOf = (movie: MovieSummary): MoviePage => ({
  movies: [movie],
  page: 1,
  totalResults: 1,
  hasMore: false,
});

const movieFor = (query: string): MovieSummary => ({
  id: `tt-${query}`,
  title: `Movie about ${query}`,
  year: '2000',
  posterUrl: null,
});

const featured: MovieDetails = {
  ...movieFor('featured'),
  plot: null,
  rated: null,
  runtime: null,
  released: null,
  genres: ['Drama'],
  director: null,
  writer: null,
  cast: [],
  language: null,
  awards: null,
  boxOffice: null,
  ratings: [],
};

let store: AppStore;

const renderScreen = async () => {
  store = createStore();

  await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    </SafeAreaProvider>,
  );
};

describe('HomeScreen', () => {
  afterEach(async () => {
    // Unmount first: resetting the store under a mounted screen makes it refetch.
    await cleanup();
    disposeStore(store);
  });

  beforeEach(() => {
    mockNavigate.mockReset();
    getMovie.mockReset().mockResolvedValue(featured);
    searchMovies.mockReset().mockImplementation(async (query) => pageOf(movieFor(query)));
  });

  it('opens a movie from a rail, passing what is already on screen', async () => {
    await renderScreen();

    await fireEvent.press(await screen.findByLabelText('Movie about batman, 2000'));

    expect(mockNavigate).toHaveBeenCalledWith('MovieDetails', {
      movieId: 'tt-batman',
      preview: movieFor('batman'),
    });
  });

  it('opens the featured movie from the hero', async () => {
    await renderScreen();

    await fireEvent.press(await screen.findByText('View details'));

    expect(mockNavigate).toHaveBeenCalledWith(
      'MovieDetails',
      expect.objectContaining({ movieId: featured.id }),
    );
  });

  it('opens a collection from "See all"', async () => {
    await renderScreen();

    await fireEvent.press(await screen.findByLabelText('See all Caped Crusaders'));

    expect(mockNavigate).toHaveBeenCalledWith('Collection', { collectionId: 'caped-crusaders' });
  });

  it('refetches what is on screen on pull to refresh', async () => {
    await renderScreen();
    await screen.findByLabelText('Movie about batman, 2000');
    const callsBefore = searchMovies.mock.calls.length;

    await act(() => screen.getByTestId('home-feed').props.refreshControl.props.onRefresh());

    expect(searchMovies.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('keeps the screen working when one rail fails, and retries only that rail', async () => {
    searchMovies.mockImplementation(async (query) => {
      if (query === FAILING_RAIL_QUERY) throw new ApiError('timeout', 'slow');
      return pageOf(movieFor(query));
    });

    await renderScreen();

    expect(await screen.findByText('View details')).toBeTruthy();
    const retry = await screen.findByText('Retry');

    searchMovies.mockImplementation(async (query) => pageOf(movieFor(query)));
    await fireEvent.press(retry);

    expect(await screen.findByLabelText('Movie about batman, 2000')).toBeTruthy();
    expect(screen.queryByText('Retry')).toBeNull();
  });
});
