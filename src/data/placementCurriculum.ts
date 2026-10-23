export interface QuizQuestion {
  prompt: string;
  context: string;
  spokenAudio?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type FluencyLevelKey = 'beginner' | 'intermediate' | 'advanced' | 'fluent' | 'native';

function shuffleQuestionOptions(q: { prompt: string; context: string; spokenAudio?: string; options: string[]; correctOptionText: string; explanation: string }): QuizQuestion {
  const optionsCopy = [...q.options];
  for (let i = optionsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsCopy[i], optionsCopy[j]] = [optionsCopy[j], optionsCopy[i]];
  }
  const newCorrectIndex = optionsCopy.indexOf(q.correctOptionText);
  return {
    prompt: q.prompt,
    context: q.context,
    spokenAudio: q.spokenAudio,
    options: optionsCopy,
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
    explanation: q.explanation
  };
}

export function getDialectPlacementQuestions(level: FluencyLevelKey, dialectId: string): QuizQuestion[] {
  const isDarija = dialectId === 'ar-MA';
  const isEgyptian = dialectId === 'ar-EG';
  const isFr = dialectId.startsWith('fr');
  const isJa = dialectId.startsWith('ja');
  const isPt = dialectId.startsWith('pt');

  let rawQuestions: Array<{ prompt: string; context: string; spokenAudio?: string; options: string[]; correctOptionText: string; explanation: string }> = [];

  if (isDarija) {
    if (level === 'beginner') {
      rawQuestions = [
        {
          prompt: 'How do people in Casablanca greet each other warmly and ask how things are going?',
          context: 'Casablanca Street Greeting',
          spokenAudio: 'سلام! لباس عليك؟ كلشي بخير؟',
          options: ['سلام! لباس عليك؟ كلشي بخير؟', 'أنا أريد أن أشتري تذكرة القطار', 'كم الساعة الآن يا سيد؟', 'مرحباً أيها السائح الكريم'],
          correctOptionText: 'سلام! لباس عليك؟ كلشي بخير؟',
          explanation: '"Labas 3lik? Kolchi bikhir?" is the essential everyday Moroccan Darija greeting.'
        },
        {
          prompt: 'How do you politely ask for the check in a Moroccan café or restaurant?',
          context: 'Café & Dining Etiquette',
          spokenAudio: 'الحساب عافاك أ خويا',
          options: ['أعطيني جواز السفر فوراً', 'الحساب عافاك أ خويا', 'الجو جميل جداً اليوم', 'أين توجد المحطة الطرقية؟'],
          correctOptionText: 'الحساب عافاك أ خويا',
          explanation: '"El-7esab 3afak a khoya" is the polite, natural way to ask for the bill.'
        },
        {
          prompt: 'How do you ask someone for directions to the old medina?',
          context: 'Street Navigation',
          spokenAudio: 'فين جات المدينة القديمة عافاك؟',
          options: ['فين جات المدينة القديمة عافاك؟', 'أنا لا أعرف أي كلمة بالدارجة', 'سأبقى في الفندق طوال اليوم', 'العروسة لابسة قفطان زوين'],
          correctOptionText: 'فين جات المدينة القديمة عافاك؟',
          explanation: '"Feyn jat..." is how locals ask where a specific neighborhood or landmark is.'
        },
        {
          prompt: 'How do you gracefully decline a persistent vendor in the souk?',
          context: 'Market Etiquette',
          spokenAudio: 'الله يسهل عليك، شكراً',
          options: ['ابتعد عني وإلا ناديت الشرطة', 'الله يسهل عليك، شكراً', 'هذه السلعة مزورة تماماً', 'سأشتري المحل كله غدا'],
          correctOptionText: 'الله يسهل عليك، شكراً',
          explanation: '"Allah yesahel 3lik" is the graceful Moroccan way to decline an offer.'
        }
      ];
    } else {
      rawQuestions = [
        {
          prompt: 'When a Moroccan merchant tells you: "خدها بصحيح ما كاين زواقة", what are they assuring you?',
          context: 'Souk Bargaining Cadence',
          spokenAudio: 'خدها بصحيح ما كاين زواقة',
          options: ['Take it for real, no gimmicks or inflated tourist prices', 'The item is painted in bright blue colors', 'You must return the item before sunset', 'The shop is closing for holiday'],
          correctOptionText: 'Take it for real, no gimmicks or inflated tourist prices',
          explanation: '"Ma kayn zawwaqa" means no fluff or fake talk — giving you the honest bottom line.'
        },
        {
          prompt: 'What does the quintessential Casablanca expression "دقة دقة وصل المرطى" advise you to do?',
          context: 'Moroccan Proverbial Wisdom',
          spokenAudio: 'دقة دقة وصل المرطى',
          options: ['Step by step and with patience you will reach your goal', 'Run as fast as you can to the tram station', 'Do not eat sweets in the afternoon', 'Close all windows during summer'],
          correctOptionText: 'Step by step and with patience you will reach your goal',
          explanation: 'A classic North African proverb teaching persistence and steady patience.'
        }
      ];
    }
  } else if (isEgyptian) {
    rawQuestions = [
      {
        prompt: 'How do Cairo locals warmly greet a friend?',
        context: 'Cairene Greeting',
        spokenAudio: 'إزيك يا باشا؟ عامل إيه؟',
        options: ['إزيك يا باشا؟ عامل إيه؟', 'مرحباً أيها السيد المحترم', 'أين القطار المتجه إلى الاسكندرية', 'كم سعر هذا القماش؟'],
        correctOptionText: 'إزيك يا باشا؟ عامل إيه؟',
        explanation: '"Ezzayak ya basha" is standard Cairene street warmth.'
      }
    ];
  } else if (isFr) {
    rawQuestions = [
      {
        prompt: 'How do Parisian friends informally greet each other?',
        context: 'Parisian Greeting',
        spokenAudio: 'Salut ! Ça va ? Ça roule ?',
        options: ['Salut ! Ça va ? Ça roule ?', 'Veuillez agréer mes salutations distinguées', 'Je désire commander un taxi', 'Où se trouve la gare ?'],
        correctOptionText: 'Salut ! Ça va ? Ça roule ?',
        explanation: '"Ça roule" is the standard casual Parisian greeting.'
      }
    ];
  } else if (isJa) {
    rawQuestions = [
      {
        prompt: 'How do Tokyo locals greet a friend casually?',
        context: 'Tokyo Greeting',
        spokenAudio: '元気？最近どう？',
        options: ['元気？最近どう？', '私は外国人です', '電車の切符を買います', 'お元気でいらっしゃいますか'],
        correctOptionText: '元気？最近どう？',
        explanation: '"Genki? Saikin dou?" is standard peer greeting in Tokyo.'
      }
    ];
  } else if (isPt) {
    rawQuestions = [
      {
        prompt: 'How do Rio locals greet each other?',
        context: 'Carioca Greeting',
        spokenAudio: 'E aí, beleza?',
        options: ['Cidadão, apresente seus documentos', 'E aí, beleza?', 'Eu quero falar português correto', 'Quanto custa o hotel?'],
        correctOptionText: 'E aí, beleza?',
        explanation: '"E aí, beleza?" is standard Rio street greeting.'
      }
    ];
  } else {
    rawQuestions = [
      {
        prompt: 'How do locals informally say hello?',
        context: 'Street Greeting',
        spokenAudio: '¡Qué onda, compa!',
        options: ['Estimado ciudadano', '¡Qué onda, compa!', 'Quiero hablar formal', 'Regla gramatical'],
        correctOptionText: '¡Qué onda, compa!',
        explanation: '"Qué onda" is standard casual greeting.'
      }
    ];
  }

  return rawQuestions.map(shuffleQuestionOptions);
}
