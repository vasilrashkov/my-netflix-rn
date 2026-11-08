import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { getCollection } from '@/config/collections';
import { CollectionScreen } from '@/screens/Collection/CollectionScreen';
import { HomeScreen } from '@/screens/Home/HomeScreen';
import { MovieDetailsScreen } from '@/screens/MovieDetails/MovieDetailsScreen';
import { colors } from '@/theme/theme';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="MovieDetails"
        component={MovieDetailsScreen}
        options={{ title: '', headerTransparent: true, headerStyle: undefined }}
      />
      <Stack.Screen
        name="Collection"
        component={CollectionScreen}
        options={({ route }) => ({ title: getCollection(route.params.collectionId)?.title ?? '' })}
      />
    </Stack.Navigator>
  );
};
