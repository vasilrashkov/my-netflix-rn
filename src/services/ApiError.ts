const API_ERROR_CODES = [
  'configuration',
  'network',
  'timeout',
  'unauthorized',
  'rate-limited',
  'not-found',
  'invalid-request',
  'invalid-response',
  'unknown',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export interface SerializedApiError {
  code: ApiErrorCode;
  message: string;
}

const RETRYABLE_CODES: readonly ApiErrorCode[] = ['network', 'timeout', 'invalid-response'];

export const isRetryableCode = (code: ApiErrorCode): boolean => RETRYABLE_CODES.includes(code);

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const toSerializedError = (error: unknown): SerializedApiError => {
  if (error instanceof ApiError) return { code: error.code, message: error.message };
  return { code: 'unknown', message: 'Unexpected error' };
};

export const getApiErrorCode = (error: unknown): ApiErrorCode | null => {
  if (typeof error !== 'object' || error === null || !('code' in error)) return null;
  return API_ERROR_CODES.find((code) => code === error.code) ?? null;
};

const APP_WIDE_CODES: readonly ApiErrorCode[] = ['configuration', 'unauthorized', 'rate-limited'];

export const isAppWideError = (error: unknown): boolean => {
  const code = getApiErrorCode(error);
  return code !== null && APP_WIDE_CODES.includes(code);
};
