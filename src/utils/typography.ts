import { TextStyle } from 'react-native';

export const FONTS = {
  // Font 1: Mona Sans (Industrial / Modern UI Sans & Display)
  mona: {
    regular: 'MonaSans-Regular',
    medium: 'MonaSans-Medium',
    semiBold: 'MonaSans-SemiBold',
    bold: 'MonaSans-Bold',
    extraBold: 'MonaSans-ExtraBold',
  },
  // Font 2: Hubot Sans (Geometric / High-Impact Companion Sans)
  hubot: {
    regular: 'HubotSans-Regular',
    medium: 'HubotSans-Medium',
    semiBold: 'HubotSans-SemiBold',
    bold: 'HubotSans-Bold',
    extraBold: 'HubotSans-ExtraBold',
  },
  // Font 3: Mona Sans Mono (Technical Overlines, Eyebrows, Code & Numbers)
  mono: {
    regular: 'MonaSansMono-Regular',
    medium: 'MonaSansMono-Medium',
    semiBold: 'MonaSansMono-SemiBold',
    bold: 'MonaSansMono-Bold',
  },
} as const;

export const APP_FONTS = {
  'MonaSans-Regular': require('../../assets/fonts/MonaSans-Regular.ttf'),
  'MonaSans-Medium': require('../../assets/fonts/MonaSans-Medium.ttf'),
  'MonaSans-SemiBold': require('../../assets/fonts/MonaSans-SemiBold.ttf'),
  'MonaSans-Bold': require('../../assets/fonts/MonaSans-Bold.ttf'),
  'MonaSans-ExtraBold': require('../../assets/fonts/MonaSans-ExtraBold.ttf'),

  'HubotSans-Regular': require('../../assets/fonts/HubotSans-Regular.ttf'),
  'HubotSans-Medium': require('../../assets/fonts/HubotSans-Medium.ttf'),
  'HubotSans-SemiBold': require('../../assets/fonts/HubotSans-SemiBold.ttf'),
  'HubotSans-Bold': require('../../assets/fonts/HubotSans-Bold.ttf'),
  'HubotSans-ExtraBold': require('../../assets/fonts/HubotSans-ExtraBold.ttf'),

  'MonaSansMono-Regular': require('../../assets/fonts/MonaSansMono-Regular.ttf'),
  'MonaSansMono-Medium': require('../../assets/fonts/MonaSansMono-Medium.ttf'),
  'MonaSansMono-SemiBold': require('../../assets/fonts/MonaSansMono-SemiBold.ttf'),
  'MonaSansMono-Bold': require('../../assets/fonts/MonaSansMono-Bold.ttf'),
};

/**
 * Standard typography presets matching the modern 3-font hierarchy:
 * 1. Overline / Eyebrow: MonaSansMono (uppercase, wide tracking)
 * 2. Display / Heading: MonaSans Bold / HubotSans Bold (tight tracking, punchy)
 * 3. Body / UI: MonaSans Regular / Medium (balanced legibility)
 */
export const typography: Record<string, TextStyle> = {
  // Eyebrow / Overline (Font 3: Mono uppercase)
  eyebrow: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  overline: {
    fontFamily: FONTS.mono.semiBold,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Display / Hero Headings (Font 1 & 2)
  heroDisplay: {
    fontFamily: FONTS.mona.bold,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  hubotDisplay: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  heading1: {
    fontFamily: FONTS.mona.bold,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.6,
  },
  heading2: {
    fontFamily: FONTS.mona.bold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  heading3: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.2,
  },

  // Card Titles & Subheadings
  cardTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  cardTitleHubot: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.2,
  },

  // Body & Paragraphs
  bodyLarge: {
    fontFamily: FONTS.mona.regular,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyMedium: {
    fontFamily: FONTS.mona.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySemiBold: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  bodySmallMedium: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    lineHeight: 16,
  },

  // Buttons & Labels
  button: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  buttonLarge: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    lineHeight: 20,
  },
  tabLabel: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11,
    lineHeight: 14,
  },

  // Numbers, Badges & Technical Indicators
  monoText: {
    fontFamily: FONTS.mono.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  monoBold: {
    fontFamily: FONTS.mono.bold,
    fontSize: 13,
    lineHeight: 18,
  },
  badgeText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
};
