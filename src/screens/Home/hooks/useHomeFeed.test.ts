import { renderHook } from '@testing-library/react-native';

import { HOME_COLLECTIONS } from '@/config/collections';
import { useAppWideErrorCode } from '@/hooks/useAppWideErrorCode';
import { useMovieSearch } from '@/hooks/useMovies';
import type { MovieSummary } from '@/types/movie';

import { getHomeFeedItemType, useHomeFeed } from './useHomeFeed';

jest.mock('@/hooks/useMovies', () => ({ useMovieSearch: jest.fn() }));
jest.mock('@/hooks/useAppWideErrorCode', () => ({ useAppWideErrorCode: jest.fn(() => null) }));

const searchResult = jest.mocked(useMovieSearch);

const movie: MovieSummary = { id: 'tt1', title: 'Heat', year: '1995', posterUrl: null };

const renderFeed = async (movies: MovieSummary[]) => {
  searchResult.mockReturnValue({ movies } as unknown as ReturnType<typeof useMovieSearch>);
  const { result } = await renderHook(() => useHomeFeed());
  return result.current.feed;
};

describe('useHomeFeed', () => {
  it('orders hero, rails, then the vertical list', async () => {
    const feed = await renderFeed([movie]);

    expect(feed.map(({ type }) => type)).toEqual([
      'hero',
      ...HOME_COLLECTIONS.map(() => 'rail'),
      'section-header',
      'movie',
    ]);
  });

  it('holds a status row until the vertical list has movies', async () => {
    const feed = await renderFeed([]);

    expect(feed.at(-1)?.type).toBe('discover-status');
  });

  it('produces unique keys', async () => {
    const keys = (await renderFeed([movie])).map(({ key }) => key);

    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('useHomeFeed with an app-wide error', () => {
  it('leaves out the empty vertical list, but keeps movies already loaded', async () => {
    jest.mocked(useAppWideErrorCode).mockReturnValueOnce('rate-limited');
    expect((await renderFeed([])).map(({ type }) => type)).not.toContain('section-header');

    jest.mocked(useAppWideErrorCode).mockReturnValueOnce('rate-limited');
    expect((await renderFeed([movie])).map(({ type }) => type)).toContain('movie');
  });
});

describe('getHomeFeedItemType', () => {
  it('never shares a recycling pool between rails', async () => {
    const [, first, second] = await renderFeed([]);

    expect(getHomeFeedItemType(first!)).not.toBe(getHomeFeedItemType(second!));
  });
});
