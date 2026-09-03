export interface DailyBookSpotlight {
  id: string;
  title: string;
  author: string;
  year: string;
  genre: string;
  accolade: string;
  tagline: string;
  whyPopular: string;
  synopsis: string;
  themes: string[];
  coverUrl?: string;
  keyQuote?: string;
  discussionPrompt?: string;
}

export interface DailyAuthorSpotlight {
  id: string;
  name: string;
  era: string;
  nationality: string;
  primaryGenre: string;
  bio: string;
  whyTrending: string;
  writingStyle: string;
  signatureQuote: string;
  portraitUrl?: string;
  recommendedStartingBooks: Array<{
    title: string;
    year: string;
    description: string;
  }>;
  notableAwards: string[];
}

export const CONTEMPORARY_BOOKS_CATALOG: DailyBookSpotlight[] = [
  {
    id: 'book_tomorrow_zevin',
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    year: '2022',
    genre: 'Contemporary Fiction',
    accolade: 'Goodreads Choice Winner · Instant Global Bestseller',
    tagline: 'A love story about creativity, gaming, and lifelong collaboration.',
    whyPopular:
      'Widely celebrated across literary circles for portraying platonic intimacy and artistic obsession. It proves that video games are legitimate high art, capturing the heartache of building virtual worlds together over three decades.',
    synopsis:
      'Sam Masur and Sadie Green meet as hospital pediatric patients playing Super Mario. Reconnecting in college, they craft an indie video game that becomes a colossal sensation, catapulting them into fame, wealth, artistic jealousy, and tragedy. It is an exploration of how creation can both heal and fracture human connections.',
    themes: ['Platonic Love', 'Creative Collaboration', 'Identity & Trauma', 'Game Design as Art'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780593321201-L.jpg',
    keyQuote:
      'There is a time for any work of art when it is just for you. Before anyone else sees it. That is the purest time.',
    discussionPrompt:
      'Can creative partnerships ever survive commercial success without losing their personal intimacy?',
  },
  {
    id: 'book_klara_ishiguro',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    year: '2021',
    genre: 'Literary Sci-Fi',
    accolade: 'Booker Prize Longlist · Nobel Laureate First Post-Nobel Work',
    tagline: 'Can an artificial heart truly comprehend the uniqueness of human grief?',
    whyPopular:
      'Surging in relevance with modern debates on artificial intelligence. Ishiguro investigates whether human emotion can be modeled by algorithms or if there is an irreducible human spark.',
    synopsis:
      'Told from the gentle, perceptive perspective of Klara, an Artificial Friend with outstanding observational qualities, who watches the store window and the customers outside. Chosen by a chronically sick girl named Josie, Klara embarks on a quiet mission to save her through the nourishing grace of the Sun.',
    themes: ['Artificial Consciousness', 'Grief & Mortality', 'Class Divides', 'Devotion'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780593318171-L.jpg',
    keyQuote:
      'Do you believe in the human heart? I don’t mean simply the organ, obviously. Do you think there is something that makes each of us special and individual?',
    discussionPrompt:
      'Is Klara’s devotion genuine empathy or an impeccably executed algorithmic directive?',
  },
  {
    id: 'book_yellowface_kuang',
    title: 'Yellowface',
    author: 'R.F. Kuang',
    year: '2023',
    genre: 'Satire & Thriller',
    accolade: 'Waterstones Fiction Winner · Viral Literary Phenomenon',
    tagline: 'What happens when you steal a dead friend’s manuscript and claim her culture?',
    whyPopular:
      'Sparked massive discussions across BookTok, literary journals, and publishing panels for its razor-sharp expose of publishing capitalism, social media outrage cycles, and cultural tokenism.',
    synopsis:
      'Athena Liu is a literary darling while June Hayward is an obscure failure. When Athena dies in a freak kitchen accident, June steals Athena’s unpublished masterpiece about Chinese laborers in World War I, polishes it, and publishes it under the racially ambiguous pseudonym Juniper Song. Paranoia ensues as anonymous internet accounts close in.',
    themes: ['Cultural Appropriation', 'Publishing Industry Ethics', 'Social Media Toxicity', 'Envy'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780063250833-L.jpg',
    keyQuote:
      'Nobody wants to hear a white writer whine about how hard it is to get published. They want to hear about marginalized voices, except when they don’t.',
    discussionPrompt:
      'Where is the ethical line between empathetic fiction writing and cultural theft?',
  },
  {
    id: 'book_piranesi_clarke',
    title: 'Piranesi',
    author: 'Susanna Clarke',
    year: '2020',
    genre: 'Philosophical Fantasy',
    accolade: 'Women’s Prize for Fiction Winner',
    tagline: 'A solitary man lives in an endless house of ocean tides and marble statues.',
    whyPopular:
      'Universally beloved by readers seeking quiet, meditative literature. Piranesi offers a sublime antidote to cynical modern fiction, showcasing a protagonist whose kindness and wonder remain uncorrupted by cruelty.',
    synopsis:
      'Piranesi lives in the House. The House is not a normal building: its rooms are infinite, its corridors labyrinthine, its walls lined with thousands upon thousands of statues, each one different. In the lower halls, the ocean tides surge through. Piranesi records the tides, honors the birds, and believes only two humans exist—until strange messages appear.',
    themes: ['Innocence & Wonder', 'Solitude vs. Loneliness', 'Sacred Spaces', 'Academic Corruption'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781635575637-L.jpg',
    keyQuote:
      'The Beauty of the House is immeasurable; its Kindness infinite.',
    discussionPrompt:
      'Is Piranesi’s innocent worldview a delusion or a higher spiritual truth?',
  },
  {
    id: 'book_exhalation_chiang',
    title: 'Exhalation',
    author: 'Ted Chiang',
    year: '2019',
    genre: 'Speculative Fiction',
    accolade: 'Hugo, Nebula & Locus Award Winner',
    tagline: 'Nine philosophical puzzles questioning memory, free will, and time.',
    whyPopular:
      'Revered by scientists, philosophers, and casual readers alike. Chiang does not write pulp sci-fi; he constructs rigorously humane philosophical parables that reframe how we perceive our existence.',
    synopsis:
      'A collection of nine visionary stories: an anatomist dissects his own mechanical brain to discover the true nature of memory; an archaeologist communicates through an ancient portal with past versions of himself; and digital pets raise profound questions of parental responsibility.',
    themes: ['Free Will vs. Determinism', 'Thermodynamics & Time', 'Digital Memory', 'Ethics of Tech'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781101947883-L.jpg',
    keyQuote:
      'Even if you are an automaton whose choices are predetermined, the sensation of making a decision is still what makes consciousness worth having.',
    discussionPrompt:
      'If you could verify with certainty that the universe is deterministic, would you behave any differently?',
  },
  {
    id: 'book_demon_kingsolver',
    title: 'Demon Copperhead',
    author: 'Barbara Kingsolver',
    year: '2022',
    genre: 'Contemporary Epic',
    accolade: 'Pulitzer Prize Winner · Women’s Prize Winner',
    tagline: 'A fierce, heartbreaking survival story set in the heart of the opioid epidemic.',
    whyPopular:
      'A tour-de-force reimagining of Dickens’ David Copperfield transposed to modern rural Virginia. It gives voice to communities ravaged by institutional neglect and pharmaceutical exploitation with ferocious humor and empathy.',
    synopsis:
      'Born in a trailer to a single teenage mother, Demon Copperhead possesses copper-colored hair, a caustic wit, and a fierce will to survive. Navigating foster homes, exploitative child labor, football stardom, addiction, and love, he seeks dignity in an America that treats rural people as invisible.',
    themes: ['Institutional Exploitation', 'Addiction & Recovery', 'Rural Dignity', 'Artistic Calling'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780063251922-L.jpg',
    keyQuote:
      'The world doesn’t care about kids born in trailers. So you learn to look for light where nobody else thinks to look.',
    discussionPrompt:
      'How does Demon’s dark humor protect him from being crushed by generational poverty?',
  },
  {
    id: 'book_three_body_liu',
    title: 'The Three-Body Problem',
    author: 'Liu Cixin',
    year: '2014 (Eng trans)',
    genre: 'Hard Sci-Fi',
    accolade: 'First Asian Winner of the Hugo Award · International Sensation',
    tagline: 'A secret military project sends signals into deep space—and receives an answer.',
    whyPopular:
      'Catapulted back into the center of cultural conversation by recent cinematic adaptations. It introduces the breathtaking "Dark Forest" hypothesis, offering a chilling geopolitical framework for cosmic existence.',
    synopsis:
      'Set against the backdrop of China’s Cultural Revolution, astrophysicist Ye Wenjie makes a fateful decision that seals humanity’s destiny. Decades later, nanotechnologist Wang Miao investigates a bizarre virtual reality game that holds the key to an impending extraterrestrial invasion from a chaotic three-sun star system.',
    themes: ['Cosmic Sociology', 'Civilizational Survival', 'Scientific Hubris', 'Existential Dread'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780765377067-L.jpg',
    keyQuote:
      'The universe is a dark forest. Every civilization is an armed hunter stalking through the trees like a ghost.',
    discussionPrompt:
      'Is contact with an extraterrestrial intelligence inherently an existential risk for humanity?',
  },
];

export const CONTEMPORARY_AUTHORS_CATALOG: DailyAuthorSpotlight[] = [
  {
    id: 'author_sally_rooney',
    name: 'Sally Rooney',
    era: 'Contemporary (1991–present)',
    nationality: 'Irish',
    primaryGenre: 'Literary Realism / Modern Romance',
    portraitUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sally_Rooney_2019.jpg/440px-Sally_Rooney_2019.jpg',
    bio:
      'Hailed as the defining literary voice of the millennial generation. Rooney’s minimalist, dialogue-driven prose dissects class divisions, Marxist theory, and the paralyzing difficulty of honest communication in an era of smartphone intimacy.',
    whyTrending:
      'Constantly sparking spirited debate among critics and readers for her unflinching examination of economic precarity, youth disaffection, and modern romance.',
    writingStyle:
      'Radically unadorned, quotation-mark-free dialogue with acute psychological precision. She focuses on the silent emotional negotiations between characters.',
    signatureQuote:
      'It was culture like a luxury good, the art of looking at art while people starved in the city.',
    recommendedStartingBooks: [
      {
        title: 'Normal People (2018)',
        year: '2018',
        description: 'An intricate, bittersweet exploration of social hierarchy and intimacy between two Irish youths.',
      },
      {
        title: 'Conversations with Friends (2017)',
        year: '2017',
        description: 'Her sharp debut dissecting poetry, infidelity, and complex female friendships.',
      },
      {
        title: 'Intermezzo (2024)',
        year: '2024',
        description: 'A grief-stricken, stylistically adventurous examination of brotherly friction and chess.',
      },
    ],
    notableAwards: ['Costa Book Award Winner', 'Sunday Times Young Writer of the Year'],
  },
  {
    id: 'author_ted_chiang',
    name: 'Ted Chiang',
    era: 'Contemporary (1967–present)',
    nationality: 'American',
    primaryGenre: 'Philosophical Speculative Fiction',
    portraitUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Ted_Chiang_at_Worldcon_2005.jpg/440px-Ted_Chiang_at_Worldcon_2005.jpg',
    bio:
      'A former technical writer who publishes very rarely, yet almost every single story he writes wins major literary accolades. His work serves as philosophical thought experiments investigating the human spirit under technological transformation.',
    whyTrending:
      'Regarded as the most intellectually rigorous thinker writing today about generative AI, human cognition, and digital linguistics. Major films like Arrival have brought his ideas to global consciousness.',
    writingStyle:
      'Crystal-clear, elegant prose devoid of melodrama. He constructs airtight logical premises that build toward devastating emotional revelations.',
    signatureQuote:
      'Computers are great at pattern recognition, but human beings are meaning makers. We must never confuse the two.',
    recommendedStartingBooks: [
      {
        title: 'Stories of Your Life and Others (2002)',
        year: '2002',
        description: 'Groundbreaking anthology containing the novella that inspired the film Arrival.',
      },
      {
        title: 'Exhalation (2019)',
        year: '2019',
        description: 'Nine masterwork stories exploring time travel, memory implants, and mechanical anatomy.',
      },
    ],
    notableAwards: ['4 Hugo Awards', '4 Nebula Awards', '6 Locus Awards'],
  },
  {
    id: 'author_kazuo_ishiguro',
    name: 'Kazuo Ishiguro',
    era: 'Contemporary (1954–present)',
    nationality: 'British-Japanese',
    primaryGenre: 'Literary Fiction / Dystopian Speculative',
    portraitUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Kazuo_Ishiguro_in_Stockholm_2017_02.jpg/440px-Kazuo_Ishiguro_in_Stockholm_2017_02.jpg',
    bio:
      'Awarded the 2017 Nobel Prize in Literature. Ishiguro is world-renowned for his quietly devastating novels that reveal the immense abyss beneath our everyday illusions and polite repressions.',
    whyTrending:
      'Celebrated across generations for how his quiet, polite protagonists speak volumes through what they refuse to admit to themselves.',
    writingStyle:
      'Controlled, formal first-person narrators whose self-deception and regret slowly unravel as the narrative progresses, producing overwhelming emotional resonance.',
    signatureQuote:
      'What is the point in worrying oneself so much about what one could or could not have done to control the course one’s life took?',
    recommendedStartingBooks: [
      {
        title: 'The Remains of the Day (1989)',
        year: '1989',
        description: 'A masterclass in restraint: an English butler reflects on loyalty and wasted love.',
      },
      {
        title: 'Never Let Me Go (2005)',
        year: '2005',
        description: 'A heartbreaking dystopian exploration of human clones raised for organ harvesting.',
      },
      {
        title: 'Klara and the Sun (2021)',
        year: '2021',
        description: 'A modern inquiry into love and machine learning through the eyes of an Artificial Friend.',
      },
    ],
    notableAwards: ['Nobel Prize in Literature (2017)', 'Booker Prize (1989)', 'Knighthood for Services to Literature'],
  },
  {
    id: 'author_chimamanda_adichie',
    name: 'Chimamanda Ngozi Adichie',
    era: 'Contemporary (1977–present)',
    nationality: 'Nigerian',
    primaryGenre: 'Post-Colonial Realism / Social Commentary',
    portraitUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Chimamanda_Ngozi_Adichie_at_the_2019_PEN_America_World_Voices_Festival.jpg/440px-Chimamanda_Ngozi_Adichie_at_the_2019_PEN_America_World_Voices_Festival.jpg',
    bio:
      'One of the most influential global intellectuals and novelists alive. Born in Enugu, Nigeria, Adichie has transformed world literature by challenging monolithic Western narratives with vivid, morally complex human portraits.',
    whyTrending:
      'Renowned both for her epic novels and cultural essays, advocating for the danger of a "single story" and inspiring millions of readers and creators worldwide.',
    writingStyle:
      'Vibrant, energetic prose marked by astute social observation, humor, and uncompromising emotional truth.',
    signatureQuote:
      'The single story creates stereotypes, and the problem with stereotypes is not that they are untrue, but that they are incomplete.',
    recommendedStartingBooks: [
      {
        title: 'Americanah (2013)',
        year: '2013',
        description: 'A dazzling story of love, race, and identity across Nigeria, the UK, and the United States.',
      },
      {
        title: 'Half of a Yellow Sun (2006)',
        year: '2006',
        description: 'An epic emotional canvas set during the devastating Biafran war of the late 1960s.',
      },
      {
        title: 'Purple Hibiscus (2003)',
        year: '2003',
        description: 'Her stunning debut chronicling a young girl’s coming of age under patriarchal dogma.',
      },
    ],
    notableAwards: ['Orange Prize for Fiction', 'MacArthur Fellowship ("Genius Grant")', 'National Book Critics Circle Award'],
  },
  {
    id: 'author_rf_kuang',
    name: 'Rebecca F. Kuang',
    era: 'Contemporary (1996–present)',
    nationality: 'Chinese-American',
    primaryGenre: 'Historical Fantasy / Academic Satire',
    portraitUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/R._F._Kuang_2023.jpg/440px-R._F._Kuang_2023.jpg',
    bio:
      'A Yale and Oxford-educated historian and author who rapidly became one of the most prolific and debated young writers in contemporary publishing. Her books fearlessly confront imperialism, translation politics, and academic toxicity.',
    whyTrending:
      'Known for bridging the gap between high academic theory and addictive, bestselling page-turners.',
    writingStyle:
      'Fast-paced, erudite, and provocative with dense historical footnotes and fierce moral clarity.',
    signatureQuote:
      'Translation means doing violence upon the original, which is already a violence upon the thought.',
    recommendedStartingBooks: [
      {
        title: 'Babel (2022)',
        year: '2022',
        description: 'An alternate-history Oxford where magical silver-working is powered by the loss of meaning in translation.',
      },
      {
        title: 'Yellowface (2023)',
        year: '2023',
        description: 'A blistering contemporary satire of authorial jealousy, cultural tokenism, and internet scandals.',
      },
      {
        title: 'The Poppy War (2018)',
        year: '2018',
        description: 'A dark, military fantasy epic inspired by mid-20th century Chinese history.',
      },
    ],
    notableAwards: ['Nebula Award Winner', 'British Book Award for Fiction', 'Blackwell’s Book of the Year'],
  },
  {
    id: 'author_liu_cixin',
    name: 'Liu Cixin',
    era: 'Contemporary (1963–present)',
    nationality: 'Chinese',
    primaryGenre: 'Hard Science Fiction / Cosmic Sociology',
    portraitUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Liu_Cixin_20150823.jpg/440px-Liu_Cixin_20150823.jpg',
    bio:
      'Formerly a computer engineer at a remote coal power plant in Shanxi, Liu became the foremost pioneer of Chinese science fiction, crafting monumental space epics that re-envision cosmic destiny.',
    whyTrending:
      'The definitive architect of modern cosmic hard sci-fi whose speculative frameworks have influenced philosophers, scientists, and world leaders.',
    writingStyle:
      'Grand, sweeping prose that dwarfs individual human drama against the unfathomable scale of cosmic epochs and astronomical physics.',
    signatureQuote:
      'Weakness and ignorance are not barriers to survival, but arrogance is.',
    recommendedStartingBooks: [
      {
        title: 'The Three-Body Problem (2008 / 2014)',
        year: '2014',
        description: 'The monumental opening chapter of humanity’s clash with a chaotic trinary star system.',
      },
      {
        title: 'The Dark Forest (2008 / 2015)',
        year: '2015',
        description: 'The chilling second volume introducing cosmic sociology and the Wallfacers project.',
      },
      {
        title: 'The Wandering Earth (2000)',
        year: '2000',
        description: 'Thrilling novella about strapping planetary engines to Earth to escape the dying Sun.',
      },
    ],
    notableAwards: ['Hugo Award for Best Novel', 'Arthur C. Clarke Award for Imagination in Service to Society', '9 Galaxy Awards'],
  },
];

/**
 * Returns a deterministic Book of the Day based on the current calendar date.
 */
export function getBookOfTheDay(date: Date = new Date()): DailyBookSpotlight {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayOfYear) % CONTEMPORARY_BOOKS_CATALOG.length;
  return CONTEMPORARY_BOOKS_CATALOG[index];
}

/**
 * Returns a deterministic Author of the Day based on the current calendar date.
 */
export function getAuthorOfTheDay(date: Date = new Date()): DailyAuthorSpotlight {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  // Offset by 3 so book and author aren't always paired to the same book
  const index = Math.abs(dayOfYear + 3) % CONTEMPORARY_AUTHORS_CATALOG.length;
  return CONTEMPORARY_AUTHORS_CATALOG[index];
}

/**
 * Returns a random book spotlight for instant discovery.
 */
export function getRandomBookSpotlight(excludeId?: string): DailyBookSpotlight {
  const candidates = CONTEMPORARY_BOOKS_CATALOG.filter((b) => b.id !== excludeId);
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] || CONTEMPORARY_BOOKS_CATALOG[0];
}

/**
 * Returns a random author spotlight for instant discovery.
 */
export function getRandomAuthorSpotlight(excludeId?: string): DailyAuthorSpotlight {
  const candidates = CONTEMPORARY_AUTHORS_CATALOG.filter((a) => a.id !== excludeId);
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] || CONTEMPORARY_AUTHORS_CATALOG[0];
}
