import { Linking, Share, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { captureRef } from 'react-native-view-shot';
import { LiteraryWord } from '../editorial/literaryLexiconService';

export type SocialPlatform = 'twitter' | 'threads' | 'instagram' | 'whatsapp' | 'general';

export interface SocialCardThemeConfig {
  id: 'paper' | 'obsidian' | 'bookcloth' | 'bento';
  name: string;
  backgroundColor: string;
  cardBorderColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  accentColor: string;
  quoteBoxBg: string;
  badgeBg: string;
  badgeBorder: string;
  watermarkColor: string;
}

export const SOCIAL_CARD_THEMES: Record<string, SocialCardThemeConfig> = {
  paper: {
    id: 'paper',
    name: 'Editorial Paper',
    backgroundColor: '#FDFBF7',
    cardBorderColor: '#E7E0D3',
    primaryTextColor: '#1C1917',
    secondaryTextColor: '#78716C',
    accentColor: '#B45309',
    quoteBoxBg: '#F5EFEB',
    badgeBg: '#EDE4D8',
    badgeBorder: '#DDD1C1',
    watermarkColor: '#9C9589',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Dark',
    backgroundColor: '#090D16',
    cardBorderColor: '#1E293B',
    primaryTextColor: '#F8FAFC',
    secondaryTextColor: '#94A3B8',
    accentColor: '#F59E0B',
    quoteBoxBg: '#131B2E',
    badgeBg: '#1E293B',
    badgeBorder: '#334155',
    watermarkColor: '#64748B',
  },
  bookcloth: {
    id: 'bookcloth',
    name: 'Emerald Cloth',
    backgroundColor: '#064E3B',
    cardBorderColor: '#047857',
    primaryTextColor: '#F0FDF4',
    secondaryTextColor: '#A7F3D0',
    accentColor: '#FCD34D',
    quoteBoxBg: '#065F46',
    badgeBg: '#047857',
    badgeBorder: '#10B981',
    watermarkColor: '#6EE7B7',
  },
  bento: {
    id: 'bento',
    name: 'Modern Bento',
    backgroundColor: '#18181B',
    cardBorderColor: '#27272A',
    primaryTextColor: '#FAFAFA',
    secondaryTextColor: '#A1A1AA',
    accentColor: '#38BDF8',
    quoteBoxBg: '#27272A',
    badgeBg: '#3F3F46',
    badgeBorder: '#52525B',
    watermarkColor: '#71717A',
  },
};

/**
 * Generate platform-tailored post captions with appropriate tags and formatting.
 */
export function generateWordSocialPost(
  word: LiteraryWord,
  platform: SocialPlatform = 'general'
): string {
  const cleanWord = word.word.trim();
  const cleanDef = word.definition.trim();
  const cleanExample = word.literaryExample.trim();
  const cleanCitation = word.citation.trim();

  switch (platform) {
    case 'twitter': {
      // 280-char optimized punchy format
      const base = `📖 Word of the Day: ${cleanWord} (${word.phonetic} • ${word.partOfSpeech})\n\n"${cleanDef}"\n\n"${cleanExample}" — ${cleanCitation}\n\n#WordOfTheDay #Literature #Lexicon via @ReadrApp`;
      return base;
    }

    case 'threads':
    case 'instagram': {
      return (
        `✨ WORD OF THE DAY: ${cleanWord.toUpperCase()}\n` +
        `${word.phonetic} · ${word.partOfSpeech}\n\n` +
        `📖 Definition:\n${cleanDef}\n\n` +
        `✒️ In Literature:\n"${cleanExample}"\n— ${cleanCitation}\n\n` +
        `🌱 Origin:\n${word.etymology}\n\n` +
        `Curated on Readr — the local-first e-reader.\n` +
        `#WordOfTheDay #Literature #BookTok #Lexicon #BookCommunity #Readr`
      );
    }

    case 'whatsapp': {
      return (
        `*${cleanWord}* (${word.phonetic}) — _${word.partOfSpeech}_\n\n` +
        `*Definition:* ${cleanDef}\n\n` +
        `_"${cleanExample}"_\n— ${cleanCitation}\n\n` +
        `*Etymology:* ${word.etymology}\n\n` +
        `_Shared via Readr_`
      );
    }

    case 'general':
    default: {
      return (
        `Word of the Day: ${cleanWord} (${word.phonetic} • ${word.partOfSpeech})\n\n` +
        `Definition: ${cleanDef}\n\n` +
        `"${cleanExample}" — ${cleanCitation}\n\n` +
        `Origin: ${word.etymology}\n\n` +
        `Read via Readr`
      );
    }
  }
}

/**
 * Launch Twitter / X Web Intent with pre-filled tweet text
 */
export async function openTwitterIntent(text: string): Promise<boolean> {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  const canOpen = await Linking.canOpenURL(url).catch(() => false);
  if (canOpen) {
    await Linking.openURL(url);
    return true;
  }
  return false;
}

/**
 * Launch Threads Web Intent with pre-filled post text
 */
export async function openThreadsIntent(text: string): Promise<boolean> {
  const url = `https://threads.net/intent/post?text=${encodeURIComponent(text)}`;
  const canOpen = await Linking.canOpenURL(url).catch(() => false);
  if (canOpen) {
    await Linking.openURL(url);
    return true;
  }
  return false;
}

/**
 * Launch WhatsApp direct share with pre-filled text
 */
export async function openWhatsAppIntent(text: string): Promise<boolean> {
  const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
  const canOpen = await Linking.canOpenURL(url).catch(() => false);
  if (canOpen) {
    await Linking.openURL(url);
    return true;
  } else {
    // Fallback to web whatsapp
    const webUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    await Linking.openURL(webUrl).catch(() => {});
    return true;
  }
}

/**
 * Copy post caption to system clipboard
 */
export async function copyPostText(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

/**
 * Capture a visual card View reference into a PNG file
 */
export async function captureCardImage(viewRef: any): Promise<string | null> {
  if (!viewRef || !viewRef.current) return null;
  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1.0,
      result: 'tmpfile',
    });
    return uri;
  } catch (err) {
    console.warn('captureCardImage failed:', err);
    return null;
  }
}

/**
 * Share an image file via native iOS/Android share sheet or fallback to Share.share
 */
export async function shareCardImage(
  imageUri: string,
  fallbackText?: string,
  title: string = 'Share Word of the Day'
): Promise<boolean> {
  try {
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable && imageUri) {
      await Sharing.shareAsync(imageUri, {
        mimeType: 'image/png',
        dialogTitle: title,
        UTI: 'public.png',
      });
      return true;
    }

    // Fallback to standard system text/link sharing
    if (fallbackText) {
      await Share.share({
        message: fallbackText,
        title,
      });
      return true;
    }

    return false;
  } catch (err) {
    console.warn('shareCardImage failed:', err);
    return false;
  }
}
