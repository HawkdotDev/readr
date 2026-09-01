import { describe, it, expect } from 'bun:test';
import { ReaderDriverFactory } from '../../src/services/reader/drivers/driverFactory';
import { EpubDriver } from '../../src/services/reader/drivers/EpubDriver';
import { PdfDriver } from '../../src/services/reader/drivers/PdfDriver';
import { TxtDriver } from '../../src/services/reader/drivers/TxtDriver';
import { ComicDriver } from '../../src/services/reader/drivers/ComicDriver';
import { MobiDriver } from '../../src/services/reader/drivers/MobiDriver';
import { Fb2Driver } from '../../src/services/reader/drivers/Fb2Driver';
import { DocxDriver } from '../../src/services/reader/drivers/DocxDriver';
import { parseChapterContent } from '../../src/services/reader/epubBridge';

describe('Reader Format Drivers (SOLID / OCP)', () => {
  it('instantiates appropriate format drivers from factory', () => {
    const epubDriver = ReaderDriverFactory.getDriver('epub');
    expect(epubDriver).toBeInstanceOf(EpubDriver);
    expect(epubDriver.format).toBe('epub');

    const pdfDriver = ReaderDriverFactory.getDriver('pdf');
    expect(pdfDriver).toBeInstanceOf(PdfDriver);
    expect(pdfDriver.format).toBe('pdf');

    const txtDriver = ReaderDriverFactory.getDriver('txt');
    expect(txtDriver).toBeInstanceOf(TxtDriver);
    expect(txtDriver.format).toBe('txt');

    const mdDriver = ReaderDriverFactory.getDriver('md');
    expect(mdDriver).toBeInstanceOf(TxtDriver);
    expect(mdDriver.format).toBe('md');

    const cbzDriver = ReaderDriverFactory.getDriver('cbz');
    expect(cbzDriver).toBeInstanceOf(ComicDriver);
    expect(cbzDriver.format).toBe('cbz');

    const mobiDriver = ReaderDriverFactory.getDriver('mobi');
    expect(mobiDriver).toBeInstanceOf(MobiDriver);
    expect(mobiDriver.format).toBe('mobi');

    const fb2Driver = ReaderDriverFactory.getDriver('fb2');
    expect(fb2Driver).toBeInstanceOf(Fb2Driver);
    expect(fb2Driver.format).toBe('fb2');

    const docxDriver = ReaderDriverFactory.getDriver('docx');
    expect(docxDriver).toBeInstanceOf(DocxDriver);
    expect(docxDriver.format).toBe('docx');
  });

  it('calculates EPUB reading progress reliably from chapter identifiers', () => {
    const driver = new EpubDriver();
    // 10 chapters total, currently on chapter index 4 (chap_4) -> 5th chapter -> 50%
    const progress = driver.calculateProgress('chap_4', 10);
    expect(progress).toBe(50);

    // Chapter index 9 on 10 chapters -> 100%
    const endProgress = driver.calculateProgress('chap_9_pos_450', 10);
    expect(endProgress).toBe(100);

    // Zero items fallback
    expect(driver.calculateProgress('', 0)).toBe(0);
  });

  it('calculates Comic, Mobi, FB2 and Docx progress reliably', () => {
    const comicDriver = new ComicDriver('cbz');
    expect(comicDriver.calculateProgress('page_10', 40)).toBe(25);

    const mobiDriver = new MobiDriver('mobi');
    expect(mobiDriver.calculateProgress('pos_50', 100)).toBe(50);

    const fb2Driver = new Fb2Driver();
    expect(fb2Driver.calculateProgress('sec_4', 8)).toBe(50);

    const docxDriver = new DocxDriver('docx');
    expect(docxDriver.calculateProgress('page_3', 10)).toBe(30);
  });

  it('calculates PDF and TXT progress reliably', () => {
    const pdfDriver = new PdfDriver();
    expect(pdfDriver.calculateProgress('page_5', 20)).toBe(25);

    const txtDriver = new TxtDriver('txt');
    expect(txtDriver.calculateProgress('75', 100)).toBe(75);
  });

  it('parses chapter HTML into structured headings and paragraphs', () => {
    const sampleHtml = '<h1>Chapter 1: The Beginning</h1><p>It was a dark and stormy night.</p><h2>Section A</h2><p>The wind howled outside.</p>';
    const blocks = parseChapterContent(sampleHtml);

    expect(blocks.length).toBe(4);
    expect(blocks[0].type).toBe('h1');
    expect(blocks[0].text).toBe('Chapter 1: The Beginning');

    expect(blocks[1].type).toBe('paragraph');
    expect(blocks[1].text).toBe('It was a dark and stormy night.');
    expect(blocks[1].words).toEqual(['It', 'was', 'a', 'dark', 'and', 'stormy', 'night.']);

    expect(blocks[2].type).toBe('h2');
    expect(blocks[2].text).toBe('Section A');

    expect(blocks[3].type).toBe('paragraph');
  });
});
