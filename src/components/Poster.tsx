import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageProps } from 'expo-image';
import { useState } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, iconSize, radius, spacing } from '@/theme/theme';

import { AppText } from './AppText';

export const POSTER_ASPECT_RATIO = 2 / 3;

const FADE_IN_MS = 150;

interface PosterProps {
  uri: string | null;
  /** Shown only in the fallback, when there is no image to identify the movie. */
  title?: string;
  /** Lower-resolution image, usually already cached, shown while `uri` loads. */
  previewUri?: string | null;
  priority?: ImageProps['priority'];
  contentPosition?: ImageProps['contentPosition'];
  style?: StyleProp<ViewStyle>;
}

export const Poster = ({
  uri,
  title,
  previewUri,
  priority = 'normal',
  contentPosition = 'top center',
  style,
}: PosterProps) => {
  // Tracked per URI rather than as a boolean, so a recycled cell doesn't inherit a failure.
  const [failedUri, setFailedUri] = useState<string | null>(null);

  return (
    <View style={[styles.frame, style]} accessibilityIgnoresInvertColors>
      {uri && uri !== failedUri ? (
        <Image
          source={{ uri }}
          placeholder={previewUri ? { uri: previewUri } : undefined}
          placeholderContentFit="cover"
          recyclingKey={uri}
          contentFit="cover"
          contentPosition={contentPosition}
          cachePolicy="memory-disk"
          priority={priority}
          transition={FADE_IN_MS}
          style={StyleSheet.absoluteFill}
          onError={() => setFailedUri(uri)}
        />
      ) : (
        <View style={styles.fallback}>
          <Ionicons name="film-outline" size={iconSize.lg} color={colors.textMuted} />
          {title ? (
            <AppText variant="caption" numberOfLines={3} style={styles.fallbackTitle}>
              {title}
            </AppText>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  fallbackTitle: {
    textAlign: 'center',
  },
});
