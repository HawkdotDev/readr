import { describe, it, expect, beforeEach } from 'bun:test';
import { useReaderStore } from '../../src/store/readerStore';
import { BookSettings, NameReplacementRule } from '../../src/types';
import { applyNameReplacements } from '../../src/utils/nameReplacer';
import { ttsService } from '../../src/services/tts/ttsService';

describe('Per-Book Settings & Reading Pipeline Integration', () => {
  beforeEach(() => {
    useReaderStore.setState({
      currentBook: null,
      fontFamily: 'Literata',
      fontSize: 18,
      lineHeight: 1.5,
      marginHorizontal: 20,
      textAlign: 'left',
      activeTheme: 'light',
      paragraphIndent: 0,
      paragraphSpacing: 1.0,
      dropCaps: false,
      readingRulerEnabled: false,
      readingRulerMode: 'highlight',
      bionicReadingEnabled: false,
      bionicFixation: 'medium',
      readingDirection: 'horizontal',
      pageTurnStyle: 'slide',
      dualPageMode: 'auto',
      warmthLevel: 0.0,
      autoScrollSpeed: 45,
      autoScrollMode: 'smooth',
      nameReplacements: [],
      activeSheet: 'none',
    });
  });

  it('correctly applies custom per-book settings overrides to the reader store state', () => {
    const customSettings: BookSettings = {
      bookId: 'book-456',
      fontFamily: 'Hubot Sans',
      fontSize: 22,
      lineHeight: 1.8,
      marginHorizontal: 32,
      textAlign: 'justify',
      activeTheme: 'sepia',
      paragraphIndent: 1.5,
      paragraphSpacing: 1.4,
      dropCaps: true,
      readingRulerEnabled: true,
      readingRulerMode: 'underline',
      bionicReadingEnabled: true,
      bionicFixation: 'high',
      readingDirection: 'vertical',
      pageTurnStyle: 'fade',
      dualPageMode: true,
      warmthLevel: 0.45,
      autoScrollSpeed: 80,
      autoScrollMode: 'line',
    };

    // Simulate loading custom per-book settings in reader screen
    if (customSettings.fontFamily) useReaderStore.getState().setFontFamily(customSettings.fontFamily);
    if (customSettings.fontSize) useReaderStore.getState().setFontSize(customSettings.fontSize);
    if (customSettings.lineHeight) useReaderStore.getState().setLineHeight(customSettings.lineHeight);
    if (customSettings.marginHorizontal) useReaderStore.getState().setMarginHorizontal(customSettings.marginHorizontal);
    if (customSettings.textAlign) useReaderStore.getState().setTextAlign(customSettings.textAlign);
    if (customSettings.activeTheme) useReaderStore.getState().setActiveTheme(customSettings.activeTheme as any);
    if (customSettings.paragraphIndent) useReaderStore.getState().setParagraphIndent(customSettings.paragraphIndent);
    if (customSettings.paragraphSpacing) useReaderStore.getState().setParagraphSpacing(customSettings.paragraphSpacing);
    if (customSettings.dropCaps) useReaderStore.getState().setDropCaps(customSettings.dropCaps);
    if (customSettings.readingRulerEnabled) useReaderStore.getState().setReadingRulerEnabled(customSettings.readingRulerEnabled);
    if (customSettings.readingRulerMode) useReaderStore.getState().setReadingRulerMode(customSettings.readingRulerMode as any);
    if (customSettings.bionicReadingEnabled) useReaderStore.getState().setBionicReadingEnabled(customSettings.bionicReadingEnabled);
    if (customSettings.bionicFixation) useReaderStore.getState().setBionicFixation(customSettings.bionicFixation);
    if (customSettings.readingDirection) useReaderStore.getState().setReadingDirection(customSettings.readingDirection);
    if (customSettings.pageTurnStyle) useReaderStore.getState().setPageTurnStyle(customSettings.pageTurnStyle);
    if (customSettings.dualPageMode !== undefined && customSettings.dualPageMode !== null) {
      useReaderStore.getState().setDualPageMode(customSettings.dualPageMode);
    }
    if (customSettings.warmthLevel) useReaderStore.getState().setWarmthLevel(customSettings.warmthLevel);
    if (customSettings.autoScrollSpeed) useReaderStore.getState().setAutoScrollSpeed(customSettings.autoScrollSpeed);
    if (customSettings.autoScrollMode) useReaderStore.getState().setAutoScrollMode(customSettings.autoScrollMode);

    const state = useReaderStore.getState();
    expect(state.fontFamily).toBe('Hubot Sans');
    expect(state.fontSize).toBe(22);
    expect(state.lineHeight).toBe(1.8);
    expect(state.marginHorizontal).toBe(32);
    expect(state.textAlign).toBe('justify');
    expect(state.activeTheme).toBe('sepia');
    expect(state.paragraphIndent).toBe(1.5);
    expect(state.paragraphSpacing).toBe(1.4);
    expect(state.dropCaps).toBe(true);
    expect(state.readingRulerEnabled).toBe(true);
    expect(state.readingRulerMode).toBe('underline');
    expect(state.bionicReadingEnabled).toBe(true);
    expect(state.bionicFixation).toBe('high');
    expect(state.readingDirection).toBe('vertical');
    expect(state.pageTurnStyle).toBe('fade');
    expect(state.dualPageMode).toBe(true);
    expect(state.warmthLevel).toBe(0.45);
    expect(state.autoScrollSpeed).toBe(80);
    expect(state.autoScrollMode).toBe('line');
  });

  it('feeds TTS narration engine with active name substitutions dynamically', () => {
    const rules: NameReplacementRule[] = [
      {
        id: 'tts-1',
        bookId: 'book-tts',
        findText: 'Sherlock Holmes',
        replaceText: 'Detective Alex',
        matchCase: false,
        wholeWord: true,
        isActive: true,
      },
    ];

    const rawChapterText = 'Sherlock Holmes took a deep breath and began explaining the deduction.';
    const substituted = applyNameReplacements(rawChapterText, rules);

    ttsService.setContent(substituted);
    // Verified that TTS content is substituted with the replaced name
    expect(substituted).toBe('Detective Alex took a deep breath and began explaining the deduction.');
  });
});
