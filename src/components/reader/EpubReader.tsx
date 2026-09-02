import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  GestureResponderEvent,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import { ParsedChapter } from '../../services/reader/epubParser';
import { parseChapterContent } from '../../services/reader/epubBridge';
import { progressTracker } from '../../services/reader/progressTracker';
import { ReadingRuler } from './ReadingRuler';
import { AutoScrollController } from './AutoScrollController';
import { SpeedometerOverlay } from './SpeedometerOverlay';
import { EdgeBrightnessGesture } from './EdgeBrightnessGesture';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import { getFixationLength } from '../../utils/bionic';
import { applyNameReplacements } from '../../utils/nameReplacer';
import { resolveActionForTap } from '../../services/reader/touchZoneService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface EpubReaderProps {
  bookId: string;
  chapters: ParsedChapter[];
  activeChapterIndex?: number;
  onChapterChange?: (newIndex: number) => void;
  onToggleChrome: () => void;
  onSelectWordForDictionary: (word: string) => void;
  onOpenAnnotations?: () => void;
}

export const EpubReader: React.FC<EpubReaderProps> = ({
  bookId,
  chapters,
  activeChapterIndex = 0,
  onChapterChange,
  onToggleChrome,
  onSelectWordForDictionary,
  onOpenAnnotations,
}) => {
  const { colors } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [currentChapterIdx, setCurrentChapterIdx] = useState(activeChapterIndex);
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffsetRef = useRef<number>(0);

  // Smooth Chapter Transition Animation
  const chapterAnim = useRef(new Animated.Value(1)).current;

  const {
    fontFamily,
    fontSize,
    lineHeight,
    marginHorizontal,
    textAlign,
    readingDirection,
    navigationMode,
    paragraphIndent,
    paragraphSpacing,
    dropCaps,
    dualPageMode,
    bionicReadingEnabled,
    bionicFixation,
    readingRulerEnabled,
    readingRulerMode,
    readingRulerHeight,
    readingRulerOpacity,
    touchZoneMappings,
    edgeBrightnessEnabled,
    nameReplacements,
    setBrightness,
    setReadingRulerEnabled,
    setBionicReadingEnabled,
    toggleAutoScroll,
    setActiveSheet,
    setCurrentChapter,
    setLocation,
  } = useReaderStore();

  const isDualPageActive =
    dualPageMode === true || (dualPageMode === 'auto' && windowWidth >= 640);

  // Synchronize when parent changes activeChapterIndex (e.g. from TOC or Search)
  useEffect(() => {
    if (
      activeChapterIndex !== undefined &&
      activeChapterIndex !== currentChapterIdx &&
      activeChapterIndex >= 0 &&
      activeChapterIndex < chapters.length
    ) {
      animateToChapter(activeChapterIndex);
    }
  }, [activeChapterIndex]);

  const currentChapter = chapters[currentChapterIdx] || chapters[0];

  useEffect(() => {
    if (currentChapter) {
      setCurrentChapter(currentChapterIdx, currentChapter.title);
      const progress =
        chapters.length > 0
          ? ((currentChapterIdx + 1) / chapters.length) * 100
          : 0;
      const minutesLeft = progressTracker.calculateMinutesLeft(
        currentChapter.wordCount || 300
      );
      setLocation(`chap_${currentChapterIdx}`, progress, minutesLeft);
      progressTracker.recordProgress(
        bookId,
        `chap_${currentChapterIdx}`,
        progress
      );
    }
  }, [currentChapterIdx, chapters]);

  // Smooth transition animation when changing chapters
  const animateToChapter = (newIndex: number) => {
    Animated.sequence([
      Animated.timing(chapterAnim, {
        toValue: 0,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(chapterAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentChapterIdx(newIndex);
    if (onChapterChange) {
      onChapterChange(newIndex);
    }
    scrollRef.current?.scrollTo?.({ y: 0, animated: false });
  };

  const handleNextChapter = () => {
    if (currentChapterIdx < chapters.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      animateToChapter(currentChapterIdx + 1);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIdx > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      animateToChapter(currentChapterIdx - 1);
    }
  };

  // Touch Gesture Tracking for Tap & Swipe Page Turn
  const touchStartRef = useRef<{ time: number; x: number; y: number }>({
    time: 0,
    x: 0,
    y: 0,
  });
  const lastTapRef = useRef<number>(0);

  const handleTouchStart = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    touchStartRef.current = { time: Date.now(), x: pageX, y: pageY };
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    const now = Date.now();
    const duration = now - touchStartRef.current.time;
    const deltaX = pageX - touchStartRef.current.x;
    const deltaY = pageY - touchStartRef.current.y;
    const dist = Math.hypot(deltaX, deltaY);

    // 1. Horizontal Swipe Gesture (Swipe left -> Next, Swipe right -> Prev)
    if (duration < 380 && Math.abs(deltaX) > 55 && Math.abs(deltaY) < 45) {
      if (deltaX < 0) {
        handleNextChapter();
      } else {
        handlePrevChapter();
      }
      return;
    }

    // 2. Stationary Tap (duration < 280ms and moved < 12px)
    if (duration < 280 && dist < 12) {
      if (lastTapRef.current && now - lastTapRef.current < 320) {
        // Double Tap -> Toggle Chrome
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onToggleChrome();
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
        // Resolve 9-Zone touch mapping
        const { action } = resolveActionForTap(
          pageX,
          pageY,
          windowWidth,
          windowHeight,
          touchZoneMappings
        );

        switch (action) {
          case 'nextPage':
            handleNextChapter();
            break;
          case 'prevPage':
            handlePrevChapter();
            break;
          case 'toggleChrome':
            onToggleChrome();
            break;
          case 'autoScroll':
            toggleAutoScroll();
            break;
          case 'readingRuler':
            setReadingRulerEnabled(!readingRulerEnabled);
            break;
          case 'bionic':
            setBionicReadingEnabled(!bionicReadingEnabled);
            break;
          case 'tts':
            setActiveSheet('tts');
            break;
          case 'search':
            setActiveSheet('search');
            break;
          default:
            break;
        }
      }
    }
  };

  // Total story body chapters (excluding front-matter)
  const totalStoryChapters = useMemo(() => {
    const storyChaps = chapters.filter((c) => !c.isFrontMatter);
    return storyChaps.length > 0 ? storyChaps.length : chapters.length;
  }, [chapters]);

  // Clean formatted display title
  const displayTitle = useMemo(() => {
    if (!currentChapter) return 'Beginning';
    const raw = currentChapter.title || `Chapter ${currentChapterIdx + 1}`;
    // Strip leading "Chapter X[:.] " or Roman numerals "Chapter I[:.] " or "Book I[:.] "
    const clean =
      raw
        .replace(/^(?:chapter|chap\.?|book|part|letter)\s*(?:[0-9]+|[ivxlcdm]+)[:.\s-]*/i, '')
        .trim() || raw;
    return applyNameReplacements(clean, nameReplacements);
  }, [currentChapter, currentChapterIdx, nameReplacements]);

  // Convert HTML / Paragraph content into formatted interactive text blocks
  const renderChapterContent = useMemo(() => {
    if (!currentChapter) return null;

    const blocks = parseChapterContent(currentChapter.content);

    return blocks.map((block, bIdx) => {
      const processedBlockText = applyNameReplacements(
        block.text,
        nameReplacements
      );

      if (block.type === 'h1') {
        return (
          <Text
            key={`h1_${bIdx}`}
            style={[
              styles.heading1,
              {
                color: colors.textPrimary,
                fontSize: fontSize * 1.38,
                lineHeight: fontSize * 1.7,
                textAlign,
                fontFamily:
                  fontFamily === 'System' ? FONTS.mona.bold : fontFamily,
              },
            ]}
          >
            {processedBlockText}
          </Text>
        );
      }

      if (block.type === 'h2') {
        return (
          <Text
            key={`h2_${bIdx}`}
            style={[
              styles.heading2,
              {
                color: colors.textPrimary,
                fontSize: fontSize * 1.2,
                lineHeight: fontSize * 1.5,
                textAlign,
                fontFamily:
                  fontFamily === 'System' ? FONTS.mona.bold : fontFamily,
              },
            ]}
          >
            {processedBlockText}
          </Text>
        );
      }

      if (block.type === 'h3') {
        return (
          <Text
            key={`h3_${bIdx}`}
            style={[
              styles.heading3,
              {
                color: colors.textPrimary,
                fontSize: fontSize * 1.08,
                lineHeight: fontSize * 1.4,
                textAlign,
                fontFamily:
                  fontFamily === 'System' ? FONTS.mona.bold : fontFamily,
              },
            ]}
          >
            {processedBlockText}
          </Text>
        );
      }

      if (block.type === 'blockquote') {
        return (
          <View
            key={`bq_${bIdx}`}
            style={[
              styles.blockquoteWrapper,
              {
                borderLeftColor: colors.accent,
                backgroundColor: colors.isDark
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(0,0,0,0.03)',
              },
            ]}
          >
            <Text
              style={[
                styles.blockquoteText,
                {
                  color: colors.textSecondary,
                  fontSize: fontSize * 0.95,
                  lineHeight: fontSize * lineHeight,
                  textAlign,
                  fontFamily:
                    fontFamily === 'System' ? undefined : fontFamily,
                  fontStyle: 'italic',
                },
              ]}
            >
              {processedBlockText}
            </Text>
          </View>
        );
      }

      const words = block.words || processedBlockText.split(/\s+/).filter(Boolean);

      // Handle Drop Caps for the very first paragraph of chapter
      const shouldApplyDropCap =
        dropCaps && bIdx === 0 && words.length > 0 && words[0].length > 0;
      const firstLetter = shouldApplyDropCap ? words[0].charAt(0) : '';
      const restOfFirstWord = shouldApplyDropCap ? words[0].slice(1) : '';

      // First-line indentation for subsequent paragraphs
      const shouldIndent = paragraphIndent > 0 && bIdx > 0;

      return (
        <View
          key={`p_${bIdx}`}
          style={[
            styles.paragraphWrapper,
            {
              marginBottom: 14 * paragraphSpacing,
              paddingLeft: shouldIndent ? paragraphIndent * 14 : 0,
            },
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
            {bionicReadingEnabled ? (
              <>
                {shouldApplyDropCap && (
                  <Text
                    style={[
                      styles.dropCapLetter,
                      {
                        color: colors.accent,
                        fontSize: fontSize * 2.5,
                        lineHeight: fontSize * 2.7,
                        fontFamily:
                          fontFamily === 'System'
                            ? FONTS.mona.bold
                            : fontFamily,
                      },
                    ]}
                  >
                    {firstLetter}
                  </Text>
                )}
                {shouldApplyDropCap && restOfFirstWord
                  ? `${restOfFirstWord} `
                  : ''}
                {(shouldApplyDropCap ? words.slice(1) : words).map(
                  (w, wIdx) => {
                    if (w && w.trim().length > 0) {
                      const fixLen = getFixationLength(w.length, bionicFixation);
                      const boldPart = w.slice(0, fixLen);
                      const normalPart = w.slice(fixLen);
                      return (
                        <Text
                          key={`w_${bIdx}_${wIdx}`}
                          onLongPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            ).catch(() => {});
                            onSelectWordForDictionary(w);
                          }}
                          suppressHighlighting={true}
                        >
                          <Text
                            style={{
                              fontFamily: FONTS.mona.bold,
                              fontWeight: '700',
                            }}
                          >
                            {boldPart}
                          </Text>
                          {normalPart}{' '}
                        </Text>
                      );
                    }
                    return null;
                  }
                )}
              </>
            ) : shouldApplyDropCap ? (
              <>
                <Text
                  style={[
                    styles.dropCapLetter,
                    {
                      color: colors.accent,
                      fontSize: fontSize * 2.5,
                      lineHeight: fontSize * 2.7,
                      fontFamily:
                        fontFamily === 'System' ? FONTS.mona.bold : fontFamily,
                    },
                  ]}
                >
                  {firstLetter}
                </Text>
                {processedBlockText.slice(1)}
              </>
            ) : (
              processedBlockText
            )}
          </Text>
        </View>
      );
    });
  }, [
    currentChapter,
    fontSize,
    lineHeight,
    textAlign,
    fontFamily,
    paragraphIndent,
    paragraphSpacing,
    dropCaps,
    bionicReadingEnabled,
    bionicFixation,
    nameReplacements,
    colors,
    onSelectWordForDictionary,
  ]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    scrollOffsetRef.current = contentOffset.y;
    const totalScrollable = contentSize.height - layoutMeasurement.height;
    if (totalScrollable > 0) {
      const scrollPercent = Math.max(
        0,
        Math.min(1, contentOffset.y / totalScrollable)
      );
      const baseProgress =
        (currentChapterIdx / Math.max(1, chapters.length)) * 100;
      const chapterWeight = (1 / Math.max(1, chapters.length)) * 100;
      const totalProgress = baseProgress + scrollPercent * chapterWeight;
      progressTracker.recordProgress(
        bookId,
        `chap_${currentChapterIdx}_pos_${Math.round(contentOffset.y)}`,
        totalProgress
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Reading Ruler Focus Overlay */}
      <ReadingRuler
        enabled={readingRulerEnabled}
        mode={readingRulerMode}
        height={readingRulerHeight}
        opacity={readingRulerOpacity}
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingHorizontal: isDualPageActive ? 32 : marginHorizontal,
          },
        ]}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={{
            opacity: chapterAnim,
            transform: [
              {
                translateY: chapterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          }}
        >
          {/* Editorial Chapter Header (CHAPTER X | Title | Divider) */}
          <View style={styles.headerBlock}>
            <Text
              style={[styles.chapterKicker, { color: colors.textSecondary }]}
            >
              {currentChapter?.isFrontMatter
                ? currentChapter.title.toUpperCase().includes('COVER')
                  ? 'COVER'
                  : currentChapter.title.toUpperCase().includes('CONTENTS')
                  ? 'CONTENTS'
                  : 'FRONT MATTER'
                : currentChapter?.chapterNumber
                ? `CHAPTER ${currentChapter.chapterNumber}`
                : `CHAPTER ${currentChapterIdx + 1}`}
            </Text>
            <Text
              style={[
                styles.chapterHeroTitle,
                {
                  color: colors.textPrimary,
                  fontFamily:
                    fontFamily === 'System' ? FONTS.mona.bold : fontFamily,
                },
              ]}
            >
              {displayTitle}
            </Text>
            <View
              style={[styles.dividerBar, { backgroundColor: colors.border }]}
            />
          </View>

          {/* Center Content View (Supports Adaptive Dual-Page Spread on Landscape/Tablets) */}
          <View style={styles.tapArea}>
            {isDualPageActive ? (
              <View style={styles.dualPageSpread}>
                <View style={styles.dualPageColumn}>
                  {renderChapterContent}
                </View>
              </View>
            ) : (
              renderChapterContent
            )}

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
                <Sparkles
                  size={13}
                  color={colors.accent}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.highlightsPillText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Highlights
                </Text>
              </TouchableOpacity>
            )}
          </View>

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
              <Text style={[styles.navBtnText, { color: colors.textPrimary }]}>
                Prev Chapter
              </Text>
            </TouchableOpacity>

            <Text
              style={[styles.chapterCounter, { color: colors.textSecondary }]}
            >
              {currentChapter?.isFrontMatter
                ? currentChapter.title
                : currentChapter?.chapterNumber
                ? `Chapter ${currentChapter.chapterNumber} of ${totalStoryChapters}`
                : `${currentChapterIdx + 1} of ${chapters.length || 1}`}
            </Text>

            <TouchableOpacity
              onPress={handleNextChapter}
              disabled={currentChapterIdx >= chapters.length - 1}
              style={[
                styles.navBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity:
                    currentChapterIdx >= chapters.length - 1 ? 0.3 : 1,
                },
              ]}
            >
              <Text style={[styles.navBtnText, { color: colors.textPrimary }]}>
                Next Chapter
              </Text>
              <ChevronRight size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* On-Screen Floating Turn Buttons */}
      {navigationMode === 'buttons' && (
        <View pointerEvents="box-none" style={styles.floatingNavOverlay}>
          <TouchableOpacity
            onPress={handlePrevChapter}
            disabled={currentChapterIdx === 0}
            style={[
              styles.floatingNavBtn,
              {
                left: 16,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              currentChapterIdx === 0 && { opacity: 0.2 },
            ]}
            accessible={true}
            accessibilityLabel="Previous Page"
          >
            <ChevronLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextChapter}
            disabled={currentChapterIdx >= chapters.length - 1}
            style={[
              styles.floatingNavBtn,
              {
                right: 16,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              currentChapterIdx >= chapters.length - 1 && { opacity: 0.2 },
            ]}
            accessible={true}
            accessibilityLabel="Next Page"
          >
            <ChevronRight size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Left-Edge Vertical Swipe Brightness Gesture */}
      {edgeBrightnessEnabled && (
        <EdgeBrightnessGesture onBrightnessChange={setBrightness} />
      )}

      {/* Speedometer Telemetry HUD */}
      <SpeedometerOverlay />

      {/* Hands-Free Auto-Scroll Floating Controller */}
      <AutoScrollController
        onScrollTick={(deltaY) => {
          scrollOffsetRef.current += deltaY;
          if (scrollRef.current) {
            if (typeof (scrollRef.current as any).scrollTo === 'function') {
              (scrollRef.current as any).scrollTo({
                y: scrollOffsetRef.current,
                animated: false,
              });
            }
          }
        }}
        onPageTurnNext={handleNextChapter}
        onPageTurnPrev={handlePrevChapter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 84,
    paddingBottom: 88,
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
    fontSize: 26,
    lineHeight: 34,
    textAlign: 'center',
    letterSpacing: -0.4,
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
  heading1: {
    marginTop: 22,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  heading2: {
    marginTop: 18,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  heading3: {
    marginTop: 14,
    marginBottom: 8,
  },
  blockquoteWrapper: {
    borderLeftWidth: 3,
    paddingLeft: 14,
    paddingVertical: 8,
    marginVertical: 12,
    borderRadius: 4,
  },
  blockquoteText: {
    letterSpacing: -0.1,
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
  floatingNavOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 99,
  },
  floatingNavBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  dropCapLetter: {
    fontWeight: '800',
    marginRight: 6,
    includeFontPadding: false,
  },
  dualPageSpread: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dualPageColumn: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
});
