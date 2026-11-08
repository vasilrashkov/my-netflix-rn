import type { OmdbMovieDto } from './omdbDto';
import { toMovieDetails, toMoviePage, toMovieSummary } from './omdbMappers';

const searchItem = {
  Title: 'Inception',
  Year: '2010',
  imdbID: 'tt1375666',
  Type: 'movie',
  Poster: 'https://img/poster.jpg',
};

describe('toMovieSummary', () => {
  it('maps a search item', () => {
    expect(toMovieSummary(searchItem)).toEqual({
      id: 'tt1375666',
      title: 'Inception',
      year: '2010',
      posterUrl: 'https://img/poster.jpg',
    });
  });

  it('treats a poster of "N/A" as missing', () => {
    expect(toMovieSummary({ ...searchItem, Poster: 'N/A' }).posterUrl).toBeNull();
  });
});

describe('toMoviePage', () => {
  const dto = { Response: 'True' as const, Search: [searchItem], totalResults: '25' };

  it('reports more pages until totalResults is reached', () => {
    expect(toMoviePage(dto, 2).hasMore).toBe(true);
    expect(toMoviePage(dto, 3).hasMore).toBe(false);
  });

  it('survives a malformed total', () => {
    expect(toMoviePage({ ...dto, totalResults: 'oops' }, 1)).toMatchObject({
      totalResults: 0,
      hasMore: false,
    });
  });
});

describe('toMovieDetails', () => {
  const movie: OmdbMovieDto = {
    Response: 'True',
    imdbID: 'tt1',
    Title: 'Sparse',
    Year: '1999',
    Genre: 'Crime, Drama',
    Actors: 'N/A',
    Plot: 'N/A',
    Ratings: [
      { Source: 'Internet Movie Database', Value: '9.0/10' },
      { Source: 'Some Blog', Value: '5/5' },
      { Source: 'Metacritic', Value: 'N/A' },
    ],
  };

  it('normalises missing fields and splits lists', () => {
    expect(toMovieDetails(movie)).toMatchObject({
      genres: ['Crime', 'Drama'],
      cast: [],
      plot: null,
      director: null,
    });
  });

  it('keeps only known ratings that have a value', () => {
    expect(toMovieDetails(movie).ratings).toEqual([
      { source: 'imdb', label: 'IMDb', value: '9.0/10' },
    ]);
  });
});
