export interface QuizQuestion {
  prompt: string;
  context: string;
  spokenAudio?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type FluencyLevelKey = 'beginner' | 'intermediate' | 'advanced' | 'fluent' | 'native';

interface RawQuestion {
  prompt: string;
  context: string;
  spokenAudio?: string;
  options: string[];
  correctOptionText: string;
  explanation: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function prepareRandomizedQuestions(rawList: RawQuestion[]): QuizQuestion[] {
  const shuffledQuestions = shuffleArray(rawList);
  return shuffledQuestions.map((q) => {
    const shuffledOptions = shuffleArray(q.options);
    const correctIdx = shuffledOptions.indexOf(q.correctOptionText);
    return {
      prompt: q.prompt,
      context: q.context,
      spokenAudio: q.spokenAudio,
      options: shuffledOptions,
      correctIndex: correctIdx >= 0 ? correctIdx : 0,
      explanation: q.explanation
    };
  });
}

export function getDialectPlacementQuestions(level: FluencyLevelKey, dialectId: string): QuizQuestion[] {
  const isDarija = dialectId === 'ar-MA';
  const isEgyptian = dialectId.startsWith('ar') && !isDarija;
  const isFr = dialectId.startsWith('fr');
  const isJa = dialectId.startsWith('ja');
  const isPt = dialectId.startsWith('pt');

  // ============================================================================
  // MOROCCAN DARIJA (ar-MA) - ALL 5 LEVELS
  // ============================================================================
  if (isDarija) {
    const bank: Record<FluencyLevelKey, RawQuestion[]> = {
      beginner: [
        {
          prompt: 'How do locals in Casablanca and Rabat warmly greet a friend and ask how everything is going?',
          context: 'Everyday Moroccan Greeting',
          spokenAudio: 'السلام! لباس عليك؟ كلشي بخير؟',
          options: [
            'السلام! لباس عليك؟ كلشي بخير؟',
            'أريد شراء تذكرة الطائرة من فضلك',
            'كم الساعة الآن في الرباط؟',
            'أنا سائح أجنبي في الفندق'
          ],
          correctOptionText: 'السلام! لباس عليك؟ كلشي بخير؟',
          explanation: '"Salam! Labas 3lik? Kulshi bikhir?" is the essential everyday Moroccan Darija greeting.'
        },
        {
          prompt: 'How do you politely ask for the bill at a Moroccan café or restaurant?',
          context: 'Café & Dining Etiquette',
          spokenAudio: 'الحساب عافاك أ خويا',
          options: [
            'الحساب عافاك أ خويا',
            'أعطني جواز السفر فوراً',
            'الجو بارد جداً اليوم',
            'أين توجد محطة القطار؟'
          ],
          correctOptionText: 'الحساب عافاك أ خويا',
          explanation: '"L-7esab 3afak a khoya" (The bill please, my brother) is natural, polite Moroccan etiquette.'
        },
        {
          prompt: 'If you are looking for the Old Medina in Morocco, how do you ask a local passerby?',
          context: 'Street Navigation',
          spokenAudio: 'فين جات المدينة القديمة عافاك؟',
          options: [
            'فين جات المدينة القديمة عافاك؟',
            'أنا لا أتكلم الدارجة المغربية',
            'سأبقى في الغرفة طوال اليوم',
            'هذا القفطان جميل جداً'
          ],
          correctOptionText: 'فين جات المدينة القديمة عافاك؟',
          explanation: '"Fin jat l-mdina l-qdima 3afak?" is how Moroccans ask where a landmark is located.'
        },
        {
          prompt: 'How do you gracefully decline a persistent vendor in the souk?',
          context: 'Souk Etiquette',
          spokenAudio: 'لا شكراً، الله يسهل عليك أ خويا',
          options: [
            'لا شكراً، الله يسهل عليك أ خويا',
            'ابتعد عني وإلا ناديت الشرطة',
            'هذه السلعة مزورة تماماً',
            'سأشتري المحل كله غداً'
          ],
          correctOptionText: 'لا شكراً، الله يسهل عليك أ خويا',
          explanation: '"Allah y-sahel 3lik" (May God make things easy for you) is the polite, respected way to decline in Morocco.'
        }
      ],
      intermediate: [
        {
          prompt: 'When a Moroccan friend says "غادي نتلاقاو دابا شوية", what does "دابا" (daba) mean?',
          context: 'Core Darija Vocabulary',
          spokenAudio: 'غادي نتلاقاو دابا شوية في القهوة',
          options: [
            'Now / right away ("daba shwiya" = in a little bit).',
            'Next year during the summer holiday.',
            'Yesterday evening before dinner.',
            'Never under any circumstances.'
          ],
          correctOptionText: 'Now / right away ("daba shwiya" = in a little bit).',
          explanation: '"Daba" (now) is one of the most iconic markers of Moroccan Darija.'
        },
        {
          prompt: 'What are you ordering at a Casablanca café if you ask for "واحد قهوة نص نص عافاك"?',
          context: 'Moroccan Café Culture',
          spokenAudio: 'واحد قهوة نص نص عافاك',
          options: [
            'A half-espresso, half-steamed milk coffee ("Nous-Nous").',
            'Half a glass of cold tap water.',
            'Two pots of green mint tea without sugar.',
            'A plate of grilled sardines.'
          ],
          correctOptionText: 'A half-espresso, half-steamed milk coffee ("Nous-Nous").',
          explanation: '"Qahwa nous-nous" (half-half) is Morocco\'s signature café drink.'
        },
        {
          prompt: 'A Petit Taxi driver in Casablanca asks: "عندك الصرف ولا غير ورقة ديال ميتين درهم؟" What is he asking?',
          context: 'Transit & Cash',
          spokenAudio: 'عندك الصرف أ خويا؟',
          options: [
            'Do you have small change, or only a 200-Dirham note?',
            'Do you have a driver\'s license from Morocco?',
            'Are you traveling with two hundred bags?',
            'Do you want to buy this taxi?'
          ],
          correctOptionText: 'Do you have small change, or only a 200-Dirham note?',
          explanation: '"S-sarf" means small change/coins in Moroccan Darija.'
        },
        {
          prompt: 'What does the ubiquitous Moroccan word "صافي" (Safi) mean in daily conversation?',
          context: 'High-Frequency Darija Reflex',
          spokenAudio: 'صافي، اتفقنا أ صاحبي!',
          options: [
            'Okay / that\'s it / enough / agreed!',
            'Very dirty or polluted.',
            'Extremely expensive and rare.',
            'Where is the exit door?'
          ],
          correctOptionText: 'Okay / that\'s it / enough / agreed!',
          explanation: '"Safi" is used constantly across Morocco for "okay", "done", or "that\'s enough".'
        }
      ],
      advanced: [
        {
          prompt: 'A close friend in Casablanca laughs and tells you: "ما تبقاش تفلا عليا أ صاحبي!" What is the tone?',
          context: 'Playful Street Banter',
          spokenAudio: 'ما تبقاش تفلا عليا أ صاحبي!',
          options: [
            'Playful teasing: "Stop messing with me / pulling my leg, bro!"',
            'They are filing a formal lawsuit against you.',
            'They are asking you to read a book aloud.',
            'They think you are a medical doctor.'
          ],
          correctOptionText: 'Playful teasing: "Stop messing with me / pulling my leg, bro!"',
          explanation: '"Tfalla 3liya" means to joke around with or pull someone\'s leg in Darija.'
        },
        {
          prompt: 'When a Moroccan says "الله يرحم الوالدين" (Allah y-r7am l-walidin), how is it used in everyday life?',
          context: 'Deep Cultural Gratitude',
          spokenAudio: 'الله يرحم الوالدين أ خويا، شكراً بزاف!',
          options: [
            'As the warmest, most heartfelt way to say "Thank you so much" or ask a kind favor.',
            'Only at funerals and nowhere else.',
            'To complain about bad traffic in Casablanca.',
            'To ask for the price of vegetables.'
          ],
          correctOptionText: 'As the warmest, most heartfelt way to say "Thank you so much" or ask a kind favor.',
          explanation: 'Literally "May God have mercy on your parents", it is Morocco\'s most beloved expression of gratitude.'
        },
        {
          prompt: 'Someone tells a stressed friend: "وسع خاطرك، دقة دقة كيحمل الواد." What are they advising?',
          context: 'Moroccan Proverbial Wisdom',
          spokenAudio: 'وسع خاطرك أ خويا، دقة دقة كيحمل الواد',
          options: [
            'Be patient and calm down; drop by drop the river fills up (steady patience achieves everything).',
            'Run away from the river because it is flooding right now.',
            'Swim across the ocean as fast as possible.',
            'Sell your house and move to another city.'
          ],
          correctOptionText: 'Be patient and calm down; drop by drop the river fills up (steady patience achieves everything).',
          explanation: '"Wessa3 khatrek" paired with "daqqa daqqa kay7mel l-wad" is classic Moroccan wisdom.'
        },
        {
          prompt: 'In the souk, a merchant tells you: "خدها بصحيح ما كاين زواقة." What is he assuring you?',
          context: 'Souk Negotiation Nuance',
          spokenAudio: 'خدها بصحيح ما كاين زواقة',
          options: [
            'Take it as the honest truth — no gimmicks or inflated tourist talk.',
            'The item is painted with bright colors.',
            'You must return the item tomorrow morning.',
            'The shop only sells paintings.'
          ],
          correctOptionText: 'Take it as the honest truth — no gimmicks or inflated tourist talk.',
          explanation: '"Ma kayn zwaqa" means without embellishment or fake sales pitch.'
        }
      ],
      fluent: [
        {
          prompt: 'In fast Casablanca street speech, what does "طيرتيها وهي طايرة" mean?',
          context: 'Sharp Wit Idiom',
          spokenAudio: 'تبارك الله عليك، طيرتيها وهي طايرة!',
          options: [
            'You caught on immediately / understood the subtext in a flash!',
            'You caught a bird in the park with your hands.',
            'Your airplane flight was canceled.',
            'You dropped your teacup on the floor.'
          ],
          correctOptionText: 'You caught on immediately / understood the subtext in a flash!',
          explanation: 'Signifies lightning-fast comprehension of a joke or hidden meaning.'
        },
        {
          prompt: 'When someone in Morocco describes a person as "ولد الناس ومرضي الوالدين", what are they praising?',
          context: 'Character & Honor',
          spokenAudio: 'هاد السيد ولد الناس ومرضي الوالدين',
          options: [
            'He comes from a good, honorable upbringing and treats people with integrity and respect.',
            'He is a wealthy banker who owns many cars.',
            'He is a stubborn person who argues with neighbors.',
            'He was born in a foreign country.'
          ],
          correctOptionText: 'He comes from a good, honorable upbringing and treats people with integrity and respect.',
          explanation: '"Weld n-nas" and "mardi l-walidin" are the highest compliments of character in Moroccan culture.'
        },
        {
          prompt: 'What does the Casablanca slang phrase "ضرب الطم" (Drab t-tam) mean?',
          context: 'Urban Casablanca Slang',
          spokenAudio: 'دار راسو ما فاهم والو وضرب الطم!',
          options: [
            'To keep completely quiet / play dumb and say nothing about a secret.',
            'To play the drums in a traditional band.',
            'To eat a large meal late at night.',
            'To drive a car very fast.'
          ],
          correctOptionText: 'To keep completely quiet / play dumb and say nothing about a secret.',
          explanation: '"Drab t-tam" is authentic Moroccan street slang for zipping your lips or playing innocent.'
        },
        {
          prompt: 'If a friend says "ما تعمرش راسك بالخويات", what are they telling you?',
          context: 'Emotional Resilience',
          spokenAudio: 'ما تعمرش راسك بالخويات أ صاحبي',
          options: [
            "Don't fill your head with empty nonsense or petty drama.",
            'Do not wear a hat indoors.',
            'Remember to drink plenty of water.',
            'Study harder for your university exam.'
          ],
          correctOptionText: "Don't fill your head with empty nonsense or petty drama.",
          explanation: '"Ma t3ammarsh rasek b-l-khawyat" means don\'t sweat trivial, empty matters.'
        }
      ],
      native: [
        {
          prompt: 'What is the subtext when a Moroccan says the proverb: "اللي عضاتو الحية كيخاف من الحبل"?',
          context: 'Master-Level Moroccan Proverb',
          spokenAudio: 'اللي عضاتو الحية كيخاف من الحبل',
          options: [
            'Once bitten, twice shy (Whoever was bitten by a snake is afraid of a rope).',
            'Snakes are common in the desert mountains.',
            'Always carry a strong rope when climbing.',
            'Never buy rope from an unfamiliar market.'
          ],
          correctOptionText: 'Once bitten, twice shy (Whoever was bitten by a snake is afraid of a rope).',
          explanation: 'A classic Moroccan proverb expressing cautiousness after a bad experience.'
        },
        {
          prompt: 'In rapid Casablanca banter, what does "طاح ليه الباطل" or "طلع ليه الدم" mean when someone is reacting to a situation?',
          context: 'Hyper-Local Emotional Idiom',
          spokenAudio: 'غير سمع الهضرة وطلع ليه الدم!',
          options: [
            '"Tla3 lih d-dem" means he got fed up / lost his temper.',
            'He donated blood at the hospital clinic.',
            'He climbed to the top of a tall building.',
            'He won first prize in a competition.'
          ],
          correctOptionText: '"Tla3 lih d-dem" means he got fed up / lost his temper.',
          explanation: '"Tla3 lih d-dem" (his blood rose) is the native Moroccan idiom for getting annoyed or angry.'
        },
        {
          prompt: 'When a Moroccan elder says "اللي ما عندو سيدي عندو لالة", what cultural nuance is being expressed?',
          context: 'Deep Cultural Subtext',
          spokenAudio: 'اللي ما عندو سيدي عندو لالة',
          options: [
            'Everyone has someone or something backing them up / nobody is without resource.',
            'Nobody is allowed to enter the house without knocking.',
            'Only kings and queens live in palaces.',
            'Children must go to school early.'
          ],
          correctOptionText: 'Everyone has someone or something backing them up / nobody is without resource.',
          explanation: 'Traditional Moroccan proverb used in witty social commentary.'
        }
      ]
    };
    return prepareRandomizedQuestions(bank[level] || bank.beginner);
  }

  // ============================================================================
  // EGYPTIAN MASRI (ar-EG) - ALL 5 LEVELS
  // ============================================================================
  if (isEgyptian) {
    const bank: Record<FluencyLevelKey, RawQuestion[]> = {
      beginner: [
        {
          prompt: 'How do Cairo locals warmly greet a friend and ask how everything is going?',
          context: 'Everyday Cairene Greeting',
          spokenAudio: 'إزيك يا باشا؟ عامل إيه؟',
          options: [
            'إزيك يا باشا؟ عامل إيه؟',
            'مرحباً أيها المواطن المحترم',
            'أنا أريد الذهاب إلى المتحف',
            'كم سعر هذا الخبز الطازج؟'
          ],
          correctOptionText: 'إزيك يا باشا؟ عامل إيه؟',
          explanation: '"Ezzayak ya basha" and "3amel eh" are cornerstone warm greetings of Cairo street life.'
        },
        {
          prompt: 'How do you politely ask for the check at an Egyptian eatery or ahwa café?',
          context: 'Ordering & Settling Bill',
          spokenAudio: 'الحساب لو سمحت يا باشا',
          options: [
            'الحساب لو سمحت يا باشا',
            'أعطني ضرائب الحكومة فوراً',
            'أنا أمتلك أموالاً كثيرة في جيبي',
            'هل هذه الوجبة مجانية تماماً؟'
          ],
          correctOptionText: 'الحساب لو سمحت يا باشا',
          explanation: '"El-hesab law samaht" combined with street titles is standard Cairene manners.'
        },
        {
          prompt: 'If you are looking for the nearest Cairo Metro station in Downtown, how do you ask?',
          context: 'Street Navigation',
          spokenAudio: 'فين محطة المترو لو سمحت؟',
          options: [
            'فين محطة المترو لو سمحت؟',
            'أنا تائه بدون بوصلة ومحتار',
            'اشرح لي نظرية القطارات البخارية',
            'قف مكانك ولا تتحرك أبداً'
          ],
          correctOptionText: 'فين محطة المترو لو سمحت؟',
          explanation: '"Feen ma7atet el-metro" is how locals ask where a subway station is.'
        },
        {
          prompt: 'How do you gracefully decline a persistent street vendor in Cairo?',
          context: 'Market Etiquette',
          spokenAudio: 'ربنا يسهل يا عم الحاج، شكراً',
          options: [
            'ربنا يسهل يا عم الحاج، شكراً',
            'ابتعد عن طريقي حالاً وإلا اشتكيك',
            'أنا أكره بضاعتك تماماً',
            'سأشتري كل ما تملك غداً'
          ],
          correctOptionText: 'ربنا يسهل يا عم الحاج، شكراً',
          explanation: '"Rabbena yesahel" is the polite, culturally graceful Egyptian way to decline.'
        }
      ],
      intermediate: [
        {
          prompt: 'When an Egyptian says: "خمس دقايق وأكون عندك في السكة", what do they mean in practice?',
          context: 'Egyptian Cultural Timing',
          spokenAudio: 'خمس دقايق وأكون عندك في السكة',
          options: [
            'Sometime shortly (could be 10–15 minutes in Cairo traffic).',
            'Strictly within 60 seconds on a stopwatch.',
            'They have left the country completely.',
            'They cancelled the meeting entirely.'
          ],
          correctOptionText: 'Sometime shortly (could be 10–15 minutes in Cairo traffic).',
          explanation: 'In Cairo street cadence, "في السكة" (on the way) expresses warm reassurance rather than a strict stopwatch.'
        },
        {
          prompt: 'A Cairo white taxi driver asks: "معاك فكة ولا ميتين جنيه؟" What is he asking?',
          context: 'Transit & Cash Etiquette',
          spokenAudio: 'معاك فكة ولا ميتين جنيه؟',
          options: [
            'Do you have small change coins/bills, or only a large 200-pound note?',
            'Do you have two hundred suitcases?',
            'Are you travelling with a military escort?',
            'Can you exchange foreign currency?'
          ],
          correctOptionText: 'Do you have small change coins/bills, or only a large 200-pound note?',
          explanation: '"Fakka" means small change, essential for white cabs in Cairo.'
        },
        {
          prompt: 'At a legendary Cairo Koshari restaurant, what does asking for "زود الدقة والشطة" mean?',
          context: 'Authentic Cairene Dining',
          spokenAudio: 'زود الدقة والشطة لو سمحت',
          options: [
            'Extra garlic-vinegar sauce (daqqa) and hot chili oil (shatta).',
            'A cup of black coffee with extra sugar.',
            'Fried eggs on top of the pasta.',
            'Serve the meal in a golden dish.'
          ],
          correctOptionText: 'Extra garlic-vinegar sauce (daqqa) and hot chili oil (shatta).',
          explanation: '"Daqqa" (garlic-vinegar) and "shatta" (chili) are the soul seasonings of Egyptian koshari.'
        }
      ],
      advanced: [
        {
          prompt: 'A close friend smiles and tells you: "ما تستهبلش يا صاحبي!" What is the tone?',
          context: 'Playful Egyptian Banter',
          spokenAudio: 'ما تستهبلش يا صاحبي، أنت فاهم كل حاجة!',
          options: [
            'Affectionate teasing: "Don\'t play dumb bro, you know exactly what I mean!"',
            'They are filing a formal police complaint against you.',
            'They think you have lost your hearing completely.',
            'They are teaching you classical Arabic grammar.'
          ],
          correctOptionText: 'Affectionate teasing: "Don\'t play dumb bro, you know exactly what I mean!"',
          explanation: '"Ma testahbelsh" is ubiquitous friendly Cairene teasing for "don\'t play innocent/dumb".'
        },
        {
          prompt: 'Someone in an ahwa café quips: "كبر دماغك وفكك من الحوار ده." What are they advising you?',
          context: 'Cairene Philosophy of Calm',
          spokenAudio: 'كبر دماغك وفكك من الحوار ده',
          options: [
            "Let it go, don't stress, and move on from this whole drama.",
            'Make your brain physically larger by reading an encyclopedia.',
            'Go to court to sue the other party.',
            'Drink four cups of strong Turkish coffee.'
          ],
          correctOptionText: "Let it go, don't stress, and move on from this whole drama.",
          explanation: '"Kabbar demaghak" and "fakkak" are the definitive Cairene mantras for peace of mind.'
        }
      ],
      fluent: [
        {
          prompt: 'What does "لقطتها وهي طايرة" mean when uttered during fast Cairo banter?',
          context: 'Sharp Wit Idiom',
          spokenAudio: 'عجبني إنك لقطتها وهي طايرة!',
          options: [
            'I caught on immediately / the penny dropped in a flash!',
            'I caught a flying bird with my bare hand.',
            'A fly landed on my coffee cup.',
            'The airplane took off ahead of schedule.'
          ],
          correctOptionText: 'I caught on immediately / the penny dropped in a flash!',
          explanation: '"La2attaha w-heya tayra" signifies lightning-fast social comprehension.'
        },
        {
          prompt: 'Someone describes an acquaintance as "ابن بلد وجدع". What personality traits are they praising?',
          context: 'Deep Cultural Respect',
          spokenAudio: 'الراجل ده ابن بلد وجدع بجد',
          options: [
            'He is honorable, generous, dependable, and has true street integrity.',
            'He is stubborn, rude, and refuses to talk to neighbors.',
            'He works as an administrative clerk in the courthouse.',
            'He was born in an unfamiliar rural district.'
          ],
          correctOptionText: 'He is honorable, generous, dependable, and has true street integrity.',
          explanation: '"Ebn balad" and "gada3" are the highest compliments of honor in Egyptian street culture.'
        }
      ],
      native: [
        {
          prompt: 'In street banter, someone says: "بينفخ في قربة مقطوعة!" What does this metaphor convey?',
          context: 'Classic Egyptian Folk Metaphor',
          spokenAudio: 'سيبك منه، ده بينفخ في قربة مقطوعة!',
          options: [
            'He is wasting his breath on a futile effort / talking to a brick wall.',
            'He is playing a traditional bagpipe instrument on the street.',
            'He tore his water container while traveling in the desert.',
            "He is inflating balloons for a children's celebration."
          ],
          correctOptionText: 'He is wasting his breath on a futile effort / talking to a brick wall.',
          explanation: '"Blowing into a punctured water-skin" is a renowned Egyptian metaphor for futile effort.'
        },
        {
          prompt: 'What does "واكل الجو" (Wakel el-gaw) mean in fast Cairene banter?',
          context: 'Hyper-Local Slang',
          spokenAudio: 'أنت النهاردة واكل الجو خالص يا نجم!',
          options: [
            "Stealing the spotlight / commanding everyone's attention!",
            'Swallowing air because of the windy weather.',
            'Canceling a flight due to turbulence.',
            'Ordering all the appetizers on the table.'
          ],
          correctOptionText: "Stealing the spotlight / commanding everyone's attention!",
          explanation: '"Wakel el-gaw" literally means "eating the atmosphere" — slang for stealing the show.'
        }
      ]
    };
    return prepareRandomizedQuestions(bank[level] || bank.beginner);
  }

  // ============================================================================
  // PARISIAN FRENCH (fr-FR)
  // ============================================================================
  if (isFr) {
    const raw: RawQuestion[] = [
      {
        prompt: 'How do Parisian friends informally greet each other and ask how things are going?',
        context: 'Informal Street Greeting',
        spokenAudio: 'Salut ! Ça va ? Ça roule ?',
        options: [
          'Salut ! Ça va ? Ça roule ?',
          'Cher citoyen, veuillez décliner votre identité',
          'Je désire réciter le dictionnaire français',
          'Quel est le tarif horaire de cette rue ?'
        ],
        correctOptionText: 'Salut ! Ça va ? Ça roule ?',
        explanation: '"Ça roule" is the ubiquitous friendly conversational reflex across Paris.'
      },
      {
        prompt: 'When a Parisian friend tells you: "Laisse tomber, c\'est mort", what do they mean?',
        context: 'Street Reflex',
        spokenAudio: "Laisse tomber pour ce soir, c'est mort.",
        options: [
          "Forget it / call it off; it's definitely not happening.",
          'Someone passed away earlier this morning.',
          'Drop your keys onto the sidewalk.',
          'We must visit the historical cemetery.'
        ],
        correctOptionText: "Forget it / call it off; it's definitely not happening.",
        explanation: '"C\'est mort" is the ultimate informal French expression for "no chance / canceled".'
      },
      {
        prompt: 'What does "C\'est trop ouf" mean in everyday Parisian conversation?',
        context: 'Verlan Slang',
        spokenAudio: 'Franchement, cette expo est trop ouf !',
        options: [
          "That's completely crazy / insane / awesome!",
          'The room smells like vinegar.',
          'This object is extremely heavy.',
          'I am feeling deeply depressed.'
        ],
        correctOptionText: "That's completely crazy / insane / awesome!",
        explanation: '"Ouf" is the iconic Verlan reversal of "fou" (crazy/amazing).'
      },
      {
        prompt: 'In Belleville banter, what does "J\'ai trop le seum" express?',
        context: 'Street Emotion Nuance',
        spokenAudio: "J'ai trop le seum d'avoir raté le dernier métro.",
        options: [
          'To be extremely annoyed, bitter, or salty about a setback.',
          'To be deeply in love with someone.',
          'To feel full after eating a hearty meal.',
          'To be enthusiastic about a new project.'
        ],
        correctOptionText: 'To be extremely annoyed, bitter, or salty about a setback.',
        explanation: '"Avoir le seum" expresses intense annoyance or being salty.'
      }
    ];
    return prepareRandomizedQuestions(raw);
  }

  // ============================================================================
  // TOKYO JAPANESE (ja-JP)
  // ============================================================================
  if (isJa) {
    const raw: RawQuestion[] = [
      {
        prompt: 'How do Tokyo locals naturally greet a friend and ask how things are going?',
        context: 'Informal Everyday Greeting',
        spokenAudio: '元気？最近どう？',
        options: [
          '元気？最近どう？',
          '私はロボットではありません',
          '電車の時刻表を見せてください',
          'コンビニエンスストアはどこですか'
        ],
        correctOptionText: '元気？最近どう？',
        explanation: '"Genki? Saikin dou?" is the effortless casual greeting used between peers in Tokyo.'
      },
      {
        prompt: 'At a Tokyo izakaya, what does ordering "とりあえず生で！" (Toriaezu nama de!) mean?',
        context: 'Izakaya Ritual',
        spokenAudio: 'とりあえず生でお願いします！',
        options: [
          'To start off, draft beers for now please!',
          'Bring raw fish on a wooden plate.',
          'Give us two glasses of tap water.',
          'We are leaving the restaurant immediately.'
        ],
        correctOptionText: 'To start off, draft beers for now please!',
        explanation: '"Toriaezu nama" is the quintessential opening line at any Japanese drinking establishment.'
      },
      {
        prompt: 'What does the ubiquitous Tokyo slang reaction "それな！" (Sore na!) express?',
        context: 'Street Agreement Reflex',
        spokenAudio: 'それな！めっちゃわかる！',
        options: [
          'Total enthusiastic agreement ("Preach / Exactly / Couldn\'t agree more").',
          'A warning that something is sharp or dangerous.',
          'A mathematical error in calculation.',
          'An invitation to play baseball.'
        ],
        correctOptionText: 'Total enthusiastic agreement ("Preach / Exactly / Couldn\'t agree more").',
        explanation: '"Sore na!" expresses instant peer agreement in modern colloquial Japanese.'
      },
      {
        prompt: 'In conversational Japanese, what does "空気を読む" (Kuuki o yomu) mean?',
        context: 'Social Instinct & Nuance',
        spokenAudio: 'もっと場の空気を読んでよ。',
        options: [
          'Reading the room / sensing the unstated mood and acting appropriately.',
          'Measuring the barometric atmospheric pressure.',
          'Reading aloud from a meteorology textbook.',
          'Opening all the windows in the train.'
        ],
        correctOptionText: 'Reading the room / sensing the unstated mood and acting appropriately.',
        explanation: '"Kuuki o yomu" is the core Japanese social skill of reading the unspoken atmosphere.'
      }
    ];
    return prepareRandomizedQuestions(raw);
  }

  // ============================================================================
  // CARIOCA BRAZILIAN PORTUGUESE (pt-BR)
  // ============================================================================
  if (isPt) {
    const raw: RawQuestion[] = [
      {
        prompt: 'How do Rio locals warmly greet someone on the street or beach?',
        context: 'Carioca Street Greeting',
        spokenAudio: 'E aí, beleza? Tudo bem com você?',
        options: [
          'E aí, beleza? Tudo bem com você?',
          'Cidadão, apresente seus documentos policiais.',
          'Eu desejo recitar as normas gramaticais.',
          'Quanto custa a passagem para Lisboa?'
        ],
        correctOptionText: 'E aí, beleza? Tudo bem com você?',
        explanation: '"E aí, beleza?" is the universal sunny greeting of Rio de Janeiro street life.'
      },
      {
        prompt: 'What does "Que rolê maneiro!" express about an experience in Rio?',
        context: 'Carioca Slang',
        spokenAudio: 'Caraca, que rolê maneiro que foi ontem!',
        options: [
          'What an awesome, fun hangout / experience!',
          'We suffered a car breakdown on the highway.',
          'The food gave everyone food poisoning.',
          'It was extremely boring and quiet.'
        ],
        correctOptionText: 'What an awesome, fun hangout / experience!',
        explanation: '"Maneiro" is the signature Rio slang for cool, awesome, or great.'
      },
      {
        prompt: 'In a Rio boteco, someone shouts: "A saideira vai por minha conta!" What does that mean?',
        context: 'Nightlife Camaraderie',
        spokenAudio: 'A saideira vai por minha conta, rapaziada!',
        options: [
          'The final drink before closing is on me / my treat!',
          'Everyone must leave through the emergency exit.',
          'I am going to bed right this second.',
          'The bar is permanently shutting down.'
        ],
        correctOptionText: 'The final drink before closing is on me / my treat!',
        explanation: '"A saideira" is the sacred Brazilian term for the last drink before going home.'
      },
      {
        prompt: 'Someone in Rio says: "Não vem meter esse caô pra cima de mim irmão!" What are they saying?',
        context: 'Street Nuance',
        spokenAudio: 'Não vem meter esse caô pra cima de mim.',
        options: [
          "Don't give me that fake excuse or tall tale, bro!",
          'Do not bring your pet dog into the store.',
          'I agree with your explanation completely.',
          "Let's sing a samba song together."
        ],
        correctOptionText: "Don't give me that fake excuse or tall tale, bro!",
        explanation: '"Caô" is Rio slang for a lie, tall tale, or fake excuse.'
      }
    ];
    return prepareRandomizedQuestions(raw);
  }

  // ============================================================================
  // MEXICAN & COLOMBIAN SPANISH (es-MX / es-CO) - ALL 5 LEVELS
  // ============================================================================
  const esBank: Record<FluencyLevelKey, RawQuestion[]> = {
    beginner: [
      {
        prompt: 'How do locals informally say hello and ask how you are doing?',
        context: 'Informal Street Greeting',
        spokenAudio: '¡Qué onda, compa! ¿Todo bien?',
        options: [
          '¡Qué onda, compa! ¿Todo bien?',
          'Estimado ciudadano, reporte su condición.',
          'Yo quiero hablar la lengua del país.',
          '¿Cuál es la regla gramatical número cinco?'
        ],
        correctOptionText: '¡Qué onda, compa! ¿Todo bien?',
        explanation: 'Everyday greetings use warm slang like "qué onda" and "compa".'
      },
      {
        prompt: 'How do you politely ask for the check at a casual café or street eatery?',
        context: 'Food & Ordering',
        spokenAudio: 'Disculpe, ¿me trae la cuenta, por favor?',
        options: [
          'Disculpe, ¿me trae la cuenta, por favor?',
          '¡Deme la factura del gobierno!',
          'Yo poseo dinero para su comida.',
          '¿Cuánto dinero tengo que perder hoy?'
        ],
        correctOptionText: 'Disculpe, ¿me trae la cuenta, por favor?',
        explanation: '"La cuenta, por favor" is universally polite and natural.'
      },
      {
        prompt: 'If you get turned around in a neighborhood, how do you ask for directions?',
        context: 'Transit & Navigation',
        spokenAudio: 'Disculpa, ¿por dónde queda el metro más cercano?',
        options: [
          'Disculpa, ¿por dónde queda el metro más cercano?',
          '¡Ayuda, estoy en peligro de perder el mapa!',
          'Deme las coordenadas exactas de longitud.',
          'Yo deseo caminar en cualquier dirección.'
        ],
        correctOptionText: 'Disculpa, ¿por dónde queda el metro más cercano?',
        explanation: 'Asking "¿por dónde queda...?" is friendly and immediately understood.'
      },
      {
        prompt: 'How do you politely decline something from a persistent street vendor?',
        context: 'Market Etiquette',
        spokenAudio: 'No, muchas gracias, así está bien.',
        options: [
          'No, muchas gracias, así está bien.',
          '¡Vete de aquí inmediatamente!',
          'No tengo interés en sus productos comerciales.',
          'Cuesta demasiado para mi presupuesto.'
        ],
        correctOptionText: 'No, muchas gracias, así está bien.',
        explanation: '"No, muchas gracias, así está bien" is graceful, firm, and respectful.'
      }
    ],
    intermediate: [
      {
        prompt: 'When someone tells you: "Ahorita te lo traigo", what do they actually mean?',
        context: 'Temporal Subtlety',
        spokenAudio: 'Ahorita te lo traigo, dame un segundo.',
        options: [
          'Sometime soon (could be 5 minutes, could take a while).',
          'Strictly within the next 3 seconds.',
          'It was delivered yesterday.',
          'It will never happen under any circumstance.'
        ],
        correctOptionText: 'Sometime soon (could be 5 minutes, could take a while).',
        explanation: 'In colloquial regional speech, "ahorita" is fluid — it means soon, without stopwatch pressure.'
      },
      {
        prompt: 'A taxi driver asks: "¿Trae cambio o puro de a quinientos?" What are they asking?',
        context: 'Cash & Transit Culture',
        spokenAudio: 'Jefe, ¿trae cambio o puro de a quinientos?',
        options: [
          'Do you have small change, or only large 500-peso bills?',
          'Are you traveling with five hundred pieces of luggage?',
          'Can you tip me five hundred coins?',
          'Are you paying for five hundred passengers?'
        ],
        correctOptionText: 'Do you have small change, or only large 500-peso bills?',
        explanation: 'Drivers frequently run out of change; "trae cambio" is an essential daily phrase.'
      },
      {
        prompt: 'What does the popular reaction "¡Qué chido!" or "¡Qué chimba!" communicate?',
        context: 'Spontaneous Reaction',
        spokenAudio: '¡No manches, qué chido está eso!',
        options: [
          'That is really cool / awesome!',
          'That is extremely dangerous.',
          'I am deeply offended by that.',
          'Please slow down your speech.'
        ],
        correctOptionText: 'That is really cool / awesome!',
        explanation: '"Chido" (Mexico) and "Chimba" (Colombia) are trademark colloquial words for cool or awesome.'
      },
      {
        prompt: 'At a neighborhood taco stand, what does ordering "con todo" mean?',
        context: 'Authentic Street Food',
        spokenAudio: 'Me da tres al pastor con todo, porfa.',
        options: [
          'With cilantro, onions, salsa, and roasted pineapple.',
          'Cook the entire menu on my plate.',
          'Serve the food without any tortillas.',
          'I want a glass of plain water only.'
        ],
        correctOptionText: 'With cilantro, onions, salsa, and roasted pineapple.',
        explanation: '"Con todo" signals to the taquero that you want full authentic street garnishes.'
      }
    ],
    advanced: [
      {
        prompt: 'Someone in conversation says: "No te hagas el loco, sabes de qué hablo." What is the tone?',
        context: 'Playful Confrontation / Nuance',
        spokenAudio: 'No te hagas el loco, sabes muy bien de qué hablo.',
        options: [
          "They are telling you not to play dumb or pretend you don't know.",
          'They believe you are clinically insane and need an ambulance.',
          'They are praising your exceptional mental agility.',
          'They want you to act crazy in public.'
        ],
        correctOptionText: "They are telling you not to play dumb or pretend you don't know.",
        explanation: '"Hacerse el loco" means playing dumb or feigning ignorance in casual conversation.'
      },
      {
        prompt: 'In rapid conversation, you hear: "Me costó un ojo de la cara." What does this idiom convey?',
        context: 'Colloquial Idioms',
        spokenAudio: 'Ese boleto me costó un ojo de la cara, pero valió la pena.',
        options: [
          'It was extraordinarily expensive / cost an arm and a leg.',
          'The speaker suffered a medical eye accident.',
          'It was completely free of charge.',
          'It was of very low manufacturing quality.'
        ],
        correctOptionText: 'It was extraordinarily expensive / cost an arm and a leg.',
        explanation: '"Costar un ojo de la cara" is the universal native idiom for being very pricey.'
      },
      {
        prompt: 'A friend remarks: "Ni al caso lo que me estás diciendo." What are they expressing?',
        context: 'Social Banter & Disagreement',
        spokenAudio: 'Oye, ni al caso lo que me estás diciendo.',
        options: [
          "That's completely irrelevant or makes no sense in this context.",
          'I strongly agree and want to sign a contract with you.',
          'Please tell that to the police officer over there.',
          'I am going to court tomorrow morning.'
        ],
        correctOptionText: "That's completely irrelevant or makes no sense in this context.",
        explanation: '"Ni al caso" is spoken slang for "irrelevant" or "out of line".'
      },
      {
        prompt: 'When negotiating an artisan price, what is the most culturally tactful counter-offer?',
        context: 'Bargaining Nuance',
        spokenAudio: '¿En cuánto me lo deja si me llevo dos piezas, patrón?',
        options: [
          '¿En cuánto me lo deja si me llevo dos piezas, patrón?',
          '¡Usted es un estafador y este objeto vale cero!',
          'Yo exijo que el precio sea la mitad inmediatamente.',
          'Démelo gratis porque soy extranjero.'
        ],
        correctOptionText: '¿En cuánto me lo deja si me llevo dos piezas, patrón?',
        explanation: 'Asking for a bundle discount ("si me llevo dos") shows cultural respect for the artisan\'s labor.'
      }
    ],
    fluent: [
      {
        prompt: 'What does "Me cayó el veinte" mean when uttered during a fast dialogue?',
        context: 'Rapid Epiphany Idiom',
        spokenAudio: '¡Hasta ahorita me cayó el veinte de lo que querías decir!',
        options: [
          'The penny just dropped / I finally understood the situation!',
          'Twenty coins fell out of my pocket onto the street.',
          'My twenty-year-old friend just arrived.',
          'I lost 20% of my conversational energy.'
        ],
        correctOptionText: 'The penny just dropped / I finally understood the situation!',
        explanation: '"Caer el veinte" comes from old coin payphones — meaning realization has clicked.'
      },
      {
        prompt: 'In a fast group debate, someone quips: "Tirar la toalla ni pensarlo." What are they emphasizing?',
        context: 'Conversational Tenacity',
        spokenAudio: 'Aquí tirar la toalla ni pensarlo, vamos con todo.',
        options: [
          "Giving up is out of the question; we're pushing through.",
          'Do not drop your gym towel on the bathroom floor.',
          'We should clean the kitchen table before leaving.',
          'The game is permanently cancelled.'
        ],
        correctOptionText: "Giving up is out of the question; we're pushing through.",
        explanation: '"Tirar la toalla ni pensarlo" means quitting is not an option.'
      },
      {
        prompt: 'Someone describes a coworker as "bien aventado / aventada". What trait are they highlighting?',
        context: 'Character Description',
        spokenAudio: 'Esa chava es bien aventada, no le tiene miedo a nada.',
        options: [
          'They are bold, daring, and fearless in taking initiative.',
          'They were pushed out of an airplane window.',
          'They are slow, timid, and avoid taking any action.',
          'They throw objects across the office floor.'
        ],
        correctOptionText: 'They are bold, daring, and fearless in taking initiative.',
        explanation: '"Aventado/a" in street slang denotes someone bold, proactive, and daring.'
      }
    ],
    native: [
      {
        prompt: 'In neighborhood banter, what does: "No te me vayas a achicopalar ahorita" mean?',
        context: 'Hyper-Local Street Idiom',
        spokenAudio: '¡Ánimo güey, no te me vayas a achicopalar ahorita!',
        options: [
          "Don't go getting discouraged or losing your nerve right now!",
          'Do not shrink down physically into a smaller human.',
          "Don't drink that glass of water on the table.",
          'Hurry up and purchase chocolate from the market.'
        ],
        correctOptionText: "Don't go getting discouraged or losing your nerve right now!",
        explanation: '"Achicopalarse" is an authentic Nahuatl-derived street idiom meaning to get downhearted.'
      },
      {
        prompt: 'Someone remarks: "Ese güey se cree la última coca del desierto." What is the social subtext?',
        context: 'Street Humor & Banter',
        spokenAudio: 'Míralo cómo camina, se cree la última coca del desierto.',
        options: [
          "They think they are God's gift to humanity / overly full of themselves.",
          'They are suffering from severe desert dehydration.',
          'They own a soda distribution monopoly in the city.',
          'They are very generous and sharing drinks with everyone.'
        ],
        correctOptionText: "They think they are God's gift to humanity / overly full of themselves.",
        explanation: 'A classic colorful native roast for someone with an inflated ego.'
      },
      {
        prompt: 'What does "tirar paro" mean in real street slang?',
        context: 'Urban Camaraderie',
        spokenAudio: 'Oye hermano, ¿me tiras paro con esto?',
        options: [
          'To do someone a solid / do a favor or back someone up.',
          'To stage a labor strike outside the government building.',
          'To throw rocks at a parked vehicle.',
          'To stop walking and sit on the sidewalk.'
        ],
        correctOptionText: 'To do someone a solid / do a favor or back someone up.',
        explanation: '"Tirar paro" is the quintessential street expression for doing someone a favor.'
      }
    ]
  };

  return prepareRandomizedQuestions(esBank[level] || esBank.beginner);
}
