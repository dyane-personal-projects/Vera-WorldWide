/**
 * Transliteration & Phonetic Script Utilities
 * Provides Franco-Arabic (Arabizi / 3arabizi), Japanese Romaji, and non-Latin script transliterations.
 * Supports numbers for Arabic phonetics: 3 ('Ayn), 7 (Haa), 5 (Khaa), 2 (Hamza/Qaf), 6 (Taa), 9 (Saad), 8 (Ghayn).
 */

export interface TransliterationConfig {
  userCefrLevel?: string;
  isReadingLesson?: boolean;
  manualOverride?: boolean | null; // null = use automatic logic based on level
}

/**
 * Checks if a language or dialect uses a non-Latin / non-American alphabet.
 * Returns true for Arabic, Japanese, Chinese, Korean, Russian, Greek, Hindi, etc.
 * Returns false for Spanish, French, Italian, Portuguese, German, English.
 */
export function isNonLatinScript(dialectId: string): boolean {
  if (!dialectId) return false;
  const id = dialectId.toLowerCase();
  return (
    id.startsWith('ar') || // Arabic (Egyptian, Moroccan, Levantine, Gulf)
    id.startsWith('ja') || // Japanese (Tokyo, Kansai)
    id.startsWith('zh') || // Chinese (Cantonese, Mandarin)
    id.startsWith('ko') || // Korean
    id.startsWith('ru') || // Russian
    id.startsWith('el') || // Greek
    id.startsWith('hi')    // Hindi
  );
}

/**
 * Determines whether transliteration should be shown based on:
 * 1. Language script (only for non-Latin scripts)
 * 2. Learner's CEFR level:
 *    - Beginner (A1, A2, beginner) -> ON by default
 *    - Intermediate (B1, B2, intermediate) -> ON by default
 *    - Above intermediate (C1, C2, MASTER, advanced, fluent, native) -> OFF / LIMITED by default
 * 3. Whether the lesson is specifically a reading lesson (late path script mastery)
 * 4. User manual toggle override if set
 */
export function shouldShowTransliteration(
  dialectId: string,
  cefrLevel: string = 'A2',
  isReadingLesson: boolean = false,
  manualOverride: boolean | null = null
): boolean {
  // Latin script languages do not need transliteration
  if (!isNonLatinScript(dialectId)) {
    return false;
  }

  // If user explicitly toggled it, respect their preference
  if (manualOverride !== null && manualOverride !== undefined) {
    return manualOverride;
  }

  // If this lesson is specifically dedicated to reading the script without aids
  if (isReadingLesson) {
    return false;
  }

  const lvl = (cefrLevel || '').toUpperCase();
  const isAboveIntermediate =
    lvl.includes('C1') ||
    lvl.includes('C2') ||
    lvl.includes('MASTER') ||
    lvl.includes('ADVANCED') ||
    lvl.includes('FLUENT') ||
    lvl.includes('NATIVE');

  // If above intermediate, transliteration is limited / off by default
  if (isAboveIntermediate) {
    return false;
  }

  // Beginner, intermediate, or unplaced learners get transliteration on by default
  return true;
}

// Curated Franco-Arabic (Arabizi) and Japanese Romaji Dictionary
const CURATED_TRANSLITERATIONS: Record<string, string> = {
  // Common Egyptian Words & Expressions
  'إزيك': 'Ezzayak',
  'إزيك يا باشا': 'Ezzayak ya basha',
  'إزيك يا باشا؟': 'Ezzayak ya basha?',
  'عامل إيه': '3amel eh',
  'عامل إيه؟': '3amel eh?',
  'كله تمام': 'Kollo tamam',
  'كله تمام؟': 'Kollo tamam?',
  'إزيك يا باشا؟ عامل إيه؟ كله تمام؟': 'Ezzayak ya basha? 3amel eh? Kollo tamam?',
  'يا باشا': 'Ya basha',
  'يا ريس': 'Ya rayyes',
  'يا أسطى': 'Ya osta',
  'يا معلم': 'Ya m3allem',
  'يا صاحبي': 'Ya 9a7bi',
  'يا عم': 'Ya 3amm',
  'يا سيدي': 'Ya seedi',
  'حبيبي': '7abeebi',
  'حياتي': '7ayati',
  'عذابي': '3dabi',
  'حجر': '7agar',
  'شيشة': 'Shisha',
  'شكراً': 'Shukran',
  'من فضلك': 'Min fadlak',
  'لو سمحت': 'Law sama7t',
  'الحساب': 'El-7esab',
  'الحساب لو سمحت': 'El-7esab law sama7t',
  'الحساب لو سمحت يا باشا، ربنا يخليك': 'El-7esab law sama7t ya basha, rabbena yi5alleek',
  'من فضلك، محطة المترو منين لو سمحت؟': 'Min fadlak, ma7a66et el-metro mneen law sama7t?',
  'محطة المترو منين': 'Ma7a66et el-metro mneen',
  'شكراً يا ريس، ربنا يسهل، مش محتاج دلوقتي': 'Shukran ya rayyes, rabbena yesahel, mesh me7tag delwa2ti',
  'ربنا يسهل': 'Rabbena yesahel',
  'ربنا يخليك': 'Rabbena yi5alleek',
  'دقيقة وهكون عندك يا صاحبي، في السكة': 'De2ee2a w-hakoon 3andak ya 9a7bi, fel-sekka',
  'في السكة': 'Fel-sekka',
  'معاك فكة يا باشا ولا ورقة بميتين؟': 'Ma3ak fakka ya basha wala wara2a b-miteen?',
  'معاك فكة': 'Ma3ak fakka',
  'فكة': 'Fakka',
  'يا سيدي الفل والياسمين، شرفتنا ونورتنا!': 'Ya seedi el-fol wel-yasmeen, sharraftana w-nawwartana!',
  'الفل والياسمين': 'El-fol wel-yasmeen',
  'علبة كشري ميكس، وكتر الدقة والشطة لو سمحت': '3elbet koshari mix, w-kattar el-daqqa wesh-shatta law sama7t',
  'كشري': 'Koshari',
  'دقة': 'Daqqa',
  'شطة': 'Shatta',
  'شاي في الخمسينة': 'Shay fel-5amseenah',
  'قهوة مظبوط': '2ahwa mazboot',
  'ما تستهبلش يا عم، إنت فاهم قصدي كويس!': 'Ma tista5balsh ya 3amm, enta fahem 2a9di kwayyis!',
  'ما تستهبلش': 'Ma tista5balsh',
  'المشوار ده كلفني دم قلبي والله': 'El-meshwar dah kallifni damm 2albi wallah',
  'كلفني دم قلبي': 'Kallifni damm 2albi',
  'دم قلبي': 'Damm 2albi',
  'كبر دماغك يا صاحبي وفكك من الحوار ده': 'Kabbar demaghak ya 9a7bi w-fakkak men el-7ewar dah',
  'كبر دماغك': 'Kabbar demaghak',
  'فكك منه': 'Fakkak mennoh',
  'فكك': 'Fakkak',
  'طب عشان خاطري وخاطر الزبون الدايم، تخليه بكام في السريع يا هندسة؟': 'Tab 3ashan 5atri w-5ater el-zeboon el-dayem, te5allih b-kam fel-saree3 ya handasa?',
  'عشان خاطري': '3ashan 5atri',
  'يا هندسة': 'Ya handasa',
  'أنا لقطتها وهي طايرة على طول يا معلم': 'Ana la2at-taha w-heyya 6ayra 3ala tool ya m3allem',
  'لقطتها وهي طايرة': 'La2at-taha w-heyya 6ayra',
  'الراجل ده ابن بلد أصيل وجدع يقف معاك في الشدة': 'El-ragel dah ebn balad a9eel w-gada3 ye2af ma3ak fesh-shedda',
  'ابن بلد': 'Ebn balad',
  'جدع': 'Gada3',
  'في الشدة': 'Fesh-shedda',
  'يا سلام! على أساس إنك ما كنتش عارف يعني؟': 'Ya salam! 3ala asas ennak ma kontesh 3aref ya3ni?',
  'على أساس إنك': '3ala asas ennak',
  'خليك في حالك وما تحشرش مناخيرك في اللي مالكش فيه': 'Khaleek fi 7alak w-matohshorsh manakheerak felli malaksh feeh',
  'خليك في حالك': 'Khaleek fi 7alak',
  'حشر المناخير': '7ashr el-manakheer',
  'ده واكل الجو كله النهارده': 'Dah wakel el-gaww kollo ennaharda',
  'واكل الجو': 'Wakel el-gaww',
  'بص عليه، واكل الجو كله ومحدش عارف يكلمه': 'Boss 3aleih, wakel el-gaww kollo w-ma7addesh 3aref ykallimoh',
  'شايف نفسه على الناس وفاكر إنه مفيش منه اتنين': 'Shayef nafsoh 3alan-nas w-faker ennoh mafeesh mennoh etneen',
  'شايف نفسه': 'Shayef nafsoh',
  'صاحبي ده سد معايا في وقت الشدة بجد': '9a7bi dah sadd ma3aya fi wa2t el-shedda begadd',
  'سد معايا': 'Sadd ma3aya',
  'يا عم فكك منه، ده بينفخ في قربة مقطوعة': 'Ya 3amm fakkak mennoh, dah beyonfo5 fi 2erba ma26oo3a',
  'بينفخ في قربة مقطوعة': 'Beyonfo5 fi 2erba ma26oo3a',
  'أهلاً وسهلاً يا باشا! يا مساء الفل والياسمين. شرفتنا ونورتنا!': '2ahlan w-sahlan ya basha! Ya masa2 el-fol wel-yasmeen. Sharraftana w-nawwartana!',
  'أهلاً بيك يا باشا': '2ahlan beek ya basha',
  'مساء الفل': 'Masa2 el-fol',
  'صباح الخير': '9aba7 el-5eir',
  'صباح الفل': '9aba7 el-fol',
  'سلام عليكم': 'Salam 3aleikom',
  'وعليكم السلام': 'W-3aleikom es-salam',
  'إيه الأخبار؟': '2eh el-2a5bar?',
  'إيه الأخبار': '2eh el-2a5bar',
  'كله تمام والحمد لله': 'Kollo tamam wel-7amdolillah',
  'الحمد لله': 'El-7amdolillah',
  'وسط البلد': 'Wos6 el-balad',
  'خان الخليلي': 'Khan el-Khalili',
  'الزمالك': 'Zamalek',
  'التحرير': 'Tahrir',
  'المترو': 'El-metro',
  'التاكسي': 'Et-taxi',
  'بكام ده؟': 'B-kam dah?',
  'بكام': 'B-kam',
  'عايز': '3ayez',
  'مش عايز': 'Mesh 3ayez',
  'حواوشي': '7awawshi',
  'طعمية': '6a3meyya',
  'فول': 'Fool',

  // Common Japanese Words & Expressions
  'お疲れ様です！このあと軽く一杯どうですか？': 'Otsukaresama desu! Kono ato karuku ippai dou desu ka?',
  'お疲れ様です': 'Otsukaresama desu',
  'とりあえず生ビールふたつで！': 'Toriaezu nama biiru futatsu de!',
  'とりあえず生で！': 'Toriaezu nama de!',
  'よっ！久しぶり！最近どうよ？': 'Yo! Hisashiburi! Saikin dou yo?',
  '相変わらず元気にやってるよ': 'Aikawarazu genki ni yatteru yo',
  'じゃあまた来週ね！気をつけて！': 'Jaa mata raishuu ne! Ki o tsukete!',
  'じゃあまたね': 'Jaa mata ne',
  'それな！': 'Sore na!',
  'よろしく！': 'Yoroshiku!',
  'よろしくお願いします': 'Yoroshiku onegaishimasu',
  '乾杯！': 'Kanpai!',
  'すみません': 'Sumimasen',
  'ありがとうございます': 'Arigatou gozaimasu',
  'こんにちは': 'Konnichiwa',
  'おはようございます': 'Ohayou gozaimasu'
};

/**
 * Algorithmic character-by-character converter for Arabic to Franco-Arabic (Arabizi/3arabizi)
 */
function convertArabicToArabizi(text: string): string {
  const map: Record<string, string> = {
    'ع': '3',
    'ح': '7',
    'خ': '5',
    'ء': '2',
    'أ': '2a',
    'إ': '2e',
    'آ': '2aa',
    'ؤ': '2o',
    'ئ': '2e',
    'ط': '6',
    'ص': '9',
    'غ': '8',
    'ظ': '6\'',
    'ض': '9\'',
    'ق': '2', // Egyptian pronunciation of Qaf is Hamza
    'ش': 'sh',
    'ث': 's',
    'ذ': 'z',
    'ج': 'g', // Egyptian hard G
    'ب': 'b',
    'ت': 't',
    'ة': 'a',
    'د': 'd',
    'ر': 'r',
    'ز': 'z',
    'س': 's',
    'ف': 'f',
    'ك': 'k',
    'ل': 'l',
    'م': 'm',
    'ن': 'n',
    'ه': 'h',
    'و': 'w',
    'ي': 'y',
    'ى': 'a',
    'ـ': '',
    '؟': '?',
    '،': ',',
    '؛': ';'
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (map[char] !== undefined) {
      result += map[char];
    } else {
      result += char;
    }
  }

  // Clean up repeated numbers or awkward glues
  return result
    .replace(/22+/g, '2')
    .replace(/33+/g, '3')
    .replace(/77+/g, '7')
    .replace(/55+/g, '5')
    .trim();
}

/**
 * Algorithmic Hiragana/Katakana to Romaji converter
 */
function convertJapaneseKanaToRomaji(text: string): string {
  const kanaMap: Record<string, string> = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'o', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
    'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
    'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
    'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
    'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo'
  };

  let res = '';
  for (let i = 0; i < text.length; i++) {
    const two = text.slice(i, i + 2);
    if (kanaMap[two]) {
      res += kanaMap[two];
      i++;
    } else if (kanaMap[text[i]]) {
      res += kanaMap[text[i]];
    } else {
      res += text[i];
    }
  }
  return res;
}

/**
 * Returns the phonetic transliteration (Franco-Arabic Arabizi or Romaji) for a given text.
 * Checks curated native dictionary first; falls back to character mapper.
 */
export function getTransliteration(text: string, dialectId: string): string {
  if (!text) return '';
  const trimmed = text.trim();

  // If already Latin alphabet, return as is
  if (!isNonLatinScript(dialectId)) {
    return text;
  }

  // 1. Direct match in curated dictionary
  if (CURATED_TRANSLITERATIONS[trimmed]) {
    return CURATED_TRANSLITERATIONS[trimmed];
  }

  // 2. Strip surrounding quotes / punctuation and test
  const unquoted = trimmed.replace(/^[«"“'「](.*)[»"”'」]$/, '$1');
  if (CURATED_TRANSLITERATIONS[unquoted]) {
    return CURATED_TRANSLITERATIONS[unquoted];
  }

  // 3. For Arabic dialects (ar-EG, ar-MA, etc.)
  if (dialectId.startsWith('ar') || /[\u0600-\u06FF]/.test(trimmed)) {
    // Check if partial words are in dictionary
    const words = trimmed.split(/\s+/);
    const convertedWords = words.map(w => {
      const cleanW = w.replace(/[.,/#!$%^&*;:{}=\-_`~()؟،«»]/g, '');
      if (CURATED_TRANSLITERATIONS[cleanW]) {
        return CURATED_TRANSLITERATIONS[cleanW];
      }
      return convertArabicToArabizi(w);
    });
    return convertedWords.join(' ');
  }

  // 4. For Japanese (ja-JP)
  if (dialectId.startsWith('ja') || /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(trimmed)) {
    return convertJapaneseKanaToRomaji(trimmed);
  }

  return text;
}
