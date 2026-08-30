import * as FileSystem from 'expo-file-system/legacy';
import { getAllBooks, insertBook } from '../../db/queries/books';
import { BOOKS_DIR } from './fileManager';

export async function bootstrapSampleBooksIfEmpty(): Promise<void> {
  try {
    const existing = await getAllBooks();
    if (existing.length > 0) return;

    // 1. Starter Book 1: Meditations by Marcus Aurelius
    const sample1Id = 'book_meditations_sample';
    const sample1Path = `${BOOKS_DIR}meditations_sample.txt`;
    const sample1Content = `# Meditations
By Marcus Aurelius

## Book I: Debts and Lessons
From my grandfather Verus I learned good morals and the government of my temper.
From the reputation and remembrance of my father, modesty and a manly character.
From my mother, piety and beneficence, and abstinence, not only from evil deeds, but even from evil thoughts; and further, simplicity in my way of living, far removed from the habits of the rich.

## Book II: On the River Gran
When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. They are like this because they cannot distinguish good from evil. But I have seen the beauty of good, and the ugliness of evil, and have recognized that the wrongdoer has a nature related to my own.

## Book III: The Mind Sovereign
Never esteem anything as of advantage to you that will make you break your word or lose your self-respect. He who values virtue above all else will never lack contentment.`;

    if ((FileSystem as any).documentDirectory) {
      await FileSystem.writeAsStringAsync(sample1Path, sample1Content);
    }

    await insertBook(
      {
        id: sample1Id,
        fileHash: 'hash_meditations_01',
        title: 'Meditations',
        originalFilename: 'meditations.epub',
        filePath: sample1Path,
        fileFormat: 'epub',
        fileSizeBytes: 24500,
        pageCount: 160,
        progressPercentage: 12.0,
        status: 'reading',
        isFavorite: true,
        totalTimeReadSeconds: 1420,
      },
      [{ name: 'Marcus Aurelius', sortName: 'Aurelius, Marcus' }],
      [
        { title: 'Book I: Debts and Lessons', playOrder: 1, level: 0 },
        { title: 'Book II: On the River Gran', playOrder: 2, level: 0 },
        { title: 'Book III: The Mind Sovereign', playOrder: 3, level: 0 },
      ]
    );

    // 2. Starter Book 2: Pride and Prejudice by Jane Austen
    const sample2Id = 'book_pride_prejudice_sample';
    const sample2Path = `${BOOKS_DIR}pride_prejudice_sample.txt`;
    const sample2Content = `# Pride and Prejudice
By Jane Austen

## Chapter 1
It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

## Chapter 2
Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it.

## Chapter 3
Not all that Mrs. Bennet, however, with the assistance of her five daughters, could ask on the subject, was sufficient to draw from her husband any satisfactory description of Mr. Bingley.`;

    if ((FileSystem as any).documentDirectory) {
      await FileSystem.writeAsStringAsync(sample2Path, sample2Content);
    }

    await insertBook(
      {
        id: sample2Id,
        fileHash: 'hash_pride_prejudice_02',
        title: 'Pride and Prejudice',
        originalFilename: 'pride_and_prejudice.epub',
        filePath: sample2Path,
        fileFormat: 'epub',
        fileSizeBytes: 32000,
        pageCount: 340,
        progressPercentage: 0.0,
        status: 'unread',
        isFavorite: false,
        totalTimeReadSeconds: 0,
      },
      [{ name: 'Jane Austen', sortName: 'Austen, Jane' }],
      [
        { title: 'Chapter 1', playOrder: 1, level: 0 },
        { title: 'Chapter 2', playOrder: 2, level: 0 },
        { title: 'Chapter 3', playOrder: 3, level: 0 },
      ]
    );
  } catch (err) {
    console.warn('Sample book bootstrap skipped or failed:', err);
  }
}
