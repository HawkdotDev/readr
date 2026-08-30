import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import { ParsedChapter } from '../../services/reader/epubParser';
import { progressTracker } from '../../services/reader/progressTracker';
import { ChevronLeft, ChevronRight, BookOpen, Highlighter } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface EpubReaderProps {
  bookId: string;
  chapters: ParsedChapter[];
  initialChapterIndex?: number;
  onToggleChrome: () => void;
  onSelectWordForDictionary: (word: string) => void;
}

export const EpubReader: React.FC<EpubReaderProps> = ({
  bookId,
  chapters,
  initialChapterIndex = 0,
  onToggleChrome,
  onSelectWordForDictionary,
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

  // Convert HTML / Paragraph content into formatted interactive text blocks
  const renderChapterContent = useMemo(() => {
    if (!currentChapter) return null;

    const rawParagraphs = currentChapter.content
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '###H1###$1###END###\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '###H2###$1###END###\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    return rawParagraphs.map((para, pIdx) => {
      if (para.startsWith('###H1###')) {
        const text = para.replace('###H1###', '').replace('###END###', '').trim();
        return (
          <Text
            key={`h1_${pIdx}`}
            style={[
              styles.chapterHeading,
              {
                color: colors.textPrimary,
                fontSize: fontSize * 1.45,
                lineHeight: fontSize * 1.8,
                textAlign,
              },
            ] as any}
          >
            {text}
          </Text>
        );
      }

      if (para.startsWith('###H2###')) {
        const text = para.replace('###H2###', '').replace('###END###', '').trim();
        return (
          <Text
            key={`h2_${pIdx}`}
            style={[
              styles.subHeading,
              {
                color: colors.textPrimary,
                fontSize: fontSize * 1.2,
                lineHeight: fontSize * 1.5,
                textAlign,
              },
            ] as any}
          >
            {text}
          </Text>
        );
      }

      // Render paragraph words with tap/long-press dictionary triggers
      const words = para.split(/\s+/);

      return (
        <Text
          key={`p_${pIdx}`}
          style={[
            styles.paragraph,
            {
              color: colors.textPrimary,
              fontSize,
              lineHeight: fontSize * lineHeight,
              textAlign,
              fontFamily: fontFamily === 'System' ? undefined : fontFamily,
            },
          ] as any}
        >
          {words.map((w, wIdx) => (
            <Text
              key={`w_${pIdx}_${wIdx}`}
              onLongPress={() => onSelectWordForDictionary(w)}
              suppressHighlighting={true}
            >
              {w}{' '}
            </Text>
          ))}
        </Text>
      );
    });
  }, [currentChapter, fontSize, lineHeight, textAlign, fontFamily, colors]);

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
    <View style={[styles.container, { backgroundColor: colors.canvas }] as any}>
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
        {/* Center Tap Target for chrome toggle */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onToggleChrome}
          style={styles.tapArea as any}
        >
          {renderChapterContent}
        </TouchableOpacity>

        {/* Chapter Navigation Buttons */}
        <View style={[styles.navRow, { borderTopColor: colors.border }] as any}>
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
            ] as any}
          >
            <ChevronLeft size={18} color={colors.textPrimary} />
            <Text style={[styles.navBtnText, { color: colors.textPrimary }] as any}>Prev Chapter</Text>
          </TouchableOpacity>

          <Text style={[styles.chapterCounter, { color: colors.textSecondary }] as any}>
            {currentChapterIdx + 1} of {chapters.length}
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
            ] as any}
          >
            <Text style={[styles.navBtnText, { color: colors.textPrimary }] as any}>Next Chapter</Text>
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
    paddingTop: 28,
    paddingBottom: 80,
  },
  tapArea: {
    minHeight: SCREEN_HEIGHT * 0.7,
  },
  chapterHeading: {
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  subHeading: {
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 12,
  },
  paragraph: {
    marginBottom: 18,
    letterSpacing: -0.1,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
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
    fontSize: 13,
    fontWeight: '600',
  },
  chapterCounter: {
    fontSize: 12,
    fontWeight: '600',
  },
});
