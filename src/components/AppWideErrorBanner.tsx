import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppWideErrorCode } from '@/hooks/useAppWideErrorCode';
import { spacing } from '@/theme/theme';

import { getErrorCopy } from './QueryErrorView';
import { StateView } from './StateView';

export const AppWideErrorBanner = () => {
  const code = useAppWideErrorCode();
  const { bottom, left, right } = useSafeAreaInsets();

  if (!code) return null;

  return (
    <View
      pointerEvents="box-none"
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        { paddingBottom: bottom + spacing.sm, paddingLeft: left, paddingRight: right },
      ]}
    >
      <StateView compact {...getErrorCopy(code)} />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
