import { StyleSheet, View } from 'react-native';

import { Skeleton, SkeletonGroup } from '@/components';
import { spacing, typography } from '@/theme/theme';

const LINE_WIDTHS = ['100%', '94%', '98%', '60%'] as const;

export const OverviewSkeleton = () => {
  return (
    <SkeletonGroup style={styles.overview}>
      <View style={styles.ratings}>
        <Skeleton style={styles.rating} />
        <Skeleton style={styles.rating} />
      </View>
      {LINE_WIDTHS.map((width, index) => (
        <Skeleton key={index} style={[styles.line, { width }]} />
      ))}
    </SkeletonGroup>
  );
};

const styles = StyleSheet.create({
  overview: {
    gap: spacing.md,
  },
  ratings: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rating: {
    flex: 1,
    height: 72,
  },
  line: {
    height: typography.body.fontSize,
  },
});
