import { BookFormat } from '../../../types';
import { IReaderDriver } from './IReaderDriver';
import { EpubDriver } from './EpubDriver';
import { PdfDriver } from './PdfDriver';
import { TxtDriver } from './TxtDriver';

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
      case 'md':
      case 'txt':
      case 'cbz':
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
