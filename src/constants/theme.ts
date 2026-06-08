import { paletteClaro, paletteNocturno, type ColorPalette } from '@/theme/palettes';

export type { ColorPalette };

export const LightColors = paletteClaro;
export const DarkColors  = paletteNocturno;

// Static alias for code outside components
export const Colors = LightColors;

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
  display:      { fontFamily: 'Manrope_800ExtraBold', fontSize: 20, letterSpacing: -0.4 },
  h1:           { fontFamily: 'Manrope_800ExtraBold', fontSize: 17, letterSpacing: -0.3 },
  h2:           { fontFamily: 'Manrope_700Bold',      fontSize: 13 },
  body:         { fontFamily: 'Manrope_600SemiBold',  fontSize: 11 },
  label:        { fontFamily: 'Manrope_500Medium',    fontSize: 9 },
  labelCaps:    { fontFamily: 'Manrope_700Bold',      fontSize: 8,  letterSpacing: 0.8 },
  numeroGrande: { fontFamily: 'Manrope_800ExtraBold', fontSize: 34, letterSpacing: -1 },
  numeroHero:   { fontFamily: 'Manrope_800ExtraBold', fontSize: 22, letterSpacing: -0.8 },
  largeTitle:   { fontFamily: 'Manrope_800ExtraBold', fontSize: 20, letterSpacing: -0.4 },
  title1:       { fontFamily: 'Manrope_800ExtraBold', fontSize: 17, letterSpacing: -0.3 },
  title2:       { fontFamily: 'Manrope_700Bold',      fontSize: 15 },
  title3:       { fontFamily: 'Manrope_700Bold',      fontSize: 13 },
  headline:     { fontFamily: 'Manrope_700Bold',      fontSize: 13 },
  callout:      { fontFamily: 'Manrope_600SemiBold',  fontSize: 12 },
  subhead:      { fontFamily: 'Manrope_600SemiBold',  fontSize: 11 },
  footnote:     { fontFamily: 'Manrope_500Medium',    fontSize: 10 },
  caption:      { fontFamily: 'Manrope_500Medium',    fontSize: 9 },
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
