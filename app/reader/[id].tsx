import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { getWarmthOverlayColor } from '../../src/utils/theme';
import { getBookById, getBookmarks, addBookmark, deleteBookmark } from '../../src/db/queries/books';
import { getBookSettings, saveBookSettings } from '../../src/db/queries/bookSettings';
import { getBookNameReplacements } from '../../src/db/queries/nameReplacements';
import { Book, Bookmark } from '../../src/types';
import { parseBookFile, ParsedChapter, createSampleBookContent } from '../../src/services/reader/epubParser';
import { progressTracker } from '../../src/services/reader/progressTracker';
import { ttsService } from '../../src/services/tts/ttsService';
import { useReaderStore } from '../../src/store/readerStore';
import { applyNameReplacements } from '../../src/utils/nameReplacer';

// Reader Components
import { ReaderToolbar } from '../../src/components/reader/ReaderToolbar';
import { FolioBar } from '../../src/components/reader/FolioBar';
import { ReaderBottomCapsule } from '../../src/components/reader/ReaderBottomCapsule';
import { EpubReader } from '../../src/components/reader/EpubReader';
import { ModernEpubReader } from '../../src/components/reader/ModernEpubReader';

// Modal Sheets
import { TypographySheet } from '../../src/components/reader/TypographySheet';
import { ThemeSheet } from '../../src/components/reader/ThemeSheet';
import { TTSSheet } from '../../src/components/reader/TTSSheet';
import { DictionarySheet } from '../../src/components/reader/DictionarySheet';
import { TOCSheet } from '../../src/components/reader/TOCSheet';
import { AnnotationSheet } from '../../src/components/reader/AnnotationSheet';
import { SearchSheet } from '../../src/components/reader/SearchSheet';
import { NameReplacementModal } from '../../src/components/reader/NameReplacementModal';

export default function ReaderScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, warmthLevel } = useTheme();

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<ParsedChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Animated Chrome (Zero layout-shift smooth fade & translate)
  const chromeAnim = useRef(new Animated.Value(1)).current;

  const {
    currentChapterIndex,
    currentChapterTitle,
    progressPercentage,
    minutesLeftInChapter,
    readingEngine,
    activeSheet,
    selectedTextForDictionary,
    setCurrentBook,
    setActiveSheet,
    closeSheet,
    openDictionary,
  } = useReaderStore();

  // Load Book & Per-Book Settings on Mount
  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const b = await getBookById(id);
      if (b) {
        setBook(b);
        setCurrentBook(b);

        // Load custom per-book settings overrides
        const customSettings = await getBookSettings(id);
        if (customSettings) {
          if (customSettings.fontFamily) useReaderStore.getState().setFontFamily(customSettings.fontFamily);
          if (customSettings.fontSize) useReaderStore.getState().setFontSize(customSettings.fontSize);
          if (customSettings.lineHeight) useReaderStore.getState().setLineHeight(customSettings.lineHeight);
          if (customSettings.marginHorizontal) useReaderStore.getState().setMarginHorizontal(customSettings.marginHorizontal);
          if (customSettings.textAlign) useReaderStore.getState().setTextAlign(customSettings.textAlign);
          if (customSettings.activeTheme) useReaderStore.getState().setActiveTheme(customSettings.activeTheme as any);
          if (customSettings.paragraphIndent !== null && customSettings.paragraphIndent !== undefined) {
            useReaderStore.getState().setParagraphIndent(customSettings.paragraphIndent);
          }
          if (customSettings.paragraphSpacing !== null && customSettings.paragraphSpacing !== undefined) {
            useReaderStore.getState().setParagraphSpacing(customSettings.paragraphSpacing);
          }
          if (customSettings.dropCaps !== null && customSettings.dropCaps !== undefined) {
            useReaderStore.getState().setDropCaps(customSettings.dropCaps);
          }
          if (customSettings.readingRulerEnabled !== null && customSettings.readingRulerEnabled !== undefined) {
            useReaderStore.getState().setReadingRulerEnabled(customSettings.readingRulerEnabled);
          }
          if (customSettings.readingRulerMode) {
            useReaderStore.getState().setReadingRulerMode(customSettings.readingRulerMode as any);
          }
          if (customSettings.bionicReadingEnabled !== null && customSettings.bionicReadingEnabled !== undefined) {
            useReaderStore.getState().setBionicReadingEnabled(customSettings.bionicReadingEnabled);
          }
          if (customSettings.bionicFixation) {
            useReaderStore.getState().setBionicFixation(customSettings.bionicFixation as any);
          }
          if (customSettings.readingDirection) {
            useReaderStore.getState().setReadingDirection(customSettings.readingDirection as any);
          }
          if (customSettings.pageTurnStyle) {
            useReaderStore.getState().setPageTurnStyle(customSettings.pageTurnStyle as any);
          }
          if (customSettings.dualPageMode !== undefined && customSettings.dualPageMode !== null) {
            useReaderStore.getState().setDualPageMode(customSettings.dualPageMode);
          }
          if (customSettings.warmthLevel !== undefined && customSettings.warmthLevel !== null) {
            useReaderStore.getState().setWarmthLevel(customSettings.warmthLevel);
          }
          if (customSettings.autoScrollSpeed !== undefined && customSettings.autoScrollSpeed !== null) {
            useReaderStore.getState().setAutoScrollSpeed(customSettings.autoScrollSpeed);
          }
          if (customSettings.autoScrollMode) {
            useReaderStore.getState().setAutoScrollMode(customSettings.autoScrollMode as any);
          }
        }

        // Load custom per-book name replacements
        const replacements = await getBookNameReplacements(id);
        useReaderStore.getState().setNameReplacements(replacements);

        let parsedChapters: ParsedChapter[] = [];
        try {
          const parsed = await parseBookFile(b.filePath, b.fileFormat, b.title);
          parsedChapters = parsed.chapters || [];
        } catch (parseErr) {
          console.warn('[reader] parseBookFile encountered an error:', parseErr);
        }

        if (parsedChapters.length === 0) {
          const fallback = createSampleBookContent(b.title);
          parsedChapters = fallback.chapters;
        }

        setChapters(parsedChapters);

        // Resume from last saved chapter if available, or start at first story chapter
        if (b.lastReadLocation) {
          const match = b.lastReadLocation.match(/chap_(\d+)/);
          if (match) {
            const savedIdx = parseInt(match[1], 10);
            if (savedIdx >= 0 && savedIdx < parsedChapters.length) {
              setActiveChapterIndex(savedIdx);
            }
          }
        } else {
          // Open directly at first story chapter (skipping cover/front matter), matching Kindle/Apple Books
          const firstStoryIdx = parsedChapters.findIndex((c) => !c.isFrontMatter);
          if (firstStoryIdx > 0) {
            setActiveChapterIndex(firstStoryIdx);
          }
        }

        // Feed TTS service with initial chapter text (applying active name replacements)
        if (parsedChapters.length > 0) {
          const plainText = parsedChapters[0].content.replace(/<[^>]+>/g, ' ');
          const substituted = applyNameReplacements(plainText, replacements);
          ttsService.setContent(substituted);
        }
      }
      setLoading(false);
    }
    load();

    return () => {
      if (id) {
        progressTracker.endSession(id);
        // Persist per-book settings on exit
        const state = useReaderStore.getState();
        saveBookSettings(id, {
          fontFamily: state.fontFamily,
          fontSize: state.fontSize,
          lineHeight: state.lineHeight,
          marginHorizontal: state.marginHorizontal,
          textAlign: state.textAlign,
          activeTheme: state.activeTheme,
          paragraphIndent: state.paragraphIndent,
          paragraphSpacing: state.paragraphSpacing,
          dropCaps: state.dropCaps,
          readingRulerEnabled: state.readingRulerEnabled,
          readingRulerMode: state.readingRulerMode,
          bionicReadingEnabled: state.bionicReadingEnabled,
          bionicFixation: state.bionicFixation,
          readingDirection: state.readingDirection,
          pageTurnStyle: state.pageTurnStyle,
          dualPageMode: state.dualPageMode,
          warmthLevel: state.warmthLevel,
          autoScrollSpeed: state.autoScrollSpeed,
          autoScrollMode: state.autoScrollMode,
        }).catch(() => {});
      }
      ttsService.stop();
    };
  }, [id]);

  // Smooth Chrome Visibility Animation
  useEffect(() => {
    Animated.timing(chromeAnim, {
      toValue: chromeVisible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [chromeVisible]);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    if (id) {
      getBookmarks(id).then(setBookmarks).catch(() => {});
    }
  }, [id]);

  const isCurrentChapterBookmarked = useMemo(() => {
    return bookmarks.some((b) => b.locationCfi === `chap_${currentChapterIndex}`);
  }, [bookmarks, currentChapterIndex]);

  const handleToggleBookmark = async () => {
    if (!id) return;
    try {
      if (isCurrentChapterBookmarked) {
        const existing = bookmarks.find((b) => b.locationCfi === `chap_${currentChapterIndex}`);
        if (existing) {
          await deleteBookmark(existing.id);
          setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        }
      } else {
        const newBm = await addBookmark(
          id,
          `chap_${currentChapterIndex}`,
          currentChapterTitle || `Chapter ${currentChapterIndex + 1}`
        );
        setBookmarks((prev) => [newBm, ...prev]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (e) {
      console.warn('Toggle bookmark error:', e);
    }
  };

  const toggleChrome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setChromeVisible((prev) => !prev);
  };

  const handleSelectChapter = (chapIdx: number) => {
    if (chapters[chapIdx]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setActiveChapterIndex(chapIdx);
      closeSheet();

      // Update TTS content with newly chosen chapter
      const plainText = chapters[chapIdx].content.replace(/<[^>]+>/g, ' ');
      const activeRules = useReaderStore.getState().nameReplacements;
      const substituted = applyNameReplacements(plainText, activeRules);
      ttsService.setContent(substituted);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.canvas }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Opening book...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.canvas }]}>
        <Text style={[styles.loadingText, { color: colors.textPrimary }]}>Book not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Interactive Core Reader (Spans 100% height - Zero layout shift) */}
      <View style={styles.readerArea}>
        {readingEngine === 'modern' ? (
          <ModernEpubReader
            bookId={book.id}
            chapters={chapters}
            activeChapterIndex={activeChapterIndex}
            onChapterChange={(newIdx) => setActiveChapterIndex(newIdx)}
            onToggleChrome={toggleChrome}
            onSelectWordForDictionary={openDictionary}
            onOpenAnnotations={() => setActiveSheet('annotations')}
          />
        ) : (
          <EpubReader
            bookId={book.id}
            chapters={chapters}
            activeChapterIndex={activeChapterIndex}
            onChapterChange={(newIdx) => setActiveChapterIndex(newIdx)}
            onToggleChrome={toggleChrome}
            onSelectWordForDictionary={openDictionary}
            onOpenAnnotations={() => setActiveSheet('annotations')}
          />
        )}
      </View>

      {/* Auto-Hiding Top Toolbar (Absolute Floating Overlay) */}
      <Animated.View
        pointerEvents={chromeVisible ? 'auto' : 'none'}
        style={[
          styles.topToolbarOverlay,
          {
            opacity: chromeAnim,
            transform: [
              {
                translateY: chromeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-36, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ReaderToolbar
          title={book.title}
          onBack={() => router.back()}
          onOpenTTS={() => setActiveSheet('tts')}
          onOpenSearch={() => setActiveSheet('search')}
          onOpenNameReplacement={() => setActiveSheet('nameReplacement')}
          onToggleBookmark={handleToggleBookmark}
          isBookmarked={isCurrentChapterBookmarked}
        />
      </Animated.View>

      {/* Signature Fluid Folio Bar (Bottom Margin Indicator) */}
      <View
        style={[
          styles.folioWrapper,
          {
            backgroundColor: colors.canvas,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
          },
        ]}
      >
        <FolioBar
          chapterTitle={currentChapterTitle}
          currentChapterNumber={currentChapterIndex + 1}
          totalChapters={chapters.length || 1}
          progressPercentage={progressPercentage}
          minutesLeft={minutesLeftInChapter}
          onPress={toggleChrome}
        />
      </View>

      {/* Auto-Hiding Floating Bottom Control Capsule (Absolute Floating Overlay) */}
      <Animated.View
        pointerEvents={chromeVisible ? 'auto' : 'none'}
        style={[
          styles.bottomCapsuleOverlay,
          {
            opacity: chromeAnim,
            transform: [
              {
                translateY: chromeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [36, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ReaderBottomCapsule
          onOpenTheme={() => setActiveSheet('theme')}
          onOpenTypography={() => setActiveSheet('typography')}
          onOpenTOC={() => setActiveSheet('toc')}
          onOpenAnnotations={() => setActiveSheet('annotations')}
        />
      </Animated.View>

      {/* Blue Light Night Protection Overlay */}
      {warmthLevel > 0.01 && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: getWarmthOverlayColor(warmthLevel),
              zIndex: 35,
            },
          ]}
        />
      )}

      {/* Modal Sheets */}
      <TypographySheet
        visible={activeSheet === 'typography'}
        onClose={closeSheet}
      />

      <ThemeSheet
        visible={activeSheet === 'theme'}
        onClose={closeSheet}
      />

      <TTSSheet
        visible={activeSheet === 'tts'}
        onClose={closeSheet}
      />

      <DictionarySheet
        visible={activeSheet === 'dictionary'}
        word={selectedTextForDictionary}
        onClose={closeSheet}
      />

      <TOCSheet
        visible={activeSheet === 'toc'}
        chapters={chapters}
        currentChapterIndex={currentChapterIndex}
        onSelectChapter={handleSelectChapter}
        onClose={closeSheet}
      />

      <AnnotationSheet
        visible={activeSheet === 'annotations'}
        bookId={book.id}
        bookTitle={book.title}
        currentLocationCfi={`chap_${currentChapterIndex}`}
        currentChapterTitle={currentChapterTitle}
        onClose={closeSheet}
      />

      <SearchSheet
        visible={activeSheet === 'search'}
        chapters={chapters}
        onSelectResult={handleSelectChapter}
        onClose={closeSheet}
      />

      <NameReplacementModal
        visible={activeSheet === 'nameReplacement'}
        bookId={book.id}
        onClose={closeSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
  },
  topToolbarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 48,
    paddingHorizontal: 4,
    zIndex: 100,
  },
  readerArea: {
    flex: 1,
  },
  folioWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 6,
    zIndex: 40,
  },
  bottomCapsuleOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
});
