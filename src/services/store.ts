import { configureStore, type Reducer } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';

import { moviesApi } from './moviesApi';

export const createStore = (reducer: Reducer = moviesApi.reducer) => {
  return configureStore({
    reducer: { [moviesApi.reducerPath]: reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
      }).concat(moviesApi.middleware),
  });
};

export const disposeStore = (store: AppStore) => {
  store.dispatch(moviesApi.util.resetApiState());
};

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];
