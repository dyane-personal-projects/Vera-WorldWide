export interface LessonExercise {
  id: number;
  type: 'listening' | 'word_order' | 'context' | 'fill_blank' | 'roleplay' | 'speaking';
  prompt: string;
  nativePhrase?: string;
  audioLang?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  culturalTip: string;
  wordGlossary?: Record<string, string>;
  bossHpDamage?: number;
  isBossBattle?: boolean;
}

export interface LessonContent {
  lessonId: string;
  title: string;
  scenarioObjective: string;
  isBossBattle?: boolean;
  bossPersona?: string;
  exercises: LessonExercise[];
}

export function getLessonExercises(lessonId: string, dialectId: string): LessonExercise[] {
  const isEs = dialectId.startsWith('es');
  const isFr = dialectId.startsWith('fr');
  const isJa = dialectId.startsWith('ja');
  const isIt = dialectId.startsWith('it');
  const isPt = dialectId.startsWith('pt');
  const isAr = dialectId.startsWith('ar');
  const isDe = dialectId.startsWith('de');

  // ARCADE: RAPID FIRE MODE (High-speed street reflex test)
  if (lessonId === 'arcade_rapid_fire') {
    if (isFr) {
      return [
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
        },
        {
          id: 3,
          type: 'word_order',
          prompt: 'Assemble: "No problem at all, all good":',
          nativePhrase: "T'inquiète aucun souci mon pote",
          correctAnswer: ["T'inquiète", 'aucun', 'souci', 'mon', 'pote'],
          explanation: '"T\'inquiète" (short for "ne t\'inquiète pas") is spoken non-stop.',
          culturalTip: 'Dropping the "ne" in negative phrases is mandatory for natural rhythm.'
        }
      ];
    } else if (isJa) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'RAPID FIRE: Listen to Tokyo izakaya ordering reflex:',
          nativePhrase: 'とりあえず生ビールふたつで！',
          audioLang: 'ja-JP',
          options: [
            'For now, two draft beers to start please!',
            'Where is the nearest subway exit?',
            'Can we have the bill split in four?',
            'What is the chef’s recommendation?'
          ],
          correctAnswer: 'For now, two draft beers to start please!',
          explanation: '"Toriaezu nama" is the quintessential opening line at any Japanese drinking establishment.',
          culturalTip: 'Ordering drinks first gives the kitchen time to prepare appetizers.'
        },
        {
          id: 2,
          type: 'roleplay',
          prompt: 'Colleague leaving the table: "お先に失礼します" (I am leaving first). Instant reply:',
          options: [
            'お疲れ様でした！気をつけて！ (Great work! Take care!)',
            'さようなら、二度と会いません (Farewell, we will never meet again)',
            '静かにしてください (Please be quiet)',
            '何時ですか (What time is it)'
          ],
          correctAnswer: 'お疲れ様でした！気をつけて！ (Great work! Take care!)',
          explanation: '"Otsukaresama deshita" is the respectful, warm social acknowledgment of someone\'s hard work.',
          culturalTip: 'Never leave without answering this standard social phrase.'
        }
      ];
    } else if (isAr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'RAPID FIRE: Instant street greeting in Cairo:',
          nativePhrase: 'إزيك يا باشا؟ عامل إيه؟ كله تمام؟',
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
        },
        {
          id: 2,
          type: 'roleplay',
          prompt: 'A street vendor greets you warmly: "يا مساء الفل والياسمين! منور الدنيا يا ريس!" Instant reply:',
          options: [
            'مساء الفل يا معلم! بنورك والله، ربنا يخليك!',
            'أنا لا أعرفك ولا أريد الحديث معك.',
            'كم يبلغ ثمن هذا الحذاء القديم؟',
            'سأتصل بشرطة السياحة فوراً.'
          ],
          correctAnswer: 'مساء الفل يا معلم! بنورك والله، ربنا يخليك!',
          explanation: '"بنورك والله وربنا يخليك" is the definitive warm Egyptian counter-greeting.',
          culturalTip: 'In Egypt, returning a compliment with greater warmth ("بنورك") is foundational etiquette.'
        },
        {
          id: 3,
          type: 'word_order',
          prompt: 'Assemble: "One minute and I will be right there with you, on my way!":',
          nativePhrase: 'دقيقة وهكون عندك يا صاحبي في السكة',
          correctAnswer: ['دقيقة', 'وهكون', 'عندك', 'يا', 'صاحبي', 'في', 'السكة'],
          explanation: '"في السكة" (fel-sekka) is the ubiquitous Cairene expression for "on the way".',
          culturalTip: 'Indicates reliable arrival in fast Cairo transit.'
        }
      ];
    } else {
      // Default Spanish Rapid Fire
      return [
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
          explanation: '"Volarse la barda" is baseball-rooted slang meaning you hit it out of the park or did something incredible.',
          culturalTip: 'Used both for awesome achievements and comical exaggerations.'
        },
        {
          id: 2,
          type: 'roleplay',
          prompt: 'Your buddy shouts across the street: "¿Qué pedo carnal, te vas a jalar al toquín?"',
          options: [
            '¡A huevo, ya tengo los boletos en la mano!',
            'Yo no tengo problemas con ningún peatón.',
            'Un toquín es una palabra desconocida.',
            'Llamaré a la autoridad competente.'
          ],
          correctAnswer: '¡A huevo, ya tengo los boletos en la mano!',
          explanation: '"¡A huevo!" expresses energetic confirmation ("Hell yeah!"), and "toquín" is a live music gig.',
          culturalTip: '"Jalarse" means to join in or come along.'
        },
        {
          id: 3,
          type: 'word_order',
          prompt: 'Assemble the lightning street response: "Right away, consider it done!":',
          nativePhrase: 'De volada cuenta con eso hermano',
          correctAnswer: ['De', 'volada', 'cuenta', 'con', 'eso', 'hermano'],
          explanation: '"De volada" means instantly, in a heartbeat, without delay.',
          culturalTip: 'Shows speed and dependable camaraderie.'
        }
      ];
    }
  }

  // ARCADE: 1V1 STREET DEBATE (Boss encounter)
  if (lessonId === 'arcade_debate') {
    if (isAr) {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'CAIRENE DEBATER: "مين قال إن كشري التحرير أحسن من كشري أبو طارق؟ أنت ما بتفهمش في الأكل المصري خالص! أبو طارق هو الملك."',
          options: [
            'يا راجل صلي على النبي! أبو طارق تاريخ وعنده الدقة والشطة الأصلية، بس التحرير عنده صلصة ممتازة وكل واحد وذوقه يا باشا!',
            'أنا لا آكل الكشري لأنه غير صحي.',
            'أنت لا تفهم شيئاً في الطعام.',
            'استسلم، رأيك هو الصحيح.'
          ],
          correctAnswer: 'يا راجل صلي على النبي! أبو طارق تاريخ وعنده الدقة والشطة الأصلية، بس التحرير عنده صلصة ممتازة وكل واحد وذوقه يا باشا!',
          explanation: '"صلي على النبي" calmly diffuses Egyptian debate tension while asserting nuanced local knowledge.',
          culturalTip: 'Mentioning "الدقة والشطة" (garlic sauce & chili) proves you understand authentic koshari culture.'
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'CAIRENE DEBATER: "طب إيه رأيك في الشاي؟ تشرب شاي مية بيضاء زي الخواجات ولا شاي تقيل في الخمسينة يظبط الدماغ؟"',
          options: [
            'شاي في الخمسينة وبنعناع طازة طبعاً يا معلم، عشان الدماغ تتظبط صح!',
            'أفضل شرب الشاي الأخضر البارد فقط.',
            'الشاي يضر بالجهاز الهضمي.',
            'لا تتحدث معي عن المشروبات.'
          ],
          correctAnswer: 'شاي في الخمسينة وبنعناع طازة طبعاً يا معلم، عشان الدماغ تتظبط صح!',
          explanation: 'Ordering tea "في الخمسينة" (strong in a small glass) shows deep mastery of Ahwa Baladi customs.',
          culturalTip: '"يظبط الدماغ" means getting your mind properly focused and clear.'
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'CAIRENE DEBATER (بيضحك ويضربك على كتفك): "جدع وابن بلد بجد! عداك العيب يا صاحبي، قعدة القهوة وحساب الشاي عليا الليلة دي!"',
          options: [
            'تسلم رجولتك يا كبير، ربنا يوسع رزقك ودايماً عامر بحبايبك!',
            'كنت أعلم أنني سأهزمك في هذا الجدال.',
            'أنا لا أقبل الشاي من الغرباء.',
            'حسناً وداعاً أنا ذاهب.'
          ],
          correctAnswer: 'تسلم رجولتك يا كبير، ربنا يوسع رزقك ودايماً عامر بحبايبك!',
          explanation: '"تسلم رجولتك ودايماً عامر" is the warmest street blessing when a peer treats you.',
          culturalTip: 'Closing an argument by bonding over coffee/tea seals lifetime respect in Cairo.'
        }
      ];
    }
    return [
      {
        id: 1,
        type: 'roleplay',
        isBossBattle: true,
        bossHpDamage: 35,
        prompt: 'FIERY DEBATER: "¡Ni de chiste! Las mejores carnitas y tacos del país están en Michoacán, los de la capital no les llegan ni a los talones. Admítelo."',
        options: [
          'En Michoacán nació la tradición maestro, pero en la CDMX se fusionan los sazones de toda la república y el pastor no tiene comparación en el mundo.',
          'Usted no sabe nada de cocina y su opinión no vale nada.',
          'A mí no me gusta comer carne porque es dañina.',
          'Me rindo, lo que usted diga.'
        ],
        correctAnswer: 'En Michoacán nació la tradición maestro, pero en la CDMX se fusionan los sazones de toda la república y el pastor no tiene comparación en el mundo.',
        explanation: 'Conceding the origin while defending the urban melting pot of flavors commands debating respect.',
        culturalTip: 'Debating food with passion and historical knowledge is a beloved national pastime.'
      },
      {
        id: 2,
        type: 'roleplay',
        isBossBattle: true,
        bossHpDamage: 35,
        prompt: 'FIERY DEBATER: "A ver sabelotodo, ¿y qué me dices de la salsa? Aquí si pides sin picante te ven con cara de fuchi. ¿Te aguantas la lumbre o eres de pura salsa dulce?"',
        options: [
          'Échele habanero con cebollita morada compa, aquí no nos rajamos frente a un buen trompo.',
          'La comida picante es un veneno para el estómago humano.',
          'Póngame ketchup americana por favor.',
          'No me hable en ese tono tan grosero.'
        ],
        correctAnswer: 'Échele habanero con cebollita morada compa, aquí no nos rajamos frente a un buen trompo.',
        explanation: '"No rajarse" (never backing down) and ordering habanero earns instant respect at any street stall.',
        culturalTip: 'Never show fear in front of salsa, but pace yourself with cold horchata water.'
      },
      {
        id: 3,
        type: 'roleplay',
        isBossBattle: true,
        bossHpDamage: 30,
        prompt: 'FIERY DEBATER (Riendo con una palmada en la espalda): "¡Ah caray! Me saliste bravo marchante. La siguiente ronda de tacos la invito yo."',
        options: [
          '¡Trato hecho mi hermano, y yo invito las aguas bien frías!',
          'Era mi victoria inevitable desde el inicio.',
          'No acepto regalos de extraños.',
          'Vámonos que ya es tarde.'
        ],
        correctAnswer: '¡Trato hecho mi hermano, y yo invito las aguas bien frías!',
        explanation: 'Returning generosity by offering to pay for the drinks closes the duel with unbreakable street bond.',
        culturalTip: 'Winning a street debate ends with sharing a table and splitting the bill.'
      }
    ];
  }

  // LESSON 1: Street Greetings & First Contact
  if (lessonId === 'l1') {
    if (isFr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to Parisian street verlan and identify the meaning:',
          nativePhrase: "Wesh gros, ça dit quoi aujourd'hui ?",
          audioLang: 'fr-FR',
          options: [
            "Yo bro, what's good today?",
            "Excuse me sir, where is the museum?",
            "What is the total price for lunch?",
            "Can I borrow your bicycle?"
          ],
          correctAnswer: "Yo bro, what's good today?",
          explanation: '"Wesh" (from Algerian Arabic) and "gros" are ubiquitous urban French youth greetings.',
          culturalTip: 'Saying "Ça dit quoi ?" is the Parisian street equivalent of "What\'s up?".',
          wordGlossary: { 'wesh': 'yo/what up', 'gros': 'bro/dude', 'ça dit quoi': "what's the word" }
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble the authentic greeting: "Quiet day, chilling out with friends":',
          nativePhrase: 'Tranquille on se pose au calme',
          correctAnswer: ['Tranquille', 'on', 'se', 'pose', 'au', 'calme'],
          explanation: '"Se poser au calme" means kicking back and relaxing without stress.',
          culturalTip: '"Tranquille" is constantly shortened as a single-word greeting acknowledgment.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'A friend hugs you and says: "Ça fait un bail !" What are they noting?',
          options: [
            'It’s been a really long time since we last saw each other!',
            'They are offering to lease an apartment to you.',
            'They are complaining about the hot summer weather.',
            'They forgot your legal name.'
          ],
          correctAnswer: 'It’s been a really long time since we last saw each other!',
          explanation: '"Ça fait un bail" is the colloquial French idiom for "long time no see".',
          culturalTip: 'Much more natural with friends than textbook "Cela fait longtemps que nous ne nous sommes pas vus".'
        },
        {
          id: 4,
          type: 'roleplay',
          prompt: 'Your Parisian colleague bumps into you at the metro: "Ça roule ?" Best instant reply:',
          options: [
            'Trankil, et toi la forme ?',
            'Mes roues de véhicule tournent avec régularité.',
            'Je refuse de participer à cette conversation.',
            'Quel est le numéro de mon quai ?'
          ],
          correctAnswer: 'Trankil, et toi la forme ?',
          explanation: '"Trankil, et toi la forme ?" matches their casual energy perfectly.',
          culturalTip: 'Never give formal long speeches to casual greetings; keep it bouncy and warm.'
        }
      ];
    } else if (isJa) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to this natural Tokyo casual greeting:',
          nativePhrase: 'よっ！久しぶり！最近どうよ？',
          audioLang: 'ja-JP',
          options: [
            "Hey! Long time no see! How've things been lately?",
            "Good morning teacher, here is my homework.",
            "Please show me the train platform timetable.",
            "Is the convenience store still open tonight?"
          ],
          correctAnswer: "Hey! Long time no see! How've things been lately?",
          explanation: '"Yo! Hisashiburi!" is the casual everyday greeting between friends in Tokyo.',
          culturalTip: 'Textbooks teach "Konnichiwa", but peers and friends almost always greet with "Hisashiburi!" or "Yaa!".'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble: "Everything is going well, staying busy":',
          nativePhrase: '相変わらず元気にやってるよ',
          correctAnswer: ['相変わらず', '元気に', 'やってるよ'],
          explanation: '"Aikawarazu" means "as always / same as ever", a quintessential Japanese reply.',
          culturalTip: 'Adding the "yo" particle gives a friendly conversational cadence.'
        },
        {
          id: 3,
          type: 'fill_blank',
          prompt: 'Complete the casual parting formula: "See you next week without fail!":',
          nativePhrase: 'じゃあまた___ね！気をつけて！',
          options: ['来週', '昨日', '去年', '世紀'],
          correctAnswer: '来週',
          explanation: '"Jaa mata raishuu ne" is how friends wrap up meetups.',
          culturalTip: 'A quick bow and wave accompanying "Jaa mata!" shows effortless familiarity.'
        }
      ];
    } else if (isPt) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the laid-back Carioca beach greeting:',
          nativePhrase: 'Fala meu parceiro! Tranquilidade total por aí?',
          audioLang: 'pt-BR',
          options: [
            'What’s up my partner! Everything completely chill on your side?',
            'What is the price of a coconut at the boardwalk kiosk?',
            'Can you guide me towards the football stadium?',
            'Did the rain stop over the coastline?'
          ],
          correctAnswer: 'What’s up my partner! Everything completely chill on your side?',
          explanation: '"Tranquilidade" and "fala meu parceiro" are hallmark Rio greetings.',
          culturalTip: 'Warm physical gestures (a light hug or arm-clasp) always match spoken greetings in Rio.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble: "Smooth sailing, relaxing on the beach":',
          nativePhrase: 'Tudo suave curtindo a praia',
          correctAnswer: ['Tudo', 'suave', 'curtindo', 'a', 'praia'],
          explanation: '"Suave" and "curtir" are foundational Brazilian slang words.',
          culturalTip: '"Curtir" means enjoying, digging, or loving an experience.'
        }
      ];
    } else if (isAr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the Cairene street greeting and pick the true meaning:',
          nativePhrase: 'إزيك يا باشا؟ عامل إيه في الحر ده؟',
          audioLang: 'ar-EG',
          options: [
            'How are you doing boss? How are you handling this heat?',
            'Where is the entrance to the Egyptian museum?',
            'How many kilometers to the pyramids?',
            'What is the price of this traditional bread?'
          ],
          correctAnswer: 'How are you doing boss? How are you handling this heat?',
          explanation: '"Ezzayak ya basha" and "3amel eh" are the gold standard for friendly everyday Cairene greetings.',
          culturalTip: 'Standard textbooks teach "Kaifa haluka", but on Cairo streets everyone says "Ezzayak ya basha!" or "Ya rayyes!".',
          wordGlossary: { 'إزيك': 'how are you', 'يا باشا': 'boss/chief', 'عامل إيه': 'what are you up to' }
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble the street reply: "Everything is great, thank God, my brother":',
          nativePhrase: 'كله تمام والحمد لله يا صاحبي',
          correctAnswer: ['كله', 'تمام', 'والحمد', 'لله', 'يا', 'صاحبي'],
          explanation: '"Kollo tamam wel-7amdulillah" is the most natural, reassuring Egyptian greeting reply.',
          culturalTip: 'Egyptians universally add "الحمد لله" (praise be to God) when stating that things are going well.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'When greeting a taxi driver, shopkeeper, or waiter in Cairo, addressing them as "يا باشا" (Ya Basha) or "يا ريس" (Ya Rayyes) accomplishes what?',
          options: [
            'Establishes instant warm rapport and respectful street etiquette.',
            'Offends them by referencing historical Ottoman titles.',
            'Tells them you are a high-ranking government official.',
            'Demands a mandatory 50% discount on all prices.'
          ],
          correctAnswer: 'Establishes instant warm rapport and respectful street etiquette.',
          explanation: '"Basha" (Pasha) and "Rayyes" (Captain/Boss) are affectionate street titles used to show warm deference and friendliness.',
          culturalTip: 'Using street titles shows you understand local culture and aren’t just reading from a tourist guidebook.'
        },
        {
          id: 4,
          type: 'roleplay',
          prompt: 'Your Egyptian friend spots you at a café and calls out: "يا سيدي الفل والياسمين! فينك يا راجل ما بتسألش؟" Best reply:',
          options: [
            'يا حبيبي حقك عليا، مشاغل والله، بس أنت دايماً على البال!',
            'أنا لا أريد التحدث معك الآن.',
            'كم يبلغ ثمن فنجان الشاي؟',
            'أنا لا أعرف معنى الفل والياسمين.'
          ],
          correctAnswer: 'يا حبيبي حقك عليا، مشاغل والله، بس أنت دايماً على البال!',
          explanation: '"حقك عليا ودايماً على البال" (My apologies, life has been busy, but you are always on my mind) is warm Egyptian social diplomacy.',
          culturalTip: 'Affectionate banter and teasing about being out of touch is a sign of deep friendship in Egypt.'
        }
      ];
    } else {
      // Mexican & Latin Spanish
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the native street greeting and pick the true meaning:',
          nativePhrase: '¡Qué onda güey! ¿A dónde le vas a dar?',
          audioLang: 'es-MX',
          options: [
            'What’s up bro! Where are you heading?',
            'What time is the train leaving for town?',
            'How much does this taxi ride cost?',
            'Are you the inspector for this station?'
          ],
          correctAnswer: 'What’s up bro! Where are you heading?',
          explanation: '"¡Qué onda!" and "güey" are quintessential everyday Mexican street vernacular.',
          culturalTip: 'Standard textbooks teach "¿Cómo está usted?", but on the streets of CDMX, friends always use "¡Qué onda!".',
          wordGlossary: { 'onda': 'vibe/wave', 'güey': 'dude/bro', 'le vas a dar': 'you heading to' }
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Tap the words in order to say: "Everything good, just hanging out here!":',
          nativePhrase: 'Todo bien aquí nomás echando relajo',
          correctAnswer: ['Todo', 'bien', 'aquí', 'nomás', 'echando', 'relajo'],
          explanation: '"Echar relajo" is spoken slang for hanging out or chilling with friends.',
          culturalTip: '"Nomás" is used continuously instead of "solamente" in casual conversation.'
        },
        {
          id: 3,
          type: 'fill_blank',
          prompt: 'Complete the sentence with the warm regional diminutive:',
          nativePhrase: 'Hola ___ ¿cómo te fue hoy en la chamba?',
          options: ['carnal', 'señor feudal', 'extranjero', 'ciudadano'],
          correctAnswer: 'carnal',
          explanation: '"Carnal" comes from "carne" (blood/brother) and denotes a close trusted friend.',
          culturalTip: 'Calling someone "carnal" shows mutual warmth and street camaraderie.'
        },
        {
          id: 4,
          type: 'speaking',
          prompt: 'Pronounce this natural casual comeback with local cadence:',
          nativePhrase: '¡Todo al cien mi hermano!',
          audioLang: 'es-MX',
          options: [
            'Everything is 100% / running great my brother!',
            'I have one hundred coins in my pocket.',
            'The weather is one hundred degrees.'
          ],
          correctAnswer: 'Everything is 100% / running great my brother!',
          explanation: '"Al cien" means running at 100% capacity / doing fantastic.',
          culturalTip: 'Confidence and relaxed cadence communicate street fluency instantly.'
        }
      ];
    }
  }

  // LESSON 2: Transport, Hailing Cabs & Directions
  if (lessonId === 'l2') {
    if (isFr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to Parisian transport directions:',
          nativePhrase: "Prends la ligne 4 et change à Châtelet, c'est direct !",
          audioLang: 'fr-FR',
          options: [
            "Take line 4 and transfer at Châtelet, it's direct!",
            "Buy four tickets before entering the bus.",
            "The metro is completely closed for renovations.",
            "You must take a taxi to reach Châtelet."
          ],
          correctAnswer: "Take line 4 and transfer at Châtelet, it's direct!",
          explanation: 'Châtelet-Les Halles is Paris’s central transport hub. Navigating transfers smoothly is key.',
          culturalTip: 'Navigo passes and metro lines are referred to by simple number ("la 4", "la 14").'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble: "Drop me off right in front of the bakery, please":',
          nativePhrase: "Laissez-moi juste devant la boulangerie s'il vous plaît",
          correctAnswer: ['Laissez-moi', 'juste', 'devant', 'la', 'boulangerie', "s'il", 'vous', 'plaît'],
          explanation: '"Juste devant" is the natural spoken phrase for "right in front of".',
          culturalTip: 'Cab and Uber drivers in Paris appreciate clear, brief landmark directions.'
        }
      ];
    } else if (isJa) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to cab directions in central Tokyo:',
          nativePhrase: 'すみません、新宿駅の南口までお願いできますか？',
          audioLang: 'ja-JP',
          options: [
            'Excuse me, could you take me to the South Exit of Shinjuku Station?',
            'What time does the midnight subway stop running?',
            'Where can I purchase a bullet train ticket?',
            'How much is a rental bicycle for two hours?'
          ],
          correctAnswer: 'Excuse me, could you take me to the South Exit of Shinjuku Station?',
          explanation: '"Minamiguchi" (South Exit) and "onegai dekimasu ka" is standard polite cab communication.',
          culturalTip: 'Tokyo taxi rear doors open automatically; never touch the door handle yourself.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Direct the driver: "Right before the traffic light is fine, please!":',
          nativePhrase: 'あの信号の手前で大丈夫です',
          correctAnswer: ['あの', '信号の', '手前で', '大丈夫です'],
          explanation: '"Temae de daijoubu desu" is the standard phrase for "right before [landmark] is fine".',
          culturalTip: 'Saying this with polite inflection signals an effortless local cadence.'
        }
      ];
    } else if (isPt) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Hailing a taxi in Rio. Listen to the driver’s question:',
          nativePhrase: 'Bora chefe! Pega a Linha Vermelha ou vai por dentro?',
          audioLang: 'pt-BR',
          options: [
            'Let’s go boss! Take the expressway (Linha Vermelha) or through local streets?',
            'Do you want to split this ride with another passenger?',
            'The road to the beach is blocked for carnival.',
            'What is the license number of your destination?'
          ],
          correctAnswer: 'Let’s go boss! Take the expressway (Linha Vermelha) or through local streets?',
          explanation: '"Linha Vermelha" is Rio’s major arterial route. Drivers always ask for route preference.',
          culturalTip: 'Confirming if they use the meter ("no taxímetro") avoids inflated flat rates.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble: "Drop me off right by the hotel entrance, please":',
          nativePhrase: 'Pode me deixar bem na porta do hotel por favor',
          correctAnswer: ['Pode', 'me', 'deixar', 'bem', 'na', 'porta', 'do', 'hotel', 'por', 'favor'],
          explanation: '"Bem na porta" means right in front of the door/entrance.',
          culturalTip: '"Pode me deixar" is the everyday conversational formula in Brazil.'
        }
      ];
    } else if (isAr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'A Cairo white cab pulls up and rolls down the window. Listen:',
          nativePhrase: 'يا أسطى، على وسط البلد لو سمحت؟ الشارع سالك ولا في زحمة كالعادة؟',
          audioLang: 'ar-EG',
          options: [
            'Driver, to Downtown please? Is the street moving or jammed as usual?',
            'Can you take me to the airport for five dollars?',
            'What year was this taxi manufactured?',
            'Where is the nearest police station?'
          ],
          correctAnswer: 'Driver, to Downtown please? Is the street moving or jammed as usual?',
          explanation: '"Ya osta" is the respectful title for drivers, and "salek" means traffic is flowing smoothly.',
          culturalTip: 'Cairenes never get into a cab without stating the destination through the passenger window first.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble the cash query: "Do you have change, boss, or only a two-hundred-pound bill?":',
          nativePhrase: 'معاك فكة يا باشا ولا ورقة بميتين؟',
          correctAnswer: ['معاك', 'فكة', 'يا', 'باشا', 'ولا', 'ورقة', 'بميتين؟'],
          explanation: 'Asking "معاك فكة" (do you have change) avoids awkward deadlocks when paying with large bills.',
          culturalTip: 'Small bills (10, 20, 50 LE) are essential when traveling through Cairo in white cabs.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'The driver asks: "أنزلك عند محطة المترو ولا أدخل جوة الشارع؟" What is the best practical reply?',
          options: [
            'عند محطة المترو على جنب هنا لو سمحت، الحساب كام يا أسطى؟',
            'أنا لا أحب السفر في المترو.',
            'اذهب إلى مدينة أخرى فوراً.',
            'ادخل إلى داخل متجر الملابس بالسيارة.'
          ],
          correctAnswer: 'عند محطة المترو على جنب هنا لو سمحت، الحساب كام يا أسطى؟',
          explanation: 'Asking to be dropped on the side ("على جنب هنا") and inquiring about the fare ("الحساب كام يا أسطى") is authentic.',
          culturalTip: 'Saying "على جنب" (on the side) is the standard signal to pull over in Arab transit.'
        }
      ];
    } else {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'A taxi driver rolls down his window. Listen and decode his question:',
          nativePhrase: '¿A dónde va patrón? ¿Trae cambio o puro billete?',
          audioLang: 'es-MX',
          options: [
            'Where to boss? Do you have change or only big bills?',
            'How many children are traveling in your family?',
            'Do you possess a passport for this neighborhood?',
            'What is the license number of this cab?'
          ],
          correctAnswer: 'Where to boss? Do you have change or only big bills?',
          explanation: 'Mexican drivers often struggle with small change; asking "trae cambio" is standard.',
          culturalTip: 'Always carry 20 and 50 peso bills when navigating local transport in Mexico.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Direct the driver: "Drop me off right on the next corner, please":',
          nativePhrase: 'Me deja en la mera esquina porfa',
          correctAnswer: ['Me', 'deja', 'en', 'la', 'mera', 'esquina', 'porfa'],
          explanation: '"La mera esquina" emphasizes right on the very corner.',
          culturalTip: '"Porfa" instead of "por favor" makes you sound immediately like a local regular.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'Before getting into an unmetered taxi, what is the #1 rule to avoid the tourist surcharge?',
          options: [
            'Confirm the total fare price BEFORE sitting down inside the cab.',
            'Get inside silently and argue about the price after arriving.',
            'Pay in foreign currency with a massive smile.',
            'Hand the driver your wallet and let him pick out bills.'
          ],
          correctAnswer: 'Confirm the total fare price BEFORE sitting down inside the cab.',
          explanation: 'Always ask: "¿Cuánto me cobra a...?" before getting in.',
          culturalTip: 'Locals never get into an unmetered taxi without locking the price first.'
        },
        {
          id: 4,
          type: 'fill_blank',
          prompt: 'Complete the direction: "Turn right at the traffic light":',
          nativePhrase: 'Vas a dar vuelta a la ___ en el semáforo.',
          options: ['derecha', 'luna', 'montaña', 'espalda'],
          correctAnswer: 'derecha',
          explanation: '"Dar vuelta a la derecha" is how locals give turn directions.',
          culturalTip: 'Drivers appreciate exact visual landmarks like "en el semáforo" or "pasando el Oxxo".'
        }
      ];
    }
  }

  // LESSON 3: Ordering Local Street Food
  if (lessonId === 'l3') {
    if (isFr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'The Parisian artisan boulanger asks for your order. Listen closely:',
          nativePhrase: 'Bonjour ! Une tradition pas trop cuite et deux croissants au beurre ?',
          audioLang: 'fr-FR',
          options: [
            'Hello! One lightly-baked tradition baguette and two butter croissants?',
            'Are you looking for the nearest train platform?',
            'We are out of coffee for the morning.',
            'Please pay with an American check.'
          ],
          correctAnswer: 'Hello! One lightly-baked tradition baguette and two butter croissants?',
          explanation: 'Asking for a baguette "pas trop cuite" or "bien dorée" is how Parisians specify crust bake.',
          culturalTip: 'Always greet with a clear "Bonjour Madame/Monsieur" before announcing what you want.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Order at the café counter: "An espresso at the counter, please":',
          nativePhrase: "Un café serré au comptoir s'il vous plaît",
          correctAnswer: ['Un', 'café', 'serré', 'au', 'comptoir', "s'il", 'vous', 'plaît'],
          explanation: '"Au comptoir" (standing at the zinc bar) is cheaper and faster than sitting at a table.',
          culturalTip: 'Drinking espresso standing at the zinc bar is a quintessential morning French ritual.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'When ordering at a Parisian bistro, what is the best way to ask for the bill?',
          options: [
            '"L\'addition s\'il vous plaît" with a polite nod.',
            'Wave your napkin aggressively above your head.',
            'Yell "Garçon!" across the dining room.',
            'Walk out into the street and wait for them to find you.'
          ],
          correctAnswer: '"L\'addition s\'il vous plaît" with a polite nod.',
          explanation: '"L\'addition s\'il vous plaît" is the only polite formula; shouting "Garçon" is archaic and rude.',
          culturalTip: 'Waiters respect calm eye contact and a gentle "L\'addition s\'il vous plaît".'
        }
      ];
    } else if (isJa) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'The ramen chef calls out from behind the counter:',
          nativePhrase: 'いらっしゃい！麺のかたさはどうしましょう？',
          audioLang: 'ja-JP',
          options: [
            'Welcome! How would you like the noodle firmness?',
            'Please finish your meal within five minutes.',
            'We are currently out of pork broth.',
            'Where are you traveling from today?'
          ],
          correctAnswer: 'Welcome! How would you like the noodle firmness?',
          explanation: '"Men no katasa" refers to noodle firmness (katame = firm, futsuu = standard).',
          culturalTip: 'Asking for "katame" (firm) keeps the noodles from getting soggy in hot tonkotsu broth.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble your order: "Tonkotsu ramen, firm noodles please":',
          nativePhrase: '豚骨ラーメン麺固めでお願いします',
          correctAnswer: ['豚骨ラーメン', '麺固めで', 'お願いします'],
          explanation: '"Katame de onegai shimasu" is the classic ramen enthusiast order.',
          culturalTip: 'Slurping noodles loudly is considered a sign of savoring the chef’s broth.'
        }
      ];
    } else if (isPt) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Street vendor at the beach or feira calls out:',
          nativePhrase: 'Pastel sequinho e crocante na hora! Que sabor vai querer?',
          audioLang: 'pt-BR',
          options: [
            'Fresh, crispy pastel made on the spot! What flavor would you like?',
            'The beach umbrellas are closed for today.',
            'Do you want to purchase a postcard of Rio?',
            'How many kilometers to the stadium?'
          ],
          correctAnswer: 'Fresh, crispy pastel made on the spot! What flavor would you like?',
          explanation: '"Pastel de feira" is Brazil’s ultimate street snack, paired with sugarcane juice (caldo de cana).',
          culturalTip: 'Pastel de carne (seasoned beef) and queijo (melted cheese) are the two beloved staples.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Order like a local: "One meat pastel and a cold sugarcane juice, please":',
          nativePhrase: 'Um pastel de carne e um caldo de cana bem gelado por favor',
          correctAnswer: ['Um', 'pastel', 'de', 'carne', 'e', 'um', 'caldo', 'de', 'cana', 'bem', 'gelado', 'por', 'favor'],
          explanation: '"Bem gelado" specifies ice cold, crucial in tropical Brazilian heat.',
          culturalTip: 'Add a dash of hot pepper oil ("pimentinha") from the counter if you like heat.'
        }
      ];
    } else if (isAr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'At a Cairo koshari counter or street ahwa, listen to the order:',
          nativePhrase: 'علبة كشري ميكس، وكتر الدقة والشطة لو سمحت',
          audioLang: 'ar-EG',
          options: [
            'A mixed koshari bowl, and go heavy on the garlic sauce and hot chili please',
            'Can I have a cup of black coffee without milk?',
            'Where can I purchase Egyptian souvenir stamps?',
            'Do you serve Italian pasta in this shop?'
          ],
          correctAnswer: 'A mixed koshari bowl, and go heavy on the garlic sauce and hot chili please',
          explanation: '"Daqqa" (tangy garlic-vinegar sauce) and "shatta" (spicy red chili sauce) define authentic koshari.',
          culturalTip: 'Saying "كتر الدقة والشطة" (go heavy on the garlic and chili) proves you eat like an authentic Cairene.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Order the iconic Egyptian tea: "One strong tea in a small glass with mint, master":',
          nativePhrase: 'شاي في الخمسينة بالنعناع لو سمحت يا معلم',
          correctAnswer: ['شاي', 'في', 'الخمسينة', 'بالنعناع', 'لو', 'سمحت', 'يا', 'معلم'],
          explanation: '"Shay fel-5amseenah" means strong black tea brewed with precision in a small glass tumbler.',
          culturalTip: 'Egyptians sip tea from glasses rather than mugs to appreciate the color and warmth.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'In an Egyptian street restaurant or ahwa baladi, how do you politely request the bill with warm blessings?',
          options: [
            'الحساب لو سمحت يا باشا، ربنا يخليك!',
            'أعطني المال الآن وإلا سأغادر.',
            'أين المطار الدولي؟',
            'هذا الحساب غير صحيح وسأشتكي للمدير.'
          ],
          correctAnswer: 'الحساب لو سمحت يا باشا، ربنا يخليك!',
          explanation: '"El-7esab law sama7t ya basha, rabbena yi5alleek" asks for the check with traditional Egyptian hospitality.',
          culturalTip: 'Adding "ربنا يخليك" (may God preserve you) is universally appreciated by working locals.'
        }
      ];
    } else {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'The street food cook calls out to you. Listen to what he says:',
          nativePhrase: '¡Pásele marchante! ¿Qué le servimos? ¿Con copia o sencilla?',
          audioLang: 'es-MX',
          options: [
            'Step right up! What can I get you? Double tortilla or single?',
            'Do you want a photocopied menu of our historical dishes?',
            'Are you looking for employment in our kitchen?',
            'Do you have a license to eat on this sidewalk?'
          ],
          correctAnswer: 'Step right up! What can I get you? Double tortilla or single?',
          explanation: '"Con copia" in street taco slang means a double tortilla so heavy meat doesn\'t tear through!',
          culturalTip: 'Knowing what "con copia" means is a hallmark of someone who truly knows street dining.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Order like a native: "Two tacos al pastor, with cilantro and pineapple, crispy please":',
          nativePhrase: 'Dos de pastor con piña bien doraditos porfa',
          correctAnswer: ['Dos', 'de', 'pastor', 'con', 'piña', 'bien', 'doraditos', 'porfa'],
          explanation: 'Diminutives like "doraditos" express culinary preference politely.',
          culturalTip: 'Street cooks take pride when customers ask for meat "bien doradito" (crispy edges).'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'Before dipping salsa, you ask the taquero: "¿Pica mucho esta verde?" He responds: "No pica casi nada." What should you expect?',
          options: [
            'It is likely still spicy! Mexican locals have high tolerance; test a small drop first.',
            'It tastes like sweet strawberry juice with zero spice.',
            'It will put out any fire in the room.',
            'It is strictly for decoration and cannot be consumed.'
          ],
          correctAnswer: 'It is likely still spicy! Mexican locals have high tolerance; test a small drop first.',
          explanation: 'When a local vendor says salsa doesn\'t burn, it still contains jalapeño or serrano!',
          culturalTip: 'Always spoon a drop onto your plate first to gauge heat before dousing your taco.'
        },
        {
          id: 4,
          type: 'fill_blank',
          prompt: 'Ask what beverage flavors are available today:',
          nativePhrase: 'Disculpe, ¿de qué sabores tiene las aguas ___?',
          options: ['frescas', 'saladas', 'hirviendo', 'congeladas'],
          correctAnswer: 'frescas',
          explanation: '"Aguas frescas" (horchata, jamaica, tamarindo) are traditional fruit infusions.',
          culturalTip: 'Order an "agua de horchata" if your mouth is burning from chili.'
        }
      ];
    }
  }

  // BOSS BATTLE 1: The Hardline Transit Inspector
  if (lessonId === 'b1') {
    if (isFr) {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'CONTRÔLEUR RATP: "Bonjour, contrôle des titres de transport. Votre pass Navigo n\'a pas bippé au portillon, vous êtes en infraction."',
          options: [
            "Bonjour monsieur. La borne 4 affichait un écran noir en panne, c'est pour cela que je me dirigeais directement vers votre guichet pour régulariser.",
            "Vous êtes un voleur et je refuse de vous parler !",
            "Je ne paie jamais dans le métro parisien.",
            "Prenez mes chaussures et laissez-moi partir."
          ],
          correctAnswer: "Bonjour monsieur. La borne 4 affichait un écran noir en panne, c'est pour cela que je me dirigeais directement vers votre guichet pour régulariser.",
          explanation: "Politely citing the broken machine and showing proactive intent to regularize diffuses confrontation immediately.",
          culturalTip: "Addressing Parisian transit officers as 'Monsieur' with calm politeness ensures cooperation."
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'CONTRÔLEUR RATP: "Mmm, montrez-moi votre reçu digital sur votre téléphone pour prouver votre bonne foi."',
          options: [
            "Voici mon reçu d'abonnement mensuel validé ce matin à 8h30 sur l'application Île-de-France Mobilités.",
            "Mon téléphone est un objet privé, vous n'avez aucun droit.",
            "Je préfère payer l'amende en liquide sans reçu.",
            "Je vais crier très fort dans la station."
          ],
          correctAnswer: "Voici mon reçu d'abonnement mensuel validé ce matin à 8h30 sur l'application Île-de-France Mobilités.",
          explanation: "Producing prompt digital validation clears all doubt of fare evasion.",
          culturalTip: "Keep your digital receipt or Navigo notification handy when traveling through major Paris hubs."
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'CONTRÔLEUR RATP (Souriant en validant le badge): "C\'est tout bon, l\'incident technique est confirmé sur la borne. Bonne journée et bon trajet !"',
          options: [
            "Merci beaucoup pour votre aide monsieur le contrôleur, bonne fin de service à vous !",
            "C'était bien la peine de me faire perdre mon temps.",
            "Au revoir sans façon.",
            "Je vais déposer une plainte officielle."
          ],
          correctAnswer: "Merci beaucoup pour votre aide monsieur le contrôleur, bonne fin de service à vous !",
          explanation: "Ending on 'Bonne fin de service' leaves great mutual respect.",
          culturalTip: "Wishing workers 'bonne fin de service' or 'bon courage' marks effortless French social fluency."
        }
      ];
    } else if (isJa) {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: '駅員さん: "お客様、改札口でエラー音が鳴りました。切符の乗車区間を確認させていただけますか？"',
          options: [
            "すみません！急いでいて乗り越し精算の手続きを忘れてしまいました。不足分をこちらで精算させていただけますか？",
            "私は外国人なのでルールは関係ありません！",
            "切符はゴミ箱に捨ててしまいました。",
            "なぜ私を止めるのですか、失礼です！"
          ],
          correctAnswer: "すみません！急いでいて乗り越し精算の手続きを忘れてしまいました。不足分をこちらで精算させていただけますか？",
          explanation: "Apologizing promptly with 'sumimasen' and asking for 'norikoshi seisan' (fare adjustment) solves the issue smoothly.",
          culturalTip: "Station staff in Japan appreciate immediate honesty and respectful Keigo."
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: '駅員さん: "かしこまりました。どちらの駅からご乗車されましたでしょうか？"',
          options: [
            "渋谷駅から乗車いたしました。不足の200円を現金でお支払いいたします。",
            "秘密の場所から乗りました。",
            "どこでも同じ運賃のはずです。",
            "覚えていません。"
          ],
          correctAnswer: "渋谷駅から乗車いたしました。不足の200円を現金でお支払いいたします。",
          explanation: "Stating the origin station clearly allows instant calculation.",
          culturalTip: "Handing over coins with two hands into the tray shows classic Japanese courtesy."
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: '駅員さん (領収証を手渡しながら): "はい、精算完了いたしました。ご協力ありがとうございました！お気をつけて！"',
          options: [
            "ご丁寧に対応いただき誠にありがとうございました！助かりました！",
            "やっと終わった、遅いですね。",
            "領収証はいりません、捨ててください。",
            "さようなら。"
          ],
          correctAnswer: "ご丁寧に対応いただき誠にありがとうございました！助かりました！",
          explanation: "Expressing gratitude ('Tasukarimashita!') leaves the station master deeply impressed by your cultural command.",
          culturalTip: "A light bow and warm thank-you seals standard Tokyo social grace."
        }
      ];
    } else if (isPt) {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'FISCAL DE LINHA: "Ô camarada, a catraca apitou aqui. Esse bilhete não tá com a integração liberada."',
          options: [
            "Boa tarde chefe! A máquina do ponto final tava reiniciando o sistema, vim direto falar contigo pra validar certinho.",
            "Você é um folgado e eu não vou pagar nada !",
            "Eu pulo a roleta se eu quiser.",
            "Chame a polícia militar agora."
          ],
          correctAnswer: "Boa tarde chefe! A máquina do ponto final tava reiniciando o sistema, vim direto falar contigo pra validar certinho.",
          explanation: "Calling the officer 'chefe' and explaining the rebooted terminal turns an adversarial situation into mutual cooperation.",
          culturalTip: "Brazilians prioritize empathy and 'jeitinho'; respectful warmth solves 99% of bureaucratic hitches."
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'FISCAL DE LINHA: "Deixa eu bater o cartão aqui no leitor manual pra checar se é verdade."',
          options: [
            "Tranquilo irmão, tá aqui na mão. Recarreguei vinte reais hoje de manhã no aplicativo.",
            "Não encoste as mãos no meu cartão de plástico.",
            "Eu vou embora correndo pela porta dos fundos.",
            "Quanto custa a sua propina ?"
          ],
          correctAnswer: "Tranquilo irmão, tá aqui na mão. Recarreguei vinte reais hoje de manhã no aplicativo.",
          explanation: "Providing your card calmly and explaining the digital recharge establishes complete credibility.",
          culturalTip: "'Tá aqui na mão' is the natural everyday idiom for handing something over."
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'FISCAL DE LINHA (Sorrindo e liberando a roleta): "Prontinho meu parceiro, tá liberado! Segue viagem com Deus."',
          options: [
            "Valeu demais chefe, levo fé no seu trabalho! Bom plantão aí pra você!",
            "Já era hora, serviço enrolado.",
            "Não falo com fiscais.",
            "Adeus."
          ],
          correctAnswer: "Valeu demais chefe, levo fé no seu trabalho! Bom plantão aí pra você!",
          explanation: "'Bom plantão aí pra você' wishes him an easy work shift, closing with genuine Brazilian warmth.",
          culturalTip: "Leaving with a light fistbump or nod builds great everyday rapport in Rio."
        }
      ];
    } else if (isAr) {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'أمين الشرطة في ميدان التحرير: "رخصك يا أسطى، وأنت يا أستاذ بطاقتك لو سمحت! إيه اللي موقفكم في وسط الميدان كده ومعطلين السير؟"',
          options: [
            'مساء الفل يا فندم وربنا يقويك على الخدمة! اتفضل البطاقة، والتاكسي كان بيعديني الشارع بس ومسافة السكة ومش هتعطل ثانية!',
            'أنت لا يحق لك تفتيشي وسأتصل بالسفارة الأمريكية!',
            'أنا لا أحمل أي هوية ولن أريك شيئاً.',
            'خذ كل أموالي ودعني أذهب.'
          ],
          correctAnswer: 'مساء الفل يا فندم وربنا يقويك على الخدمة! اتفضل البطاقة، والتاكسي كان بيعديني الشارع بس ومسافة السكة ومش هتعطل ثانية!',
          explanation: '"ربنا يقويك على الخدمة ومسافة السكة" shows instant respect for police authority while explaining politely.',
          culturalTip: 'Egyptian traffic officers appreciate calm, respectful street greetings ("ربنا يقويك يا باشا").'
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'أمين الشرطة: "طب والشنطة اللي في إيدك دي فيها إيه؟ واخدها وماشي بيها على فين في الزحمة دي؟"',
          options: [
            'دي حاجات هدايا وحلويات شرقية جايبها للحبايب يا باشا، اتفضل افتحها وشوفها بنفسك وكل سنة وحضرتك طيب!',
            'هذه أسرار عسكرية ولا شأن لك بها.',
            'لا تتدخل في خصوصياتي الشخصية.',
            'أنا خائف جداً ولن أرد عليك.'
          ],
          correctAnswer: 'دي حاجات هدايا وحلويات شرقية جايبها للحبايب يا باشا، اتفضل افتحها وشوفها بنفسك وكل سنة وحضرتك طيب!',
          explanation: 'Offering transparency with a welcoming smile ("اتفضل شوفها بنفسك وكل سنة وحضرتك طيب") diffuses suspicion.',
          culturalTip: 'Being open and friendly is the fastest way to resolve informal security checks in Cairo.'
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'أمين الشرطة (بيبتسم وبيرجعلك البطاقة): "تسلم يا سيدي، كلك ذوق وابن أصول! توكلوا على الله وخلوا بالكم من الطريق."',
          options: [
            'الله يعينك ويحفظك يا باشا، تسلم رجولتك وكل عام وأنتم بخير!',
            'كان يجب أن تفعل ذلك منذ البداية.',
            'أنا لست مهتماً برأيك.',
            'وداعاً أسرع من هنا.'
          ],
          correctAnswer: 'الله يعينك ويحفظك يا باشا، تسلم رجولتك وكل عام وأنتم بخير!',
          explanation: '"الله يعينك ويحفظك يا باشا" is the perfect concluding blessing of mutual street respect.',
          culturalTip: 'Leaving an official checkpoint with polite blessings leaves an open door and positive reputation.'
        }
      ];
    } else {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 25,
          prompt: 'INSPECTOR: "¡Alto ahí! Su boleto no tiene el sello de transferencia válido. La multa es inmediata a menos que tenga una explicación razonable."',
          options: [
            'Buenas tardes oficial. La máquina del andén 3 no tenía tinta, por eso vine directo con usted para que me ayude a sellarlo.',
            '¡Usted es un corrupto y exijo ver a su embajador ahora mismo!',
            'Yo no hablo nada de español, déjeme pasar gratis.',
            'Tome mi billetera y quédese con todo el dinero.'
          ],
          correctAnswer: 'Buenas tardes oficial. La máquina del andén 3 no tenía tinta, por eso vine directo con usted para que me ayude a sellarlo.',
          explanation: 'Calmly pointing to a broken platform stamp machine and asking him to stamp it acknowledges his authority and diffuses anger.',
          culturalTip: 'Officials respond to calm respect and procedural logic, never aggression.'
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 25,
          prompt: 'INSPECTOR: "¿Y cómo sé yo que no se saltó el torniquete como hacen los demás turistas irresponsables?"',
          options: [
            'Mire mi recibo digital con la hora exacta en mi teléfono hace 10 minutos. Vengo a trabajar de manera honesta, ayúdeme por favor.',
            'Porque yo soy de un país superior y allá no hacemos eso.',
            'Si no me deja pasar voy a gritar muy fuerte en la estación.',
            'Pagaré la multa si me da un descuento especial.'
          ],
          correctAnswer: 'Mire mi recibo digital con la hora exacta en mi teléfono hace 10 minutos. Vengo a trabajar de manera honesta, ayúdeme por favor.',
          explanation: 'Producing timestamped digital proof with "ayúdeme por favor" appeals to his human empathy.',
          culturalTip: '"Écheme la mano" or "ayúdeme por favor" flips his role from enforcer to helper.'
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 25,
          prompt: 'INSPECTOR: "Mmm... el reglamento es muy estricto. Tendría que hacerlo esperar aquí 40 minutos para el supervisor."',
          options: [
            'Entiendo su trabajo jefe, pero tengo una entrevista urgente. Si me pone el sello manual le firmo el registro de incidencia con gusto.',
            '¡Me voy a quejar con el presidente municipal de esta ciudad!',
            'Bueno, me siento en el suelo a esperar.',
            'No me importa el reglamento, me voy corriendo.'
          ],
          correctAnswer: 'Entiendo su trabajo jefe, pero tengo una entrevista urgente. Si me pone el sello manual le firmo el registro de incidencia con gusto.',
          explanation: 'Offering to sign his incident registry gives him official cover to let you proceed.',
          culturalTip: 'Offering bureaucratic cover lets the officer help you without risking his job.'
        },
        {
          id: 4,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 25,
          prompt: 'INSPECTOR (Sonriendo levemente): "Está bien, por esta vez se la paso. Pero cuide sus documentos. ¿A dónde se dirige para darle la salida rápida?"',
          options: [
            '¡Muchísimas gracias jefe, le debo una! Voy para la salida norte hacia el centro.',
            'Ya era hora, qué servicio tan lento.',
            'No le voy a decir a dónde voy porque es privado.',
            'Adios oficial sin modales.'
          ],
          correctAnswer: '¡Muchísimas gracias jefe, le debo una! Voy para la salida norte hacia el centro.',
          explanation: '"¡Le debo una jefe!" cements a warm parting and shows native interpersonal warmth.',
          culturalTip: 'Ending on a warm handshake or nod builds lifelong good street karma.'
        }
      ];
    }
  }

  // LESSON 4: Artisan Market Haggling & Bargaining
  if (lessonId === 'l4') {
    if (isFr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the vintage bookseller at Les Puces:',
          nativePhrase: "Pour vous, je fais les deux affiches anciennes à quarante euros en liquide.",
          audioLang: 'fr-FR',
          options: [
            'For you, I will do both antique posters for forty euros in cash.',
            'These posters are from 1950 and cannot be sold.',
            'You must pay a deposit before touching the items.',
            'What is the exchange rate for foreign currencies?'
          ],
          correctAnswer: 'For you, I will do both antique posters for forty euros in cash.',
          explanation: '"En liquide" means in cash. Cash is the preferred bargaining medium in flea markets.',
          culturalTip: 'Bargaining at Paris flea markets (Les Puces) is an art of friendly conversation, not aggressive arguing.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Make a polite counter-offer: "Could you do a small discount for the pair?":',
          nativePhrase: 'Vous me faites un petit prix pour les deux ?',
          correctAnswer: ['Vous', 'me', 'faites', 'un', 'petit', 'prix', 'pour', 'les', 'deux', '?'],
          explanation: '"Faire un petit prix" is the gentle, polite way to ask for a deal.',
          culturalTip: 'Never say "c\'est trop cher" (too expensive); instead ask "vous me faites un petit prix ?".'
        }
      ];
    } else if (isJa) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Vintage shop owner in Nakano Broadway talks to you:',
          nativePhrase: '二つまとめて買ってくれたら、ちょっとおまけしとくよ！',
          audioLang: 'ja-JP',
          options: [
            'If you buy two together, I will give you a little discount/bonus!',
            'Please return the merchandise to its shelf immediately.',
            'This collectible figure has been sold out for weeks.',
            'Are you looking for the elevator to the fourth floor?'
          ],
          correctAnswer: 'If you buy two together, I will give you a little discount/bonus!',
          explanation: '"Omake" is a bonus discount or free extra item included in a purchase.',
          culturalTip: 'Bundle buying ("matomete kau") is the only culturally polite avenue to unlock discounts in Japan.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Ask gently: "Could you discount it a little bit?":',
          nativePhrase: '少しだけまけてもらえますか？',
          correctAnswer: ['少しだけ', 'まけて', 'もらえますか？'],
          explanation: '"Makete moraemasu ka" is the quintessential casual negotiation phrase.',
          culturalTip: 'Use this only at street stalls or flea markets, never in department stores or retail chains.'
        }
      ];
    } else if (isPt) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Market artisan in Rio quotes a bundle discount:',
          nativePhrase: 'Leva essa canga e o artesanato que eu te faço um precinho camarada!',
          audioLang: 'pt-BR',
          options: [
            'Take this beach sarong and the craft and I will give you a friendly discount!',
            'This handmade item is protected by municipal law.',
            'We only accept payment in international bank transfers.',
            'The market will close in fifteen minutes.'
          ],
          correctAnswer: 'Take this beach sarong and the craft and I will give you a friendly discount!',
          explanation: '"Precinho camarada" is warm Brazilian slang for a generous friendly discount.',
          culturalTip: 'A smiling, warm conversation opens the door to good discounts at Brazilian feiras.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Ask the vendor: "How much does it cost in cash?":',
          nativePhrase: 'Faz quanto no dinheiro vivo por favor ?',
          correctAnswer: ['Faz', 'quanto', 'no', 'dinheiro', 'vivo', 'por', 'favor', '?'],
          explanation: '"Dinheiro vivo" refers to physical paper cash notes.',
          culturalTip: 'Vendors frequently drop prices 10-15% when paying in physical cash.'
        }
      ];
    } else if (isAr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'At Khan el-Khalili market in Old Cairo, listen to the merchant banter:',
          nativePhrase: 'عشان خاطري وخاطر الزبون الدايم، تخليه بكام في السريع يا هندسة؟',
          audioLang: 'ar-EG',
          options: [
            'For my sake and as a loyal customer, what quick price can you give me, chief?',
            'Where is the ancient mosque located in this market?',
            'Can I have a receipt for this glass lantern?',
            'What time do the souvenir shops close tonight?'
          ],
          correctAnswer: 'For my sake and as a loyal customer, what quick price can you give me, chief?',
          explanation: '"3ashan 5atri" (for my sake) and "ya handasa" (chief/engineer) are staple flattery phrases used in souk bargaining.',
          culturalTip: 'Bargaining in Egypt is considered a friendly art of conversation and mutual respect, not an argument.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble: "This gentleman is a true local and noble guy who stands with you":',
          nativePhrase: 'الراجل ده ابن بلد أصيل وجدع يقف معاك',
          correctAnswer: ['الراجل', 'ده', 'ابن', 'بلد', 'أصيل', 'وجدع', 'يقف', 'معاك'],
          explanation: '"Ebn balad gada3" is the highest honorific in Egyptian street society for a dependable, loyal person.',
          culturalTip: 'Merchants love doing business with people they recognize as having "gada3na" (street honor).'
        },
        {
          id: 3,
          type: 'roleplay',
          prompt: 'The artisan quotes 500 LE: "القطعة دي نحاس يدوي متعتيقة ومفيش زيها في السوق!" What is the best counter-offer?',
          options: [
            'ما شاء الله شغلك عالي يا فنان، بس نزل شوية عشان خاطرنا ونقول مبروك بـ 300 في السريع؟',
            'هذه بضاعة مقلدة ورخيصة وأنت نصاب.',
            'سأشتري المحل كله بمليون جنيه.',
            'أنا لا أحب النحاس على الإطلاق.'
          ],
          correctAnswer: 'ما شاء الله شغلك عالي يا فنان، بس نزل شوية عشان خاطرنا ونقول مبروك بـ 300 في السريع؟',
          explanation: 'Praising his craftsmanship ("شغلك عالي يا فنان") while pitching a reasonable counter ("نقول مبروك") closes deals gracefully.',
          culturalTip: '"نقول مبروك" (shall we say congratulations) signals you are ready to shake hands on the deal.'
        }
      ];
    } else {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Vendor quotes an initial price. Listen to the exchange:',
          nativePhrase: 'Para usted marchante se lo dejo en quinientos, pero si me compra dos le hago precio.',
          audioLang: 'es-MX',
          options: [
            'For you it is 500, but if you take two I will give you a special discount.',
            'This item is 5,000 dollars and non-negotiable.',
            'I only sell to people who purchase ten pieces minimum.',
            'This artisan craft was made by my grandfather in 1910.'
          ],
          correctAnswer: 'For you it is 500, but if you take two I will give you a special discount.',
          explanation: '"Hacer precio" is the universal market code for negotiating a bundle discount.',
          culturalTip: 'Bundle bargaining (buying 2 or 3) is respected because the artisan makes higher total sales.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Make a polite counter-offer: "What is your best final cash price?":',
          nativePhrase: '¿Cuánto es lo menos en efectivo?',
          correctAnswer: ['¿Cuánto', 'es', 'lo', 'menos', 'en', 'efectivo?'],
          explanation: '"¿Cuánto es lo menos?" is the golden phrase across Latin American markets.',
          culturalTip: 'Never insult the craft; ask for "lo menos" with a warm respectful smile.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'Why should you NEVER aggressively insult an artisan’s handiwork to lower the price?',
          options: [
            'Because handcrafts take weeks of personal labor; insulting them causes offense and kills negotiations.',
            'Because handcrafts are insured by the federal army.',
            'Because market merchants cannot hear insults.',
            'Because prices are governed by computer algorithms.'
          ],
          correctAnswer: 'Because handcrafts take weeks of personal labor; insulting them causes offense and kills negotiations.',
          explanation: 'Always praise the quality first: "Está hermoso el trabajo, nada más busco ajustar mi presupuesto."',
          culturalTip: 'Praising the artisan\'s skill before negotiating makes them want to help you.'
        },
        {
          id: 4,
          type: 'roleplay',
          prompt: 'You offer 300 pesos. Vendor hesitates: "Híjole marchante, pierdo dinero." What is your smoothest reply?',
          options: [
            'Se lo dejo en 350 parejo en billete ahorita mismo, ¿hacemos trato?',
            'Pues pierda dinero, a mí no me importa su familia.',
            'Me voy a llevar la artesanía sin pagar entonces.',
            'Llamaré a la policía turística.'
          ],
          correctAnswer: 'Se lo dejo en 350 parejo en billete ahorita mismo, ¿hacemos trato?',
          explanation: 'Splitting the difference ("350 parejo") and offering cash closes the deal on good terms.',
          culturalTip: '"¿Hacemos trato?" with an outstretched hand is the universal deal closer.'
        }
      ];
    }
  }

  // LESSON 5: Cafe Socializing & Table Banter
  if (lessonId === 'l5') {
    if (isFr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the lively café terrace toast in Paris:',
          nativePhrase: "Allez santé à tous ! La prochaine tournée c'est pour ma pomme !",
          audioLang: 'fr-FR',
          options: [
            'Cheers to everyone! The next round is on me!',
            'I would like to order one green apple.',
            'The cafe will shut down in twenty minutes.',
            'Who ordered this pot of herbal tea?'
          ],
          correctAnswer: 'Cheers to everyone! The next round is on me!',
          explanation: '"C\'est pour ma pomme" is classic Parisian colloquial slang for "it\'s on me / my treat".',
          culturalTip: 'Offering the next round establishes immediate warmth in French group gatherings.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Invite a friend over: "Pull up a chair and come join us for drinks!":',
          nativePhrase: "Prends une chaise et viens boire un coup avec nous",
          correctAnswer: ['Prends', 'une', 'chaise', 'et', 'viens', 'boire', 'un', 'coup', 'avec', 'nous'],
          explanation: '"Boire un coup" is the everyday colloquial expression for having a casual drink.',
          culturalTip: 'Parisian café culture centers on impromptu terrace meetups.'
        }
      ];
    } else if (isJa) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the lively toast at a Tokyo izakaya:',
          nativePhrase: 'お疲れ様でしたー！かんぱーい！今日も一日頑張ったね！',
          audioLang: 'ja-JP',
          options: [
            'Great work everyone! Cheers! We all worked hard today!',
            'Please keep your voices down in this restaurant.',
            'The subway train has arrived at the platform.',
            'Could you show me the dessert menu?'
          ],
          correctAnswer: 'Great work everyone! Cheers! We all worked hard today!',
          explanation: '"Kanpai!" paired with "Otsukaresama deshita" is the foundational ritual of Japanese socializing.',
          culturalTip: 'Clink your glass slightly lower than the host or elder as a mark of cultural politeness.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Offer the table: "The next round of drinks is my treat!":',
          nativePhrase: '次の飲み物は僕のおごりだよ',
          correctAnswer: ['次の', '飲み物は', '僕の', 'おごりだよ'],
          explanation: '"Ogori" means "my treat".',
          culturalTip: 'Offering to treat drinks is a generous, bonding gesture in izakaya camaraderie.'
        }
      ];
    } else if (isPt) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Lively boteco toast in Rio de Janeiro:',
          nativePhrase: 'Saúde rapaziada! A saideira vai por minha conta!',
          audioLang: 'pt-BR',
          options: [
            'Cheers guys! The last round before closing is on me!',
            'Does anyone know where the pharmacy is?',
            'The soccer game has ended in a tie.',
            'Please pay the parking attendant.'
          ],
          correctAnswer: 'Cheers guys! The last round before closing is on me!',
          explanation: '"A saideira" is the iconic Brazilian term for the final drink before going home.',
          culturalTip: 'Offering the "saideira" earns instant respect at any table in Brazil.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble: "Pull up a chair and come chat with the group":',
          nativePhrase: 'Puxa uma cadeira e vem bater papo com a gente',
          correctAnswer: ['Puxa', 'uma', 'cadeira', 'e', 'vem', 'bater', 'papo', 'com', 'a', 'gente'],
          explanation: '"Bater papo" is the universal Brazilian idiom for having a friendly chat.',
          culturalTip: 'Botecos are open-door social hubs where anyone is welcomed to pull up a plastic stool.'
        }
      ];
    } else if (isAr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the orders shouted at a traditional Cairo coffeehouse:',
          nativePhrase: 'حجر قص مظبوط وواحد قهوة تركي زيادة يا معلم',
          audioLang: 'ar-EG',
          options: [
            'A fresh shisha tobacco head and one extra-sweet Turkish coffee, chief',
            'Two glasses of cold orange juice with extra ice',
            'Is there free Wi-Fi connection in this café?',
            'Where is the menu for hot sandwiches?'
          ],
          correctAnswer: 'A fresh shisha tobacco head and one extra-sweet Turkish coffee, chief',
          explanation: '"7agar 2ass" and "2ahwa ziyada" (extra sweet) are timeless Cairo café classics.',
          culturalTip: 'Traditional ahwa baladi venues have no printed menus; you call your order out directly to the waiter ("ya rayyes").'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble the street philosophy: "A gathering of true friends cannot be replaced with money, by God":',
          nativePhrase: 'قعدة الصحاب دي ما تتعوضش بفلوس والله',
          correctAnswer: ['قعدة', 'الصحاب', 'دي', 'ما', 'تتعوضش', 'بفلوس', 'والله'],
          explanation: '"2a3det el-9o7ab" celebrates deep companionship and shared laughs in Egyptian daily life.',
          culturalTip: 'Evenings at cafés are the social backbone of Cairo neighborhood life.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'When someone at the café table says "كبر دماغك وفكك من الحوار ده يا صاحبي", what do they mean?',
          options: [
            'Brush it off and stop worrying about that dispute / chill out.',
            'Your head is physically growing larger than normal.',
            'You must hire a lawyer to pursue the case in court.',
            'Please leave the table immediately.'
          ],
          correctAnswer: 'Brush it off and stop worrying about that dispute / chill out.',
          explanation: '"Kabbar demaghak" (expand your brain) and "fakkak mennoh" (detach yourself) mean letting it go and keeping your peace of mind.',
          culturalTip: 'This is the most common street advice given in Egypt to diffuse daily frustrations.'
        }
      ];
    } else {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the lively cafe toast:',
          nativePhrase: '¡Salud por el reencuentro y que no falte la buena vibra!',
          audioLang: 'es-MX',
          options: [
            'Cheers to our reunion, and may good vibes never run short!',
            'I would like to purchase vitamins for my health.',
            'The restaurant is out of cold beverages.',
            'Please wipe the spills off this table.'
          ],
          correctAnswer: 'Cheers to our reunion, and may good vibes never run short!',
          explanation: '"¡Salud!" paired with "buena vibra" is standard warm social banter.',
          culturalTip: 'Always make eye contact when clinking glasses during a toast.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble the social phrase: "The next round of drinks is on me!":',
          nativePhrase: 'La siguiente ronda va por mi cuenta',
          correctAnswer: ['La', 'siguiente', 'ronda', 'va', 'por', 'mi', 'cuenta'],
          explanation: '"Va por mi cuenta" means "it\'s on me / my treat".',
          culturalTip: 'Offering the next round cements instant friendships in local social culture.'
        },
        {
          id: 3,
          type: 'fill_blank',
          prompt: 'Complete the lively invitation: "Join our table!":',
          nativePhrase: '¡Vente para acá, jálate una ___ y platicamos!',
          options: ['silla', 'ventana', 'pared', 'puerta'],
          correctAnswer: 'silla',
          explanation: '"Jálate una silla" translates to "pull up a chair and join in".',
          culturalTip: '"Platicar" is the preferred Mexican verb for chatting with friends.'
        },
        {
          id: 4,
          type: 'roleplay',
          prompt: 'Someone makes a self-deprecating joke at the table. How do you respond with friendly banter?',
          options: [
            '¡No manches, te pasas de lanza! Pero tienes toda la razón.',
            'Su humor carece de estructura lógica según los cánones.',
            'Me ofende profundamente lo que acaba de pronunciar.',
            'Por favor cállese para que podamos comer en silencio.'
          ],
          correctAnswer: '¡No manches, te pasas de lanza! Pero tienes toda la razón.',
          explanation: '"Te pasas de lanza" is affectionate slang for "you are hilarious / you\'re too much".',
          culturalTip: 'Sharing laughs and matching informal energy builds deep authentic rapport.'
        }
      ];
    }
  }

  // BOSS BATTLE 2: The Master Merchant Duel
  if (lessonId === 'b2') {
    if (isFr) {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'ANTIQUAIRE DES PUCES: "Bienvenue. Ce miroir époque Napoléon III est une pièce de collection certifiée. Cent cinquante euros, pas un sou de moins."',
          options: [
            "Bonjour monsieur. On admire tout de suite la patine du bronze doré. Si je vous prends ce miroir et le bougeoir ensemble, quel prix global pouvez-vous me faire ?",
            "C'est une vulgaire copie en plastique made in China.",
            "Vous êtes un voleur qui arnaque les promeneurs.",
            "Je vous donne cinq euros ou je m'en vais."
          ],
          correctAnswer: "Bonjour monsieur. On admire tout de suite la patine du bronze doré. Si je vous prends ce miroir et le bougeoir ensemble, quel prix global pouvez-vous me faire ?",
          explanation: "Praising the bronze patina and suggesting a combined lot commands immediate respect from flea market antique dealers.",
          culturalTip: "French antique dealers enjoy selling to people who genuinely appreciate historical workmanship."
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'ANTIQUAIRE: "Vous avez l\'œil connaisseur. Deux pièces me coûtent cher à dénicher, mais je peux vous laisser le lot à deux cents euros."',
          options: [
            "Disons cent quatre-vingts euros tout rond réglés en billets tout de suite, et nous faisons affaire monsieur ?",
            "Deux cents euros c'est inadmissible, vous êtes radin.",
            "Je vais aller voir votre voisin d'en face.",
            "Je vous fais un virement bancaire étranger dans deux mois."
          ],
          correctAnswer: "Disons cent quatre-vingts euros tout rond réglés en billets tout de suite, et nous faisons affaire monsieur ?",
          explanation: "Offering a clean rounded cash price ('tout rond en billets') closes the deal gracefully.",
          culturalTip: "'Faisons affaire' with an extended hand is the dignified way to seal a negotiation."
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'ANTIQUAIRE (Serrant la main avec un grand sourire): "Affaire conclue jeune homme ! Vous emportez une authentique merveille de notre patrimoine. Je vous l\'emballe soigneusement."',
          options: [
            "Marché conclu monsieur ! Merci infiniment pour votre passion et votre accueil chaleureux !",
            "Enfin, j'ai gagné le bras de fer.",
            "Mettez ça dans un sac poubelle vite fait.",
            "Adieu."
          ],
          correctAnswer: "Marché conclu monsieur ! Merci infiniment pour votre passion et votre accueil chaleureux !",
          explanation: "Thanking the antiquaire for his passion and hospitality cements deep mutual cultural respect.",
          culturalTip: "True flea market mastery leaves both buyer and merchant proud of the exchange."
        }
      ];
    } else if (isJa) {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: '老舗の親方: "いらっしゃい。この手打ち包丁は鍛冶職人が一本ずつ打った本物だ。安売りはしねえよ。"',
          options: [
            "親方、見事な波紋ですね。こちらの砥石とセットで購入させていただくので、少し勉強していただけないでしょうか？",
            "こんなの100円ショップの包丁と同じですよ。",
            "高すぎる、ぼったくりだ！",
            "タダでください。"
          ],
          correctAnswer: "親方、見事な波紋ですね。こちらの砥石とセットで購入させていただくので、少し勉強していただけないでしょうか？",
          explanation: "Praising the blade's temper line ('hamon') and asking to 'benkyou shite itadaku' (discount/study together) shows deep cultural politeness.",
          culturalTip: "'Benkyou suru' is the traditional merchant term for offering a respectful discount."
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: '老舗の親方: "ほう、目の付け所がいいね。セットなら千円引いてやろう。"',
          options: [
            "親方、ありがとうございます！現金でぴったりお支払いしますので、ぜひそれでお願いいたします！",
            "千円だけ？ケチですね。",
            "クレジットカードでリボ払いにします。",
            "他の店に行きます。"
          ],
          correctAnswer: "親方、ありがとうございます！現金でぴったりお支払いしますので、ぜひそれでお願いいたします！",
          explanation: "Accepting with immediate cash payment shows gratitude and respect for artisan labor.",
          culturalTip: "Paying with exact cash ('pittari') is deeply appreciated by traditional Japanese shopkeepers."
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: '老舗の親方 (笑顔で丁寧に包みながら): "よし、毎度あり！手入れを怠らなけりゃ一生使える道具だ。可愛がってやってくれよ！"',
          options: [
            "親方、一生大切に使わせていただきます！素晴らしい道具をありがとうございました！",
            "壊れたら文句を言いに来ますよ。",
            "包むのは適当でいいです。",
            "じゃあ。"
          ],
          correctAnswer: "親方、一生大切に使わせていただきます！素晴らしい道具をありがとうございました！",
          explanation: "Promising to treasure the tool for a lifetime ('Isshou taisetsu ni tsukawasete itadakimasu') delights traditional craftsmen.",
          culturalTip: "Artisans in Japan view their craft as living heritage handed to worthy stewards."
        }
      ];
    } else if (isPt) {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'MESTRE ARTESÃO: "Essa escultura em peroba rosa levou duas semanas de entalhe à mão. Trezentos reais preço justo."',
          options: [
            "Boa tarde mestre. Dá pra ver a riqueza dos veios na madeira, arte de primeira. Se eu levar a escultura e o porta-jóias, quanto o senhor fecha no pacote ?",
            "Isso foi feito em máquina na China barata.",
            "Trecentos reais é um assalto à mão armada.",
            "Dou dez reais e você me agradece."
          ],
          correctAnswer: "Boa tarde mestre. Dá pra ver a riqueza dos veios na madeira, arte de primeira. Se eu levar a escultura e o porta-jóias, quanto o senhor fecha no pacote ?",
          explanation: "Complimenting the wood grain ('riqueza dos veios') and offering a package deal creates immediate rapport.",
          culturalTip: "Calling elder artisans 'Mestre' honors their years of tradition and opens warm conversation."
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'MESTRE ARTESÃO: "Vejo que você valoriza a arte popular brasileira. Consigo te fazer o conjunto por quatrocentos."',
          options: [
            "Mestre, trezentos e cinquenta no dinheiro vivo em mãos agora, negócio fechado ?",
            "Quatrocentos é piada de mau gosto.",
            "Vou reclamar no Procon contra você.",
            "Aceita cheque pré-datado de fora ?"
          ],
          correctAnswer: "Mestre, trezentos e cinquenta no dinheiro vivo em mãos agora, negócio fechado ?",
          explanation: "A round cash offer ready in hand ('em mãos agora') is the most effective deal closer across Brazil.",
          culturalTip: "'Negócio fechado ?' with an outstretched hand invites an honorable handshake."
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'MESTRE ARTESÃO (Estreitando a mão com um sorriso no rosto): "Trato feito meu jovem! Você tá levando um pedaço do coração do nosso povo. Vai com Deus!"',
          options: [
            "Trato feito mestre! Muito obrigado pela sua arte e generosidade, vou exibir com muito orgulho !",
            "Finalmente te venci no preço.",
            "Não precisa embrulhar não.",
            "Tchau."
          ],
          correctAnswer: "Trato feito mestre! Muito obrigado pela sua arte e generosidade, vou exibir com muito orgulho !",
          explanation: "Expressing genuine pride in taking home their art cements lifelong good street karma.",
          culturalTip: "Closing on mutual joy and blessings leaves both sides feeling victorious."
        }
      ];
    } else if (isAr) {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'معلم خان الخليلي (واقف حاطط إيده في وسطه): "التحفة دي تعب والدي الله يرحمه ومابنزلش قرش واحد لأي زبون، 800 جنيه ده آخر كلام!"',
          options: [
            'الله يرحمه ويحسن إليه يا معلم، باين أصالة الشغل وبركته، بس عشان وشنا والعيش والملح، نخلصها بـ 500 ونقرأ الفاتحة سوا وندعيلكم؟',
            'أنت تبالغ جداً وهذا الشيء لا يستحق عشرين جنيهاً.',
            'أنا لا أهتم بوالدك وسأشتري من محل آخر.',
            'سأدفع ألف جنيه فوق السعر المطلوب.'
          ],
          correctAnswer: 'الله يرحمه ويحسن إليه يا معلم، باين أصالة الشغل وبركته، بس عشان وشنا والعيش والملح، نخلصها بـ 500 ونقرأ الفاتحة سوا وندعيلكم؟',
          explanation: 'Blessing his late father ("الله يرحمه") and invoking mutual respect ("العيش والملح") commands immediate reverence.',
          culturalTip: 'In Old Cairo, honoring an artisan\'s family heritage opens up the best prices.'
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'المعلم (بيبتسم وبيشاور للقهوجي يجيب شاي): "طب عشان كلمتك دي وعشان وشك السمح ده، هكسر السعر شوية بس تشرب شاي معانا الأول!"',
          options: [
            'شاي في الخمسينة من يدك الكريمة يشرفني يا معلم، وربنا يجعل محلك دايماً عامر ومبروك علينا وعليك!',
            'أنا لا أشرب الشاي مع التجار.',
            'أريد مشروباً بارداً ومستورداً فقط.',
            'أعطني السلعة الآن بدون شاي.'
          ],
          correctAnswer: 'شاي في الخمسينة من يدك الكريمة يشرفني يا معلم، وربنا يجعل محلك دايماً عامر ومبروك علينا وعليك!',
          explanation: 'Accepting the tea hospitality seals the transaction with honor and genuine warmth.',
          culturalTip: 'Refusing offered tea during a deal in Egypt can be seen as cold; accepting it cements the friendship.'
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'المعلم (بيلف التحفة في ورق جرايد ويسلمهالك): "مبروك عليك يا باشا، شرفتنا والله ونورت خان الخليلي كله!"',
          options: [
            'المحل منور بيك وبأهله يا فنان، ألف شكر وربنا يوسع رزقك وتعيش وتبيع للحبايب!',
            'كان يمكنني الحصول عليها بسعر أقل في مكان آخر.',
            'ورق الجرائد هذا قديم جداً وغير نظيف.',
            'وداعاً لا أريد مقابلتك مجدداً.'
          ],
          correctAnswer: 'المحل منور بيك وبأهله يا فنان، ألف شكر وربنا يوسع رزقك وتعيش وتبيع للحبايب!',
          explanation: '"تكون دايماً عامر وتعيش وتبيع للحبايب" is the definitive warm farewell blessing in historical Egyptian souks.',
          culturalTip: 'Leaving with hearty blessings ensures you will always be received as family on future visits.'
        }
      ];
    } else {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'GRAND MERCHANT: "Bienvenido amigo. Esta vasija de talavera es una pieza única certificada de mi taller. Mil doscientos pesos, ni un peso menos."',
          options: [
            'Buenas tardes maestro. Se nota la fineza del esmaltado a mano. Si me llevo esta pieza y el plato decorativo, ¿qué precio me da por el paquete?',
            'Eso es una imitación de plástico china barata.',
            'Mil doscientos es un robo descarado a la luz del día.',
            'Démelo por diez pesos o me quejo en internet.'
          ],
          correctAnswer: 'Buenas tardes maestro. Se nota la fineza del esmaltado a mano. Si me llevo esta pieza y el plato decorativo, ¿qué precio me da por el paquete?',
          explanation: 'Calling him "maestro", praising the glaze, and proposing a bundle deal gains immediate respect.',
          culturalTip: 'Master craftsmen appreciate buyers who understand the technique and time required.'
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'GRAND MERCHANT: "Veo que tiene buen ojo para el arte popular. Pero dos piezas me representan mucho costo. Lo más que puedo bajar son cincuenta pesos."',
          options: [
            'Mire maestro, le pago mil seiscientos en efectivo por ambas piezas cerradas. A usted le garantizo la venta en cash y yo me llevo una joya de su tierra.',
            'Cincuenta pesos es una burla, usted es muy tacaño.',
            'Bueno me voy a otra tienda donde sean más amables.',
            'No tengo dinero en efectivo, acépteme un cheque extranjero.'
          ],
          correctAnswer: 'Mire maestro, le pago mil seiscientos en efectivo por ambas piezas cerradas. A usted le garantizo la venta en cash y yo me llevo una joya de su tierra.',
          explanation: 'A clean rounded cash offer for both items represents substantial revenue for the artisan.',
          culturalTip: 'Cash is king in markets because vendors avoid bank terminal fees and delays.'
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'GRAND MERCHANT (Estrechando la mano con orgullo): "Trato hecho marchante. Se lleva usted auténtico orgullo de nuestro taller. Empaquémoslo bien para su viaje."',
          options: [
            '¡Trato hecho maestro! Muchísimas gracias por su arte, lo presumiré con mucho orgullo.',
            'Finalmente, le gané la discusión de precio.',
            'No necesito bolsa ni nada, dámelo rápido.',
            'Adios.'
          ],
          correctAnswer: '¡Trato hecho maestro! Muchísimas gracias por su arte, lo presumiré con mucho orgullo.',
          explanation: 'Honoring the agreement and expressing pride in carrying his work leaves both sides victorious.',
          culturalTip: 'True mastery in bargaining leaves the vendor feeling respected, not exploited.'
        }
      ];
    }
  }

  // LESSON 6: Nightlife & Signature Toasts
  if (lessonId === 'l6') {
    if (isFr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the bartender at a Paris craft bistro:',
          nativePhrase: "On part sur une pinte de blonde ou un demi au comptoir ?",
          audioLang: 'fr-FR',
          options: [
            'Shall we go for a pint of blonde draft or a half-pint at the bar?',
            'The kitchen has stopped taking dinner orders.',
            'You must sit at the terrace to order beer.',
            'Do you possess identification from the European Union?'
          ],
          correctAnswer: 'Shall we go for a pint of blonde draft or a half-pint at the bar?',
          explanation: '"Un demi" is 25cl and "une pinte" is 50cl, the standard beer vocabulary in France.',
          culturalTip: 'Ordering "au comptoir" is social and quintessential to French bistro life.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble the traditional toast: "Cheers to our health and to good times!":',
          nativePhrase: "Santé à notre belle soirée et aux bons moments",
          correctAnswer: ['Santé', 'à', 'notre', 'belle', 'soirée', 'et', 'aux', 'bons', 'moments'],
          explanation: '"Santé" is the classic, heartfelt toast.',
          culturalTip: 'Look right into the other person’s eyes when clinking glasses ("les yeux dans les yeux").'
        }
      ];
    } else if (isJa) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to orders flying at a bustling Shibuya izakaya:',
          nativePhrase: 'とりあえず生中ふたつと、名物の焼き鳥盛り合わせで！',
          audioLang: 'ja-JP',
          options: [
            'For now, two medium draft beers and the house special yakitori platter!',
            'Please clear all empty glasses from this table immediately.',
            'We would like the bill divided equally among all four guests.',
            'What time is the last train departing tonight?'
          ],
          correctAnswer: 'For now, two medium draft beers and the house special yakitori platter!',
          explanation: '"Namachuu" is a medium draft mug, and "toriaezu" is the classic kickoff order.',
          culturalTip: 'Ordering drinks and a quick shareable dish gives the kitchen time to prepare larger courses.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble the toast: "Cheers! Let’s have an amazing night together!":',
          nativePhrase: '乾杯！今夜は思いっきり楽しもう！',
          correctAnswer: ['乾杯！', '今夜は', '思いっきり', '楽しもう！'],
          explanation: '"Omoikkiri tanoshimou" means "let’s enjoy ourselves to the fullest".',
          culturalTip: 'Keep your drink glass slightly lower when toasting seniors or clients.'
        }
      ];
    } else if (isPt) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Bartender in Lapa asks for your order:',
          nativePhrase: 'Vai sair aquela caipirinha caprichada de cachaça artesanal ou prefere cerveja trincando ?',
          audioLang: 'pt-BR',
          options: [
            'Should I make that generous artisanal cachaça caipirinha, or do you prefer an ice-cold beer?',
            'The samba band has concluded their performance for tonight.',
            'We only accept cash payment after midnight.',
            'What is your hotel room number?'
          ],
          correctAnswer: 'Should I make that generous artisanal cachaça caipirinha, or do you prefer an ice-cold beer?',
          explanation: '"Cerveja trincando" means so cold frost is visible on the bottle.',
          culturalTip: 'Brazilians take immense pride in serving beer ice-cold in thermal sleeves.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble the toast: "A toast to good friends and great music":',
          nativePhrase: 'Um brinde aos bons amigos e à música boa',
          correctAnswer: ['Um', 'brinde', 'aos', 'bons', 'amigos', 'e', 'à', 'música', 'boa'],
          explanation: '"Um brinde" is the Portuguese phrase for a toast.',
          culturalTip: 'Lapa cantinas and rodas de samba are welcoming places where everyone sings together.'
        }
      ];
    } else if (isAr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'At a Zamalek café by the Nile or evening gathering, listen to the toast:',
          nativePhrase: 'يا سيدي الفل والياسمين، شرفتنا ونورتنا الليلة دي كلها!',
          audioLang: 'ar-EG',
          options: [
            'My dear friend of jasmine blossoms, you have honored and brightened our entire night!',
            'The museum ticket is valid for three days.',
            'Can we cross the bridge before sunset?',
            'Where can I find an internet café in this street?'
          ],
          correctAnswer: 'My dear friend of jasmine blossoms, you have honored and brightened our entire night!',
          explanation: '"Sharraftana w-nawwartana" (you have honored and brightened us) is traditional Egyptian hospitality.',
          culturalTip: 'Egyptians celebrate guests with poetic floral compliments ("يا سيدي الفل والياسمين").'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble the street praise: "I caught the hidden joke immediately in mid-air, chief":',
          nativePhrase: 'أنا لقطتها وهي طايرة على طول يا معلم',
          correctAnswer: ['أنا', 'لقطتها', 'وهي', 'طايرة', 'على', 'طول', 'يا', 'معلم'],
          explanation: '"لقطتها وهي طايرة" means you were sharp enough to catch the punchline or nuance instantly.',
          culturalTip: 'Cairenes take great pride in quick wit, humor, and picking up on unspoken double entendres.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'When toasting with friends over fresh mango juice or tea in Egypt, what is the quintessential blessing?',
          options: [
            'في صحتك يا صاحبي ودايماً متجمعين في الخير!',
            'سأدفع ثمن طعامي ولن أشاركك.',
            'أنا أريد الذهاب إلى الفندق للنوم.',
            'هذا المشروب ليس حلواً كفاية.'
          ],
          correctAnswer: 'في صحتك يا صاحبي ودايماً متجمعين في الخير!',
          explanation: '"Fi sa7etak ya 9a7bi w-dayman metgamma3een fel-5eir" wishes health and perpetual joyful gatherings.',
          culturalTip: 'Wishing that people "always be gathered in goodness" is the warmest social blessing.'
        }
      ];
    } else {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the bartender explaining local mezcal etiquette:',
          nativePhrase: 'El mezcal no se toma de golpe, se toma a besitos y con naranja con sal de gusano.',
          audioLang: 'es-MX',
          options: [
            'Mezcal isn’t downed in one shot; you sip it like little kisses with orange slices and worm salt.',
            'Mezcal must always be mixed with lots of cold water and ice.',
            'Do not drink alcohol inside this establishment after midnight.',
            'The mezcal bottle has expired and cannot be opened.'
          ],
          correctAnswer: 'Mezcal isn’t downed in one shot; you sip it like little kisses with orange slices and worm salt.',
          explanation: '"Tomar a besitos" (sipping delicately) is the golden rule of authentic artisanal mezcal drinking.',
          culturalTip: 'Never shoot quality mezcal like cheap tequila; locals always sip with orange and sal de gusano.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble the quintessential Mexican bar toast:',
          nativePhrase: '¡Pa arriba pa abajo pal centro y pa dentro!',
          correctAnswer: ['¡Pa', 'arriba', 'pa', 'abajo', 'pal', 'centro', 'y', 'pa', 'dentro!'],
          explanation: 'The iconic rhythmic chant before clinking drinks across Mexico and Latin America.',
          culturalTip: 'Move your glass up, down, center, then drink on "pa dentro".'
        },
        {
          id: 3,
          type: 'fill_blank',
          prompt: 'Order the spicy beer cocktail with lime, chili powder, and assorted sauces:',
          nativePhrase: 'Me prepara una ___ bien fría escarchada con chamoy, por favor.',
          options: ['michelada', 'ensalada', 'sopa', 'gelatina'],
          correctAnswer: 'michelada',
          explanation: 'A "michelada" is the quintessential Mexican beer cocktail, served in a chili-rimmed glass.',
          culturalTip: 'Ask for "michelada cubana" if you want Worcestershire sauce and hot sauce added.'
        },
        {
          id: 4,
          type: 'roleplay',
          prompt: 'A local invites you to their table for a toast: "¿Nos acompañas con un trago?"',
          options: [
            '¡Con todo el gusto compa, salud por la buena música y la noche!',
            'El alcohol es destructivo para la sociedad.',
            'No me hable sin presentar sus credenciales de policía.',
            'Pagaré si me dan un recibo fiscal.'
          ],
          correctAnswer: '¡Con todo el gusto compa, salud por la buena música y la noche!',
          explanation: 'Accepting with "¡Con todo el gusto!" and raising a glass is peak social grace.',
          culturalTip: 'Bars and cantinas in Latin America are community living rooms where strangers become friends.'
        }
      ];
    }
  }

  // LESSON 7: Slang Secrets & Sarcasm
  if (lessonId === 'l7') {
    if (isFr) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the sarcastic Parisian response:',
          nativePhrase: "Genre ! Comme si j'allais te croire sur parole !",
          audioLang: 'fr-FR',
          options: [
            'As if! Like I would take your word for it! (Sarcastic playful disbelief)',
            'Please fill out the official administrative form.',
            'I agree with your scientific theory completely.',
            'What is the price of this transit ticket?'
          ],
          correctAnswer: "As if! Like I would take your word for it! (Sarcastic playful disbelief)",
          explanation: '"Genre !" is ubiquitous French filler and sarcastic punctuation for "yeah, right!".',
          culturalTip: 'Playful sarcasm is the bedrock of Parisian friendship banter.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble the street phrase: "Forget it, it’s completely annoying bro":',
          nativePhrase: "Laisse tomber c'est trop relou mon pote",
          correctAnswer: ['Laisse', 'tomber', "c'est", 'trop', 'relou', 'mon', 'pote'],
          explanation: '"Relou" is Verlan for "lourd" (annoying/troublesome).',
          culturalTip: 'Verlan (inverting syllables) is spoken naturally by all generations in Paris.'
        }
      ];
    } else if (isJa) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the street reaction in Shibuya:',
          nativePhrase: 'まじで言ってるの？そんなわけないじゃん！',
          audioLang: 'ja-JP',
          options: [
            'Are you for real? No way that is true! (Playful shock)',
            'Please show your student ID card.',
            'The weather report predicted rain today.',
            'Which platform does the rapid train leave from?'
          ],
          correctAnswer: 'Are you for real? No way that is true! (Playful shock)',
          explanation: '"Majide?" means "seriously / for real?", the most common conversational reflex in Tokyo.',
          culturalTip: 'Ending sentences with "-jan!" indicates relaxed, colloquial rapport.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Express total emphatic agreement: "Totally! I completely relate!":',
          nativePhrase: 'それな！まじで共感しかないわ',
          correctAnswer: ['それな！', 'まじで', '共感しかないわ'],
          explanation: '"Sore na!" expresses instant enthusiastic agreement ("preach / totally").',
          culturalTip: '"Sore na!" replaced formal agreement in peer conversational Japanese.'
        }
      ];
    } else if (isPt) {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the sarcastic reaction on the beach:',
          nativePhrase: 'Qual foi mermão, tá de sacanagem com a minha cara?',
          audioLang: 'pt-BR',
          options: [
            'What’s up bro, are you messing with me? (Playful disbelief)',
            'What is the depth of the water at high tide?',
            'Can I borrow your surfboard for ten minutes?',
            'Where is the municipal library located?'
          ],
          correctAnswer: 'What’s up bro, are you messing with me? (Playful disbelief)',
          explanation: '"Tá de sacanagem?" is the staple Carioca expression for "are you kidding me?".',
          culturalTip: 'Said with a laugh, it is friendly camaraderie; tone dictates the emotion.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble: "Don’t give me that fake excuse, bro":',
          nativePhrase: 'Não vem meter esse caô pra cima de mim irmão',
          correctAnswer: ['Não', 'vem', 'meter', 'esse', 'caô', 'pra', 'cima', 'de', 'mim', 'irmão'],
          explanation: '"Caô" is Rio slang for a lie, tall tale, or fake story.',
          culturalTip: 'Calling out a "caô" with a grin builds effortless street credentials.'
        }
      ];
    } else {
      return [
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the sarcastic street remark:',
          nativePhrase: '¡Uy sí, mira cómo tiemblo de miedo!',
          audioLang: 'es-MX',
          options: [
            'Oh yeah, look at me shaking in my boots! (Obvious mocking sarcasm)',
            'I am suffering from hypothermia in this room.',
            'An earthquake is occurring right now.',
            'Please hold my hand because I am scared.'
          ],
          correctAnswer: 'Oh yeah, look at me shaking in my boots! (Obvious mocking sarcasm)',
          explanation: '"¡Uy sí, mira cómo tiemblo!" is playful mockery when someone tries to intimidate you.',
          culturalTip: 'Mexican humor ("albures" and playful sarcasm) relies heavily on vocal cadence and feigned fear.'
        },
        {
          id: 2,
          type: 'context',
          prompt: 'When someone says: "Me costó un ojo de la cara y la mitad del otro", what are they saying?',
          options: [
            'It was outrageously overpriced / cost an arm and a leg!',
            'They suffered a double ocular accident.',
            'They purchased sunglasses at the clinic.',
            'They had cosmetic surgery done yesterday.'
          ],
          correctAnswer: 'It was outrageously overpriced / cost an arm and a leg!',
          explanation: 'Adding "y la mitad del otro" is a humorous hyperbole emphasizing insane cost.',
          culturalTip: 'Hyperbole is constantly used in everyday Latin American street storytelling.'
        },
        {
          id: 3,
          type: 'word_order',
          prompt: 'Assemble the everyday Mexican reaction: "Don’t give me excuses!":',
          nativePhrase: 'No me salgas con cuentos chinos',
          correctAnswer: ['No', 'me', 'salgas', 'con', 'cuentos', 'chinos'],
          explanation: '"Cuentos chinos" is a colloquial idiom for tall tales, excuses, or fake stories.',
          culturalTip: 'Saying this with a grin calls someone out gently without genuine confrontation.'
        },
        {
          id: 4,
          type: 'fill_blank',
          prompt: 'Complete the popular expression for "taking someone for a ride / pulling my leg":',
          nativePhrase: '¡Me estás tomando el ___ no te creo nada!',
          options: ['pelo', 'zapato', 'reloj', 'sombrero'],
          correctAnswer: 'pelo',
          explanation: '"Tomar el pelo" translates to pulling someone\'s leg or teasing them.',
          culturalTip: 'Universal across all Spanish-speaking countries.'
        }
      ];
    }
  }

  // BOSS BATTLE 3: The Barrio Legend Duel
  if (lessonId === 'b3') {
    if (isFr) {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: "LE PILIER DU QUARTIER: 'Ça fait cinquante ans que j'habite à Belleville. Les touristes pensent tout connaître de Paris en lisant des guides. Tu connais quoi de la vraie âme de nos rues ?'",
          options: [
            "Avec tout le respect monsieur, je viens avec beaucoup d'humilité pour écouter et apprendre de la mémoire vivante de ce quartier.",
            "Je sais tout sur Paris grâce aux vidéos sur mon smartphone.",
            "Les vieux quartiers n'ont plus aucune valeur aujourd'hui.",
            "Laissez-moi tranquille et buvez votre café."
          ],
          correctAnswer: "Avec tout le respect monsieur, je viens avec beaucoup d'humilité pour écouter et apprendre de la mémoire vivante de ce quartier.",
          explanation: "Showing humility and recognizing the neighborhood elders as living heritage earns unconditional warmth.",
          culturalTip: "Old-timers in Parisian working-class districts value humility and genuine respect above all else."
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: "LE PILIER DU QUARTIER: 'Bien envoyé gamin. Et dis-moi, au zinc de ce bistrot, quelle est la règle d'or quand on trinque avec un ancien ?'",
          options: [
            "On se regarde droit dans les yeux avec un franc sourire pour se souhaiter le meilleur !",
            "On regarde ses pieds pour éviter la gêne.",
            "On boit sans faire de bruit et on s'en va.",
            "On demande une réduction sur l'addition."
          ],
          correctAnswer: "On se regarde droit dans les yeux avec un franc sourire pour se souhaiter le meilleur !",
          explanation: "Looking straight in the eyes when clinking glasses is the sacred social code of French drinking culture.",
          culturalTip: "Never cross arms with someone else when toasting, and always hold eye contact."
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: "LE PILIER DU QUARTIER (Levant son verre avec une belle émotion): 'Santé gamin ! T'as du cœur et le verbe facile. À partir d'aujourd'hui, ce comptoir c'est chez toi !'",
          options: [
            "C'est un immense honneur monsieur ! Santé aux gens vrais et à la mémoire de ce quartier magnifique !",
            "Maintenant payez-moi des verres gratuits toute l'année.",
            "Je savais que je vous battrais facilement.",
            "Au revoir."
          ],
          correctAnswer: "C'est un immense honneur monsieur ! Santé aux gens vrais et à la mémoire de ce quartier magnifique !",
          explanation: "Returning emotional gravity seals your status as an honorary neighborhood regular.",
          culturalTip: "Being accepted by local elders is the pinnacle of genuine language and cultural mastery."
        }
      ];
    } else if (isJa) {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: '下町の常連マスター: "この横丁で五十年飲んでるがね、旅人は表面だけ見て帰っちまう。あんたはこの街の本当の人情を知ってるかい？"',
          options: [
            "大将、失礼いたします。下町の伝統と温かい人情をぜひ先輩から学ばせていただきたく、敬意を持ってお邪魔しております。",
            "インターネットの口コミで何でも知っています。",
            "古い横丁には興味ありません。",
            "静かに飲みたいので話しかけないでください。"
          ],
          correctAnswer: "大将、失礼いたします。下町の伝統と温かい人情をぜひ先輩から学ばせていただきたく、敬意を持ってお邪魔しております。",
          explanation: "Speaking with humble respect ('keii o motte') to neighborhood regulars dissolves all wariness immediately.",
          culturalTip: "Shitamachi (old downtown) culture in Tokyo is built on warm neighborly bonds and mutual humility."
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: '下町の常連マスター: "ほう、気持ちのいい返答だ。じゃあ聞くが、隣の客と仲良くなるための一番の流儀は何だい？"',
          options: [
            "笑顔で会釈し、互いに盃を酌み交わして今日一日の労をねぎらうことです！",
            "自分の自慢話を大声ですることです。",
            "他人の酒を勝手に飲むことです。",
            "何もしないことです。"
          ],
          correctAnswer: "笑顔で会釈し、互いに盃を酌み交わして今日一日の労をねぎらうことです！",
          explanation: "Smiling, bowing lightly, and acknowledging fellow workers' efforts ('otsu-kare-sama') is the soul of izakaya fellowship.",
          culturalTip: "Pouring a drink for someone else creates an instant bridge across age and background."
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: '下町の常連マスター (笑顔でお酒を注ぎながら): "合格だ！あんた、いい飲みっぷりだな！この酒を一杯やりな、俺のおごりだ！"',
          options: [
            "大将、温かいお心遣いありがとうございます！ありがたくいただきます！乾杯！",
            "ただ酒なら何杯でも飲みますよ。",
            "お酒は嫌いなので断ります。",
            "さようなら。"
          ],
          correctAnswer: "大将、温かいお心遣いありがとうございます！ありがたくいただきます！乾杯！",
          explanation: "Accepting with heartfelt thanks ('Arigataku itadakimasu!') seals your acceptance into the local community.",
          culturalTip: "Receiving a treated cup from an elder regular marks full social fluency in Japan."
        }
      ];
    } else if (isPt) {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'O VELHO MALANDRO DA LAPA: "Eu tenho cinquenta anos de samba nessa Lapa. Aqui quem chega de fora acha que malandragem é passar a perna nos outros. O que você sabe da malandragem do bem ?"',
          options: [
            "Com todo respeito mestre, a verdadeira malandragem carioca é a sabedoria de viver em paz, respeitar os mais velhos e espalhar alegria no samba.",
            "Malandragem é dar calote e não pagar nada.",
            "A Lapa é um bairro sem importância.",
            "Não me amola com história velha."
          ],
          correctAnswer: "Com todo respeito mestre, a verdadeira malandragem carioca é a sabedoria de viver em paz, respeitar os mais velhos e espalhar alegria no samba.",
          explanation: "Defining 'malandragem' as joyful wisdom, community peace, and respect commands the elder's deepest admiration.",
          culturalTip: "In Rio, the historic 'malandro' is not a criminal, but a poet and guardian of cultural dignity."
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'O VELHO MALANDRO: "Falou como bamba meu parceiro! E quando o surdo de primeira toca na roda de samba, o que o coração manda fazer ?"',
          options: [
            "Bater na palma da mão com respeito e cantar junto com a comunidade até clarear o dia !",
            "Ficar olhando o celular no canto da mesa.",
            "Mandar os músicos tocarem música gringa.",
            "Ir embora mais cedo pra dormir."
          ],
          correctAnswer: "Bater na palma da mão com respeito e cantar junto com a comunidade até clarear o dia !",
          explanation: "Clapping in rhythm ('bater na palma da mão') is the universal sign of unity in Brazilian samba circles.",
          culturalTip: "Participating with clapping and singing brings unconditional local affection in Rio."
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'O VELHO MALANDRO (Com um abraço emocionado): "É isso aí meu irmão! Você tem alma carioca. A partir de hoje, essa mesa é sua também !"',
          options: [
            "É uma honra meu mestre! Viva a Lapa, viva o samba e a gente boa desse lugar sagrado !",
            "Agora me dá cerveja de graça o mês todo.",
            "Eu já sabia que eu era o melhor.",
            "Tchau."
          ],
          correctAnswer: "É uma honra meu mestre! Viva a Lapa, viva o samba e a gente boa desse lugar sagrado !",
          explanation: "Toasting to samba, the community, and the elders completes the initiation into true Brazilian street fluency.",
          culturalTip: "A warm hug and toasting the community seals your honorary native status."
        }
      ];
    } else {
      return [
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'BARRIO ELDER: "Llevo sesenta años viviendo en este barrio marchante. Aquí los forasteros siempre vienen pensando que se las saben todas. ¿Qué sabe usted de la verdadera historia de esta esquina?"',
          options: [
            'Con todo respeto don, yo vengo aquí con humildad a escuchar y aprender de los que tienen la memoria viva del barrio.',
            'Yo sé más que usted porque leí artículos en internet.',
            'Los barrios viejos no tienen importancia en el mundo moderno.',
            'Cállese anciano y no me moleste.'
          ],
          correctAnswer: 'Con todo respeto don, yo vengo aquí con humildad a escuchar y aprender de los que tienen la memoria viva del barrio.',
          explanation: 'Treating elders with "don" and expressing genuine humility unlocks unconditional barrio respect.',
          culturalTip: 'Neighborhood elders are sacred cultural gatekeepers. Humility opens every door.'
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'BARRIO ELDER: "Mmm, bien dicho. Pero hablar bonito cualquiera puede. A ver si es cierto: en esta cantina, ¿qué se dice antes de brindar para honrar a los ausentes?"',
          options: [
            'Un chorrito al suelo para la tierra y los que ya no están, y el resto pa adentro con el corazón.',
            'Brindo por ganar mucho dinero en la bolsa de valores.',
            'No se debe tirar alcohol porque cuesta caro.',
            'No creo en esas supersticiones campesinas.'
          ],
          correctAnswer: 'Un chorrito al suelo para la tierra y los que ya no están, y el resto pa adentro con el corazón.',
          explanation: 'Pouring a drop on the ground for Pachamama / ancestors is ancient native tradition.',
          culturalTip: 'Pouring a drop on the ground honors lost loved ones and marks deep cultural fluency.'
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'BARRIO ELDER (Levantando su copa con una amplia sonrisa): "¡Carajo! Este no es cualquier turista. Tienes sangre de barrio compadre. A partir de hoy, en esta mesa siempre tienes tu lugar."',
          options: [
            '¡Es un honor don, salud por la gente noble y la memoria de este barrio sagrado!',
            'Bueno, ahora exijo que me inviten todo el mes.',
            'Yo sabía que los convencería fácilmente.',
            'Me voy a otro lado.'
          ],
          correctAnswer: '¡Es un honor don, salud por la gente noble y la memoria de este barrio sagrado!',
          explanation: 'Toasting with genuine emotional gravity seals your status as an honorary barrio native.',
          culturalTip: 'Gaining acceptance from neighborhood elders is the pinnacle achievement of street language mastery.'
        }
      ];
    }
  }

  // COMPREHENSIVE MULTI-DIALECT FALLBACK (Full-fledged, authentic, tailored to target language)
  if (isFr) {
    return [
      {
        id: 1,
        type: 'listening',
        prompt: `Écoutez cette expression courante à Paris :`,
        nativePhrase: 'Pardon, excusez-moi, je passe juste par là !',
        audioLang: 'fr-FR',
        options: [
          'Excuse me, pardon me, just passing through!',
          'Can you show me the train schedule?',
          'What is the price of this pastry?',
          'Where is the public library?'
        ],
        correctAnswer: 'Excuse me, pardon me, just passing through!',
        explanation: '"Pardon, excusez-moi" is essential polite French when navigating tight urban spaces.',
        culturalTip: 'Polite words are spoken automatically when passing in markets and metro corridors.'
      },
      {
        id: 2,
        type: 'word_order',
        prompt: 'Assemble: "Tout va très bien, merci beaucoup":',
        nativePhrase: 'Tout va très bien merci beaucoup',
        correctAnswer: ['Tout', 'va', 'très', 'bien', 'merci', 'beaucoup'],
        explanation: 'Natural French rhythm for "Everything is going great, thank you very much".',
        culturalTip: 'Cadence and gentle inflection matter just as much as grammar.'
      }
    ];
  }

  if (isJa) {
    return [
      {
        id: 1,
        type: 'listening',
        prompt: 'Listen to this natural Japanese street expression:',
        nativePhrase: 'すみません、ちょっと前を通してください。',
        audioLang: 'ja-JP',
        options: [
          'Excuse me, please let me pass through for a second.',
          'Where is the bullet train terminal located?',
          'What is the total price for lunch?',
          'Please show me the local museum.'
        ],
        correctAnswer: 'Excuse me, please let me pass through for a second.',
        explanation: '"Sumimasen, chotto mae o tooshite kudasai" is standard manners in crowded Japanese stations.',
        culturalTip: 'A slight bow with one hand forward communicates polite intent instantly.'
      },
      {
        id: 2,
        type: 'word_order',
        prompt: 'Assemble: "Everything is going smoothly, thank you":',
        nativePhrase: 'おかげさまで順調に進んでいます',
        correctAnswer: ['おかげさまで', '順調に', '進んでいます'],
        explanation: '"Okagesama de" acknowledges mutual support and good fortune.',
        culturalTip: 'Humility and gratitude are central pillars of conversational Japanese.'
      }
    ];
  }

  if (isPt) {
    return [
      {
        id: 1,
        type: 'listening',
        prompt: 'Listen to this Brazilian conversational phrase:',
        nativePhrase: 'Com licença meu irmão, tô passando aqui rapidinho !',
        audioLang: 'pt-BR',
        options: [
          'Excuse me my brother, just passing quickly through here!',
          'How much is a coconut at the kiosk?',
          'Where is the municipal bus terminal?',
          'Is the museum open this afternoon?'
        ],
        correctAnswer: 'Excuse me my brother, just passing quickly through here!',
        explanation: '"Com licença" is polite street etiquette when navigating crowded boardwalks or markets.',
        culturalTip: 'Pairing it with "meu irmão" or "chefe" adds signature Brazilian warmth.'
      },
      {
        id: 2,
        type: 'word_order',
        prompt: 'Assemble: "Tudo tranquilo graças a Deus":',
        nativePhrase: 'Tudo tranquilo graças a Deus',
        correctAnswer: ['Tudo', 'tranquilo', 'graças', 'a', 'Deus'],
        explanation: 'The ubiquitous Brazilian response for "Everything is chill and blessed".',
        culturalTip: 'Warmth and relaxed cadence communicate street fluency instantly.'
      }
    ];
  }

  // Default Spanish Fallback
  return [
    {
      id: 1,
      type: 'listening',
      prompt: `Listen to this authentic conversational expression:`,
      nativePhrase: 'Buenas tardes, con permiso que voy pasando.',
      audioLang: 'es-MX',
      options: [
        'Good afternoon, excuse me as I pass through.',
        'Please show me the municipal courthouse.',
        'I am not interested in this merchandise.',
        'What is the ticket price for tomorrow?'
      ],
      correctAnswer: 'Good afternoon, excuse me as I pass through.',
      explanation: '"Con permiso" is essential street manners when moving through tight crowds.',
      culturalTip: 'Always say "con permiso" when squeezing past locals in markets and metro corridors.'
    },
    {
      id: 2,
      type: 'word_order',
      prompt: 'Assemble the phrase in the correct conversational order:',
      nativePhrase: 'Todo bien gracias a Dios',
      correctAnswer: ['Todo', 'bien', 'gracias', 'a', 'Dios'],
      explanation: 'A standard everyday cultural reflex spoken across communities.',
      culturalTip: 'Cultural cadence matters just as much as textbook vocabulary.'
    },
    {
      id: 3,
      type: 'fill_blank',
      prompt: 'Select the authentic colloquial particle for "see you in a little while":',
      nativePhrase: 'Nos vemos al ___ sin falta hermano.',
      options: ['ratito', 'reloj', 'segundo', 'viento'],
      correctAnswer: 'ratito',
      explanation: '"Al ratito" means "see you a bit later".',
      culturalTip: 'Diminutives like "ratito" soften conversational commitments warmly.'
    },
    {
      id: 4,
      type: 'roleplay',
      prompt: 'A local welcomes you warmly to their neighborhood. Best instinctive reply:',
      options: [
        '¡Muchísimas gracias, qué bonita vibra se siente por acá!',
        'No confío en extraños según las noticias.',
        'Quiero volver a mi hotel inmediatamente.',
        'No tengo nada que decirle a usted.'
      ],
      correctAnswer: '¡Muchísimas gracias, qué bonita vibra se siente por acá!',
      explanation: 'Returning warmth with positive compliments makes you instant friends.',
      culturalTip: 'Praising the neighborhood vibe ("la vibra del barrio") shows genuine cultural openness.'
    }
  ];
}
