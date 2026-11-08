import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MovieCard,
  POSTER_ASPECT_RATIO,
  QueryErrorView,
  Skeleton,
  SkeletonGroup,
} from '@/components';
import { useMovieSearch } from '@/hooks/useMovies';
import { colors, spacing, typography } from '@/theme/theme';
import type { Collection } from '@/types/collection';
import type { MovieSummary } from '@/types/movie';

import { SectionHeader } from './SectionHeader';

const CARD_WIDTH = 124;
const POSTER_HEIGHT = CARD_WIDTH / POSTER_ASPECT_RATIO;

const RAIL_HEIGHT = POSTER_HEIGHT + spacing.sm + typography.caption.lineHeight;
// Wide enough for the compact error's message and Retry button side by side.
const ERROR_FOOTER_WIDTH = CARD_WIDTH * 2 + spacing.sm;
const SKELETON_CARDS = [0, 1, 2, 3];

interface CollectionRailProps {
  collection: Collection;
  onOpenMovie: (movie: MovieSummary) => void;
  onSeeAll: (collection: Collection) => void;
}

const Separator = () => {
  return <View style={styles.separator} />;
};

export const CollectionRail = ({ collection, onOpenMovie, onSeeAll }: CollectionRailProps) => {
  const {
    movies,
    error,
    isLoading,
    isFetchingNextPage,
    isFetchNextPageError,
    loadMore,
    retryLoadMore,
    refetch,
  } = useMovieSearch(collection.query);
  const { left, right } = useSafeAreaInsets();
  const sideInsets = { paddingLeft: left, paddingRight: right };

  const renderItem = ({ item }: { item: MovieSummary }) => (
    <MovieCard movie={item} onPress={onOpenMovie} style={styles.card} />
  );

  if (!isLoading && !error && movies.length === 0) return null;

  return (
    <View style={styles.rail}>
      <View style={sideInsets}>
        <SectionHeader collection={collection} onSeeAll={onSeeAll} />
      </View>
      {movies.length > 0 ? (
        <View style={styles.listFrame}>
          <FlashList
            testID={`rail-${collection.id}`}
            horizontal
            data={movies}
            keyExtractor={(movie) => movie.id}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={1}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingLeft: spacing.md + left,
              paddingRight: spacing.md + right,
            }}
            ItemSeparatorComponent={Separator}
            ListFooterComponent={
              isFetchNextPageError ? (
                <View style={styles.errorFooter}>
                  <QueryErrorView compact error={error} onRetry={retryLoadMore} />
                </View>
              ) : isFetchingNextPage ? (
                <View style={styles.footer}>
                  <ActivityIndicator color={colors.textMuted} />
                </View>
              ) : null
            }
          />
        </View>
      ) : error ? (
        <View style={sideInsets}>
          <QueryErrorView compact error={error} onRetry={refetch} />
        </View>
      ) : (
        <SkeletonGroup style={[styles.skeletonRow, sideInsets]}>
          {SKELETON_CARDS.map((card) => (
            <Skeleton key={card} style={styles.skeletonCard} />
          ))}
        </SkeletonGroup>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rail: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  listFrame: {
    height: RAIL_HEIGHT,
  },
  card: {
    width: CARD_WIDTH,
  },
  separator: {
    width: spacing.sm,
  },
  footer: {
    width: CARD_WIDTH,
    height: POSTER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorFooter: {
    width: ERROR_FOOTER_WIDTH,
    height: POSTER_HEIGHT,
    justifyContent: 'center',
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    height: RAIL_HEIGHT,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  skeletonCard: {
    width: CARD_WIDTH,
    height: POSTER_HEIGHT,
  },
});
