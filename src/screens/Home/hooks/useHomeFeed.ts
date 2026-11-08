import { DISCOVER_COLLECTION, HOME_COLLECTIONS } from '@/config/collections';
import { useAppWideErrorCode } from '@/hooks/useAppWideErrorCode';
import { useMovieSearch } from '@/hooks/useMovies';
import type { Collection } from '@/types/collection';
import type { MovieSummary } from '@/types/movie';

export type HomeFeedItem =
  | { type: 'hero'; key: string }
  | { type: 'rail'; key: string; collection: Collection }
  | { type: 'section-header'; key: string; collection: Collection }
  | { type: 'discover-status'; key: string }
  | { type: 'movie'; key: string; movie: MovieSummary };

// This could easily become an API call from a wrapper around the omdb API, but for now it's just a static feed.
export const useHomeFeed = () => {
  const { movies, error, isFetchingNextPage, isFetchNextPageError, loadMore, retryLoadMore } =
    useMovieSearch(DISCOVER_COLLECTION.query);
  const appWideErrorCode = useAppWideErrorCode();
  const showDiscover = movies.length > 0 || !appWideErrorCode;

  const feed: HomeFeedItem[] = [
    { type: 'hero', key: 'hero' },
    ...HOME_COLLECTIONS.map((collection) => ({
      type: 'rail' as const,
      key: `rail:${collection.id}`,
      collection,
    })),
    ...(showDiscover
      ? [
          {
            type: 'section-header' as const,
            key: 'discover-header',
            collection: DISCOVER_COLLECTION,
          },
        ]
      : []),
    ...(movies.length > 0
      ? movies.map((movie) => ({
          type: 'movie' as const,
          key: `movie:${movie.id}`,
          movie,
        }))
      : showDiscover
        ? [{ type: 'discover-status' as const, key: 'discover-status' }]
        : []),
  ];

  return { feed, error, isFetchingNextPage, isFetchNextPageError, loadMore, retryLoadMore };
};

export const getHomeFeedItemType = (item: HomeFeedItem): string => {
  return item.type === 'rail' ? item.key : item.type;
};
