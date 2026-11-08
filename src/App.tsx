import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/components/AppProviders';
import { RootNavigator } from '@/components/RootNavigator';

const App = () => {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <RootNavigator />
    </AppProviders>
  );
};

export default App;
