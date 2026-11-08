export interface MovieSummary {
  id: string;
  title: string;
  year: string;
  posterUrl: string | null;
}

export type RatingSource = 'imdb' | 'rottenTomatoes' | 'metacritic';

export interface MovieRating {
  source: RatingSource;
  label: string;
  value: string;
}

export interface MovieDetails extends MovieSummary {
  plot: string | null;
  rated: string | null;
  runtime: string | null;
  released: string | null;
  genres: string[];
  director: string | null;
  writer: string | null;
  cast: string[];
  language: string | null;
  awards: string | null;
  boxOffice: string | null;
  ratings: MovieRating[];
}

export interface MoviePage {
  movies: MovieSummary[];
  page: number;
  totalResults: number;
  hasMore: boolean;
}
