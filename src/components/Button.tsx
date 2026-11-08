import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

import { colors, iconSize, radius, spacing } from '@/theme/theme';

import { AppText } from './AppText';

const MIN_TOUCH_TARGET = 44;

const VARIANTS = {
  primary: { background: colors.accent, foreground: colors.onAccent },
  secondary: { background: colors.surfaceRaised, foreground: colors.textPrimary },
} as const;

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: keyof typeof VARIANTS;
  icon?: ComponentProps<typeof Ionicons>['name'];
  style?: StyleProp<ViewStyle>;
}

export const Button = ({ title, onPress, variant = 'primary', icon, style }: ButtonProps) => {
  const { background, foreground } = VARIANTS[variant];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background },
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={iconSize.md} color={foreground} /> : null}
      <AppText variant="label" style={{ color: foreground }}>
        {title}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  pressed: {
    opacity: 0.75,
  },
});
