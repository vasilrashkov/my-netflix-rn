import { type Action } from '@reduxjs/toolkit';
import { type BaseQueryFn, createApi, retry } from '@reduxjs/toolkit/query/react';
import { REHYDRATE } from 'redux-persist';

import type { MovieDetails, MoviePage } from '@/types/movie';

import {
  getApiErrorCode,
  isRetryableCode,
  type SerializedApiError,
  toSerializedError,
} from './ApiError';
import { omdbClient } from './omdb';

const HOUR_SECONDS = 60 * 60;

export const CACHE_STALE_SECONDS = 24 * HOUR_SECONDS;
export const CACHE_MAX_AGE_SECONDS = 7 * 24 * HOUR_SECONDS;

const MOVIES_TAG = 'Movies';
const MAX_RETRIES = 2;

interface CacheEntry {
  status?: string;
  fulfilledTimeStamp?: number;
}

interface RehydrateAction extends Action<typeof REHYDRATE> {
  key: string;
  payload?: { queries: Record<string, CacheEntry | undefined> };
}

const isRehydrateAction = (action: Action): action is RehydrateAction => {
  return action.type === REHYDRATE;
};

export const restoreCache = <T extends { queries: Record<string, CacheEntry | undefined> }>(
  cache: T,
  now = Date.now(),
): T & { mutations: Record<string, never> } => {
  const oldestAllowed = now - CACHE_MAX_AGE_SECONDS * 1000;
  const queries = Object.fromEntries(
    Object.entries(cache.queries).filter(
      ([, entry]) =>
        entry?.status === 'fulfilled' && (entry.fulfilledTimeStamp ?? 0) >= oldestAllowed,
    ),
  );

  return { ...cache, queries, mutations: {} };
};

type OmdbRequest = (signal: AbortSignal) => Promise<unknown>;

const omdbBaseQuery: BaseQueryFn<OmdbRequest, unknown, SerializedApiError> = async (
  request,
  { signal },
) => {
  try {
    return { data: await request(signal) };
  } catch (error) {
    return { error: toSerializedError(error) };
  }
};

const shouldRetry = (error: unknown, _args: unknown, { attempt }: { attempt: number }) => {
  const code = getApiErrorCode(error);
  return code !== null && isRetryableCode(code) && attempt <= MAX_RETRIES;
};

export const moviesApi = createApi({
  reducerPath: 'moviesApi',
  baseQuery: retry(omdbBaseQuery, { retryCondition: shouldRetry }),
  tagTypes: [MOVIES_TAG],
  keepUnusedDataFor: CACHE_MAX_AGE_SECONDS,
  refetchOnMountOrArgChange: CACHE_STALE_SECONDS,
  extractRehydrationInfo: (action, { reducerPath }): never | undefined => {
    if (!isRehydrateAction(action) || action.key !== reducerPath || !action.payload) {
      return undefined;
    }

    return restoreCache(action.payload) as never;
  },
  endpoints: (build) => ({
    searchMovies: build.infiniteQuery<MoviePage, string, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
      },
      query: ({ queryArg, pageParam }) => {
        return (signal: AbortSignal) => omdbClient.searchMovies(queryArg, pageParam, { signal });
      },
      providesTags: [MOVIES_TAG],
    }),
    getMovie: build.query<MovieDetails, string>({
      query: (id) => (signal: AbortSignal) => omdbClient.getMovie(id, { signal }),
      providesTags: [MOVIES_TAG],
    }),
  }),
});

export const invalidateMovies = () => moviesApi.util.invalidateTags([MOVIES_TAG]);
