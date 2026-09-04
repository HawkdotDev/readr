export interface LiteraryLoreItem {
  id: string;
  headline: string;
  era: string;
  readTime: string;
  authorSubject: string;
  story: string;
  takeaway: string;
  tag: string;
}

export const LITERARY_LORE_STORIES: LiteraryLoreItem[] = [
  {
    id: 'lore_kafka_fire',
    headline: 'The Manuscripts That Refused to Burn',
    era: 'Prague, 1924',
    readTime: '1 min read',
    authorSubject: 'Franz Kafka & Max Brod',
    story:
      'Dying of tuberculosis at age 40, Franz Kafka wrote a strict final testament to his closest friend, Max Brod: "My last request... everything I leave behind in the way of diaries, manuscripts, letters, drafts... to be burned unread and to the last page." Brod famously refused, replying: "If you really wanted them burned, you shouldn’t have appointed me your executor." Brod preserved and edited The Trial, The Castle, and Amerika, gifting modern literature its most penetrating vision of the 20th century.',
    takeaway:
      'Had Brod obeyed his dying friend’s wish, the word "Kafkaesque" and one of the greatest bodies of literature in human history would have vanished into smoke.',
    tag: 'Literary History',
  },
  {
    id: 'lore_shelley_contest',
    headline: 'The Rainy Night in Geneva That Birthed Frankenstein',
    era: 'Villa Diodati, 1816',
    readTime: '1 min read',
    authorSubject: 'Mary Shelley & Lord Byron',
    story:
      'The year 1816 was known across Europe as "The Year Without a Summer", following the cataclysmic volcanic eruption of Mount Tambora in Indonesia. Trapped indoors by unrelenting freezing storms on Lake Geneva, Lord Byron, Percy Bysshe Shelley, and 18-year-old Mary Wollstonecraft Godwin challenged one another to write the most terrifying ghost story possible. Inspired by conversations on galvanism and bringing corpses to life with electricity, Mary experienced a waking nightmare: "I saw the pale student of unhallowed arts kneeling beside the thing he had put together." Frankenstein was born.',
    takeaway:
      'An 18-year-old woman out-wrote England’s two most famous male poets and invented modern science fiction in the process.',
    tag: 'Origins',
  },
  {
    id: 'lore_hemingway_iceberg',
    headline: 'The Six-Word Legend & The Iceberg Principle',
    era: 'Paris, 1920s',
    readTime: '1 min read',
    authorSubject: 'Ernest Hemingway',
    story:
      'While living in a chilly garret in the Latin Quarter of Paris, Ernest Hemingway formulated what he termed the "Iceberg Theory": the dignified movement of an iceberg is due to only one-eighth of it being above water. If a writer knows enough about what they are writing, they may omit things that they know and the reader, if the writer writes truly enough, will have a feeling of those things as strongly as though the writer had stated them. The famous ultra-short story—"For sale: baby shoes, never worn"—epitomizes this ethos of radical poetic subtraction.',
    takeaway:
      'Prose gains immense velocity not by what you pour in, but by the weight of what you deliberately hold back.',
    tag: 'Craft & Prose',
  },
];

export function getTodayLiteraryLore(date: Date = new Date()): LiteraryLoreItem {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  return LITERARY_LORE_STORIES[dayOfYear % LITERARY_LORE_STORIES.length];
}

export function getRandomLiteraryLore(excludeId?: string): LiteraryLoreItem {
  const pool = excludeId
    ? LITERARY_LORE_STORIES.filter((l) => l.id !== excludeId)
    : LITERARY_LORE_STORIES;
  return pool[Math.floor(Math.random() * pool.length)] || LITERARY_LORE_STORIES[0];
}
