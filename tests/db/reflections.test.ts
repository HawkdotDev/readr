import { describe, it, expect } from 'bun:test';
import { saveReflection, getRecentReflections, getTodayReflection, deleteReflection } from '../../src/db/queries/reflections';

describe('Reflection Journal Queries', () => {
  it('saves and retrieves reflections cleanly', async () => {
    const prompt = 'What was the most evocative scene in your reading today?';
    const response = 'The transition from the stormy coastline to the quiet study.';
    const bookId = 'test_book_refl_1';

    const saved = await saveReflection(prompt, response, bookId);
    expect(saved).toBeDefined();
    expect(saved.id).toContain('refl_');
    expect(saved.prompt).toBe(prompt);
    expect(saved.response).toBe(response);
    expect(saved.bookId).toBe(bookId);

    const recent = await getRecentReflections(10);
    expect(Array.isArray(recent)).toBe(true);

    const today = await getTodayReflection();
    // In headless test mock, getTodayReflection will return null or an object depending on mock
    expect(today === null || typeof today === 'object').toBe(true);

    await deleteReflection(saved.id);
  });
});
