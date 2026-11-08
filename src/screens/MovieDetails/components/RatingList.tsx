import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme/theme';
import type { MovieRating } from '@/types/movie';

export const RatingList = ({ ratings }: { ratings: MovieRating[] }) => {
  return (
    <View style={styles.list}>
      {ratings.map(({ source, label, value }) => (
        <View
          key={source}
          accessible
          accessibilityLabel={`${label}: ${value}`}
          style={styles.rating}
        >
          <AppText variant="heading" style={styles.value}>
            {value}
          </AppText>
          <AppText variant="caption" numberOfLines={1}>
            {label}
          </AppText>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rating: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
  },
  value: {
    color: colors.accent,
  },
});
