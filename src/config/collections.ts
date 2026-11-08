import type { Collection } from '@/types/collection';

export const HOME_COLLECTIONS: readonly Collection[] = [
  { id: 'caped-crusaders', title: 'Caped Crusaders', query: 'batman' },
  { id: 'star-wars', title: 'The Star Wars Saga', query: 'star wars' },
  { id: 'wizarding-world', title: 'The Wizarding World', query: 'harry potter' },
  { id: 'tales-of-tomorrow', title: 'Tales of Tomorrow', query: 'future' },
  { id: 'impossible-missions', title: 'Impossible Missions', query: 'mission impossible' },
  { id: 'alien-encounters', title: 'Alien Encounters', query: 'alien' },
  { id: 'love-stories', title: 'Love Stories', query: 'love' },
  { id: 'fast-and-furious', title: 'Fast & Furious', query: 'fast furious' },
  { id: 'holiday-classics', title: 'Holiday Classics', query: 'christmas' },
];

export const DISCOVER_COLLECTION: Collection = {
  id: 'discover',
  title: 'Worth Discovering',
  query: 'life',
};

const FEATURED_MOVIE_IDS = [
  'tt0468569', // The Dark Knight
  'tt1375666', // Inception
  'tt0816692', // Interstellar
  'tt0133093', // The Matrix
  'tt1856101', // Blade Runner 2049
  'tt0482571', // The Prestige
  'tt0137523', // Fight Club
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export const getFeaturedMovieId = (now = Date.now()): string => {
  const daysSinceEpoch = Math.floor(now / DAY_MS);
  return FEATURED_MOVIE_IDS[daysSinceEpoch % FEATURED_MOVIE_IDS.length] ?? FEATURED_MOVIE_IDS[0];
};

export const getCollection = (id: string): Collection | undefined => {
  return [...HOME_COLLECTIONS, DISCOVER_COLLECTION].find((collection) => collection.id === id);
};
