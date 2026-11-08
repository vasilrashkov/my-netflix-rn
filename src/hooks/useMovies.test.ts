import type { MovieSummary } from '@/types/movie';

import { selectMovies } from './useMovies';

jest.mock('@/services/omdb', () => ({ omdbClient: {} }));

const movie = (id: string): MovieSummary => ({ id, title: id, year: '2000', posterUrl: null });
const page = (ids: string[], pageNumber: number) => ({
  movies: ids.map(movie),
  page: pageNumber,
  totalResults: 20,
  hasMore: false,
});

describe('selectMovies', () => {
  it('flattens pages in order and drops repeats', () => {
    const result = selectMovies({ pages: [page(['a', 'b'], 1), page(['b', 'c'], 2)] });

    expect(result.map(({ id }) => id)).toEqual(['a', 'b', 'c']);
  });
});
