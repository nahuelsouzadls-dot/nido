export const LightColors = {
  background: '#FAF8F5',
  card: '#FFFFFF',
  border: '#ECECEC',

  textPrimary: '#1F1F1F',
  textSecondary: '#6E6E73',
  textTertiary: '#AEAEB2',

  primary: '#5E5CE6',
  primaryLight: '#EAE9FB',

  success: '#34C759',
  successLight: '#E8F9ED',

  warning: '#FFB84D',
  warningLight: '#FFF5E0',

  danger: '#FF453A',
  dangerLight: '#FFE9E8',

  shadow: 'rgba(0,0,0,0.06)',
} as const;

export const DarkColors = {
  background: '#1C1C1E',
  card: '#2C2C2E',
  border: '#3A3A3C',

  textPrimary: '#FFFFFF',
  textSecondary: '#AEAEB2',
  textTertiary: '#636366',

  primary: '#7B79FF',
  primaryLight: '#2A2960',

  success: '#30D158',
  successLight: '#1A3D26',

  warning: '#FFD60A',
  warningLight: '#3D2E00',

  danger: '#FF453A',
  dangerLight: '#3D1210',

  shadow: 'rgba(0,0,0,0.3)',
} as const;

// Alias para imports estáticos fuera de componentes (scan screen, etc.)
export const Colors = LightColors;

export type ColorPalette = typeof LightColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Typography = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const, letterSpacing: 0.4 },
  title1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: 0.3 },
  title2: { fontSize: 22, fontWeight: '600' as const, letterSpacing: 0.2 },
  title3: { fontSize: 20, fontWeight: '600' as const },
  headline: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 17, fontWeight: '400' as const },
  callout: { fontSize: 16, fontWeight: '400' as const },
  subhead: { fontSize: 15, fontWeight: '400' as const },
  footnote: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
