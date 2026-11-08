import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QueryErrorView } from '@/components';
import { useMovie } from '@/hooks/useMovies';
import { getApiErrorCode } from '@/services/ApiError';
import { spacing } from '@/theme/theme';
import type { RootScreenProps } from '@/types/navigation';

import { MovieDetailsContent } from './components/MovieDetailsContent';
import { MovieHeading } from './components/MovieHeading';
import { MovieOverview } from './components/MovieOverview';
import { OverviewSkeleton } from './components/OverviewSkeleton';

export const MovieDetailsScreen = ({ route }: RootScreenProps<'MovieDetails'>) => {
  const { movieId, preview } = route.params;
  const { data: details, error, refetch } = useMovie(movieId);
  const { left, right } = useSafeAreaInsets();

  const summary = details ?? preview;
  const isNotFound = getApiErrorCode(error) === 'not-found';

  if (isNotFound || (error && !summary)) {
    return <QueryErrorView error={error} onRetry={refetch} />;
  }

  if (!summary) {
    return (
      <View
        style={[
          styles.loading,
          { paddingLeft: spacing.md + left, paddingRight: spacing.md + right },
        ]}
      >
        <OverviewSkeleton />
      </View>
    );
  }

  return (
    <MovieDetailsContent movie={summary}>
      <MovieHeading summary={summary} details={details} />
      {details ? (
        <MovieOverview movie={details} />
      ) : error ? (
        <QueryErrorView compact error={error} onRetry={refetch} />
      ) : (
        <OverviewSkeleton />
      )}
    </MovieDetailsContent>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
});
