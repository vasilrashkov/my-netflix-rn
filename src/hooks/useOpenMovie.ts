import { useNavigation } from '@react-navigation/native';

import type { MovieSummary } from '@/types/movie';

export const useOpenMovie = () => {
  const navigation = useNavigation();

  return (movie: MovieSummary) => {
    navigation.navigate('MovieDetails', { movieId: movie.id, preview: movie });
  };
};
