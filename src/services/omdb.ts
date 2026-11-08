import { env } from '@/config/env';

import { createOmdbClient } from './omdbClient';

export const omdbClient = createOmdbClient({ apiKey: env.omdbApiKey });
