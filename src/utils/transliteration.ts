// Complete Dual-Script Phonetics & Arabizi / Romaji / Pinyin Engine

const ARABIC_WORD_MAP: Record<string, string> = {
  'السلام': 'As-salam',
  'سلام': 'Salam',
  'عليكم': '3alikoum',
  'لباس': 'labas',
  'اعليك': '3lik',
  'عليك': '3lik',
  'كلشي': 'kulshi',
  'بخير': 'bikhir',
  'مزيان': 'mezyan',
  'الحمد': 'l-7amdulillah',
  'لله': '',
  'أش': 'ash',
  'كتعاود': 'kat3awed',
  'خويا': 'khoya',
  'ختي': 'khti',
  'عشيري': '3shiri',
  'صاحبي': 'sa7bi',
  'عافاك': '3afak',
  'شكراً': 'shokran',
  'بزاف': 'bezzaf',
  'دابا': 'daba',
  'صافي': 'safi',
  'واخا': 'wakha',
  'زوين': 'zwin',
  'واعر': 'wa3er',
  'بنين': 'bnin',
  'بنينة': 'bnina',
  'الماكلة': 'l-makla',
  'أتاي': 'atay',
  'مشحر': 'msha77ar',
  'بالنعناع': 'b-n-na3na3',
  'قهوة': 'qahwa',
  'نص': 'nous',
  'الطاجين': 't-tajine',
  'الكسكسو': 'l-kouskous',
  'الحساب': 'l-7esab',
  'فين': 'fin',
  'جات': 'jat',
  'المدينة': 'l-mdina',
  'القديمة': 'l-qdima',
  'شحال': 'sh7al',
  'الثمن': 't-taman',
  'غالي': 'ghali',
  'رخيص': 'rkhis',
  'المعلم': 'l-m3allem',
  'الشريف': 'sh-shrif',
  'الكونتور': 'l-compteur',
  'الطاكسي': 't-taxi',
  'دقة': 'daqqa',
  'يرحم': 'y-r7am',
  'الوالدين': 'l-walidin',
  'تبارك': 'tbarkallah',
  'الله': 'Allah',
  'إزيك': 'ezzayak',
  'يا': 'ya',
  'باشا': 'basha',
  'عامل': '3amel',
  'إيه': 'eh',
  'كله': 'kollo',
  'تمام': 'tamam',
  'ريس': 'rayyes',
  'أسطى': 'osta',
  'كشري': 'koshari',
  'الشطة': 'sh-shatta',
  'الدقة': 'd-daqqa',
  'فكة': 'fakka',
  'السكة': 's-sekka',
  'دلوقتي': 'delwa2ti',
  'محطة': 'ma7attet',
  'المترو': 'el-metro',
  'ربنا': 'rabbena',
  'يسهل': 'yesahel',
  'يخليك': 'yekhalleek',
  'الخمسينة': 'el-khamseenah'
};

const ARABIC_CHAR_MAP: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'aa', 'ء': '2',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': '7',
  'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': '9', 'ض': 'd', 'ط': '6',
  'ظ': 'z', 'ع': '3', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
  'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h',
  'ة': 'a', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ئ': '2',
  'ؤ': '2', '؟': '?', '،': ','
};

const JAPANESE_PHRASE_MAP: Record<string, string> = {
  'こんにちは': 'Konnichiwa',
  '元気': 'Genki',
  '最近どう': 'Saikin dou',
  'とりあえず生': 'Toriaezu nama',
  'お願いします': 'onegaishimasu',
  'お会計': 'O-kaikei',
  'お疲れ様でした': 'Otsukaresama deshita',
  'お疲れ様です': 'Otsukaresama desu',
  'お疲れ': 'Otsukare',
  'すみません': 'Sumimasen',
  'ありがとう': 'Arigatou',
  'ございます': 'gozaimasu',
  'それな': 'Sore na',
  'めっちゃ': 'meccha',
  'わかる': 'wakaru',
  'マジで': 'Maji de',
  '乾杯': 'Kanpai',
  'ごちそうさまでした': 'Gochisousama deshita',
  '空気を読む': 'Kuuki o yomu',
  '豚骨ラーメン': 'Tonkotsu raamen',
  '麺硬めで': 'men katame de',
  '新宿駅の南口': 'Shinjuku-eki no minamiguchi',
  '久しぶり': 'Hisashiburi',
  '相変わらず': 'Aikawarazu'
};

export function isNonLatinDialect(dialectId?: string): boolean {
  if (!dialectId) return false;
  const lower = dialectId.toLowerCase();
  return (
    lower.startsWith('ar') ||
    lower.startsWith('ja') ||
    lower.startsWith('zh') ||
    lower.startsWith('ko') ||
    lower.startsWith('el') ||
    lower.startsWith('ru')
  );
}

export function usesNonLatinScript(dialectId?: string): boolean {
  return isNonLatinDialect(dialectId);
}

export function getTransliteration(text: string, dialectId: string = 'ar-MA'): string {
  if (!text || !isNonLatinDialect(dialectId)) return '';

  if (dialectId.startsWith('ja')) {
    let romaji = text;
    Object.entries(JAPANESE_PHRASE_MAP).forEach(([jp, ro]) => {
      romaji = romaji.split(jp).join(` ${ro} `);
    });
    return romaji.replace(/\s+/g, ' ').trim();
  }

  if (dialectId.startsWith('ar')) {
    const words = text.split(/\s+/);
    const out = words.map((w) => {
      const stripped = w.replace(/[؟!،.,":]/g, '');
      const punct = w.slice(stripped.length);
      if (ARABIC_WORD_MAP[stripped] !== undefined) {
        return ARABIC_WORD_MAP[stripped] + punct;
      }
      let chars = '';
      for (const ch of w) {
        chars += ARABIC_CHAR_MAP[ch] !== undefined ? ARABIC_CHAR_MAP[ch] : ch;
      }
      return chars;
    });
    return out.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  }

  return '';
}

export function isNonLatinScript(dialectId?: string): boolean {
  return isNonLatinDialect(dialectId);
}

export function shouldShowTransliteration(dialectId?: string, cefrLevel: string = "A1"): boolean {
  if (!isNonLatinDialect(dialectId)) return false;
  const upper = (cefrLevel || "A1").toUpperCase();
  // Show Arabizi / Romaji phonetics by default for A1, A2, B1, B2; hide by default for C1/Native
  return !upper.includes("C1") && !upper.includes("C2") && !upper.includes("NATIVE");
}
