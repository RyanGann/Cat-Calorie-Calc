export const palette = {
  canvas: '#FAF6F0',
  surface: '#FFFFFF',
  ink: '#1C1916',
  ink2: '#6B625A',
  ink3: '#A89E94',
  hairline: '#EDE6DC',
  biscuit: '#E89B5A',
  biscuitSoft: '#F6D4B3',
  biscuitDeep: '#C47B3F',
  sage: '#8DA588',
  sageSoft: '#C8D4C5',
  blush: '#E8A4A4',
  blushSoft: '#F3CDCD',
  honey: '#E6B84D',
  brick: '#C25A4F',
  brickSoft: '#EBB5AE',
} as const;

export type ColorScheme = {
  canvas: string;
  surface: string;
  surfaceAlt: string;
  hairline: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  accentSoft: string;
  accentDeep: string;
  success: string;
  successSoft: string;
  wet: string;
  wetSoft: string;
  warn: string;
  error: string;
  errorSoft: string;
  onAccent: string;
  scrim: string;
};

export const lightColors: ColorScheme = {
  canvas: palette.canvas,
  surface: palette.surface,
  surfaceAlt: '#F4EEE3',
  hairline: palette.hairline,
  text: palette.ink,
  textMuted: palette.ink2,
  textSubtle: palette.ink3,
  accent: palette.biscuit,
  accentSoft: palette.biscuitSoft,
  accentDeep: palette.biscuitDeep,
  success: palette.sage,
  successSoft: palette.sageSoft,
  wet: palette.blush,
  wetSoft: palette.blushSoft,
  warn: palette.honey,
  error: palette.brick,
  errorSoft: palette.brickSoft,
  onAccent: '#FFFFFF',
  scrim: 'rgba(28,25,22,0.45)',
};

export const darkColors: ColorScheme = {
  canvas: '#17130F',
  surface: '#221D18',
  surfaceAlt: '#2B2521',
  hairline: '#2E2823',
  text: '#F2EDE4',
  textMuted: '#B8AEA3',
  textSubtle: '#847A70',
  accent: '#F0A869',
  accentSoft: '#4A3420',
  accentDeep: '#C47B3F',
  success: '#A1B89C',
  successSoft: '#2F3B2D',
  wet: '#F0B6B6',
  wetSoft: '#3D2828',
  warn: '#F0C766',
  error: '#D47268',
  errorSoft: '#3B2320',
  onAccent: '#1C1916',
  scrim: 'rgba(0,0,0,0.55)',
};

