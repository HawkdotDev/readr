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
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import { ParsedChapter } from '../../services/reader/epubParser';
import { parseChapterContent, FormattedBlock } from '../../services/reader/epubBridge';
import { progressTracker } from '../../services/reader/progressTracker';
import { ReadingRuler } from './ReadingRuler';
import { AutoScrollController } from './AutoScrollController';
import { SpeedometerOverlay } from './SpeedometerOverlay';
import { EdgeBrightnessGesture } from './EdgeBrightnessGesture';
import { ImageLightboxModal } from './ImageLightboxModal';
import { FootnotePopover } from './FootnotePopover';
import { QuickHighlightMenu } from './QuickHighlightMenu';
import { addHighlight, getHighlights } from '../../db/queries/books';
import { Highlight, HighlightColor } from '../../types';
import { ttsService } from '../../services/tts/ttsService';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import { getFixationLength } from '../../utils/bionic';
import { applyNameReplacements } from '../../utils/nameReplacer';
import { resolveActionForTap } from '../../services/reader/touchZoneService';
import { HardwareKeyService } from '../../services/hardware/hardwareKeyService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const HIGHLIGHT_COLOR_TINTS: Record<HighlightColor, string> = {
  yellow: 'rgba(245, 158, 11, 0.28)',
  amber: 'rgba(217, 119, 6, 0.28)',
  mint: 'rgba(16, 185, 129, 0.28)',
  sky: 'rgba(14, 165, 233, 0.28)',
  coral: 'rgba(244, 63, 94, 0.28)',
  charcoal: 'rgba(39, 39, 42, 0.28)',
  graphite: 'rgba(75, 85, 99, 0.28)',
  silver: 'rgba(156, 163, 175, 0.28)',
  platinum: 'rgba(209, 213, 219, 0.28)',
  smoke: 'rgba(229, 231, 235, 0.28)',
};

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
  const horizontalScrollRef = useRef<ScrollView | null>(null);
  const scrollOffsetRef = useRef<number>(0);

  // Paginated Page Tracking
  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);

  // Modals & Popovers
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt?: string;
    caption?: string;
  } | null>(null);
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);

  const [activeFootnote, setActiveFootnote] = useState<{
    id?: string;
    text?: string;
    number?: string | number;
  } | null>(null);
  const [isFootnoteVisible, setIsFootnoteVisible] = useState(false);

  const [selectedHighlightText, setSelectedHighlightText] = useState<string>('');
  const [isHighlightMenuVisible, setIsHighlightMenuVisible] = useState(false);
  const [savedHighlights, setSavedHighlights] = useState<Highlight[]>([]);

  // Smooth Chapter Transition Animation
  const chapterAnim = useRef(new Animated.Value(1)).current;
  const touchStartPos = useRef({ x: 0, y: 0, time: 0 });

  const {
    fontFamily,
    fontSize,
    lineHeight,
    marginHorizontal,
    textAlign,
    chapterHeadingAlign,
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
    volumeKeysTurnPages,
    invertVolumeKeys,
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

  // Load saved highlights for current book
  useEffect(() => {
    if (bookId) {
      getHighlights(bookId).then(setSavedHighlights).catch(() => {});
    }
  }, [bookId]);

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
    setCurrentPageIdx(0);
    if (onChapterChange) {
      onChapterChange(newIndex);
    }
    scrollRef.current?.scrollTo?.({ y: 0, animated: false });
    horizontalScrollRef.current?.scrollTo?.({ x: 0, animated: false });
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

  // Hardware Volume Keys & Remote Clicker Page Navigation
  useEffect(() => {
    if (!volumeKeysTurnPages) return;

    const cleanup = HardwareKeyService.attachListener({
      enabled: volumeKeysTurnPages,
      invert: invertVolumeKeys,
      onNextPage: handleNextChapter,
      onPrevPage: handlePrevChapter,
    });

    return cleanup;
  }, [volumeKeysTurnPages, invertVolumeKeys, currentChapterIdx, chapters.length]);

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

  // Save new highlight
  const handleSaveHighlight = async (color: HighlightColor) => {
    try {
      const hl = await addHighlight(
        bookId,
        selectedHighlightText,
        color,
        `chap_${currentChapterIdx}`
      );
      setSavedHighlights((prev) => [hl, ...prev]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      console.warn('Save highlight error:', e);
    }
  };

  // Render individual content blocks
  const renderSingleBlock = (block: FormattedBlock, bIdx: number) => {
    const processedBlockText = applyNameReplacements(block.text, nameReplacements);

    // 1. Heading 1
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
              textAlign: chapterHeadingAlign,
              fontFamily: fontFamily === 'System' ? FONTS.mona.bold : fontFamily,
            },
          ]}
        >
          {processedBlockText}
        </Text>
      );
    }

    // 2. Heading 2
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
              textAlign: chapterHeadingAlign,
              fontFamily: fontFamily === 'System' ? FONTS.mona.bold : fontFamily,
            },
          ]}
        >
          {processedBlockText}
        </Text>
      );
    }

    // 3. Heading 3
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
              textAlign: chapterHeadingAlign,
              fontFamily: fontFamily === 'System' ? FONTS.mona.bold : fontFamily,
            },
          ]}
        >
          {processedBlockText}
        </Text>
      );
    }

    // 4. Blockquote
    if (block.type === 'blockquote') {
      return (
        <View
          key={`bq_${bIdx}`}
          style={[
            styles.blockquoteWrapper,
            {
              borderLeftColor: colors.accent,
              backgroundColor: colors.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
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
                fontFamily: fontFamily === 'System' ? undefined : fontFamily,
                fontStyle: 'italic',
              },
            ]}
          >
            {processedBlockText}
          </Text>
        </View>
      );
    }

    // 5. Code Block
    if (block.type === 'code') {
      return (
        <View
          key={`code_${bIdx}`}
          style={[
            styles.codeBlockWrapper,
            {
              backgroundColor: colors.isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.04)',
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.codeBlockText,
              { color: colors.textPrimary, fontFamily: FONTS.mono.regular },
            ]}
          >
            {block.text}
          </Text>
        </View>
      );
    }

    // 6. Ornamental Divider
    if (block.type === 'hr') {
      return (
        <View key={`hr_${bIdx}`} style={styles.ornamentDividerRow}>
          <View style={[styles.ornamentLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.ornamentGlyph, { color: colors.accent }]}>✦</Text>
          <View style={[styles.ornamentLine, { backgroundColor: colors.border }]} />
        </View>
      );
    }

    // 7. Embedded Image / Illustration (Tap to Lightbox)
    if (block.type === 'image' && block.imageSrc) {
      return (
        <TouchableOpacity
          key={`img_${bIdx}`}
          activeOpacity={0.88}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setSelectedImage({
              src: block.imageSrc!,
              alt: block.imageAlt,
              caption: block.imageCaption,
            });
            setIsLightboxVisible(true);
          }}
          style={styles.imageBlockWrapper}
          accessible={true}
          accessibilityLabel={`Illustration: ${block.imageAlt || block.imageCaption || 'Tap to expand'}`}
        >
          <Image
            source={{ uri: block.imageSrc }}
            style={[
              styles.chapterInlineImage,
              {
                backgroundColor: colors.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              },
            ]}
            resizeMode="contain"
          />
          {(block.imageCaption || block.imageAlt) && (
            <Text style={[styles.imageCaptionText, { color: colors.textSecondary }]}>
              {block.imageCaption || block.imageAlt}
            </Text>
          )}
        </TouchableOpacity>
      );
    }

    // 8. Paragraph with Highlights, Drop Caps & Bionic Reading
    const words = block.words || processedBlockText.split(/\s+/).filter(Boolean);
    const shouldApplyDropCap = dropCaps && bIdx === 0 && words.length > 0 && words[0].length > 0;
    const firstLetter = shouldApplyDropCap ? words[0].charAt(0) : '';
    const restOfFirstWord = shouldApplyDropCap ? words[0].slice(1) : '';
    const shouldIndent = paragraphIndent > 0 && bIdx > 0;

    // Check if this paragraph contains a saved highlight
    const matchingHighlight = savedHighlights.find(
      (h) =>
        h.selectedText &&
        (processedBlockText.includes(h.selectedText) || h.selectedText.includes(processedBlockText))
    );
    const highlightBg = matchingHighlight
      ? HIGHLIGHT_COLOR_TINTS[matchingHighlight.color] || 'rgba(245, 158, 11, 0.22)'
      : undefined;

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
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            setSelectedHighlightText(processedBlockText);
            setIsHighlightMenuVisible(true);
          }}
          style={[
            styles.paragraph,
            {
              color: colors.textPrimary,
              fontSize,
              lineHeight: fontSize * lineHeight,
              textAlign,
              fontFamily: fontFamily === 'System' ? undefined : fontFamily,
              backgroundColor: highlightBg,
              borderRadius: highlightBg ? 4 : 0,
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
                      fontFamily: fontFamily === 'System' ? FONTS.mona.bold : fontFamily,
                    },
                  ]}
                >
                  {firstLetter}
                </Text>
              )}
              {shouldApplyDropCap && restOfFirstWord ? `${restOfFirstWord} ` : ''}
              {(shouldApplyDropCap ? words.slice(1) : words).map((w, wIdx) => {
                if (w && w.trim().length > 0) {
                  const fixLen = getFixationLength(w.length, bionicFixation);
                  const boldPart = w.slice(0, fixLen);
                  const normalPart = w.slice(fixLen);
                  return (
                    <Text
                      key={`w_${bIdx}_${wIdx}`}
                      onLongPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        onSelectWordForDictionary(w);
                      }}
                      suppressHighlighting={true}
                    >
                      <Text style={{ fontFamily: FONTS.mona.bold, fontWeight: '700' }}>
                        {boldPart}
                      </Text>
                      {normalPart}{' '}
                    </Text>
                  );
                }
                return null;
              })}
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
                    fontFamily: fontFamily === 'System' ? FONTS.mona.bold : fontFamily,
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
  };

  // Convert HTML content into structured typography blocks
  const blocks = useMemo(() => {
    if (!currentChapter) return [];
    return parseChapterContent(currentChapter.content);
  }, [currentChapter]);

  // Paginated Pages Engine: Chunks blocks into fluid pages
  const paginatedPages = useMemo(() => {
    if (blocks.length === 0) return [];
    const wordsPerPage = Math.max(140, Math.floor(280 * (18 / Math.max(12, fontSize))));

    const pages: FormattedBlock[][] = [];
    let curPage: FormattedBlock[] = [];
    let curWords = 0;

    for (const b of blocks) {
      if (b.type === 'h1' || b.type === 'h2') {
        if (curPage.length > 0) {
          pages.push(curPage);
          curPage = [];
          curWords = 0;
        }
      }

      if (b.type === 'image') {
        if (curPage.length > 0) {
          pages.push(curPage);
          curPage = [];
          curWords = 0;
        }
        pages.push([b]);
        continue;
      }

      const count = b.words?.length || b.text.split(/\s+/).length;
      if (curWords + count > wordsPerPage && curPage.length > 0) {
        pages.push(curPage);
        curPage = [b];
        curWords = count;
      } else {
        curPage.push(b);
        curWords += count;
      }
    }

    if (curPage.length > 0) {
      pages.push(curPage);
    }

    return pages.length > 0 ? pages : [blocks];
  }, [blocks, fontSize]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    scrollOffsetRef.current = contentOffset.y;
    const totalScrollable = contentSize.height - layoutMeasurement.height;
    if (totalScrollable > 0) {
      const scrollPercent = Math.max(0, Math.min(1, contentOffset.y / totalScrollable));
      const baseProgress = (currentChapterIdx / Math.max(1, chapters.length)) * 100;
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

      {readingDirection === 'horizontal' ? (
        /* ================= DUAL ENGINE 1: HORIZONTAL PAGINATED READER ================= */
        <View
          style={styles.paginatedContainer}
          onTouchStart={(e) => {
            touchStartPos.current = {
              x: e.nativeEvent.pageX,
              y: e.nativeEvent.pageY,
              time: Date.now(),
            };
          }}
          onTouchEnd={(e) => {
            const dx = e.nativeEvent.pageX - touchStartPos.current.x;
            const dy = e.nativeEvent.pageY - touchStartPos.current.y;
            const dt = Date.now() - touchStartPos.current.time;

            if (dt < 260 && Math.hypot(dx, dy) < 15) {
              const ratio = touchStartPos.current.x / windowWidth;
              if (ratio < 0.22) {
                if (currentPageIdx > 0) {
                  horizontalScrollRef.current?.scrollTo({
                    x: (currentPageIdx - 1) * windowWidth,
                    animated: true,
                  });
                  setCurrentPageIdx(currentPageIdx - 1);
                } else {
                  handlePrevChapter();
                }
              } else if (ratio > 0.78) {
                if (currentPageIdx < paginatedPages.length - 1) {
                  horizontalScrollRef.current?.scrollTo({
                    x: (currentPageIdx + 1) * windowWidth,
                    animated: true,
                  });
                  setCurrentPageIdx(currentPageIdx + 1);
                } else {
                  handleNextChapter();
                }
              } else {
                onToggleChrome();
              }
            }
          }}
        >
          <ScrollView
            ref={horizontalScrollRef}
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(e) => {
              const pIdx = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
              if (pIdx !== currentPageIdx && pIdx >= 0 && pIdx < paginatedPages.length) {
                setCurrentPageIdx(pIdx);
              }
            }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {paginatedPages.map((pageBlocks, pIdx) => (
              <View
                key={`page_${pIdx}`}
                style={[
                  styles.pageSlide,
                  {
                    width: windowWidth,
                    paddingHorizontal: isDualPageActive ? 32 : marginHorizontal,
                  },
                ]}
              >
                {/* Editorial Header on First Page */}
                {pIdx === 0 && (
                  <View
                    style={[
                      styles.headerBlock,
                      {
                        alignItems:
                          chapterHeadingAlign === 'left'
                            ? 'flex-start'
                            : chapterHeadingAlign === 'right'
                            ? 'flex-end'
                            : 'center',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chapterKicker,
                        {
                          color: colors.textSecondary,
                          textAlign: chapterHeadingAlign,
                        },
                      ]}
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
                          fontFamily: fontFamily === 'System' ? FONTS.mona.bold : fontFamily,
                          textAlign: chapterHeadingAlign,
                        },
                      ]}
                    >
                      {displayTitle}
                    </Text>
                    <View style={[styles.dividerBar, { backgroundColor: colors.border }]} />
                  </View>
                )}

                {/* Page Content Blocks */}
                <View style={styles.pageBody}>
                  {pageBlocks.map((blk, idx) => renderSingleBlock(blk, idx))}
                </View>

                {/* Kindle / Apple Books Page Footer Indicator */}
                <View style={styles.paginatedFooter}>
                  <Text style={[styles.pageIndicatorText, { color: colors.textSecondary }]}>
                    Page {pIdx + 1} of {paginatedPages.length}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        /* ================= DUAL ENGINE 2: CONTINUOUS VERTICAL SCROLL ================= */
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
            {/* Editorial Chapter Header */}
            <View
              style={[
                styles.headerBlock,
                {
                  alignItems:
                    chapterHeadingAlign === 'left'
                      ? 'flex-start'
                      : chapterHeadingAlign === 'right'
                      ? 'flex-end'
                      : 'center',
                },
              ]}
            >
              <Text
                style={[
                  styles.chapterKicker,
                  {
                    color: colors.textSecondary,
                    textAlign: chapterHeadingAlign,
                  },
                ]}
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
                    fontFamily: fontFamily === 'System' ? FONTS.mona.bold : fontFamily,
                    textAlign: chapterHeadingAlign,
                  },
                ]}
              >
                {displayTitle}
              </Text>
              <View style={[styles.dividerBar, { backgroundColor: colors.border }]} />
            </View>

            {/* Center Content View */}
            <View style={styles.tapArea}>
              {isDualPageActive ? (
                <View style={styles.dualPageSpread}>
                  <View style={styles.dualPageColumn}>
                    {blocks.map((blk, idx) => renderSingleBlock(blk, idx))}
                  </View>
                </View>
              ) : (
                blocks.map((blk, idx) => renderSingleBlock(blk, idx))
              )}
            </View>

            {/* Chapter End Quick Annotations Pill */}
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
                accessibilityLabel="View Highlights & Bookmarks"
              >
                <Sparkles size={14} color={colors.accent} style={{ marginRight: 6 }} />
                <Text style={[styles.highlightsPillText, { color: colors.textSecondary }]}>
                  View Highlights & Notes
                </Text>
              </TouchableOpacity>
            )}

            {/* Chapter Footer Navigation */}
            <View style={[styles.navRow, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                onPress={handlePrevChapter}
                disabled={currentChapterIdx === 0}
                style={[
                  styles.navBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                  currentChapterIdx === 0 && { opacity: 0.3 },
                ]}
                accessible={true}
                accessibilityLabel="Previous Chapter"
              >
                <ChevronLeft size={16} color={colors.textPrimary} />
                <Text style={[styles.navBtnText, { color: colors.textPrimary }]}>
                  Prev Chapter
                </Text>
              </TouchableOpacity>

              <Text style={[styles.chapterCounter, { color: colors.textSecondary }]}>
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
                  },
                  currentChapterIdx >= chapters.length - 1 && { opacity: 0.3 },
                ]}
                accessible={true}
                accessibilityLabel="Next Chapter"
              >
                <Text style={[styles.navBtnText, { color: colors.textPrimary }]}>
                  Next Chapter
                </Text>
                <ChevronRight size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      )}

      {/* Speedometer Telemetry HUD */}
      <SpeedometerOverlay />

      {/* Left-Edge Vertical Swipe Brightness Gesture */}
      {edgeBrightnessEnabled && (
        <EdgeBrightnessGesture onBrightnessChange={setBrightness} />
      )}

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

      {/* ================= MODALS & POPOVERS ================= */}

      {/* Fullscreen Image Lightbox */}
      <ImageLightboxModal
        visible={isLightboxVisible}
        imageSrc={selectedImage?.src}
        imageAlt={selectedImage?.alt}
        imageCaption={selectedImage?.caption}
        onClose={() => setIsLightboxVisible(false)}
      />

      {/* Footnote Popover */}
      <FootnotePopover
        visible={isFootnoteVisible}
        footnoteId={activeFootnote?.id}
        footnoteText={activeFootnote?.text}
        footnoteNumber={activeFootnote?.number}
        onClose={() => setIsFootnoteVisible(false)}
      />

      {/* In-Line Highlight & Action Context Menu */}
      <QuickHighlightMenu
        visible={isHighlightMenuVisible}
        selectedText={selectedHighlightText}
        onHighlight={handleSaveHighlight}
        onAddNote={() => {
          setIsHighlightMenuVisible(false);
          if (onOpenAnnotations) onOpenAnnotations();
        }}
        onDictionary={() => {
          setIsHighlightMenuVisible(false);
          onSelectWordForDictionary(selectedHighlightText);
        }}
        onSpeak={() => {
          setIsHighlightMenuVisible(false);
          ttsService.setContent(selectedHighlightText);
          ttsService.play();
        }}
        onClose={() => setIsHighlightMenuVisible(false)}
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
  imageBlockWrapper: {
    alignItems: 'center',
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chapterInlineImage: {
    width: '100%',
    height: 240,
    borderRadius: 10,
  },
  imageCaptionText: {
    marginTop: 8,
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  ornamentDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    gap: 12,
  },
  ornamentLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    maxWidth: 80,
  },
  ornamentGlyph: {
    fontSize: 14,
  },
  codeBlockWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  codeBlockText: {
    fontSize: 13,
    lineHeight: 18,
  },
  // Paginated Engine Styles
  paginatedContainer: {
    flex: 1,
    position: 'relative',
  },
  pageSlide: {
    flex: 1,
    paddingTop: 84,
    paddingBottom: 72,
    justifyContent: 'space-between',
  },
  pageBody: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  paginatedFooter: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  pageIndicatorText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  leftTapZone: {
    position: 'absolute',
    left: 0,
    top: 60,
    bottom: 60,
    width: '22%',
  },
  centerTapZone: {
    position: 'absolute',
    left: '22%',
    right: '22%',
    top: 60,
    bottom: 60,
  },
  rightTapZone: {
    position: 'absolute',
    right: 0,
    top: 60,
    bottom: 60,
    width: '22%',
  },
});
