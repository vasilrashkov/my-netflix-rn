import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { colors, spacing } from '@/theme/theme';

interface Fact {
  label: string;
  value: string | null;
}

export const FactList = ({ facts }: { facts: Fact[] }) => {
  return (
    <View style={styles.list}>
      {facts.map(({ label, value }) =>
        value ? (
          <View key={label} accessible style={styles.fact}>
            <AppText variant="secondary" style={styles.label}>
              {label}
            </AppText>
            <AppText variant="secondary" style={styles.value}>
              {value}
            </AppText>
          </View>
        ) : null,
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  fact: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  label: {
    width: 96,
  },
  value: {
    flex: 1,
    color: colors.textPrimary,
  },
});
