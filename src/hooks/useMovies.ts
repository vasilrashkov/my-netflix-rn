import { useDispatch } from 'react-redux';

import { invalidateMovies, moviesApi } from '@/services/moviesApi';
import type { AppDispatch } from '@/services/store';
import type { MoviePage, MovieSummary } from '@/types/movie';

const NO_MOVIES: MovieSummary[] = [];

export const selectMovies = ({ pages }: { pages: MoviePage[] }): MovieSummary[] => {
  const byId = new Map(pages.flatMap(({ movies }) => movies).map((movie) => [movie.id, movie]));
  return [...byId.values()];
};

export const useMovieSearch = (query: string) => {
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = moviesApi.useSearchMoviesInfiniteQuery(query);

  const movies = data ? selectMovies(data) : NO_MOVIES;

  // Called by lists as they near the end. After a failed page it does nothing: lists fire it again
  // when their footer changes size, which would otherwise retry in a loop and burn the daily quota.
  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) fetchNextPage();
  };

  /** For a Retry button after a failed page: the user asked, so fetch again. */
  const retryLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  return {
    movies,
    error,
    isLoading,
    isFetchingNextPage,
    isFetchNextPageError,
    loadMore,
    retryLoadMore,
    refetch,
  };
};

export const useMovie = (id: string) => {
  return moviesApi.useGetMovieQuery(id);
};

/** Refetches every movie query on screen, resolving once they have all settled. */
export const useRefreshMovies = () => {
  const dispatch = useDispatch<AppDispatch>();

  return async () => {
    dispatch(invalidateMovies());
    await Promise.all(dispatch(moviesApi.util.getRunningQueriesThunk()));
  };
};
