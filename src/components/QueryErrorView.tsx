import { type ApiErrorCode, getApiErrorCode, isRetryableCode } from '@/services/ApiError';

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
};

const FALLBACK_COPY = {
  title: "Couldn't load this",
  message: 'The movie service is having trouble.',
};

interface QueryErrorViewProps {
  error: unknown;
  onRetry: () => void;
  compact?: boolean;
}

export const QueryErrorView = ({ error, onRetry, compact }: QueryErrorViewProps) => {
  const code = getApiErrorCode(error);
  const copy = (code && COPY[code]) ?? FALLBACK_COPY;
  const canRetry = code === null || isRetryableCode(code);

  return (
    <StateView
      {...copy}
      compact={compact}
      action={canRetry ? { label: 'Retry', onPress: onRetry } : undefined}
    />
  );
};
