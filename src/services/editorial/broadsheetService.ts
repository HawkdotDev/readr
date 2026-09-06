export type BroadsheetCategory = 'all' | 'philosophy' | 'poetry' | 'fiction' | 'essays';

export interface BroadsheetDispatch {
  id: string;
  category: 'philosophy' | 'poetry' | 'fiction' | 'essays';
  title: string;
  author: string;
  source: string;
  year: string;
  readTimeSeconds: number;
  keyInsight: string;
  text: string;
}

export const BROADSHEET_DISPATCHES: BroadsheetDispatch[] = [
  {
    id: 'dispatch_marcus_aurelius',
    category: 'philosophy',
    title: 'The Inner Citadel',
    author: 'Marcus Aurelius',
    source: 'Meditations, Book IV',
    year: 'c. 180 AD',
    readTimeSeconds: 45,
    keyInsight: 'On finding stillness in self-retreat',
    text: 'People look for retreats for themselves, in the country, by the coast, or in the hills. There is nowhere that a person can find a more peaceful and trouble-free retreat than in his own mind, especially if he has only to look inside to find himself in absolute tranquility. Keep giving yourself this retreat, and renew yourself. Let your basic principles be brief and fundamental, so that as soon as you turn to them they will purge you of all discontent and send you back without anger to the tasks to which you must return.',
  },
  {
    id: 'dispatch_virginia_woolf',
    category: 'fiction',
    title: 'The Waves of London',
    author: 'Virginia Woolf',
    source: 'Mrs Dalloway',
    year: '1925',
    readTimeSeconds: 50,
    keyInsight: 'The ecstasy of morning consciousness',
    text: 'In people’s eyes, in the swing, tramp, and trudge; in the bellow and the uproar; the carriages, motor cars, omnibuses, vans, sandwich men shuffling and swinging; brass bands; barrel organs; in the triumph and the jingle and the strange high singing of some aeroplane overhead was what she loved; life; London; this moment of June. For heaven only knows why one loves it so, how one sees it so, making it up, building it round one, tumbling it, creating it every moment afresh.',
  },
  {
    id: 'dispatch_mary_oliver',
    category: 'poetry',
    title: 'The Summer Day',
    author: 'Mary Oliver',
    source: 'House of Light',
    year: '1990',
    readTimeSeconds: 40,
    keyInsight: 'The urgency of wild presence',
    text: 'I don’t know exactly what a prayer is. I do know how to pay attention, how to fall down into the grass, how to kneel down in the grass, how to be idle and blessed, how to stroll through the fields, which is what I have been doing all day. Tell me, what else should I have done? Doesn’t everything die at last, and too soon? Tell me, what is it you plan to do with your one wild and precious life?',
  },
  {
    id: 'dispatch_seneca',
    category: 'philosophy',
    title: 'On the Shortness of Life',
    author: 'Lucius Annaeus Seneca',
    source: 'De Brevitate Vitae',
    year: '49 AD',
    readTimeSeconds: 45,
    keyInsight: 'Time is not scarce, we are wasteful',
    text: 'It is not that we have a short time to live, but that we waste a lot of it. Life is long enough, and a sufficiently generous estimate has been given to us for the highest achievements if it were all well invested. But when it is squandered in luxury and carelessness, when it is devoted to no good end, forced at last by the ultimate necessity we perceive that it has passed away before we were aware that it was passing.',
  },
  {
    id: 'dispatch_albert_camus',
    category: 'essays',
    title: 'Invincible Summer',
    author: 'Albert Camus',
    source: 'Return to Tipasa',
    year: '1952',
    readTimeSeconds: 45,
    keyInsight: 'The unconquerable core within',
    text: 'In the depth of winter, I finally learned that within me there lay an invincible summer. And that makes me happy. For it says that no matter how hard the world pushes against me, within me, there’s something stronger — something better, pushing right back. What is true of the individual is true of humanity. It is in the midst of ruin that we must prepare the renaissance, and in the heart of dark night that we must anticipate the morning.',
  },
  {
    id: 'dispatch_fernando_pessoa',
    category: 'poetry',
    title: 'The Marvel of Being',
    author: 'Fernando Pessoa',
    source: 'The Book of Disquiet',
    year: '1982',
    readTimeSeconds: 40,
    keyInsight: 'The boundless world of the solitary mind',
    text: 'To travel? To travel is simply to exist. I go from day to day as from station to station in the train of my body, or of my destiny, leaning over the streets and the squares, over faces and gestures, always the same and always different, as in fact all landscapes are. If I imagine, I see. What more would I do if I traveled? Only an extreme poverty of imagination justifies having to move to feel.',
  },
  {
    id: 'dispatch_franz_kafka',
    category: 'essays',
    title: 'The Axe for the Frozen Sea',
    author: 'Franz Kafka',
    source: 'Letter to Oskar Pollak',
    year: '1904',
    readTimeSeconds: 45,
    keyInsight: 'Why books must shake the soul',
    text: 'I think we ought to read only the kind of books that wound or stab us. If the book we are reading doesn’t wake us up with a blow to the head, what are we reading it for? So that it will make us happy, as you write? Good Lord, we would be happy precisely if we had no books, and the kind of books that make us happy are the kind we could write ourselves if we had to. But we need the books that affect us like a disaster, that grieve us deeply, like the death of someone we loved more than ourselves. A book must be the axe for the frozen sea within us.',
  },
  {
    id: 'dispatch_james_baldwin',
    category: 'essays',
    title: 'The Connection of Suffering',
    author: 'James Baldwin',
    source: 'The Doom and Glory of Knowing Who You Are',
    year: '1964',
    readTimeSeconds: 45,
    keyInsight: 'How literature dissolves isolation',
    text: 'You think your pain and your heartbreak are unprecedented in the history of the world, but then you read. It was books that taught me that the things that tormented me most were the very things that connected me with all the people who were alive, or who had ever been alive. An artist is someone who is forced to confess to us the human condition, making it possible for other human beings to breathe, to survive, and to realize they are not alone.',
  },
  {
    id: 'dispatch_herman_melville',
    category: 'fiction',
    title: 'The Loom of Time',
    author: 'Herman Melville',
    source: 'Moby-Dick, Chapter 47',
    year: '1851',
    readTimeSeconds: 50,
    keyInsight: 'Weaving destiny and circumstance',
    text: 'There was a slumberous influence upon him, that seemed to come from the deep hum of the ocean, the gentle roll of the ship, and the silent passing of the hours. It seemed as if this were the loom of Time, and I myself were a shuttle mechanically weaving and weaving away at the Fates. There lay the fixed threads of necessity, and here the playful shuttle of free will, passing between them, producing the unpredictable pattern of our days.',
  },
  {
    id: 'dispatch_thoreau',
    category: 'essays',
    title: 'Where I Lived and What I Lived For',
    author: 'Henry David Thoreau',
    source: 'Walden',
    year: '1854',
    readTimeSeconds: 45,
    keyInsight: 'Simplicity as supreme freedom',
    text: 'I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived. Simplicity, simplicity, simplicity! I say, let your affairs be as two or three, and not a hundred or a thousand; instead of a million count half a dozen, and keep your accounts on your thumb-nail.',
  },
  {
    id: 'dispatch_montaigne',
    category: 'philosophy',
    title: 'On Solitude',
    author: 'Michel de Montaigne',
    source: 'The Complete Essays',
    year: '1580',
    readTimeSeconds: 45,
    keyInsight: 'The backroom of the soul',
    text: 'We must reserve a back shop, wholly our own and entirely free, in which to establish our true liberty and our principal retreat and solitude. There our usual conversation must be with ourselves, and so private that no outside association or communication can find a place there; there we may talk and laugh as if without wife, without children, without goods, without train and without servants, so that, when the time comes to lose them, it will be nothing new to do without them.',
  },
  {
    id: 'dispatch_rainer_maria_rilke',
    category: 'poetry',
    title: 'Letters to a Young Poet',
    author: 'Rainer Maria Rilke',
    source: 'Letter IV',
    year: '1903',
    readTimeSeconds: 45,
    keyInsight: 'Living the questions',
    text: 'Be patient toward all that is unsolved in your heart and try to love the questions themselves, like locked rooms and like books that are now written in a very foreign tongue. Do not now seek the answers, which cannot be given you because you would not be able to live them. And the point is, to live everything. Live the questions now. Perhaps you will then gradually, without noticing it, live along some distant day into the answer.',
  },
];

/**
 * Returns a deterministic daily dispatch based on the current calendar date
 */
export function getDailyBroadsheetDispatch(referenceDate: Date = new Date()): BroadsheetDispatch {
  const startOfYear = new Date(referenceDate.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((referenceDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayOfYear) % BROADSHEET_DISPATCHES.length;
  return BROADSHEET_DISPATCHES[index];
}

/**
 * Returns dispatches filtered by category ('all', 'philosophy', 'poetry', 'fiction', 'essays')
 */
export function getBroadsheetDispatchesByCategory(category: BroadsheetCategory): BroadsheetDispatch[] {
  if (category === 'all') return BROADSHEET_DISPATCHES;
  return BROADSHEET_DISPATCHES.filter((d) => d.category === category);
}

/**
 * Returns a random dispatch, optionally constrained by category and excluding a current ID
 */
export function getRandomBroadsheetDispatch(
  excludeId?: string,
  category: BroadsheetCategory = 'all'
): BroadsheetDispatch {
  const pool = getBroadsheetDispatchesByCategory(category).filter((d) => d.id !== excludeId);
  if (pool.length === 0) {
    return BROADSHEET_DISPATCHES[0];
  }
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
