import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

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
  const { movies, error, isLoading, isFetchingNextPage, loadMore, refetch } = useMovieSearch(
    collection.query,
  );

  const renderItem = ({ item }: { item: MovieSummary }) => (
    <MovieCard movie={item} onPress={onOpenMovie} style={styles.card} />
  );

  if (!isLoading && !error && movies.length === 0) return null;

  return (
    <View style={styles.rail}>
      <SectionHeader collection={collection} onSeeAll={onSeeAll} />
      {movies.length > 0 ? (
        <View style={styles.listFrame}>
          <FlashList
            horizontal
            data={movies}
            keyExtractor={(movie) => movie.id}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={1}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={Separator}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footer}>
                  <ActivityIndicator color={colors.textMuted} />
                </View>
              ) : null
            }
          />
        </View>
      ) : error ? (
        <QueryErrorView compact error={error} onRetry={refetch} />
      ) : (
        <SkeletonGroup style={styles.skeletonRow}>
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
  listContent: {
    paddingHorizontal: spacing.md,
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
