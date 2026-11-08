import { DISCOVER_COLLECTION, getCollection, getFeaturedMovieId } from './collections';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('getFeaturedMovieId', () => {
  it('is stable within a day and rotates between days', () => {
    expect(getFeaturedMovieId(0)).toBe(getFeaturedMovieId(DAY_MS - 1));
    expect(getFeaturedMovieId(0)).not.toBe(getFeaturedMovieId(DAY_MS));
  });
});

describe('getCollection', () => {
  it('finds the discover collection and rejects unknown ids', () => {
    expect(getCollection('discover')).toBe(DISCOVER_COLLECTION);
    expect(getCollection('nope')).toBeUndefined();
  });
});
