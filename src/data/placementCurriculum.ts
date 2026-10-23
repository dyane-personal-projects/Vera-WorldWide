export interface QuizQuestion {
  prompt: string;
  context: string;
  spokenAudio?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type FluencyLevelKey = 'beginner' | 'intermediate' | 'advanced' | 'fluent' | 'native';

// Helper to deterministically/randomly shuffle options and track the correct answer
function shuffleQuestionOptions(q: { prompt: string; context: string; spokenAudio?: string; options: string[]; correctOptionText: string; explanation: string }): QuizQuestion {
  const optionsCopy = [...q.options];
  // Fisher-Yates shuffle
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
  const isAr = dialectId.startsWith('ar');
  const isFr = dialectId.startsWith('fr');
  const isJa = dialectId.startsWith('ja');
  const isPt = dialectId.startsWith('pt');

  let rawQuestions: Array<{ prompt: string; context: string; spokenAudio?: string; options: string[]; correctOptionText: string; explanation: string }> = [];

  if (isAr) {
    if (level === 'beginner') {
      rawQuestions = [
        {
          prompt: 'How do Cairo locals warmly greet a friend and ask how everything is going?',
          context: 'Everyday Cairene Greeting',
          spokenAudio: 'إزيك يا باشا؟ عامل إيه؟',
          options: ['إزيك يا باشا؟ عامل إيه؟', 'مرحباً أيها المواطن المحترم', 'أنا أريد الذهاب إلى المتحف', 'كم سعر هذا الخبز الطازج؟'],
          correctOptionText: 'إزيك يا باشا؟ عامل إيه؟',
          explanation: '"Ezzayak ya basha" and "3amel eh" are cornerstone warm greetings of Cairo street life.'
        },
        {
          prompt: 'How do you politely ask for the check at an Egyptian eatery or ahwa café?',
          context: 'Ordering & Settling Bill',
          spokenAudio: 'الحساب لو سمحت يا باشا',
          options: ['أعطني ضرائب الحكومة فوراً', 'الحساب لو سمحت يا باشا', 'أنا أمتلك أموالاً كثيرة في جيبي', 'هل هذه الوجبة مجانية تماماً؟'],
          correctOptionText: 'الحساب لو سمحت يا باشا',
          explanation: '"El-hesab law samaht" combined with street titles is standard Cairene manners.'
        },
        {
          prompt: 'If you are looking for the nearest Cairo Metro station in Downtown, how do you ask?',
          context: 'Street Navigation',
          spokenAudio: 'فين محطة المترو لو سمحت؟',
          options: ['أنا تائه بدون بوصلة ومحتار', 'اشرح لي نظرية القطارات البخارية', 'فين محطة المترو لو سمحت؟', 'قف مكانك ولا تتحرك أبداً'],
          correctOptionText: 'فين محطة المترو لو سمحت؟',
          explanation: '"Feen ma7atet el-metro" is how locals ask where a subway station is.'
        },
        {
          prompt: 'How do you gracefully decline a persistent street vendor in Cairo?',
          context: 'Market Etiquette',
          spokenAudio: 'ربنا يسهل يا عم الحاج، شكراً',
          options: ['ابتعد عن طريقي حالاً وإلا اشتكيك', 'ربنا يسهل يا عم الحاج، شكراً', 'أنا أكره بضاعتك تماماً', 'سأشترى كل ما تملك غداً'],
          correctOptionText: 'ربنا يسهل يا عم الحاج، شكراً',
          explanation: '"Rabbena yesahel" is the polite, culturally graceful Egyptian way to decline.'
        }
      ];
    } else {
      rawQuestions = [
        {
          prompt: 'When an Egyptian says: "دقائق وكون عندك", what do they mean in practice?',
          context: 'Egyptian Cultural Timing',
          spokenAudio: 'دقائق وكون عندك في السكة',
          options: ['Strictly within 60 seconds on a stopwatch', 'Sometime shortly (could be 10-15 minutes in Cairo traffic)', 'They have left the country completely', 'They cancelled the meeting entirely'],
          correctOptionText: 'Sometime shortly (could be 10-15 minutes in Cairo traffic)',
          explanation: 'In Cairo street cadence, stating "minutes" is a warm reassurance rather than a strict stopwatch.'
        },
        {
          prompt: 'A Cairo white taxi driver asks: "معاك فكة ولا كاش؟" What is he asking?',
          context: 'Transit & Cash Etiquette',
          spokenAudio: 'معاك فكة ولا مفيش؟',
          options: ['Do you have small change coins/bills for the fare?', 'Do you have two hundred suitcases?', 'Are you travelling with a military escort?', 'Can you exchange foreign currency?'],
          correctOptionText: 'Do you have small change coins/bills for the fare?',
          explanation: '"Fakka" means small change, essential for white cabs in Cairo.'
        }
      ];
    }
  } else if (isFr) {
    rawQuestions = [
      {
        prompt: 'How do Parisian friends informally greet each other and ask how things are going?',
        context: 'Informal Street Greeting',
        spokenAudio: 'Salut ! Ça va ? Ça roule ?',
        options: ['Salut ! Ça va ? Ça roule ?', 'Cher citoyen, veuillez décliner votre identité', 'Je désire réciter le dictionnaire français', 'Quel est le tarif horaire de cette rue ?'],
        correctOptionText: 'Salut ! Ça va ? Ça roule ?',
        explanation: '"Ça roule" is the ubiquitous friendly conversational reflex across Paris.'
      },
      {
        prompt: 'How do you politely ask for the bill at a Parisian bistro or terrace?',
        context: 'Food & Ordering',
        spokenAudio: "L'addition s'il vous plaît !",
        options: ['Donnez-moi les impôts de la république !', "L'addition s'il vous plaît !", 'Je possède des billets en papier dans ma poche', "Combien d'argent avez-vous volé aujourd'hui ?"],
        correctOptionText: "L'addition s'il vous plaît !",
        explanation: '"L\'addition s\'il vous plaît" is the crisp, universal way to settle a table.'
      }
    ];
  } else if (isJa) {
    rawQuestions = [
      {
        prompt: 'How do Tokyo locals naturally greet a friend and ask how things are going?',
        context: 'Informal Everyday Greeting',
        spokenAudio: '元気？最近どう？',
        options: ['元気？最近どう？', '私はロボットではありません', '電車の時刻表を見せてください', 'コンビニエンスストアはどこですか'],
        correctOptionText: '元気？最近どう？',
        explanation: '"Genki? Saikin dou?" is the effortless casual greeting used between peers in Tokyo.'
      },
      {
        prompt: 'How do you politely ask for the check at a ramen shop or casual restaurant?',
        context: 'Dining Etiquette',
        spokenAudio: 'お会計お願いします',
        options: ['この料理は非常にまずいです', 'お会計お願いします', '私は英語しか話せません', 'スープを全部床にこぼしました'],
        correctOptionText: 'お会計お願いします',
        explanation: '"O-kaikei onegaishimasu" is the universal polite phrase for asking for the bill.'
      }
    ];
  } else if (isPt) {
    rawQuestions = [
      {
        prompt: 'How do Rio locals warmly greet someone on the street or beach?',
        context: 'Carioca Street Greeting',
        spokenAudio: 'E aí, beleza? Tudo bem?',
        options: ['Cidadão, apresente seus documentos policiais.', 'E aí, beleza? Tudo bem?', 'Eu desejo recitar as normas gramaticais.', 'Quanto custa a passagem para Lisboa?'],
        correctOptionText: 'E aí, beleza? Tudo bem?',
        explanation: '"E aí, beleza?" is the universal sunny greeting of Rio de Janeiro street life.'
      },
      {
        prompt: 'How do you ask for the check politely at a boteco or beach kiosk?',
        context: 'Dining Etiquette',
        spokenAudio: 'A conta, por favor chefe!',
        options: ['Me entregue os impostos municipais agora!', 'Eu tenho muitas moedas no bolso.', 'Essa comida é gratuita para todos?', 'A conta, por favor chefe!'],
        correctOptionText: 'A conta, por favor chefe!',
        explanation: '"A conta, por favor chefe!" combines respect and warm Brazilian camaraderie.'
      }
    ];
  } else {
    // Default Spanish (Mexican / Colombian)
    rawQuestions = [
      {
        prompt: 'How do locals informally say hello and ask how you are doing?',
        context: 'Informal Street Greeting',
        spokenAudio: '¡Qué onda, compa! ¿Todo bien?',
        options: ['Estimado ciudadano, reporte su condición.', '¡Qué onda, compa! ¿Todo bien?', 'Yo quiero hablar la lengua del país.', '¿Cuál es la regla gramatical número cinco?'],
        correctOptionText: '¡Qué onda, compa! ¿Todo bien?',
        explanation: 'Everyday greetings use warm slang like "qué onda" and "compa".'
      },
      {
        prompt: 'How do you politely ask for the check at a casual cafe or street eatery?',
        context: 'Food & Ordering',
        spokenAudio: 'Disculpe, ¿me trae la cuenta, por favor?',
        options: ['¡Deme la factura del gobierno!', 'Yo poseo dinero para su comida.', 'Disculpe, ¿me trae la cuenta, por favor?', '¿Cuánto dinero tengo que perder hoy?'],
        correctOptionText: 'Disculpe, ¿me trae la cuenta, por favor?',
        explanation: '"La cuenta, por favor" is universally polite and natural.'
      },
      {
        prompt: 'If you get turned around in a neighborhood, how do you ask for directions?',
        context: 'Transit & Navigation',
        spokenAudio: 'Disculpa, ¿por dónde queda el metro más cercano?',
        options: ['¡Ayuda, estoy en peligro de perder el mapa!', 'Deme las coordenadas exactas de longitud.', 'Disculpa, ¿por dónde queda el metro más cercano?', 'Yo deseo caminar en cualquier dirección.'],
        correctOptionText: 'Disculpa, ¿por dónde queda el metro más cercano?',
        explanation: 'Asking "¿por dónde queda...?" is friendly and immediately understood.'
      },
      {
        prompt: 'How do you politely decline something from a persistent street vendor?',
        context: 'Market Etiquette',
        spokenAudio: 'No, muchas gracias, así está bien.',
        options: ['¡Vete de aquí inmediatamente!', 'No tengo interés en sus productos comerciales.', 'No, muchas gracias, así está bien.', 'Cuesta demasiado para mi presupuesto.'],
        correctOptionText: 'No, muchas gracias, así está bien.',
        explanation: '"No, muchas gracias, así está bien" is graceful, firm, and respectful.'
      }
    ];
  }

  return rawQuestions.map(shuffleQuestionOptions);
}
