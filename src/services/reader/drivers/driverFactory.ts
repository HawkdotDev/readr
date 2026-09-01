import { BookFormat } from '../../../types';
import { IReaderDriver } from './IReaderDriver';
import { EpubDriver } from './EpubDriver';
import { PdfDriver } from './PdfDriver';
import { TxtDriver } from './TxtDriver';
import { ComicDriver } from './ComicDriver';
import { MobiDriver } from './MobiDriver';
import { Fb2Driver } from './Fb2Driver';
import { DocxDriver } from './DocxDriver';

export class ReaderDriverFactory {
  private static drivers: Map<BookFormat, IReaderDriver> = new Map();

  static getDriver(format: BookFormat): IReaderDriver {
    if (this.drivers.has(format)) {
      return this.drivers.get(format)!;
    }

    let driver: IReaderDriver;
    switch (format) {
      case 'epub':
        driver = new EpubDriver();
        break;
      case 'pdf':
        driver = new PdfDriver();
        break;
      case 'cbz':
      case 'cbr':
        driver = new ComicDriver(format);
        break;
      case 'mobi':
      case 'azw3':
        driver = new MobiDriver(format);
        break;
      case 'fb2':
        driver = new Fb2Driver();
        break;
      case 'docx':
      case 'rtf':
      case 'html':
        driver = new DocxDriver(format);
        break;
      case 'md':
      case 'txt':
      default:
        driver = new TxtDriver(format);
        break;
    }

    this.drivers.set(format, driver);
    return driver;
  }

  static registerDriver(format: BookFormat, driver: IReaderDriver): void {
    this.drivers.set(format, driver);
  }
}
