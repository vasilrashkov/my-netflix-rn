import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import type { ComponentProps } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { ApiError } from '@/services/ApiError';
import { omdbClient } from '@/services/omdb';
import { type AppStore, createStore, disposeStore } from '@/services/store';
import type { MoviePage, MovieSummary } from '@/types/movie';

import { CollectionScreen, getColumnCount } from './CollectionScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('@/services/omdb', () => ({ omdbClient: { searchMovies: jest.fn() } }));
jest.mock('@reduxjs/toolkit/query/react', () => ({
  ...jest.requireActual('@reduxjs/toolkit/query/react'),
  retry: (baseQuery: unknown) => baseQuery,
}));

const searchMovies = jest.mocked(omdbClient.searchMovies);

const movie = (id: string): MovieSummary => ({
  id,
  title: `Movie ${id}`,
  year: '2000',
  posterUrl: null,
});

const page = (ids: string[], pageNumber: number, hasMore: boolean): MoviePage => ({
  movies: ids.map(movie),
  page: pageNumber,
  totalResults: 20,
  hasMore,
});

let store: AppStore;

const renderScreen = async (collectionId = 'star-wars') => {
  store = createStore();
  const props = { route: { params: { collectionId } } } as ComponentProps<typeof CollectionScreen>;

  await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <Provider store={store}>
        <CollectionScreen {...props} />
      </Provider>
    </SafeAreaProvider>,
  );
};

describe('CollectionScreen', () => {
  beforeEach(() => searchMovies.mockReset());
  afterEach(async () => {
    // Unmount first: resetting the store under a mounted screen makes it refetch.
    await cleanup();
    disposeStore(store);
  });

  it('shows not found for an unknown collection, without fetching', async () => {
    await renderScreen('nope');

    expect(screen.getByText('Collection not found')).toBeTruthy();
    expect(searchMovies).not.toHaveBeenCalled();
  });

  it('shows an empty state when the search has no results', async () => {
    searchMovies.mockResolvedValue(page([], 1, false));

    await renderScreen();

    expect(await screen.findByText('Nothing here yet')).toBeTruthy();
  });

  it('offers a retry when the first page fails', async () => {
    searchMovies.mockRejectedValue(new ApiError('network', 'offline'));

    await renderScreen();

    expect(await screen.findByText("Can't connect")).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it('keeps loaded movies and offers a retry when the next page fails', async () => {
    let nextPageFails = true;
    searchMovies.mockImplementation(async (_query, pageNumber) => {
      if (pageNumber === 1) return page(['a', 'b'], 1, true);
      if (nextPageFails) throw new ApiError('timeout', 'slow');
      return page(['c'], 2, false);
    });

    await renderScreen();
    await screen.findByLabelText('Movie a, 2000');

    await act(() => screen.getByTestId('collection-grid').props.onEndReached());

    expect(await screen.findByText('Retry')).toBeTruthy();
    expect(screen.getByLabelText('Movie a, 2000')).toBeTruthy();

    nextPageFails = false;
    await fireEvent.press(screen.getByText('Retry'));

    expect(await screen.findByLabelText('Movie c, 2000')).toBeTruthy();
    expect(screen.queryByText('Retry')).toBeNull();
  });
});

describe('getColumnCount', () => {
  it('fits as many columns as the width allows, never fewer than two', () => {
    expect(getColumnCount(390)).toBe(3);
    expect(getColumnCount(1024)).toBe(9);
    expect(getColumnCount(200)).toBe(2);
  });
});
