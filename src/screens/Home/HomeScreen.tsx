import { useNavigation } from '@react-navigation/native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useState } from 'react';
import {
  ActivityIndicator,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QueryErrorView } from '@/components';
import { useRefreshMovies } from '@/hooks/useMovies';
import { useOpenMovie } from '@/hooks/useOpenMovie';
import { colors, spacing } from '@/theme/theme';
import type { Collection } from '@/types/collection';

import { CollectionRail } from './components/CollectionRail';
import { DiscoverStatus } from './components/DiscoverStatus';
import { HomeHeader } from './components/HomeHeader';
import { HomeHero } from './components/HomeHero';
import { MovieListItem } from './components/MovieListItem';
import { SectionHeader } from './components/SectionHeader';
import { getHomeFeedItemType, type HomeFeedItem, useHomeFeed } from './hooks/useHomeFeed';

const HEADER_SOLID_OFFSET = 240;

export const HomeScreen = () => {
  const navigation = useNavigation();
  const refreshMovies = useRefreshMovies();
  const { left, right } = useSafeAreaInsets();
  const sideInsets = { paddingLeft: left, paddingRight: right };
  const openMovie = useOpenMovie();
  const { feed, error, isFetchingNextPage, isFetchNextPageError, loadMore, retryLoadMore } =
    useHomeFeed();

  const [headerSolid, setHeaderSolid] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const openCollection = (collection: Collection) => {
    navigation.navigate('Collection', { collectionId: collection.id });
  };

  const renderItem: ListRenderItem<HomeFeedItem> = ({ item }) => {
    switch (item.type) {
      case 'hero':
        return <HomeHero />;
      case 'rail':
        return (
          <CollectionRail
            collection={item.collection}
            onOpenMovie={openMovie}
            onSeeAll={openCollection}
          />
        );
      case 'section-header':
        return (
          <View style={[styles.sectionHeader, sideInsets]}>
            <SectionHeader collection={item.collection} onSeeAll={openCollection} />
          </View>
        );
      case 'discover-status':
        return (
          <View style={sideInsets}>
            <DiscoverStatus />
          </View>
        );
      case 'movie':
        return (
          <View style={sideInsets}>
            <MovieListItem movie={item.movie} onPress={openMovie} />
          </View>
        );
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setHeaderSolid(event.nativeEvent.contentOffset.y > HEADER_SOLID_OFFSET);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMovies();
    setRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <FlashList
        testID="home-feed"
        data={feed}
        keyExtractor={(item) => item.key}
        getItemType={getHomeFeedItemType}
        renderItem={renderItem}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.textSecondary}
          />
        }
        ListFooterComponent={
          isFetchNextPageError ? (
            <View style={sideInsets}>
              <QueryErrorView compact error={error} onRetry={retryLoadMore} />
            </View>
          ) : isFetchingNextPage ? (
            <ActivityIndicator color={colors.textMuted} />
          ) : null
        }
      />
      <HomeHeader solid={headerSolid} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    paddingBottom: spacing.sm,
  },
});
