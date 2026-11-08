import type { TextStyle } from 'react-native';

// The app is dark-only by design: posters are the colour, the chrome stays out of their way.
export const colors = {
  background: '#0B0B0F',
  surface: '#16161D',
  surfaceRaised: '#24242E',
  border: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#F5F5F7',
  textSecondary: '#B4B4C0',
  textMuted: '#8A8A98',
  accent: '#E8B04A',
  onAccent: '#1A1205',
  scrim: 'rgba(11, 11, 15, 0.92)',
  scrimClear: 'rgba(11, 11, 15, 0)',
  scrimTop: 'rgba(11, 11, 15, 0.6)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const iconSize = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 40,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  full: 9999,
} as const;

export const typography = {
  wordmark: { fontSize: 20, fontWeight: '800', letterSpacing: 4, color: colors.accent },
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800', color: colors.textPrimary },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', color: colors.textPrimary },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400', color: colors.textPrimary },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600', color: colors.textPrimary },
  secondary: { fontSize: 14, lineHeight: 20, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500', color: colors.textSecondary },
} as const satisfies Record<string, TextStyle>;
