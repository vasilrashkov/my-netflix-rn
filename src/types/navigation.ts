import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { MovieSummary } from '@/types/movie';

export type RootStackParamList = {
  Home: undefined;
  MovieDetails: { movieId: string; preview?: MovieSummary };
  Collection: { collectionId: string };
};

export type RootScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
