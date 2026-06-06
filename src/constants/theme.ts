export const LightColors = {
  // App background — warm rose, never pure white
  background: '#F5F0F2',

  // Primary — burgundy
  primary: '#6B2D3E',
  primaryWarn: '#8B3A20',
  primaryUrgent: '#5C1A1A',
  primaryDark: '#4A1828',
  primaryLight: '#E8C4CC',

  // Text
  textPrimary: '#1E0A10',
  textSecondary: '#8B5A65',
  textTertiary: '#8B5A65',
  textOnDark: '#F5F0F2',

  // Borders
  border: '#DDD0D4',
  borderSubtle: 'rgba(107,45,62,0.15)',

  // Cards
  card: 'rgba(255,255,255,0.52)',
  cardSage: 'rgba(90,122,72,0.08)',

  // Sage — goals, paid, success
  sage: '#5A7A48',
  sageDark: '#3A5A28',
  sageLight: 'rgba(90,122,72,0.1)',

  // Hero card numbers (on dark backgrounds)
  heroOk: '#C8EAB0',
  heroWarn: '#FFCBA4',
  heroUrgent: '#FFBCB0',

  // Legacy aliases used throughout existing code
  success: '#5A7A48',
  successLight: 'rgba(90,122,72,0.1)',
  warning: '#8B3A20',
  warningLight: 'rgba(139,58,32,0.1)',
  danger: '#5C1A1A',
  dangerLight: 'rgba(92,26,26,0.1)',
  shadow: 'rgba(0,0,0,0.06)',
} as const;

// Dark mode: light-first per spec
export const DarkColors = LightColors;

// Static alias for code outside components
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
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const Typography = {
  // Nido type scale
  display:     { fontFamily: 'Manrope_800ExtraBold', fontSize: 20, letterSpacing: -0.4 },
  h1:          { fontFamily: 'Manrope_800ExtraBold', fontSize: 17, letterSpacing: -0.3 },
  h2:          { fontFamily: 'Manrope_700Bold',      fontSize: 13 },
  body:        { fontFamily: 'Manrope_600SemiBold',  fontSize: 11 },
  label:       { fontFamily: 'Manrope_500Medium',    fontSize: 9 },
  labelCaps:   { fontFamily: 'Manrope_700Bold',      fontSize: 8,  letterSpacing: 0.8 },
  numeroGrande:{ fontFamily: 'Manrope_800ExtraBold', fontSize: 34, letterSpacing: -1 },
  numeroHero:  { fontFamily: 'Manrope_800ExtraBold', fontSize: 22, letterSpacing: -0.8 },

  // Legacy variant aliases — existing components use these names
  largeTitle:  { fontFamily: 'Manrope_800ExtraBold', fontSize: 20, letterSpacing: -0.4 },
  title1:      { fontFamily: 'Manrope_800ExtraBold', fontSize: 17, letterSpacing: -0.3 },
  title2:      { fontFamily: 'Manrope_700Bold',      fontSize: 15 },
  title3:      { fontFamily: 'Manrope_700Bold',      fontSize: 13 },
  headline:    { fontFamily: 'Manrope_700Bold',      fontSize: 13 },
  callout:     { fontFamily: 'Manrope_600SemiBold',  fontSize: 12 },
  subhead:     { fontFamily: 'Manrope_600SemiBold',  fontSize: 11 },
  footnote:    { fontFamily: 'Manrope_500Medium',    fontSize: 10 },
  caption:     { fontFamily: 'Manrope_500Medium',    fontSize: 9 },
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
