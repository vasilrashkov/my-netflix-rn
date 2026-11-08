import { posterUrlForWidth } from './poster';

describe('posterUrlForWidth', () => {
  it('rewrites the CDN size segment', () => {
    const url = 'https://m.media-amazon.com/images/M/abc@@._V1_QL75_UX380_CR0,0,380,562_.jpg';

    expect(posterUrlForWidth(url, 1000)).toBe(
      'https://m.media-amazon.com/images/M/abc@@._V1_QL75_UX1000_.jpg',
    );
  });

  it('leaves unrecognised URLs untouched', () => {
    const url = 'https://example.com/poster.jpg';

    expect(posterUrlForWidth(url, 1000)).toBe(url);
  });
});
