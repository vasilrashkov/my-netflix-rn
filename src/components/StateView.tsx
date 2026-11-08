import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, iconSize, radius, spacing } from '@/theme/theme';

import { AppText } from './AppText';
import { Button } from './Button';

interface StateViewProps {
  title: string;
  message?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  action?: { label: string; onPress: () => void };
  /** Inline presentation, for a failure inside an otherwise healthy screen. */
  compact?: boolean;
}

export const StateView = ({
  title,
  message,
  icon = 'alert-circle-outline',
  action,
  compact = false,
}: StateViewProps) => {
  if (compact) {
    return (
      <View style={styles.compact}>
        <View style={styles.compactCopy}>
          <AppText variant="label">{title}</AppText>
          {message ? <AppText variant="caption">{message}</AppText> : null}
        </View>
        {action ? (
          <Button title={action.label} onPress={action.onPress} variant="secondary" />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.full}>
      <Ionicons name={icon} size={iconSize.xl} color={colors.textMuted} />
      <AppText variant="heading" style={styles.centered}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="secondary" style={styles.centered}>
          {message}
        </AppText>
      ) : null}
      {action ? (
        <Button title={action.label} onPress={action.onPress} style={styles.action} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  full: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  centered: {
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.md,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  compactCopy: {
    flex: 1,
    gap: spacing.xs,
  },
});
