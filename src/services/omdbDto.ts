import { z } from 'zod';

export const omdbFailureSchema = z.object({
  Response: z.literal('False'),
  Error: z.string().optional(),
});

const omdbSearchItemSchema = z.object({
  Title: z.string(),
  Year: z.string(),
  imdbID: z.string(),
  Poster: z.string(),
});

export const omdbSearchSchema = z.object({
  Response: z.literal('True'),
  Search: z.array(omdbSearchItemSchema),
  totalResults: z.string(),
});

const omdbRatingSchema = z.object({
  Source: z.string(),
  Value: z.string(),
});

export const omdbMovieSchema = z.object({
  Response: z.literal('True'),
  imdbID: z.string(),
  Title: z.string(),
  Year: z.string(),
  Rated: z.string().optional(),
  Released: z.string().optional(),
  Runtime: z.string().optional(),
  Genre: z.string().optional(),
  Director: z.string().optional(),
  Writer: z.string().optional(),
  Actors: z.string().optional(),
  Plot: z.string().optional(),
  Language: z.string().optional(),
  Awards: z.string().optional(),
  Poster: z.string().optional(),
  Ratings: z.array(omdbRatingSchema).optional(),
  BoxOffice: z.string().optional(),
});

export type OmdbSearchItemDto = z.infer<typeof omdbSearchItemSchema>;
export type OmdbSearchDto = z.infer<typeof omdbSearchSchema>;
export type OmdbRatingDto = z.infer<typeof omdbRatingSchema>;
export type OmdbMovieDto = z.infer<typeof omdbMovieSchema>;
