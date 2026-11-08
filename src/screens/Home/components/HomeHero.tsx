import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Poster } from '@/components';
import { getFeaturedMovieId } from '@/config/collections';
import { useMovie } from '@/hooks/useMovies';
import { useOpenMovie } from '@/hooks/useOpenMovie';
import { colors, spacing } from '@/theme/theme';
import { posterUrlForWidth } from '@/utils/poster';

const HERO_POSTER_WIDTH = 1000;
const HERO_ASPECT_RATIO = 4 / 5;
const HERO_MAX_HEIGHT_RATIO = 0.7;

const GRADIENT_COLORS = [colors.scrimClear, colors.scrim, colors.background] as const;

export const HomeHero = () => {
  const { width, height: windowHeight } = useWindowDimensions();
  const { top, left, right } = useSafeAreaInsets();
  const { data: movie, isLoading } = useMovie(getFeaturedMovieId());
  const openMovie = useOpenMovie();

  const handleOpen = () => {
    if (movie) openMovie(movie);
  };

  const height = Math.min(width / HERO_ASPECT_RATIO, windowHeight * HERO_MAX_HEIGHT_RATIO);

  if (isLoading) {
    return null;
  }

  if (!movie) {
    return <View style={{ height: top + spacing.xxl + spacing.md }} />;
  }

  return (
    <View style={{ height }}>
      <Poster
        uri={movie.posterUrl && posterUrlForWidth(movie.posterUrl, HERO_POSTER_WIDTH)}
        previewUri={movie.posterUrl}
        title={movie.title}
        priority="high"
        contentPosition="center"
        style={styles.poster}
      />
      <LinearGradient colors={GRADIENT_COLORS} locations={[0.4, 0.85, 1]} style={styles.scrim} />
      <View style={[styles.copy, { left: spacing.md + left, right: spacing.md + right }]}>
        <AppText variant="display" numberOfLines={2}>
          {movie.title}
        </AppText>
        <AppText variant="secondary" numberOfLines={1}>
          {[movie.year, ...movie.genres].join('  ·  ')}
        </AppText>
        <Button
          title="View details"
          icon="information-circle-outline"
          onPress={handleOpen}
          style={styles.action}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 0,
  },
  poster: {
    ...StyleSheet.absoluteFill,
    borderRadius: 0,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  copy: {
    position: 'absolute',
    bottom: spacing.md,
    gap: spacing.sm,
  },
  action: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
});
