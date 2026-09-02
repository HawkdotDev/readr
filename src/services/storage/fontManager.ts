import * as FileSystem from 'expo-file-system/legacy';
import { copyFileResilient } from './fileManager';

const FONTS_DIR = `${(FileSystem as any).documentDirectory || ''}fonts/`;

let customLoadedFonts: string[] = [];

/**
 * Check if a filename corresponds to a supported font format
 */
export function isFontFile(fileName: string): boolean {
  return /\.(ttf|otf|woff|woff2)$/i.test(fileName);
}

/**
 * Clean font family name from file name (e.g. "CrimsonPro-Regular.ttf" -> "CrimsonPro")
 */
export function cleanFontFamilyName(fileName: string): string {
  return fileName
    .replace(/\.(ttf|otf|woff|woff2)$/i, '')
    .replace(/[-_](regular|bold|italic|medium|semibold|light|black)/i, '')
    .trim();
}

/**
 * Ensure fonts directory exists
 */
async function ensureFontsDir(): Promise<void> {
  if ((FileSystem as any).documentDirectory) {
    const dirInfo = await FileSystem.getInfoAsync(FONTS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(FONTS_DIR, { intermediates: true });
    }
  }
}

/**
 * Pick an external .ttf/.otf/.woff font file and load it into the app
 */
export async function pickAndImportCustomFont(): Promise<{ success: boolean; fontName?: string; error?: string }> {
  try {
    await ensureFontsDir();

    let DocumentPicker: any;
    try {
      DocumentPicker = require('expo-document-picker');
    } catch {
      return { success: false, error: 'Document picker not available' };
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: ['font/*', 'application/x-font-ttf', 'application/x-font-otf', 'application/font-woff', '*/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { success: false };
    }

    const file = result.assets[0];
    const fileName = file.name || 'CustomFont.ttf';

    if (!isFontFile(fileName)) {
      return { success: false, error: 'Please select a valid .ttf, .otf, or .woff font file.' };
    }

    const cleanFontName = cleanFontFamilyName(fileName);
    const destPath = `${FONTS_DIR}${fileName}`;

    await copyFileResilient(file.uri, destPath);

    // Register with Expo Font dynamically
    try {
      const Font = require('expo-font');
      await Font.loadAsync({
        [cleanFontName]: destPath,
      });
    } catch (fontErr) {
      console.warn('Could not register font dynamically:', fontErr);
    }

    if (!customLoadedFonts.includes(cleanFontName)) {
      customLoadedFonts.push(cleanFontName);
    }

    return { success: true, fontName: cleanFontName };
  } catch (error: any) {
    console.warn('Failed to import custom font:', error);
    return { success: false, error: error.message || 'Failed to load font file' };
  }
}

/**
 * Load all saved fonts from local storage into Expo Font on app startup
 */
export async function loadSavedCustomFonts(): Promise<string[]> {
  try {
    await ensureFontsDir();
    const files = await FileSystem.readDirectoryAsync(FONTS_DIR);
    const fontFiles = files.filter(isFontFile);

    for (const file of fontFiles) {
      const cleanFontName = cleanFontFamilyName(file);
      const fontUri = `${FONTS_DIR}${file}`;

      try {
        const Font = require('expo-font');
        await Font.loadAsync({
          [cleanFontName]: fontUri,
        });
        if (!customLoadedFonts.includes(cleanFontName)) {
          customLoadedFonts.push(cleanFontName);
        }
      } catch (err) {
        console.warn(`Could not register saved font ${cleanFontName}:`, err);
      }
    }

    return customLoadedFonts;
  } catch {
    return [];
  }
}

export function getLoadedCustomFonts(): string[] {
  return customLoadedFonts;
}
