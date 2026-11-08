import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { ActivityIndicator, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MovieCard,
  POSTER_ASPECT_RATIO,
  QueryErrorView,
  Skeleton,
  SkeletonGroup,
  StateView,
} from '@/components';
import { getCollection } from '@/config/collections';
import { useMovieSearch } from '@/hooks/useMovies';
import { useOpenMovie } from '@/hooks/useOpenMovie';
import { colors, spacing, typography } from '@/theme/theme';
import type { Collection } from '@/types/collection';
import type { MovieSummary } from '@/types/movie';
import type { RootScreenProps } from '@/types/navigation';

const MIN_CARD_WIDTH = 104;
const CELL_PADDING = spacing.xs;
const TITLE_LINES = 2;
const SKELETON_CARDS = Array.from({ length: 12 }, (_, index) => index);

export const getColumnCount = (screenWidth: number) => {
  const cellWidth = MIN_CARD_WIDTH + CELL_PADDING * 2;
  return Math.max(2, Math.floor((screenWidth - CELL_PADDING * 2) / cellWidth));
};

const CollectionGrid = ({ collection }: { collection: Collection }) => {
  const { width } = useWindowDimensions();
  const { bottom, left, right } = useSafeAreaInsets();
  const openMovie = useOpenMovie();
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

  // In landscape the notch takes one side, so columns fit the width inside the insets.
  const usableWidth = width - left - right;
  const numColumns = getColumnCount(usableWidth);
  const columnWidth = (usableWidth - CELL_PADDING * 2) / numColumns;
  const sidePadding = { paddingLeft: CELL_PADDING + left, paddingRight: CELL_PADDING + right };

  const renderItem: ListRenderItem<MovieSummary> = ({ item }) => (
    <MovieCard movie={item} onPress={openMovie} titleLines={TITLE_LINES} style={styles.card} />
  );

  if (isLoading) {
    return (
      <SkeletonGroup style={[styles.skeletonGrid, sidePadding]}>
        {SKELETON_CARDS.map((card) => (
          <View key={card} style={[styles.card, styles.skeletonCard, { width: columnWidth }]}>
            <Skeleton style={styles.skeletonPoster} />
            <Skeleton style={styles.skeletonTitle} />
          </View>
        ))}
      </SkeletonGroup>
    );
  }

  if (movies.length === 0) {
    return error ? (
      <QueryErrorView error={error} onRetry={refetch} />
    ) : (
      <StateView
        icon="film-outline"
        title="Nothing here yet"
        message="This collection doesn't have any movies."
      />
    );
  }

  return (
    <FlashList
      testID="collection-grid"
      key={numColumns}
      data={movies}
      numColumns={numColumns}
      keyExtractor={(movie) => movie.id}
      renderItem={renderItem}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={[sidePadding, { paddingBottom: bottom + spacing.md }]}
      ListFooterComponent={
        isFetchNextPageError ? (
          <QueryErrorView compact error={error} onRetry={retryLoadMore} />
        ) : isFetchingNextPage ? (
          <ActivityIndicator color={colors.textMuted} />
        ) : null
      }
    />
  );
};

export const CollectionScreen = ({ route }: RootScreenProps<'Collection'>) => {
  const collection = getCollection(route.params.collectionId);

  if (!collection) {
    return <StateView icon="film-outline" title="Collection not found" />;
  }

  return <CollectionGrid collection={collection} />;
};

const styles = StyleSheet.create({
  card: {
    padding: CELL_PADDING,
    paddingBottom: spacing.sm,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skeletonCard: {
    gap: spacing.sm,
  },
  skeletonPoster: {
    aspectRatio: POSTER_ASPECT_RATIO,
  },
  skeletonTitle: {
    height: typography.caption.lineHeight * TITLE_LINES,
  },
});
