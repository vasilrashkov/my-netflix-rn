import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { colors, iconSize, spacing } from '@/theme/theme';
import type { Collection } from '@/types/collection';

interface SectionHeaderProps {
  collection: Collection;
  onSeeAll: (collection: Collection) => void;
}

export const SectionHeader = ({ collection, onSeeAll }: SectionHeaderProps) => {
  return (
    <View style={styles.header}>
      <AppText variant="heading" accessibilityRole="header" numberOfLines={1} style={styles.title}>
        {collection.title}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`See all ${collection.title}`}
        hitSlop={spacing.sm}
        onPress={() => onSeeAll(collection)}
        style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
      >
        <AppText variant="caption">See all</AppText>
        <Ionicons name="chevron-forward" size={iconSize.sm} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  title: {
    flex: 1,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
});
