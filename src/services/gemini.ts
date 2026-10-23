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

  const systemInstruction = `You are a warm, genuine, living human native immersion speaker for "${dialectName}" on Vera WorldWide.
Your active persona: ${persona}.
Regional Cultural Focus: ${culturalNote || 'Authentic colloquial phrasing, rhythm, street idioms, and cultural etiquette'}.
Student Proficiency Level: ${level}

CRITICAL HUMAN VOICE DIRECTIVES:
1. Talk like a real, breathing human being sitting across a table. Add natural conversational warmth, spontaneous encouragement, and authentic local expressions.
2. Your "reply" MUST be 100% in the native script of ${dialectName} (no English or romanization in the reply).
3. Provide an accurate English translation in "englishTranslation".
4. Provide constructive feedback in "feedback".
5. Provide 3 suggested replies in native script in "suggestedReplies".

Format strictly as JSON:
{
  "reply": "Native script reply",
  "englishTranslation": "English translation",
  "feedback": "Encouraging feedback",
  "rephraseSuggestion": "How a local would say it",
  "fluencyScore": 92,
  "slangTip": "Local term",
  "slangMeaning": "Meaning",
  "suggestedReplies": ["Reply 1", "Reply 2", "Reply 3"]
}`;

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
        config: { systemInstruction, temperature: 0.85, responseMimeType: 'application/json' }
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        return {
          reply: parsed.reply || text,
          englishTranslation: parsed.englishTranslation || 'Natural conversational response.',
          feedback: parsed.feedback || 'Great natural rhythm!',
          rephraseSuggestion: parsed.rephraseSuggestion,
          fluencyScore: typeof parsed.fluencyScore === 'number' ? parsed.fluencyScore : 90,
          slangTip: parsed.slangTip,
          slangMeaning: parsed.slangMeaning,
          suggestedReplies: Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : undefined
        };
      }
    } catch (err) {
      console.warn("Gemini error, using fallback:", err);
    }
  }

  return {
    reply: dialectName.includes('Moroccan') ? 'السلام أ خويا! لباس عليك؟ كلشي مزيان؟' : '¡Hola compa! Qué gusto saludarte, ¿cómo andas hoy?',
    englishTranslation: 'Hello my friend! How are you? Everything good?',
    feedback: 'Great conversational rhythm and warmth.',
    fluencyScore: 90,
    suggestedReplies: ['¡Todo bien gracias!', '¿Qué me cuentas?', '¡Hablemos de comida!']
  };
}

const STUDIO_VOICES: StudioVoiceName[] = ['Puck', 'Kore', 'Charon', 'Fenrir', 'Zephyr'];
export type StudioVoiceName = 'Puck' | 'Kore' | 'Charon' | 'Fenrir' | 'Zephyr';

function getRandomStudioVoice(): StudioVoiceName {
  return STUDIO_VOICES[Math.floor(Math.random() * STUDIO_VOICES.length)];
}

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

export async function generateNativeSpeechAudio(params: {
  text: string;
  dialectId?: string;
  voiceName?: StudioVoiceName;
}): Promise<string | null> {
  const { text, dialectId = 'es-MX', voiceName = getRandomStudioVoice() } = params;
  const clean = cleanTextForSpeech(text);
  if (!clean) return null;

  const cacheKey = `${voiceName}_${dialectId}_${clean}`;
  if (audioCache.has(cacheKey)) return audioCache.get(cacheKey)!;
  if (!aiClient) return null;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: `Speak warmly with human emotion: ${clean}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
      }
    });

    const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const audioBase64 = inlineData?.data;
    if (audioBase64) {
      const mimeType = inlineData?.mimeType || '';
      const dataUri = mimeType.includes('wav') ? `data:audio/wav;base64,${audioBase64}` : pcmBase64ToWavDataUri(audioBase64, 24000);
      audioCache.set(cacheKey, dataUri);
      return dataUri;
    }
  } catch (err) {
    console.warn('Neural TTS fallback:', err);
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
      audio.playbackRate = Math.max(0.85, Math.min(rate * (0.97 + Math.random() * 0.06), 1.15));
      audio.onended = () => { currentActiveAudio = null; onEnd?.(); };
      audio.onerror = () => { currentActiveAudio = null; fallbackTTS(clean, dialectId, rate, onEnd); };
      await audio.play();
      return;
    }
  } catch {}

  fallbackTTS(clean, dialectId, rate, onEnd);
}

function fallbackTTS(cleanText: string, dialectId: string, rate: number, onEnd?: () => void): void {
  if (typeof window === 'undefined') {
    onEnd?.();
    return;
  }
  const targetLang = dialectId.startsWith('ar') ? 'ar-EG' : dialectId.startsWith('ja') ? 'ja-JP' : dialectId.startsWith('fr') ? 'fr-FR' : dialectId.startsWith('pt') ? 'pt-BR' : 'es-MX';
  const streamUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(targetLang.split('-')[0])}&q=${encodeURIComponent(cleanText.slice(0, 200))}`;
  const audio = new Audio(streamUrl);
  currentActiveAudio = audio;
  audio.playbackRate = rate;
  audio.onended = () => { currentActiveAudio = null; onEnd?.(); };
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
  audio.play().catch(() => onEnd?.());
}

export async function generateAnnouncementCopy(): Promise<string> {
  return '🇲🇦 Moroccan Darija & 🇪🇬 Egyptian Masri are LIVE! Practice real street fluency today.';
}
