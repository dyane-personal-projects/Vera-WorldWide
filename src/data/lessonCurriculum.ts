export interface LessonExercise {
  id: number;
  type: 'listening' | 'word_order' | 'context' | 'fill_blank' | 'roleplay' | 'speaking';
  prompt: string;
  nativePhrase?: string;
  audioLang?: string;
  options?: string[];
  correctAnswer: string | string[];
  correctOptionText?: string;
  explanation: string;
  culturalTip: string;
  wordGlossary?: Record<string, string>;
  bossHpDamage?: number;
  isBossBattle?: boolean;
}

function shuffleExerciseOptions(ex: LessonExercise): LessonExercise {
  if (!ex.options || ex.options.length <= 1) return ex;
  const correctText = typeof ex.correctAnswer === 'string' ? ex.correctAnswer : ex.options[0];
  const optionsCopy = [...ex.options];
  
  for (let i = optionsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsCopy[i], optionsCopy[j]] = [optionsCopy[j], optionsCopy[i]];
  }

  return {
    ...ex,
    options: optionsCopy,
    correctAnswer: correctText // We evaluate against correct string text rather than hardcoded array index 0
  };
}

export function getLessonExercises(lessonId: string, dialectId: string): LessonExercise[] {
  const isEs = dialectId.startsWith('es');
  const isFr = dialectId.startsWith('fr');
  const isJa = dialectId.startsWith('ja');
  const isAr = dialectId.startsWith('ar');

  let exercises: LessonExercise[] = [];

  if (lessonId === 'arcade_rapid_fire') {
    if (isFr) {
      exercises = [
        {
          id: 1,
          type: 'listening',
          prompt: 'RAPID FIRE: Decipher the Parisian reaction in under 10 seconds:',
          nativePhrase: "Laisse tomber, c'est mort pour ce soir !",
          audioLang: 'fr-FR',
          options: [
            "Forget it, it's not happening tonight / call it off!",
            "Someone has passed away in the neighborhood.",
            "Can you drop your jacket on the couch?",
            "What time is dinner served?"
          ],
          correctAnswer: "Forget it, it's not happening tonight / call it off!",
          explanation: '"Laisse tomber" and "c\'est mort" are everyday conversational reflexes for "no chance / cancel it".',
          culturalTip: 'Speed in recognizing dropped negatives is crucial in fast Parisian conversation.'
        },
        {
          id: 2,
          type: 'roleplay',
          prompt: 'A friend asks: "T\'es chaud pour bouger là ?" Answer instantly:',
          options: [
            "Grave, je prends mes affaires et j'arrive !",
            "Ma température corporelle est élevée.",
            "Je ne bouge jamais mes pieds.",
            "Quel est le prix du billet de train ?"
          ],
          correctAnswer: "Grave, je prends mes affaires et j'arrive !",
          explanation: '"T\'es chaud" means "Are you down / up for it?", and "Grave" is the ultimate energetic agreement.',
          culturalTip: '"Grave" replaces "absolument" in youth and street French.'
        }
      ];
    } else if (isAr) {
      exercises = [
        {
          id: 1,
          type: 'listening',
          prompt: 'RAPID FIRE: Instant street greeting in Cairo:',
          nativePhrase: 'ازيك يا باشا؟ عامل إيه؟',
          audioLang: 'ar-EG',
          options: [
            'Hey boss! How are you doing? Everything good?',
            'Where is the ticket office for the pyramids?',
            'What is the currency exchange rate today?',
            'Can you open the car door please?'
          ],
          correctAnswer: 'Hey boss! How are you doing? Everything good?',
          explanation: '"Ya basha" and "3amel eh" are the gold standard for friendly Cairene street greetings.',
          culturalTip: 'Using "باشا" (basha) conveys warm respect and street familiarity.'
        }
      ];
    } else {
      exercises = [
        {
          id: 1,
          type: 'listening',
          prompt: 'RAPID FIRE: Instant street reaction in Mexico City:',
          nativePhrase: '¡No inventes güey, te volaste la barda!',
          audioLang: 'es-MX',
          options: [
            'No way bro, you went completely above and beyond / that was insane!',
            'Do not invent stories about the tall wall.',
            'Can you climb over the stadium fence?',
            'I am very upset about your invention.'
          ],
          correctAnswer: 'No way bro, you went completely above and beyond / that was insane!',
          explanation: '"Volarse la barda" is baseball-rooted slang meaning you hit it out of the park.',
          culturalTip: 'Used both for awesome achievements and comical exaggerations.'
        }
      ];
    }
  } else {
    // Default curriculum exercises for L1 through L7
    exercises = [
      {
        id: 1,
        type: 'listening',
        prompt: 'Listen to the native street greeting and pick the true meaning:',
        nativePhrase: '¡Qué onda güey! ¿Dónde le vas a dar?',
        audioLang: dialectId,
        options: [
          'What s up bro! Where are you heading?',
          'What time is the train leaving for town?',
          'How much does this taxi ride cost?',
          'Are you the inspector for this station?'
        ],
        correctAnswer: 'What s up bro! Where are you heading?',
        explanation: 'Everyday casual slang sets an approachable tone.',
        culturalTip: 'Locals use relaxed greetings instead of formal textbook phrases.'
      },
      {
        id: 2,
        type: 'context',
        prompt: 'When someone says: "Me costó un ojo de la cara", what are they saying?',
        options: [
          'It was outrageously overpriced / cost an arm and a leg!',
          'They suffered a double ocular accident.',
          'They purchased sunglasses at the clinic.',
          'They had cosmetic surgery done yesterday.'
        ],
        correctAnswer: 'It was outrageously overpriced / cost an arm and a leg!',
        explanation: 'Idiomatic expressions add vivid local flavor to daily conversations.',
        culturalTip: 'Hyperbole is constantly used in everyday street storytelling.'
      }
    ];
  }

  return exercises.map(shuffleExerciseOptions);
}
