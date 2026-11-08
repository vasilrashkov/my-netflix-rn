import type {
  MovieDetails,
  MoviePage,
  MovieRating,
  MovieSummary,
  RatingSource,
} from '@/types/movie';

import type { OmdbMovieDto, OmdbRatingDto, OmdbSearchDto, OmdbSearchItemDto } from './omdbDto';

export const OMDB_PAGE_SIZE = 10;

const RATING_SOURCES: Record<string, { source: RatingSource; label: string }> = {
  'Internet Movie Database': { source: 'imdb', label: 'IMDb' },
  'Rotten Tomatoes': { source: 'rottenTomatoes', label: 'Tomatometer' },
  Metacritic: { source: 'metacritic', label: 'Metacritic' },
};

// OMDb sends the string "N/A" for missing values, in every field.
const clean = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === 'N/A') return null;
  return trimmed;
};

const splitList = (value: string | undefined): string[] => {
  return clean(value)?.split(', ') ?? [];
};

const toRating = ({ Source, Value }: OmdbRatingDto): MovieRating | null => {
  const known = RATING_SOURCES[Source];
  const value = clean(Value);
  return known && value ? { ...known, value } : null;
};

export const toMovieSummary = (dto: OmdbSearchItemDto): MovieSummary => {
  return {
    id: dto.imdbID,
    title: dto.Title,
    year: dto.Year,
    posterUrl: clean(dto.Poster),
  };
};

export const toMoviePage = (dto: OmdbSearchDto, page: number): MoviePage => {
  const totalResults = Number.parseInt(dto.totalResults, 10) || 0;

  return {
    movies: dto.Search.map(toMovieSummary),
    page,
    totalResults,
    hasMore: page * OMDB_PAGE_SIZE < totalResults,
  };
};

export const toMovieDetails = (dto: OmdbMovieDto): MovieDetails => {
  return {
    id: dto.imdbID,
    title: dto.Title,
    year: dto.Year,
    posterUrl: clean(dto.Poster),
    plot: clean(dto.Plot),
    rated: clean(dto.Rated),
    runtime: clean(dto.Runtime),
    released: clean(dto.Released),
    genres: splitList(dto.Genre),
    director: clean(dto.Director),
    writer: clean(dto.Writer),
    cast: splitList(dto.Actors),
    language: clean(dto.Language),
    awards: clean(dto.Awards),
    boxOffice: clean(dto.BoxOffice),
    ratings: (dto.Ratings ?? []).map(toRating).filter((rating) => rating !== null),
  };
};
