import { LinearGradient } from 'expo-linear-gradient';
import { Animated, StyleSheet } from 'react-native';

import { Poster } from '@/components';
import { colors } from '@/theme/theme';
import type { MovieSummary } from '@/types/movie';
import { posterUrlForWidth } from '@/utils/poster';

const PARALLAX_FACTOR = 0.4;
const MAX_OVERSCROLL_SCALE = 2;

const GRADIENT_COLORS = [
  colors.scrimTop,
  colors.scrimClear,
  colors.scrimClear,
  colors.background,
] as const;
const GRADIENT_LOCATIONS = [0, 0.25, 0.6, 1] as const;

interface MovieBackdropProps {
  movie: MovieSummary;
  height: number;
  scrollY: Animated.Value;
}

export const MovieBackdrop = ({ movie, height, scrollY }: MovieBackdropProps) => {
  const translateY = scrollY.interpolate({
    inputRange: [-height, 0, height],
    outputRange: [-height / 2, 0, height * PARALLAX_FACTOR],
  });
  const scale = scrollY.interpolate({
    inputRange: [-height, 0],
    outputRange: [MAX_OVERSCROLL_SCALE, 1],
    extrapolateRight: 'clamp',
  });

  return (
    <Animated.View style={{ height, transform: [{ translateY }, { scale }] }}>
      <Poster
        uri={movie.posterUrl && posterUrlForWidth(movie.posterUrl, 1000)}
        previewUri={movie.posterUrl}
        title={movie.title}
        priority="high"
        style={styles.layer}
      />
      <LinearGradient
        colors={GRADIENT_COLORS}
        locations={GRADIENT_LOCATIONS}
        style={styles.layer}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    borderRadius: 0,
  },
});
