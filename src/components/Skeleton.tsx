import { type PropsWithChildren, useEffect } from 'react';
import {
  Animated,
  Easing,
  type StyleProp,
  StyleSheet,
  useAnimatedValue,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, radius } from '@/theme/theme';

const PULSE_DURATION_MS = 800;

export const SkeletonGroup = ({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) => {
  const opacity = useAnimatedValue(1);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence(
        [0.5, 1].map((toValue) =>
          Animated.timing(opacity, {
            toValue,
            duration: PULSE_DURATION_MS,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ),
      ),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
      style={[style, { opacity }]}
    >
      {children}
    </Animated.View>
  );
};

export const Skeleton = ({ style }: { style?: StyleProp<ViewStyle> }) => {
  return <View style={[styles.block, style]} />;
};

const styles = StyleSheet.create({
  block: {
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
});
