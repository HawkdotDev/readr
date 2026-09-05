import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Sparkles, BookOpen, Bookmark } from 'lucide-react-native';
import { LiteraryWord } from '../../services/editorial/literaryLexiconService';
import {
  SocialCardThemeConfig,
  SOCIAL_CARD_THEMES,
} from '../../services/share/socialPostService';
import { FONTS } from '../../utils/typography';

export type AspectRatioType = '9:16' | '1:1' | '16:9';

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
      aspectRatio = '1:1',
      showPhonetic = true,
      showExample = true,
      showEtymology = true,
      showWatermark = true,
      scale = 1,
    },
    ref
  ) => {
    const theme: SocialCardThemeConfig = SOCIAL_CARD_THEMES[themeId] || SOCIAL_CARD_THEMES.paper;

    // Calculate dimensions based on aspect ratio
    // Base width: 340px for comfortable preview
    const baseWidth = 340 * scale;
    let cardHeight = baseWidth; // 1:1
    if (aspectRatio === '9:16') {
      cardHeight = (baseWidth * 16) / 9;
    } else if (aspectRatio === '16:9') {
      cardHeight = (baseWidth * 9) / 16;
    }

    const isStory = aspectRatio === '9:16';
    const isBanner = aspectRatio === '16:9';

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
        {/* Inner Decorative Framing Rule */}
        <View
          style={[
            styles.innerFrame,
            {
              borderColor: theme.cardBorderColor,
            },
          ]}
        >
          {/* Header Eyebrow */}
          <View style={styles.headerRow}>
            <View style={styles.eyebrowLeft}>
              <Sparkles size={13 * scale} color={theme.accentColor} style={{ marginRight: 5 * scale }} />
              <Text
                style={[
                  styles.eyebrowText,
                  {
                    color: theme.accentColor,
                    fontSize: 10 * scale,
                  },
                ]}
              >
                WORD OF THE DAY
              </Text>
            </View>
            <Bookmark size={14 * scale} color={theme.secondaryTextColor} />
          </View>

          {/* Central Body Content */}
          <View
            style={[
              styles.centerContent,
              isStory && styles.centerContentStory,
              isBanner && styles.centerContentBanner,
            ]}
          >
            {/* Main Word */}
            <Text
              style={[
                styles.wordHeading,
                {
                  color: theme.primaryTextColor,
                  fontSize: (isBanner ? 26 : isStory ? 34 : 30) * scale,
                  lineHeight: (isBanner ? 32 : isStory ? 40 : 36) * scale,
                },
              ]}
              numberOfLines={2}
            >
              {literaryWord.word}
            </Text>

            {/* Phonetic & Part of Speech Badge */}
            {showPhonetic && (
              <View style={styles.metaRow}>
                <Text
                  style={[
                    styles.phoneticText,
                    {
                      color: theme.accentColor,
                      fontSize: 13 * scale,
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
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.posText,
                      {
                        color: theme.secondaryTextColor,
                        fontSize: 11 * scale,
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
                  fontSize: (isBanner ? 12 : isStory ? 15 : 13.5) * scale,
                  lineHeight: (isBanner ? 17 : isStory ? 22 : 20) * scale,
                  marginVertical: (isBanner ? 6 : 10) * scale,
                },
              ]}
              numberOfLines={isBanner ? 2 : 4}
            >
              {literaryWord.definition}
            </Text>

            {/* Literary Example Quote Box */}
            {showExample && !isBanner && (
              <View
                style={[
                  styles.quoteBox,
                  {
                    backgroundColor: theme.quoteBoxBg,
                    borderColor: theme.cardBorderColor,
                    padding: (isStory ? 14 : 10) * scale,
                    marginTop: (isStory ? 12 : 6) * scale,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.exampleQuote,
                    {
                      color: theme.primaryTextColor,
                      fontSize: (isStory ? 13 : 11.5) * scale,
                      lineHeight: (isStory ? 18 : 16) * scale,
                    },
                  ]}
                  numberOfLines={isStory ? 4 : 3}
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
            )}

            {/* Etymology / Word Origin */}
            {showEtymology && (
              <Text
                style={[
                  styles.etymologyText,
                  {
                    color: theme.secondaryTextColor,
                    fontSize: (isBanner ? 9.5 : 10.5) * scale,
                    marginTop: (isBanner ? 4 : 8) * scale,
                  },
                ]}
                numberOfLines={isBanner ? 1 : 2}
              >
                Origin: {literaryWord.etymology}
              </Text>
            )}
          </View>

          {/* Footer Watermark */}
          {showWatermark && (
            <View style={[styles.footerRow, { borderTopColor: theme.cardBorderColor }]}>
              <View style={styles.footerBrand}>
                <BookOpen size={11 * scale} color={theme.accentColor} style={{ marginRight: 5 * scale }} />
                <Text
                  style={[
                    styles.brandText,
                    {
                      color: theme.primaryTextColor,
                      fontSize: 10 * scale,
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
                    fontSize: 9.5 * scale,
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 6,
  },
  innerFrame: {
    flex: 1,
    margin: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
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
  centerContentStory: {
    justifyContent: 'center',
    paddingVertical: 14,
  },
  centerContentBanner: {
    justifyContent: 'center',
  },
  wordHeading: {
    fontFamily: FONTS.mona.extraBold,
    letterSpacing: -0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  phoneticText: {
    fontFamily: FONTS.mono.medium,
  },
  posBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
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
  quoteBox: {
    borderRadius: 12,
    borderWidth: 1,
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
    paddingTop: 8,
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
