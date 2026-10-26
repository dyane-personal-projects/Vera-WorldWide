import { GoogleGenAI } from '@google/genai';

const apiKey =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
  process.env.GEMINI_API_KEY ||
  '';

let aiClient: GoogleGenAI | null = null;

if (apiKey && !apiKey.startsWith('AQ.')) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
}

export type StudioVoiceName = 'Puck' | 'Kore' | 'Charon' | 'Fenrir' | 'Zephyr';
export const MALE_STUDIO_VOICES: StudioVoiceName[] = ['Puck', 'Charon', 'Fenrir'];
export const FEMALE_STUDIO_VOICES: StudioVoiceName[] = ['Kore', 'Zephyr'];

export interface TutorResponse {
  reply: string;
  englishTranslation: string;
  feedback: string;
  rephraseSuggestion?: string;
  fluencyScore: number;
  slangTip?: string;
  slangMeaning?: string;
  suggestedReplies?: string[];
  recommendedSpeechRate?: number;
  shadowTargetGap?: string;
}

const SHADOW_STORAGE_KEY = 'vera_personal_ai_shadow_gaps';

export function getPersonalShadowGaps(dialectName: string): string[] {
  try {
    const raw = localStorage.getItem(`${SHADOW_STORAGE_KEY}_${dialectName}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordPersonalShadowGap(dialectName: string, gap?: string): void {
  if (!gap || gap.trim().length < 4) return;
  try {
    const existing = getPersonalShadowGaps(dialectName);
    const updated = [gap.trim(), ...existing.filter((g) => g !== gap.trim())].slice(0, 5);
    localStorage.setItem(`${SHADOW_STORAGE_KEY}_${dialectName}`, JSON.stringify(updated));
  } catch {}
}

const teacherTurnTracker: Record<string, number> = {};

export async function generateTutorReply(params: {
  userMessage: string;
  dialectName: string;
  persona: string;
  culturalNote?: string;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
}): Promise<TutorResponse> {
  const { userMessage, dialectName, persona, culturalNote, level = 'A1', chatHistory } = params;

  const systemInstruction = `You are a real, living human language teacher from "${dialectName}" teaching a 1-on-1 session.
Your identity: ${persona}.
Cultural focus: ${culturalNote || 'How locals actually speak in daily life'}.
Student Level: ${level}.

RULES:
1. Never mention AI or bots. You are a real person living in your country teaching your native dialect.
2. "reply" MUST be 100% in the native script of ${dialectName} (what you speak aloud).
3. "englishTranslation" is the natural English meaning of your spoken reply.
4. "feedback" is your 1st-person coaching note ("Here in my city we say...", "Try saying...").
5. "rephraseSuggestion" shows how a local would phrase what the student said.
6. "slangTip" and "slangMeaning" teach 1 real local expression.
7. "suggestedReplies" gives 3 natural replies in ${dialectName} native script.

Return strictly JSON with keys: reply, englishTranslation, feedback, rephraseSuggestion, fluencyScore, slangTip, slangMeaning, suggestedReplies.`;

  if (aiClient) {
    try {
      const formattedHistory = chatHistory.slice(-6).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      formattedHistory.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: formattedHistory,
        config: {
          systemInstruction,
          temperature: 0.8,
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        return {
          reply: parsed.reply || text,
          englishTranslation: parsed.englishTranslation || '',
          feedback: parsed.feedback || '',
          rephraseSuggestion: parsed.rephraseSuggestion,
          fluencyScore: typeof parsed.fluencyScore === 'number' ? parsed.fluencyScore : 94,
          slangTip: parsed.slangTip,
          slangMeaning: parsed.slangMeaning,
          suggestedReplies: Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : undefined
        };
      }
    } catch {}
  }

  return getContextualDialectFallback(dialectName, userMessage, level, chatHistory.length);
}

export function getContextualDialectFallback(
  dialectName: string,
  message: string,
  level: string = 'A1',
  historyLength: number = 0
): TutorResponse {
  const key = `${dialectName}_${level}`;
  const currentTurn = teacherTurnTracker[key] ?? Math.floor(historyLength / 2);
  teacherTurnTracker[key] = currentTurn + 1;

  if (dialectName.includes('Moroccan') || dialectName.includes('Darija')) {
    const lessons: TutorResponse[] = [
      {
        reply: 'تبارك الله عليك! نطقك زوين بزاف. هنا في المغرب ملي كنسولو شي واحد "لباس عليك؟"، كنزيدو معاها "أش كتعاود؟" يعني شنو الجديد عندك. يلاه جرب قول ليا: كلشي مزيان، ما كاين غير الخير!',
        englishTranslation: 'Blessings on you! Your pronunciation is really good. Here in Morocco, after we ask someone "Labas 3lik?", we add "Ash kat3awed?" which means "What\'s new with you?". Try saying back to me: "Kulshi mezyan, ma kayn ghir l-khir!" (Everything is good, only good things!)',
        feedback: 'In Morocco we say "مزيان" (Mezyan) for "good/great" instead of textbook Arabic "Jayyid". Try clicking or saying one of the replies below!',
        rephraseSuggestion: 'كلشي مزيان الحمد لله، ما كاين غير الخير!',
        fluencyScore: 95,
        slangTip: 'أش كتعاود؟ (Ash kat3awed?)',
        slangMeaning: 'How Moroccans say "What\'s new with you / What have you been up to?"',
        suggestedReplies: [
          'كلشي مزيان، ما كاين غير الخير!',
          'الحمد لله، غير مع الخدمة وصافي!',
          'لباس الحمد لله، وأنت أش كتعاود؟'
        ]
      },
      {
        reply: 'واعر بزاف! دابا أجي نتعلمو أهم كلمة في المغرب كامل: "عافاك" هي من فضلك، و"بزاف" هي كثيراً. إلى جلستي في القهوة وبغيتي أتاي، شنو غادي تقول للنادل؟',
        englishTranslation: 'Awesome! Now let\'s learn the most important words in all of Morocco: "3afak" means "please", and "Bezzaf" means "a lot / very much". If you sit at a café and want mint tea, what will you say to the waiter?',
        feedback: 'In a Moroccan café, ordering mint tea with fresh mint is "واحد أتاي بالنعناع عافاك" (Wa7ed atay b-n-na3na3 3afak). Give it a try!',
        rephraseSuggestion: 'واحد أتاي مشحر بالنعناع عافاك أ خويا!',
        fluencyScore: 96,
        slangTip: 'عافاك (3afak)',
        slangMeaning: 'The universal Moroccan word for "Please" — used with waiters, taxi drivers, and friends.',
        suggestedReplies: [
          'واحد أتاي مشحر بالنعناع عافاك!',
          'عطيني قهوة نص نص عافاك أ خويا!',
          'شكراً بزاف على هاد الدرس الزوين!'
        ]
      },
      {
        reply: 'يا سلام! راك غادي دقة دقة بحال ولد البلاد. دابا تخيل معايا بغيتي تشد طاكسي صغير في كازا ولا الرباط، أول حاجة كتقول للشيفور هي: "السلام الشريف، خدم الكونتور عافاك!"',
        englishTranslation: 'Bravo! You are progressing step by step like a true local. Now imagine you want to hail a Petit Taxi in Casa or Rabat—the first thing you tell the driver is: "Salam Shrif, khaddem l-compteur 3afak!" (Hello respected sir, turn on the meter please!)',
        feedback: 'Addressing a taxi driver as "الشريف" (Shrif) or "المعلم" (M3allem) immediately earns their respect in Morocco. Try telling me where you want to go!',
        rephraseSuggestion: 'السلام الشريف، ديني للمدينة القديمة عافاك!',
        fluencyScore: 94,
        slangTip: 'حطني غير هنا (7attni ghir hna)',
        slangMeaning: '"Drop me off right here" — how you tell a Moroccan taxi driver to pull over.',
        suggestedReplies: [
          'السلام الشريف، ديني للمدينة القديمة عافاك!',
          'حطني غير هنا في القنت عافاك أ المعلم!',
          'شحال الحساب ديال الطاكسي عافاك؟'
        ]
      },
      {
        reply: 'الله يعطيك الصحة! دابا وصلنا للمدينة القديمة ودخلنا للسوق. في المغرب، ملي كتعجبك شي سلعة وكتبغي تنقص الثمن بأدب، كتقول للمعلم: "السلعة واعرة تبارك الله، دير معايا شي ثمن زوين!"',
        englishTranslation: 'May God give you health! Now we arrived at the Old Medina and entered the souk. In Morocco, when you like an item and want to lower the price politely, you tell the craftsman: "S-sel3a wa3ra tbarkallah, dir m3aya shi taman zwin!" (The merchandise is awesome, give me a nice price!)',
        feedback: 'Always praise the artisan\'s work first ("واعرة تبارك الله") and then ask for a friendly price ("ثمن زوين"). Try bargaining with me!',
        rephraseSuggestion: 'السلعة واعرة تبارك الله، دير معايا ثمن زوين أ المعلم!',
        fluencyScore: 96,
        slangTip: 'شحال آخر ثمن؟ (Sh7al akher taman?)',
        slangMeaning: '"What is your best final price?" — the golden phrase in Moroccan souks.',
        suggestedReplies: [
          'السلعة واعرة تبارك الله، دير معايا ثمن زوين!',
          'شحال آخر ثمن أ المعلم عافاك؟',
          'صافي اتفقنا، الله يرحم الوالدين!'
        ]
      }
    ];
    return lessons[currentTurn % lessons.length];
  }

  if (dialectName.includes('Egyptian') || dialectName.includes('Masri') || dialectName.includes('Arabic')) {
    const lessons: TutorResponse[] = [
      {
        reply: 'الله ينور عليك! نطقك جميل جداً. بص يا صاحبي، إحنا في مصر لما حد يسألك "عامل إيه؟" بنرد نقول "كله تمام الحمد لله" أو "زي الفل!". جرب تقولهالي كده!',
        englishTranslation: 'Bravo to you! Your pronunciation is super nice. Look my friend, here in Egypt when someone asks you "3amel eh?" (How are you doing?), we reply "Kollo tamam el-7amdulillah" or "Zay el-fol!" (Like jasmine / fantastic!). Try saying that back to me!',
        feedback: 'In Cairo we pronounce ج as a hard "G" and ق as a quick glottal stop. Try clicking or speaking one of these natural Egyptian replies!',
        rephraseSuggestion: 'كله تمام الحمد لله، أنا زي الفل يا باشا!',
        fluencyScore: 95,
        slangTip: 'زي الفل (Zay el-fol)',
        slangMeaning: 'Literally "Like jasmine blossoms" — how Egyptians say "Fantastic / Spot on!"',
        suggestedReplies: [
          'كله تمام الحمد لله، زي الفل!',
          'أنا كويس الحمد لله، وأنت عامل إيه؟',
          'منور يا باشا، يومك جميل!'
        ]
      },
      {
        reply: 'يا عيني على الحلاوة! كده أنت بدات تتكلم مصري صح. دلوقتي لو قعدنا على قهوة بلدي في وسط البلد، تحب تطلب "شاي في الخمسينة بالنعناع" ولا "قهوة مظبوط"؟',
        englishTranslation: 'Love it! Now you are really starting to speak authentic Egyptian. Right now if we sit at a traditional ahwa in Downtown Cairo, would you like to order "Shay fel-khamseenah b-el-na3na3" (mint tea in a small glass) or "2ahwa mazboot" (medium-sweet Turkish coffee)?',
        feedback: 'Notice the word "دلوقتي" (Delwa2ti) — that is how we say "now" in Egypt instead of textbook "Al-aan".',
        rephraseSuggestion: 'واحد شاي في الخمسينة بالنعناع لو سمحت يا ريس!',
        fluencyScore: 96,
        slangTip: 'دلوقتي (Delwa2ti)',
        slangMeaning: 'Right now (the everyday Egyptian word for "now").',
        suggestedReplies: [
          'واحد شاي في الخمسينة بالنعناع لو سمحت!',
          'أنا أحب أشرب قهوة مظبوط يا باشا!',
          'قعدة القهوة في مصر ليها طعم تاني!'
        ]
      }
    ];
    return lessons[currentTurn % lessons.length];
  }

  if (dialectName.includes('French') || dialectName.includes('Paris')) {
    const lessons: TutorResponse[] = [
      {
        reply: "Super ! Tu vois, ici à Paris, dans la vie de tous les jours, on ne dit presque jamais « Je ne sais pas » — on enlève le « ne » et on dit « J'sais pas » ou « T'inquiète ! ». Si on s'installe en terrasse, tu prends quoi à boire ?",
        englishTranslation: "Great! You see, here in Paris in everyday life, we almost never say textbook 'Je ne sais pas' — we drop the 'ne' and say 'J'sais pas' or 'T'inquiète!' (Don't worry!). If we sit on a café terrace, what are you having to drink?",
        feedback: 'In Paris, ordering "Un café serré" or "Un allongé" with "s\'il vous plaît" is how every morning starts. Try ordering with me!',
        rephraseSuggestion: "Je prends un petit café serré en terrasse, s'il vous plaît !",
        fluencyScore: 95,
        slangTip: "T'inquiète !",
        slangMeaning: "Short for 'Ne t'inquiète pas' — Parisians use it constantly for 'Don't worry / No problem!'",
        suggestedReplies: [
          "Je prends un petit café serré, s'il vous plaît !",
          "Carrément, un café et un croissant au beurre !",
          "T'inquiète, c'est moi qui invite aujourd'hui !"
        ]
      },
      {
        reply: "Franchement, c'est nickel ! Autre petit secret de Parisien : quand quelque chose est vraiment génial, on dit « C'est carrément ouf ! » ou « Ça déchire ! ». Et pour demander la note au serveur, on dit simplement : « L'addition, s'il vous plaît ! »",
        englishTranslation: "Honestly, that's spot on! Another little Parisian secret: when something is really awesome, we say 'C'est carrément ouf!' or 'Ça déchire!'. And to ask the waiter for the check, we simply say: 'L'addition, s'il vous plaît!'",
        feedback: 'Just catch the server\'s eye with a polite "Excusez-moi, l\'addition s\'il vous plaît !".',
        rephraseSuggestion: "Excusez-moi monsieur, l'addition s'il vous plaît !",
        fluencyScore: 96,
        slangTip: 'Nickel',
        slangMeaning: 'Spotless / Perfect / Works for me!',
        suggestedReplies: [
          "Excusez-moi, l'addition s'il vous plaît !",
          "C'est carrément ouf ce quartier de Paris !",
          "Nickel, merci pour ces vrais conseils de Parisien !"
        ]
      }
    ];
    return lessons[currentTurn % lessons.length];
  }

  if (dialectName.includes('Japanese') || dialectName.includes('Tokyo')) {
    const lessons: TutorResponse[] = [
      {
        reply: 'すごくいい感じだね！東京で友達と話すときは、教科書の「そうです」じゃなくて「それな！」とか「ほんとそれ！」って言うと、ぐっと距離が縮まるよ。今度カフェに行くとしたら、何を頼みたい？',
        englishTranslation: "That feels super natural! In Tokyo, when talking with friends, instead of textbook 'Sou desu', saying 'Sore na!' or 'Honto sore!' (Totally / So true!) brings you much closer. If we go to a café next, what would you like to order?",
        feedback: 'To order naturally anywhere in Japan, just say "[Item] をください (o kudasai)" or "[Item] をお願いします (o onegaishimasu)"!',
        rephraseSuggestion: 'それな！アイスコーヒーを一つお願いします！',
        fluencyScore: 95,
        slangTip: 'それな (Sore na)',
        slangMeaning: 'Totally! / Exactly! (The #1 casual agreement phrase in Tokyo).',
        suggestedReplies: [
          'それな！コーヒーを一つお願いします！',
          '抹茶ラテとケーキをください！',
          '東京のカフェってすごくおしゃれだね！'
        ]
      },
      {
        reply: '完璧だよ！あと、日本のレストランやカフェでお会計をお願いするときは、手で小さくバッテン（×）を作るか、「すみません、お会計お願いします！」って言えばバッチリ通じるよ！',
        englishTranslation: "Spot on! Also, when asking for the bill at a Japanese restaurant or café, making a tiny 'X' with your index fingers or saying 'Sumimasen, o-kaikei onegaishimasu!' works 100% of the time!",
        feedback: 'When leaving the restaurant after paying, say "ごちそうさまでした！" (Gochisousama deshita! = Thank you for the meal!).',
        rephraseSuggestion: 'すみません、お会計お願いします！ごちそうさまでした！',
        fluencyScore: 96,
        slangTip: 'お会計お願いします (O-kaikei onegaishimasu)',
        slangMeaning: 'The check, please!',
        suggestedReplies: [
          'すみません、お会計お願いします！',
          'ごちそうさまでした！すごく美味しかったです！',
          '今日もわかりやすいレッスンをありがとう！'
        ]
      }
    ];
    return lessons[currentTurn % lessons.length];
  }

  if (dialectName.includes('Portuguese') || dialectName.includes('Carioca')) {
    return {
      reply: 'Mandou super bem! Olha só, aqui no Rio de Janeiro a gente quase não fala "está bem" — na rua todo mundo diz "Tá tranquilo!", "Beleza!" ou "Fechou!". Se a gente for na praia de Ipanema agora, o que você pede no quiosque?',
      englishTranslation: 'You did super well! Look, here in Rio de Janeiro we almost never say formal "está bem" — on the street everyone says "Tá tranquilo!", "Beleza!" or "Fechou!" (Deal!). If we head to Ipanema beach right now, what are you ordering at the kiosk?',
      feedback: 'In Rio, calling the kiosk attendant "chefe" or "meu parceiro" ("Manda uma água de coco gelada, chefe!") gets you a huge smile right away!',
      rephraseSuggestion: 'Fechou! Manda uma água de coco bem gelada, chefe!',
      fluencyScore: 95,
      slangTip: 'Fechou!',
      slangMeaning: "Deal! / Sounds good! / It's a plan!",
      suggestedReplies: [
        'Fechou! Manda uma água de coco bem gelada, chefe!',
        'Quero um açaí caprichado na praia!',
        'Tá tranquilo, tô adorando aprender o jeito carioca!'
      ]
    };
  }

  return {
    reply: '¡Órale, te escuchaste súper natural! Mira, aquí en México en vez de decir "sí, estoy de acuerdo", decimos "¡Me late!" o "¡Órale va!". Por ejemplo, si te invito por unos tacos al pastor ahorita, ¿qué me contestas?',
    englishTranslation: 'Right on, you sounded super natural! Look, here in Mexico instead of textbook "sí, estoy de acuerdo", we say "¡Me late!" (I like that!) or "¡Órale va!" (Let\'s do it!). If I invite you for some tacos al pastor right now, what do you answer me?',
    feedback: 'Using "¡Me late!" and "porfa" (short for por favor) immediately makes you sound like a local in Mexico City.',
    rephraseSuggestion: '¡Me late un buen! Vamos por unos tacos al pastor.',
    fluencyScore: 95,
    slangTip: '¡Me late!',
    slangMeaning: 'Literally "It beats (my heart)" — Mexican Spanish for "I like that idea / I\'m down!"',
    suggestedReplies: [
      '¡Me late un buen! Vamos por unos tacos al pastor',
      '¡Órale va! Me pido tres con todo, porfa',
      '¿Qué salsa pica menos en la taquería?'
    ]
  };
}

let currentActiveAudio: HTMLAudioElement | null = null;

export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/\([A-Za-z0-9\s,.'!?/-]+\)/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}]/gu, '')
    .replace(/[«»""''‹›*_~`#]/g, '')
    .trim();
}

export function stopAllAudio(): void {
  if (currentActiveAudio) {
    currentActiveAudio.pause();
    currentActiveAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export async function generateNativeSpeechAudio(params: {
  text: string;
  dialectId?: string;
  voiceName?: StudioVoiceName;
  voiceGender?: 'male' | 'female';
  personaId?: string;
}): Promise<string | null> {
  const { text, dialectId = 'es-MX', voiceGender = 'male', personaId = '' } = params;
  const clean = cleanTextForSpeech(text);
  if (!clean) return null;
  return `/api/tts?tl=${encodeURIComponent(dialectId)}&gender=${encodeURIComponent(voiceGender)}&persona=${encodeURIComponent(personaId)}&q=${encodeURIComponent(clean)}`;
}

export async function playNativeAudio(params: {
  text: string;
  dialectId?: string;
  voiceName?: StudioVoiceName;
  voiceGender?: 'male' | 'female';
  personaId?: string;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}): Promise<void> {
  const {
    text,
    dialectId = 'es-MX',
    voiceGender = 'male',
    personaId = '',
    rate = 1.0,
    onStart,
    onEnd,
    onError
  } = params;

  const clean = cleanTextForSpeech(text);
  if (!clean) {
    onEnd?.();
    return;
  }

  stopAllAudio();
  onStart?.();

  const streamUrl = `/api/tts?tl=${encodeURIComponent(dialectId)}&gender=${encodeURIComponent(
    voiceGender
  )}&persona=${encodeURIComponent(personaId)}&q=${encodeURIComponent(clean)}`;

  try {
    const audio = new Audio(streamUrl);
    currentActiveAudio = audio;
    audio.playbackRate = Math.max(0.8, Math.min(rate, 1.25));
    audio.onended = () => {
      currentActiveAudio = null;
      onEnd?.();
    };
    audio.onerror = (err) => {
      currentActiveAudio = null;
      onError?.(err);
      onEnd?.();
    };
    await audio.play();
  } catch (err) {
    currentActiveAudio = null;
    onError?.(err);
    onEnd?.();
  }
}

export async function generateAnnouncementCopy(): Promise<string> {
  return '🇲🇦 Moroccan Darija & 🇪🇬 Egyptian Masri are LIVE! Connect with a real local teacher today.';
}
