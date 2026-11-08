import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';

import { moviesApi } from './moviesApi';
import { createStore } from './store';

const CACHE_VERSION = 1;

const persistedReducer = persistReducer(
  {
    key: moviesApi.reducerPath,
    storage: AsyncStorage,
    version: CACHE_VERSION,
    whitelist: ['queries', 'provided'],
    stateReconciler: false,
    migrate: async (state) => (state?._persist.version === CACHE_VERSION ? state : undefined),
  },
  moviesApi.reducer,
);

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);
