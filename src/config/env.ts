// Expo inlines EXPO_PUBLIC_* at build time, so this must stay a static property access.
// Anything inlined here ships in the app bundle: treat it as public, not secret.
export const env = {
  omdbApiKey: process.env.EXPO_PUBLIC_OMDB_API_KEY ?? '',
} as const;
