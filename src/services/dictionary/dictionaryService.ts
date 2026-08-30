import { DictionaryDefinition } from '../../types';

// Curated offline dictionary dataset for common literary and non-fiction terms
const OFFLINE_DICTIONARY: Record<string, DictionaryDefinition> = {
  sanctuary: {
    word: 'sanctuary',
    phonetic: '/ˈsæŋk.tʃu.er.i/',
    partOfSpeech: 'noun',
    definition: 'A place of refuge, safety, or quiet contemplation; a sacred reserve untouched by external intrusion.',
    example: 'The library had become her quiet sanctuary away from the digital noise.',
  },
  typography: {
    word: 'typography',
    phonetic: '/taɪˈpɒɡ.rə.fi/',
    partOfSpeech: 'noun',
    definition: 'The style, arrangement, and appearance of printed or digital letters and glyphs designed for visual legibility.',
    example: 'Good typography recedes into the background, allowing the text to speak effortlessly.',
  },
  ephemeral: {
    word: 'ephemeral',
    phonetic: '/ɪˈfem.ər.əl/',
    partOfSpeech: 'adjective',
    definition: 'Lasting for a very short time; transient, fleeting.',
    example: 'The ephemeral morning mist dissolved as the sun climbed above the ridge.',
  },
  sovereignty: {
    word: 'sovereignty',
    phonetic: '/ˈsɒv.rɪn.ti/',
    partOfSpeech: 'noun',
    definition: 'Supreme power or autonomous authority; in data terms, complete ownership and local self-governance of one’s personal information.',
    example: 'Local data sovereignty guarantees that personal reading notes are never sent to remote servers.',
  },
  lucid: {
    word: 'lucid',
    phonetic: '/ˈluː.sɪd/',
    partOfSpeech: 'adjective',
    definition: 'Expressed clearly; easy to understand; bright or luminous.',
    example: 'His prose was characterized by lucid arguments and exquisite brevity.',
  },
  contemplation: {
    word: 'contemplation',
    phonetic: '/ˌkɒn.təmˈpleɪ.ʃən/',
    partOfSpeech: 'noun',
    definition: 'The action of looking thoughtfully at something for a long time; deep reflective thought.',
    example: 'He spent the quiet afternoon lost in deep contemplation.',
  },
  ergonomics: {
    word: 'ergonomics',
    phonetic: '/ˌɜː.ɡəˈnɒm.ɪks/',
    partOfSpeech: 'noun',
    definition: 'The study of people’s efficiency in their working or reading environment and the design of interfaces to minimize physical strain.',
    example: 'The reader features typographic ergonomics tuned to prevent eye fatigue.',
  },
  fidelity: {
    word: 'fidelity',
    phonetic: '/fɪˈdel.ə.ti/',
    partOfSpeech: 'noun',
    definition: 'Faithfulness to a person, cause, or belief; the degree of exactness with which something is copied or rendered.',
    example: 'The layout renders complex book structures with pristine fidelity.',
  },
};

export async function lookupWord(rawWord: string): Promise<DictionaryDefinition | null> {
  const cleanWord = rawWord
    .toLowerCase()
    .replace(/^[^a-z]+|[^a-z]+$/g, '')
    .trim();

  if (!cleanWord) return null;

  // 1. Direct offline dictionary match
  if (OFFLINE_DICTIONARY[cleanWord]) {
    return OFFLINE_DICTIONARY[cleanWord];
  }

  // 2. Optional lightweight web definition fallback with strict timeout
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 1200) : null;

    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`, {
      headers: { 'Accept': 'application/json' },
      signal: controller ? controller.signal : undefined,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const meaning = item.meanings?.[0];
        const def = meaning?.definitions?.[0];
        return {
          word: item.word || cleanWord,
          phonetic: item.phonetic || item.phonetics?.[0]?.text || `/${cleanWord}/`,
          partOfSpeech: meaning?.partOfSpeech || 'noun',
          definition: def?.definition || 'No detailed definition available.',
          example: def?.example || undefined,
        };
      }
    }
  } catch {}

  // 3. Fallback entry
  return {
    word: cleanWord,
    phonetic: `/${cleanWord}/`,
    partOfSpeech: 'word',
    definition: `A term referenced in your book: "${cleanWord}". Tap to search definitions or translations in external reference apps.`,
  };
}
