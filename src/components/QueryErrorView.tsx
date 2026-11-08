import {
  type ApiErrorCode,
  getApiErrorCode,
  isAppWideError,
  isRetryableCode,
} from '@/services/ApiError';

import { StateView } from './StateView';

const COPY: Partial<Record<ApiErrorCode, { title: string; message: string }>> = {
  configuration: {
    title: 'App not configured',
    message: 'Add EXPO_PUBLIC_OMDB_API_KEY to .env.local and restart.',
  },
  unauthorized: { title: 'Access denied', message: 'The movie service rejected the API key.' },
  'rate-limited': {
    title: 'Daily limit reached',
    message: 'The movie service quota has run out. Please try again tomorrow.',
  },
  'not-found': { title: 'Not found', message: "We couldn't find this movie." },
  network: { title: "Can't connect", message: 'Check your connection and try again.' },
  unknown: { title: 'Something went wrong', message: 'Please try again later.' },
};

const FALLBACK_COPY = {
  title: "Couldn't load this",
  message: 'The movie service is having trouble.',
};

export const getErrorCopy = (code: ApiErrorCode | null) => (code && COPY[code]) ?? FALLBACK_COPY;

interface QueryErrorViewProps {
  error: unknown;
  onRetry: () => void;
  compact?: boolean;
}

const APP_WIDE_FULL_SCREEN_COPY = { title: 'Movies are unavailable right now' };

export const QueryErrorView = ({ error, onRetry, compact }: QueryErrorViewProps) => {
  if (isAppWideError(error)) {
    return compact ? null : <StateView {...APP_WIDE_FULL_SCREEN_COPY} />;
  }

  const code = getApiErrorCode(error);
  const copy = getErrorCopy(code);
  const canRetry = code === null || isRetryableCode(code);

  return (
    <StateView
      {...copy}
      compact={compact}
      action={canRetry ? { label: 'Retry', onPress: onRetry } : undefined}
    />
  );
};
