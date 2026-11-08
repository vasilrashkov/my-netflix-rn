import type { LinkingOptions } from '@react-navigation/native';
import { createURL } from 'expo-linking';

import type { RootStackParamList } from '@/types/navigation';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [createURL('/')],
  config: {
    screens: {
      Home: '',
      MovieDetails: 'movie/:movieId',
      Collection: 'collection/:collectionId',
    },
  },
};
