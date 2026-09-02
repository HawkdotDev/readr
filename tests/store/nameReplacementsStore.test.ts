import { describe, it, expect, beforeEach } from 'bun:test';
import { useReaderStore } from '../../src/store/readerStore';
import { NameReplacementRule } from '../../src/types/nameReplacer';

describe('Reader Store Name Replacements & Per-Book Settings Actions', () => {
  beforeEach(() => {
    useReaderStore.setState({
      nameReplacements: [],
      activeSheet: 'none',
      fontFamily: 'Literata',
      fontSize: 18,
      lineHeight: 1.5,
      bionicReadingEnabled: false,
      warmthLevel: 0.0,
      autoScrollSpeed: 45,
    });
  });

  it('manages name replacements list in store', () => {
    const rule1: NameReplacementRule = {
      id: 'rule-1',
      bookId: 'book-A',
      findText: 'Sherlock',
      replaceText: 'Detective Alex',
      matchCase: false,
      wholeWord: true,
      isActive: true,
    };

    const rule2: NameReplacementRule = {
      id: 'rule-2',
      bookId: 'book-A',
      findText: 'Watson',
      replaceText: 'Jordan',
      matchCase: false,
      wholeWord: true,
      isActive: true,
    };

    useReaderStore.getState().setNameReplacements([rule1]);
    expect(useReaderStore.getState().nameReplacements.length).toBe(1);

    useReaderStore.getState().addNameReplacement(rule2);
    expect(useReaderStore.getState().nameReplacements.length).toBe(2);

    useReaderStore.getState().toggleNameReplacement('rule-1');
    expect(useReaderStore.getState().nameReplacements.find((r) => r.id === 'rule-1')?.isActive).toBe(false);

    useReaderStore.getState().updateNameReplacement('rule-2', { replaceText: 'Dr. Jordan' });
    expect(useReaderStore.getState().nameReplacements.find((r) => r.id === 'rule-2')?.replaceText).toBe('Dr. Jordan');

    useReaderStore.getState().removeNameReplacement('rule-1');
    expect(useReaderStore.getState().nameReplacements.length).toBe(1);
    expect(useReaderStore.getState().nameReplacements[0].id).toBe('rule-2');
  });

  it('manages nameReplacement activeSheet state', () => {
    useReaderStore.getState().setActiveSheet('nameReplacement');
    expect(useReaderStore.getState().activeSheet).toBe('nameReplacement');

    useReaderStore.getState().closeSheet();
    expect(useReaderStore.getState().activeSheet).toBe('none');
  });

  it('resets name replacements when current book changes', () => {
    useReaderStore.getState().setNameReplacements([
      {
        id: 'r-1',
        bookId: 'b-1',
        findText: 'Alice',
        replaceText: 'Bob',
        matchCase: true,
        wholeWord: true,
        isActive: true,
      },
    ]);

    expect(useReaderStore.getState().nameReplacements.length).toBe(1);

    useReaderStore.getState().setCurrentBook(null);
    expect(useReaderStore.getState().nameReplacements.length).toBe(0);
  });
});
