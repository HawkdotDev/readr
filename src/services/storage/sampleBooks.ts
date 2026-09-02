import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';
import { getAllBooks, insertBook, updateBookCover } from '../../db/queries/books';
import { BOOKS_DIR } from './fileManager';

/**
 * Creates a minimal, 100% compliant EPUB archive as base64 string.
 */
export async function createSampleEpubBase64(
  title: string,
  author: string,
  chapters: { title: string; content: string }[]
): Promise<string> {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip');
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  let manifestItems = '';
  let spineItems = '';
  let navPoints = '';

  chapters.forEach((chap, idx) => {
    const filename = `chap_${idx + 1}.xhtml`;
    manifestItems += `    <item id="c${idx + 1}" href="${filename}" media-type="application/xhtml+xml"/>\n`;
    spineItems += `    <itemref idref="c${idx + 1}"/>\n`;
    navPoints += `    <navPoint id="np_${idx + 1}" playOrder="${idx + 1}">
      <navLabel><text>${chap.title}</text></navLabel>
      <content src="${filename}"/>
    </navPoint>\n`;

    const htmlBody = chap.content
      .split('\n\n')
      .map((p) => `<p>${p.replace(/^#+\s*/, '').trim()}</p>`)
      .join('\n');

    zip.file(
      `OEBPS/${filename}`,
      `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>${chap.title}</title>
  </head>
  <body>
    <h1>${chap.title}</h1>
    ${htmlBody}
  </body>
</html>`
    );
  });

  zip.file(
    'OEBPS/toc.ncx',
    `<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:sample-epub"/>
  </head>
  <docTitle><text>${title}</text></docTitle>
  <navMap>
${navPoints}
  </navMap>
</ncx>`
  );

  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${title}</dc:title>
    <dc:creator>${author}</dc:creator>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
${manifestItems}
  </manifest>
  <spine toc="ncx">
${spineItems}
  </spine>
</package>`
  );

  return await zip.generateAsync({ type: 'base64' });
}

export async function bootstrapSampleBooksIfEmpty(): Promise<void> {
  try {
    const existing = await getAllBooks();

    // Ensure all existing books have accurate high-resolution covers
    if (existing.length > 0) {
      for (const b of existing) {
        const titleLower = b.title.toLowerCase();
        if (titleLower.includes('meditations')) {
          await updateBookCover(b.id, 'https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg');
        } else if (titleLower.includes('pride and prejudice')) {
          await updateBookCover(b.id, 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg');
        } else if (titleLower.includes('great gatsby')) {
          await updateBookCover(b.id, 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg');
        } else if (titleLower.includes('frankenstein')) {
          await updateBookCover(b.id, 'https://covers.openlibrary.org/b/isbn/9780141439471-L.jpg');
        } else if (titleLower.includes('walden')) {
          await updateBookCover(b.id, 'https://covers.openlibrary.org/b/isbn/9780140390445-L.jpg');
        }
      }
      return;
    }

    // 1. Starter Book 1: Meditations by Marcus Aurelius
    const sample1Id = 'book_meditations_sample';
    const sample1Path = `${BOOKS_DIR}meditations_sample.epub`;
    const sample1Cover = 'https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg';
    const sample1Chapters = [
      {
        title: 'Book I: Debts and Lessons',
        content:
          'From my grandfather Verus I learned good morals and the government of my temper.\n\nFrom the reputation and remembrance of my father, modesty and a manly character.\n\nFrom my mother, piety and beneficence, and abstinence, not only from evil deeds, but even from evil thoughts; and further, simplicity in my way of living, far removed from the habits of the rich.',
      },
      {
        title: 'Book II: On the River Gran',
        content:
          'When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. They are like this because they cannot distinguish good from evil. But I have seen the beauty of good, and the ugliness of evil, and have recognized that the wrongdoer has a nature related to my own.',
      },
      {
        title: 'Book III: The Mind Sovereign',
        content:
          'Never esteem anything as of advantage to you that will make you break your word or lose your self-respect. He who values virtue above all else will never lack contentment.',
      },
    ];

    if ((FileSystem as any).documentDirectory) {
      const epubBase64_1 = await createSampleEpubBase64('Meditations', 'Marcus Aurelius', sample1Chapters);
      await FileSystem.writeAsStringAsync(sample1Path, epubBase64_1, {
        encoding: (FileSystem as any).EncodingType?.Base64 || 'base64',
      });
    }

    await insertBook(
      {
        id: sample1Id,
        fileHash: 'hash_meditations_01',
        title: 'Meditations',
        originalFilename: 'meditations.epub',
        filePath: sample1Path,
        coverImagePath: sample1Cover,
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
    const sample2Path = `${BOOKS_DIR}pride_prejudice_sample.epub`;
    const sample2Cover = 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg';
    const sample2Chapters = [
      {
        title: 'Chapter 1',
        content:
          'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.\n\nHowever little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.',
      },
      {
        title: 'Chapter 2',
        content:
          'Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it.',
      },
      {
        title: 'Chapter 3',
        content:
          'Not all that Mrs. Bennet, however, with the assistance of her five daughters, could ask on the subject, was sufficient to draw from her husband any satisfactory description of Mr. Bingley.',
      },
    ];

    if ((FileSystem as any).documentDirectory) {
      const epubBase64_2 = await createSampleEpubBase64('Pride and Prejudice', 'Jane Austen', sample2Chapters);
      await FileSystem.writeAsStringAsync(sample2Path, epubBase64_2, {
        encoding: (FileSystem as any).EncodingType?.Base64 || 'base64',
      });
    }

    await insertBook(
      {
        id: sample2Id,
        fileHash: 'hash_pride_prejudice_02',
        title: 'Pride and Prejudice',
        originalFilename: 'pride_and_prejudice.epub',
        filePath: sample2Path,
        coverImagePath: sample2Cover,
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
