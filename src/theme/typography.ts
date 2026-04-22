export const fontFamilies = {
  displayRegular: 'Fraunces_400Regular',
  displayMedium: 'Fraunces_500Medium',
  displaySemibold: 'Fraunces_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export type TypeStyle = {
  family: string;
  size: number;
  lineHeight: number;
  letterSpacing?: number;
};

export const type = {
  displayXL: {
    family: fontFamilies.displaySemibold,
    size: 44,
    lineHeight: 50,
    letterSpacing: -0.8,
  },
  displayL: {
    family: fontFamilies.displaySemibold,
    size: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  displayM: {
    family: fontFamilies.displayMedium,
    size: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  displayS: {
    family: fontFamilies.displayMedium,
    size: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  bodyL: {
    family: fontFamilies.body,
    size: 17,
    lineHeight: 24,
  },
  body: {
    family: fontFamilies.body,
    size: 15,
    lineHeight: 22,
  },
  bodySm: {
    family: fontFamilies.body,
    size: 13,
    lineHeight: 18,
  },
  label: {
    family: fontFamilies.bodyMedium,
    size: 14,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  button: {
    family: fontFamilies.bodySemibold,
    size: 16,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  overline: {
    family: fontFamilies.bodySemibold,
    size: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
  },
  numeric: {
    family: fontFamilies.bodySemibold,
    size: 18,
    lineHeight: 22,
  },
} satisfies Record<string, TypeStyle>;

export type TypeVariant = keyof typeof type;
