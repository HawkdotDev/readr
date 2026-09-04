export interface LiteraryAlmanacEvent {
  id: string;
  dateStr: string; // e.g., "September 3"
  year: number;
  category: 'Milestone' | 'Birthday' | 'Publication' | 'Nobel Prize' | 'Manuscript';
  headline: string;
  description: string;
  authorOrBook: string;
  significance: string;
  accentColor: string;
}

export const LITERARY_ALMANAC_EVENTS: LiteraryAlmanacEvent[] = [
  {
    id: 'almanac_sep_3',
    dateStr: 'September 3',
    year: 1952,
    category: 'Publication',
    headline: 'Ernest Hemingway Publishes The Old Man and the Sea',
    description:
      'Life magazine published the complete 27,000-word text of "The Old Man and the Sea", selling 5.3 million copies within 48 hours and revitalizing Hemingway’s global literary reputation.',
    authorOrBook: 'Ernest Hemingway',
    significance: 'Earned Hemingway the Pulitzer Prize for Fiction in 1953 and contributed directly to his 1954 Nobel Prize in Literature.',
    accentColor: '#3B82F6',
  },
  {
    id: 'almanac_sep_21',
    dateStr: 'September 21',
    year: 1937,
    category: 'Publication',
    headline: 'J.R.R. Tolkien Releases The Hobbit',
    description:
      'George Allen & Unwin published the initial print run of 1,500 copies of The Hobbit in the UK. Illustrated with Tolkien’s own black-and-white drawings, it sold out by December.',
    authorOrBook: 'J.R.R. Tolkien',
    significance: 'Sparked the modern fantasy genre and led the publisher to demand a sequel, resulting in The Lord of the Rings.',
    accentColor: '#10B981',
  },
  {
    id: 'almanac_oct_16',
    dateStr: 'October 16',
    year: 1847,
    category: 'Publication',
    headline: 'Charlotte Brontë Publishes Jane Eyre Under Pseudonym',
    description:
      'Writing as Currer Bell, Charlotte Brontë published Jane Eyre in London. The fierce moral autonomy and passionate internal monologue of its heroine shocked and captivated Victorian critics.',
    authorOrBook: 'Charlotte Brontë',
    significance: 'Revolutionized prose fiction by inventing the modern first-person psychological novel.',
    accentColor: '#8B5CF6',
  },
  {
    id: 'almanac_nov_7',
    dateStr: 'November 7',
    year: 1913,
    category: 'Birthday',
    headline: 'Albert Camus Born in Mondovi, French Algeria',
    description:
      'Philosopher, journalist, and author of The Stranger and The Myth of Sisyphus was born. At age 44, he became the second-youngest recipient of the Nobel Prize in Literature.',
    authorOrBook: 'Albert Camus',
    significance: 'Pioneered Absurdism, examining the human search for inherent meaning in an indifferent universe.',
    accentColor: '#F59E0B',
  },
  {
    id: 'almanac_jan_1',
    dateStr: 'January 1',
    year: 1818,
    category: 'Publication',
    headline: 'Mary Shelley Publishes Frankenstein Anonymously',
    description:
      'Lacking a publisher name and printed in only 500 copies, Frankenstein; or, The Modern Prometheus debuted in London, written by Shelley when she was just 20 years old.',
    authorOrBook: 'Mary Shelley',
    significance: 'Universally hailed as the foundational work of modern science fiction.',
    accentColor: '#EF4444',
  },
  {
    id: 'almanac_feb_2',
    dateStr: 'February 2',
    year: 1922,
    category: 'Publication',
    headline: 'Sylvia Beach Publishes James Joyce’s Ulysses',
    description:
      'On Joyce’s 40th birthday, Shakespeare and Company in Paris printed the first copy of Ulysses, having overcome extensive censorship battles in both the US and UK.',
    authorOrBook: 'James Joyce',
    significance: 'A landmark of modernist literature that perfected stream-of-consciousness narrative technique.',
    accentColor: '#EC4899',
  },
  {
    id: 'almanac_apr_10',
    dateStr: 'April 10',
    year: 1925,
    category: 'Publication',
    headline: 'F. Scott Fitzgerald Publishes The Great Gatsby',
    description:
      'Charles Scribner’s Sons released Fitzgerald’s dazzling portrayal of Jay Gatsby’s lavish Long Island parties and the hollow disillusionment of the American Dream.',
    authorOrBook: 'F. Scott Fitzgerald',
    significance: 'Widely recognized today as one of the greatest American novels ever written.',
    accentColor: '#6366F1',
  },
  {
    id: 'almanac_jul_3',
    dateStr: 'July 3',
    year: 1883,
    category: 'Birthday',
    headline: 'Franz Kafka Born in Prague',
    description:
      'The visionary Czech-German author was born. His works, including The Metamorphosis and The Trial, were preserved against his dying wish by his close friend Max Brod.',
    authorOrBook: 'Franz Kafka',
    significance: 'Gave birth to the term "Kafkaesque" to define the surreal bureaucracy and alienation of the 20th century.',
    accentColor: '#14B8A6',
  },
  {
    id: 'almanac_dec_16',
    dateStr: 'December 16',
    year: 1775,
    category: 'Birthday',
    headline: 'Jane Austen Born in Steventon, Hampshire',
    description:
      'The seventh of eight children, Jane Austen began writing spirited burlesques and parodies of sentimental fiction in family notebooks from the age of eleven.',
    authorOrBook: 'Jane Austen',
    significance: 'Master of irony, social realism, and free indirect discourse whose six major novels remain timeless.',
    accentColor: '#F97316',
  },
];

/**
 * Returns a literary milestone for the current calendar date.
 * If no exact day match exists, uses day-of-year math for deterministic daily rotation.
 */
export function getTodayInLiterature(date: Date = new Date()): LiteraryAlmanacEvent {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const targetDateStr = `${monthNames[date.getMonth()]} ${date.getDate()}`;

  // 1. Look for exact date match
  const match = LITERARY_ALMANAC_EVENTS.find((e) => e.dateStr.toLowerCase() === targetDateStr.toLowerCase());
  if (match) return match;

  // 2. Deterministic day-of-year rotation
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const event = LITERARY_ALMANAC_EVENTS[dayOfYear % LITERARY_ALMANAC_EVENTS.length];
  return {
    ...event,
    dateStr: targetDateStr, // Display today's date for current dispatch
  };
}

export function getRandomAlmanacEvent(excludeId?: string): LiteraryAlmanacEvent {
  const pool = excludeId
    ? LITERARY_ALMANAC_EVENTS.filter((e) => e.id !== excludeId)
    : LITERARY_ALMANAC_EVENTS;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] || LITERARY_ALMANAC_EVENTS[0];
}
