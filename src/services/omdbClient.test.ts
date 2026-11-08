import { ApiError, isRetryableCode } from './ApiError';
import { createOmdbClient } from './omdbClient';

const respondWith = (body: unknown, status = 200) => {
  return jest.fn().mockResolvedValue({
    status,
    json: () => Promise.resolve(body),
  });
};

const movieDto = { Response: 'True', imdbID: 'tt1', Title: 'Heat', Year: '1995' };

const failure = async (promise: Promise<unknown>): Promise<ApiError> => {
  const error = await promise.then(
    () => {
      throw new Error('Expected the request to fail');
    },
    (reason: unknown) => reason,
  );
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
};

describe('createOmdbClient', () => {
  it('encodes query parameters and sends the key', async () => {
    const fetchFn = respondWith({ Response: 'True', Search: [], totalResults: '0' });
    const client = createOmdbClient({ apiKey: 'key', fetchFn });

    await client.searchMovies('fast & furious', 2);

    const [url] = fetchFn.mock.calls[0];
    expect(url).toContain('s=fast%20%26%20furious');
    expect(url).toContain('page=2');
    expect(url).toContain('apikey=key');
  });

  it('turns "Movie not found!" into an empty search page', async () => {
    const fetchFn = respondWith({ Response: 'False', Error: 'Movie not found!' });
    const client = createOmdbClient({ apiKey: 'key', fetchFn });

    await expect(client.searchMovies('nothing', 1)).resolves.toEqual({
      movies: [],
      page: 1,
      totalResults: 0,
      hasMore: false,
    });
  });

  it.each([
    ['Incorrect IMDb ID.', 200, 'not-found', false],
    ['Invalid API key!', 401, 'unauthorized', false],
    ['Request limit reached!', 401, 'rate-limited', false],
    ['Too many results.', 200, 'invalid-request', false],
  ])('classifies "%s"', async (message, status, code, isRetryable) => {
    const fetchFn = respondWith({ Response: 'False', Error: message }, status);
    const client = createOmdbClient({ apiKey: 'key', fetchFn });

    const error = await failure(client.getMovie('tt1'));

    expect(error.code).toBe(code);
    expect(isRetryableCode(error.code)).toBe(isRetryable);
  });

  it('flags a non-JSON server error as a retryable bad response', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      status: 503,
      json: () => Promise.reject(new SyntaxError('Unexpected token <')),
    });
    const client = createOmdbClient({ apiKey: 'key', fetchFn });

    const error = await failure(client.getMovie('tt1'));

    expect(error.code).toBe('invalid-response');
    expect(isRetryableCode(error.code)).toBe(true);
  });

  it.each([
    ['a missing field', { Response: 'True', Title: 'No id', Year: '1995' }],
    ['a field of the wrong type', { Response: 'True', imdbID: 1, Title: 'Heat', Year: '1995' }],
  ])('rejects a successful response with %s', async (_case, body) => {
    const client = createOmdbClient({ apiKey: 'key', fetchFn: respondWith(body) });

    const error = await failure(client.getMovie('tt1'));

    expect(error.code).toBe('invalid-response');
  });

  it('wraps transport failures without leaking the URL or key', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new TypeError('Failed for ...apikey=secret'));
    const client = createOmdbClient({ apiKey: 'secret', fetchFn });

    const error = await failure(client.getMovie('tt1'));

    expect(error.code).toBe('network');
    expect(error.message).not.toContain('secret');
  });

  it('fails fast when no key is configured', async () => {
    const fetchFn = jest.fn();
    const client = createOmdbClient({ apiKey: '', fetchFn });

    const error = await failure(client.getMovie('tt1'));

    expect(error.code).toBe('configuration');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('times out slow requests', async () => {
    const fetchFn = jest.fn(
      (_url: string, { signal }: { signal: AbortSignal }) =>
        new Promise<never>((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const client = createOmdbClient({ apiKey: 'key', fetchFn, timeoutMs: 5 });

    const error = await failure(client.getMovie('tt1'));

    expect(error.code).toBe('timeout');
  });

  it('propagates caller cancellation untouched', async () => {
    const controller = new AbortController();
    const aborted = new Error('aborted');
    const fetchFn = jest.fn(
      (_url: string, { signal }: { signal: AbortSignal }) =>
        new Promise<never>((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(aborted));
        }),
    );
    const client = createOmdbClient({ apiKey: 'key', fetchFn });

    const request = client.getMovie('tt1', { signal: controller.signal });
    controller.abort();

    await expect(request).rejects.toBe(aborted);
  });

  it('parses a successful movie response', async () => {
    const client = createOmdbClient({ apiKey: 'key', fetchFn: respondWith(movieDto) });

    await expect(client.getMovie('tt1')).resolves.toMatchObject({ id: 'tt1', title: 'Heat' });
  });
});
