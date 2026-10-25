import { DialectTrack, DialectStatus } from '../types';

const BASE_DIALECT_TRACKS: DialectTrack[] = [
  // ============================================================================
  // 1. ACTIVE DIALECTS (10 Core Immersion Tracks)
  // ============================================================================
  {
    id: 'ar-MA',
    name: 'Arabic',
    dialect: 'Moroccan Darija',
    flag: '🇲🇦',
    region: 'Casablanca, Rabat & Marrakech',
    continent: 'Africa',
    status: 'active',
    level: 'A1 - C1',
    samplePhrase: 'السلام! لباس عليك؟ كلشي بخير، أش كتعاود؟',
    translation: 'Hello! How are you? Everything fine, what are you up to?',
    persona: 'Badr (Casablanca Street Guide)',
    description: 'High-velocity fusion of Arabic, Amazigh, French, and Spanish with authentic clipped vowels.',
    culturalNote: 'Master Arabizi numbers (3, 7, 9), fast Casablanca contractions, and warm Rabat hospitality.'
  },
  {
    id: 'ar-EG',
    name: 'Arabic',
    dialect: 'Egyptian Masri',
    flag: '🇪🇬',
    region: 'Cairo & Nile Valley',
    continent: 'Africa',
    status: 'active',
    level: 'A1 - C1',
    samplePhrase: 'إيه الأخبار يا صاحبي؟ عامل إيه في الدنيا؟',
    translation: "What's the news my friend? How is life treating you?",
    persona: 'Karim (Zamalek Culturalist)',
    description: 'The lingua franca of Arab cinema, melodic cadence, and animated Cairene street humor.',
    culturalNote: 'Pronounce the "jeem" as a hard "G" and master quick witty banter at the ahwa.'
  },
  {
    id: 'es-MX',
    name: 'Spanish',
    dialect: 'Mexican Spanish',
    flag: '🇲🇽',
    region: 'Mexico City & Central Mexico',
    continent: 'North America',
    status: 'active',
    level: 'A1 - C1',
    samplePhrase: '¿Qué onda, compa? ¿Vamos por unos tacos al pastor?',
    translation: "What's up, buddy? Shall we grab some tacos al pastor?",
    persona: 'Sofía (CDMX Street Guide)',
    description: 'High-frequency street vernacular, colloquial fillers, and urban Mexican idioms.',
    culturalNote: 'Master the polite diminutives (-ito) and ubiquitous slang terms like "chido", "onda", and "güey".'
  },
  {
    id: 'es-CO',
    name: 'Spanish',
    dialect: 'Colombian Paisa',
    flag: '🇨🇴',
    region: 'Medellín & Antioquia',
    continent: 'South America',
    status: 'active',
    level: 'A1 - C1',
    samplePhrase: '¡Quiubo, parce! ¿Qué más pues, todo bien o qué?',
    translation: "What's up, partner! How's everything going, all good?",
    persona: 'Mateo (El Poblado Creative)',
    description: 'Ultra-crisp pronunciation, melodic musicality, and warm Antioquian greetings.',
    culturalNote: 'Embrace "vos" and "usted" respect forms alongside affectionate terms like "parce".'
  },
  {
    id: 'fr-FR',
    name: 'French',
    dialect: 'Parisian French',
    flag: '🇫🇷',
    region: 'Paris & Île-de-France',
    continent: 'Europe',
    status: 'active',
    level: 'A1 - C1',
    samplePhrase: "C'est trop ouf ce resto, t'as vu le monde ?",
    translation: 'This restaurant is completely crazy, did you see the crowd?',
    persona: 'Camille (Le Marais Local)',
    description: 'Everyday casual Parisian slang, Verlan inversions, and natural liaison cadence.',
    culturalNote: 'Focus on dropped negatives ("t\'es" instead of "tu n\'es pas") and café terrace banter.'
  },
  {
    id: 'ja-JP',
    name: 'Japanese',
    dialect: 'Tokyo Standard',
    flag: '🇯🇵',
    region: 'Tokyo Metro Area',
    continent: 'Asia',
    status: 'active',
    level: 'N5 - N1',
    samplePhrase: 'お疲れ様！この後、ちょっと一杯どう？',
    translation: 'Thanks for your hard work! How about a quick drink after this?',
    persona: 'Kenji (Shibuya Tech Nomad)',
    description: 'Nuanced honorific transitions, modern izakaya banter, and casual Tokyo rhythms.',
    culturalNote: 'Understand Keigo contextual switches and natural sentence-ending particles.'
  },
  {
    id: 'pt-BR',
    name: 'Portuguese',
    dialect: 'Carioca Brazilian',
    flag: '🇧🇷',
    region: 'Rio de Janeiro',
    continent: 'South America',
    status: 'active',
    level: 'A1 - C1',
    samplePhrase: 'Fala meu camarada, suave na nave? Partiu praia!',
    translation: 'Speak my comrade, smooth sailing? Off to the beach!',
    persona: 'Lucas (Ipanema Musician)',
    description: 'Open vowels, musical sibilant "s" sounds, and effortless beachside banter.',
    culturalNote: 'Vibrant slang like "beleza", "maneiro", and melodic intonation.'
  },
  {
    id: 'it-IT',
    name: 'Italian',
    dialect: 'Roman & Standard Italian',
    flag: '🇮🇹',
    region: 'Rome & Lazio',
    continent: 'Europe',
    status: 'active',
    level: 'A1 - C1',
    samplePhrase: 'Daje! A sto punto famo du spaghi in centro, che ne dici?',
    translation: "Come on! At this point let's grab spaghetti downtown, what do you say?",
    persona: 'Marco (Trastevere Local)',
    description: 'Expressive hand gestures, warm Roman cadence, and vibrant culinary chatter.',
    culturalNote: 'Master espresso bar banter and local Roman expressions ("Daje!").'
  },
  {
    id: 'de-DE',
    name: 'German',
    dialect: 'Berlin Urban German',
    flag: '🇩🇪',
    region: 'Berlin & Mitte',
    continent: 'Europe',
    status: 'active',
    level: 'A1 - C1',
    samplePhrase: 'Alles entspannt bei dir? Lass mal Späti gehen!',
    translation: 'Everything chill with you? Let us head to the corner store!',
    persona: 'Lena (Kreuzberg Creative)',
    description: 'Crisp urban vocabulary, colloquial contractions, and modern Berlin street culture.',
    culturalNote: 'Navigate informal "Du" versus respectful "Sie" switches effortlessly.'
  },
  {
    id: 'zh-CN',
    name: 'Chinese',
    dialect: 'Mandarin (Beijing)',
    flag: '🇨🇳',
    region: 'Beijing & Northern China',
    continent: 'Asia',
    status: 'active',
    level: 'HSK 1 - 6',
    samplePhrase: '哥们儿，最近忙啥呢？有空一块儿撸串去！',
    translation: 'Buddy, what have you been busy with lately? Let us grab skewers when free!',
    persona: 'Wei (Hutong Navigator)',
    description: 'Erhuahua (r-coloring), vibrant northern colloquialisms, and warm social hospitality.',
    culturalNote: 'Appreciate tone mastery and traditional courtyard neighborhood greetings.'
  },

  // ============================================================================
  // 2. ACTIVE VOTING POOL (Next Bi-Weekly Drop Candidates)
  // ============================================================================
  {
    id: 'it-NAP',
    name: 'Italian',
    dialect: 'Neapolitan (Napulitano)',
    flag: '🇮🇹',
    region: 'Naples & Campania',
    continent: 'Europe',
    status: 'coming_soon',
    level: 'Voting Candidate',
    samplePhrase: 'Uè guagliò, stammo senza pensieri stasera!',
    translation: "Hey kid, we're without worries tonight!",
    persona: 'Gianluigi (Spaccanapoli Host)',
    description: 'Expressive lyrical cadence, ancient Romance roots, and poetic Southern Italian warmth.',
    culturalNote: 'Recognized by UNESCO as a distinct language with rich cultural traditions.'
  },
  {
    id: 'zh-HK',
    name: 'Chinese',
    dialect: 'Hong Kong Cantonese',
    flag: '🇭🇰',
    region: 'Hong Kong & Guangdong',
    continent: 'Asia',
    status: 'coming_soon',
    level: 'Voting Candidate',
    samplePhrase: '今日得唔得閒飲茶呀？今晚約埋班FD出嚟啦！',
    translation: "Are you free to have dim sum? Let's gather friends tonight!",
    persona: 'Wing (Mong Kok Night Navigator)',
    description: '9 distinct tones, rich colloquial idioms, and snappy fast-paced urban humor.',
    culturalNote: 'Deep connection to culinary gatherings, street markets, and cinema heritage.'
  },
  {
    id: 'ar-LEV',
    name: 'Arabic',
    dialect: 'Levantine (Lebanese/Syrian)',
    flag: '🇱🇧',
    region: 'Beirut & Damascus',
    continent: 'Middle East',
    status: 'coming_soon',
    level: 'Voting Candidate',
    samplePhrase: 'كيفك يا حبيبي؟ شو في ما في اليوم؟',
    translation: "How are you my dear? What's going on today?",
    persona: 'Nour (Beirut Café Host)',
    description: 'Soft, melodic glottal pronunciation, warm hospitality formulas, and regional charm.',
    culturalNote: 'Famous throughout the Levant for musical intonation and multi-lingual code-switching.'
  },
  {
    id: 'de-BAV',
    name: 'German',
    dialect: 'Bavarian (Boarisch)',
    flag: '🇩🇪',
    region: 'Munich & Alpine Bavaria',
    continent: 'Europe',
    status: 'coming_soon',
    level: 'Voting Candidate',
    samplePhrase: 'Servus beinand! Gemma auf a gscheide Brotzeit?',
    translation: 'Greetings everyone! Shall we go for a proper Bavarian snack?',
    persona: 'Florian (Alpine Guide)',
    description: 'Distinct vowel shifts, rich Bavarian idioms, and cozy tavern ("Wirtshaus") culture.',
    culturalNote: 'Strong regional pride with authentic expressions differing widely from High German.'
  },

  // ============================================================================
  // 3. "COULD BE COMING SOON" VAULT (Upcoming Global Atlas Queue)
  // ============================================================================
  {
    id: 'ar-DZ',
    name: 'Arabic',
    dialect: 'Algerian Darja (Dziriya)',
    flag: '🇩🇿',
    region: 'Algiers & Oran',
    continent: 'Africa',
    status: 'future_pool',
    level: 'Could Be Coming Soon',
    samplePhrase: 'واش راك خويا؟ كاش جديد في دزاير؟',
    translation: 'How are you bro? Anything new in Algiers?',
    persona: 'Mehdi (Casbah Musician)',
    description: 'Raï music cadence, rapid North African contractions, and expressive Algiers street slang.',
    culturalNote: 'Blends Maghrebi Arabic, Tamazight, and French with unmistakable Algerian rhythm.'
  },
  {
    id: 'ar-TN',
    name: 'Arabic',
    dialect: 'Tunisian Derja (Tounsi)',
    flag: '🇹🇳',
    region: 'Tunis & Sidi Bou Said',
    continent: 'Africa',
    status: 'future_pool',
    level: 'Could Be Coming Soon',
    samplePhrase: 'عسلامة! شنوة أحوالك؟ كل شي باهي؟',
    translation: 'Hello! How are things with you? Is everything good?',
    persona: 'Yasmine (Sidi Bou Said Artist)',
    description: 'Melodic Mediterranean Maghrebi dialect known for "3aslema" and "barcha".',
    culturalNote: 'Uses "barcha" for "a lot/very" and has a singing coastal intonation.'
  },
  {
    id: 'ar-SA',
    name: 'Arabic',
    dialect: 'Saudi Khaleeji & Hejazi',
    flag: '🇸🇦',
    region: 'Riyadh & Jeddah',
    continent: 'Middle East',
    status: 'future_pool',
    level: 'Could Be Coming Soon',
    samplePhrase: 'يا هلا والله! شلونك يا الغالي؟ عساك طيب؟',
    translation: 'Warm welcome! How are you my dear friend? Hope you are well?',
    persona: 'Faisal (Riyadh Majlis Host)',
    description: 'Warm Arabian Peninsula hospitality, coffee majlis etiquette, and vibrant Hejazi/Najdi idioms.',
    culturalNote: 'Rich desert heritage combined with fast-moving modern Gulf colloquialisms.'
  },
  {
    id: 'es-AR',
    name: 'Spanish',
    dialect: 'Argentine Porteño (Rioplatense)',
    flag: '🇦🇷',
    region: 'Buenos Aires',
    continent: 'South America',
    status: 'future_pool',
    level: 'Could Be Coming Soon',
    samplePhrase: '¡Che boludo! ¿Todo tranqui? ¿Sale unos mates en Palermo?',
    translation: 'Hey buddy! Everything chill? Up for some mate in Palermo?',
    persona: 'Valentín (Palermo Soho Barista)',
    description: 'Italian-inflected cadence, "voseo" conjugations, Lunfardo street slang, and "sh" pronunciation.',
    culturalNote: 'Pronounces "ll" and "y" like "sh" and uses "vos" instead of "tú".'
  },
  {
    id: 'es-PR',
    name: 'Spanish',
    dialect: 'Puerto Rican Boricua',
    flag: '🇵🇷',
    region: 'San Juan & Island-Wide',
    continent: 'North America',
    status: 'future_pool',
    level: 'Could Be Coming Soon',
    samplePhrase: '¡Wepa corillo! ¿Qué es la que hay? ¡Estamos puestos pa’ la playa!',
    translation: "Wepa crew! What's going on? We're ready for the beach!",
    persona: 'Carlos (Santurce Producer)',
    description: 'High-speed Caribbean rhythm, dropped syllables, and iconic reggaetón-era slang.',
    culturalNote: 'Final "r" often shifts toward "l" ("amol" for "amor") in casual street talk.'
  },
  {
    id: 'ko-KR',
    name: 'Korean',
    dialect: 'Seoul Contemporary & Pocha Slang',
    flag: '🇰🇷',
    region: 'Seoul (Hongdae & Gangnam)',
    continent: 'Asia',
    status: 'future_pool',
    level: 'Could Be Coming Soon',
    samplePhrase: '오늘 진짜 대박이다! 우리 치맥 먹으러 갈래?',
    translation: 'Today is seriously awesome! Wanna go grab fried chicken and beer?',
    persona: 'Jihun (Hongdae Indie Creator)',
    description: 'Fast-paced Seoul abbreviations, honorific age-hierarchy navigation, and night-market banter.',
    culturalNote: 'Mastering Banmal (casual) vs Jondaetmal (polite) is essential for Korean social life.'
  },
  {
    id: 'ht-HT',
    name: 'Creole',
    dialect: 'Haitian Creole (Kreyòl Ayisyen)',
    flag: '🇭🇹',
    region: 'Port-au-Prince & Cap-Haïtien',
    continent: 'North America',
    status: 'future_pool',
    level: 'Could Be Coming Soon',
    samplePhrase: 'Sak pase, chèf! N ap boule! Kòman tout fanmi an ye?',
    translation: "What's up, boss! We're doing great! How is the whole family?",
    persona: 'Jean-Marc (Caribbean Culturalist)',
    description: 'Expressive proverbs, rhythmic French-West African roots, and warm island solidarity.',
    culturalNote: 'Answer "Sak pase?" with "N ap boule!" ("We\'re burning/doing great!").'
  },
  {
    id: 'en-JM',
    name: 'Patois',
    dialect: 'Jamaican Patois (Patwa)',
    flag: '🇯🇲',
    region: 'Kingston & Montego Bay',
    continent: 'North America',
    status: 'future_pool',
    level: 'Could Be Coming Soon',
    samplePhrase: 'Wah gwaan, mi bredda! Everything bless andirie?',
    translation: "What's going on, my brother! Is everything blessed and irie?",
    persona: 'Devon (Kingston Dub Selector)',
    description: 'Iconic island rhythm, Rastafari-influenced wisdom, and globally influential street vernacular.',
    culturalNote: '"Mi deh yah" ("I am right here / doing fine") is the classic reply to "Wah gwaan?".'
  },
  {
    id: 'sw-KE',
    name: 'Swahili',
    dialect: 'Nairobi Sheng & Coastal Swahili',
    flag: '🇰🇪',
    region: 'Nairobi & Mombasa',
    continent: 'Africa',
    status: 'future_pool',
    level: 'Could Be Coming Soon',
    samplePhrase: 'Mambo vipi msee! Rada iko aje leo?',
    translation: "How are things bro! What's the vibe/plan today?",
    persona: 'Amina (Westlands Entrepreneur)',
    description: 'East Africa’s powerhouse trade language fused with Nairobi’s fast-evolving urban Sheng slang.',
    culturalNote: 'Respond to "Mambo?" with "Poa!" or "Freshi barida!".'
  },
  {
    id: 'tr-TR',
    name: 'Turkish',
    dialect: 'Istanbul Street Turkish',
    flag: '🇹🇷',
    region: 'Istanbul (Kadıköy & Beyoğlu)',
    continent: 'Europe',
    status: 'future_pool',
    level: 'Could Be Coming Soon',
    samplePhrase: 'Naber kanka? Boğaz’a karşı iki çay içelim mi?',
    translation: "What's up buddy? Shall we drink two teas facing the Bosphorus?",
    persona: 'Emre (Kadıköy Ferry Regular)',
    description: 'Agglutinative harmony, warm tea-garden hospitality, and expressive Istanbul bazaar idioms.',
    culturalNote: '"Kolay gelsin" ("May it come easy") is said to anyone working.'
  },
  {
    id: 'el-GR',
    name: 'Greek',
    dialect: 'Athenian Street Greek',
    flag: '🇬🇷',
    region: 'Athens & Aegean Islands',
    continent: 'Europe',
    status: 'future_pool',
    level: 'Could Be Coming Soon',
    samplePhrase: 'Έλα ρε φίλε! Τι κάνεις; Πάμε για κανένα φραπέ στην Πλάκα;',
    translation: 'Hey my friend! How are you? Shall we go for a freddo/frappé in Plaka?',
    persona: 'Nikos (Plaka Tavern Host)',
    description: 'High-energy Mediterranean warmth, expressive particles ("re!"), and late-night taverna culture.',
    culturalNote: '"Χαλαρά" (Halara - take it easy) is a way of life.'
  },
  {
    id: 'tl-PH',
    name: 'Tagalog',
    dialect: 'Manila Taglish & Street Tagalog',
    flag: '🇵🇭',
    region: 'Metro Manila',
    continent: 'Asia',
    status: 'future_pool',
    level: 'Could Be Coming Soon',
    samplePhrase: 'Kumusta pare! Tara, kain tayo sa labas mamaya!',
    translation: 'How are you buddy! Come on, let us eat out later!',
    persona: 'Bea (BGC Creative)',
    description: 'Effortless code-switching between Tagalog and English, polite "po/opo" markers, and warm humor.',
    culturalNote: 'Adding "po" shows instant warmth and respect to elders and strangers.'
  }
];

const DIALECT_STATUS_STORAGE_KEY = 'vera_dialect_status_overrides_v2';

export function getDialectStatusOverrides(): Record<string, DialectStatus> {
  try {
    const raw = localStorage.getItem(DIALECT_STATUS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setDialectStatusOverride(dialectId: string, status: DialectStatus): DialectTrack[] {
  try {
    const current = getDialectStatusOverrides();
    current[dialectId] = status;
    localStorage.setItem(DIALECT_STATUS_STORAGE_KEY, JSON.stringify(current));
    // Mutate exported array in place so all components see updated statuses immediately
    DIALECT_TRACKS.forEach((d) => {
      if (d.id === dialectId) d.status = status;
    });
    window.dispatchEvent(new CustomEvent('vera_dialects_updated'));
  } catch {}
  return getLiveDialectTracks();
}

export function getLiveDialectTracks(): DialectTrack[] {
  const overrides = getDialectStatusOverrides();
  return BASE_DIALECT_TRACKS.map((track) => ({
    ...track,
    status: overrides[track.id] || track.status
  }));
}

export const DIALECT_TRACKS: DialectTrack[] = getLiveDialectTracks();

export const INITIAL_VOTES: Record<string, { count: number; name: string; dialect: string; flag: string; region: string; description: string }> = {
  'it-NAP': {
    count: 1420,
    name: 'Italian',
    dialect: 'Neapolitan (Napulitano)',
    flag: '🇮🇹',
    region: 'Naples & Campania',
    description: 'UNESCO-recognized southern heritage language packed with passion and culinary culture.'
  },
  'zh-HK': {
    count: 1180,
    name: 'Chinese',
    dialect: 'Hong Kong Cantonese',
    flag: '🇭🇰',
    region: 'Hong Kong',
    description: 'Dynamic 9-tone colloquial system beloved in global cinema and dim sum culture.'
  },
  'ar-LEV': {
    count: 990,
    name: 'Arabic',
    dialect: 'Levantine (Lebanese)',
    flag: '🇱🇧',
    region: 'Beirut & Levant',
    description: 'Renowned for warm, rhythmic greetings, poetic hospitality, and cross-cultural elegance.'
  },
  'de-BAV': {
    count: 640,
    name: 'German',
    dialect: 'Bavarian (Boarisch)',
    flag: '🇩🇪',
    region: 'Munich & Alps',
    description: 'Rich southern heritage dialect with hearty Alpine phrasing and distinct vowels.'
  },
  'ar-DZ': {
    count: 590,
    name: 'Arabic',
    dialect: 'Algerian Darja (Dziriya)',
    flag: '🇩🇿',
    region: 'Algiers & Oran',
    description: 'Expressive North African street dialect with Raï musicality and rapid contractions.'
  },
  'es-AR': {
    count: 530,
    name: 'Spanish',
    dialect: 'Argentine Porteño',
    flag: '🇦🇷',
    region: 'Buenos Aires',
    description: 'Iconic Rioplatense Spanish with Lunfardo slang, voseo, and Italian-inflected cadence.'
  },
  'ko-KR': {
    count: 490,
    name: 'Korean',
    dialect: 'Seoul Contemporary',
    flag: '🇰🇷',
    region: 'Seoul',
    description: 'Modern Seoul street slang, pocha night-market culture, and natural casual Banmal.'
  },
  'ht-HT': {
    count: 440,
    name: 'Creole',
    dialect: 'Haitian Creole (Kreyòl)',
    flag: '🇭🇹',
    region: 'Port-au-Prince',
    description: 'Vibrant Caribbean language rich in proverbs, warmth, and rhythmic expression.'
  }
};
