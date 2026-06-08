// Paletas completas de Nido. Mismas claves en ambas para que useColors()
// sea intercambiable sin cambios en los componentes consumidores.

export const paletteClaro = {
  background:       '#F5F0F2',
  surface:          '#FFFFFF',
  backgroundCard:   'rgba(255,255,255,0.72)',
  backgroundInput:  'rgba(255,255,255,0.55)',

  textPrimary:      '#1E0A10',
  textSecondary:    '#8B5A65',
  textTertiary:     'rgba(139,90,101,0.5)',
  textOnDark:       '#F5F0F2',

  primary:          '#6B2D3E',
  primaryDark:      '#4A1828',
  primaryLight:     'rgba(107,45,62,0.1)',
  primaryBorder:    'rgba(107,45,62,0.2)',
  primaryWarn:      '#8B3A20',
  primaryUrgent:    '#5C1A1A',

  sage:             '#5A7A48',
  sageDark:         '#3A5A28',
  sageLight:        'rgba(90,122,72,0.12)',
  heroAccent:       '#C8EAB0',

  personal:         '#0F6E56',
  personalDark:     '#085041',
  personalLight:    'rgba(15,110,86,0.1)',
  personalBorder:   'rgba(15,110,86,0.2)',
  heroPersonal:     '#E1F5EE',

  borderSubtle:     'rgba(107,45,62,0.15)',
  borderMedium:     'rgba(107,45,62,0.25)',
  border:           '#DDD0D4',
  separator:        'rgba(30,10,16,0.06)',

  card:             'rgba(255,255,255,0.72)',
  cardSage:         'rgba(90,122,72,0.08)',
  cardPersonal:     'rgba(15,110,86,0.07)',
  cardHero:         '#6B2D3E',

  navBackground:    '#1E0A10',
  navText:          '#F5F0F2',
  navDot:           '#6B2D3E',
  navInactive:      'rgba(245,240,242,0.3)',

  heroBackground:   '#6B2D3E',
  heroBadge:        'rgba(143,175,122,0.22)',
  heroBadgeText:    '#C8EAB0',
  heroDivider:      'rgba(255,255,255,0.13)',
  heroNumDim:       'rgba(255,255,255,0.35)',
  heroLabelColor:   'rgba(245,240,242,0.5)',
  heroNameColor:    'rgba(245,240,242,0.7)',

  heroOk:           '#C8EAB0',
  heroWarn:         '#FFCBA4',
  heroUrgent:       '#FFBCB0',

  // Aliases semánticos usados en el código existente
  success:          '#5A7A48',
  successLight:     'rgba(90,122,72,0.1)',
  warning:          '#8B3A20',
  warningLight:     'rgba(139,58,32,0.1)',
  danger:           '#5C1A1A',
  dangerLight:      'rgba(92,26,26,0.1)',
  shadow:           'rgba(0,0,0,0.06)',
} as const;

export const paletteNocturno = {
  background:       '#12090D',
  surface:          '#1C0E14',
  backgroundCard:   'rgba(255,255,255,0.04)',
  backgroundInput:  'rgba(255,255,255,0.06)',

  textPrimary:      '#F0E0E5',
  textSecondary:    '#7A5060',
  textTertiary:     'rgba(122,80,96,0.6)',
  textOnDark:       '#F0E0E5',

  primary:          '#C4889A',
  primaryDark:      '#9B6070',
  primaryLight:     'rgba(196,136,154,0.12)',
  primaryBorder:    'rgba(196,136,154,0.2)',
  primaryWarn:      '#7A4A30',
  primaryUrgent:    '#7A3030',

  sage:             '#7AB860',
  sageDark:         '#5A9840',
  sageLight:        'rgba(122,184,96,0.12)',
  heroAccent:       '#9DDCB0',

  personal:         '#1DB584',
  personalDark:     '#0B8060',
  personalLight:    'rgba(29,181,132,0.1)',
  personalBorder:   'rgba(29,181,132,0.2)',
  heroPersonal:     '#1A4A38',

  borderSubtle:     'rgba(180,90,110,0.15)',
  borderMedium:     'rgba(180,90,110,0.25)',
  border:           'rgba(180,90,110,0.3)',
  separator:        'rgba(240,200,210,0.07)',

  card:             '#1C0E14',
  cardSage:         'rgba(122,184,96,0.07)',
  cardPersonal:     'rgba(29,181,132,0.06)',
  cardHero:         '#3D1520',

  navBackground:    '#0A0509',
  navText:          '#E8D5DC',
  navDot:           '#C4889A',
  navInactive:      'rgba(232,213,220,0.3)',

  heroBackground:   '#3D1520',
  heroBadge:        'rgba(90,150,100,0.2)',
  heroBadgeText:    '#9DDCB0',
  heroDivider:      'rgba(255,255,255,0.08)',
  heroNumDim:       'rgba(255,255,255,0.18)',
  heroLabelColor:   'rgba(240,200,210,0.35)',
  heroNameColor:    'rgba(240,200,210,0.5)',

  heroOk:           '#9DDCB0',
  heroWarn:         '#FFCBA4',
  heroUrgent:       '#FFBCB0',

  success:          '#7AB860',
  successLight:     'rgba(122,184,96,0.12)',
  warning:          '#7A4A30',
  warningLight:     'rgba(122,74,48,0.12)',
  danger:           '#7A3030',
  dangerLight:      'rgba(122,48,48,0.12)',
  shadow:           'rgba(0,0,0,0.3)',
} as const;

export type ColorPalette = { [K in keyof typeof paletteClaro]: string };
