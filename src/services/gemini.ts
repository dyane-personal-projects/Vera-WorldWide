import { GoogleGenAI } from '@google/genai';

const apiKey =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
  process.env.GEMINI_API_KEY ||
  '';

let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
}

export type StudioVoiceName = 'Puck' | 'Kore' | 'Charon' | 'Fenrir' | 'Zephyr';

// Strictly separated by gender so a male teacher NEVER speaks with a woman's voice!
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

export async function generateTutorReply(params: {
  userMessage: string;
  dialectName: string;
  persona: string;
  culturalNote?: string;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
}): Promise<TutorResponse> {
  const { userMessage, dialectName, persona, culturalNote, level = 'A1', chatHistory } = params;

  const priorShadowGaps = getPersonalShadowGaps(dialectName);
  const shadowContext =
    priorShadowGaps.length > 0
      ? `Past learner points to gently reinforce: ${priorShadowGaps.join(' | ')}`
      : 'First session — observe how the learner phrases things and teach them naturally.';

  const levelPedagogyMap = {
    A1: `Student is a Beginner (A1). Speak 1-2 short, warm, everyday sentences in ${dialectName}. In your "feedback" note, talk directly to the student in the first person ("I...") like a real human tutor explaining what your words mean, how locals in your city actually pronounce them, and give them 1 specific phrase to try saying back to you next.`,
    A2: `Student is Elementary (A2). Use practical daily sentences in ${dialectName} (cafés, taxis, greetings). In your first-person "feedback" note, teach them a shortcut or street word locals use instead of textbook language.`,
    B1: `Student is Intermediate (B1). Keep a natural local conversation going in ${dialectName}, introducing 1 authentic regional expression and explaining its cultural vibe in first-person in "feedback".`,
    B2: `Student is Upper-Intermediate (B2). Speak with authentic native cadence, local humor, and contractions in ${dialectName}. Coach them in first-person on sounding 100% like a local.`,
    C1: `Student is Mastery (C1). Converse at full local street speed with deep cultural idioms and proverbs in ${dialectName}.`
  };

  const levelDirective = levelPedagogyMap[level] || levelPedagogyMap.A1;

  const systemInstruction = `You are a real, living human language teacher from the country/city of "${dialectName}" having a live 1-on-1 session with your student.
Your identity: ${persona}.
Cultural focus: ${culturalNote || 'How real people actually speak on the street, in cafés, and with friends'}.
Teaching approach for this student: ${levelDirective}
${shadowContext}

STRICT RULES SO YOU NEVER SOUND LIKE AN AI:
1. NEVER mention AI, bots, algorithms, or language models. You are a real person living in your city teaching your native dialect.
2. Your "reply" field is what you SPEAK OUT LOUD in ${dialectName}. It MUST be written 100% in the authentic native script of ${dialectName} (Arabic script for Moroccan Darija / Egyptian Masri, Japanese script for Japanese, Spanish for Mexican/Colombian, French for Parisian, Portuguese for Carioca). Do NOT put English or parenthetical translations inside "reply" so the voice engine only speaks pure ${dialectName}.
3. In "englishTranslation", provide the natural English meaning of what you just said.
4. In "feedback", speak directly to the student in FIRST PERSON ("Here in Casablanca, we say...", "I loved how you said...", "Try replying to me with...") — teaching them how people in your country actually talk!
5. In "rephraseSuggestion", show how a native local in your city would phrase the student's message naturally.
6. Provide "slangTip" and "slangMeaning" with a real local word or phrase from your city.
7. Provide "suggestedReplies": 3 natural responses in ${dialectName} (native script) that the student can say back to you right now.

Return strictly valid JSON:
{
  "reply": "Your spoken words in ${dialectName} native script",
  "englishTranslation": "Natural English meaning",
  "feedback": "First-person personal teaching note from you to the student",
  "rephraseSuggestion": "How a local in your city would say the student's thought",
  "fluencyScore": 93,
  "recommendedSpeechRate": 0.95,
  "shadowTargetGap": "Short note on vocab/grammar to remember",
  "slangTip": "Local word or phrase",
  "slangMeaning": "How locals use it",
  "suggestedReplies": ["Reply 1", "Reply 2", "Reply 3"]
}`;

  if (aiClient) {
    try {
      const formattedHistory = chatHistory.slice(-6).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      formattedHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

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
        try {
          const parsed = JSON.parse(text);
          if (parsed.shadowTargetGap) {
            recordPersonalShadowGap(dialectName, parsed.shadowTargetGap);
          }
          return {
            reply: parsed.reply || text,
            englishTranslation: parsed.englishTranslation || 'Natural response in the local dialect.',
            feedback: parsed.feedback || 'Great rhythm! Notice how we link these words together in everyday speech.',
            rephraseSuggestion: parsed.rephraseSuggestion,
            fluencyScore: typeof parsed.fluencyScore === 'number' ? parsed.fluencyScore : 92,
            recommendedSpeechRate: typeof parsed.recommendedSpeechRate === 'number' ? parsed.recommendedSpeechRate : 1.0,
            shadowTargetGap: parsed.shadowTargetGap,
            slangTip: parsed.slangTip,
            slangMeaning: parsed.slangMeaning,
            suggestedReplies: Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : undefined
          };
        } catch {
          return {
            reply: text,
            englishTranslation: 'Conversational response from your local teacher.',
            feedback: 'Keep going—your rhythm is sounding more local every turn!',
            fluencyScore: 90
          };
        }
      }
    } catch (err) {
      console.warn('Gemini generation error, using rich human teacher fallback:', err);
    }
  }

  return getContextualDialectFallback(dialectName, userMessage, level);
}

export function getContextualDialectFallback(dialectName: string, message: string, level: string = 'A1'): TutorResponse {
  if (dialectName.includes('Moroccan') || dialectName.includes('Darija')) {
    return {
      reply: 'تبارك الله عليك! الهضرة ديالك زوينة بزاف. هنا في المغرب كنقولو "كلشي مزيان" ولا "صافي" بزاف في الهضرة ديال كل نهار. يلاه نجربو نطلبو أتاي مشحر في القهوة؟',
      englishTranslation: 'Blessings on you! Your phrasing is really nice. Here in Morocco we say "Kulshi mezyan" (everything is good) or "Safi" (okay/done) all the time in daily speech. Shall we practice ordering brewed mint tea at a café?',
      feedback: 'In Morocco, when you want to say "please", we never use the textbook word — we say "عافاك" (3afak). Try using "3afak" in your next reply to me!',
      rephraseSuggestion: 'واحد أتاي مشحر بالنعناع عافاك أ خويا!',
      fluencyScore: 95,
      slangTip: 'عافاك (3afak)',
      slangMeaning: 'The everyday Moroccan word for "Please" — used in cafés, taxis, and with friends.',
      suggestedReplies: ['واحد أتاي مشحر بالنعناع عافاك!', 'واخا، يلاه نطلبو في القهوة دابا!', 'شكراً بزاف، الله يرحم الوالدين!']
    };
  }
  if (dialectName.includes('Egyptian') || dialectName.includes('Masri') || dialectName.includes('Arabic')) {
    return {
      reply: 'الله ينور عليك! كلامك بالمصري طبيعي وجميل جداً. إحنا في القاهرة بنقول "كله تمام" و"يا باشا" عشان نفتح كلام بود مع أي حد. تحب نطلب شاي على القهوة؟',
      englishTranslation: 'Bravo to you! Your Egyptian phrasing is super natural and lovely. Here in Cairo we say "Kollo tamam" and "Ya basha" to open warm conversations with anyone. Want to order tea at the ahwa?',
      feedback: 'Remember that in Cairo we pronounce the letter ج as a hard "G" (so جميل is "Gameel"). Try replying to me with one of the phrases below!',
      rephraseSuggestion: 'كله تمام يا باشا، يلا نطلب شاي بالنعناع!',
      fluencyScore: 95,
      slangTip: 'في الخمسينة (Fel-khamseenah)',
      slangMeaning: 'Traditional Cairo way of ordering strong black tea in a classic small glass.',
      suggestedReplies: ['واحد شاي في الخمسينة بالنعناع لو سمحت!', 'كله تمام الحمد لله يا باشا!', 'علمني كلمات أكتر بنقولها كل يوم في مصر']
    };
  }
  if (dialectName.includes('French') || dialectName.includes('Paris')) {
    return {
      reply: "Franchement, c'est super naturel ! Ici à Paris, à l'oral, on enlève presque toujours le « ne » et on dit « t'inquiète » ou « ça roule ». On continue comme si on était en terrasse ?",
      englishTranslation: "Honestly, that's super natural! Here in Paris, when speaking, we almost always drop the 'ne' and say 't'inquiète' or 'ça roule'. Shall we keep going as if we were on a café terrace?",
      feedback: 'When Parisians speak at normal speed, "Je ne sais pas" becomes "J\'sais pas" (pronounced "Chépa"). Try replying to me with a casual terrace phrase!',
      rephraseSuggestion: "Carrément, on se prend un petit café serré !",
      fluencyScore: 94,
      slangTip: "T'inquiète",
      slangMeaning: 'Short for "Ne t\'inquiète pas" — used non-stop in France for "Don\'t worry / no problem".',
      suggestedReplies: ['Carrément, un café serré s’il vous plaît !', 'Ça roule, j’adore parler comme un vrai Parisien !', 'Qu’est-ce que tu me conseilles de visiter aujourd’hui ?']
    };
  }
  if (dialectName.includes('Japanese') || dialectName.includes('Tokyo')) {
    return {
      reply: 'すごく自然な日本語だね！東京では友達と話すとき、語尾に「ね」や「よ」をつけると一気に親しみやすくなるよ。次はカフェや居酒屋の会話をしてみようか？',
      englishTranslation: "That's super natural Japanese! In Tokyo, when talking with friends, adding 'ne' or 'yo' at the end of sentences immediately makes you sound warm and approachable. Shall we try a café or izakaya conversation next?",
      feedback: 'In real Tokyo conversations, we use "それな！" (Sore na! = Totally/Exactly!) all the time to show we agree with a friend. Try using it with me!',
      rephraseSuggestion: 'いいね！ぜひやってみようよ！',
      fluencyScore: 95,
      slangTip: 'それな (Sore na)',
      slangMeaning: 'The #1 natural Tokyo expression for "Totally / I completely agree!"',
      suggestedReplies: ['それな！さっそく練習しよう！', 'とりあえず生ビールお願いします！', 'おすすめのカフェメニューは何？']
    };
  }
  if (dialectName.includes('Portuguese') || dialectName.includes('Carioca')) {
    return {
      reply: 'Mandou muito bem! Aqui no Rio a gente fala "tá" em vez de "está" o tempo todo, deixa a conversa muito mais leve. Bora pedir uma água de coco na praia?',
      englishTranslation: 'You did great! Here in Rio we say "tá" instead of "está" all the time, it makes the conversation much lighter. Shall we order a coconut water on the beach?',
      feedback: 'To sound like a true Carioca from Rio, use "Bora!" whenever you want to say "Let\'s go / Let\'s do it!". Try it in your next message!',
      rephraseSuggestion: 'Bora! Manda uma água de coco bem gelada!',
      fluencyScore: 94,
      slangTip: 'Bora!',
      slangMeaning: 'Short for "Vamos embora" — the universal Brazilian word for "Let\'s go / I\'m in!"',
      suggestedReplies: ['Bora! Manda uma água de coco bem gelada!', 'Tudo tranquilo por aqui, tamo junto!', 'Me ensina mais gírias do Rio de Janeiro!']
    };
  }
  return {
    reply: '¡Qué bien te escuchas! Aquí en la calle casi nunca hablamos como en los libros; usamos palabras como "ahorita", "me late" y "porfa" todo el día. ¿Practicamos pedir en una taquería?',
    englishTranslation: 'You sound great! Here on the street we almost never talk like textbooks; we use words like "ahorita", "me late", and "porfa" all day. Shall we practice ordering at a taquería?',
    feedback: 'Instead of saying "Estoy de acuerdo", locals say "¡Me late!" (I like that idea / sounds good to me). Try using "¡Me late!" in your next reply!',
    rephraseSuggestion: '¡Me late! Me das dos de pastor con todo, porfa.',
    fluencyScore: 94,
    slangTip: 'Me late',
    slangMeaning: 'Literally "it beats (my heart)" — everyday expression for "I like it / I\'m down!"',
    suggestedReplies: ['¡Me late! Dos tacos al pastor con todo, porfa', '¡Órale, qué buena onda! Sigamos practicando', '¿Qué salsa pica más, la verde o la roja?']
  };
}

// ============================================================================
// GENDER-LOCKED 24kHz STUDIO NEURAL VOICE ENGINE
// ============================================================================

const audioCache = new Map<string, string>();
let currentActiveAudio: HTMLAudioElement | null = null;

export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/\([A-Za-z0-9\s,.'!?/-]+\)/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}]/gu, '')
    .replace(/[«»""''‹›*_~`#]/g, '')
    .trim();
}

function pcmBase64ToWavDataUri(base64Pcm: string, sampleRate = 24000): string {
  const binaryString = atob(base64Pcm);
  const pcmLength = binaryString.length;
  const wavBuffer = new ArrayBuffer(44 + pcmLength);
  const view = new DataView(wavBuffer);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcmLength, true);

  const uint8 = new Uint8Array(wavBuffer);
  for (let i = 0; i < pcmLength; i++) uint8[44 + i] = binaryString.charCodeAt(i);

  let binaryWav = '';
  const chunkSize = 8192;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    binaryWav += String.fromCharCode.apply(null, Array.from(uint8.subarray(i, i + chunkSize)));
  }
  return `data:audio/wav;base64,${btoa(binaryWav)}`;
}

function getValidatedVoiceForGender(voiceName?: StudioVoiceName, voiceGender: 'male' | 'female' = 'male'): StudioVoiceName {
  if (voiceGender === 'male') {
    if (voiceName && MALE_STUDIO_VOICES.includes(voiceName)) return voiceName;
    return 'Puck';
  } else {
    if (voiceName && FEMALE_STUDIO_VOICES.includes(voiceName)) return voiceName;
    return 'Kore';
  }
}

export async function generateNativeSpeechAudio(params: {
  text: string;
  dialectId?: string;
  voiceName?: StudioVoiceName;
  voiceGender?: 'male' | 'female';
}): Promise<string | null> {
  const { text, dialectId = 'es-MX', voiceGender = 'male' } = params;
  const validatedVoice = getValidatedVoiceForGender(params.voiceName, voiceGender);
  const clean = cleanTextForSpeech(text);
  if (!clean) return null;

  const cacheKey = `${validatedVoice}_${voiceGender}_${dialectId}_${clean}`;
  if (audioCache.has(cacheKey)) return audioCache.get(cacheKey)!;
  if (!aiClient) return null;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: clean }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: validatedVoice }
          }
        }
      }
    });

    const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const audioBase64 = inlineData?.data;
    if (audioBase64) {
      const mimeType = inlineData?.mimeType || '';
      const dataUri = mimeType.includes('wav')
        ? `data:audio/wav;base64,${audioBase64}`
        : pcmBase64ToWavDataUri(audioBase64, 24000);
      audioCache.set(cacheKey, dataUri);
      return dataUri;
    }
  } catch (err) {
    console.warn('Gemini Neural TTS fallback:', err);
  }
  return null;
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

function findGenderMatchedOSVoice(
  dialectId: string,
  voices: SpeechSynthesisVoice[],
  voiceGender: 'male' | 'female'
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  const prefix = dialectId.split('-')[0].toLowerCase();
  const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  if (langVoices.length === 0) return null;

  const maleKeywords = ['maged', 'tarik', 'naayf', 'jorge', 'juan', 'carlos', 'diego', 'raul', 'thomas', 'daniel', 'otoya', 'hattori', 'felipe', 'luca', 'male'];
  const femaleKeywords = ['laila', 'salma', 'mariam', 'paulina', 'monica', 'angelica', 'amelie', 'audrey', 'marie', 'kyoko', 'o-ren', 'haruka', 'luciana', 'female'];

  const targetKeywords = voiceGender === 'male' ? maleKeywords : femaleKeywords;
  const oppositeKeywords = voiceGender === 'male' ? femaleKeywords : maleKeywords;

  // 1. Explicit gender keyword match in the target language
  const explicitMatch = langVoices.find((v) =>
    targetKeywords.some((kw) => v.name.toLowerCase().includes(kw))
  );
  if (explicitMatch) return explicitMatch;

  // 2. Voice in the target language that does NOT match the opposite gender
  const nonOppositeMatch = langVoices.find(
    (v) => !oppositeKeywords.some((kw) => v.name.toLowerCase().includes(kw))
  );
  return nonOppositeMatch || langVoices[0];
}

export async function playNativeAudio(params: {
  text: string;
  dialectId?: string;
  voiceName?: StudioVoiceName;
  voiceGender?: 'male' | 'female';
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}): Promise<void> {
  const {
    text,
    dialectId = 'es-MX',
    voiceGender = 'male',
    rate = 1.0,
    onStart,
    onEnd
  } = params;
  const validatedVoice = getValidatedVoiceForGender(params.voiceName, voiceGender);
  const clean = cleanTextForSpeech(text);
  if (!clean) {
    onEnd?.();
    return;
  }

  stopAllAudio();
  onStart?.();

  try {
    const dataUri = await generateNativeSpeechAudio({
      text: clean,
      dialectId,
      voiceName: validatedVoice,
      voiceGender
    });
    if (dataUri) {
      const audio = new Audio(dataUri);
      currentActiveAudio = audio;
      audio.playbackRate = Math.max(0.85, Math.min(rate, 1.15));
      audio.onended = () => {
        currentActiveAudio = null;
        onEnd?.();
      };
      audio.onerror = () => {
        currentActiveAudio = null;
        fallbackTTS(clean, dialectId, voiceGender, rate, onEnd);
      };
      await audio.play();
      return;
    }
  } catch {}

  fallbackTTS(clean, dialectId, voiceGender, rate, onEnd);
}

function fallbackTTS(
  cleanText: string,
  dialectId: string,
  voiceGender: 'male' | 'female',
  rate: number,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined') {
    onEnd?.();
    return;
  }
  const targetLang = dialectId.startsWith('ar')
    ? 'ar-EG'
    : dialectId.startsWith('ja')
    ? 'ja-JP'
    : dialectId.startsWith('fr')
    ? 'fr-FR'
    : dialectId.startsWith('pt')
    ? 'pt-BR'
    : 'es-MX';

  const voices = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
  const matchedVoice = findGenderMatchedOSVoice(dialectId, voices, voiceGender);

  if (matchedVoice && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(cleanText);
    u.voice = matchedVoice;
    u.lang = matchedVoice.lang || targetLang;
    u.rate = rate;
    // Pitch adjustment so male voices always sound deeper and masculine even on generic OS voices
    u.pitch = voiceGender === 'male' ? 0.88 : 1.08;
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
    return;
  }

  const streamUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
    targetLang.split('-')[0]
  )}&q=${encodeURIComponent(cleanText.slice(0, 200))}`;
  const audio = new Audio(streamUrl);
  currentActiveAudio = audio;
  audio.playbackRate = rate;
  audio.onended = () => {
    currentActiveAudio = null;
    onEnd?.();
  };
  audio.onerror = () => {
    currentActiveAudio = null;
    onEnd?.();
  };
  audio.play().catch(() => onEnd?.());
}

export async function generateAnnouncementCopy(): Promise<string> {
  return '🇲🇦 Moroccan Darija & 🇪🇬 Egyptian Masri are LIVE! Connect with a real local teacher today.';
}
