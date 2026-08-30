import { describe, it, expect } from 'bun:test';
import { lookupWord } from '../../src/services/dictionary/dictionaryService';

describe('Dictionary Service', () => {
  it('looks up offline defined words instantly', async () => {
    const res = await lookupWord('sanctuary');
    expect(res).not.toBeNull();
    expect(res?.word).toBe('sanctuary');
    expect(res?.partOfSpeech).toBe('noun');
    expect(res?.definition).toContain('refuge');
  });

  it('strips punctuation and whitespace from lookups', async () => {
    const res = await lookupWord('“Typography!”');
    expect(res).not.toBeNull();
    expect(res?.word).toBe('typography');
  });

  it('provides a graceful fallback for unlisted words', async () => {
    const res = await lookupWord('antigravity');
    expect(res).not.toBeNull();
    expect(res?.word).toBe('antigravity');
  });
});
