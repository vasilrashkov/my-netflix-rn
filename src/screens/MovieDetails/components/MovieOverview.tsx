import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { spacing } from '@/theme/theme';
import type { MovieDetails } from '@/types/movie';

import { FactList } from './FactList';
import { RatingList } from './RatingList';

export const MovieOverview = ({ movie }: { movie: MovieDetails }) => {
  return (
    <View style={styles.overview}>
      {movie.ratings.length > 0 ? <RatingList ratings={movie.ratings} /> : null}
      {movie.plot ? (
        <View style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
            Overview
          </AppText>
          <AppText>{movie.plot}</AppText>
        </View>
      ) : null}
      <FactList
        facts={[
          { label: 'Cast', value: movie.cast.join(', ') || null },
          { label: 'Director', value: movie.director },
          { label: 'Writer', value: movie.writer },
          { label: 'Released', value: movie.released },
          { label: 'Language', value: movie.language },
          { label: 'Awards', value: movie.awards },
          { label: 'Box office', value: movie.boxOffice },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overview: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
});
