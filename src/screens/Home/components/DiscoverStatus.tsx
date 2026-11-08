import { StyleSheet, View } from 'react-native';

import { POSTER_ASPECT_RATIO, QueryErrorView, Skeleton, SkeletonGroup } from '@/components';
import { DISCOVER_COLLECTION } from '@/config/collections';
import { useMovieSearch } from '@/hooks/useMovies';
import { spacing, typography } from '@/theme/theme';

import { LIST_THUMBNAIL_WIDTH } from './MovieListItem';

const SKELETON_ROWS = [0, 1, 2];

export const DiscoverStatus = () => {
  const { error, isLoading, refetch } = useMovieSearch(DISCOVER_COLLECTION.query);

  if (isLoading) {
    return (
      <SkeletonGroup style={styles.skeletons}>
        {SKELETON_ROWS.map((row) => (
          <View key={row} style={styles.row}>
            <Skeleton style={styles.thumbnail} />
            <View style={styles.copy}>
              <Skeleton style={styles.titleLine} />
              <Skeleton style={styles.yearLine} />
            </View>
          </View>
        ))}
      </SkeletonGroup>
    );
  }

  return error ? <QueryErrorView compact error={error} onRetry={refetch} /> : null;
};

const styles = StyleSheet.create({
  skeletons: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  thumbnail: {
    width: LIST_THUMBNAIL_WIDTH,
    aspectRatio: POSTER_ASPECT_RATIO,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  titleLine: {
    width: '70%',
    height: typography.label.fontSize,
  },
  yearLine: {
    width: '25%',
    height: typography.secondary.fontSize,
  },
});
