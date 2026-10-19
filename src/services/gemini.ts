import { GoogleGenAI } from '@google/genai';
import { getTransliteration } from '../utils/transliteration';

// Initialize Gemini client using the injected key
const apiKey = process.env.GEMINI_API_KEY || '';
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

/**
 * Generate dialect-specific conversational response from Vera AI Tutor
 */
export async function generateTutorReply(params: {
  userMessage: string;
  dialectName: string;
  persona: string;
  culturalNote?: string;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
}): Promise<TutorResponse> {
  const { userMessage, dialectName, persona, culturalNote, level = 'A1', chatHistory } = params;

  const levelPedagogyMap = {
    A1: 'CEFR Level A1 (Absolute Beginner): Keep your reply to 1-2 SHORT, simple sentences using basic everyday words. Provide a supportive, friendly explanation in English. Ask a gentle either/or or yes/no question to encourage them. Do not overwhelm.',
    A2: 'CEFR Level A2 (Elementary): Use simple daily conversational sentences. Introduce 1 new practical phrase. Offer warm encouragement on word order and basic verb conjugation.',
    B1: 'CEFR Level B1 (Intermediate): Maintain natural conversational rhythm. Introduce 1 authentic regional street slang or idiom. Ask an open-ended question about their opinions or day.',
    B2: 'CEFR Level B2 (Upper Intermediate): Converse with authentic native cadence, local cultural humor, dialectal contractions, and colloquial street flair. Challenge them with nuanced topics.',
    C1: 'CEFR Level C1 (Mastery): Speak at full local speed with deep colloquial nuances, rapid slang, cultural wordplay, and minimal English assistance.'
  };

  const levelDirective = levelPedagogyMap[level] || levelPedagogyMap.A1;

  const systemInstruction = `You are a warm, genuine, personal native immersion tutor for "${dialectName}".
Your active persona: ${persona}.
Regional Cultural Focus: ${culturalNote || 'Authentic colloquial phrasing, rhythm, street idioms, and cultural etiquette'}.
Student Proficiency Level: ${levelDirective}

Directives:
1. Act like a REAL human tutor having a 1-on-1 session: warm, encouraging, conversational, and tailored directly to the student's level (${level}).
2. Respond conversationally in the target dialect (${dialectName}), adopting the persona's authentic cadence and cultural warmth.
3. Provide a clean, accurate English translation of your reply.
4. Provide constructive feedback (1 sentence) analyzing the user's grammar, rhythm, or phrasing.
5. If applicable, provide a "rephraseSuggestion" showing how a true native would rephrase what the user said to sound effortless and local.
6. Provide a "slangTip" with an authentic regional idiom or word, along with its "slangMeaning".
7. Provide "suggestedReplies": an array of 3 realistic, punchy reply options in ${dialectName} matching the user's level (${level}) that the user could choose next.

Format your response strictly as a JSON object with these keys:
{
  "reply": "Native reply in ${dialectName}",
  "englishTranslation": "Clean English translation of the reply",
  "feedback": "Encouraging, constructive feedback on the user's sentence",
  "rephraseSuggestion": "How a local would rephrase the user's sentence",
  "fluencyScore": 88,
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
          return {
            reply: parsed.reply || text,
            englishTranslation: parsed.englishTranslation || 'Natural conversational response in the local dialect.',
            feedback: parsed.feedback || 'Great natural rhythm and conversational confidence.',
            rephraseSuggestion: parsed.rephraseSuggestion,
            fluencyScore: typeof parsed.fluencyScore === 'number' ? parsed.fluencyScore : 90,
            slangTip: parsed.slangTip,
            slangMeaning: parsed.slangMeaning,
            suggestedReplies: Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : undefined
          };
        } catch {
          return {
            reply: text,
            englishTranslation: 'Understanding your message in native cadence.',
            feedback: 'Natural rhythm and authentic vocabulary usage.',
            fluencyScore: 88,
            suggestedReplies: getFallbackSuggestions(dialectName)
          };
        }
      }
    } catch (err) {
      console.warn("Gemini generation error, utilizing contextual fallback:", err);
    }
  }

  // High-fidelity regional conversational fallback adapted to learner level
  return getContextualDialectFallback(dialectName, userMessage, level);
}

/**
 * Generate catchy promotional copy for the Admin announcement banner
 */
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

  // Fallbacks based on keywords
  if (topicPrompt.toLowerCase().includes('sale') || topicPrompt.toLowerCase().includes('off') || topicPrompt.toLowerCase().includes('discount')) {
    return '⚡ Flash Immersion Pass: Unlock All Dialects & Boss Arenas at 40% Off This Week!';
  }
  if (topicPrompt.toLowerCase().includes('darija') || topicPrompt.toLowerCase().includes('moroc')) {
    return '🇲🇦 Moroccan Darija is Now in Alpha! Vote or Claim Staff Pass to Preview.';
  }
  return `📢 Vera WorldWide Announcement: ${topicPrompt} — Experience high-velocity dialect fluency today!`;
}

function getFallbackSuggestions(dialectName: string): string[] {
  if (dialectName.includes('Arabic') || dialectName.includes('Egyptian') || dialectName.includes('Masri')) {
    return ['كله تمام والحمد لله يا باشا', 'قولي على أحسن مطعم كشري في القاهرة', 'إيه الأخبار في وسط البلد؟'];
  }
  if (dialectName.includes('Mexican')) {
    return ['¡Todo bien compa, gracias!', '¿Qué lugares me recomiendas visitar hoy?', 'Me late un montón la idea'];
  }
  if (dialectName.includes('French') || dialectName.includes('Paris')) {
    return ['Ça roule, et toi ?', 'Tu me conseilles quel bistrot dans le coin ?', "C'est trop stylé comme endroit"];
  }
  if (dialectName.includes('Japanese') || dialectName.includes('Tokyo')) {
    return ['元気ですよ！そちらはどうですか？', 'この辺でおすすめのラーメン屋はありますか？', 'まじで面白いですね！'];
  }
  if (dialectName.includes('Portuguese') || dialectName.includes('Carioca')) {
    return ['Tudo sussa meu irmão, e você?', 'Onde rola aquele açaí responsa?', 'Que parada manera!'];
  }
  return ['Everything sounds great!', 'What do you recommend doing nearby?', 'Tell me more about the local culture!'];
}

export function getContextualDialectFallback(dialectName: string, message: string, level: string = 'A1'): TutorResponse {
  const lower = message.toLowerCase();
  const lvl = level.toUpperCase();
  const isA1 = lvl === 'A1';
  const isA2 = lvl === 'A2';
  const isB1 = lvl === 'B1';
  const isB2 = lvl === 'B2';
  const isC1 = lvl === 'C1';

  if (dialectName.includes('Arabic') || dialectName.includes('Egyptian') || dialectName.includes('Masri')) {
    const isGreeting = lower.includes('ازيك') || lower.includes('عامل') || lower.includes('صباح') || lower.includes('مساء') || lower.includes('سلام') || lower.includes('اهلا') || lower.includes('أهلا') || lower.includes('اخبارك') || lower.includes('أخبارك') || lower.includes('hello') || lower.includes('hi');
    const isFood = lower.includes('اكل') || lower.includes('أكل') || lower.includes('كشري') || lower.includes('مطعم') || lower.includes('شاي') || lower.includes('قهوة') || lower.includes('حساب') || lower.includes('food');
    const isDirection = lower.includes('فين') || lower.includes('منين') || lower.includes('مترو') || lower.includes('شارع') || lower.includes('تاكسي') || lower.includes('ازاي') || lower.includes('where');
    const isQuestion = lower.includes('معنى') || lower.includes('يعني') || lower.includes('ازاي اقول') || lower.includes('how') || lower.includes('what') || lower.includes('why');

    if (isA1) {
      if (isGreeting) {
        return {
          reply: 'أهلاً وسهلاً يا صديقي! إزيك؟ عامل إيه؟ أنا كريم، هنا معاك 24 ساعة. يلا نتعلم خطوة بخطوة!',
          englishTranslation: 'Welcome my friend! How are you? How are you doing? I am Karim, here with you 24 hours. Let us learn step by step! (Try replying: «Kollo tamam» = Everything is good).',
          feedback: 'ممتاز جداً! كلمة «إزيك» (Ezzayak) هي الطريقة الأساسية للسؤال عن الحال في مصر.',
          rephraseSuggestion: 'للبداية السهلة: «أهلاً يا كريم، إزيك؟»',
          fluencyScore: 98,
          slangTip: '«إزيك» (Ezzayak)',
          slangMeaning: 'Everyday Cairene for "How are you?". Use "Ezzayak" for males, and "Ezzayek" for females.',
          suggestedReplies: [
            'كله تمام والحمد لله يا كريم',
            'أنا كويس، وإنت عامل إيه؟',
            'عايز أتعلم كلمات سهلة النهارده'
          ]
        };
      }
      if (isFood) {
        return {
          reply: 'بتحب الكشري؟ الكشري أكلة مصرية مشهورة ولذيذة جداً! جربت تاكله قبل كده؟',
          englishTranslation: 'Do you like koshari? Koshari is a very famous and delicious Egyptian dish! Have you tried eating it before?',
          feedback: 'أحسنت! كلمة «أكلة» تعني وجبة أو طعام، و«لذيذة» تعني شهية.',
          rephraseSuggestion: '«عايز أطلب كشري لو سمحت» تعني "I want to order koshari please".',
          fluencyScore: 96,
          slangTip: '«كشري» (Koshari)',
          slangMeaning: "Egypt's national comfort food: lentils, rice, pasta, chickpeas, topped with spiced tomato sauce and crispy onions.",
          suggestedReplies: [
            'نعم، بحب الكشري جداً!',
            'الكشري فيه إيه بالظبط؟',
            'عايز أجربه في وسط البلد'
          ]
        };
      }
      return {
        reply: 'يا هلا بيك! فكرتك واضحة وسهلة. كل يوم هنتكلم شوية وهتلاقي لسانك اتعود على العربي بسهولة!',
        englishTranslation: 'Welcome! Your idea is clear and simple. Every day we will chat a bit and your tongue will naturally get used to Arabic with ease!',
        feedback: 'برافو عليك! الاستمرار هو سر الطلاقة الحقيقية.',
        rephraseSuggestion: 'تقدر تسألني أي وقت: «يعني إيه الكلمة دي؟» وهشرحهالك فوراً.',
        fluencyScore: 95,
        slangTip: '«خطوة بخطوة»',
        slangMeaning: '"Step by step"—the best way to master Egyptian street fluency.',
        suggestedReplies: [
          'علمني جملة أقولها في الشارع',
          'إزاي أقول «شكراً» بالمصري؟',
          'معاك يا كريم، كمل وأنا سامعك'
        ]
      };
    }

    if (isGreeting) {
      return {
        reply: isB2 || isC1
          ? 'يا مساء الفل والياسمين يا معلم! نورت مصر كلها. إيه الأخبار عندك؟ الشارع سالك ولا زحمة كالعادة؟'
          : 'أهلاً وسهلاً يا باشا! يا مساء الفل والياسمين. شرفتنا ونورتنا! تحب نتكلم في إيه النهارده؟ أكلات شعبية، خروجات في وسط البلد، ولا حكايات القهاوي؟',
        englishTranslation: "Welcome boss! An evening of jasmine and flowers to you. So honored to have you! What would you like to talk about today? Street foods, hanging out in Downtown, or stories at the ahwa?",
        feedback: 'تحية ممتازة ومضبوطة جداً في اللهجة القاهرية الأصيلة.',
        rephraseSuggestion: 'في الشارع مع أصحابك تقدر تقول ببساطة: «يا صباح الفل يا صاحبي» أو «إزيك يا وحش».',
        fluencyScore: 95,
        slangTip: '«يا مساء الفل والياسمين»',
        slangMeaning: 'Iconic Cairo poetic greeting expressing warm welcome, respect, and street hospitality.',
        suggestedReplies: [
          'قولي على أحسن مكان للكشري في وسط البلد',
          'إزاي أروح خان الخليلي من غير ما أتوه؟',
          'كله تمام والحمد لله، إنت عامل إيه؟'
        ]
      };
    }

    if (isFood) {
      return {
        reply: 'يا عيني عليك! ذوقك عالي في الأكل. في القاهرة، لما تروح تاكل كشري، قول للريس: «علبة كشري ميكس وكتر الدقة والشطة لو سمحت»، وعلى القهوة اطلب «شاي في الخمسينة مظبوط»!',
        englishTranslation: "Spot on! You have great taste in food. In Cairo, when you eat koshari, tell the server: 'A mixed koshari box with extra daqqa and shatta please', and at the café ask for 'tea in the khamseenah, medium sugar'!",
        feedback: 'اختيار رائع للكلمات وفهم حقيقي لعادات الأكل المصرية.',
        rephraseSuggestion: '«في الخمسينة» هو المصطلح الكلاسيكي لكوب الشاي الزجاجي المركز على القهوة البلدي.',
        fluencyScore: 94,
        slangTip: '«في الخمسينة»',
        slangMeaning: 'Strong Egyptian black tea served in a traditional small glass tumbler at street cafes.',
        suggestedReplies: [
          'والحساب بكام يا معلم؟',
          'الحواوشي الإسكندراني أحلى ولا القاهري؟',
          'تسلم إيدك، الأكل شكله يفتح النفس'
        ]
      };
    }

    if (isDirection) {
      return {
        reply: 'على راسي يا غالي! لو راكب تاكسي أبيض في القاهرة، قوله: «على وسط البلد يا أسطى على طول وشغل العداد لو سمحت». ومحطة مترو السادات هتوصلك لأي مكان في ثواني!',
        englishTranslation: "With pleasure my dear friend! If you take a Cairo white taxi, tell him: 'Straight to Downtown chief, and turn on the meter please'. And Sadat metro station gets you anywhere in seconds!",
        feedback: 'صياغة سؤال واضحة وسهلة الفهم في السياق اليومي للشارع المصري.',
        rephraseSuggestion: '«يا أسطى» هي الكلمة المحترمة والشائعة لمناداة سائق التاكسي أو الحرفي.',
        fluencyScore: 93,
        slangTip: '«يا أسطى»',
        slangMeaning: 'Master driver / craftsman—the standard respectful street address for taxi drivers.',
        suggestedReplies: [
          'هو المترو زحمة دلوقتي؟',
          'السكة سالكة ولا في زحمة يا كابتن؟',
          'نزلني على أول الشارع هنا لو سمحت'
        ]
      };
    }

    return {
      reply: 'يا سيدي الفل! كلامك زي السكر وطريقتك في الكلام ماشية مع ريتم الشارع القاهري تمام. عايز نجرب موقف حقيقي زي الفصال في السوق ولا طلبات القهوة؟',
      englishTranslation: "My dear friend! Your words are sweet as sugar and your cadence matches Cairo street rhythm perfectly. Shall we roleplay haggling in the souk or ordering at the ahwa?",
      feedback: 'مستوى محادثة ممتاز وتفاعل عفوي وواثق.',
      rephraseSuggestion: 'استخدم تعبير «كبر دماغك» لو عايز تقول لحد ما يشغلش باله بحاجة تافهة.',
      fluencyScore: 92,
      slangTip: '«كبر دماغك»',
      slangMeaning: 'The definitive Egyptian philosophy for "let it go / don\'t sweat the small stuff".',
      suggestedReplies: [
        'يلا نجرب نفاصل في خان الخليلي',
        'فهمني إزاي أطلب طلبات القهوة زي أهل البلد',
        'معاك يا باشا، كمل وأنا سامعك'
      ]
    };
  }

  if (dialectName.includes('Mexican')) {
    if (isA1) {
      return {
        reply: '¡Hola! Mucho gusto, soy Sofía de la Ciudad de México. Vamos con calma, palabra por palabra. ¿Cómo estás hoy?',
        englishTranslation: 'Hello! Nice to meet you, I am Sofia from Mexico City. We will go calmly, word by word. How are you today?',
        feedback: '¡Excelente inicio! Para responder puedes decir: «Muy bien, gracias».',
        rephraseSuggestion: '«Hola Sofía, ¿cómo estás?» es un saludo perfecto y natural.',
        fluencyScore: 97,
        slangTip: '«Mucho gusto»',
        slangMeaning: 'Standard polite Spanish for "Pleased to meet you".',
        suggestedReplies: [
          'Muy bien Sofía, ¿y tú?',
          'Mucho gusto en conocerte',
          'Quiero aprender palabras fáciles hoy'
        ]
      };
    }
    if (lower.includes('hola') || lower.includes('buenos') || lower.includes('que tal') || lower.includes('onda')) {
      return {
        reply: '¡Qué onda, compa! Qué gusto tenerte por acá. ¿De qué te gustaría platicar hoy? ¿Comida callejera, música o cómo moverse en la ciudad?',
        englishTranslation: "What's up buddy! So great to have you here. What would you like to chat about today? Street food, music, or getting around the city?",
        feedback: '¡Excelente saludo! El tono suena muy amigable y natural.',
        rephraseSuggestion: 'En la calle puedes decir directo: «¿Qué transa carnal?» para amigos cercanos.',
        fluencyScore: 94,
        slangTip: '«Chido»',
        slangMeaning: 'Cool, awesome, or great in everyday Mexican Spanish.',
        suggestedReplies: [
          'Platícame de los mejores tacos al pastor',
          '¿Cómo tomo el metro sin perderme?',
          'Me late andar caminando por el centro'
        ]
      };
    }
    return {
      reply: '¡Órale, qué bien suena eso! Me late un buen tu vibra. Si quieres pedir algo en la fonda o en la taquería, acuérdate de decir siempre: "¿Me das dos de pastor con todo, por favor?"',
      englishTranslation: 'Wow, that sounds great! I really like your vibe. If you want to order at a diner or taco stand, remember to say: "Could I get two pastor tacos with everything, please?"',
      feedback: 'Buena estructura de oración y vocabulario adecuado para la CDMX.',
      rephraseSuggestion: '«Me late un buen» es la forma más espontánea de decir que algo te agrada.',
      fluencyScore: 91,
      slangTip: '«Con todo»',
      slangMeaning: 'At a taco stand, ordering "con todo" automatically includes cilantro, onions, and roasted pineapple.',
      suggestedReplies: [
        '¿Y la salsa verde pica mucho?',
        '¿Cuánto es de la cuenta marchante?',
        '¡Están buenísimos jefe, gracias!'
      ]
    };
  }

  if (dialectName.includes('French') || dialectName.includes('Paris')) {
    if (isA1) {
      return {
        reply: "Bonjour ! Bienvenue. Je m'appelle Camille. On apprend tranquillement ensemble à ton rythme. Comment tu t'appelles ?",
        englishTranslation: "Hello! Welcome. My name is Camille. We learn calmly together at your own pace. What is your name?",
        feedback: 'Super début ! Pour répondre, tu peux dire : « Je m’appelle... ».',
        rephraseSuggestion: '« Bonjour Camille, ça va bien merci ! »',
        fluencyScore: 96,
        slangTip: '« Ça va »',
        slangMeaning: 'The ultimate versatile French phrase: means both "How are you?" and "I am doing well".',
        suggestedReplies: [
          'Bonjour Camille ! Ça va très bien',
          "Je m'appelle Alex, enchanté !",
          'Je veux apprendre le français de Paris'
        ]
      };
    }
    return {
      reply: "Salut ! Franchement, t’as une super cadence. À Paris, au comptoir d'un café, on dit souvent : « Un café serré s'il vous plaît ! »",
      englishTranslation: "Hey! Honestly, your conversational rhythm is great. In Paris at a café counter, locals often say: 'A short espresso please!'",
      feedback: 'Très bonne fluidité et tournure de phrase très naturelle.',
      rephraseSuggestion: 'Tu peux enlever le « ne » à l’oral : « J’sais pas » au lieu de « Je ne sais pas ».',
      fluencyScore: 92,
      slangTip: '« C’est ouf »',
      slangMeaning: 'Verlan inversion of "fou" (crazy). Used constantly by all generations in Paris for "that is unbelievable / crazy".',
      suggestedReplies: [
        'On se prend un petit café en terrasse ?',
        "C'est quoi ton quartier préféré à Paris ?",
        "Laisse tomber, c'est trop stylé !"
      ]
    };
  }

  if (dialectName.includes('Japanese') || dialectName.includes('Tokyo')) {
    if (isA1) {
      return {
        reply: 'こんにちは！東京の健二（けんじ）です。ゆっくり楽しく日本語を練習しましょう！お元気ですか？',
        englishTranslation: 'Hello! I am Kenji from Tokyo. Let us practice Japanese slowly and enjoyably! How are you doing? (Try replying: «Genki desu!» = I am well!)',
        feedback: '素晴らしいスタートです！「元気です」と答えるととても自然です。',
        rephraseSuggestion: '「こんにちは！元気です」と言ってみましょう。',
        fluencyScore: 97,
        slangTip: '「元気です！」(Genki desu!)',
        slangMeaning: '"I am doing great / full of energy!"—the standard cheerful Japanese response.',
        suggestedReplies: [
          'こんにちは！元気です (Hello! I am well)',
          '初めまして、健二さん (Nice to meet you, Kenji)',
          '簡単な日本語を教えてください (Please teach me simple Japanese)'
        ]
      };
    }
    return {
      reply: 'こんにちは！日本語のイントネーションがとても自然ですね。東京の居酒屋では「とりあえず生で！」と頼むと一気にローカル感が出ますよ！',
      englishTranslation: "Hello! Your Japanese intonation is very natural. At a Tokyo izakaya, ordering 'Toriaezu nama de!' (draft beer to start!) makes you sound like an instant local!",
      feedback: '丁寧な語尾の使い分けがとてもスムーズです。',
      rephraseSuggestion: '友達同士なら「〜だよね」や「それな！」を使うと一気に親近感が増します。',
      fluencyScore: 95,
      slangTip: '「それな！」',
      slangMeaning: 'Ubiquitous Tokyo street agreement particle meaning "Preach / Exactly / Couldn\'t agree more".',
      suggestedReplies: [
        'おすすめの居酒屋を教えて！',
        '今日の仕事はお疲れ様でした！',
        'それな！まじで共感しかないわ'
      ]
    };
  }

  if (dialectName.includes('Portuguese') || dialectName.includes('Carioca') || dialectName.includes('Brazil')) {
    return {
      reply: 'E aí meu irmão, tranquilidade? Que vibe boa! Aqui no Rio a gente costuma pedir: «Manda uma água de coco bem gelada aí, chefe!»',
      englishTranslation: "What's up my brother, everything chill? What a great vibe! Here in Rio we usually ask: 'Send an ice-cold coconut water my way, boss!'",
      feedback: 'Excelente calor humano na mensagem! A informalidade carioca soa genuína.',
      rephraseSuggestion: 'Chamar o atendente de «chefe» ou «meu parceiro» gera conexão instantânea.',
      fluencyScore: 93,
      slangTip: '«Maneiro»',
      slangMeaning: 'The definitive Rio de Janeiro slang word for cool, nice, or pleasant.',
      suggestedReplies: [
        'Bora dar um mergulho em Copacabana?',
        'Onde tem aquela roda de samba boa hoje?',
        'Tudo sussa meu parceiro, só na paz!'
      ]
    };
  }

  if (dialectName.includes('Colombian') || dialectName.includes('Paisa')) {
    return {
      reply: '¡Qué hubo pues mi parce! Qué berraquera hablar contigo. Si vas por Medellín, no olvides saludar con un buen «¿Bien o qué, hombre?»',
      englishTranslation: "What's up my buddy! How awesome to chat with you. If you go through Medellín, don't forget to greet people with 'Good or what, man?'",
      feedback: 'El ritmo musical de tu frase capta muy bien la calidez colombiana.',
      rephraseSuggestion: 'Usa «parce» o «parcero» con confianza para referirte a compas o amigos.',
      fluencyScore: 92,
      slangTip: '«Berraquera»',
      slangMeaning: 'Iconic Colombian expression for something incredible, brave, or outstanding.',
      suggestedReplies: [
        '¡Qué chimba de ciudad es Medellín!',
        '¿Dónde consigo una bandeja paisa de verdad?',
        'Todo bien mi parce, con toda la actitud'
      ]
    };
  }

  // Default fallback
  return {
    reply: `That was a great turn in ${dialectName}! Notice how native rhythm builds with conversational fillers and everyday questions. What would you like to explore next?`,
    englishTranslation: `That was a great turn in ${dialectName}!`,
    feedback: 'Clear intent, accurate vocabulary, and steady conversational rhythm.',
    rephraseSuggestion: 'Try opening with a relaxed regional greeting to set a friendly atmosphere.',
    fluencyScore: 90,
    slangTip: 'Colloquial cadence',
    slangMeaning: 'Using relaxed sentence starters makes native speakers feel comfortable chatting freely.',
    suggestedReplies: getFallbackSuggestions(dialectName)
  };
}

// In-memory audio cache to guarantee zero-latency instant replay of phrases
const audioCache = new Map<string, string>();
let currentActiveAudio: HTMLAudioElement | null = null;

export type StudioVoiceName = 'Puck' | 'Kore' | 'Charon' | 'Fenrir' | 'Zephyr';

/**
 * Clean text for human-like spoken TTS (strips emojis, markdown, and guillemets that confuse synthesizers)
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Remove emojis
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}]/gu, '')
    // Remove brackets, guillemets, and quotes
    .replace(/[«»""''„“”]/g, '')
    // Remove markdown formatting
    .replace(/[*_~`#]/g, '')
    // Replace multiple punctuation with single pause
    .replace(/([!?.]){2,}/g, '$1')
    .trim();
}

/**
 * Generate studio-grade 24kHz human speech audio using Gemini Neural TTS.
 * Returns a playable data:audio/wav;base64 data URI or null if offline.
 */
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

  // Tailored style instructions to ensure hyper-authentic regional street intonation
  let style = 'Clear, warm, natural native speaker';
  if (dialectId.startsWith('ar')) {
    style = 'Warm, energetic native Egyptian Cairene street speaker with authentic colloquial pauses';
  } else if (dialectId.startsWith('es')) {
    style = 'Warm, expressive, authentic Mexican street speaker';
  } else if (dialectId.startsWith('fr')) {
    style = 'Expressive, smooth Parisian French local with natural conversational rhythm';
  } else if (dialectId.startsWith('ja')) {
    style = 'Friendly, polite Tokyo local with natural pitch accent';
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: clean,
              speechMetadata: { style }
            }
          ]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioBase64) {
      const dataUri = `data:audio/wav;base64,${audioBase64}`;
      audioCache.set(cacheKey, dataUri);
      return dataUri;
    }
  } catch (err) {
    console.warn('Gemini Neural TTS unavailable, falling back to enhanced browser voice:', err);
  }

  return null;
}

/**
 * Stop any currently playing audio track.
 */
export function stopAllAudio(): void {
  if (currentActiveAudio) {
    currentActiveAudio.pause();
    currentActiveAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Find the highest fidelity native speech synthesis voice for a dialect
 */
function findBestNativeVoice(dialectId: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  if (dialectId.startsWith('ar')) {
    // 1. Egyptian Arabic
    const egVoice = voices.find((v) =>
      v.lang.toLowerCase().includes('eg') ||
      v.name.toLowerCase().includes('egypt') ||
      v.name.toLowerCase().includes('maged') ||
      v.name.toLowerCase().includes('tarik') ||
      v.name.toLowerCase().includes('salma') ||
      v.name.toLowerCase().includes('laila')
    );
    if (egVoice) return egVoice;

    // 2. Any Arabic natural voice
    const arVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith('ar') ||
      v.name.toLowerCase().includes('arabic')
    );
    if (arVoice) return arVoice;

    // If no Arabic voice installed on this OS, return null so we can speak Arabizi phonetically
    return null;
  }

  if (dialectId.startsWith('es')) {
    if (dialectId === 'es-MX') {
      const mx = voices.find((v) =>
        v.lang.toLowerCase().includes('mx') ||
        v.name.toLowerCase().includes('mexic') ||
        v.name.toLowerCase().includes('paulina') ||
        v.name.toLowerCase().includes('jorge') ||
        v.name.toLowerCase().includes('raul')
      );
      if (mx) return mx;
    } else if (dialectId === 'es-CO') {
      const co = voices.find((v) =>
        v.lang.toLowerCase().includes('co') ||
        v.name.toLowerCase().includes('colomb')
      );
      if (co) return co;
    }
    const naturalEs = voices.find((v) =>
      v.lang.toLowerCase().startsWith('es') &&
      (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('monica'))
    );
    if (naturalEs) return naturalEs;
    return voices.find((v) => v.lang.toLowerCase().startsWith('es')) || null;
  }

  if (dialectId.startsWith('ja')) {
    const ja = voices.find((v) =>
      v.lang.toLowerCase().startsWith('ja') &&
      (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('kyoko') || v.name.toLowerCase().includes('otoya'))
    );
    if (ja) return ja;
    return voices.find((v) => v.lang.toLowerCase().startsWith('ja')) || null;
  }

  if (dialectId.startsWith('fr')) {
    const fr = voices.find((v) =>
      v.lang.toLowerCase().startsWith('fr') &&
      (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('amelie') || v.name.toLowerCase().includes('thomas') || v.name.toLowerCase().includes('audrey'))
    );
    if (fr) return fr;
    return voices.find((v) => v.lang.toLowerCase().startsWith('fr')) || null;
  }

  if (dialectId.startsWith('pt')) {
    const pt = voices.find((v) =>
      v.lang.toLowerCase().includes('br') ||
      v.name.toLowerCase().includes('luciana') ||
      v.name.toLowerCase().includes('felipe')
    );
    if (pt) return pt;
    return voices.find((v) => v.lang.toLowerCase().startsWith('pt')) || null;
  }

  return null;
}

/**
 * Unified native audio player:
 * 1. Attempts Gemini Neural Studio 24kHz audio first.
 * 2. If offline or unavailable, uses enhanced Web Speech with intelligent native voice selection and Arabizi phonetics fallback.
 */
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

  stopAllAudio();
  onStart?.();

  // 1. Try Gemini Neural Audio
  try {
    const dataUri = await generateNativeSpeechAudio({ text, dialectId, voiceName });
    if (dataUri) {
      const audio = new Audio(dataUri);
      currentActiveAudio = audio;
      audio.playbackRate = rate;
      audio.onended = () => {
        currentActiveAudio = null;
        onEnd?.();
      };
      audio.onerror = (e) => {
        currentActiveAudio = null;
        console.warn('HTML5 Audio playback error:', e);
        fallbackBrowserTTS(text, dialectId, rate, onEnd, onError);
      };
      await audio.play();
      return;
    }
  } catch (err) {
    console.warn('Error during Gemini Neural Audio playback:', err);
  }

  // 2. Fallback to Enhanced Browser TTS with intelligent native voice selection
  fallbackBrowserTTS(text, dialectId, rate, onEnd, onError);
}

function fallbackBrowserTTS(
  text: string,
  dialectId: string,
  rate: number,
  onEnd?: () => void,
  onError?: (err: any) => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const clean = cleanTextForSpeech(text);
  if (!clean) {
    onEnd?.();
    return;
  }

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = findBestNativeVoice(dialectId, voices);

  let textToSpeak = clean;
  let targetLang = 'es-MX';
  let pitch = 1.02;
  let adjustedRate = Math.max(0.7, Math.min(rate, 1.1));

  if (dialectId.startsWith('ar')) {
    if (matchedVoice) {
      targetLang = 'ar-EG';
      textToSpeak = clean;
    } else {
      // Intelligently pronounce Franco-Arab (Arabizi) so learners hear natural phonetics instead of garbled robotic gibberish
      textToSpeak = getTransliteration(clean, 'ar-EG');
      targetLang = 'en-US';
      adjustedRate = 0.85;
      pitch = 1.05;
    }
  } else if (dialectId.startsWith('ja')) {
    if (matchedVoice) {
      targetLang = 'ja-JP';
      textToSpeak = clean;
    } else {
      textToSpeak = getTransliteration(clean, 'ja-JP');
      targetLang = 'en-US';
      adjustedRate = 0.85;
    }
  } else if (dialectId.startsWith('fr')) {
    targetLang = 'fr-FR';
  } else if (dialectId.startsWith('es')) {
    targetLang = dialectId === 'es-CO' ? 'es-CO' : 'es-MX';
  } else if (dialectId.startsWith('pt')) {
    targetLang = 'pt-BR';
  }

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = targetLang;
  utterance.rate = adjustedRate;
  utterance.pitch = pitch;

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  } else {
    // Pick highest quality English/Latin voice for phonetics
    const naturalDefault = voices.find(
      (v) =>
        v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('google') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('daniel')
    );
    if (naturalDefault) utterance.voice = naturalDefault;
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => {
    onError?.(e);
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}


