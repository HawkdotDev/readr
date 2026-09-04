export interface LiteraryWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  literaryExample: string;
  citation: string;
  etymology: string;
}

export const LITERARY_WORDS: LiteraryWord[] = [
  {
    id: 'lex_apricity',
    word: 'Apricity',
    phonetic: '/eɪˈprɪs.ə.ti/',
    partOfSpeech: 'noun',
    definition: 'The pleasant, restorative warmth of the sun on a cold winter day.',
    literaryExample:
      'She paused in the monastery courtyard, closing her eyes to bathe in the brief, golden apricity of an otherwise unforgiving December afternoon.',
    citation: 'Historical English, first recorded in 1623',
    etymology: 'From Latin apricitas, from apricus (“exposed to the sun, basking”).',
  },
  {
    id: 'lex_sonder',
    word: 'Sonder',
    phonetic: '/ˈsɒn.dər/',
    partOfSpeech: 'noun',
    definition:
      'The profound realization that every random passerby is living a life as vivid, complex, and filled with ambition as your own.',
    literaryExample:
      'Sitting at the Paris café window, a sudden rush of sonder washed over him as hundreds of strangers hurried through the twilight rain.',
    citation: 'The Dictionary of Obscure Sorrows',
    etymology: 'Coined by John Koenig, related to German sonder- (“special, distinct”).',
  },
  {
    id: 'lex_susurrus',
    word: 'Susurrus',
    phonetic: '/suːˈsʌr.əs/',
    partOfSpeech: 'noun',
    definition: 'An indistinct whispering, murmuring sound, or rustling whisper.',
    literaryExample:
      'A gentle susurrus moved through the ancient library as turning vellum pages mingled with the autumn wind against leaded glass.',
    citation: 'Nathaniel Hawthorne, The House of the Seven Gables',
    etymology: 'Directly from Latin susurrus (“a whisper, mutter, buzz”).',
  },
  {
    id: 'lex_petrichor',
    word: 'Petrichor',
    phonetic: '/ˈpɛt.rɪ.kɔːr/',
    partOfSpeech: 'noun',
    definition: 'The earthy, nostalgic scent produced when rain falls on dry stone or parched earth.',
    literaryExample:
      'As the first drops struck the sun-baked stones of Florence, the intoxicating petrichor signaled the end of a long Mediterranean drought.',
    citation: 'Nature (1964), coined by Bear & Thomas',
    etymology: 'From Greek petra (“stone”) + ichor (“the ethereal fluid that courses in the veins of the gods”).',
  },
  {
    id: 'lex_defamiliarization',
    word: 'Defamiliarization',
    phonetic: '/diː.fəˌmɪl.jə.raɪˈzeɪ.ʃən/',
    partOfSpeech: 'noun',
    definition:
      'The literary and artistic technique of presenting common, habitual things in an unfamiliar or strange way to enhance perception.',
    literaryExample:
      'Tolstoy mastered defamiliarization by describing an opera through the eyes of a bewildered country horse rather than a bourgeois critic.',
    citation: 'Viktor Shklovsky, Art as Technique (1917)',
    etymology: 'From Russian ostranenie (“making strange”).',
  },
  {
    id: 'lex_sehnsucht',
    word: 'Sehnsucht',
    phonetic: '/ˈzeːnˌzʊxt/',
    partOfSpeech: 'noun',
    definition:
      'A deep, incurable yearning for an elusive, transcendent homeland or state of spiritual completeness.',
    literaryExample:
      'In the quiet hours before dawn, Lewis identified his lifelong sense of aesthetic longing not as grief, but as divine Sehnsucht.',
    citation: 'C.S. Lewis, Surprised by Joy',
    etymology: 'German compound of das Sehnen (“yearning”) + die Sucht (“craving/passion”).',
  },
  {
    id: 'lex_epiphany',
    word: 'Epiphany',
    phonetic: '/ɪˈpɪf.ən.i/',
    partOfSpeech: 'noun',
    definition:
      'A sudden, intuitive moment of profound insight or revelation sparked by an ordinary everyday event.',
    literaryExample:
      'In that fleeting gesture with the falling snow upon the window pane, Gabriel experienced an overwhelming epiphany regarding his past.',
    citation: 'James Joyce, The Dead (Dubliners)',
    etymology: 'From Ancient Greek epiphaneia (“manifestation, appearance”).',
  },
];

export function getWordOfTheDay(date: Date = new Date()): LiteraryWord {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  return LITERARY_WORDS[dayOfYear % LITERARY_WORDS.length];
}

export function getRandomLiteraryWord(excludeId?: string): LiteraryWord {
  const pool = excludeId ? LITERARY_WORDS.filter((w) => w.id !== excludeId) : LITERARY_WORDS;
  return pool[Math.floor(Math.random() * pool.length)] || LITERARY_WORDS[0];
}
