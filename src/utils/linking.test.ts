import { getStateFromPath } from '@react-navigation/native';

import { linking } from './linking';

// The URL prefix needs the Expo manifest, which Jest doesn't have. Only the screen config is tested.
jest.mock('expo-linking', () => ({ createURL: () => 'mynetflix://' }));

const routeNames = (path: string) => {
  return getStateFromPath(path, linking.config)?.routes.map(({ name }) => name);
};

describe('linking', () => {
  it('opens a movie deep link with Home underneath', () => {
    expect(routeNames('movie/tt0468569')).toEqual(['Home', 'MovieDetails']);
  });

  it('opens a collection deep link with Home underneath', () => {
    expect(routeNames('collection/star-wars')).toEqual(['Home', 'Collection']);
  });

  it('opens the root link on Home alone', () => {
    expect(routeNames('')).toEqual(['Home']);
  });
});
