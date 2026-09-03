import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { getBookclothPalette } from '../../utils/generativeCover';
import { FONTS } from '../../utils/typography';

export interface GenerativeEditorialCoverProps {
  title: string;
  author?: string;
  style?: ViewStyle;
  isCompact?: boolean;
}

/**
 * Procedural Generative Editorial Cover.
 * Transforms unjacketed books (TXT, MOBI, PDF, EPUBs with missing art) into collectible
 * classic cloth-bound editorial volumes with embossed framing and classic typography.
 */
export const GenerativeEditorialCover: React.FC<GenerativeEditorialCoverProps> = ({
  title,
  author,
  style,
  isCompact = false,
}) => {
  const palette = getBookclothPalette(title, author);
  const displayAuthor = author && author.trim() ? author.trim() : 'Classic Edition';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.bg },
        style,
      ]}
      accessible={true}
      accessibilityLabel={`Cover for ${title} by ${displayAuthor}`}
    >
      {/* 2.5px Left Spine Bound Sheen Overlay */}
      <View style={styles.spineSheen} pointerEvents="none" />

      {/* Embossed Inner Double-Rule Frame */}
      <View
        style={[
          styles.innerFrame,
          {
            borderColor: palette.innerBorder,
            padding: isCompact ? 6 : 10,
            margin: isCompact ? 5 : 8,
          },
        ]}
      >
        {/* Top Decorative Rule */}
        <View style={[styles.ornamentLine, { backgroundColor: palette.accent }]} />

        {/* Title Area */}
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.titleText,
              {
                color: palette.title,
                fontSize: isCompact ? 10.5 : 13,
                lineHeight: isCompact ? 13 : 17,
              },
            ]}
            numberOfLines={isCompact ? 2 : 4}
          >
            {title}
          </Text>
        </View>

        {/* Bottom Author */}
        <View style={styles.authorContainer}>
          <Text
            style={[
              styles.authorText,
              {
                color: palette.author,
                fontSize: isCompact ? 8 : 9.5,
              },
            ]}
            numberOfLines={1}
          >
            {displayAuthor.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  spineSheen: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 2,
  },
  innerFrame: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ornamentLine: {
    width: 18,
    height: 1.5,
    borderRadius: 1,
    opacity: 0.7,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginVertical: 4,
  },
  titleText: {
    fontFamily: FONTS.hubot.bold,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  authorContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 2,
  },
  authorText: {
    fontFamily: FONTS.mono.medium,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
});
