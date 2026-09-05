import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Sparkles, BookOpen, Bookmark } from 'lucide-react-native';
import { LiteraryWord } from '../../services/editorial/literaryLexiconService';
import {
  SocialCardThemeConfig,
  SOCIAL_CARD_THEMES,
} from '../../services/share/socialPostService';
import { FONTS } from '../../utils/typography';

export type AspectRatioType = '1:1' | '3:3.75' | '3:4';

export interface WordSocialCardProps {
  literaryWord: LiteraryWord;
  themeId?: 'paper' | 'obsidian' | 'bookcloth' | 'bento';
  aspectRatio?: AspectRatioType;
  showPhonetic?: boolean;
  showExample?: boolean;
  showEtymology?: boolean;
  showWatermark?: boolean;
  scale?: number;
}

export const WordSocialCard = React.forwardRef<View, WordSocialCardProps>(
  (
    {
      literaryWord,
      themeId = 'paper',
      aspectRatio = '3:3.75',
      showPhonetic = true,
      showExample = true,
      showEtymology = true,
      showWatermark = true,
      scale = 1,
    },
    ref
  ) => {
    const theme: SocialCardThemeConfig = SOCIAL_CARD_THEMES[themeId] || SOCIAL_CARD_THEMES.paper;

    // Base width: 340px
    const baseWidth = 340 * scale;
    let cardHeight = baseWidth; // 1:1
    if (aspectRatio === '3:4') {
      cardHeight = Math.round((baseWidth * 4) / 3); // 453px
    } else if (aspectRatio === '3:3.75') {
      cardHeight = Math.round((baseWidth * 3.75) / 3); // 425px
    }

    const isTall = aspectRatio === '3:4';
    const isMedium = aspectRatio === '3:3.75';
    const isPortrait = isTall || isMedium;

    // Proportional styling scalars
    const frameMargin = (isTall ? 10 : isMedium ? 8 : 6) * scale;
    const framePadding = (isTall ? 16 : isMedium ? 14 : 12) * scale;
    const wordFontSize = (isTall ? 32 : isMedium ? 28 : 24) * scale;
    const wordLineHeight = (isTall ? 38 : isMedium ? 33 : 28) * scale;
    const defFontSize = (isTall ? 13.5 : isMedium ? 13 : 12) * scale;
    const defLineHeight = (isTall ? 20 : isMedium ? 18.5 : 16.5) * scale;
    const defMarginY = (isTall ? 10 : isMedium ? 8 : 5) * scale;

    return (
      <View
        ref={ref}
        collapsable={false}
        style={[
          styles.cardContainer,
          {
            width: baseWidth,
            height: cardHeight,
            backgroundColor: theme.backgroundColor,
            borderColor: theme.cardBorderColor,
          },
        ]}
      >
        {/* Inner Framing Rule */}
        <View
          style={[
            styles.innerFrame,
            {
              margin: frameMargin,
              padding: framePadding,
              borderColor: theme.cardBorderColor,
            },
          ]}
        >
          {/* Header Eyebrow */}
          <View style={[styles.headerRow, { paddingBottom: (isPortrait ? 8 : 4) * scale }]}>
            <View style={styles.eyebrowLeft}>
              <Sparkles size={(isPortrait ? 13 : 11) * scale} color={theme.accentColor} style={{ marginRight: 5 * scale }} />
              <Text
                style={[
                  styles.eyebrowText,
                  {
                    color: theme.accentColor,
                    fontSize: (isPortrait ? 10 : 9) * scale,
                  },
                ]}
              >
                WORD OF THE DAY
              </Text>
            </View>
            <Bookmark size={(isPortrait ? 13 : 11) * scale} color={theme.secondaryTextColor} />
          </View>

          {/* Central Body Content */}
          <View
            style={[
              styles.centerContent,
              isPortrait ? styles.centerContentPortrait : styles.centerContentSquare,
            ]}
          >
            {/* Main Word */}
            <Text
              style={[
                styles.wordHeading,
                {
                  color: theme.primaryTextColor,
                  fontSize: wordFontSize,
                  lineHeight: wordLineHeight,
                },
              ]}
              numberOfLines={2}
            >
              {literaryWord.word}
            </Text>

            {/* Phonetic & Part of Speech Badge */}
            {showPhonetic && (
              <View style={[styles.metaRow, { marginTop: (isPortrait ? 5 : 3) * scale }]}>
                <Text
                  style={[
                    styles.phoneticText,
                    {
                      color: theme.accentColor,
                      fontSize: (isPortrait ? 12.5 : 11.5) * scale,
                    },
                  ]}
                >
                  {literaryWord.phonetic}
                </Text>
                <View
                  style={[
                    styles.posBadge,
                    {
                      backgroundColor: theme.badgeBg,
                      borderColor: theme.badgeBorder,
                      paddingHorizontal: (isPortrait ? 7 : 5) * scale,
                      paddingVertical: 1.5 * scale,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.posText,
                      {
                        color: theme.secondaryTextColor,
                        fontSize: (isPortrait ? 10 : 9) * scale,
                      },
                    ]}
                  >
                    {literaryWord.partOfSpeech}
                  </Text>
                </View>
              </View>
            )}

            {/* Definition */}
            <Text
              style={[
                styles.definitionText,
                {
                  color: theme.primaryTextColor,
                  fontSize: defFontSize,
                  lineHeight: defLineHeight,
                  marginVertical: defMarginY,
                },
              ]}
              numberOfLines={isPortrait ? 4 : 3}
            >
              {literaryWord.definition}
            </Text>

            {/* Literary Example Quote */}
            {showExample && (
              isPortrait ? (
                // Portrait (3:4 & 3:3.75): Padded Callout Card
                <View
                  style={[
                    styles.quoteBoxPortrait,
                    {
                      backgroundColor: theme.quoteBoxBg,
                      borderColor: theme.cardBorderColor,
                      padding: (isTall ? 12 : 10) * scale,
                      marginTop: (isTall ? 8 : 6) * scale,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.exampleQuote,
                      {
                        color: theme.primaryTextColor,
                        fontSize: (isTall ? 12 : 11.5) * scale,
                        lineHeight: (isTall ? 17 : 16) * scale,
                      },
                    ]}
                    numberOfLines={isTall ? 4 : 3}
                  >
                    "{literaryWord.literaryExample}"
                  </Text>
                  <Text
                    style={[
                      styles.citationText,
                      {
                        color: theme.secondaryTextColor,
                        fontSize: 10 * scale,
                        marginTop: 4 * scale,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    — {literaryWord.citation}
                  </Text>
                </View>
              ) : (
                // 1:1 Square: Airy literary blockquote border
                <View
                  style={[
                    styles.quoteBoxSquare,
                    {
                      borderLeftColor: theme.accentColor,
                      borderLeftWidth: 2.5 * scale,
                      paddingLeft: 8 * scale,
                      marginTop: 4 * scale,
                      marginVertical: 2 * scale,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.exampleQuote,
                      {
                        color: theme.primaryTextColor,
                        fontSize: 11 * scale,
                        lineHeight: 15 * scale,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    "{literaryWord.literaryExample}"
                  </Text>
                  <Text
                    style={[
                      styles.citationText,
                      {
                        color: theme.secondaryTextColor,
                        fontSize: 9.5 * scale,
                        marginTop: 2 * scale,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    — {literaryWord.citation}
                  </Text>
                </View>
              )
            )}

            {/* Etymology / Word Origin */}
            {showEtymology && (
              <Text
                style={[
                  styles.etymologyText,
                  {
                    color: theme.secondaryTextColor,
                    fontSize: (isPortrait ? 10.5 : 9.5) * scale,
                    marginTop: (isPortrait ? 7 : 4) * scale,
                  },
                ]}
                numberOfLines={isPortrait ? 2 : 1}
              >
                Origin: {literaryWord.etymology}
              </Text>
            )}
          </View>

          {/* Footer Watermark */}
          {showWatermark && (
            <View
              style={[
                styles.footerRow,
                {
                  borderTopColor: theme.cardBorderColor,
                  paddingTop: (isPortrait ? 8 : 5) * scale,
                },
              ]}
            >
              <View style={styles.footerBrand}>
                <BookOpen size={(isPortrait ? 11 : 9.5) * scale} color={theme.accentColor} style={{ marginRight: 4 * scale }} />
                <Text
                  style={[
                    styles.brandText,
                    {
                      color: theme.primaryTextColor,
                      fontSize: (isPortrait ? 10 : 9) * scale,
                    },
                  ]}
                >
                  READR
                </Text>
              </View>
              <Text
                style={[
                  styles.watermarkTagline,
                  {
                    color: theme.watermarkColor,
                    fontSize: (isPortrait ? 9.5 : 8.5) * scale,
                  },
                ]}
              >
                The Distraction-Free Reader
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }
);

WordSocialCard.displayName = 'WordSocialCard';

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  innerFrame: {
    flex: 1,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyebrowText: {
    fontFamily: FONTS.mono.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  centerContentPortrait: {
    paddingVertical: 6,
  },
  centerContentSquare: {
    paddingVertical: 2,
  },
  wordHeading: {
    fontFamily: FONTS.mona.extraBold,
    letterSpacing: -0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneticText: {
    fontFamily: FONTS.mono.medium,
  },
  posBadge: {
    borderRadius: 8,
    borderWidth: 1,
  },
  posText: {
    fontFamily: FONTS.mona.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  definitionText: {
    fontFamily: FONTS.mona.medium,
    letterSpacing: -0.2,
  },
  quoteBoxPortrait: {
    borderRadius: 12,
    borderWidth: 1,
  },
  quoteBoxSquare: {
    backgroundColor: 'transparent',
  },
  exampleQuote: {
    fontFamily: FONTS.mona.regular,
    fontStyle: 'italic',
  },
  citationText: {
    fontFamily: FONTS.mona.medium,
    textAlign: 'right',
  },
  etymologyText: {
    fontFamily: FONTS.mona.regular,
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontFamily: FONTS.mona.bold,
    letterSpacing: 1.2,
  },
  watermarkTagline: {
    fontFamily: FONTS.mona.regular,
    letterSpacing: 0.2,
  },
});
