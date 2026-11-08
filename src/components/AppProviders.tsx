import { NavigationContainer } from '@react-navigation/native';
import type { PropsWithChildren } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { persistor, store } from '@/services/persistedStore';
import { navigationTheme } from '@/theme/navigationTheme';
import { colors } from '@/theme/theme';
import { linking } from '@/utils/linking';

import { StateView } from './StateView';

const CrashFallback = ({ resetErrorBoundary }: FallbackProps) => {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StateView
        title="Something went wrong"
        message="The app hit an unexpected problem."
        action={{ label: 'Try again', onPress: resetErrorBoundary }}
      />
    </View>
  );
};

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <SafeAreaProvider>
      <ErrorBoundary FallbackComponent={CrashFallback}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <NavigationContainer theme={navigationTheme} linking={linking}>
              {children}
            </NavigationContainer>
          </PersistGate>
        </Provider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};
