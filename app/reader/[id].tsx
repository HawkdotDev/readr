import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { getWarmthOverlayColor } from '../../src/utils/theme';
import { getBookById } from '../../src/db/queries/books';
import { getBookSettings, saveBookSettings } from '../../src/db/queries/bookSettings';
import { Book } from '../../src/types';
import { parseBookFile, ParsedChapter } from '../../src/services/reader/epubParser';
import { progressTracker } from '../../src/services/reader/progressTracker';
import { ttsService } from '../../src/services/tts/ttsService';
import { useReaderStore } from '../../src/store/readerStore';

// Reader Components
import { ReaderToolbar } from '../../src/components/reader/ReaderToolbar';
import { FolioBar } from '../../src/components/reader/FolioBar';
import { ReaderBottomCapsule } from '../../src/components/reader/ReaderBottomCapsule';
import { EpubReader } from '../../src/components/reader/EpubReader';

// Modal Sheets
import { TypographySheet } from '../../src/components/reader/TypographySheet';
import { ThemeSheet } from '../../src/components/reader/ThemeSheet';
import { TTSSheet } from '../../src/components/reader/TTSSheet';
import { DictionarySheet } from '../../src/components/reader/DictionarySheet';
import { TOCSheet } from '../../src/components/reader/TOCSheet';
import { AnnotationSheet } from '../../src/components/reader/AnnotationSheet';
import { SearchSheet } from '../../src/components/reader/SearchSheet';

export default function ReaderScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, warmthLevel } = useTheme();

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<ParsedChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [chromeVisible, setChromeVisible] = useState(true);

  const {
    currentChapterIndex,
    currentChapterTitle,
    progressPercentage,
    minutesLeftInChapter,
    activeSheet,
    selectedTextForDictionary,
    fontFamily,
    fontSize,
    lineHeight,
    marginHorizontal,
    textAlign,
    activeTheme,
    paragraphIndent,
    paragraphSpacing,
    dropCaps,
    readingRulerEnabled,
    readingRulerMode,
    setCurrentBook,
    setActiveSheet,
    closeSheet,
    openDictionary,
  } = useReaderStore();

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
        }

        const parsed = await parseBookFile(b.filePath, b.fileFormat, b.title);
        setChapters(parsed.chapters);

        // Feed TTS service with initial chapter text
        if (parsed.chapters.length > 0) {
          const plainText = parsed.chapters[0].content.replace(/<[^>]+>/g, ' ');
          ttsService.setContent(plainText);
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
        }).catch(() => {});
      }
      ttsService.stop();
    };
  }, [id]);

  const toggleChrome = () => {
    setChromeVisible((prev) => !prev);
  };

  const handleSelectChapter = (chapIdx: number) => {
    if (chapters[chapIdx]) {
      const plainText = chapters[chapIdx].content.replace(/<[^>]+>/g, ' ');
      ttsService.setContent(plainText);
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
      {/* Auto-Hiding Top Toolbar */}
      {chromeVisible && (
        <View style={styles.topToolbarWrapper}>
          <ReaderToolbar
            title={book.title}
            onBack={() => router.back()}
            onOpenTTS={() => setActiveSheet('tts')}
            onOpenSearch={() => setActiveSheet('search')}
          />
        </View>
      )}

      {/* Interactive Core Reader */}
      <View style={styles.readerArea}>
        <EpubReader
          bookId={book.id}
          chapters={chapters}
          initialChapterIndex={0}
          onToggleChrome={toggleChrome}
          onSelectWordForDictionary={openDictionary}
          onOpenAnnotations={() => setActiveSheet('annotations')}
        />
      </View>

      {/* Signature Fluid Folio Bar */}
      <View style={styles.folioWrapper}>
        <FolioBar
          chapterTitle={currentChapterTitle}
          currentChapterNumber={currentChapterIndex + 1}
          totalChapters={chapters.length || 1}
          progressPercentage={progressPercentage}
          minutesLeft={minutesLeftInChapter}
          onPress={toggleChrome}
        />
      </View>

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

      {/* Auto-Hiding Floating Bottom Control Capsule */}
      {chromeVisible && (
        <ReaderBottomCapsule
          onOpenTheme={() => setActiveSheet('theme')}
          onOpenTypography={() => setActiveSheet('typography')}
          onOpenTOC={() => setActiveSheet('toc')}
          onOpenAnnotations={() => setActiveSheet('annotations')}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  topToolbarWrapper: {
    paddingTop: 48,
  },
  readerArea: {
    flex: 1,
  },
  folioWrapper: {
    paddingBottom: 6,
  },
});
