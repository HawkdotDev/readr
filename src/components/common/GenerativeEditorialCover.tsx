import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { getBookclothPalette, getCoverMotif, CoverMotif } from '../../utils/generativeCover';
import { FONTS } from '../../utils/typography';
import { BookOpen, Compass, Feather, Award, Sparkles, Music2 } from 'lucide-react-native';

export interface GenerativeEditorialCoverProps {
  title?: string;
  author?: string;
  style?: ViewStyle;
  isCompact?: boolean;
}

/**
 * Procedural Generative Editorial Cover.
 * Transforms unjacketed books (TXT, MOBI, PDF, EPUBs with missing art) into collectible
 * classic cloth-bound editorial volumes with embossed framing, insignia, and classic typography.
 */
export const GenerativeEditorialCover: React.FC<GenerativeEditorialCoverProps> = ({
  title = 'Untitled',
  author,
  style,
  isCompact = false,
}) => {
  const displayTitle = title && title.trim() ? title.trim() : 'Untitled';
  const palette = getBookclothPalette(displayTitle, author);
  const motif: CoverMotif = getCoverMotif(displayTitle, author);
  const displayAuthor = author && author.trim() ? author.trim() : 'Classic Edition';
  const firstLetter = displayTitle.charAt(0).toUpperCase() || 'B';

  const renderMotifIcon = () => {
    const iconSize = isCompact ? 13 : 18;
    const iconColor = palette.accent;

    switch (motif) {
      case 'laurel':
        return <Award size={iconSize} color={iconColor} strokeWidth={1.75} />;
      case 'compass':
        return <Compass size={iconSize} color={iconColor} strokeWidth={1.75} />;
      case 'quills':
        return <Feather size={iconSize} color={iconColor} strokeWidth={1.75} />;
      case 'lyre':
        return <Music2 size={iconSize} color={iconColor} strokeWidth={1.75} />;
      case 'owl':
        return <Sparkles size={iconSize} color={iconColor} strokeWidth={1.75} />;
      case 'book':
        return <BookOpen size={iconSize} color={iconColor} strokeWidth={1.75} />;
      case 'monogram':
      default:
        return (
          <View style={[styles.monogramRing, { borderColor: palette.accent }]}>
            <Text style={[styles.monogramText, { color: palette.accent }]}>{firstLetter}</Text>
          </View>
        );
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.bg },
        style,
      ]}
      accessible={true}
      accessibilityLabel={`Cover for ${displayTitle} by ${displayAuthor}`}
    >
      {/* Left Spine Bound Sheen Overlay */}
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
            {displayTitle}
          </Text>
        </View>

        {/* Center Insignia Crest */}
        <View style={styles.motifContainer}>
          {renderMotifIcon()}
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
    width: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 2,
  },
  innerFrame: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ornamentLine: {
    width: 24,
    height: 1.5,
    borderRadius: 1,
    marginTop: 2,
    opacity: 0.85,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  titleText: {
    fontFamily: FONTS.hubot.bold,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  motifContainer: {
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  monogramRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 10,
  },
  authorContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  authorText: {
    fontFamily: FONTS.mono.medium,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
