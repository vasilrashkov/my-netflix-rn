import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Animated, StyleSheet, useAnimatedValue, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components';
import { colors, spacing } from '@/theme/theme';

const FADE_DURATION_MS = 200;
const SCRIM_HEIGHT = 180;

const SCRIM_COLORS = [colors.scrim, colors.scrimTop, colors.scrimClear] as const;

export const HomeHeader = ({ solid }: { solid: boolean }) => {
  const { top } = useSafeAreaInsets();
  const opacity = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: solid ? 1 : 0,
      duration: FADE_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [opacity, solid]);

  return (
    <View pointerEvents="none" style={[styles.header, { paddingTop: top + spacing.sm }]}>
      <LinearGradient colors={SCRIM_COLORS} locations={[0, 0.5, 1]} style={styles.scrim} />
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity }]} />
      <AppText variant="wordmark" accessibilityRole="header">
        My Netflix
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCRIM_HEIGHT,
  },
  backdrop: {
    backgroundColor: colors.scrim,
  },
});
