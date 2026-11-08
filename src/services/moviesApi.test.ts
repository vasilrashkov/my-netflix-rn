import { ApiError } from './ApiError';
import { moviesApi } from './moviesApi';
import { omdbClient } from './omdb';
import { type AppStore, createStore, disposeStore } from './store';

jest.mock('@/services/omdb', () => ({ omdbClient: { getMovie: jest.fn() } }));

const getMovie = jest.mocked(omdbClient.getMovie);

// Longer than RTK's randomised backoff can take across every retry.
const ALL_RETRIES_MS = 10_000;

describe('moviesApi retries', () => {
  let store: AppStore;

  const fetchMovie = () => store.dispatch(moviesApi.endpoints.getMovie.initiate('tt1'));

  beforeEach(() => {
    jest.useFakeTimers();
    getMovie.mockReset();
    store = createStore();
  });

  afterEach(() => {
    disposeStore(store);
    jest.useRealTimers();
  });

  it('retries a transient failure until it succeeds', async () => {
    getMovie
      .mockRejectedValueOnce(new ApiError('timeout', 'slow'))
      .mockResolvedValue({ id: 'tt1' } as never);

    const request = fetchMovie();
    await jest.advanceTimersByTimeAsync(ALL_RETRIES_MS);

    expect((await request).data).toEqual({ id: 'tt1' });
    expect(getMovie).toHaveBeenCalledTimes(2);
  });

  it('gives up after the retry limit', async () => {
    getMovie.mockRejectedValue(new ApiError('network', 'down'));

    const request = fetchMovie();
    await jest.advanceTimersByTimeAsync(ALL_RETRIES_MS);

    expect((await request).error).toEqual({ code: 'network', message: 'down' });
    expect(getMovie).toHaveBeenCalledTimes(3);
  });

  it('never retries a permanent failure', async () => {
    getMovie.mockRejectedValue(new ApiError('rate-limited', 'quota'));

    const request = fetchMovie();
    await jest.advanceTimersByTimeAsync(ALL_RETRIES_MS);

    expect((await request).error).toEqual({ code: 'rate-limited', message: 'quota' });
    expect(getMovie).toHaveBeenCalledTimes(1);
  });

  it('never retries an unexpected error from our own code', async () => {
    getMovie.mockRejectedValue(new TypeError('Cannot read properties of undefined'));

    const request = fetchMovie();
    await jest.advanceTimersByTimeAsync(ALL_RETRIES_MS);

    expect((await request).error).toEqual({ code: 'unknown', message: 'Unexpected error' });
    expect(getMovie).toHaveBeenCalledTimes(1);
  });

  it('stops retrying once the request is cancelled', async () => {
    getMovie.mockRejectedValue(new ApiError('timeout', 'slow'));

    const request = fetchMovie();
    await jest.advanceTimersByTimeAsync(0);
    request.abort();
    await jest.advanceTimersByTimeAsync(ALL_RETRIES_MS);

    expect(getMovie).toHaveBeenCalledTimes(1);
  });
});
