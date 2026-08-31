import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import { ParsedChapter } from '../../services/reader/epubParser';
import { parseChapterContent } from '../../services/reader/epubBridge';
import { progressTracker } from '../../services/reader/progressTracker';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface EpubReaderProps {
  bookId: string;
  chapters: ParsedChapter[];
  initialChapterIndex?: number;
  onToggleChrome: () => void;
  onSelectWordForDictionary: (word: string) => void;
  onOpenAnnotations?: () => void;
}

export const EpubReader: React.FC<EpubReaderProps> = ({
  bookId,
  chapters,
  initialChapterIndex = 0,
  onToggleChrome,
  onSelectWordForDictionary,
  onOpenAnnotations,
}) => {
  const { colors } = useTheme();
  const [currentChapterIdx, setCurrentChapterIdx] = useState(initialChapterIndex);
  const scrollRef = useRef<any>(null);

  const {
    fontFamily,
    fontSize,
    lineHeight,
    marginHorizontal,
    textAlign,
    setCurrentChapter,
    setLocation,
  } = useReaderStore();

  const currentChapter = chapters[currentChapterIdx] || chapters[0];

  useEffect(() => {
    if (currentChapter) {
      setCurrentChapter(currentChapterIdx, currentChapter.title);
      // Calculate approximate progress
      const progress = chapters.length > 0 ? ((currentChapterIdx + 1) / chapters.length) * 100 : 0;
      const minutesLeft = progressTracker.calculateMinutesLeft(currentChapter.wordCount || 300);
      setLocation(`chap_${currentChapterIdx}`, progress, minutesLeft);
      progressTracker.recordProgress(bookId, `chap_${currentChapterIdx}`, progress);
    }
  }, [currentChapterIdx, chapters]);

  const handleNextChapter = () => {
    if (currentChapterIdx < chapters.length - 1) {
      setCurrentChapterIdx((prev) => prev + 1);
      scrollRef.current?.scrollTo?.({ y: 0, animated: true });
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIdx > 0) {
      setCurrentChapterIdx((prev) => prev - 1);
      scrollRef.current?.scrollTo?.({ y: 0, animated: true });
    }
  };

  // Extract clean display title
  const displayTitle = useMemo(() => {
    if (!currentChapter) return 'Beginning';
    const raw = currentChapter.title || `Chapter ${currentChapterIdx + 1}`;
    return raw.replace(/^chapter\s*\d+[:.\s-]*/i, '').trim() || raw;
  }, [currentChapter, currentChapterIdx]);

  // Convert HTML / Paragraph content into formatted interactive text blocks
  const renderChapterContent = useMemo(() => {
    if (!currentChapter) return null;

    const blocks = parseChapterContent(currentChapter.content);

    return blocks.map((block, bIdx) => {
      if (block.type === 'h1') {
        return (
          <Text
            key={`h1_${bIdx}`}
            style={[
              styles.subHeading,
              {
                color: colors.textPrimary,
                fontSize: fontSize * 1.35,
                lineHeight: fontSize * 1.7,
                textAlign,
                fontFamily: fontFamily === 'System' ? undefined : fontFamily,
              },
            ]}
          >
            {block.text}
          </Text>
        );
      }

      if (block.type === 'h2') {
        return (
          <Text
            key={`h2_${bIdx}`}
            style={[
              styles.subHeading,
              {
                color: colors.textPrimary,
                fontSize: fontSize * 1.18,
                lineHeight: fontSize * 1.5,
                textAlign,
                fontFamily: fontFamily === 'System' ? undefined : fontFamily,
              },
            ]}
          >
            {block.text}
          </Text>
        );
      }

      const words = block.words || block.text.split(/\s+/);

      // Check if block has highlighted style (e.g. quote / first paragraph block)
      const isQuoteHighlight = bIdx === 0 && block.text.length > 20 && block.text.length < 240;

      return (
        <View
          key={`p_${bIdx}`}
          style={[
            styles.paragraphWrapper,
            isQuoteHighlight && [
              styles.highlightQuoteBox,
              { backgroundColor: colors.isDark ? 'rgba(234, 179, 8, 0.16)' : 'rgba(254, 240, 138, 0.45)' },
            ],
          ]}
        >
          <Text
            style={[
              styles.paragraph,
              {
                color: colors.textPrimary,
                fontSize,
                lineHeight: fontSize * lineHeight,
                textAlign,
                fontFamily: fontFamily === 'System' ? undefined : fontFamily,
              },
            ]}
          >
            {words.map((w, wIdx) => (
              <Text
                key={`w_${bIdx}_${wIdx}`}
                onLongPress={() => onSelectWordForDictionary(w)}
                suppressHighlighting={true}
              >
                {w}{' '}
              </Text>
            ))}
          </Text>
        </View>
      );
    });
  }, [currentChapter, fontSize, lineHeight, textAlign, fontFamily, colors, onSelectWordForDictionary]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const totalScrollable = contentSize.height - layoutMeasurement.height;
    if (totalScrollable > 0) {
      const scrollPercent = Math.max(0, Math.min(1, contentOffset.y / totalScrollable));
      const baseProgress = (currentChapterIdx / Math.max(1, chapters.length)) * 100;
      const chapterWeight = (1 / Math.max(1, chapters.length)) * 100;
      const totalProgress = baseProgress + scrollPercent * chapterWeight;
      progressTracker.recordProgress(bookId, `chap_${currentChapterIdx}_pos_${Math.round(contentOffset.y)}`, totalProgress);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingHorizontal: marginHorizontal,
          },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={200}
      >
        {/* Editorial Chapter Header (CHAPTER X | Title | Divider) */}
        <View style={styles.headerBlock}>
          <Text style={[styles.chapterKicker, { color: colors.textSecondary }]}>
            CHAPTER {currentChapterIdx + 1}
          </Text>
          <Text
            style={[
              styles.chapterHeroTitle,
              {
                color: colors.textPrimary,
                fontFamily: fontFamily === 'System' ? FONTS.mona.bold : fontFamily,
              },
            ]}
          >
            {displayTitle}
          </Text>
          <View style={[styles.dividerBar, { backgroundColor: colors.border }]} />
        </View>

        {/* Center Tap Target for chrome toggle */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onToggleChrome}
          style={styles.tapArea}
        >
          {renderChapterContent}

          {/* Floating Highlights Action Pill */}
          {onOpenAnnotations && (
            <TouchableOpacity
              onPress={onOpenAnnotations}
              style={[
                styles.highlightsPill,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              accessible={true}
              accessibilityLabel="View Highlights and Notes"
            >
              <Sparkles size={13} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.highlightsPillText, { color: colors.textSecondary }]}>
                Highlights
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Chapter Navigation Buttons */}
        <View style={[styles.navRow, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={handlePrevChapter}
            disabled={currentChapterIdx === 0}
            style={[
              styles.navBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: currentChapterIdx === 0 ? 0.3 : 1,
              },
            ]}
          >
            <ChevronLeft size={18} color={colors.textPrimary} />
            <Text style={[styles.navBtnText, { color: colors.textPrimary }]}>Prev Chapter</Text>
          </TouchableOpacity>

          <Text style={[styles.chapterCounter, { color: colors.textSecondary }]}>
            {currentChapterIdx + 1} of {chapters.length || 1}
          </Text>

          <TouchableOpacity
            onPress={handleNextChapter}
            disabled={currentChapterIdx >= chapters.length - 1}
            style={[
              styles.navBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: currentChapterIdx >= chapters.length - 1 ? 0.3 : 1,
              },
            ]}
          >
            <Text style={[styles.navBtnText, { color: colors.textPrimary }]}>Next Chapter</Text>
            <ChevronRight size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  chapterKicker: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chapterHeroTitle: {
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  dividerBar: {
    width: 28,
    height: 2,
    borderRadius: 1,
    marginTop: 14,
    marginBottom: 10,
  },
  tapArea: {
    minHeight: SCREEN_HEIGHT * 0.65,
  },
  paragraphWrapper: {
    marginBottom: 16,
  },
  highlightQuoteBox: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  subHeading: {
    fontFamily: FONTS.mona.bold,
    marginTop: 18,
    marginBottom: 12,
  },
  paragraph: {
    letterSpacing: -0.1,
  },
  highlightsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  highlightsPillText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  navBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
    letterSpacing: -0.1,
  },
  chapterCounter: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
  },
});
