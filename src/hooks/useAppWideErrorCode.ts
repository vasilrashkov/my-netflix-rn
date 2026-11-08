import { QueryStatus } from '@reduxjs/toolkit/query';
import { useSelector } from 'react-redux';

import { type ApiErrorCode, getApiErrorCode, isAppWideError } from '@/services/ApiError';
import { moviesApi } from '@/services/moviesApi';

type MoviesApiState = { [moviesApi.reducerPath]: ReturnType<typeof moviesApi.reducer> };

const selectAppWideErrorCode = (state: MoviesApiState): ApiErrorCode | null => {
  const queries = Object.values(state[moviesApi.reducerPath].queries);
  const failed = queries.find(
    (query) => query?.status === QueryStatus.rejected && isAppWideError(query.error),
  );
  return failed ? getApiErrorCode(failed.error) : null;
};

export const useAppWideErrorCode = () => useSelector(selectAppWideErrorCode);
