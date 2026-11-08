import { Pressable, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

import { spacing } from '@/theme/theme';
import type { MovieSummary } from '@/types/movie';

import { AppText } from './AppText';
import { Poster, POSTER_ASPECT_RATIO } from './Poster';

interface MovieCardProps {
  movie: MovieSummary;
  onPress: (movie: MovieSummary) => void;
  titleLines?: number;
  style?: StyleProp<ViewStyle>;
}

export const MovieCard = ({ movie, onPress, titleLines = 1, style }: MovieCardProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${movie.title}, ${movie.year}`}
      onPress={() => onPress(movie)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      <Poster uri={movie.posterUrl} title={movie.title} style={styles.poster} />
      <AppText variant="caption" numberOfLines={titleLines}>
        {movie.title}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  poster: {
    aspectRatio: POSTER_ASPECT_RATIO,
  },
});
