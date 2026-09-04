import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import { ParsedChapter } from '../../services/reader/epubParser';
import { generateFoliateHtml } from '../../services/reader/engine/foliateRuntime';
import { progressTracker } from '../../services/reader/progressTracker';
import { formatRelativeDate } from '../../utils/time';
import { ImageLightboxModal } from './ImageLightboxModal';
import { FootnotePopover } from './FootnotePopover';
import { QuickHighlightMenu } from './QuickHighlightMenu';
import { addHighlight, getHighlights } from '../../db/queries/books';
import { Highlight, HighlightColor } from '../../types';
import { ttsService } from '../../services/tts/ttsService';
import { FONTS } from '../../utils/typography';

export interface ModernEpubReaderProps {
  bookId: string;
  chapters: ParsedChapter[];
  activeChapterIndex?: number;
  onChapterChange?: (newIndex: number) => void;
  onToggleChrome: () => void;
  onSelectWordForDictionary: (word: string) => void;
  onOpenAnnotations?: () => void;
}

export const ModernEpubReader: React.FC<ModernEpubReaderProps> = ({
  bookId,
  chapters,
  activeChapterIndex = 0,
  onChapterChange,
  onToggleChrome,
  onSelectWordForDictionary,
  onOpenAnnotations,
}) => {
  const { colors } = useTheme();
  const webViewRef = useRef<WebView | null>(null);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(activeChapterIndex);

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

  // Smooth Transition Animation
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Catch-Up Glance Re-entry Banner
  const glanceOpacity = useRef(new Animated.Value(0)).current;
  const [glanceText, setGlanceText] = useState<string | null>(null);

  const {
    fontFamily,
    fontSize,
    lineHeight,
    marginHorizontal,
    textAlign,
    chapterHeadingAlign,
    readingDirection,
    paragraphIndent,
    paragraphSpacing,
    dropCaps,
    bionicReadingEnabled,
    bionicFixation,
    nameReplacements,
    currentBook,
    setCurrentChapter,
    setLocation,
  } = useReaderStore();

  // Trigger Catch-Up Glance if returning after >24 hours
  useEffect(() => {
    if (currentBook?.lastReadAt) {
      const lastReadTime = new Date(currentBook.lastReadAt).getTime();
      const hoursSince = (Date.now() - lastReadTime) / (1000 * 60 * 60);
      if (hoursSince >= 24) {
        const rel = formatRelativeDate(new Date(currentBook.lastReadAt));
        setGlanceText(`Resuming Chapter ${currentChapterIdx + 1} · Last read ${rel}`);
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(glanceOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(4200),
          Animated.timing(glanceOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [bookId]);

  // Load saved highlights
  useEffect(() => {
    if (bookId) {
      getHighlights(bookId).then(setSavedHighlights).catch(() => {});
    }
  }, [bookId]);

  // Synchronize chapter when parent updates activeChapterIndex
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

  const [transitionDirection, setTransitionDirection] = useState<'start' | 'end'>('start');

  const animateToChapter = (newIndex: number, direction: 'start' | 'end' = 'start') => {
    setTransitionDirection(direction);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentChapterIdx(newIndex);
    if (onChapterChange) {
      onChapterChange(newIndex);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIdx < chapters.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      animateToChapter(currentChapterIdx + 1, 'start');
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIdx > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      animateToChapter(currentChapterIdx - 1, 'end');
    }
  };

  // Generate self-contained, zero-FOUC HTML bundle
  const htmlContent = useMemo(() => {
    if (!currentChapter) return '';
    return generateFoliateHtml(currentChapter.content, {
      fontSize,
      fontFamily,
      lineHeight,
      marginHorizontal,
      textAlign,
      chapterHeadingAlign,
      colors,
      readingDirection,
      bionicReadingEnabled,
      bionicFixation,
      paragraphIndent,
      paragraphSpacing,
      dropCaps,
      initialPosition: transitionDirection,
      highlights: savedHighlights.map((h) => ({
        id: h.id,
        selectedText: h.selectedText,
        color: h.color,
      })),
      nameReplacements,
    });
  }, [currentChapter, readingDirection, transitionDirection, chapterHeadingAlign]);

  // Push live config updates directly to DOM without reloading WebView
  useEffect(() => {
    if (webViewRef.current) {
      const script = `
        if (window.ReadrEngine && window.ReadrEngine.updateConfig) {
          window.ReadrEngine.updateConfig({
            colors: ${JSON.stringify(colors)},
            fontSize: ${fontSize},
            lineHeight: ${lineHeight},
            marginHorizontal: ${marginHorizontal},
            textAlign: "${textAlign}",
            chapterHeadingAlign: "${chapterHeadingAlign}"
          });
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [colors, fontSize, lineHeight, marginHorizontal, textAlign, chapterHeadingAlign]);

  // Handle incoming bridge messages
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case 'nextChapter':
          handleNextChapter();
          break;
        case 'prevChapter':
          handlePrevChapter();
          break;
        case 'toggleChrome':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onToggleChrome();
          break;
        case 'imageClick':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          setSelectedImage({
            src: data.src,
            alt: data.alt,
            caption: data.caption,
          });
          setIsLightboxVisible(true);
          break;
        case 'footnote':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          setActiveFootnote({
            id: data.id,
            number: data.number,
            text: data.text,
          });
          setIsFootnoteVisible(true);
          break;
        case 'selection':
          if (data.text) {
            setSelectedHighlightText(data.text);
            setIsHighlightMenuVisible(true);
          }
          break;
        case 'pageTurn':
          // Update reading progress
          if (data.progress !== undefined) {
            progressTracker.recordProgress(
              bookId,
              `chap_${currentChapterIdx}_page_${data.page}`,
              data.progress
            );
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.warn('WebView bridge parse error:', err);
    }
  };

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

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Catch-Up Glance Re-entry Capsule */}
      {glanceText && (
        <Animated.View
          style={[
            styles.glanceCapsule,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: glanceOpacity,
            },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Animated.timing(glanceOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }).start();
            }}
            style={[
              styles.glanceContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            accessible={true}
            accessibilityLabel={glanceText}
          >
            <Text style={[styles.glanceText, { color: colors.textPrimary }]}>
              {glanceText}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.View style={[styles.innerArea, { opacity: fadeAnim }]}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          style={[styles.webView, { backgroundColor: colors.canvas }]}
          scrollEnabled={readingDirection === 'vertical'}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          renderLoading={() => (
            <View style={[styles.loadingBox, { backgroundColor: colors.canvas }]}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          )}
          startInLoadingState={true}
        />
      </Animated.View>

      {/* Fullscreen Image Lightbox Modal */}
      <ImageLightboxModal
        visible={isLightboxVisible}
        imageSrc={selectedImage?.src}
        imageAlt={selectedImage?.alt}
        imageCaption={selectedImage?.caption}
        onClose={() => setIsLightboxVisible(false)}
      />

      {/* Interactive Footnote Popover */}
      <FootnotePopover
        visible={isFootnoteVisible}
        footnoteId={activeFootnote?.id}
        footnoteText={activeFootnote?.text}
        footnoteNumber={activeFootnote?.number}
        onClose={() => setIsFootnoteVisible(false)}
      />

      {/* In-Line Highlight Action Menu & Social Marginalia */}
      <QuickHighlightMenu
        visible={isHighlightMenuVisible}
        selectedText={selectedHighlightText}
        bookTitle={currentBook?.title}
        author={currentBook?.authors?.map((a) => a.name).join(', ')}
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
  glanceCapsule: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  glanceContent: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  glanceText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  innerArea: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingBox: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
