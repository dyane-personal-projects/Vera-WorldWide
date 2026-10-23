import { GoogleGenAI } from '@google/genai';

// Support both Vite VITE_ prefix and define process.env injection
const apiKey =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
  process.env.GEMINI_API_KEY ||
  '';

let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn("Could not initialize GoogleGenAI client:", err);
  }
}

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
      ? `Personal AI Shadow Memory (Past learner slips to gently reinforce & test): ${priorShadowGaps.join(' | ')}`
      : 'Personal AI Shadow Memory: First session — observe any pronunciation, word order, or register slips.';

  const levelPedagogyMap = {
    A1: 'CEFR Level A1 (Absolute Beginner): Keep your reply to 1-2 SHORT, simple sentences using basic everyday words. Offer adaptive hints. Set recommendedSpeechRate to 0.85.',
    A2: 'CEFR Level A2 (Elementary): Use simple daily conversational sentences. Introduce 1 practical street phrase. Set recommendedSpeechRate to 0.92.',
    B1: 'CEFR Level B1 (Intermediate): Maintain natural conversational rhythm. Introduce 1 authentic regional street slang or idiom. Set recommendedSpeechRate to 1.0.',
    B2: 'CEFR Level B2 (Upper Intermediate): Converse with authentic native cadence, local cultural humor, and dialectal contractions. Set recommendedSpeechRate to 1.05.',
    C1: 'CEFR Level C1 (Mastery): Speak at full local street speed with deep colloquial nuances, rapid slang, and minimal English hand-holding. Set recommendedSpeechRate to 1.1.'
  };

  const levelDirective = levelPedagogyMap[level] || levelPedagogyMap.A1;

  const systemInstruction = `You are a warm, genuine, personal native immersion tutor for "${dialectName}" on Vera WorldWide.
Your active persona: ${persona}.
Regional Cultural Focus: ${culturalNote || 'Authentic colloquial phrasing, rhythm, street idioms, and cultural etiquette'}.
Student Proficiency Level: ${levelDirective}
${shadowContext}

CRITICAL SCRIPT & LANGUAGE DIRECTIVES:
1. Your "reply" field MUST be written 100% in the authentic native script of ${dialectName} (e.g., Arabic script for Moroccan Darija / Egyptian Masri, Japanese Kanji/Kana for Japanese, Spanish for Mexican/Colombian, French for Parisian, Portuguese for Carioca). NEVER put English or Latin transliteration inside the "reply" field because the neural voice engine reads "reply" aloud!
2. Provide a clean, accurate English translation in "englishTranslation".
3. Provide constructive feedback (1 sentence) in English in "feedback".
4. Provide a "rephraseSuggestion" in the target dialect showing how a true local would say the user's thought effortlessly.
5. Identify a "shadowTargetGap" (1 short note on grammar/vocabulary to remember for next turn).
6. Provide a "slangTip" with an authentic regional word and its "slangMeaning".
7. Provide "suggestedReplies": an array of 3 realistic reply options in ${dialectName} (native script) matching level ${level}.

Format your response strictly as a JSON object:
{
  "reply": "Native script reply in ${dialectName}",
  "englishTranslation": "Clean English translation of the reply",
  "feedback": "Encouraging feedback on the user's sentence",
  "rephraseSuggestion": "How a local would rephrase the user's sentence",
  "fluencyScore": 92,
  "recommendedSpeechRate": 1.0,
  "shadowTargetGap": "Verb conjugation or street greeting particle",
  "slangTip": "Local slang term",
  "slangMeaning": "What the slang term means in local context",
  "suggestedReplies": ["Quick reply 1", "Quick reply 2", "Quick reply 3"]
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
          temperature: 0.75,
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
            englishTranslation: parsed.englishTranslation || 'Natural conversational response in the local dialect.',
            feedback: parsed.feedback || 'Great natural rhythm and conversational confidence.',
            rephraseSuggestion: parsed.rephraseSuggestion,
            fluencyScore: typeof parsed.fluencyScore === 'number' ? parsed.fluencyScore : 90,
            recommendedSpeechRate: typeof parsed.recommendedSpeechRate === 'number' ? parsed.recommendedSpeechRate : 1.0,
            shadowTargetGap: parsed.shadowTargetGap,
            slangTip: parsed.slangTip,
            slangMeaning: parsed.slangMeaning,
            suggestedReplies: Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : getFallbackSuggestions(dialectName)
          };
        } catch {
          return {
            reply: text,
            englishTranslation: 'Understanding your message in native cadence.',
            feedback: 'Natural rhythm and authentic vocabulary usage.',
            fluencyScore: 88,
            recommendedSpeechRate: 1.0,
            suggestedReplies: getFallbackSuggestions(dialectName)
          };
        }
      }
    } catch (err) {
      console.warn("Gemini generation error, utilizing contextual fallback:", err);
    }
  }

  return getContextualDialectFallback(dialectName, userMessage, level);
}

export async function generateAnnouncementCopy(topicPrompt: string): Promise<string> {
  const prompt = `Write a punchy, ultra-high-converting, professional global banner headline (maximum 12 words) for a premier language immersion platform called Vera WorldWide. Topic: "${topicPrompt}". Do not use quotes.`;
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const text = response.text?.trim();
      if (text) return text.replace(/^"|"$/g, '');
    } catch (err) {
      console.warn("Gemini announcement copy error:", err);
    }
  }
  if (topicPrompt.toLowerCase().includes('sale') || topicPrompt.toLowerCase().includes('off') || topicPrompt.toLowerCase().includes('discount')) {
    return '⚡ Flash Immersion Pass: Unlock All Dialects & Boss Arenas at 40% Off This Week!';
  }
  if (topicPrompt.toLowerCase().includes('darija') || topicPrompt.toLowerCase().includes('moroc')) {
    return '🇲🇦 Moroccan Darija is LIVE! Practice Casablanca & Rabat street fluency with Badr today.';
  }
  return `🌍 Vera WorldWide: ${topicPrompt} — Experience high-velocity street dialect fluency today!`;
}

function getFallbackSuggestions(dialectName: string): string[] {
  if (dialectName.includes('Moroccan') || dialectName.includes('Darija')) {
    return ['لباس الحمد لله، كلشي مزيان!', 'واحد أتاي بالنعناع عافاك أ خويا', 'شحال الثمن ديال هادي في السوق؟'];
  }
  if (dialectName.includes('Arabic') || dialectName.includes('Egyptian') || dialectName.includes('Masri')) {
    return ['كله تمام الحمد لله!', 'إيه أحسن أكل شعبي هنا؟', 'يلا بينا على القهوة يا باشا'];
  }
  if (dialectName.includes('Mexican')) {
    return ['¡Todo bien compa, gracias!', '¿Qué lugares me recomiendas visitar hoy?', 'Me late un montón la idea'];
  }
  if (dialectName.includes('French') || dialectName.includes('Paris')) {
    return ['Ça roule, et toi ?', 'Tu me conseilles quel bistrot dans le coin ?', "C'est trop stylé comme endroit"];
  }
  if (dialectName.includes('Japanese') || dialectName.includes('Tokyo')) {
    return ['元気だよ！そっちはどう？', 'おすすめの居酒屋ある？', 'それな！めっちゃいいね'];
  }
  if (dialectName.includes('Portuguese') || dialectName.includes('Carioca')) {
    return ['Tudo sussa meu irmão, e você?', 'Onde rola aquele açaí responsa?', 'Que parada maneira!'];
  }
  return ['¡Todo muy bien, gracias!', '¿Qué me recomiendas hacer hoy?', '¡Cuéntame más de la cultura local!'];
}

export function getContextualDialectFallback(dialectName: string, message: string, level: string = 'A1'): TutorResponse {
  const lower = message.toLowerCase();
  const lvl = level.toUpperCase();
  const isA1 = lvl === 'A1';

  if (dialectName.includes('Moroccan') || dialectName.includes('Darija')) {
    if (isA1) {
      return {
        reply: 'السلام أ خويا! لباس عليك؟ كلشي بخير؟ أنا بدر من الدار البيضاء. يلاه نتعلمو الدارجة دقة دقة بلا تعقيد!',
        englishTranslation: 'Peace my brother! How are you? Everything good? I am Badr from Casablanca. Let us learn Darija step-by-step without complication!',
        feedback: 'بداية واعرة! كلمة "لباس" (Labas) هي الساروت ديال أي هضرة في المغرب.',
        rephraseSuggestion: 'قول: "لباس الحمد لله، كلشي بخير أ خويا بدر!"',
        fluencyScore: 96,
        recommendedSpeechRate: 0.9,
        slangTip: 'دقة دقة (Daqqa daqqa)',
        slangMeaning: 'Step by step / little by little — quintessential Moroccan expression.',
        suggestedReplies: ['لباس الحمد لله، كلشي بخير!', 'بغيت نتعلم كيفاش نطلب أتاي', 'علمني كلمات ديال كازا عافاك']
      };
    }
    return {
      reply: 'واش أ عشيري! الهضرة ديالك زوينة بزاف وغادية مع الموجة ديال كازا والرباط. يلاه نطلبو براد ديال أتاي مشحر ولا نفاصلو في المدينة القديمة؟',
      englishTranslation: "What's up my friend! Your phrasing is super nice and matches the Casablanca and Rabat wave. Shall we order a pot of Moroccan mint tea or haggle in the Old Medina?",
      feedback: 'إيقاع مغربي أصيل! استعمالك للكلمات خفيف وطبيعي.',
      rephraseSuggestion: 'في الزنقة كنقولو: "صافي مشينا أ خويا، الفكرة واعرة!"',
      fluencyScore: 94,
      recommendedSpeechRate: 1.0,
      slangTip: 'واعر / زوين (Wa3er / Zwin)',
      slangMeaning: 'Awesome, tough/cool (Wa3er) and nice/beautiful (Zwin) in everyday Moroccan Darija.',
      suggestedReplies: ['واحد أتاي مشحر بالنعناع عافاك!', 'شحال الثمن النهائي أ المعلم؟', 'صافي مشينا أ خويا، الفكرة واعرة!']
    };
  }

  if (dialectName.includes('Arabic') || dialectName.includes('Egyptian') || dialectName.includes('Masri')) {
    const isFood = lower.includes('اكل') || lower.includes('أكل') || lower.includes('كشري') || lower.includes('شاي') || lower.includes('قهوة') || lower.includes('food');
    if (isFood) {
      return {
        reply: 'الله عليك! أنت ذوقك عالي في الأكل. في القاهرة لما تطلب كشري قول: علبة كشري كمالة وزود دقة وشطة، وعلى القهوة اطلب شاي في الخمسينة سكر مظبوط!',
        englishTranslation: "Spot on! You have great taste in food. In Cairo, when you eat koshari, tell the server: 'A mixed koshari box with extra daqqa and shatta', and at the café ask for 'tea in the khamseenah, medium sugar'!",
        feedback: 'اختيار ممتاز للكلمات الخاصة بالأكل الشعبي المصري.',
        rephraseSuggestion: 'استخدم "لو سمحت يا ريس" لما تطلب من الجرسون.',
        fluencyScore: 95,
        recommendedSpeechRate: 0.95,
        slangTip: 'شاي في الخمسينة (Shay fel-5amseenah)',
        slangMeaning: 'Strong Egyptian black tea served in a traditional small glass tumbler at street cafes.',
        suggestedReplies: ['واحد شاي في الخمسينة بالنعناع يا ريس!', 'الحساب كام لو سمحت يا باشا؟', 'الدقة والشطة هما روح الكشري!']
      };
    }
    return {
      reply: 'أهلاً يا باشا! مساء الفل والياسمين. كلامك زي السكر وإيقاعك ماشي مع شارع القاهرة بالملي! تحب نطلب شاي في الخمسينة على القهوة ولا نفاصل في خان الخليلي؟',
      englishTranslation: 'Welcome boss! An evening of jasmine and flowers to you. Your words are sweet as sugar and your cadence matches Cairo street rhythm! Shall we order tea at the ahwa or haggle in Khan el-Khalili?',
      feedback: 'تحية مصرية أصيلة ودافية جداً!',
      rephraseSuggestion: 'في الشارع بنرد نقول: "حبيبي يا باشا، ده نورك!"',
      fluencyScore: 95,
      recommendedSpeechRate: 0.95,
      slangTip: 'مساء الفل (Masa2 el-fol)',
      slangMeaning: 'Iconic Cairo poetic greeting expressing warm welcome, respect, and street hospitality.',
      suggestedReplies: ['حبيبي يا باشا ده نورك!', 'واحد شاي في الخمسينة بالنعناع يا ريس', 'يلا نفاصل في خان الخليلي!']
    };
  }

  if (dialectName.includes('Mexican')) {
    if (isA1) {
      return {
        reply: '¡Hola! Mucho gusto, soy Sofía de la Ciudad de México. Vamos con calma, palabra por palabra. ¿Cómo estás hoy?',
        englishTranslation: 'Hello! Nice to meet you, I am Sofia from Mexico City. We will go calmly, word by word. How are you today?',
        feedback: '¡Excelente inicio! Para responder puedes decir: "Muy bien, gracias".',
        rephraseSuggestion: '"¡Hola Sofía, cómo estás?" es un saludo perfecto y natural.',
        fluencyScore: 97,
        recommendedSpeechRate: 0.9,
        slangTip: 'Mucho gusto',
        slangMeaning: 'Standard polite Spanish for "Pleased to meet you".',
        suggestedReplies: ['Muy bien Sofía, gracias', 'Mucho gusto en conocerte', 'Quiero aprender palabras fáciles hoy']
      };
    }
    return {
      reply: '¡Órale, qué bien suena eso compa! Me late un buen tu vibra. Si quieres pedir algo en la taquería, acuérdate de decir siempre: "¿Me das dos de pastor con todo, por favor?"',
      englishTranslation: 'Wow, that sounds great buddy! I really like your vibe. If you want to order at a taco stand, remember to say: "Could I get two pastor tacos with everything, please?"',
      feedback: 'Buena estructura de oración y vocabulario adecuado para la CDMX.',
      rephraseSuggestion: '"Me late un buen" es la forma más espontánea de decir que algo te agrada.',
      fluencyScore: 93,
      recommendedSpeechRate: 1.0,
      slangTip: 'Con todo',
      slangMeaning: 'At a taco stand, ordering "con todo" automatically includes cilantro, onions, and roasted pineapple.',
      suggestedReplies: ['¿Y la salsa verde pica mucho?', '¿Cuánto es de la cuenta marchante?', '¡Están buenísimos jefe, gracias!']
    };
  }

  if (dialectName.includes('French') || dialectName.includes('Paris')) {
    return {
      reply: "Salut ! Franchement, t'as une super cadence. À Paris, au comptoir d'un café, on dit souvent : Un café serré s'il vous plaît !",
      englishTranslation: "Hey! Honestly, your conversational rhythm is great. In Paris at a café counter, locals often say: 'A short espresso please!'",
      feedback: 'Très bonne fluidité et tournure de phrase très naturelle.',
      rephraseSuggestion: "Tu peux enlever le « ne » à l'oral : « J'sais pas » au lieu de « Je ne sais pas ».",
      fluencyScore: 92,
      recommendedSpeechRate: 1.0,
      slangTip: "C'est ouf",
      slangMeaning: 'Verlan inversion of "fou" (crazy). Used constantly by all generations in Paris.',
      suggestedReplies: ['On se prend un petit café en terrasse ?', "C'est quoi ton quartier préféré à Paris ?", "Laisse tomber, c'est trop stylé !"]
    };
  }

  if (dialectName.includes('Japanese') || dialectName.includes('Tokyo')) {
    return {
      reply: 'お疲れ様！日本語のイントネーションがすごく自然だね。東京の居酒屋では「とりあえず生で！」って頼むと一瞬でローカルっぽくなるよ！',
      englishTranslation: "Great work! Your Japanese intonation is very natural. At a Tokyo izakaya, ordering 'Toriaezu nama de!' (draft beer to start!) makes you sound like an instant local!",
      feedback: '自然な相槌とリズムがバッチリです！',
      rephraseSuggestion: '友達同士なら「めっちゃいいじゃん！」と返すと自然です。',
      fluencyScore: 95,
      recommendedSpeechRate: 1.0,
      slangTip: 'それな (Sore na!)',
      slangMeaning: 'Ubiquitous Tokyo street agreement particle meaning "Preach / Exactly / Couldn\'t agree more".',
      suggestedReplies: ['とりあえず生二つお願いします！', '渋谷でおすすめのラーメン屋ある？', 'それな！めっちゃわかるよ']
    };
  }

  if (dialectName.includes('Portuguese') || dialectName.includes('Carioca') || dialectName.includes('Brazil')) {
    return {
      reply: 'E aí meu irmão, tranquilidade? Que vibe boa! Aqui no Rio a gente costuma pedir: Manda uma água de coco bem gelada aí, chefe!',
      englishTranslation: "What's up my brother, everything chill? What a great vibe! Here in Rio we usually ask: 'Send an ice-cold coconut water my way, boss!'",
      feedback: 'Excelente calor humano na mensagem! A informalidade carioca soa genuína.',
      rephraseSuggestion: 'Chamar o atendente de "chefe" ou "meu parceiro" gera conexão instantânea.',
      fluencyScore: 93,
      recommendedSpeechRate: 1.0,
      slangTip: 'Maneiro',
      slangMeaning: 'The definitive Rio de Janeiro slang word for cool, nice, or pleasant.',
      suggestedReplies: ['Bora dar um mergulho em Copacabana?', 'Onde tem aquela roda de samba boa hoje?', 'Tudo sussa meu parceiro, só na paz!']
    };
  }

  return {
    reply: '¡Quiubo pues mi parce! Qué berraquera hablar contigo. Si vas por Medellín, no olvides saludar con un buen "¿Bien o qué, hombre?"',
    englishTranslation: "What's up my buddy! How awesome to chat with you. If you go through Medellín, don't forget to greet people with 'Good or what, man?'",
    feedback: 'El ritmo musical de tu frase capta muy bien la calidez colombiana.',
    rephraseSuggestion: 'Usa "parce" o "parcero" con confianza para referirte a compas o amigos.',
    fluencyScore: 92,
    recommendedSpeechRate: 1.0,
    slangTip: 'Berraquera',
    slangMeaning: 'Iconic Colombian expression for something incredible, brave, or outstanding.',
    suggestedReplies: ['¡Qué chimba de ciudad es Medellín!', '¿Dónde consigo una bandeja paisa de verdad?', 'Todo bien mi parce, con toda la actitud']
  };
}

// ============================================================================
// STUDIO 24kHz NEURAL AUDIO ENGINE (WITH RIFF WAV HEADER & NATIVE FALLBACK)
// ============================================================================

const audioCache = new Map<string, string>();
let currentActiveAudio: HTMLAudioElement | null = null;

export type StudioVoiceName = 'Puck' | 'Kore' | 'Charon' | 'Fenrir' | 'Zephyr';

/**
 * Strips parenthetical English translations e.g. "こんにちは (Hello)" -> "こんにちは"
 * and emojis/markdown so the voice engine ONLY speaks the pure target language!
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Strip parenthetical English translations like "(Hello! I am well)"
    .replace(/\([A-Za-z0-9\s,.'!?/-]+\)/g, '')
    // Remove emojis
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}]/gu, '')
    // Remove quotes and markdown
    .replace(/[«»""''‹›*_~`#]/g, '')
    .replace(/([!?.]){2,}/g, '$1')
    .trim();
}

/**
 * Converts raw 24kHz 16-bit mono PCM base64 from Gemini TTS into a valid playable WAV Data URI
 */
function pcmBase64ToWavDataUri(base64Pcm: string, sampleRate = 24000): string {
  const binaryString = atob(base64Pcm);
  const pcmLength = binaryString.length;
  const wavBuffer = new ArrayBuffer(44 + pcmLength);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // 44-byte RIFF WAV Header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true);  // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate (24000 Hz)
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true);  // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)
  writeString(36, 'data');
  view.setUint32(40, pcmLength, true);

  const uint8 = new Uint8Array(wavBuffer);
  for (let i = 0; i < pcmLength; i++) {
    uint8[44 + i] = binaryString.charCodeAt(i);
  }

  let binaryWav = '';
  const chunkSize = 8192;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    binaryWav += String.fromCharCode.apply(null, Array.from(uint8.subarray(i, i + chunkSize)));
  }
  return `data:audio/wav;base64,${btoa(binaryWav)}`;
}

export async function generateNativeSpeechAudio(params: {
  text: string;
  dialectId?: string;
  voiceName?: StudioVoiceName;
}): Promise<string | null> {
  const { text, dialectId = 'es-MX', voiceName = 'Puck' } = params;
  const clean = cleanTextForSpeech(text);
  if (!clean) return null;

  const cacheKey = `${voiceName}_${dialectId}_${clean}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  if (!aiClient) return null;

  let stylePrompt = clean;
  if (dialectId === 'ar-MA') {
    stylePrompt = `Speak in an authentic, warm Moroccan Darija accent: ${clean}`;
  } else if (dialectId.startsWith('ar')) {
    stylePrompt = `Speak in a warm, natural Egyptian Cairene Arabic accent: ${clean}`;
  } else if (dialectId === 'es-MX') {
    stylePrompt = `Speak in a natural, warm Mexico City Spanish accent: ${clean}`;
  } else if (dialectId === 'es-CO') {
    stylePrompt = `Speak in a warm Medellín Colombian Spanish accent: ${clean}`;
  } else if (dialectId.startsWith('fr')) {
    stylePrompt = `Speak in a natural Parisian French accent: ${clean}`;
  } else if (dialectId.startsWith('ja')) {
    stylePrompt = `Speak in a natural Tokyo Japanese accent: ${clean}`;
  } else if (dialectId.startsWith('pt')) {
    stylePrompt = `Speak in a warm Rio de Janeiro Brazilian Portuguese accent: ${clean}`;
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: stylePrompt }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const audioBase64 = inlineData?.data;
    if (audioBase64) {
      const mimeType = inlineData?.mimeType || '';
      const dataUri =
        mimeType.includes('wav')
          ? `data:audio/wav;base64,${audioBase64}`
          : pcmBase64ToWavDataUri(audioBase64, 24000);
      audioCache.set(cacheKey, dataUri);
      return dataUri;
    }
  } catch (err) {
    console.warn('Gemini Neural TTS unavailable, switching to native voice engine:', err);
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

function findBestNativeVoice(dialectId: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const prefix = dialectId.split('-')[0].toLowerCase(); // 'ar', 'es', 'fr', 'ja', 'pt', 'it', 'de', 'zh'

  // 1. Exact locale match (e.g. ar-EG, es-MX, fr-FR, ja-JP, pt-BR)
  const exactMatch = voices.find(
    (v) => v.lang.toLowerCase().replace('_', '-') === dialectId.toLowerCase() && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))
  ) || voices.find((v) => v.lang.toLowerCase().replace('_', '-') === dialectId.toLowerCase());
  if (exactMatch) return exactMatch;

  // 2. High-quality neural/natural voice in the same language family (NEVER English for non-English!)
  const familyPremium = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith(prefix) &&
      (v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('google') ||
        v.name.toLowerCase().includes('siri') ||
        v.name.toLowerCase().includes('maged') ||
        v.name.toLowerCase().includes('tarik') ||
        v.name.toLowerCase().includes('laila') ||
        v.name.toLowerCase().includes('paulina') ||
        v.name.toLowerCase().includes('amelie') ||
        v.name.toLowerCase().includes('thomas') ||
        v.name.toLowerCase().includes('kyoko') ||
        v.name.toLowerCase().includes('luciana'))
  );
  if (familyPremium) return familyPremium;

  // 3. Any installed voice for that language prefix
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) || null;
}

export async function playNativeAudio(params: {
  text: string;
  dialectId?: string;
  voiceName?: StudioVoiceName;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}): Promise<void> {
  const { text, dialectId = 'es-MX', voiceName = 'Puck', rate = 1.0, onStart, onEnd, onError } = params;
  const clean = cleanTextForSpeech(text);
  if (!clean) {
    onEnd?.();
    return;
  }

  stopAllAudio();
  onStart?.();

  // 1. Attempt Gemini 24kHz Studio Neural Voice first
  try {
    const dataUri = await generateNativeSpeechAudio({ text: clean, dialectId, voiceName });
    if (dataUri) {
      const audio = new Audio(dataUri);
      currentActiveAudio = audio;
      audio.playbackRate = rate;
      audio.onended = () => {
        currentActiveAudio = null;
        onEnd?.();
      };
      audio.onerror = () => {
        currentActiveAudio = null;
        fallbackNativeTTS(clean, dialectId, rate, onEnd, onError);
      };
      await audio.play();
      return;
    }
  } catch (err) {
    console.warn('Gemini Neural Audio playback fallback:', err);
  }

  // 2. Native OS Voice or Cloud Native Stream (NEVER English reading Arabizi!)
  fallbackNativeTTS(clean, dialectId, rate, onEnd, onError);
}

function getTargetBcp47(dialectId: string): string {
  if (dialectId === 'ar-MA') return 'ar-MA';
  if (dialectId.startsWith('ar')) return 'ar-EG';
  if (dialectId === 'es-CO') return 'es-CO';
  if (dialectId.startsWith('es')) return 'es-MX';
  if (dialectId.startsWith('fr')) return 'fr-FR';
  if (dialectId.startsWith('ja')) return 'ja-JP';
  if (dialectId.startsWith('pt')) return 'pt-BR';
  if (dialectId.startsWith('it')) return 'it-IT';
  if (dialectId.startsWith('de')) return 'de-DE';
  if (dialectId.startsWith('zh')) return 'zh-HK';
  return 'es-MX';
}

function fallbackNativeTTS(
  cleanText: string,
  dialectId: string,
  rate: number,
  onEnd?: () => void,
  onError?: (err: any) => void
): void {
  if (typeof window === 'undefined') {
    onEnd?.();
    return;
  }

  const runSynthesis = () => {
    const voices = window.speechSynthesis?.getVoices() || [];
    const matchedVoice = findBestNativeVoice(dialectId, voices);
    const targetLang = getTargetBcp47(dialectId);

    // If the device has a real native voice for this language, use it with the authentic script
    if (matchedVoice && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang || targetLang;
      utterance.rate = Math.max(0.75, Math.min(rate, 1.15));
      utterance.onend = () => onEnd?.();
      utterance.onerror = (e) => {
        onError?.(e);
        onEnd?.();
      };
      window.speechSynthesis.speak(utterance);
      return;
    }

    // If the user's computer/phone does NOT have an Arabic/Japanese/target voice installed,
    // stream authentic native audio in the target language instead of using an English robot voice!
    const tl = targetLang.split('-')[0];
    const streamUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(cleanText.slice(0, 200))}`;
    const audio = new Audio(streamUrl);
    currentActiveAudio = audio;
    audio.playbackRate = Math.max(0.75, Math.min(rate, 1.15));
    audio.onended = () => {
      currentActiveAudio = null;
      onEnd?.();
    };
    audio.onerror = () => {
      currentActiveAudio = null;
      // Final last-resort browser utterance with strict target lang tag
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(cleanText);
        u.lang = targetLang;
        u.rate = rate;
        u.onend = () => onEnd?.();
        u.onerror = () => onEnd?.();
        window.speechSynthesis.speak(u);
      } else {
        onEnd?.();
      }
    };
    audio.play().catch(() => {
      onEnd?.();
    });
  };

  // Chrome/Safari load voices asynchronously on first boot; wait for onvoiceschanged if empty
  if ('speechSynthesis' in window && window.speechSynthesis.getVoices().length === 0) {
    let fired = false;
    const handleVoicesChanged = () => {
      if (fired) return;
      fired = true;
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      runSynthesis();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    setTimeout(() => {
      if (!fired) {
        fired = true;
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        runSynthesis();
      }
    }, 250);
  } else {
    runSynthesis();
  }
}
EOFcat << 'EOF' > src/services/gemini.ts
import { GoogleGenAI } from '@google/genai';

// Support both Vite VITE_ prefix and define process.env injection
const apiKey =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
  process.env.GEMINI_API_KEY ||
  '';

let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn("Could not initialize GoogleGenAI client:", err);
  }
}

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
      ? `Personal AI Shadow Memory (Past learner slips to gently reinforce & test): ${priorShadowGaps.join(' | ')}`
      : 'Personal AI Shadow Memory: First session — observe any pronunciation, word order, or register slips.';

  const levelPedagogyMap = {
    A1: 'CEFR Level A1 (Absolute Beginner): Keep your reply to 1-2 SHORT, simple sentences using basic everyday words. Offer adaptive hints. Set recommendedSpeechRate to 0.85.',
    A2: 'CEFR Level A2 (Elementary): Use simple daily conversational sentences. Introduce 1 practical street phrase. Set recommendedSpeechRate to 0.92.',
    B1: 'CEFR Level B1 (Intermediate): Maintain natural conversational rhythm. Introduce 1 authentic regional street slang or idiom. Set recommendedSpeechRate to 1.0.',
    B2: 'CEFR Level B2 (Upper Intermediate): Converse with authentic native cadence, local cultural humor, and dialectal contractions. Set recommendedSpeechRate to 1.05.',
    C1: 'CEFR Level C1 (Mastery): Speak at full local street speed with deep colloquial nuances, rapid slang, and minimal English hand-holding. Set recommendedSpeechRate to 1.1.'
  };

  const levelDirective = levelPedagogyMap[level] || levelPedagogyMap.A1;

  const systemInstruction = `You are a warm, genuine, personal native immersion tutor for "${dialectName}" on Vera WorldWide.
Your active persona: ${persona}.
Regional Cultural Focus: ${culturalNote || 'Authentic colloquial phrasing, rhythm, street idioms, and cultural etiquette'}.
Student Proficiency Level: ${levelDirective}
${shadowContext}

CRITICAL SCRIPT & LANGUAGE DIRECTIVES:
1. Your "reply" field MUST be written 100% in the authentic native script of ${dialectName} (e.g., Arabic script for Moroccan Darija / Egyptian Masri, Japanese Kanji/Kana for Japanese, Spanish for Mexican/Colombian, French for Parisian, Portuguese for Carioca). NEVER put English or Latin transliteration inside the "reply" field because the neural voice engine reads "reply" aloud!
2. Provide a clean, accurate English translation in "englishTranslation".
3. Provide constructive feedback (1 sentence) in English in "feedback".
4. Provide a "rephraseSuggestion" in the target dialect showing how a true local would say the user's thought effortlessly.
5. Identify a "shadowTargetGap" (1 short note on grammar/vocabulary to remember for next turn).
6. Provide a "slangTip" with an authentic regional word and its "slangMeaning".
7. Provide "suggestedReplies": an array of 3 realistic reply options in ${dialectName} (native script) matching level ${level}.

Format your response strictly as a JSON object:
{
  "reply": "Native script reply in ${dialectName}",
  "englishTranslation": "Clean English translation of the reply",
  "feedback": "Encouraging feedback on the user's sentence",
  "rephraseSuggestion": "How a local would rephrase the user's sentence",
  "fluencyScore": 92,
  "recommendedSpeechRate": 1.0,
  "shadowTargetGap": "Verb conjugation or street greeting particle",
  "slangTip": "Local slang term",
  "slangMeaning": "What the slang term means in local context",
  "suggestedReplies": ["Quick reply 1", "Quick reply 2", "Quick reply 3"]
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
          temperature: 0.75,
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
            englishTranslation: parsed.englishTranslation || 'Natural conversational response in the local dialect.',
            feedback: parsed.feedback || 'Great natural rhythm and conversational confidence.',
            rephraseSuggestion: parsed.rephraseSuggestion,
            fluencyScore: typeof parsed.fluencyScore === 'number' ? parsed.fluencyScore : 90,
            recommendedSpeechRate: typeof parsed.recommendedSpeechRate === 'number' ? parsed.recommendedSpeechRate : 1.0,
            shadowTargetGap: parsed.shadowTargetGap,
            slangTip: parsed.slangTip,
            slangMeaning: parsed.slangMeaning,
            suggestedReplies: Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : getFallbackSuggestions(dialectName)
          };
        } catch {
          return {
            reply: text,
            englishTranslation: 'Understanding your message in native cadence.',
            feedback: 'Natural rhythm and authentic vocabulary usage.',
            fluencyScore: 88,
            recommendedSpeechRate: 1.0,
            suggestedReplies: getFallbackSuggestions(dialectName)
          };
        }
      }
    } catch (err) {
      console.warn("Gemini generation error, utilizing contextual fallback:", err);
    }
  }

  return getContextualDialectFallback(dialectName, userMessage, level);
}

export async function generateAnnouncementCopy(topicPrompt: string): Promise<string> {
  const prompt = `Write a punchy, ultra-high-converting, professional global banner headline (maximum 12 words) for a premier language immersion platform called Vera WorldWide. Topic: "${topicPrompt}". Do not use quotes.`;
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const text = response.text?.trim();
      if (text) return text.replace(/^"|"$/g, '');
    } catch (err) {
      console.warn("Gemini announcement copy error:", err);
    }
  }
  if (topicPrompt.toLowerCase().includes('sale') || topicPrompt.toLowerCase().includes('off') || topicPrompt.toLowerCase().includes('discount')) {
    return '⚡ Flash Immersion Pass: Unlock All Dialects & Boss Arenas at 40% Off This Week!';
  }
  if (topicPrompt.toLowerCase().includes('darija') || topicPrompt.toLowerCase().includes('moroc')) {
    return '🇲🇦 Moroccan Darija is LIVE! Practice Casablanca & Rabat street fluency with Badr today.';
  }
  return `🌍 Vera WorldWide: ${topicPrompt} — Experience high-velocity street dialect fluency today!`;
}

function getFallbackSuggestions(dialectName: string): string[] {
  if (dialectName.includes('Moroccan') || dialectName.includes('Darija')) {
    return ['لباس الحمد لله، كلشي مزيان!', 'واحد أتاي بالنعناع عافاك أ خويا', 'شحال الثمن ديال هادي في السوق؟'];
  }
  if (dialectName.includes('Arabic') || dialectName.includes('Egyptian') || dialectName.includes('Masri')) {
    return ['كله تمام الحمد لله!', 'إيه أحسن أكل شعبي هنا؟', 'يلا بينا على القهوة يا باشا'];
  }
  if (dialectName.includes('Mexican')) {
    return ['¡Todo bien compa, gracias!', '¿Qué lugares me recomiendas visitar hoy?', 'Me late un montón la idea'];
  }
  if (dialectName.includes('French') || dialectName.includes('Paris')) {
    return ['Ça roule, et toi ?', 'Tu me conseilles quel bistrot dans le coin ?', "C'est trop stylé comme endroit"];
  }
  if (dialectName.includes('Japanese') || dialectName.includes('Tokyo')) {
    return ['元気だよ！そっちはどう？', 'おすすめの居酒屋ある？', 'それな！めっちゃいいね'];
  }
  if (dialectName.includes('Portuguese') || dialectName.includes('Carioca')) {
    return ['Tudo sussa meu irmão, e você?', 'Onde rola aquele açaí responsa?', 'Que parada maneira!'];
  }
  return ['¡Todo muy bien, gracias!', '¿Qué me recomiendas hacer hoy?', '¡Cuéntame más de la cultura local!'];
}

export function getContextualDialectFallback(dialectName: string, message: string, level: string = 'A1'): TutorResponse {
  const lower = message.toLowerCase();
  const lvl = level.toUpperCase();
  const isA1 = lvl === 'A1';

  if (dialectName.includes('Moroccan') || dialectName.includes('Darija')) {
    if (isA1) {
      return {
        reply: 'السلام أ خويا! لباس عليك؟ كلشي بخير؟ أنا بدر من الدار البيضاء. يلاه نتعلمو الدارجة دقة دقة بلا تعقيد!',
        englishTranslation: 'Peace my brother! How are you? Everything good? I am Badr from Casablanca. Let us learn Darija step-by-step without complication!',
        feedback: 'بداية واعرة! كلمة "لباس" (Labas) هي الساروت ديال أي هضرة في المغرب.',
        rephraseSuggestion: 'قول: "لباس الحمد لله، كلشي بخير أ خويا بدر!"',
        fluencyScore: 96,
        recommendedSpeechRate: 0.9,
        slangTip: 'دقة دقة (Daqqa daqqa)',
        slangMeaning: 'Step by step / little by little — quintessential Moroccan expression.',
        suggestedReplies: ['لباس الحمد لله، كلشي بخير!', 'بغيت نتعلم كيفاش نطلب أتاي', 'علمني كلمات ديال كازا عافاك']
      };
    }
    return {
      reply: 'واش أ عشيري! الهضرة ديالك زوينة بزاف وغادية مع الموجة ديال كازا والرباط. يلاه نطلبو براد ديال أتاي مشحر ولا نفاصلو في المدينة القديمة؟',
      englishTranslation: "What's up my friend! Your phrasing is super nice and matches the Casablanca and Rabat wave. Shall we order a pot of Moroccan mint tea or haggle in the Old Medina?",
      feedback: 'إيقاع مغربي أصيل! استعمالك للكلمات خفيف وطبيعي.',
      rephraseSuggestion: 'في الزنقة كنقولو: "صافي مشينا أ خويا، الفكرة واعرة!"',
      fluencyScore: 94,
      recommendedSpeechRate: 1.0,
      slangTip: 'واعر / زوين (Wa3er / Zwin)',
      slangMeaning: 'Awesome, tough/cool (Wa3er) and nice/beautiful (Zwin) in everyday Moroccan Darija.',
      suggestedReplies: ['واحد أتاي مشحر بالنعناع عافاك!', 'شحال الثمن النهائي أ المعلم؟', 'صافي مشينا أ خويا، الفكرة واعرة!']
    };
  }

  if (dialectName.includes('Arabic') || dialectName.includes('Egyptian') || dialectName.includes('Masri')) {
    const isFood = lower.includes('اكل') || lower.includes('أكل') || lower.includes('كشري') || lower.includes('شاي') || lower.includes('قهوة') || lower.includes('food');
    if (isFood) {
      return {
        reply: 'الله عليك! أنت ذوقك عالي في الأكل. في القاهرة لما تطلب كشري قول: علبة كشري كمالة وزود دقة وشطة، وعلى القهوة اطلب شاي في الخمسينة سكر مظبوط!',
        englishTranslation: "Spot on! You have great taste in food. In Cairo, when you eat koshari, tell the server: 'A mixed koshari box with extra daqqa and shatta', and at the café ask for 'tea in the khamseenah, medium sugar'!",
        feedback: 'اختيار ممتاز للكلمات الخاصة بالأكل الشعبي المصري.',
        rephraseSuggestion: 'استخدم "لو سمحت يا ريس" لما تطلب من الجرسون.',
        fluencyScore: 95,
        recommendedSpeechRate: 0.95,
        slangTip: 'شاي في الخمسينة (Shay fel-5amseenah)',
        slangMeaning: 'Strong Egyptian black tea served in a traditional small glass tumbler at street cafes.',
        suggestedReplies: ['واحد شاي في الخمسينة بالنعناع يا ريس!', 'الحساب كام لو سمحت يا باشا؟', 'الدقة والشطة هما روح الكشري!']
      };
    }
    return {
      reply: 'أهلاً يا باشا! مساء الفل والياسمين. كلامك زي السكر وإيقاعك ماشي مع شارع القاهرة بالملي! تحب نطلب شاي في الخمسينة على القهوة ولا نفاصل في خان الخليلي؟',
      englishTranslation: 'Welcome boss! An evening of jasmine and flowers to you. Your words are sweet as sugar and your cadence matches Cairo street rhythm! Shall we order tea at the ahwa or haggle in Khan el-Khalili?',
      feedback: 'تحية مصرية أصيلة ودافية جداً!',
      rephraseSuggestion: 'في الشارع بنرد نقول: "حبيبي يا باشا، ده نورك!"',
      fluencyScore: 95,
      recommendedSpeechRate: 0.95,
      slangTip: 'مساء الفل (Masa2 el-fol)',
      slangMeaning: 'Iconic Cairo poetic greeting expressing warm welcome, respect, and street hospitality.',
      suggestedReplies: ['حبيبي يا باشا ده نورك!', 'واحد شاي في الخمسينة بالنعناع يا ريس', 'يلا نفاصل في خان الخليلي!']
    };
  }

  if (dialectName.includes('Mexican')) {
    if (isA1) {
      return {
        reply: '¡Hola! Mucho gusto, soy Sofía de la Ciudad de México. Vamos con calma, palabra por palabra. ¿Cómo estás hoy?',
        englishTranslation: 'Hello! Nice to meet you, I am Sofia from Mexico City. We will go calmly, word by word. How are you today?',
        feedback: '¡Excelente inicio! Para responder puedes decir: "Muy bien, gracias".',
        rephraseSuggestion: '"¡Hola Sofía, cómo estás?" es un saludo perfecto y natural.',
        fluencyScore: 97,
        recommendedSpeechRate: 0.9,
        slangTip: 'Mucho gusto',
        slangMeaning: 'Standard polite Spanish for "Pleased to meet you".',
        suggestedReplies: ['Muy bien Sofía, gracias', 'Mucho gusto en conocerte', 'Quiero aprender palabras fáciles hoy']
      };
    }
    return {
      reply: '¡Órale, qué bien suena eso compa! Me late un buen tu vibra. Si quieres pedir algo en la taquería, acuérdate de decir siempre: "¿Me das dos de pastor con todo, por favor?"',
      englishTranslation: 'Wow, that sounds great buddy! I really like your vibe. If you want to order at a taco stand, remember to say: "Could I get two pastor tacos with everything, please?"',
      feedback: 'Buena estructura de oración y vocabulario adecuado para la CDMX.',
      rephraseSuggestion: '"Me late un buen" es la forma más espontánea de decir que algo te agrada.',
      fluencyScore: 93,
      recommendedSpeechRate: 1.0,
      slangTip: 'Con todo',
      slangMeaning: 'At a taco stand, ordering "con todo" automatically includes cilantro, onions, and roasted pineapple.',
      suggestedReplies: ['¿Y la salsa verde pica mucho?', '¿Cuánto es de la cuenta marchante?', '¡Están buenísimos jefe, gracias!']
    };
  }

  if (dialectName.includes('French') || dialectName.includes('Paris')) {
    return {
      reply: "Salut ! Franchement, t'as une super cadence. À Paris, au comptoir d'un café, on dit souvent : Un café serré s'il vous plaît !",
      englishTranslation: "Hey! Honestly, your conversational rhythm is great. In Paris at a café counter, locals often say: 'A short espresso please!'",
      feedback: 'Très bonne fluidité et tournure de phrase très naturelle.',
      rephraseSuggestion: "Tu peux enlever le « ne » à l'oral : « J'sais pas » au lieu de « Je ne sais pas ».",
      fluencyScore: 92,
      recommendedSpeechRate: 1.0,
      slangTip: "C'est ouf",
      slangMeaning: 'Verlan inversion of "fou" (crazy). Used constantly by all generations in Paris.',
      suggestedReplies: ['On se prend un petit café en terrasse ?', "C'est quoi ton quartier préféré à Paris ?", "Laisse tomber, c'est trop stylé !"]
    };
  }

  if (dialectName.includes('Japanese') || dialectName.includes('Tokyo')) {
    return {
      reply: 'お疲れ様！日本語のイントネーションがすごく自然だね。東京の居酒屋では「とりあえず生で！」って頼むと一瞬でローカルっぽくなるよ！',
      englishTranslation: "Great work! Your Japanese intonation is very natural. At a Tokyo izakaya, ordering 'Toriaezu nama de!' (draft beer to start!) makes you sound like an instant local!",
      feedback: '自然な相槌とリズムがバッチリです！',
      rephraseSuggestion: '友達同士なら「めっちゃいいじゃん！」と返すと自然です。',
      fluencyScore: 95,
      recommendedSpeechRate: 1.0,
      slangTip: 'それな (Sore na!)',
      slangMeaning: 'Ubiquitous Tokyo street agreement particle meaning "Preach / Exactly / Couldn\'t agree more".',
      suggestedReplies: ['とりあえず生二つお願いします！', '渋谷でおすすめのラーメン屋ある？', 'それな！めっちゃわかるよ']
    };
  }

  if (dialectName.includes('Portuguese') || dialectName.includes('Carioca') || dialectName.includes('Brazil')) {
    return {
      reply: 'E aí meu irmão, tranquilidade? Que vibe boa! Aqui no Rio a gente costuma pedir: Manda uma água de coco bem gelada aí, chefe!',
      englishTranslation: "What's up my brother, everything chill? What a great vibe! Here in Rio we usually ask: 'Send an ice-cold coconut water my way, boss!'",
      feedback: 'Excelente calor humano na mensagem! A informalidade carioca soa genuína.',
      rephraseSuggestion: 'Chamar o atendente de "chefe" ou "meu parceiro" gera conexão instantânea.',
      fluencyScore: 93,
      recommendedSpeechRate: 1.0,
      slangTip: 'Maneiro',
      slangMeaning: 'The definitive Rio de Janeiro slang word for cool, nice, or pleasant.',
      suggestedReplies: ['Bora dar um mergulho em Copacabana?', 'Onde tem aquela roda de samba boa hoje?', 'Tudo sussa meu parceiro, só na paz!']
    };
  }

  return {
    reply: '¡Quiubo pues mi parce! Qué berraquera hablar contigo. Si vas por Medellín, no olvides saludar con un buen "¿Bien o qué, hombre?"',
    englishTranslation: "What's up my buddy! How awesome to chat with you. If you go through Medellín, don't forget to greet people with 'Good or what, man?'",
    feedback: 'El ritmo musical de tu frase capta muy bien la calidez colombiana.',
    rephraseSuggestion: 'Usa "parce" o "parcero" con confianza para referirte a compas o amigos.',
    fluencyScore: 92,
    recommendedSpeechRate: 1.0,
    slangTip: 'Berraquera',
    slangMeaning: 'Iconic Colombian expression for something incredible, brave, or outstanding.',
    suggestedReplies: ['¡Qué chimba de ciudad es Medellín!', '¿Dónde consigo una bandeja paisa de verdad?', 'Todo bien mi parce, con toda la actitud']
  };
}

// ============================================================================
// STUDIO 24kHz NEURAL AUDIO ENGINE (WITH RIFF WAV HEADER & NATIVE FALLBACK)
// ============================================================================

const audioCache = new Map<string, string>();
let currentActiveAudio: HTMLAudioElement | null = null;

export type StudioVoiceName = 'Puck' | 'Kore' | 'Charon' | 'Fenrir' | 'Zephyr';

/**
 * Strips parenthetical English translations e.g. "こんにちは (Hello)" -> "こんにちは"
 * and emojis/markdown so the voice engine ONLY speaks the pure target language!
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Strip parenthetical English translations like "(Hello! I am well)"
    .replace(/\([A-Za-z0-9\s,.'!?/-]+\)/g, '')
    // Remove emojis
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}]/gu, '')
    // Remove quotes and markdown
    .replace(/[«»""''‹›*_~`#]/g, '')
    .replace(/([!?.]){2,}/g, '$1')
    .trim();
}

/**
 * Converts raw 24kHz 16-bit mono PCM base64 from Gemini TTS into a valid playable WAV Data URI
 */
function pcmBase64ToWavDataUri(base64Pcm: string, sampleRate = 24000): string {
  const binaryString = atob(base64Pcm);
  const pcmLength = binaryString.length;
  const wavBuffer = new ArrayBuffer(44 + pcmLength);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // 44-byte RIFF WAV Header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true);  // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate (24000 Hz)
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true);  // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)
  writeString(36, 'data');
  view.setUint32(40, pcmLength, true);

  const uint8 = new Uint8Array(wavBuffer);
  for (let i = 0; i < pcmLength; i++) {
    uint8[44 + i] = binaryString.charCodeAt(i);
  }

  let binaryWav = '';
  const chunkSize = 8192;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    binaryWav += String.fromCharCode.apply(null, Array.from(uint8.subarray(i, i + chunkSize)));
  }
  return `data:audio/wav;base64,${btoa(binaryWav)}`;
}

export async function generateNativeSpeechAudio(params: {
  text: string;
  dialectId?: string;
  voiceName?: StudioVoiceName;
}): Promise<string | null> {
  const { text, dialectId = 'es-MX', voiceName = 'Puck' } = params;
  const clean = cleanTextForSpeech(text);
  if (!clean) return null;

  const cacheKey = `${voiceName}_${dialectId}_${clean}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  if (!aiClient) return null;

  let stylePrompt = clean;
  if (dialectId === 'ar-MA') {
    stylePrompt = `Speak in an authentic, warm Moroccan Darija accent: ${clean}`;
  } else if (dialectId.startsWith('ar')) {
    stylePrompt = `Speak in a warm, natural Egyptian Cairene Arabic accent: ${clean}`;
  } else if (dialectId === 'es-MX') {
    stylePrompt = `Speak in a natural, warm Mexico City Spanish accent: ${clean}`;
  } else if (dialectId === 'es-CO') {
    stylePrompt = `Speak in a warm Medellín Colombian Spanish accent: ${clean}`;
  } else if (dialectId.startsWith('fr')) {
    stylePrompt = `Speak in a natural Parisian French accent: ${clean}`;
  } else if (dialectId.startsWith('ja')) {
    stylePrompt = `Speak in a natural Tokyo Japanese accent: ${clean}`;
  } else if (dialectId.startsWith('pt')) {
    stylePrompt = `Speak in a warm Rio de Janeiro Brazilian Portuguese accent: ${clean}`;
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: stylePrompt }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const audioBase64 = inlineData?.data;
    if (audioBase64) {
      const mimeType = inlineData?.mimeType || '';
      const dataUri =
        mimeType.includes('wav')
          ? `data:audio/wav;base64,${audioBase64}`
          : pcmBase64ToWavDataUri(audioBase64, 24000);
      audioCache.set(cacheKey, dataUri);
      return dataUri;
    }
  } catch (err) {
    console.warn('Gemini Neural TTS unavailable, switching to native voice engine:', err);
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

function findBestNativeVoice(dialectId: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const prefix = dialectId.split('-')[0].toLowerCase(); // 'ar', 'es', 'fr', 'ja', 'pt', 'it', 'de', 'zh'

  // 1. Exact locale match (e.g. ar-EG, es-MX, fr-FR, ja-JP, pt-BR)
  const exactMatch = voices.find(
    (v) => v.lang.toLowerCase().replace('_', '-') === dialectId.toLowerCase() && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))
  ) || voices.find((v) => v.lang.toLowerCase().replace('_', '-') === dialectId.toLowerCase());
  if (exactMatch) return exactMatch;

  // 2. High-quality neural/natural voice in the same language family (NEVER English for non-English!)
  const familyPremium = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith(prefix) &&
      (v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('google') ||
        v.name.toLowerCase().includes('siri') ||
        v.name.toLowerCase().includes('maged') ||
        v.name.toLowerCase().includes('tarik') ||
        v.name.toLowerCase().includes('laila') ||
        v.name.toLowerCase().includes('paulina') ||
        v.name.toLowerCase().includes('amelie') ||
        v.name.toLowerCase().includes('thomas') ||
        v.name.toLowerCase().includes('kyoko') ||
        v.name.toLowerCase().includes('luciana'))
  );
  if (familyPremium) return familyPremium;

  // 3. Any installed voice for that language prefix
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) || null;
}

export async function playNativeAudio(params: {
  text: string;
  dialectId?: string;
  voiceName?: StudioVoiceName;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}): Promise<void> {
  const { text, dialectId = 'es-MX', voiceName = 'Puck', rate = 1.0, onStart, onEnd, onError } = params;
  const clean = cleanTextForSpeech(text);
  if (!clean) {
    onEnd?.();
    return;
  }

  stopAllAudio();
  onStart?.();

  // 1. Attempt Gemini 24kHz Studio Neural Voice first
  try {
    const dataUri = await generateNativeSpeechAudio({ text: clean, dialectId, voiceName });
    if (dataUri) {
      const audio = new Audio(dataUri);
      currentActiveAudio = audio;
      audio.playbackRate = rate;
      audio.onended = () => {
        currentActiveAudio = null;
        onEnd?.();
      };
      audio.onerror = () => {
        currentActiveAudio = null;
        fallbackNativeTTS(clean, dialectId, rate, onEnd, onError);
      };
      await audio.play();
      return;
    }
  } catch (err) {
    console.warn('Gemini Neural Audio playback fallback:', err);
  }

  // 2. Native OS Voice or Cloud Native Stream (NEVER English reading Arabizi!)
  fallbackNativeTTS(clean, dialectId, rate, onEnd, onError);
}

function getTargetBcp47(dialectId: string): string {
  if (dialectId === 'ar-MA') return 'ar-MA';
  if (dialectId.startsWith('ar')) return 'ar-EG';
  if (dialectId === 'es-CO') return 'es-CO';
  if (dialectId.startsWith('es')) return 'es-MX';
  if (dialectId.startsWith('fr')) return 'fr-FR';
  if (dialectId.startsWith('ja')) return 'ja-JP';
  if (dialectId.startsWith('pt')) return 'pt-BR';
  if (dialectId.startsWith('it')) return 'it-IT';
  if (dialectId.startsWith('de')) return 'de-DE';
  if (dialectId.startsWith('zh')) return 'zh-HK';
  return 'es-MX';
}

function fallbackNativeTTS(
  cleanText: string,
  dialectId: string,
  rate: number,
  onEnd?: () => void,
  onError?: (err: any) => void
): void {
  if (typeof window === 'undefined') {
    onEnd?.();
    return;
  }

  const runSynthesis = () => {
    const voices = window.speechSynthesis?.getVoices() || [];
    const matchedVoice = findBestNativeVoice(dialectId, voices);
    const targetLang = getTargetBcp47(dialectId);

    // If the device has a real native voice for this language, use it with the authentic script
    if (matchedVoice && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang || targetLang;
      utterance.rate = Math.max(0.75, Math.min(rate, 1.15));
      utterance.onend = () => onEnd?.();
      utterance.onerror = (e) => {
        onError?.(e);
        onEnd?.();
      };
      window.speechSynthesis.speak(utterance);
      return;
    }

    // If the user's computer/phone does NOT have an Arabic/Japanese/target voice installed,
    // stream authentic native audio in the target language instead of using an English robot voice!
    const tl = targetLang.split('-')[0];
    const streamUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(cleanText.slice(0, 200))}`;
    const audio = new Audio(streamUrl);
    currentActiveAudio = audio;
    audio.playbackRate = Math.max(0.75, Math.min(rate, 1.15));
    audio.onended = () => {
      currentActiveAudio = null;
      onEnd?.();
    };
    audio.onerror = () => {
      currentActiveAudio = null;
      // Final last-resort browser utterance with strict target lang tag
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(cleanText);
        u.lang = targetLang;
        u.rate = rate;
        u.onend = () => onEnd?.();
        u.onerror = () => onEnd?.();
        window.speechSynthesis.speak(u);
      } else {
        onEnd?.();
      }
    };
    audio.play().catch(() => {
      onEnd?.();
    });
  };

  // Chrome/Safari load voices asynchronously on first boot; wait for onvoiceschanged if empty
  if ('speechSynthesis' in window && window.speechSynthesis.getVoices().length === 0) {
    let fired = false;
    const handleVoicesChanged = () => {
      if (fired) return;
      fired = true;
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      runSynthesis();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    setTimeout(() => {
      if (!fired) {
        fired = true;
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        runSynthesis();
      }
    }, 250);
  } else {
    runSynthesis();
  }
}
