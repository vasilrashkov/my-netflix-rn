import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { spacing } from '@/theme/theme';
import type { MovieDetails, MovieSummary } from '@/types/movie';

interface MovieHeadingProps {
  summary: MovieSummary;
  details?: MovieDetails;
}

export const MovieHeading = ({ summary, details }: MovieHeadingProps) => {
  const meta = [summary.year, details?.rated, details?.runtime].filter(Boolean).join('  ·  ');

  return (
    <View style={styles.heading}>
      <AppText variant="display" accessibilityRole="header">
        {summary.title}
      </AppText>
      <AppText variant="secondary">{meta}</AppText>
      {details?.genres.length ? (
        <AppText variant="secondary">{details.genres.join(', ')}</AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    gap: spacing.xs,
  },
});
