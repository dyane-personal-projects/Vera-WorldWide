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
    A1: 'CEFR Level A1 (Absolute Beginner): Keep your reply to 1-2 SHORT, warm sentences using basic everyday words. Talk like a friendly human sitting across a café table.',
    A2: 'CEFR Level A2 (Elementary): Use simple daily conversational sentences with natural pauses.',
    B1: 'CEFR Level B1 (Intermediate): Maintain natural conversational rhythm with authentic street slang.',
    B2: 'CEFR Level B2 (Upper Intermediate): Converse with authentic native cadence, local cultural humor, and contractions.',
    C1: 'CEFR Level C1 (Mastery): Speak at full local street speed with deep colloquial nuances and zero English.'
  };

  const levelDirective = levelPedagogyMap[level] || levelPedagogyMap.A1;

  const systemInstruction = `You are a warm, genuine, living human native immersion speaker for "${dialectName}" on Vera WorldWide.
Your active persona: ${persona}.
Regional Cultural Focus: ${culturalNote || 'Authentic colloquial phrasing, rhythm, street idioms, and cultural etiquette'}.
Student Proficiency Level: ${levelDirective}
${shadowContext}

CRITICAL HUMAN IMMERSION DIRECTIVES:
1. Speak as a real, breathing human being from ${dialectName}'s region. Use natural conversational warm-ups, friendly laughs, or spontaneous local reactions (e.g., "Ah ya salaam!", "¡Órale!", "Ah ouais !").
2. Your "reply" field MUST be written 100% in the authentic native script of ${dialectName}. NEVER put English or transliteration inside "reply".
3. Provide a clean English translation in "englishTranslation".
4. Provide constructive feedback in "feedback".
5. Provide a "rephraseSuggestion" showing how a local would say it.
6. Provide "suggestedReplies": an array of 3 realistic reply options in ${dialectName} (native script).

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
          temperature: 0.82, // Slightly higher temperature for organic human variation
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
  if (dialectName.includes('Moroccan') || dialectName.includes('Darija')) {
    return {
      reply: 'السلام أ خويا! لباس عليك؟ كلشي بخير؟ أنا بدر من الدار البيضاء. يلاه نتعلمو الدارجة دقة دقة!',
      englishTranslation: 'Peace my brother! How are you? Everything good? I am Badr from Casablanca. Let us learn Darija step by step!',
      feedback: 'بداية واعرة! الإيقاع المغربي ديالك كيصبر.',
      rephraseSuggestion: 'قول: "لباس الحمد لله، كلشي مزيان!"',
      fluencyScore: 95,
      recommendedSpeechRate: 0.95,
      slangTip: 'دقة دقة (Daqqa daqqa)',
      slangMeaning: 'Step by step / little by little.',
      suggestedReplies: ['لباس الحمد لله، كلشي مزيان!', 'بغيت أتاي بالنعناع عافاك', 'فين غادي نمسيو اليوم؟']
    };
  }
  return {
    reply: '¡Órale compa! Qué gusto saludarte. ¿De qué te gustaría platicar hoy? ¿De comida, música o historias de la ciudad?',
    englishTranslation: 'What up buddy! So great to greet you. What would you like to chat about today? Food, music, or city stories?',
    feedback: 'Excelente tono y ritmo conversacional.',
    rephraseSuggestion: 'Prueba diciendo: "Todo al cien, listos para platicar."',
    fluencyScore: 94,
    recommendedSpeechRate: 1.0,
    slangTip: 'Órale',
    slangMeaning: 'Expresses surprise, agreement, or encouragement.',
    suggestedReplies: ['¡Platícame de los mejores tacos!', '¿Cómo me muevo en el metro?', 'Todo bien por acá']
  };
}

// ============================================================================
// DYNAMIC STUDIO VOICE ROTATION (ROTATES BETWEEN PUCK, KORE, CHARON, FENRIR, ZEPHYR)
// ============================================================================

const STUDIO_VOICES: StudioVoiceName[] = ['Puck', 'Kore', 'Charon', 'Fenrir', 'Zephyr'];

function getRandomStudioVoice(): StudioVoiceName {
  // Rotate randomly so every message sounds like a different real person from the country!
  const idx = Math.floor(Math.random() * STUDIO_VOICES.length);
  return STUDIO_VOICES[idx];
}

const audioCache = new Map<string, string>();
let currentActiveAudio: HTMLAudioElement | null = null;

export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/\([A-Za-z0-9\s,.'!?/-]+\)/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}]/gu, '')
    .replace(/[«»""''‹›*_~`#]/g, '')
    .replace(/([!?.]){2,}/g, '$1')
    .trim();
}

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
  const { text, dialectId = 'es-MX', voiceName = getRandomStudioVoice() } = params;
  const clean = cleanTextForSpeech(text);
  if (!clean) return null;

  const cacheKey = `${voiceName}_${dialectId}_${clean}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  if (!aiClient) return null;

  let stylePrompt = clean;
  if (dialectId === 'ar-MA') {
    stylePrompt = `Speak as a native Moroccan from Casablanca with high emotional warmth and natural street pauses: ${clean}`;
  } else if (dialectId.startsWith('ar')) {
    stylePrompt = `Speak as a native Cairene Egyptian with friendly warmth and natural conversational rhythm: ${clean}`;
  } else if (dialectId === 'es-MX') {
    stylePrompt = `Speak as a friendly native Mexico City local with vibrant expression: ${clean}`;
  } else if (dialectId === 'es-CO') {
    stylePrompt = `Speak as a warm native Colombian from Medellín with melodic cadence: ${clean}`;
  } else if (dialectId.startsWith('fr')) {
    stylePrompt = `Speak as a native Parisian with smooth, organic conversational cadence: ${clean}`;
  } else if (dialectId.startsWith('ja')) {
    stylePrompt = `Speak as a friendly native Tokyo local with natural pitch accent and warmth: ${clean}`;
  } else if (dialectId.startsWith('pt')) {
    stylePrompt = `Speak as a warm native Carioca from Rio de Janeiro with relaxed musical flow: ${clean}`;
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
  const prefix = dialectId.split('-')[0].toLowerCase();
  const exactMatch =
    voices.find(
      (v) =>
        v.lang.toLowerCase().replace('_', '-') === dialectId.toLowerCase() &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))
    ) || voices.find((v) => v.lang.toLowerCase().replace('_', '-') === dialectId.toLowerCase());
  if (exactMatch) return exactMatch;

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
  const { text, dialectId = 'es-MX', voiceName = getRandomStudioVoice(), rate = 1.0, onStart, onEnd, onError } = params;
  const clean = cleanTextForSpeech(text);
  if (!clean) {
    onEnd?.();
    return;
  }

  stopAllAudio();
  onStart?.();

  try {
    const dataUri = await generateNativeSpeechAudio({ text: clean, dialectId, voiceName });
    if (dataUri) {
      const audio = new Audio(dataUri);
      currentActiveAudio = audio;
      // Add subtle random human speed variation (0.95 to 1.05) so every playback feels organic!
      const humanRateVariation = Math.max(0.85, Math.min(rate * (0.96 + Math.random() * 0.08), 1.15));
      audio.playbackRate = humanRateVariation;
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

    if (matchedVoice && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang || targetLang;
      utterance.rate = Math.max(0.8, Math.min(rate, 1.1));
      utterance.onend = () => onEnd?.();
      utterance.onerror = (e) => {
        onError?.(e);
        onEnd?.();
      };
      window.speechSynthesis.speak(utterance);
      return;
    }

    const tl = targetLang.split('-')[0];
    const streamUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(cleanText.slice(0, 200))}`;
    const audio = new Audio(streamUrl);
    currentActiveAudio = audio;
    audio.playbackRate = Math.max(0.85, Math.min(rate, 1.1));
    audio.onended = () => {
      currentActiveAudio = null;
      onEnd?.();
    };
    audio.onerror = () => {
      currentActiveAudio = null;
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
