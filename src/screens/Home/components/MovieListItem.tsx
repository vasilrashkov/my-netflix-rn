import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Poster, POSTER_ASPECT_RATIO } from '@/components';
import { colors, iconSize, spacing } from '@/theme/theme';
import type { MovieSummary } from '@/types/movie';

export const LIST_THUMBNAIL_WIDTH = 64;

interface MovieListItemProps {
  movie: MovieSummary;
  onPress: (movie: MovieSummary) => void;
}

export const MovieListItem = ({ movie, onPress }: MovieListItemProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${movie.title}, ${movie.year}`}
      onPress={() => onPress(movie)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Poster uri={movie.posterUrl} style={styles.thumbnail} />
      <View style={styles.copy}>
        <AppText variant="label" numberOfLines={2}>
          {movie.title}
        </AppText>
        <AppText variant="secondary">{movie.year}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={iconSize.md} color={colors.textMuted} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  thumbnail: {
    width: LIST_THUMBNAIL_WIDTH,
    aspectRatio: POSTER_ASPECT_RATIO,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
});
