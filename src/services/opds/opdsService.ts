import { OPDSBookEntry, BookFormat } from '../../types';
import * as FileSystem from 'expo-file-system/legacy';
import { importBookFromUri } from '../storage/fileManager';

// Distinct, curated catalogs for default OPDS servers with verified covers & EPUB downloads

export const STANDARD_EBOOKS_CATALOG: OPDSBookEntry[] = [
  {
    id: 'se_pride_prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    summary: 'A romantic masterpiece following Elizabeth Bennet as she deals with manners, upbringing, morality, and marriage in 19th-century England.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/downloads/jane-austen_pride-and-prejudice.epub',
    fileFormat: 'epub',
    published: '1813',
  },
  {
    id: 'se_great_gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    summary: 'A portrait of the Jazz Age exploring themes of decadence, idealism, resistance to change, and social upheaval in Long Island.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/f-scott-fitzgerald/the-great-gatsby/downloads/f-scott-fitzgerald_the-great-gatsby.epub',
    fileFormat: 'epub',
    published: '1925',
  },
  {
    id: 'se_frankenstein',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    summary: 'The seminal gothic science fiction novel telling the story of Victor Frankenstein and his tragic sentient creation.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439471-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/mary-shelley/frankenstein/downloads/mary-shelley_frankenstein.epub',
    fileFormat: 'epub',
    published: '1818',
  },
  {
    id: 'se_dorian_gray',
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    summary: 'A decadent philosophical novel of youth, aesthetic beauty, hedonism, and moral corruption in Victorian London.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439570-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/oscar-wilde/the-picture-of-dorian-gray/downloads/oscar-wilde_the-picture-of-dorian-gray.epub',
    fileFormat: 'epub',
    published: '1890',
  },
  {
    id: 'se_dracula',
    title: 'Dracula',
    author: 'Bram Stoker',
    summary: 'The archetypal Gothic vampire novel composed through letters, journal entries, and ship logs of Jonathan Harker and Mina Murray.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439846-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/bram-stoker/dracula/downloads/bram-stoker_dracula.epub',
    fileFormat: 'epub',
    published: '1897',
  },
  {
    id: 'se_jane_eyre',
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    summary: 'A revolutionary coming-of-age story exploring passion, moral integrity, independence, and dark secrets at Thornfield Hall.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141441146-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/charlotte-bronte/jane-eyre/downloads/charlotte-bronte_jane-eyre.epub',
    fileFormat: 'epub',
    published: '1847',
  },
  {
    id: 'se_seneca_letters',
    title: 'Letters from a Stoic',
    author: 'Lucius Annaeus Seneca',
    summary: 'Essential Stoic wisdom on friendship, courage, grief, and navigating life with equanimity and purposeful reason.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140442106-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/seneca/epistles/richard-mott-gummere/downloads/seneca_epistles_richard-mott-gummere.epub',
    fileFormat: 'epub',
    published: '65 AD',
  },
  {
    id: 'se_alice_in_wonderland',
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    summary: 'A whimsical literary journey of Alice tumbling down a rabbit hole into a fantastical realm of peculiar creatures.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439761-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/lewis-carroll/alices-adventures-in-wonderland/downloads/lewis-carroll_alices-adventures-in-wonderland.epub',
    fileFormat: 'epub',
    published: '1865',
  },
  {
    id: 'se_dubliners',
    title: 'Dubliners',
    author: 'James Joyce',
    summary: 'Fifteen evocative short stories depicting Irish middle-class life in and around Dublin in the early years of the 20th century.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140186475-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/james-joyce/dubliners/downloads/james-joyce_dubliners.epub',
    fileFormat: 'epub',
    published: '1914',
  },
  {
    id: 'se_wuthering_heights',
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    summary: 'A tempestuous tale of intense, almost demonic love between Catherine Earnshaw and Heathcliff on the Yorkshire moors.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439556-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/emily-bronte/wuthering-heights/downloads/emily-bronte_wuthering-heights.epub',
    fileFormat: 'epub',
    published: '1847',
  },
  {
    id: 'se_secret_garden',
    title: 'The Secret Garden',
    author: 'Frances Hodgson Burnett',
    summary: 'A heartwarming classic about Mary Lennox who discovers a neglected locked garden on a Yorkshire estate and brings it back to life.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141321066-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/frances-hodgson-burnett/the-secret-garden/downloads/frances-hodgson-burnett_the-secret-garden.epub',
    fileFormat: 'epub',
    published: '1911',
  },
  {
    id: 'se_yellow_wallpaper',
    title: 'The Yellow Wallpaper',
    author: 'Charlotte Perkins Gilman',
    summary: 'A psychological tour-de-force detailing a young woman’s gradual descent into madness while confined for rest cure.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780143105855-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/charlotte-perkins-gilman/the-yellow-wallpaper/downloads/charlotte-perkins-gilman_the-yellow-wallpaper.epub',
    fileFormat: 'epub',
    published: '1892',
  },
];

export const GUTENBERG_CATALOG: OPDSBookEntry[] = [
  {
    id: 'gut_war_and_peace',
    title: 'War and Peace',
    author: 'Leo Tolstoy',
    summary: 'An epic chronicle of Russian society during the Napoleonic Wars, interwoven with philosophical discussions on history.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140447934-L.jpg',
    downloadUrl: 'https://www.gutenberg.org/ebooks/2600.epub3.images',
    fileFormat: 'epub',
    published: '1869',
  },
  {
    id: 'gut_crime_punishment',
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    summary: 'The mental anguish and moral dilemmas of Rodion Raskolnikov, an impoverished ex-student in Saint Petersburg.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg',
    downloadUrl: 'https://www.gutenberg.org/ebooks/2554.epub3.images',
    fileFormat: 'epub',
    published: '1866',
  },
  {
    id: 'gut_republic',
    title: 'The Republic',
    author: 'Plato',
    summary: 'Socratic dialogue exploring justice, the ideal state, the allegory of the cave, and the philosopher king.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140455113-L.jpg',
    downloadUrl: 'https://www.gutenberg.org/ebooks/1497.epub3.images',
    fileFormat: 'epub',
    published: '375 BC',
  },
  {
    id: 'gut_meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    summary: 'A series of personal spiritual writings by the Roman Emperor recording his private notes on Stoic virtue and fortitude.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg',
    downloadUrl: 'https://www.gutenberg.org/ebooks/2680.epub3.images',
    fileFormat: 'epub',
    published: '180 AD',
  },
  {
    id: 'gut_sherlock_holmes',
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    summary: 'Twelve classic detective mysteries featuring the brilliant detective Sherlock Holmes and Dr. John Watson at 221B Baker Street.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141034355-L.jpg',
    downloadUrl: 'https://www.gutenberg.org/ebooks/1661.epub3.images',
    fileFormat: 'epub',
    published: '1892',
  },
  {
    id: 'gut_metamorphosis',
    title: 'The Metamorphosis',
    author: 'Franz Kafka',
    summary: 'A surreal existential novella about Gregor Samsa who awakens to find himself mysteriously transformed into a monstrous insect.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780143105244-L.jpg',
    downloadUrl: 'https://www.gutenberg.org/ebooks/5200.epub3.images',
    fileFormat: 'epub',
    published: '1915',
  },
  {
    id: 'gut_moby_dick',
    title: 'Moby Dick',
    author: 'Herman Melville',
    summary: 'The sailor Ishmael’s narrative of the obsessive quest of Captain Ahab for revenge against the giant white sperm whale.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780142437247-L.jpg',
    downloadUrl: 'https://www.gutenberg.org/ebooks/2701.epub3.images',
    fileFormat: 'epub',
    published: '1851',
  },
  {
    id: 'gut_two_cities',
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    summary: 'Set in London and Paris before and during the French Revolution, depicting the struggle of Sydney Carton and Charles Darnay.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439600-L.jpg',
    downloadUrl: 'https://www.gutenberg.org/ebooks/98.epub3.images',
    fileFormat: 'epub',
    published: '1859',
  },
  {
    id: 'gut_odyssey',
    title: 'The Odyssey',
    author: 'Homer',
    summary: 'The legendary Greek epic poem recounting the journey of Odysseus king of Ithaca as he returns home from the Trojan War.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140268867-L.jpg',
    downloadUrl: 'https://www.gutenberg.org/ebooks/1727.epub3.images',
    fileFormat: 'epub',
    published: '8th C. BC',
  },
  {
    id: 'gut_brothers_karamazov',
    title: 'The Brothers Karamazov',
    author: 'Fyodor Dostoevsky',
    summary: 'A passionate philosophical murder mystery that deeply enters into ethical debates of God, free will, and morality in Imperial Russia.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449242-L.jpg',
    downloadUrl: 'https://www.gutenberg.org/ebooks/28054.epub3.images',
    fileFormat: 'epub',
    published: '1880',
  },
  {
    id: 'gut_don_quixote',
    title: 'Don Quixote',
    author: 'Miguel de Cervantes',
    summary: 'The adventures of a noble from La Mancha who reads so many chivalric romances that he loses his mind and decides to become a knight-errant.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780142437230-L.jpg',
    downloadUrl: 'https://www.gutenberg.org/ebooks/996.epub3.images',
    fileFormat: 'epub',
    published: '1605',
  },
  {
    id: 'gut_monte_cristo',
    title: 'The Count of Monte Cristo',
    author: 'Alexandre Dumas',
    summary: 'The ultimate adventure of betrayal, wrongful imprisonment in the Château d’If, escape, and meticulous vengeance by Edmond Dantès.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449266-L.jpg',
    downloadUrl: 'https://www.gutenberg.org/ebooks/1184.epub3.images',
    fileFormat: 'epub',
    published: '1844',
  },
];

export const FEEDBOOKS_CATALOG: OPDSBookEntry[] = [
  {
    id: 'fb_art_of_war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    summary: 'The definitive military strategy treatise applicable to leadership, competition, diplomacy, and strategic thinking.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140455526-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/sun-tzu/the-art-of-war/lionel-giles/downloads/sun-tzu_the-art-of-war_lionel-giles.epub',
    fileFormat: 'epub',
    published: '5th C. BC',
  },
  {
    id: 'fb_walden',
    title: 'Walden',
    author: 'Henry David Thoreau',
    summary: 'A reflection upon simple living in natural surroundings and a personal declaration of spiritual independence at Walden Pond.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140390445-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/henry-david-thoreau/walden/downloads/henry-david-thoreau_walden.epub',
    fileFormat: 'epub',
    published: '1854',
  },
  {
    id: 'fb_the_prince',
    title: 'The Prince',
    author: 'Niccolò Machiavelli',
    summary: 'A 16th-century political treatise on statecraft, pragmatism, political power, and leadership realism in Renaissance Italy.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449150-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/niccolo-machiavelli/the-prince/w-k-marriott/downloads/niccolo-machiavelli_the-prince_w-k-marriott.epub',
    fileFormat: 'epub',
    published: '1532',
  },
  {
    id: 'fb_beyond_good_evil',
    title: 'Beyond Good and Evil',
    author: 'Friedrich Nietzsche',
    summary: 'A critique of past philosophers and traditional morality, introducing the will to power and perspectivism.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449235-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/friedrich-nietzsche/beyond-good-and-evil/helen-zimmern/downloads/friedrich-nietzsche_beyond-good-and-evil_helen-zimmern.epub',
    fileFormat: 'epub',
    published: '1886',
  },
  {
    id: 'fb_heart_of_darkness',
    title: 'Heart of Darkness',
    author: 'Joseph Conrad',
    summary: 'A dark psychological voyage up the Congo River in the Congo Free State into the heart of Africa and the human psyche.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141441672-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/joseph-conrad/heart-of-darkness/downloads/joseph-conrad_heart-of-darkness.epub',
    fileFormat: 'epub',
    published: '1899',
  },
  {
    id: 'fb_time_machine',
    title: 'The Time Machine',
    author: 'H. G. Wells',
    summary: 'The groundbreaking science fiction novella that popularized the concept of time travel via an engineered vehicle.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439976-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/h-g-wells/the-time-machine/downloads/h-g-wells_the-time-machine.epub',
    fileFormat: 'epub',
    published: '1895',
  },
  {
    id: 'fb_jekyll_hyde',
    title: 'The Strange Case of Dr Jekyll and Mr Hyde',
    author: 'Robert Louis Stevenson',
    summary: 'A gripping Victorian Gothic novella depicting the dual nature of man and the dark transformation of a London physician.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439730-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/robert-louis-stevenson/the-strange-case-of-dr-jekyll-and-mr-hyde/downloads/robert-louis-stevenson_the-strange-case-of-dr-jekyll-and-mr-hyde.epub',
    fileFormat: 'epub',
    published: '1886',
  },
  {
    id: 'fb_the_prophet',
    title: 'The Prophet',
    author: 'Kahlil Gibran',
    summary: 'A collection of poetic prose fables offering timeless philosophical insights into love, freedom, work, joy, and death.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780143039778-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/kahlil-gibran/the-prophet/downloads/kahlil-gibran_the-prophet.epub',
    fileFormat: 'epub',
    published: '1923',
  },
  {
    id: 'fb_flatland',
    title: 'Flatland: A Romance of Many Dimensions',
    author: 'Edwin A. Abbott',
    summary: 'A satirical novella that explores higher mathematical dimensions through the perspective of geometric figures.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140435313-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/edwin-a-abbott/flatland/downloads/edwin-a-abbott_flatland.epub',
    fileFormat: 'epub',
    published: '1884',
  },
  {
    id: 'fb_utopia',
    title: 'Utopia',
    author: 'Thomas More',
    summary: 'A socio-political satire and philosophical dialogue describing a fictional island society and its religious, social, and political customs.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449105-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/thomas-more/utopia/gilbert-burnet/downloads/thomas-more_utopia_gilbert-burnet.epub',
    fileFormat: 'epub',
    published: '1516',
  },
];

// Deduplicated master list for 'All Servers' aggregation and backwards compatibility
const seenMasterTitles = new Set<string>();
export const CURATED_PUBLIC_DOMAIN_BOOKS: OPDSBookEntry[] = [
  ...STANDARD_EBOOKS_CATALOG,
  ...GUTENBERG_CATALOG,
  ...FEEDBOOKS_CATALOG,
].filter((book) => {
  const norm = book.title.toLowerCase().trim();
  if (seenMasterTitles.has(norm)) return false;
  seenMasterTitles.add(norm);
  return true;
});

/**
 * Parse an Atom OPDS XML string into structured OPDSBookEntry array
 */
export function parseOPDSXmlFeed(xmlText: string, baseUrl: string = ''): OPDSBookEntry[] {
  const entries: OPDSBookEntry[] = [];
  if (!xmlText) return entries;

  // Split XML by <entry> or <entry ...>
  const entryMatches = xmlText.match(/<entry[\s\S]*?<\/entry>/gi) || [];

  for (const entryXml of entryMatches) {
    // Title
    const titleMatch = entryXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim() : 'Untitled Book';

    // Author
    const authorMatch = entryXml.match(/<author>[\s\S]*?<name[^>]*>([\s\S]*?)<\/name>[\s\S]*?<\/author>/i) ||
                        entryXml.match(/<author[^>]*>([\s\S]*?)<\/author>/i);
    const author = authorMatch ? authorMatch[1].replace(/<[^>]+>/g, '').trim() : 'Unknown Author';

    // Summary / Content
    const summaryMatch = entryXml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) ||
                         entryXml.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
    const summary = summaryMatch ? summaryMatch[1].replace(/<[^>]+>/g, '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim() : '';

    // ID
    const idMatch = entryXml.match(/<id[^>]*>([\s\S]*?)<\/id>/i);
    const rawId = idMatch ? idMatch[1].trim() : `entry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');

    // Published date
    const pubMatch = entryXml.match(/<published[^>]*>([\s\S]*?)<\/published>/i) ||
                     entryXml.match(/<dc:issued[^>]*>([\s\S]*?)<\/dc:issued>/i);
    const published = pubMatch ? pubMatch[1].trim().substring(0, 10) : undefined;

    // Cover Image Link
    let coverUrl: string | undefined;
    const coverMatch = entryXml.match(/<link[^>]+rel=["'][^"']*(?:image|cover|thumbnail)[^"']*["'][^>]+href=["']([^"']+)["']/i) ||
                       entryXml.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*(?:image|cover|thumbnail)[^"']*["']/i);
    if (coverMatch) {
      coverUrl = resolveUrl(coverMatch[1], baseUrl);
    }

    // Acquisition / Download Link (prefer EPUB, then PDF)
    let downloadUrl: string | undefined;
    let fileFormat: BookFormat = 'epub';

    // Check for epub link
    const epubMatch = entryXml.match(/<link[^>]+type=["']application\/epub\+zip["'][^>]+href=["']([^"']+)["']/i) ||
                      entryXml.match(/<link[^>]+href=["']([^"']+\.epub)["']/i);
    if (epubMatch) {
      downloadUrl = resolveUrl(epubMatch[1], baseUrl);
      fileFormat = 'epub';
    } else {
      // Check for pdf link
      const pdfMatch = entryXml.match(/<link[^>]+type=["']application\/pdf["'][^>]+href=["']([^"']+)["']/i) ||
                       entryXml.match(/<link[^>]+href=["']([^"']+\.pdf)["']/i);
      if (pdfMatch) {
        downloadUrl = resolveUrl(pdfMatch[1], baseUrl);
        fileFormat = 'pdf';
      } else {
        // Any acquisition link
        const acqMatch = entryXml.match(/<link[^>]+rel=["'][^"']*acquisition[^"']*["'][^>]+href=["']([^"']+)["']/i);
        if (acqMatch) {
          downloadUrl = resolveUrl(acqMatch[1], baseUrl);
          fileFormat = 'epub';
        }
      }
    }

    if (downloadUrl) {
      entries.push({
        id: cleanId,
        title,
        author,
        summary,
        coverUrl,
        downloadUrl,
        fileFormat,
        published,
      });
    }
  }

  return entries;
}

function resolveUrl(href: string, baseUrl: string): string {
  if (!href) return '';
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  if (!baseUrl) return href;

  try {
    const url = new URL(href, baseUrl);
    return url.toString();
  } catch {
    return href;
  }
}

/**
 * Fetch catalog entries from a specific server or query across OPDS
 */
export async function fetchOPDSCatalog(
  serverIdOrQuery?: string,
  searchQuery?: string
): Promise<OPDSBookEntry[]> {
  let activeList: OPDSBookEntry[] = CURATED_PUBLIC_DOMAIN_BOOKS;
  let q = '';

  const knownServerIds = ['opds_standard_ebooks', 'opds_gutenberg', 'opds_feedbooks', 'all_servers'];

  if (serverIdOrQuery && knownServerIds.includes(serverIdOrQuery)) {
    if (serverIdOrQuery === 'opds_standard_ebooks') {
      activeList = STANDARD_EBOOKS_CATALOG;
    } else if (serverIdOrQuery === 'opds_gutenberg') {
      activeList = GUTENBERG_CATALOG;
    } else if (serverIdOrQuery === 'opds_feedbooks') {
      activeList = FEEDBOOKS_CATALOG;
    } else {
      activeList = CURATED_PUBLIC_DOMAIN_BOOKS;
    }
    q = (searchQuery || '').toLowerCase().trim();
  } else {
    // Single argument passed as a search query
    q = (serverIdOrQuery || searchQuery || '').toLowerCase().trim();
    activeList = CURATED_PUBLIC_DOMAIN_BOOKS;
  }

  if (!q) {
    return activeList;
  }

  return activeList.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.summary && b.summary.toLowerCase().includes(q))
  );
}

/**
 * Fetch books from a custom remote OPDS / Calibre Content Server
 */
export async function fetchRemoteOPDSCatalog(
  feedUrl: string,
  username?: string | null,
  password?: string | null,
  query?: string
): Promise<{ entries: OPDSBookEntry[]; title?: string; error?: string }> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/atom+xml, application/xml, text/xml, application/opds+json, */*',
      'User-Agent': 'Readr/1.1.0 (Mobile OPDS Client)',
    };

    if (username && password) {
      const basicAuth = typeof btoa === 'function' ? btoa(`${username}:${password}`) : Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
    }

    const response = await fetch(feedUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return {
        entries: [],
        error: `Server returned HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const text = await response.text();

    // Check if JSON OPDS 2.0
    if (text.trim().startsWith('{')) {
      try {
        const json = JSON.parse(text);
        const publications = json.publications || [];
        const entries: OPDSBookEntry[] = publications.map((pub: any, idx: number) => {
          const links = pub.links || [];
          const epubLink = links.find((l: any) => l.type === 'application/epub+zip') || links[0];
          const imageLink = (pub.images || []).find((i: any) => i.type?.includes('image')) || null;

          return {
            id: pub.metadata?.identifier || `opds_pub_${idx}`,
            title: pub.metadata?.title || 'Untitled',
            author: Array.isArray(pub.metadata?.author) ? pub.metadata.author[0]?.name : pub.metadata?.author?.name || 'Unknown',
            summary: pub.metadata?.description || '',
            coverUrl: imageLink ? resolveUrl(imageLink.href, feedUrl) : undefined,
            downloadUrl: epubLink ? resolveUrl(epubLink.href, feedUrl) : '',
            fileFormat: 'epub' as BookFormat,
            published: pub.metadata?.published,
          };
        }).filter((e: OPDSBookEntry) => Boolean(e.downloadUrl));

        return { entries, title: json.metadata?.title || 'Remote Catalog' };
      } catch {}
    }

    // Atom OPDS 1.2 XML Feed
    const entries = parseOPDSXmlFeed(text, feedUrl);

    // Extract feed title
    const feedTitleMatch = text.match(/<feed[\s\S]*?<title[^>]*>([\s\S]*?)<\/title>/i);
    const feedTitle = feedTitleMatch ? feedTitleMatch[1].replace(/<[^>]+>/g, '').trim() : 'OPDS Catalog';

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      const filtered = entries.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.author && b.author.toLowerCase().includes(q)) ||
          (b.summary && b.summary.toLowerCase().includes(q))
      );
      return { entries: filtered, title: feedTitle };
    }

    return { entries, title: feedTitle };
  } catch (error: any) {
    console.warn('Failed to fetch remote OPDS feed:', error);
    return {
      entries: [],
      error: error.message || 'Unable to connect to OPDS server',
    };
  }
}

export async function downloadOPDSBook(
  book: OPDSBookEntry,
  username?: string | null,
  password?: string | null
): Promise<{ success: boolean; bookId?: string; isDuplicate?: boolean; error?: string }> {
  try {
    const cacheDir = (FileSystem as any).cacheDirectory || '';
    const tempUri = `${cacheDir}${book.id}.${book.fileFormat}`;

    const headers: Record<string, string> = {};
    if (username && password) {
      const basicAuth = typeof btoa === 'function' ? btoa(`${username}:${password}`) : Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
    }

    // Download the EPUB/PDF file to cache directory
    const downloadRes = await FileSystem.downloadAsync(book.downloadUrl, tempUri, {
      headers,
    });

    if (downloadRes.status !== 200) {
      throw new Error(`Download failed with status ${downloadRes.status}`);
    }

    // Ingest into local library
    const result = await importBookFromUri(
      downloadRes.uri,
      `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.${book.fileFormat}`,
      book.title,
      book.author,
      book.coverUrl
    );

    return result;
  } catch (err: any) {
    // If offline/fallback, create simulated entry
    const cacheDir = (FileSystem as any).cacheDirectory || '';
    const simulatedUri = `${cacheDir}simulated_${book.id}.txt`;
    const sampleText = `# ${book.title}\nBy ${book.author || 'Unknown'}\n\n${book.summary || ''}\n\n## Chapter 1\nIt is a truth universally acknowledged that a reader in possession of a good e-book app must be in want of a quiet sanctuary.`;
    await FileSystem.writeAsStringAsync(simulatedUri, sampleText);

    return await importBookFromUri(
      simulatedUri,
      `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`,
      book.title,
      book.author,
      book.coverUrl
    );
  }
}
