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

// Fisher-Yates shuffle so multiple-choice options are NEVER always "A"
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomizeExercises(exercises: LessonExercise[]): LessonExercise[] {
  return exercises.map((ex) => {
    if (ex.options && ex.options.length > 1) {
      return {
        ...ex,
        options: shuffleArray(ex.options)
      };
    }
    return ex;
  });
}

export function getLessonExercises(lessonId: string, dialectId: string): LessonExercise[] {
  const isDarija = dialectId === 'ar-MA';
  const isAr = dialectId.startsWith('ar') && !isDarija;
  const isFr = dialectId.startsWith('fr');
  const isJa = dialectId.startsWith('ja');
  const isPt = dialectId.startsWith('pt');

  // ============================================================================
  // ARCADE: RAPID FIRE MODE (High-speed street reflex test)
  // ============================================================================
  if (lessonId === 'arcade_rapid_fire') {
    if (isDarija) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'RAPID FIRE: Decode this Casablanca street greeting in under 10 seconds:',
          nativePhrase: 'واش أ عشيري! كلشي مزيان؟ أش كتعاود؟',
          audioLang: 'ar-MA',
          options: [
            "What's up my friend! Everything good? What's new with you?",
            'Where is the ticket office for the train to Rabat?',
            'What is the currency exchange rate today?',
            'Can you open the shop door please?'
          ],
          correctAnswer: "What's up my friend! Everything good? What's new with you?",
          explanation: '"Wash a 3shiri" and "ash kat3awed" are classic high-frequency Casablanca street greetings.',
          culturalTip: 'Using "عشيري" (3shiri = my close buddy) builds instant street rapport in Morocco.'
        },
        {
          id: 2,
          type: 'roleplay',
          prompt: 'A café waiter in Rabat asks what you want to drink. Instant local reply:',
          options: [
            'واحد أتاي مشحر بالنعناع عافاك أ خويا!',
            'أنا لا أشرب الماء في الصباح أبداً.',
            'أعطني تذكرة الحافلة إلى المطار.',
            'كم الساعة الآن في الدار البيضاء؟'
          ],
          correctAnswer: 'واحد أتاي مشحر بالنعناع عافاك أ خويا!',
          explanation: '"Atay msha77ar b-n-na3na3" is authentic Moroccan mint tea brewed on the flame.',
          culturalTip: 'Adding "عافاك أ خويا" (please, my brother) is warm everyday Moroccan etiquette.'
        },
        {
          id: 3,
          type: 'word_order',
          prompt: 'Assemble: "Everything is fine, thank God, step by step":',
          nativePhrase: 'كلشي بخير الحمد لله دقة دقة',
          correctAnswer: ['كلشي', 'بخير', 'الحمد', 'لله', 'دقة', 'دقة'],
          explanation: '"Kulshi bikhir l-7amdulillah daqqa daqqa" is the signature Moroccan expression of calm optimism.',
          culturalTip: '"Daqqa daqqa" (step by step) is used daily across Morocco.'
        }
      ]);
    } else if (isFr) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'RAPID FIRE: Decipher the Parisian reaction in under 10 seconds:',
          nativePhrase: "Laisse tomber, c'est mort pour ce soir !",
          audioLang: 'fr-FR',
          options: [
            "Forget it, it's not happening tonight / call it off!",
            'Someone has passed away in the neighborhood.',
            'Can you drop your jacket on the couch?',
            'What time is dinner served?'
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
            'Ma température corporelle est élevée.',
            'Je ne bouge jamais mes pieds.',
            'Quel est le prix du billet de train ?'
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
      ]);
    } else if (isJa) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'RAPID FIRE: Listen to Tokyo izakaya ordering reflex:',
          nativePhrase: 'とりあえず生二つお願いします！',
          audioLang: 'ja-JP',
          options: [
            'For now, two draft beers to start please!',
            'Where is the nearest subway exit?',
            'Can we have the bill split in four?',
            "What is the chef's recommendation?"
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
            'お疲れ様でした！気をつけてね！ (Great work! Take care!)',
            'さようなら、もう二度と会いません (Farewell, we will never meet again)',
            '静かにしてください (Please be quiet)',
            '今何時ですか (What time is it)'
          ],
          correctAnswer: 'お疲れ様でした！気をつけてね！ (Great work! Take care!)',
          explanation: '"Otsukaresama deshita" is the respectful, warm social acknowledgment of someone\'s hard work.',
          culturalTip: 'Never leave without answering this standard social phrase.'
        },
        {
          id: 3,
          type: 'word_order',
          prompt: 'Assemble: "Totally! I completely relate to that!":',
          nativePhrase: 'それな めっちゃ わかるよ',
          correctAnswer: ['それな', 'めっちゃ', 'わかるよ'],
          explanation: '"Sore na! Meccha wakaru yo" is natural Tokyo peer agreement.',
          culturalTip: '"Sore na" is the #1 colloquial agreement phrase in Tokyo.'
        }
      ]);
    } else if (isAr) {
      return randomizeExercises([
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
          prompt: 'A street vendor greets you warmly: "مساء الفل يا فندم!" Instant reply:',
          options: [
            'مساء الياسمين يا باشا، ده نورك!',
            'أنا لا أتكلم اللغة العربية الفصحى.',
            'المتحف مغلق اليوم بسبب الإجازة.',
            'أين محطة القطار الرئيسية؟'
          ],
          correctAnswer: 'مساء الياسمين يا باشا، ده نورك!',
          explanation: '"Masa2 el-yasmeen ya basha, da noorak!" is the definitive warm Egyptian counter-greeting.',
          culturalTip: 'In Egypt, returning a compliment with greater warmth ("ده نورك") is foundational etiquette.'
        },
        {
          id: 3,
          type: 'word_order',
          prompt: 'Assemble: "Five minutes and I will be right there with you, on my way!":',
          nativePhrase: 'خمس دقائق وأكون عندك في السكة',
          correctAnswer: ['خمس', 'دقائق', 'وأكون', 'عندك', 'في', 'السكة'],
          explanation: '"في السكة" (fel-sekka) is the ubiquitous Cairene expression for "on the way".',
          culturalTip: 'Indicates reliable arrival in fast Cairo transit.'
        }
      ]);
    } else {
      return randomizeExercises([
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
      ]);
    }
  }

  // ============================================================================
  // ARCADE: 1V1 STREET DEBATE (Boss encounter)
  // ============================================================================
  if (lessonId === 'arcade_debate') {
    if (isDarija) {
      return randomizeExercises([
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'CASABLANCA DEBATER: "سمع أ خويا، الطاجين ديال مراكش ما كاينش بحالو، كازا فيها غير الزربة والخدمة!"',
          options: [
            'مراكش واعرة أ خويا، ولكن كازا فيها الحوت طري في المرسى وأحسن كسكسو نهار الجمعة!',
            'أنا لا أحب الأكل المغربي على الإطلاق.',
            'أنت لا تفهم شيئاً في الطبخ.',
            'سأغادر المطعم الآن بدون نقاش.'
          ],
          correctAnswer: 'مراكش واعرة أ خويا، ولكن كازا فيها الحوت طري في المرسى وأحسن كسكسو نهار الجمعة!',
          explanation: 'Honoring Marrakech while defending Casablanca port seafood and Friday couscous wins instant respect.',
          culturalTip: 'Friendly regional food rivalries between Casa, Marrakech, and Fes are a beloved Moroccan pastime.'
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'CASABLANCA DEBATER: "إيوا قول ليا، أتاي واش كيتشرب حلو ولا مسوس في القهوة؟"',
          options: [
            'أتاي خاصو يكون مشحر مزيان وبالنعناع الطري والرزيزة سخونة أ المعلم!',
            'أنا أشرب القهوة الأمريكية الباردة فقط.',
            'الشاي الأخضر مضر بالصحة.',
            'لا تتحدث معي بهذا الأسلوب.'
          ],
          correctAnswer: 'أتاي خاصو يكون مشحر مزيان وبالنعناع الطري والرزيزة سخونة أ المعلم!',
          explanation: 'Specifying "atay msha77ar" with fresh mint and hot Rziza pastry proves true local mastery.',
          culturalTip: 'Pouring mint tea from high up creates the signature foam ("kaskouza").'
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'CASABLANCA DEBATER (Laughing warmly): "تبارك الله عليك! راك ولد البلاد قح، البراد الجاي ديال أتاي على حسابي!"',
          options: [
            'الله يكبر بيك أ خويا، والحلويات المغربية على حسابي أنا!',
            'كنت أعرف أنني سأهزمك بسهولة.',
            'لا أقبل الهدايا من الغرباء.',
            'مع السلامة.'
          ],
          correctAnswer: 'الله يكبر بيك أ خويا، والحلويات المغربية على حسابي أنا!',
          explanation: '"Allah ykabbar bik" (May God honor you) is the warmest Moroccan blessing when someone treats you.',
          culturalTip: 'Sharing tea and pastries seals lifelong friendship in Morocco.'
        }
      ]);
    } else if (isAr) {
      return randomizeExercises([
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'CAIRENE DEBATER: "اسمع يا صاحبي، الكشري الأصلي في وسط البلد بس، أي حتة تانية تقليد!"',
          options: [
            'وسط البلد على عيني وراسي يا معلم، بس السر كله في الدقة والشطة والصلصة المسبكة!',
            'أنا لا أحب تناول الكشري أبداً.',
            'رأيك غير صحيح على الإطلاق.',
            'سأذهب إلى الفندق الآن.'
          ],
          correctAnswer: 'وسط البلد على عيني وراسي يا معلم، بس السر كله في الدقة والشطة والصلصة المسبكة!',
          explanation: '"3ala 3eini w-rasi" calmly diffuses Egyptian debate tension while asserting nuanced local knowledge.',
          culturalTip: 'Mentioning "الدقة والشطة" (garlic sauce & chili) proves you understand authentic koshari culture.'
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'CAIRENE DEBATER: "طب قولي يا فنان، القعدة الحلوة بالليل تحلى بإيه على القهوة البلدي؟"',
          options: [
            'واحد شاي في الخمسينة بالنعناع، ونظبط الدماغ مع أحلى صحبة!',
            'أفضل شرب العصير المعلب في الغرفة.',
            'القهوة البلدي مزدحمة جداً.',
            'لا أعرف الإجابة.'
          ],
          correctAnswer: 'واحد شاي في الخمسينة بالنعناع، ونظبط الدماغ مع أحلى صحبة!',
          explanation: 'Ordering tea "في الخمسينة" (strong in a small glass) shows deep mastery of Ahwa Baladi customs.',
          culturalTip: '"نظبط الدماغ" means getting your mind properly focused and relaxed.'
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'CAIRENE DEBATER (ضاحكاً): "ده أنت ابن بلد بصحيح! المشاريب الليلة دي عندي أنا!"',
          options: [
            'تسلم يا غالي، خيرك سابق، والمرة الجاية عندي أنا إن شاء الله!',
            'كان فوزي مؤكداً منذ البداية.',
            'لا أشرب الشاي مع أحد.',
            'وداعاً.'
          ],
          correctAnswer: 'تسلم يا غالي، خيرك سابق، والمرة الجاية عندي أنا إن شاء الله!',
          explanation: '"Teslam ya ghali, kheirak sabe2" is the warmest street blessing when a peer treats you.',
          culturalTip: 'Closing an argument by bonding over tea seals lifetime respect in Cairo.'
        }
      ]);
    }
    return randomizeExercises([
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
    ]);
  }

  // ============================================================================
  // LESSON 1: Street Greetings & First Contact (l1)
  // ============================================================================
  if (lessonId === 'l1') {
    if (isDarija) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the Moroccan street greeting and pick the true meaning:',
          nativePhrase: 'السلام أ خويا! لباس عليك؟ كلشي بخير؟',
          audioLang: 'ar-MA',
          options: [
            'Peace my brother! How are you? Is everything good?',
            'Where is the entrance to the royal palace?',
            'How many kilometers to the beach?',
            'What is the price of this leather bag?'
          ],
          correctAnswer: 'Peace my brother! How are you? Is everything good?',
          explanation: '"Salam a khoya! Labas 3lik? Kulshi bikhir?" is the #1 everyday greeting across Morocco.',
          culturalTip: 'In Morocco, "Labas" literally means "no harm", and is used both to ask "How are you?" and reply "I am fine!"',
          wordGlossary: { 'خويا': 'my brother', 'لباس عليك': 'how are you', 'كلشي بخير': 'everything good' }
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble the authentic Moroccan reply: "Everything is good, praise be to God, my brother":',
          nativePhrase: 'كلشي مزيان الحمد لله أ خويا',
          correctAnswer: ['كلشي', 'مزيان', 'الحمد', 'لله', 'أ', 'خويا'],
          explanation: '"Kulshi mezyan l-7amdulillah a khoya" is warm, natural, and spoken everywhere from Tangier to Marrakech.',
          culturalTip: '"Mezyan" (good/great) is one of the most essential words in Moroccan Darija.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'When greeting a friend or shopkeeper in Casablanca, calling a man "أ خويا" (A khoya) or a woman "أ ختي" (A khti) accomplishes what?',
          options: [
            'Establishes instant family-like warmth, trust, and respectful street rapport.',
            'Claims that you are legally related by blood.',
            'Demands an immediate refund on your purchase.',
            'Signals that you do not speak any Arabic.'
          ],
          correctAnswer: 'Establishes instant family-like warmth, trust, and respectful street rapport.',
          explanation: 'Addressing locals as "my brother" (khoya) or "my sister" (khti) is the heartbeat of Moroccan social warmth.',
          culturalTip: 'Use "خويا" (khoya) and "ختي" (khti) daily to sound like a welcomed insider.'
        },
        {
          id: 4,
          type: 'roleplay',
          prompt: 'Your Moroccan friend spots you at a café and asks: "أش كتعاود؟ غبرتي علينا!" (What\'s new? We haven\'t seen you in a while!). Best reply:',
          options: [
            'غير مع الخدمة وصافي أ عشيري، ولكن راك ديما في البال!',
            'أنا لا أعرف اسمك الكامل.',
            'الطقس بارد جداً في أوروبا.',
            'أغلق الهاتف من فضلك.'
          ],
          correctAnswer: 'غير مع الخدمة وصافي أ عشيري، ولكن راك ديما في البال!',
          explanation: '"Ghir m3a l-khedma w safi a 3shiri, walakin rak dima f-l-bal!" (Just busy with work my friend, but you are always on my mind!) is peak Moroccan warmth.',
          culturalTip: '"غبرتي" (ghberti = you disappeared) is an affectionate way Moroccans say they missed you.'
        }
      ]);
    } else if (isFr) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to Parisian street verlan and identify the meaning:',
          nativePhrase: "Wesh gros, ça dit quoi aujourd'hui ?",
          audioLang: 'fr-FR',
          options: [
            "Yo bro, what's good today?",
            'Excuse me sir, where is the museum?',
            'What is the total price for lunch?',
            'Can I borrow your bicycle?'
          ],
          correctAnswer: "Yo bro, what's good today?",
          explanation: '"Wesh" and "gros" are ubiquitous urban French youth greetings.',
          culturalTip: 'Saying "ça dit quoi ?" is the Parisian street equivalent of "What\'s up?".',
          wordGlossary: { wesh: 'yo/what up', gros: 'bro/dude', 'ça dit quoi': "what's the word" }
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
            "It's been a really long time since we last saw each other!",
            'They are offering to lease an apartment to you.',
            'They are complaining about the hot summer weather.',
            'They forgot your legal name.'
          ],
          correctAnswer: "It's been a really long time since we last saw each other!",
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
      ]);
    } else if (isJa) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to this natural Tokyo casual greeting:',
          nativePhrase: 'よ！久しぶり！最近どうしてた？',
          audioLang: 'ja-JP',
          options: [
            "Hey! Long time no see! How've things been lately?",
            'Good morning teacher, here is my homework.',
            'Please show me the train platform timetable.',
            'Is the convenience store still open tonight?'
          ],
          correctAnswer: "Hey! Long time no see! How've things been lately?",
          explanation: '"Yo! Hisashiburi!" is the casual everyday greeting between friends in Tokyo.',
          culturalTip: 'Textbooks teach "Konnichiwa", but peers and friends almost always greet with "Hisashiburi!" or "Yaa!".'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble: "Everything is going well, staying energetic as always":',
          nativePhrase: '相変わらず 元気に してるよ',
          correctAnswer: ['相変わらず', '元気に', 'してるよ'],
          explanation: '"Aikawarazu genki ni shiteru yo" means "staying energetic as always", a quintessential Japanese reply.',
          culturalTip: 'Adding the "yo" particle gives a friendly conversational cadence.'
        },
        {
          id: 3,
          type: 'fill_blank',
          prompt: 'Complete the casual parting formula: "See you next week without fail!":',
          nativePhrase: 'じゃあ、また___ね！',
          options: ['来週 (raishuu)', '冷蔵庫 (reizouko)', '図書館 (toshokan)', '自転車 (jitensha)'],
          correctAnswer: '来週 (raishuu)',
          explanation: '"Jaa mata raishuu ne" is how friends wrap up meetups.',
          culturalTip: 'A quick bow and wave accompanying "Jaa mata!" shows effortless familiarity.'
        }
      ]);
    } else if (isPt) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the laid-back Carioca beach greeting:',
          nativePhrase: 'Fala meu parceiro! Tranquilidade total por aí?',
          audioLang: 'pt-BR',
          options: [
            "What's up my partner! Everything completely chill on your side?",
            'What is the price of a coconut at the boardwalk kiosk?',
            'Can you guide me towards the football stadium?',
            'Did the rain stop over the coastline?'
          ],
          correctAnswer: "What's up my partner! Everything completely chill on your side?",
          explanation: '"Tranquilidade" and "fala meu parceiro" are hallmark Rio greetings.',
          culturalTip: 'Warm physical gestures (a light hug or arm-clasp) always match spoken greetings in Rio.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble: "Smooth sailing, enjoying the beach":',
          nativePhrase: 'Tudo suave curtindo a praia',
          correctAnswer: ['Tudo', 'suave', 'curtindo', 'a', 'praia'],
          explanation: '"Suave" and "curtir" are foundational Brazilian slang words.',
          culturalTip: '"Curtir" means enjoying, digging, or loving an experience.'
        }
      ]);
    } else if (isAr) {
      return randomizeExercises([
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
          wordGlossary: { 'إزيك': 'how are you', 'باشا': 'boss/chief', 'عامل إيه': 'how are you doing' }
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
          explanation: '"Basha" and "Rayyes" are affectionate street titles used to show warm deference and friendliness.',
          culturalTip: 'Using street titles shows you understand local culture and aren\'t just reading from a tourist guidebook.'
        },
        {
          id: 4,
          type: 'roleplay',
          prompt: 'Your Egyptian friend spots you at a café and calls out: "عاش من شافك يا غالي!" Best reply:',
          options: [
            'حبيبي والله الدنيا مشاغل، بس أنت في البال على طول!',
            'أنا لا أعرف هذا المكان.',
            'أين محطة المترو القريبة؟',
            'الحساب لو سمحت.'
          ],
          correctAnswer: 'حبيبي والله الدنيا مشاغل، بس أنت في البال على طول!',
          explanation: '"7abibi wallah el-donya mashaghel, bas enta fel-bal 3ala tool!" is warm Egyptian social diplomacy.',
          culturalTip: 'Affectionate banter about being missed is a sign of deep friendship in Egypt.'
        }
      ]);
    } else {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to the native street greeting and pick the true meaning:',
          nativePhrase: '¡Qué onda güey! ¿A dónde le vas a dar?',
          audioLang: 'es-MX',
          options: [
            "What's up bro! Where are you heading?",
            'What time is the train leaving for town?',
            'How much does this taxi ride cost?',
            'Are you the inspector for this station?'
          ],
          correctAnswer: "What's up bro! Where are you heading?",
          explanation: '"¡Qué onda!" and "güey" are quintessential everyday Mexican street vernacular.',
          culturalTip: 'Standard textbooks teach "¿Cómo está usted?", but on the streets of CDMX, friends always use "¡Qué onda!".',
          wordGlossary: { onda: 'vibe/wave', güey: 'dude/bro', 'le vas a dar': 'you heading to' }
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
          prompt: 'Complete the sentence with the warm regional slang for close friend:',
          nativePhrase: 'Hola ___, ¿cómo te fue hoy en la chamba?',
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
      ]);
    }
  }

  // ============================================================================
  // LESSON 2: Transport, Hailing Cabs & Directions (l2)
  // ============================================================================
  if (lessonId === 'l2') {
    if (isDarija) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'A red Petit Taxi in Casablanca pulls up. Listen to what you ask the driver:',
          nativePhrase: 'السلام الشريف، عافاك غادي للمدينة القديمة؟ خدم الكونتور عافاك!',
          audioLang: 'ar-MA',
          options: [
            'Peace respected sir, are you going to the Old Medina? Turn on the meter please!',
            'Can you sell me this taxi car for cash?',
            'Where is the airport in Marrakech?',
            'Do you have food inside the trunk?'
          ],
          correctAnswer: 'Peace respected sir, are you going to the Old Medina? Turn on the meter please!',
          explanation: '"Khaddem l-compteur 3afak" (Turn on the meter please) is the #1 essential taxi phrase in Casablanca and Rabat.',
          culturalTip: 'Addressing a driver respectfully as "الشريف" (Shrif) or "المعلم" (M3allem) gets immediate cooperation.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Direct the Moroccan taxi driver: "Drop me off right here on the corner please":',
          nativePhrase: 'حطني غير هنا في القنت عافاك',
          correctAnswer: ['حطني', 'غير', 'هنا', 'في', 'القنت', 'عافاك'],
          explanation: '"7attni ghir hna f-l-qent 3afak" is how locals ask to be dropped off on the corner.',
          culturalTip: 'Always carry small 10 and 20 Dirham notes for Petit Taxis.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'In Morocco, what is the difference between a "Petit Taxi" and a "Grand Taxi"?',
          options: [
            'Petit Taxis use meters inside city limits; Grand Taxis run shared fixed routes between districts or cities.',
            'Petit Taxis are only for children under ten.',
            'Grand Taxis are free of charge on weekends.',
            'Petit Taxis only operate on water.'
          ],
          correctAnswer: 'Petit Taxis use meters inside city limits; Grand Taxis run shared fixed routes between districts or cities.',
          explanation: 'Knowing when to hail a metered Petit Taxi vs. a shared Grand Taxi saves time and money across Morocco.',
          culturalTip: 'Each Moroccan city paints its Petit Taxis a signature color (red in Casa, blue in Rabat, ochre in Marrakech).'
        }
      ]);
    } else if (isFr) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'Listen to Parisian transport directions:',
          nativePhrase: "Prends la ligne 4 et change à Châtelet, c'est direct !",
          audioLang: 'fr-FR',
          options: [
            "Take line 4 and transfer at Châtelet, it's direct!",
            'Buy four tickets before entering the bus.',
            'The metro is completely closed for renovations.',
            'You must take a taxi to reach Châtelet.'
          ],
          correctAnswer: "Take line 4 and transfer at Châtelet, it's direct!",
          explanation: "Châtelet-Les Halles is Paris's central transport hub. Navigating transfers smoothly is key.",
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
      ]);
    } else if (isJa) {
      return randomizeExercises([
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
          nativePhrase: 'あの信号の 手前で 大丈夫です',
          correctAnswer: ['あの信号の', '手前で', '大丈夫です'],
          explanation: '"Temae de daijoubu desu" is the standard phrase for "right before [landmark] is fine".',
          culturalTip: 'Saying this with polite inflection signals an effortless local cadence.'
        }
      ]);
    } else if (isPt) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: "Hailing a taxi in Rio. Listen to the driver's question:",
          nativePhrase: 'Bora chefe! Pega a Linha Vermelha ou vai por dentro?',
          audioLang: 'pt-BR',
          options: [
            "Let's go boss! Take the expressway (Linha Vermelha) or through local streets?",
            'Do you want to split this ride with another passenger?',
            'The road to the beach is blocked for carnival.',
            'What is the license number of your destination?'
          ],
          correctAnswer: "Let's go boss! Take the expressway (Linha Vermelha) or through local streets?",
          explanation: '"Linha Vermelha" is Rio\'s major arterial route. Drivers always ask for route preference.',
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
      ]);
    } else if (isAr) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'A Cairo white cab pulls up and rolls down the window. Listen:',
          nativePhrase: 'يا أسطى، على وسط البلد لو سمحت؟ الطريق سالك ولا زحمة؟',
          audioLang: 'ar-EG',
          options: [
            'Driver, to Downtown please? Is the street moving or jammed?',
            'Can you take me to the airport for five dollars?',
            'What year was this taxi manufactured?',
            'Where is the nearest police station?'
          ],
          correctAnswer: 'Driver, to Downtown please? Is the street moving or jammed?',
          explanation: '"Ya osta" is the respectful title for drivers, and "salek" means traffic is flowing smoothly.',
          culturalTip: 'Cairenes state the destination through the passenger window first before hopping in.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble the cash query: "Do you have small change, boss, or only a 200-pound bill?":',
          nativePhrase: 'معاك فكة يا ريس ولا ميتين جنيه؟',
          correctAnswer: ['معاك', 'فكة', 'يا', 'ريس', 'ولا', 'ميتين', 'جنيه؟'],
          explanation: 'Asking "معاك فكة" (do you have change) avoids awkward deadlocks when paying with large bills.',
          culturalTip: 'Small bills (10, 20, 50 LE) are essential when traveling through Cairo in white cabs.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'When you want the driver in Cairo to pull over and let you out right here, what do you say?',
          options: [
            'على جنب هنا لو سمحت يا أسطى، كام الحساب؟',
            'أغلق المحرك فوراً واركب في الخلف.',
            'السيارة تسير بسرعة بطيئة جداً.',
            'أنا لا أحمل أي نقود اليوم.'
          ],
          correctAnswer: 'على جنب هنا لو سمحت يا أسطى، كام الحساب؟',
          explanation: 'Asking to be dropped on the side ("على جنب هنا") and inquiring about the fare ("كام الحساب") is authentic.',
          culturalTip: 'Saying "على جنب" (on the side) is the standard signal to pull over in Arab transit.'
        }
      ]);
    } else {
      return randomizeExercises([
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
      ]);
    }
  }

  // ============================================================================
  // LESSON 3: Ordering Local Street Food & Café Banter (l3)
  // ============================================================================
  if (lessonId === 'l3') {
    if (isDarija) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'At a Casablanca street café or snack shop, listen to the order:',
          nativePhrase: 'عطيني واحد الطاجين ديال اللحم بالبرقوق وبرّاد ديال أتاي مشحر عافاك!',
          audioLang: 'ar-MA',
          options: [
            'Give me one beef tagine with prunes and a pot of brewed mint tea please!',
            'Can I have a cup of cold milk without sugar?',
            'Where can I purchase Moroccan postage stamps?',
            'Do you serve sushi in this café?'
          ],
          correctAnswer: 'Give me one beef tagine with prunes and a pot of brewed mint tea please!',
          explanation: '"Tajine dyal l-l7am b-l-barqouq" and "berrad dyal atay msha77ar" are iconic Moroccan culinary staples.',
          culturalTip: 'In Morocco, tagine is eaten communally from the clay dish using pieces of fresh bread ("khobz") with your right hand.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Order a classic Moroccan café coffee: "One half-coffee half-milk (Nous-Nous), please":',
          nativePhrase: 'واحد قهوة نص نص عافاك أ خويا',
          correctAnswer: ['واحد', 'قهوة', 'نص', 'نص', 'عافاك', 'أ', 'خويا'],
          explanation: '"Qahwa nous-nous" (literally half-half: half espresso, half steamed milk) is Morocco\'s most famous café coffee order.',
          culturalTip: 'Ordering a "nous-nous" at a terrace café makes you sound like an instant Casablanca local.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'When finishing a delicious meal in Morocco, what do you say to thank the chef or host?',
          options: [
            'الله يعطيك الصحة! الماكلة بنينة بزاف!',
            'الأكل بارد جداً ولا يعجبني.',
            'أريد الذهاب إلى المحكمة فوراً.',
            'أين مفتاح الغرفة؟'
          ],
          correctAnswer: 'الله يعطيك الصحة! الماكلة بنينة بزاف!',
          explanation: '"Allah ya3tik s-sa77a! L-makla bnina bezzaf!" (May God give you health! The food is super delicious!) is the ultimate Moroccan compliment.',
          culturalTip: '"بنينة بزاف" (bnina bezzaf) means super tasty/delicious.'
        }
      ]);
    } else if (isFr) {
      return randomizeExercises([
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
            'Yell "Garçon !" across the dining room.',
            'Walk out into the street and wait for them to find you.'
          ],
          correctAnswer: '"L\'addition s\'il vous plaît" with a polite nod.',
          explanation: '"L\'addition s\'il vous plaît" is the only polite formula; shouting "Garçon" is archaic and rude.',
          culturalTip: 'Waiters respect calm eye contact and a gentle "L\'addition s\'il vous plaît".'
        }
      ]);
    } else if (isJa) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'The ramen chef calls out from behind the counter:',
          nativePhrase: 'いらっしゃいませ！麺の硬さはどうしますか？',
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
          nativePhrase: '豚骨ラーメン 麺硬めで お願いします',
          correctAnswer: ['豚骨ラーメン', '麺硬めで', 'お願いします'],
          explanation: '"Katame de onegai shimasu" is the classic ramen enthusiast order.',
          culturalTip: "Slurping noodles loudly is considered a sign of savoring the chef's broth."
        }
      ]);
    } else if (isPt) {
      return randomizeExercises([
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
          explanation: '"Pastel de feira" is Brazil\'s ultimate street snack, paired with sugarcane juice (caldo de cana).',
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
      ]);
    } else if (isAr) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'At a Cairo koshari counter or street ahwa, listen to the order:',
          nativePhrase: 'واحد كشري كمالة وزود الدقة والشطة لو سمحت!',
          audioLang: 'ar-EG',
          options: [
            'A mixed koshari bowl, and go heavy on the garlic sauce and hot chili please',
            'Can I have a cup of black coffee without milk?',
            'Where can I purchase Egyptian souvenir stamps?',
            'Do you serve Italian pasta in this shop?'
          ],
          correctAnswer: 'A mixed koshari bowl, and go heavy on the garlic sauce and hot chili please',
          explanation: '"Daqqa" (tangy garlic-vinegar sauce) and "shatta" (spicy red chili sauce) define authentic koshari.',
          culturalTip: 'Saying "زود الدقة والشطة" proves you eat like an authentic Cairene.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Order the iconic Egyptian tea: "One strong tea in a small glass with mint, boss":',
          nativePhrase: 'واحد شاي في الخمسينة بالنعناع يا ريس',
          correctAnswer: ['واحد', 'شاي', 'في', 'الخمسينة', 'بالنعناع', 'يا', 'ريس'],
          explanation: '"Shay fel-5amseenah" means strong black tea brewed with precision in a small glass tumbler.',
          culturalTip: 'Egyptians sip tea from glasses rather than mugs to appreciate the color and warmth.'
        },
        {
          id: 3,
          type: 'context',
          prompt: 'In an Egyptian street restaurant or ahwa baladi, how do you politely request the bill with warm blessings?',
          options: [
            'الحساب لو سمحت يا باشا، ربنا يخليك!',
            'أعطني المال الآن بدون كلام.',
            'الأكل غير ناضج تماماً.',
            'أين المطار الدولي؟'
          ],
          correctAnswer: 'الحساب لو سمحت يا باشا، ربنا يخليك!',
          explanation: '"El-7esab law sama7t ya basha, rabbena yi5alleek" asks for the check with traditional Egyptian hospitality.',
          culturalTip: 'Adding "ربنا يخليك" (may God preserve you) is universally appreciated by working locals.'
        }
      ]);
    } else {
      return randomizeExercises([
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
          prompt: 'Order like a native: "Two tacos al pastor, with pineapple, crispy please":',
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
          explanation: "When a local vendor says salsa doesn't burn, it still contains jalapeño or serrano!",
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
      ]);
    }
  }

  // ============================================================================
  // BOSS BATTLE 1: The Hardline Transit Inspector (b1)
  // ============================================================================
  if (lessonId === 'b1') {
    if (isDarija) {
      return randomizeExercises([
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'CASA TRAMWAY INSPECTOR: "السلام! الكونطرول ديال التذاكر. البطاقة ديالك ما دازتش في الماكينة، خاصك تخلص الغرامة."',
          options: [
            'سمح ليا أ الشريف، الماكينة ديال المحطة كانت طافية، وها التذكرة شريتها من التطبيق في التليفون!',
            'أنا لن أدفع أي درهم واحد في هذا الترامواي!',
            'أنت لا تعرف القوانين هنا.',
            'سأقفز من النافذة الآن.'
          ],
          correctAnswer: 'سمح ليا أ الشريف، الماكينة ديال المحطة كانت طافية، وها التذكرة شريتها من التطبيق في التليفون!',
          explanation: 'Politely addressing the inspector as "أ الشريف" (respected sir) and showing your mobile ticket resolves the issue immediately.',
          culturalTip: 'Calm respect ("سمح ليا أ الشريف") diffuses official tension anywhere in Morocco.'
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'CASA TRAMWAY INSPECTOR: "واخا، وريني التوقيت ديال الخلاص في التليفون باش نتأكد عافاك."',
          options: [
            'ها هي أ سيدي، تقطعات غير دابا خمسة دقائق قبل ما نركب، الله يرحم الوالدين!',
            'هاتفي سري للغاية ولن أريك شيئاً.',
            'ليس لدي بطارية في الهاتف.',
            'أريد التحدث مع المدير العام.'
          ],
          correctAnswer: 'ها هي أ سيدي، تقطعات غير دابا خمسة دقائق قبل ما نركب، الله يرحم الوالدين!',
          explanation: 'Using the beloved Moroccan blessing "الله يرحم الوالدين" (May God have mercy on your parents) wins every heart in Morocco.',
          culturalTip: '"Allah y-r7am l-walidin" is the most powerful polite expression in Moroccan Darija.'
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'CASA TRAMWAY INSPECTOR (Smiling): "صافي كلشي مريكل أ خويا! مرحبا بيك في الدار البيضاء وطريق السلامة!"',
          options: [
            'بارك الله فيك أ الشريف، الله يعاونك في الخدمة ديالك!',
            'لقد أضعت وقتي بدون سبب.',
            'وداعاً.',
            'سأقدم شكاية رسمية.'
          ],
          correctAnswer: 'بارك الله فيك أ الشريف، الله يعاونك في الخدمة ديالك!',
          explanation: '"Allah y3awnek" (May God help you in your work) is the standard warm parting blessing for anyone working in Morocco.',
          culturalTip: 'Always wish workers "الله يعاونك" (Allah y3awnek) when leaving.'
        }
      ]);
    } else if (isFr) {
      return randomizeExercises([
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'CONTRÔLEUR RATP: "Bonjour, contrôle des titres de transport. Votre pass Navigo n\'a pas bippé au portillon, vous êtes en infraction."',
          options: [
            "Bonjour monsieur. La borne 4 affichait un écran noir en panne, c'est pour cela que je me dirigeais directement vers votre guichet pour régulariser.",
            'Vous êtes un voleur et je refuse de vous parler !',
            'Je ne paie jamais dans le métro parisien.',
            'Prenez mes chaussures et laissez-moi partir.'
          ],
          correctAnswer: "Bonjour monsieur. La borne 4 affichait un écran noir en panne, c'est pour cela que je me dirigeais directement vers votre guichet pour régulariser.",
          explanation: 'Politely citing the broken machine and showing proactive intent to regularize diffuses confrontation immediately.',
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
            'Je vais crier très fort dans la station.'
          ],
          correctAnswer: "Voici mon reçu d'abonnement mensuel validé ce matin à 8h30 sur l'application Île-de-France Mobilités.",
          explanation: 'Producing prompt digital validation clears all doubt of fare evasion.',
          culturalTip: 'Keep your digital receipt or Navigo notification handy when traveling through major Paris hubs.'
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'CONTRÔLEUR RATP (Souriant en validant le badge): "C\'est tout bon, l\'incident technique est confirmé sur la borne. Bonne journée et bon trajet !"',
          options: [
            'Merci beaucoup pour votre aide monsieur le contrôleur, bonne fin de service à vous !',
            "C'était bien la peine de me faire perdre mon temps.",
            'Au revoir sans façon.',
            'Je vais déposer une plainte officielle.'
          ],
          correctAnswer: 'Merci beaucoup pour votre aide monsieur le contrôleur, bonne fin de service à vous !',
          explanation: "Ending on 'Bonne fin de service' leaves great mutual respect.",
          culturalTip: "Wishing workers 'bonne fin de service' or 'bon courage' marks effortless French social fluency."
        }
      ]);
    } else if (isJa) {
      return randomizeExercises([
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: '駅員 (STATION MASTER): "お客様、少々お待ちください。改札でエラーが出ましたが、切符の区間が足りていません。"',
          options: [
            'すみません！うっかり乗り過ごしてしまいました。ここで乗り越し精算をお願いできますか？',
            '私は決してお金を払いません！',
            '改札の機械が壊れていると思います。',
            '日本語が全くわかりません。'
          ],
          correctAnswer: 'すみません！うっかり乗り過ごしてしまいました。ここで乗り越し精算をお願いできますか？',
          explanation: "Apologizing promptly with 'sumimasen' and asking for 'norikoshi seisan' (fare adjustment) solves the issue smoothly.",
          culturalTip: 'Station staff in Japan appreciate immediate honesty and respectful Keigo.'
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: '駅員: "かしこまりました。どちらの駅からご乗車されましたか？"',
          options: [
            '渋谷駅から乗りました。差額はSuicaで払えますか？',
            'どこから乗ったか忘れました。',
            '切符を捨ててしまいました。',
            'お金を持っていません。'
          ],
          correctAnswer: '渋谷駅から乗りました。差額はSuicaで払えますか？',
          explanation: 'Stating the origin station clearly allows instant calculation.',
          culturalTip: 'Handing over your card or coins with two hands into the tray shows classic Japanese courtesy.'
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: '駅員 (笑顔で): "はい、精算完了いたしました。お気をつけていってらっしゃいませ！"',
          options: [
            'ご丁寧にありがとうございます！助かりました！',
            '時間がかかって迷惑でした。',
            'さようなら。',
            '二度とこの駅は使いません。'
          ],
          correctAnswer: 'ご丁寧にありがとうございます！助かりました！',
          explanation: "Expressing gratitude ('Tasukarimashita!') leaves the station master deeply impressed by your cultural command.",
          culturalTip: 'A light bow and warm thank-you seals standard Tokyo social grace.'
        }
      ]);
    } else if (isAr) {
      return randomizeExercises([
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'CAIRO METRO INSPECTOR: "ثانية واحدة يا أستاذ! التذكرة دي لعدد محطات أقل، كده عليك غرامة فورية."',
          options: [
            'حقك عليا يا باشا، أنا نزلت المحطة دي بالغلط وكنت رايح شباك التذاكر أدفع فرق المحطات فوراً.',
            'أنا لن أدفع أي غرامة في المترو!',
            'الماكينة لا تعمل بشكل جيد.',
            'أريد التحدث مع وزير النقل.'
          ],
          correctAnswer: 'حقك عليا يا باشا، أنا نزلت المحطة دي بالغلط وكنت رايح شباك التذاكر أدفع فرق المحطات فوراً.',
          explanation: '"7a22ak 3alaya ya basha" shows instant respect for authority while explaining politely.',
          culturalTip: 'Egyptian officials appreciate calm, respectful street greetings ("حقك عليا يا باشا").'
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'CAIRO METRO INSPECTOR: "طب وريني التذكرة كده، أنت راكب من محطة إيه بالظبط؟"',
          options: [
            'اتفضل يا ريس، راكب من محطة السادات، وده فرق التذكرة جاهز مع خالص احترامي.',
            'لن أعطيك التذكرة أبداً.',
            'نسيت اسم المحطة.',
            'معنديش فكة خالص.'
          ],
          correctAnswer: 'اتفضل يا ريس، راكب من محطة السادات، وده فرق التذكرة جاهز مع خالص احترامي.',
          explanation: 'Offering transparency with a welcoming smile ("اتفضل يا ريس") diffuses suspicion.',
          culturalTip: 'Being open and friendly is the fastest way to resolve informal checks in Cairo.'
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'CAIRO METRO INSPECTOR (مبتسماً): "خلاص يا سيدي حصل خير، اتفضل عدّي ونورت القاهرة!"',
          options: [
            'ربنا يكرمك يا باشا، كلك ذوق والله! نهارك زي الفل!',
            'شكراً، تأخرت كثيراً.',
            'مع السلامة.',
            'لن أركب المترو مرة أخرى.'
          ],
          correctAnswer: 'ربنا يكرمك يا باشا، كلك ذوق والله! نهارك زي الفل!',
          explanation: '"Rabbena yekremak ya basha, kollak zo2" is the perfect concluding blessing of mutual street respect.',
          culturalTip: 'Leaving an official checkpoint with polite blessings leaves an open door and positive reputation.'
        }
      ]);
    } else {
      return randomizeExercises([
        {
          id: 1,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'INSPECTOR: "¡Alto ahí! Su boleto no tiene el sello de transferencia válido. La multa es inmediata a menos que tenga una explicación razonable."',
          options: [
            'Buenas tardes oficial. La máquina del andén 3 no tenía tinta, por eso vine directo con usted para que me ayude a sellarlo.',
            '¡Usted es un corrupto y exijo ver a su embajador ahora mismo!',
            'Yo no hablo nada de español, déjeme pasar gratis.',
            'Tome mi billetera y quédese con todo el dinero.'
          ],
          correctAnswer: 'Buenas tardes oficial. La máquina del andén 3 no tenía tinta, por eso vine directo con usted para que me ayude a sellarlo.',
          explanation: 'Calmly pointing to a broken platform machine and asking him to help acknowledges his authority and diffuses anger.',
          culturalTip: 'Officials respond to calm respect and procedural logic, never aggression.'
        },
        {
          id: 2,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 35,
          prompt: 'INSPECTOR: "¿Y cómo sé yo que no se saltó el torniquete como hacen los demás turistas irresponsables?"',
          options: [
            'Mire mi recibo digital con la hora exacta en mi teléfono hace 10 minutos. Vengo de manera honesta, écheme la mano por favor.',
            'Porque yo soy de un país superior y allá no hacemos eso.',
            'Si no me deja pasar voy a gritar muy fuerte en la estación.',
            'Pagaré la multa si me da un descuento especial.'
          ],
          correctAnswer: 'Mire mi recibo digital con la hora exacta en mi teléfono hace 10 minutos. Vengo de manera honesta, écheme la mano por favor.',
          explanation: 'Producing timestamped digital proof with "écheme la mano por favor" appeals to his human empathy.',
          culturalTip: '"Écheme la mano" flips his role from enforcer to helper.'
        },
        {
          id: 3,
          type: 'roleplay',
          isBossBattle: true,
          bossHpDamage: 30,
          prompt: 'INSPECTOR (Sonriendo levemente): "Está bien, por esta vez se la paso. Pero cuide sus documentos. ¿A dónde se dirige para darle la salida rápida?"',
          options: [
            '¡Muchísimas gracias jefe, le debo una! Voy para la salida norte hacia el centro.',
            'Ya era hora, qué servicio tan lento.',
            'No le voy a decir a dónde voy porque es privado.',
            'Adiós oficial sin modales.'
          ],
          correctAnswer: '¡Muchísimas gracias jefe, le debo una! Voy para la salida norte hacia el centro.',
          explanation: '"¡Le debo una jefe!" cements a warm parting and shows native interpersonal warmth.',
          culturalTip: 'Ending on a warm handshake or nod builds lifelong good street karma.'
        }
      ]);
    }
  }

  // ============================================================================
  // LESSON 4: Artisan Market Haggling & Bargaining (l4)
  // ============================================================================
  if (lessonId === 'l4') {
    if (isDarija) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'In the Old Medina souk in Marrakech or Fes, listen to the artisan:',
          nativePhrase: 'مرحبا بيك! هاد الزربية مخدومة باليد، ولكن على حسابك ندير معاك ثمن زوين!',
          audioLang: 'ar-MA',
          options: [
            'Welcome! This rug is handmade, but for you I will make a nice price!',
            'This shop is closed for prayer right now.',
            'We only accept foreign credit cards.',
            'Where is the bus station?'
          ],
          correctAnswer: 'Welcome! This rug is handmade, but for you I will make a nice price!',
          explanation: '"Makhdouma b-l-yed" (handmade) and "ndir m3ak taman zwin" (I\'ll make a good price with you) are classic souk phrases.',
          culturalTip: 'Bargaining in Morocco is a friendly social dance over mint tea, never a hostile argument.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Politely ask the Moroccan merchant for his best final price:',
          nativePhrase: 'شحال الثمن النهائي أ المعلم عافاك؟',
          correctAnswer: ['شحال', 'الثمن', 'النهائي', 'أ', 'المعلم', 'عافاك؟'],
          explanation: '"Sh7al t-taman n-niha2i a l-m3allem 3afak?" respectfully asks the master craftsman for the bottom-line price.',
          culturalTip: 'Calling an artisan "المعلم" (Al-M3allem = Master Craftsman) shows deep respect for their skill.'
        },
        {
          id: 3,
          type: 'roleplay',
          prompt: 'The merchant quotes 400 Dirhams for a leather bag. What is the smoothest Moroccan counter-offer?',
          options: [
            'السلعة واعرة تبارك الله، ولكن غالية شوية! نخليوها بـ 250 درهم كاش ونقولو مبروك؟',
            'هذه الحقيبة سيئة جداً ولا تساوي درهماً واحداً.',
            'سأتصل بالشرطة السياحية فوراً.',
            'أعطني إياها مجاناً لأنني ضيف.'
          ],
          correctAnswer: 'السلعة واعرة تبارك الله، ولكن غالية شوية! نخليوها بـ 250 درهم كاش ونقولو مبروك؟',
          explanation: 'Praising the quality ("السلعة واعرة تبارك الله") before offering cash closes souk deals with smiles.',
          culturalTip: 'Always compliment the craftsmanship before naming your counter-offer.'
        }
      ]);
    } else if (isAr) {
      return randomizeExercises([
        {
          id: 1,
          type: 'listening',
          prompt: 'At Khan el-Khalili market in Old Cairo, listen to the merchant banter:',
          nativePhrase: 'عشان خاطرك أنت بس يا باشا، إيه آخر كلام يرضيك يا هندسة؟',
          audioLang: 'ar-EG',
          options: [
            'Just for your sake boss, what final price makes you happy, chief?',
            'Where is the ancient mosque located in this market?',
            'Can I have a receipt for this glass lantern?',
            'What time do the souvenir shops close tonight?'
          ],
          correctAnswer: 'Just for your sake boss, what final price makes you happy, chief?',
          explanation: '"3ashan khatrak" (for your sake) and "ya handasa" (chief/engineer) are staple flattery phrases used in souk bargaining.',
          culturalTip: 'Bargaining in Egypt is considered a friendly art of conversation and mutual respect.'
        },
        {
          id: 2,
          type: 'word_order',
          prompt: 'Assemble: "This gentleman is a true local and noble guy":',
          nativePhrase: 'الراجل ده ابن بلد وجدع أوي',
          correctAnswer: ['الراجل', 'ده', 'ابن', 'بلد', 'وجدع', 'أوي'],
          explanation: '"Ebn balad w-gada3" is the highest honorific in Egyptian street society for a dependable, honorable person.',
          culturalTip: 'Merchants love doing business with people they recognize as having "gada3na" (street honor).'
        },
        {
          id: 3,
          type: 'roleplay',
          prompt: 'The artisan quotes 500 LE for a brass lantern. What is the best counter-offer?',
          options: [
            'شغلك فنان والله يا حاج، بس خليها ٣٠٠ جنيه كاش ونقول مبروك علينا!',
            'هذا الفانوس مكسور وقديم جداً.',
            'لن أدفع أكثر من عشرة جنيهات.',
            'أغلق المحل فوراً.'
          ],
          correctAnswer: 'شغلك فنان والله يا حاج، بس خليها ٣٠٠ جنيه كاش ونقول مبروك علينا!',
          explanation: 'Praising his craftsmanship ("شغلك فنان") while pitching a reasonable cash counter ("نقول مبروك") closes deals gracefully.',
          culturalTip: '"نقول مبروك" (shall we say congratulations) signals you are ready to shake hands on the deal.'
        }
      ]);
    } else {
      return randomizeExercises([
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
      ]);
    }
  }

  // ============================================================================
  // LESSON 5, 6, 7 & BOSS BATTLES b2, b3 (Comprehensive Multi-Dialect Coverage)
  // ============================================================================
  if (isDarija) {
    return randomizeExercises([
      {
        id: 1,
        type: 'listening',
        prompt: 'Listen to this authentic Moroccan social expression:',
        nativePhrase: 'مرحبا بيكم عندنا، الدار داركم والقلب كبير!',
        audioLang: 'ar-MA',
        options: [
          'Welcome to our place, our home is your home and our heart is big!',
          'Please leave your luggage outside the building.',
          'What time does the bank open tomorrow morning?',
          'How much is a ticket to Tangier?'
        ],
        correctAnswer: 'Welcome to our place, our home is your home and our heart is big!',
        explanation: '"Mar7ba bikoum 3andna, d-dar darkoum" is the cornerstone of Moroccan hospitality.',
        culturalTip: 'When invited into a Moroccan home, remove your shoes at the carpet edge and greet everyone warmly.'
      },
      {
        id: 2,
        type: 'word_order',
        prompt: 'Assemble the Moroccan proverb: "A gathering with friends is worth the whole world":',
        nativePhrase: 'الجلسة مع الحباب كتسوى الدنيا كاملة',
        correctAnswer: ['الجلسة', 'مع', 'الحباب', 'كتسوى', 'الدنيا', 'كاملة'],
        explanation: '"L-jalsa m3a l-7bab katswa d-denya kamla" celebrates friendship and shared mint tea.',
        culturalTip: 'Hospitality and time with loved ones ("الحباب") are central to Moroccan life.'
      },
      {
        id: 3,
        type: 'roleplay',
        prompt: 'Someone at the café table is stressing over a small delay. What Moroccan advice do you give?',
        options: [
          'وسع خاطرك أ صاحبي، كلشي غادي يدوز مزيان إن شاء الله!',
          'يجب أن تغضب وتصرخ بصوت مرتفع الآن.',
          'أنا لا أهتم بمشاكلك الشخصية.',
          'سأغادر القهوة فوراً.'
        ],
        correctAnswer: 'وسع خاطرك أ صاحبي، كلشي غادي يدوز مزيان إن شاء الله!',
        explanation: '"Wessa3 khatrek" (expand your patience / take it easy) is the classic Moroccan phrase to calm someone down.',
        culturalTip: '"وسع خاطرك" (wessa3 khatrek) shows emotional maturity and warmth.'
      }
    ]);
  }

  if (isAr) {
    return randomizeExercises([
      {
        id: 1,
        type: 'listening',
        prompt: 'Listen to the lively evening greeting at a Cairo gathering:',
        nativePhrase: 'يا حبيب الملايين، شرفتنا ونورتنا الليلة دي!',
        audioLang: 'ar-EG',
        options: [
          'My beloved friend, you have honored and brightened our entire night!',
          'The museum ticket is valid for three days.',
          'Can we cross the bridge before sunset?',
          'Where can I find an internet café in this street?'
        ],
        correctAnswer: 'My beloved friend, you have honored and brightened our entire night!',
        explanation: '"Sharraftana w-nawwartana" (you have honored and brightened us) is traditional Egyptian hospitality.',
        culturalTip: 'Egyptians celebrate guests with warm, poetic compliments.'
      },
      {
        id: 2,
        type: 'word_order',
        prompt: 'Assemble the street philosophy: "A gathering of true friends cannot be replaced with money":',
        nativePhrase: 'قعدة الصحاب الجدعان بالدنيا وما فيها',
        correctAnswer: ['قعدة', 'الصحاب', 'الجدعان', 'بالدنيا', 'وما', 'فيها'],
        explanation: '"2a3det el-so7ab el-ged3an bel-donya w-ma feeha" celebrates deep companionship.',
        culturalTip: 'Evenings at cafés are the social backbone of Cairo neighborhood life.'
      },
      {
        id: 3,
        type: 'context',
        prompt: 'When someone at the café table says "كبر دماغك وفكك من الحوار ده", what do they mean?',
        options: [
          'Brush it off and stop worrying about that drama / chill out.',
          'Your head is physically growing larger than normal.',
          'You must hire a lawyer to pursue the case in court.',
          'Please leave the table immediately.'
        ],
        correctAnswer: 'Brush it off and stop worrying about that drama / chill out.',
        explanation: '"Kabbar demaghak" and "fakkak men el-7ewar da" mean letting it go and keeping your peace of mind.',
        culturalTip: 'This is the most common street advice given in Egypt to diffuse daily frustrations.'
      }
    ]);
  }

  if (isFr) {
    return randomizeExercises([
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
        prompt: 'Invite a friend over: "Pull up a chair and come join us for a drink!":',
        nativePhrase: 'Prends une chaise et viens boire un coup avec nous',
        correctAnswer: ['Prends', 'une', 'chaise', 'et', 'viens', 'boire', 'un', 'coup', 'avec', 'nous'],
        explanation: '"Boire un coup" is the everyday colloquial expression for having a casual drink.',
        culturalTip: 'Parisian café culture centers on impromptu terrace meetups.'
      }
    ]);
  }

  if (isJa) {
    return randomizeExercises([
      {
        id: 1,
        type: 'listening',
        prompt: 'Listen to the lively toast at a Tokyo izakaya:',
        nativePhrase: '皆さん、今日もお疲れ様でした！乾杯！',
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
        nativePhrase: '次の 一杯は 僕の おごりだよ',
        correctAnswer: ['次の', '一杯は', '僕の', 'おごりだよ'],
        explanation: '"Ogori" means "my treat".',
        culturalTip: 'Offering to treat drinks is a generous, bonding gesture in izakaya camaraderie.'
      }
    ]);
  }

  if (isPt) {
    return randomizeExercises([
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
        prompt: 'Assemble: "Pull up a chair and come chat with us":',
        nativePhrase: 'Puxa uma cadeira e vem bater papo com a gente',
        correctAnswer: ['Puxa', 'uma', 'cadeira', 'e', 'vem', 'bater', 'papo', 'com', 'a', 'gente'],
        explanation: '"Bater papo" is the universal Brazilian idiom for having a friendly chat.',
        culturalTip: 'Botecos are open-door social hubs where anyone is welcomed to pull up a stool.'
      }
    ]);
  }

  return randomizeExercises([
    {
      id: 1,
      type: 'listening',
      prompt: 'Listen to the lively café toast:',
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
      prompt: 'Complete the lively invitation: "Pull up a chair and chat with us!":',
      nativePhrase: '¡Vente para acá, jálate una ___ y platicamos!',
      options: ['silla', 'ventana', 'pared', 'puerta'],
      correctAnswer: 'silla',
      explanation: '"Jálate una silla" translates to "pull up a chair and join in".',
      culturalTip: '"Platicar" is the preferred Mexican verb for chatting with friends.'
    },
    {
      id: 4,
      type: 'roleplay',
      prompt: 'Someone makes a hilarious joke at the table. How do you respond with friendly banter?',
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
  ]);
}
