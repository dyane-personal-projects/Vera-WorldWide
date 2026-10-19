export interface QuizQuestion {
  prompt: string;
  context: string;
  spokenAudio?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type FluencyLevelKey = 'beginner' | 'intermediate' | 'advanced' | 'fluent' | 'native';

export function getDialectPlacementQuestions(level: FluencyLevelKey, dialectId: string): QuizQuestion[] {
  const isAr = dialectId.startsWith('ar');
  const isFr = dialectId.startsWith('fr');
  const isJa = dialectId.startsWith('ja');
  const isPt = dialectId.startsWith('pt');

  // ==========================================
  // EGYPTIAN ARABIC (ar-EG / ar-MA)
  // ==========================================
  if (isAr) {
    if (level === 'beginner') {
      return [
        {
          prompt: 'How do Cairo locals warmly greet a friend and ask how everything is going?',
          context: 'Everyday Cairene Greeting',
          spokenAudio: 'إزيك يا باشا؟ عامل إيه؟ كله تمام؟',
          options: [
            'إزيك يا باشا؟ عامل إيه؟ كله تمام؟',
            'أيها المواطن، أين بطاقة الهوية الرسمية؟',
            'أنا أريد قراءة كتاب القواعد الآن.',
            'كم سعر تذكرة الطائرة إلى لندن؟'
          ],
          correctIndex: 0,
          explanation: '"إزيك" (Ezzayak) and "يا باشا" (Ya basha) are the cornerstone warm greetings of Cairo street life.'
        },
        {
          prompt: 'How do you politely ask for the check at an Egyptian eatery or ahwa café?',
          context: 'Ordering & Settling Bill',
          spokenAudio: 'الحساب لو سمحت يا باشا، ربنا يخليك',
          options: [
            'الحساب لو سمحت يا باشا، ربنا يخليك',
            'أعطني وثيقة الضرائب المالية فوراً!',
            'أنا أملك نقوداً كثيرة في جيبي.',
            'هل هذا الطعام مجاني للجميع؟'
          ],
          correctIndex: 0,
          explanation: '"الحساب لو سمحت" (El-hesab law samaht) paired with "يا باشا" is standard everyday Cairene manners.'
        },
        {
          prompt: 'If you are looking for the nearest Cairo Metro station in Downtown, how do you ask?',
          context: 'Street Navigation',
          spokenAudio: 'من فضلك، محطة المترو منين لو سمحت؟',
          options: [
            'من فضلك، محطة المترو منين لو سمحت؟',
            'أنا تائه وأحتاج إلى شرطة النجدة!',
            'أين يقع نهر الأمازون في الخريطة؟',
            'امشِ أمامي ولا تتكلم معي.'
          ],
          correctIndex: 0,
          explanation: '"منين لو سمحت" (Mneen law samaht) is how locals ask where a landmark is located.'
        },
        {
          prompt: 'How do you politely decline a souvenir or service from a persistent street vendor?',
          context: 'Market Etiquette',
          spokenAudio: 'شكراً يا ريس، ربنا يسهل، مش محتاج دلوقتي',
          options: [
            'شكراً يا ريس، ربنا يسهل، مش محتاج دلوقتي',
            'ابتعد عن طريقي وإلا سأصرخ!',
            'بضاعتك لا تعجبني أبداً.',
            'سأشتري المحل كله بعد ساعة.'
          ],
          correctIndex: 0,
          explanation: '"ربنا يسهل" (Rabbena yesahel) is the graceful, culturally respectful Egyptian way of saying no.'
        }
      ];
    }

    if (level === 'intermediate') {
      return [
        {
          prompt: 'When an Egyptian says: "دقيقة وهكون عندك يا صاحبي، في السكة", what does it mean in practice?',
          context: 'Egyptian Cultural Timing',
          spokenAudio: 'دقيقة وهكون عندك يا صاحبي، في السكة',
          options: [
            'Sometime shortly (could be 10-15 minutes in Cairo traffic).',
            'Strictly within the next 60 seconds on a stopwatch.',
            'They are currently in another country.',
            'They cancelled the meeting completely.'
          ],
          correctIndex: 0,
          explanation: 'In Cairo street cadence, "دقيقة" (one minute) or "في السكة" expresses reassurance rather than strict stopwatch time.'
        },
        {
          prompt: 'A Cairo white taxi driver asks: "معاك فكة يا باشا ولا ورقة بميتين؟" What is he asking?',
          context: 'Transit & Cash Etiquette',
          spokenAudio: 'معاك فكة يا باشا ولا ورقة بميتين؟',
          options: [
            'Do you have small change, or only a large 200-pound bill?',
            'Do you have two hundred suitcases in the trunk?',
            'Are you travelling with two hundred passengers?',
            'Can you exchange foreign currency right now?'
          ],
          correctIndex: 0,
          explanation: '"فكة" (Fakka) means small change coins/bills, essential for taxis in Cairo.'
        },
        {
          prompt: 'What does the quintessential Egyptian exclamation "يا سيدي الفل والياسمين" communicate?',
          context: 'Warm Street Camaraderie',
          spokenAudio: 'يا سيدي الفل والياسمين، شرفتنا ونورتنا!',
          options: [
            'Warm, flowery hospitality welcoming you with affection.',
            'A scientific botanical description of jasmine flowers.',
            'A complaint about the price of herbal tea.',
            'An instruction to water the garden.'
          ],
          correctIndex: 0,
          explanation: '"الفل والياسمين" is iconic Egyptian poetic warmth welcoming friends.'
        },
        {
          prompt: 'At a legendary Cairo Koshari restaurant, what does asking for "دقة وشطة زيادة" mean?',
          context: 'Authentic Cairene Dining',
          spokenAudio: 'علبة كشري ميكس، وكتر الدقة والشطة لو سمحت',
          options: [
            'Extra garlic-vinegar sauce (daqqa) and hot chili oil (shatta).',
            'A cup of black coffee with extra sugar.',
            'Fried eggs on top of the pasta.',
            'Serve the meal in a golden dish.'
          ],
          correctIndex: 0,
          explanation: '"الدقة" (garlic-vinegar) and "الشطة" (chili) are the essential soul seasonings of Egyptian koshari.'
        }
      ];
    }

    if (level === 'advanced') {
      return [
        {
          prompt: 'A close friend smiles and tells you: "ما تستهبلش يا عم، إنت فاهم قصدي كويس!" What is the tone?',
          context: 'Playful Egyptian Banter',
          spokenAudio: 'ما تستهبلش يا عم، إنت فاهم قصدي كويس!',
          options: [
            'Affectionate teasing: "Don\'t play dumb bro, you know exactly what I mean!"',
            'They are filing a formal police complaint against you.',
            'They think you have lost your hearing completely.',
            'They are teaching you classical Arabic grammar.'
          ],
          correctIndex: 0,
          explanation: '"ما تستهبلش" (Ma tistahbalsh) is ubiquitous friendly Cairene teasing for "don\'t play dumb".'
        },
        {
          prompt: 'In conversation about a purchase, you hear: "ده كلفني دم قلبي / غالي طحن!" What does this mean?',
          context: 'Colloquial Price Idiom',
          spokenAudio: 'المشوار ده كلفني دم قلبي والله',
          options: [
            'It was extraordinarily expensive / cost an arm and a leg.',
            'The speaker needed a cardiovascular blood transfusion.',
            'The item was completely free of charge.',
            'It broke immediately upon opening.'
          ],
          correctIndex: 0,
          explanation: '"كلفني دم قلبي" literally means "it cost me my heart\'s blood"—meaning very pricey.'
        },
        {
          prompt: 'Someone in an ahwa café quips: "كبر دماغك وفكك من الحوار ده كله." What are they advising you?',
          context: 'Cairene Philosophy of Calm',
          spokenAudio: 'كبر دماغك يا صاحبي وفكك من الحوار ده',
          options: [
            'Let it go, don\'t stress, and move on from this whole drama.',
            'Make your brain physically larger by reading encyclopedia.',
            'Go to court to sue the other party.',
            'Drink four cups of strong Turkish coffee.'
          ],
          correctIndex: 0,
          explanation: '"كبر دماغك" (Kappar dimaghk) and "فكك" (Fakkak) are the definitive Cairene mantras for peace of mind.'
        },
        {
          prompt: 'When negotiating an antique brass lamp at Khan El-Khalili, what is the most culturally tactful counter-offer?',
          context: 'Souk Haggling Etiquette',
          spokenAudio: 'طب عشان خاطري وخاطر الزبون الدايم، تخليه بكام في السريع يا هندسة؟',
          options: [
            'طب عشان خاطري وخاطر الزبون الدايم، تخليه بكام في السريع يا هندسة؟',
            'أنت لص وسأبلغ عنك شرطة السياحة فوراً!',
            'أنا أجنبي ويجب أن تعطيني إياه بنصف السعر بالقوة.',
            'سعرك سخيف ولن أشتري شيئاً.'
          ],
          correctIndex: 0,
          explanation: '"عشان خاطري" (For my sake) and addressing the merchant respectfully as "يا هندسة" closes deals warmly.'
        }
      ];
    }

    if (level === 'fluent') {
      return [
        {
          prompt: 'What does "لقطتها وهي طايرة" mean when uttered during fast Cairo banter?',
          context: 'Sharp Wit Idiom',
          spokenAudio: 'أنا لقطتها وهي طايرة على طول يا معلم',
          options: [
            'I caught on immediately / the penny dropped in a flash!',
            'I caught a flying bird with my bare hand.',
            'A fly landed on my coffee cup.',
            'The airplane took off ahead of schedule.'
          ],
          correctIndex: 0,
          explanation: '"لقطتها وهي طايرة" signifies lightning-fast social and contextual comprehension.'
        },
        {
          prompt: 'Someone describes an acquaintance as "ابن بلد وجدع أوي". What personality traits are they praising?',
          context: 'Deep Cultural Respect',
          spokenAudio: 'الراجل ده ابن بلد أصيل وجدع يقف معاك في الشدة',
          options: [
            'He is honorable, generous, dependable, and has true street integrity.',
            'He is stubborn, rude, and refuses to talk to neighbors.',
            'He works as an administrative clerk in the courthouse.',
            'He was born in an unfamiliar rural district.'
          ],
          correctIndex: 0,
          explanation: '"ابن بلد" (Ibn balad) and "جدع" (Gadaa) are the highest compliments of honor in Egyptian street culture.'
        },
        {
          prompt: 'How do Cairo locals use irony when saying: "يا سلام! على أساس إنك ما كنتش عارف يعني؟" with a wry smile?',
          context: 'Playful Sarcasm',
          spokenAudio: 'يا سلام! على أساس إنك ما كنتش عارف يعني؟',
          options: [
            'Playful sarcasm: "Oh please! As if you didn\'t already know!"',
            'They are praying for peace across all nations.',
            'They are confused about what year it is.',
            'They are asking for a glass of tap water'
          ],
          correctIndex: 0,
          explanation: '"على أساس إنك..." is the standard Cairene formula for ironic disbelief.'
        },
        {
          prompt: 'In a heated discussion, someone says: "خليك في حالك وما تحشرش مناخيرك في اللي مالكش فيه." What are they saying?',
          context: 'Setting Firm Boundaries',
          spokenAudio: 'خليك في حالك وماتحشرش مناخيرك في اللي مالكش فيه',
          options: [
            'Mind your own business and don\'t stick your nose into things that don\'t concern you.',
            'Please buy some medicine for your stuffy nose at the pharmacy.',
            'You should wash your hands before eating dinner.',
            'We should invite all the neighbors to the party.'
          ],
          correctIndex: 0,
          explanation: '"حشر المناخير" (sticking one\'s nose in) is the common Egyptian idiom for unwarranted nosiness.'
        }
      ];
    }

    // Native level
    return [
      {
        prompt: 'In fast Cairene banter, what does: "ده واكل الجو كله النهارده" mean?',
        context: 'Hyper-Local Slang',
        spokenAudio: 'بص عليه، واكل الجو كله ومحدش عارف يكلمه',
        options: [
          'He is stealing the spotlight / commanding everyone\'s attention!',
          'He swallowed air because of the windy weather.',
          'He cancelled his flight due to turbulence.',
          'He ordered all the appetizers on the table.'
        ],
        correctIndex: 0,
        explanation: '"واكل الجو" literally means "eating the atmosphere"—slang for stealing the show.'
      },
      {
        prompt: 'A friend remarks: "شايف نفسه زيادة عن اللزوم وفاكر نفسه محور الكون." What is the social subtext?',
        context: 'Street Roast Nuance',
        spokenAudio: 'شايف نفسه على الناس وفاكر إنه مفيش منه اتنين',
        options: [
          'He is acting arrogant and thinks the world revolves around him.',
          'He has perfect eyesight and can see very far away.',
          'He is lost in the center of Tahrir Square.',
          'He has an identical twin brother in town.'
        ],
        correctIndex: 0,
        explanation: '"شايف نفسه" is the universal idiom for someone with an inflated ego.'
      },
      {
        prompt: 'What does "سد معايا في وقت الشدة" signify in Egyptian brotherly solidarity?',
        context: 'Camaraderie & Honor',
        spokenAudio: 'صاحبي ده سد معايا في وقت الشدة بجد',
        options: [
          'He had my back and stood strong with me in hard times.',
          'He blocked the doorway and wouldn\'t let me pass.',
          'He closed his shop early on Sunday.',
          'He built a concrete wall outside his home.'
        ],
        correctIndex: 0,
        explanation: '"سد معايا" means stepping up and standing solid when times get rough.'
      },
      {
        prompt: 'In street banter, someone says: "يا عم فكك، ده بينفخ في قربة مقطوعة!" What does this metaphor convey?',
        context: 'Classic Folk Metaphor',
        spokenAudio: 'يا عم فكك منه، ده بينفخ في قربة مقطوعة',
        options: [
          'He is wasting his breath on a futile effort / talking to a brick wall.',
          'He is playing a traditional bagpipe instrument on the street.',
          'He tore his water container while traveling in the desert.',
          'He is inflating balloons for a children\'s celebration.'
        ],
        correctIndex: 0,
        explanation: '"ينفخ في قربة مقطوعة" (blowing into a punctured water-skin) is a renowned Egyptian metaphor for futile wasted effort.'
      }
    ];
  }

  // ==========================================
  // PARISIAN FRENCH (fr-FR)
  // ==========================================
  if (isFr) {
    if (level === 'beginner') {
      return [
        {
          prompt: 'How do Parisian friends informally say hello and ask how you are doing?',
          context: 'Informal Street Greeting',
          spokenAudio: 'Salut ! Ça va ? Ça roule ?',
          options: [
            'Salut ! Ça va ? Ça roule ?',
            'Cher citoyen, veuillez décliner votre identité.',
            'Je désire réciter le dictionnaire français.',
            'Quel est le tarif horaire de cette rue ?'
          ],
          correctIndex: 0,
          explanation: '"Ça roule" is the ubiquitous friendly conversational reflex across Paris.'
        },
        {
          prompt: 'How do you politely ask for the bill at a Parisian bistro or terrace?',
          context: 'Food & Ordering',
          spokenAudio: "L'addition s'il vous plaît !",
          options: [
            "L'addition s'il vous plaît !",
            "Donnez-moi les impôts de la république !",
            "Je possède des billets en papier dans ma poche.",
            "Combien d'argent avez-vous volé aujourd'hui ?"
          ],
          correctIndex: 0,
          explanation: '"L\'addition s\'il vous plaît" is the crisp, universal way to settle a table.'
        },
        {
          prompt: 'If you need to find the nearest Métro station in Paris, how do you ask a passerby?',
          context: 'Transit & Navigation',
          spokenAudio: 'Pardon, où se trouve la bouche de métro la plus proche ?',
          options: [
            'Pardon, où se trouve la bouche de métro la plus proche ?',
            'Au secours, je vais m\'évanouir sans boussole !',
            'Expliquez-moi la théorie des trains à vapeur.',
            'Arrêtez-vous et marchez devant moi.'
          ],
          correctIndex: 0,
          explanation: '"La bouche de métro" is the natural spoken phrase for a subway entrance.'
        },
        {
          prompt: 'How do you politely decline a flyer or street seller politely in Paris?',
          context: 'Street Etiquette',
          spokenAudio: 'Non merci, bonne journée à vous !',
          options: [
            'Non merci, bonne journée à vous !',
            'Écartez-vous de mon chemin immédiatement !',
            'Vos papiers ne m\'intéressent absolument pas.',
            'Je refuse d\'entendre votre voix.'
          ],
          correctIndex: 0,
          explanation: 'A quick "Non merci, bonne journée" with a polite nod is Paris street etiquette.'
        }
      ];
    }

    if (level === 'intermediate') {
      return [
        {
          prompt: 'When a Parisian friend tells you: "Laisse tomber, c\'est mort", what do they mean?',
          context: 'Street Reflex',
          spokenAudio: "Laisse tomber pour ce soir, c'est mort.",
          options: [
            'Forget it / call it off; it\'s definitely not happening.',
            'Someone passed away earlier this morning.',
            'Drop your keys onto the sidewalk.',
            'We must visit the historical cemetery.'
          ],
          correctIndex: 0,
          explanation: '"C\'est mort" is the ultimate informal French expression for "no chance / canceled".'
        },
        {
          prompt: 'What does "C\'est trop ouf" mean in everyday Parisian conversation?',
          context: 'Verlan Slang',
          spokenAudio: "Franchement, cette expo est trop ouf !",
          options: [
            'That\'s completely crazy / insane / awesome!',
            'The room smells like vinegar.',
            'This object is extremely heavy.',
            'I am feeling deeply depressed.'
          ],
          correctIndex: 0,
          explanation: '"Ouf" is the iconic Verlan reversal of "fou" (crazy/amazing).'
        },
        {
          prompt: 'A friend texts you: "T\'es chaud pour un verre ce soir ?" What are they asking?',
          context: 'Nightlife Invitation',
          spokenAudio: "T'es chaud pour un verre ce soir ?",
          options: [
            'Are you down / up for getting drinks tonight?',
            'Do you have a medical fever right now?',
            'Is the heating working inside your apartment?',
            'Did you drink hot coffee this morning?'
          ],
          correctIndex: 0,
          explanation: '"Être chaud" colloquially means to be enthusiastic or down for a plan.'
        },
        {
          prompt: 'At a traditional boulangerie, what does asking for "une tradition pas trop cuite" mean?',
          context: 'Artisan Food Etiquette',
          spokenAudio: 'Une tradition pas trop cuite s\'il vous plaît.',
          options: [
            'A traditional sourdough baguette with a lighter, softer golden crust.',
            'A baguette that was baked yesterday.',
            'An unbaked ball of dough.',
            'A slice of chocolate cake.'
          ],
          correctIndex: 0,
          explanation: '"Pas trop cuite" specifies crust preference (golden and chewy rather than dark brown).'
        }
      ];
    }

    if (level === 'advanced') {
      return [
        {
          prompt: 'In rapid dialogue, someone remarks: "Ça m\'a coûté un bras !" What does it convey?',
          context: 'Colloquial Price Idiom',
          spokenAudio: "Ce billet de concert m'a coûté un bras !",
          options: [
            'It cost me an arm and a leg / was ridiculously expensive.',
            'The speaker had a fracture in their arm.',
            'The concert was completely free of charge.',
            'They had to donate blood at the hospital.'
          ],
          correctIndex: 0,
          explanation: '"Coûter un bras" is the French equivalent of costing an arm and a leg.'
        },
        {
          prompt: 'What does "C\'est relou" communicate in Parisian street vernacular?',
          context: 'Verlan Nuance',
          spokenAudio: "Devoir attendre encore 40 minutes, c'est trop relou.",
          options: [
            'It is really annoying, tedious, or a pain in the neck.',
            'The weather is sunny with a light breeze.',
            'The train arrived five minutes early.',
            'The food is delicious and fresh.'
          ],
          correctIndex: 0,
          explanation: '"Relou" is Verlan for "lourd" (heavy/annoying).'
        },
        {
          prompt: 'A friend exclaims: "Genre ! Comme si j\'allais te croire sur parole !"',
          context: 'Sarcasm & Disbelief',
          spokenAudio: "Genre ! Comme si j'allais te croire !",
          options: [
            'As if! Like I would take your word for it! (Playful sarcasm)',
            'Please classify these items into grammatical categories.',
            'I agree with your scientific deduction completely.',
            'What is the ticket price to the museum?'
          ],
          correctIndex: 0,
          explanation: '"Genre !" is the ubiquitous filler and punctuation for ironic disbelief.'
        },
        {
          prompt: 'When negotiating an antique mirror at Les Puces flea market, what is the best tactful phrase?',
          context: 'Flea Market Bargaining',
          spokenAudio: 'Vous me faites un petit prix si je vous prends les deux pièces ?',
          options: [
            'Vous me faites un petit prix si je vous prends les deux pièces ?',
            'Votre miroir est une arnaque bon marché !',
            'Donnez-le moi gratuitement car je suis touriste.',
            'Je refuse de payer le moindre centime.'
          ],
          correctIndex: 0,
          explanation: '"Faire un petit prix" combined with taking two items closes flea market deals with mutual dignity.'
        }
      ];
    }

    if (level === 'fluent') {
      return [
        {
          prompt: 'What does "J\'ai capté direct" mean when uttered during fast conversation?',
          context: 'Quick Comprehension Idiom',
          spokenAudio: "T'inquiète, j'ai capté direct ce que tu voulais dire.",
          options: [
            'I understood right away / caught on immediately.',
            'My phone lost signal on the metro.',
            'I took a photograph of the street sign.',
            'I captured a butterfly in the park.'
          ],
          correctIndex: 0,
          explanation: '"Capter" is colloquial French for understanding or grasping meaning.'
        },
        {
          prompt: 'In a group debate, someone remarks: "Arrête de te prendre la tête avec ça !"',
          context: 'Emotional Cadence',
          spokenAudio: "Franchement, arrête de te prendre la tête avec ça.",
          options: [
            'Stop overthinking and stressing yourself out over it!',
            'Do not touch your forehead with both hands.',
            'Put on a winter hat because it\'s cold.',
            'Go to the doctor for an examination.'
          ],
          correctIndex: 0,
          explanation: '"Se prendre la tête" means agonizing, overthinking, or stressing out.'
        },
        {
          prompt: 'How is "Poser un lapin" understood in everyday social life?',
          context: 'Social Slang',
          spokenAudio: "Il m'a posé un lapin au bistrot hier soir !",
          options: [
            'He stood me up / didn\'t show up to the date or meetup.',
            'He bought a live rabbit as a pet.',
            'He cooked a traditional rabbit stew.',
            'He arrived twenty minutes early.'
          ],
          correctIndex: 0,
          explanation: '"Poser un lapin" means standing someone up without notice.'
        }
      ];
    }

    // Native level
    return [
      {
        prompt: 'In hyper-local Belleville banter, what does "Avoir le seum" express?',
        context: 'Street Emotion Nuance',
        spokenAudio: "J'ai trop le seum d'avoir raté le dernier métro.",
        options: [
          'To be extremely annoyed, bitter, or salty about a setback.',
          'To be deeply in love with someone.',
          'To feel full after eating a hearty meal.',
          'To be enthusiastic about a new project.'
        ],
        correctIndex: 0,
        explanation: '"Avoir le seum" (derived from Arabic somm/poison) expresses intense annoyance or being salty.'
      },
      {
        prompt: 'A friend quips: "Il a pris la grosse tête depuis sa promotion."',
        context: 'Character Critique',
        spokenAudio: "Il a pris la grosse tête, il ne calcule plus personne.",
        options: [
          'He has gotten a huge ego / become arrogant and aloof.',
          'He bought a hat that is too large for him.',
          'He suffered a headache at the office.',
          'He is studying for a doctorate degree.'
        ],
        correctIndex: 0,
        explanation: '"Prendre la grosse tête" is the staple idiom for getting a swollen ego.'
      },
      {
        prompt: 'What does "C\'est du grand n\'importe quoi" express with animated hand gestures?',
        context: 'Conversational Exasperation',
        spokenAudio: "Mais attends, c'est du grand n'importe quoi cette histoire !",
        options: [
          'That is utter nonsense / complete absurdity!',
          'That is an exquisite artistic masterpiece.',
          'I want to order any random dish on the menu.',
          'Please sign the document right here.'
        ],
        correctIndex: 0,
        explanation: '"Du grand n\'importe quoi" expresses vivid frustration with complete nonsense.'
      }
    ];
  }

  // ==========================================
  // TOKYO JAPANESE (ja-JP)
  // ==========================================
  if (isJa) {
    if (level === 'beginner') {
      return [
        {
          prompt: 'How do Tokyo locals naturally greet a friend and ask how things are going?',
          context: 'Informal Everyday Greeting',
          spokenAudio: 'こんにちは！元気？最近どう？',
          options: [
            'こんにちは！元気？最近どう？',
            '国民の皆様、旅券を提示してください。',
            '私は文法規則の勉強を希望します。',
            'ロンドン行きの切符はいくらですか？'
          ],
          correctIndex: 0,
          explanation: '"Genki? Saikin dou?" is the effortless casual greeting used between peers in Tokyo.'
        },
        {
          prompt: 'How do you politely ask for the check at a ramen shop or casual restaurant?',
          context: 'Dining Etiquette',
          spokenAudio: 'すみません、お会計お願いします！',
          options: [
            'すみません、お会計お願いします！',
            '税金の書類を今すぐ持ってきなさい！',
            '私のポケットには現金が入っています。',
            'このラーメンは無料ですか？'
          ],
          correctIndex: 0,
          explanation: '"O-kaikei onegaishimasu" is the universal polite phrase for asking for the bill.'
        },
        {
          prompt: 'How do you ask a station attendant for directions to the nearest subway line?',
          context: 'Transit Navigation',
          spokenAudio: 'すみません、地下鉄の乗り場はどちらですか？',
          options: [
            'すみません、地下鉄の乗り場はどちらですか？',
            '助けてください、迷子になりました！',
            '電車の歴史について講義をしてください。',
            '私の前を歩かないでください。'
          ],
          correctIndex: 0,
          explanation: '"Dochira desu ka?" is courteous and natural when asking staff for directions.'
        },
        {
          prompt: 'How do you politely decline something from an in-store promoter in Tokyo?',
          context: 'Everyday Etiquette',
          spokenAudio: 'あ、大丈夫です。ありがとうございます。',
          options: [
            'あ、大丈夫です。ありがとうございます。',
            '私の前から今すぐ立ち去りなさい！',
            'その商品は粗悪品に見えます。',
            '一時間後に全部買い占めます。'
          ],
          correctIndex: 0,
          explanation: '"Daijoubu desu" with a slight hand wave is the classic polite way to decline in Japan.'
        }
      ];
    }

    if (level === 'intermediate') {
      return [
        {
          prompt: 'At a Tokyo izakaya, what does ordering "とりあえず生ビールで！" mean?',
          context: 'Izakaya Ritual',
          spokenAudio: 'とりあえず生ビールふたつで！',
          options: [
            'To start off, draft beers for now please!',
            'Bring raw fish on a wooden plate.',
            'Give us two glasses of tap water.',
            'We are leaving the restaurant immediately.'
          ],
          correctIndex: 0,
          explanation: '"Toriaezu nama" is the quintessential opening line at any Japanese drinking establishment.'
        },
        {
          prompt: 'What does "お疲れ様です (Otsukaresama desu)" communicate when greeting someone?',
          context: 'Social Harmony & Respect',
          spokenAudio: 'お疲れ様でした！今日も一日頑張ったね。',
          options: [
            'Thank you for your hard work / standard warm greeting acknowledging effort.',
            'You look extremely sleepy and should go home.',
            'I am tired of listening to your voice.',
            'Please pay for everyone\'s meals tonight.'
          ],
          correctIndex: 0,
          explanation: '"Otsukaresama" is the foundational ritual acknowledging mutual effort in Japanese society.'
        },
        {
          prompt: 'What does the ubiquitous slang reaction "それな！" express?',
          context: 'Street Agreement Reflex',
          spokenAudio: 'それな！まじで共感しかないわ。',
          options: [
            'Total enthusiastic agreement ("Preach / Exactly / Couldn\'t agree more").',
            'A warning that something is sharp or dangerous.',
            'A mathematical error in calculation.',
            'An invitation to play baseball.'
          ],
          correctIndex: 0,
          explanation: '"Sore na!" expresses instant peer agreement in modern colloquial Japanese.'
        },
        {
          prompt: 'At a ramen counter, what does asking for "麺固めで (Men katame de)" specify?',
          context: 'Ramen Ordering Nuance',
          spokenAudio: '豚骨ラーメン、麺固めでお願いします！',
          options: [
            'Firm / al dente noodles.',
            'Cold noodles served in ice water.',
            'Extra spicy broth.',
            'No noodles at all, only soup.'
          ],
          correctIndex: 0,
          explanation: '"Katame" asks the chef for firm noodles, the preferred choice of ramen connoisseurs.'
        }
      ];
    }

    if (level === 'advanced') {
      return [
        {
          prompt: 'What does the idiom "目玉が飛び出るほど高い" convey about a price?',
          context: 'Colloquial Price Idiom',
          spokenAudio: 'その時計、目玉が飛び出るほど高かったよ！',
          options: [
            'Eye-poppingly expensive / cost an absolute fortune.',
            'The seller poked someone in the eye.',
            'The item was very cheap at a 100-yen shop.',
            'The watch was broken upon opening.'
          ],
          correctIndex: 0,
          explanation: '"Medama ga tobideru" literally means "eyes popping out"—meaning outrageously expensive.'
        },
        {
          prompt: 'In conversational Japanese, what does "空気を読む (Kuuki o yomu)" mean?',
          context: 'Social Instinct & Nuance',
          spokenAudio: '今は空気を読んで、黙っておいたほうがいいよ。',
          options: [
            'Reading the room / sensing the unstated mood and acting appropriately.',
            'Measuring the barometric atmospheric pressure.',
            'Reading aloud from a meteorology textbook.',
            'Opening all the windows in the train.'
          ],
          correctIndex: 0,
          explanation: '"Kuuki o yomu" is the core Japanese social skill of reading the unspoken atmosphere.'
        },
        {
          prompt: 'Someone in conversation says: "まじで言ってるの？そんなわけないじゃん！"',
          context: 'Playful Incredulity',
          spokenAudio: 'まじで言ってるの？そんなわけないじゃん！',
          options: [
            'Are you for real? No way that is true! (Playful disbelief)',
            'Please show your student ID card immediately.',
            'The weather forecast predicted sunny skies.',
            'What is the rapid train schedule?'
          ],
          correctIndex: 0,
          explanation: '"Majide?" and sentence-ending "-jan!" express relaxed, colloquial shock.'
        },
        {
          prompt: 'In vintage stores in Akihabara, what is the courteous way to ask if an item has discount room?',
          context: 'Craft & Market Etiquette',
          spokenAudio: 'まとめ買いした場合、少しお値引きは可能でしょうか？',
          options: [
            'まとめ買いした場合、少しお値引きは可能でしょうか？',
            '安くしないなら警察を呼びます！',
            '外国人なので無料でください。',
            'この商品は偽物ですよね？'
          ],
          correctIndex: 0,
          explanation: 'Politely asking if bundled buying ("matome-gai") allows discount ("o-nebiki") maintains high respect.'
        }
      ];
    }

    if (level === 'fluent') {
      return [
        {
          prompt: 'What does "ピンと来た" mean when uttered during a fast explanation?',
          context: 'Quick Realization Idiom',
          spokenAudio: '話を聞いてすぐにピンと来ました！',
          options: [
            'It clicked immediately / the penny dropped in a flash!',
            'A safety pin stuck into my finger.',
            'I lost my bowling ball at the alley.',
            'The wifi connection dropped.'
          ],
          correctIndex: 0,
          explanation: '"Pin to kita" means an idea or explanation clicked in an instant.'
        },
        {
          prompt: 'In conversation, what does "適当に (Tekitou ni)" mean depending on context?',
          context: 'Subtle Conversational Flexibility',
          spokenAudio: '適当に頼んでおいて！',
          options: [
            'Play it by ear / order whatever looks good casually.',
            'Strictly according to government regulations.',
            'Do not order anything under any circumstance.',
            'Only order items that cost under 100 yen.'
          ],
          correctIndex: 0,
          explanation: '"Tekitou ni" casually means "just wing it / pick whatever fits nicely".'
        },
        {
          prompt: 'How is "おごり (Ogori)" understood when friends gather for drinks?',
          context: 'Social Camaraderie',
          spokenAudio: '今日の飲み代は僕のおごりだよ！',
          options: [
            'My treat / I am paying for everyone\'s drinks tonight!',
            'You must pay me back double tomorrow.',
            'Alcohol is banned in this establishment.',
            'Everyone pays exactly their own individual coins.'
          ],
          correctIndex: 0,
          explanation: '"Ogori" is the generous and bonding gesture of treating friends.'
        }
      ];
    }

    // Native level
    return [
      {
        prompt: 'In Tokyo youth and street banter, what does "エモい (Emoi)" capture?',
        context: 'Contemporary Slang Nuance',
        spokenAudio: 'この夕焼けの景色、めっちゃエモいね。',
        options: [
          'Deeply nostalgic, poetic, emotionally evocative, or sentimental.',
          'Very spicy food seasoned with wasabi.',
          'An urgent train delay warning.',
          'Extremely boring and devoid of energy.'
        ],
        correctIndex: 0,
        explanation: '"Emoi" (derived from emotional) captures bittersweet, nostalgic aesthetic feelings.'
      },
      {
        prompt: 'What does "腰が低い (Koshi ga hikui)" praise in a respected leader or elder?',
        context: 'Cultural Virtue',
        spokenAudio: 'あの社長は成功しているのに、とても腰が低い人だ。',
        options: [
          'Humble, modest, down-to-earth, and polite despite status.',
          'Suffering from chronic lower back pain.',
          'Physically very short in height.',
          'Unable to bend down to pick up coins.'
        ],
        correctIndex: 0,
        explanation: '"Koshi ga hikui" (low waist/bow) praises genuine humility in distinguished people.'
      },
      {
        prompt: 'What does "神対応 (Kami-taiou)" celebrate in customer service or social etiquette?',
        context: 'Modern Street Praise',
        spokenAudio: '駅員さんの対応が素晴らしくて、まさに神対応だった！',
        options: [
          'God-tier service / unbelievably gracious and helpful assistance.',
          'A religious ceremony inside the temple.',
          'A rude refusal of assistance.',
          'An automatic machine error.'
        ],
        correctIndex: 0,
        explanation: '"Kami-taiou" celebrates extraordinary, above-and-beyond helpfulness.'
      }
    ];
  }

  // ==========================================
  // CARIOCA BRAZILIAN PORTUGUESE (pt-BR)
  // ==========================================
  if (isPt) {
    if (level === 'beginner') {
      return [
        {
          prompt: 'How do Rio locals warmly greet someone on the street or beach?',
          context: 'Carioca Street Greeting',
          spokenAudio: 'E aí, beleza? Tudo bem com você?',
          options: [
            'E aí, beleza? Tudo bem com você?',
            'Cidadão, apresente seus documentos policiais.',
            'Eu desejo recitar as normas gramaticais.',
            'Quanto custa a passagem de avião para Lisboa?'
          ],
          correctIndex: 0,
          explanation: '"E aí, beleza?" is the universal sunny greeting of Rio de Janeiro street life.'
        },
        {
          prompt: 'How do you ask for the check politely at a boteco or beach kiosk?',
          context: 'Dining Etiquette',
          spokenAudio: 'A conta, por favor chefe!',
          options: [
            'A conta, por favor chefe!',
            'Me entregue os impostos municipais agora!',
            'Eu tenho muitas moedas no meu bolso.',
            'Essa comida é gratuita para todos?'
          ],
          correctIndex: 0,
          explanation: '"A conta, por favor chefe!" combines respect and warm Brazilian camaraderie.'
        },
        {
          prompt: 'How do you ask where the nearest metro station is in Rio?',
          context: 'Transit Navigation',
          spokenAudio: 'Com licença, onde fica a estação de metrô mais perto?',
          options: [
            'Com licença, onde fica a estação de metrô mais perto?',
            'Socorro, estou perdido e sem bússola!',
            'Explique a teoria das linhas de ferro.',
            'Não fale comigo na rua.'
          ],
          correctIndex: 0,
          explanation: '"Com licença, onde fica..." is polite, clear, and universally understood.'
        },
        {
          prompt: 'How do you politely decline a beach vendor selling sunglasses in Copacabana?',
          context: 'Beach Etiquette',
          spokenAudio: 'Valeu meu irmão, hoje não, obrigado!',
          options: [
            'Valeu meu irmão, hoje não, obrigado!',
            'Saia da minha frente agora mesmo!',
            'Seus óculos são de péssima qualidade.',
            'Eu vou comprar todos os seus óculos daqui a pouco.'
          ],
          correctIndex: 0,
          explanation: '"Valeu meu irmão, hoje não" with a warm wave is effortless beach etiquette.'
        }
      ];
    }

    if (level === 'intermediate') {
      return [
        {
          prompt: 'When someone tells you: "Tá de sacanagem com a minha cara?", what is the tone?',
          context: 'Playful Incredulity',
          spokenAudio: 'Qual foi mermão, tá de sacanagem com a minha cara?',
          options: [
            'Playful disbelief: "Are you kidding me / messing with me?"',
            'They are challenging you to a professional boxing match.',
            'They are asking for facial sunscreen.',
            'They want to take a portrait photograph.'
          ],
          correctIndex: 0,
          explanation: '"Tá de sacanagem?" said with a laugh is classic Carioca camaradarie.'
        },
        {
          prompt: 'What does "Mó rolê maneiro!" express about an experience?',
          context: 'Carioca Slang',
          spokenAudio: 'Caraca, que rolê maneiro que foi ontem!',
          options: [
            'What an awesome, fun hangout / experience!',
            'We suffered a car breakdown on the highway.',
            'The food gave everyone food poisoning.',
            'It was extremely boring and quiet.'
          ],
          correctIndex: 0,
          explanation: '"Maneiro" is the signature Rio slang for cool, awesome, or great.'
        },
        {
          prompt: 'At a street feira, what is the classic pairing to order?',
          context: 'Authentic Street Food',
          spokenAudio: 'Manda um pastel de carne e um caldo de cana bem gelado!',
          options: [
            'A crispy meat pastel with ice-cold sugarcane juice.',
            'A cup of black coffee with bread.',
            'A bowl of chicken noodle soup.',
            'A glass of milk and chocolate cookies.'
          ],
          correctIndex: 0,
          explanation: 'Pastel with caldo de cana is the sacred cultural pairing of Brazilian street markets.'
        },
        {
          prompt: 'What does "Suave na nave" communicate when answering "¿Tudo bem?"?',
          context: 'Relaxed Cadence',
          spokenAudio: 'Tranquilo meu parceiro, suave na nave.',
          options: [
            'Everything is smooth sailing / totally chill and peaceful.',
            'I am pilot of a spaceship.',
            'I am in a hurry to catch a flight.',
            'I am suffering from seasickness.'
          ],
          correctIndex: 0,
          explanation: '"Suave na nave" is a popular playful rhyming expression meaning 100% chill.'
        }
      ];
    }

    if (level === 'advanced') {
      return [
        {
          prompt: 'In rapid conversation, you hear: "Custou o olho da cara!" What does this mean?',
          context: 'Colloquial Price Idiom',
          spokenAudio: 'Esse ingresso do Maracanã custou o olho da cara!',
          options: [
            'It was extraordinarily expensive / cost an arm and a leg.',
            'The speaker had an eye doctor appointment.',
            'The ticket was given away for free.',
            'The stadium was closed due to rain.'
          ],
          correctIndex: 0,
          explanation: '"Custar o olho da cara" is the universal idiom for being very pricey.'
        },
        {
          prompt: 'Someone in conversation says: "Não vem meter esse caô pra cima de mim irmão!"',
          context: 'Street Nuance',
          spokenAudio: 'Não vem meter esse caô pra cima de mim.',
          options: [
            'Don\'t give me that fake excuse or tall tale bro!',
            'Do not bring your pet dog into the store.',
            'I agree with your explanation completely.',
            'Let\'s sing a samba song together.'
          ],
          correctIndex: 0,
          explanation: '"Caô" is Rio slang for a lie, tall tale, or fake excuse.'
        },
        {
          prompt: 'What does "Dar uma moral" mean when asking a friend for support?',
          context: 'Solidarity & Camaraderie',
          spokenAudio: 'Dá uma moral aí meu irmão, me ajuda nessa parada.',
          options: [
            'Give me a hand / do me a solid favor or back me up.',
            'Deliver a moral lecture on philosophy.',
            'Lend me twenty thousand dollars.',
            'Grade my university exam paper.'
          ],
          correctIndex: 0,
          explanation: '"Dar uma moral" means giving support, helping someone out, or hyping them up.'
        },
        {
          prompt: 'At a craft market, what is the best tactful way to ask for a deal on souvenirs?',
          context: 'Market Haggling',
          spokenAudio: 'Se eu levar essas duas peças no dinheiro, você faz um preço camarada?',
          options: [
            'Se eu levar essas duas peças no dinheiro, você faz um preço camarada chefe?',
            'Você é um ladrão e essa peça não vale nada!',
            'Me dá de graça porque eu sou turista gringo.',
            'Eu me recuso a pagar qualquer centavo.'
          ],
          correctIndex: 0,
          explanation: '"Preço camarada" (friendly discount) paid in cash ("no dinheiro") is peak Brazilian bargaining etiquette.'
        }
      ];
    }

    if (level === 'fluent') {
      return [
        {
          prompt: 'What does "Caiu a ficha" mean when uttered during a fast dialogue?',
          context: 'Realization Idiom',
          spokenAudio: 'Só agora caiu a ficha de tudo o que aconteceu!',
          options: [
            'The penny just dropped / I finally understood the situation!',
            'A poker chip fell onto the casino floor.',
            'My registration form was rejected.',
            'My phone battery reached zero.'
          ],
          correctIndex: 0,
          explanation: '"Cair a ficha" comes from old payphone tokens—meaning realization clicked.'
        },
        {
          prompt: 'In a boteco, someone shouts: "A saideira vai por minha conta!"',
          context: 'Nightlife Camaraderie',
          spokenAudio: 'A saideira vai por minha conta, rapaziada!',
          options: [
            'The final drink before closing is on me / my treat!',
            'Everyone must leave through the emergency exit.',
            'I am going to bed right this second.',
            'The bar is permanently shutting down.'
          ],
          correctIndex: 0,
          explanation: '"A saideira" is the sacred Brazilian term for the last drink before going home.'
        },
        {
          prompt: 'How is "Ficar de boa" understood in everyday social plans?',
          context: 'Relaxed Cadence',
          spokenAudio: 'Hoje eu só quero ficar de boa em casa assistindo um filme.',
          options: [
            'To stay relaxed, take it easy, and chill without stress.',
            'To travel across three different states.',
            'To argue with family members.',
            'To participate in an intense marathon.'
          ],
          correctIndex: 0,
          explanation: '"Ficar de boa" means taking it easy and chilling without drama.'
        }
      ];
    }

    // Native level
    return [
      {
        prompt: 'In authentic Carioca samba circles, what is the true meaning of "Malandragem do bem"?',
        context: 'Cultural Dignity & Street Wisdom',
        spokenAudio: 'A verdadeira malandragem é viver na paz e respeitar o samba.',
        options: [
          'Joyful street wisdom, community harmony, and graceful respect.',
          'Cheating people and running away from debts.',
          'Being violent and aggressive on the boardwalk.',
          'Refusing to pay for goods and services.'
        ],
        correctIndex: 0,
        explanation: 'In historic Rio culture, the malandro is a poet and guardian of cultural dignity, not a criminal.'
      },
      {
        prompt: 'What does "Segurar a onda" mean when someone is getting overwhelmed?',
        context: 'Emotional Resilience',
        spokenAudio: 'Segura a onda meu irmão, vai dar tudo certo no final.',
        options: [
          'Hold your nerve / stay calm and endure the high-pressure situation.',
          'Catch an enormous wave while surfing.',
          'Throw water onto someone\'s face.',
          'Cancel your beach trip because of high tide.'
        ],
        correctIndex: 0,
        explanation: '"Segurar a onda" means keeping your cool and weathering the storm.'
      },
      {
        prompt: 'What does "Bater na palma da mão" mean when the samba rhythm drops?',
        context: 'Musical Fellowship',
        spokenAudio: 'Quando o surdo bateu, a galera começou a bater na palma da mão!',
        options: [
          'Clapping hands in rhythm with the community in joyful unison.',
          'Slapping someone across the face.',
          'Checking your palms for cuts.',
          'Washing your hands in cold water.'
        ],
        correctIndex: 0,
        explanation: 'Clapping hands ("na palma da mão") is the universal expression of unity in Brazilian samba circles.'
      }
    ];
  }

  // ==========================================
  // LATIN AMERICAN / MEXICAN SPANISH (DEFAULT)
  // ==========================================
  if (level === 'beginner') {
    return [
      {
        prompt: 'How do locals informally say hello and ask how you are doing?',
        context: 'Informal Street Greeting',
        spokenAudio: '¡Hola! ¿Cómo estás? ¿Todo bien?',
        options: [
          '¡Hola! ¿Cómo estás? ¿Todo bien?',
          'Estimado ciudadano, reporte su condición.',
          'Yo quiero hablar la lengua del país.',
          '¿Cuál es la regla gramatical número cinco?'
        ],
        correctIndex: 0,
        explanation: 'Everyday greetings use warm, casual diminutives and conversational rhythm.'
      },
      {
        prompt: 'How do you politely ask for the check at a casual cafe or street eatery?',
        context: 'Food & Ordering',
        spokenAudio: 'Disculpe, ¿me trae la cuenta, por favor?',
        options: [
          '¡Deme la factura del gobierno!',
          'Disculpe, ¿me trae la cuenta, por favor?',
          'Yo poseo dinero para su comida.',
          '¿Cuánto dinero tengo que perder hoy?'
        ],
        correctIndex: 1,
        explanation: '"La cuenta, por favor" is universally polite and natural across regions.'
      },
      {
        prompt: 'If you get turned around in a neighborhood, how do you ask for directions?',
        context: 'Transit & Navigation',
        spokenAudio: 'Disculpa, ¿por dónde queda el metro más cercano?',
        options: [
          '¡Ayuda, estoy en peligro de perder el mapa!',
          'Disculpa, ¿por dónde queda el metro más cercano?',
          'Dígame las coordenadas exactas de longitud.',
          'Yo deseo caminar en cualquier dirección.'
        ],
        correctIndex: 1,
        explanation: 'Asking "¿por dónde queda...?" is friendly and immediately understood.'
      },
      {
        prompt: 'How do you politely decline something from a persistent street vendor?',
        context: 'Market Etiquette',
        spokenAudio: 'No, muchas gracias, así está bien.',
        options: [
          '¡Vete de aquí inmediatamente!',
          'No, muchas gracias, así está bien.',
          'No tengo interés en sus productos comerciales.',
          'Cuesta demasiado para mi presupuesto.'
        ],
        correctIndex: 1,
        explanation: '"No, muchas gracias, así está bien" is graceful, firm, and respectful.'
      }
    ];
  }

  if (level === 'intermediate') {
    return [
      {
        prompt: 'When someone tells you: "Ahorita te lo traigo", what do they actually mean?',
        context: 'Temporal Subtlety',
        spokenAudio: 'Ahorita te lo traigo, dame un segundo.',
        options: [
          'Strictly within the next 3 seconds.',
          'Sometime soon (could be 5 minutes, could take a while).',
          'It was delivered yesterday.',
          'It will never happen under any circumstance.'
        ],
        correctIndex: 1,
        explanation: 'In colloquial regional speech, "ahorita" is fluid—it means soon, but without exact pressure.'
      },
      {
        prompt: 'A taxi driver asks: "¿Trae cambio o puro de a quinientos?" What are they asking?',
        context: 'Cash & Transit Culture',
        spokenAudio: 'Jefe, ¿trae cambio o puro de a quinientos?',
        options: [
          'Do you have small change, or only large 500-denomination bills?',
          'Are you traveling with five hundred pieces of luggage?',
          'Can you tip me five hundred coins?',
          'Are you paying for five hundred passengers?'
        ],
        correctIndex: 0,
        explanation: 'Drivers frequently run out of coins and change; "trae cambio" is an essential daily phrase.'
      },
      {
        prompt: 'What does the popular reaction "¡Qué chido!" or "¡Qué padre!" communicate?',
        context: 'Spontaneous Reaction',
        spokenAudio: '¡No manches, qué chido está eso!',
        options: [
          'That is extremely dangerous.',
          'That is really cool / awesome!',
          'I am deeply offended by that.',
          'Please slow down your speech.'
        ],
        correctIndex: 1,
        explanation: '"Chido" is the trademark colloquial word for cool, great, or awesome.'
      },
      {
        prompt: 'At a neighborhood taco stand, what does ordering "con todo" mean?',
        context: 'Authentic Street Food',
        spokenAudio: 'Me da tres al pastor con todo, porfa.',
        options: [
          'With all sauces, cilantro, onions, and standard street garnishes.',
          'Cook the entire pig on my plate.',
          'Bring every single item on the written menu.',
          'I want it served with water only.'
        ],
        correctIndex: 0,
        explanation: '"Con todo" signals to the taquero that you want authentic street preparation.'
      }
    ];
  }

  if (level === 'advanced') {
    return [
      {
        prompt: 'Someone in conversation says: "No te hagas el loco, sabes de qué hablo." What is the tone?',
        context: 'Playful Confrontation / Nuance',
        spokenAudio: 'No te hagas el loco, sabes muy bien de qué hablo.',
        options: [
          'They believe you are clinically insane and need an ambulance.',
          'They are telling you not to play dumb or pretend you don\'t know.',
          'They are praising your exceptional mental agility.',
          'They want you to act crazy in public.'
        ],
        correctIndex: 1,
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
        correctIndex: 0,
        explanation: '"Costar un ojo de la cara" is the universal native idiom for being very pricey.'
      },
      {
        prompt: 'A friend remarks: "Ni al caso lo que me estás diciendo." What are they expressing?',
        context: 'Social Banter & Disagreement',
        spokenAudio: 'Oye, ni al caso lo que me estás diciendo.',
        options: [
          'That\'s completely irrelevant or makes no sense in this context.',
          'I strongly agree and want to sign a contract with you.',
          'Please tell that to the police officer over there.',
          'I am going to court tomorrow morning.'
        ],
        correctIndex: 0,
        explanation: '"Ni al caso" is spoken slang for "irrelevant" or "that has nothing to do with it".'
      },
      {
        prompt: 'When negotiating an artisan price, what is the most culturally tactful counter-offer?',
        context: 'Bargaining Nuance',
        spokenAudio: '¿En cuánto me lo deja si me llevo dos piezas?',
        options: [
          '¿En cuánto me lo deja si me llevo dos piezas, patrón?',
          '¡Usted es un estafador y este objeto vale cero!',
          'Yo exijo que el precio sea la mitad inmediatamente.',
          'Dámelo gratis porque soy extranjero.'
        ],
        correctIndex: 0,
        explanation: 'Asking for a package discount ("si me llevo dos") shows cultural respect for the artisan\'s labor.'
      }
    ];
  }

  if (level === 'fluent') {
    return [
      {
        prompt: 'What does "Me cayó el veinte" mean when uttered during a fast dialogue?',
        context: 'Rapid Epiphany Idiom',
        spokenAudio: '¡Hasta ahorita me cayó el veinte de lo que querías decir!',
        options: [
          'Twenty coins fell out of my pocket onto the street.',
          'The penny just dropped / I finally understood the situation!',
          'My twenty-year-old friend just arrived.',
          'I lost 20% of my conversational energy.'
        ],
        correctIndex: 1,
        explanation: '"Caer el veinte" comes from old coin payphones—meaning realization has clicked.'
      },
      {
        prompt: 'In a fast group debate, someone quips: "Tirar la toalla ni pensarlo." What are they emphasizing?',
        context: 'Conversational Tenacity',
        spokenAudio: 'Aquí tirar la toalla ni pensarlo, vamos con todo.',
        options: [
          'Giving up is out of the question; we\'re pushing through.',
          'Do not drop your gym towel on the bathroom floor.',
          'We should clean the kitchen table before leaving.',
          'The game is permanently cancelled.'
        ],
        correctIndex: 0,
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
        correctIndex: 0,
        explanation: '"Aventado/a" in street slang denotes someone bold, proactive, and daring.'
      }
    ];
  }

  // Native level
  return [
    {
      prompt: 'In neighborhood banter, what does: "No te me vayas a achicopalar ahorita" mean?',
      context: 'Hyper-Local Street Idiom',
      spokenAudio: '¡Ánimo güey, no te me vayas a achicopalar ahorita!',
      options: [
        'Don\'t go getting discouraged or losing your nerve right now!',
        'Do not shrink down physically into a smaller human.',
        'Don\'t drink that glass of water on the table.',
        'Hurry up and purchase chocolate from the market.'
      ],
      correctIndex: 0,
      explanation: '"Achicopalarse" is an authentic Nahuatl-derived street idiom meaning to get downhearted or shrink in confidence.'
    },
    {
      prompt: 'Someone remarks: "Ese güey se cree la última coca del desierto." What is the social subtext?',
      context: 'Street Humor & Banter',
      spokenAudio: 'Míralo cómo camina, se cree la última coca del desierto.',
      options: [
        'They think they are God\'s gift to humanity / overly full of themselves.',
        'They are suffering from severe desert dehydration.',
        'They own a soda distribution monopoly in the city.',
        'They are very generous and sharing drinks with everyone.'
      ],
      correctIndex: 0,
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
      correctIndex: 0,
      explanation: '"Tirar paro" is the quintessential street expression for doing someone a favor or helping them out.'
    }
  ];
}
