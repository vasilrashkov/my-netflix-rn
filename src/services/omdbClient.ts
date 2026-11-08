import type { z } from 'zod';

import type { MovieDetails, MoviePage } from '@/types/movie';

import { ApiError, type ApiErrorCode } from './ApiError';
import { omdbFailureSchema, omdbMovieSchema, omdbSearchSchema } from './omdbDto';
import { toMovieDetails, toMoviePage } from './omdbMappers';

const BASE_URL = 'https://www.omdbapi.com/';
const DEFAULT_TIMEOUT_MS = 10_000;

type FetchLike = (
  url: string,
  init: { signal: AbortSignal },
) => Promise<{ status: number; json(): Promise<unknown> }>;

export interface OmdbClientConfig {
  apiKey: string;
  fetchFn?: FetchLike;
  timeoutMs?: number;
}

export interface RequestOptions {
  signal?: AbortSignal;
}

export interface OmdbClient {
  searchMovies(query: string, page: number, options?: RequestOptions): Promise<MoviePage>;
  getMovie(id: string, options?: RequestOptions): Promise<MovieDetails>;
}

const buildUrl = (params: Record<string, string>): string => {
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${BASE_URL}?${query}`;
};

// OMDb reports most failures as HTTP 200 with a message, so the text is the only reliable signal.
const classifyFailure = (message: string, status: number): ApiErrorCode => {
  if (/not found|incorrect imdb id/i.test(message)) return 'not-found';
  if (/limit/i.test(message)) return 'rate-limited';
  if (/api key/i.test(message) || status === 401) return 'unauthorized';
  return 'invalid-request';
};

const parseBody = <T>(body: unknown, status: number, schema: z.ZodType<T>): T => {
  const failure = omdbFailureSchema.safeParse(body);
  if (failure.success) {
    const message = failure.data.Error ?? 'OMDb rejected the request';
    throw new ApiError(classifyFailure(message, status), message);
  }

  if (status === 401) throw new ApiError('unauthorized', 'OMDb rejected the API key');

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError('invalid-response', `Unexpected OMDb response (HTTP ${status})`);
  }
  return parsed.data;
};

export const createOmdbClient = ({
  apiKey,
  fetchFn = (url, init) => fetch(url, init),
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: OmdbClientConfig): OmdbClient => {
  const request = async <T>(
    schema: z.ZodType<T>,
    params: Record<string, string>,
    callerSignal?: AbortSignal,
  ): Promise<T> => {
    if (!apiKey) {
      throw new ApiError('configuration', 'EXPO_PUBLIC_OMDB_API_KEY is not set');
    }

    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const signal = callerSignal ? AbortSignal.any([callerSignal, timeoutSignal]) : timeoutSignal;

    try {
      const response = await fetchFn(buildUrl({ ...params, apikey: apiKey }), { signal });
      const body = await response.json().catch(() => null);

      return parseBody(body, response.status, schema);
    } catch (error) {
      if (error instanceof ApiError || callerSignal?.aborted) throw error;
      if (timeoutSignal.aborted) throw new ApiError('timeout', 'OMDb took too long to respond');
      throw new ApiError('network', 'Could not reach OMDb');
    }
  };

  return {
    searchMovies: async (query, page, { signal } = {}) => {
      try {
        const params = { s: query, type: 'movie', page: String(page) };
        return toMoviePage(await request(omdbSearchSchema, params, signal), page);
      } catch (error) {
        if (error instanceof ApiError && error.code === 'not-found') {
          return { movies: [], page, totalResults: 0, hasMore: false };
        }
        throw error;
      }
    },

    getMovie: async (id, { signal } = {}) => {
      return toMovieDetails(await request(omdbMovieSchema, { i: id, plot: 'full' }, signal));
    },
  };
};
