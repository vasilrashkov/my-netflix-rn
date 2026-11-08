import type { PropsWithChildren } from 'react';
import { Animated, StyleSheet, useAnimatedValue, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { POSTER_ASPECT_RATIO } from '@/components';
import { colors, spacing } from '@/theme/theme';
import type { MovieSummary } from '@/types/movie';

import { MovieBackdrop } from './MovieBackdrop';

const BACKDROP_MAX_HEIGHT_RATIO = 0.65;
const SCROLL_EVENT_THROTTLE_MS = 16;

interface MovieDetailsContentProps {
  movie: MovieSummary;
}

export const MovieDetailsContent = ({
  movie,
  children,
}: PropsWithChildren<MovieDetailsContentProps>) => {
  const { width, height: windowHeight } = useWindowDimensions();
  const { bottom, left, right } = useSafeAreaInsets();
  const scrollY = useAnimatedValue(0);

  const backdropHeight = Math.min(
    width / POSTER_ASPECT_RATIO,
    windowHeight * BACKDROP_MAX_HEIGHT_RATIO,
  );

  return (
    <Animated.ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: bottom + spacing.xl }}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={SCROLL_EVENT_THROTTLE_MS}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      <MovieBackdrop movie={movie} height={backdropHeight} scrollY={scrollY} />
      <View
        style={[styles.body, { paddingLeft: spacing.md + left, paddingRight: spacing.md + right }]}
      >
        {children}
      </View>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    gap: spacing.lg,
    marginTop: -spacing.xxl,
  },
});
