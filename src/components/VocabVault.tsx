import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  RotateCcw,
  Timer,
  Sparkles,
  PenTool,
  Layers
} from 'lucide-react';
import { DialectTrack } from '../types';
import { getTutorPersona, getTutorRosterForDialect } from '../data/tutorPersonas';
import { playNativeAudio, stopAllAudio } from '../services/gemini';
import { getTransliteration, usesNonLatinScript } from '../utils/transliteration';

interface VocabCard {
  id: string;
  native: string;
  translit: string;
  english: string;
  category: string;
  example: string;
}

const DIALECT_VOCAB_DECKS: Record<string, VocabCard[]> = {
  'ar-MA': [
    { id: 'ma1', native: 'لباس عليك؟ كلشي بخير؟', translit: 'Labas 3lik? Kulshi bikhir?', english: 'How are you? Is everything good?', category: 'Greetings', example: 'Used every morning and evening across Morocco.' },
    { id: 'ma2', native: 'واحد أتاي مشحر بالنعناع عافاك', translit: 'Wa7ed atay msha77ar b-n-na3na3 3afak', english: 'One brewed mint tea please', category: 'Café & Food', example: 'The #1 café order in Casablanca, Rabat, and Marrakech.' },
    { id: 'ma3', native: 'قهوة نص نص عافاك أ خويا', translit: 'Qahwa nous-nous 3afak a khoya', english: 'Half-espresso half-milk coffee please, my brother', category: 'Café & Food', example: 'Morocco’s signature espresso + steamed milk.' },
    { id: 'ma4', native: 'شحال الثمن النهائي أ المعلم؟', translit: 'Sh7al t-taman n-niha2i a l-m3allem?', english: 'What is the final price, master craftsman?', category: 'Souk Bargaining', example: 'Polite phrase for negotiating in the Medina.' },
    { id: 'ma5', native: 'حطني غير هنا في القنت عافاك', translit: '7attni ghir hna f-l-qent 3afak', english: 'Drop me off right here on the corner please', category: 'Taxis & Transit', example: 'Essential when riding a red Petit Taxi in Casa.' },
    { id: 'ma6', native: 'الله يرحم الوالدين، شكراً بزاف!', translit: 'Allah y-r7am l-walidin, shokran bezzaf!', english: 'May God bless your parents, thank you so much!', category: 'Hospitality', example: 'The most beloved expression of gratitude in Morocco.' },
    { id: 'ma7', native: 'صافي، نتلاقاو دابا شوية!', translit: 'Safi, ntlaqaw daba shwiya!', english: 'Okay, let us meet up in a little bit!', category: 'Street Slang', example: 'Combines "safi" (okay) and "daba" (now).' },
    { id: 'ma8', native: 'الله يعطيك الصحة، الماكلة بنينة بزاف!', translit: 'Allah ya3tik s-sa77a, l-makla bnina bezzaf!', english: 'Bless your hands/health, the food is super delicious!', category: 'Café & Food', example: 'Said after enjoying Tagine or Friday Couscous.' }
  ],
  'ar-EG': [
    { id: 'eg1', native: 'إزيك يا باشا؟ عامل إيه؟', translit: 'Ezzayak ya basha? 3amel eh?', english: 'How are you boss? How are you doing?', category: 'Greetings', example: 'Warm everyday Cairene street greeting.' },
    { id: 'eg2', native: 'كله تمام الحمد لله، زي الفل!', translit: 'Kollo tamam el-7amdulillah, zay el-fol!', english: 'Everything is great thank God, like jasmine!', category: 'Greetings', example: 'Classic upbeat Egyptian response.' },
    { id: 'eg3', native: 'واحد شاي في الخمسينة بالنعناع', translit: 'Wa7ed shay fel-khamseenah b-el-na3na3', english: 'One strong black tea with mint in a classic glass', category: 'Ahwa Café', example: 'Ordered at every traditional Ahwa Baladi in Cairo.' },
    { id: 'eg4', native: 'واحد كشري كمالة وزود الدقة والشطة', translit: 'Wa7ed koshari kamala w zawwed el-daqqa wel-shatta', english: 'One loaded koshari with extra garlic sauce and chili', category: 'Street Food', example: 'How true locals order Egypt’s national dish.' },
    { id: 'eg5', native: 'على جنب هنا لو سمحت يا أسطى، كام الحساب؟', translit: '3ala ganb hena law sama7t ya osta, kam el-7esab?', english: 'Pull over right here please chief, how much is the fare?', category: 'Transit', example: 'Used in Cairo white taxis and microbuses.' },
    { id: 'eg6', native: 'كبر دماغك وفكك من الحوار ده', translit: 'Kabbar demaghak w fakkak men el-7ewar da', english: 'Let it go and don’t stress over that drama', category: 'Street Slang', example: 'Cairo’s favorite phrase for peace of mind.' }
  ],
  'es-MX': [
    { id: 'mx1', native: '¡Qué onda compa! ¿Cómo andas al cien?', translit: '', english: 'What’s up buddy! Doing 100% great?', category: 'Greetings', example: 'Everyday Mexico City street greeting.' },
    { id: 'mx2', native: 'Me das tres tacos al pastor con todo y bien doraditos, porfa', translit: '', english: 'Give me three pastor tacos with everything and crispy, please', category: 'Street Food', example: 'Authentic taquería order in CDMX.' },
    { id: 'mx3', native: '¡Me late un buen! Ahorita nos vemos allá', translit: '', english: 'I love that idea! See you there in a bit', category: 'Social Slang', example: '"Me late" replaces stiff "estoy de acuerdo".' },
    { id: 'mx4', native: 'Jefe, me deja aquí en la mera esquina, porfa', translit: '', english: 'Boss, drop me off right here on the corner, please', category: 'Transit', example: 'Polite direction for Mexican taxi drivers.' },
    { id: 'mx5', native: '¿Cuánto es lo menos en efectivo si me llevo dos piezas?', translit: '', english: 'What is your lowest cash price if I take two pieces?', category: 'Markets', example: 'Respectful bargaining at Mexican artisan markets.' }
  ],
  'fr-FR': [
    { id: 'fr1', native: 'Salut ! Ça roule aujourd’hui ? Quoi de neuf ?', translit: '', english: 'Hey! Everything rolling smoothly today? What’s new?', category: 'Greetings', example: 'Casual everyday Parisian greeting.' },
    { id: 'fr2', native: 'Un petit café serré au comptoir, s’il vous plaît !', translit: '', english: 'A short espresso at the bar counter, please!', category: 'Bistro & Café', example: 'Morning ritual in Parisian bistros.' },
    { id: 'fr3', native: 'T’inquiète pas, c’est carrément ouf cet endroit !', translit: '', english: 'Don’t worry, this place is completely awesome!', category: 'Verlan Slang', example: '"Ouf" is Verlan for "fou" (crazy/amazing).' },
    { id: 'fr4', native: 'Excusez-moi monsieur, l’addition s’il vous plaît !', translit: '', english: 'Excuse me sir, the bill please!', category: 'Bistro & Café', example: 'Polite way to ask for the check in France.' }
  ],
  'ja-JP': [
    { id: 'ja1', native: 'お疲れ様です！最近どうですか？', translit: 'Otsukaresama desu! Saikin dou desu ka?', english: 'Cheers for your hard work! How have things been lately?', category: 'Greetings', example: 'Warm everyday Tokyo greeting.' },
    { id: 'ja2', native: 'とりあえず生ビール二つお願いします！', translit: 'Toriaezu nama biiru futatsu onegaishimasu!', english: 'To start off, two draft beers please!', category: 'Izakaya', example: 'The #1 opening order at any Tokyo izakaya.' },
    { id: 'ja3', native: 'それな！めっちゃわかるよ！', translit: 'Sore na! Meccha wakaru yo!', english: 'Totally! I completely relate to that!', category: 'Tokyo Slang', example: 'Natural peer agreement in Tokyo.' },
    { id: 'ja4', native: 'すみません、お会計お願いします！ごちそうさまでした！', translit: 'Sumimasen, o-kaikei onegaishimasu! Gochisousama deshita!', english: 'Excuse me, the check please! Thank you for the meal!', category: 'Dining', example: 'Polite restaurant closing in Japan.' }
  ],
  'pt-BR': [
    { id: 'pt1', native: 'E aí meu parceiro, beleza? Tudo tranquilo?', translit: '', english: 'What’s up my partner, all good? Everything chill?', category: 'Greetings', example: 'Sunny Rio de Janeiro greeting.' },
    { id: 'pt2', native: 'Manda uma água de coco bem gelada aí, chefe!', translit: '', english: 'Send an ice-cold coconut water my way, boss!', category: 'Beach Kiosk', example: 'Ordered on Copacabana and Ipanema beaches.' },
    { id: 'pt3', native: 'Valeu demais irmão, tamo junto sempre!', translit: '', english: 'Thanks so much brother, we’re in this together always!', category: 'Carioca Slang', example: 'Signature Brazilian expression of solidarity.' }
  ]
};

export const VocabVault: React.FC<{ selectedDialect: DialectTrack }> = ({ selectedDialect }) => {
  const deck =
    DIALECT_VOCAB_DECKS[selectedDialect.id] ||
    DIALECT_VOCAB_DECKS[selectedDialect.id.split('-')[0] === 'ar' ? 'ar-MA' : 'es-MX'] ||
    DIALECT_VOCAB_DECKS['ar-MA'];

  const [mode, setMode] = useState<'flashcards' | 'writing_drill' | 'blitz_60s'>('flashcards');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [writtenAttempt, setWrittenAttempt] = useState('');
  const [drillFeedback, setDrillFeedback] = useState<string | null>(null);

  // 60-Second Blitz state
  const [blitzSeconds, setBlitzSeconds] = useState(60);
  const [blitzScore, setBlitzScore] = useState(0);
  const [blitzRunning, setBlitzRunning] = useState(false);

  const currentCard = deck[cardIndex % deck.length];
  const persona = getTutorPersona(selectedDialect.id);
  const isNonLatin = usesNonLatinScript(selectedDialect.id);

  useEffect(() => {
    setCardIndex(0);
    setIsFlipped(false);
    setWrittenAttempt('');
    setDrillFeedback(null);
    setBlitzRunning(false);
  }, [selectedDialect.id, mode]);

  useEffect(() => {
    if (!blitzRunning) return;
    if (blitzSeconds <= 0) {
      setBlitzRunning(false);
      return;
    }
    const t = setTimeout(() => setBlitzSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [blitzRunning, blitzSeconds]);

  const speakCard = (text: string, rate = 1.0) => {
    playNativeAudio({
      text,
      dialectId: selectedDialect.id,
      voiceGender: persona.voiceGender,
      personaId: persona.id,
      rate
    });
  };

  const handleMarkMastered = () => {
    if (!masteredIds.includes(currentCard.id)) {
      setMasteredIds([...masteredIds, currentCard.id]);
    }
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % deck.length);
  };

  const handleCheckWriting = () => {
    const cleanInput = writtenAttempt.toLowerCase().trim();
    const cleanNative = currentCard.native.toLowerCase();
    const cleanTranslit = (currentCard.translit || getTransliteration(currentCard.native, selectedDialect.id)).toLowerCase();

    if (
      cleanInput.length >= 2 &&
      (cleanNative.includes(cleanInput) || (cleanTranslit && cleanTranslit.includes(cleanInput)))
    ) {
      setDrillFeedback('✓ Spot on! You wrote it like a local!');
      speakCard(currentCard.native, 1.0);
    } else {
      setDrillFeedback(`💡 Almost! Target: ${currentCard.native} ${currentCard.translit ? `(${currentCard.translit})` : ''}`);
      speakCard(currentCard.native, 0.85);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <BookOpen className="text-emerald-400" />
              <span>{selectedDialect.flag} {selectedDialect.dialect} Vocab Vault</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Spaced-repetition audio flashcards, native script writing drills & 60-second fluency blitz.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'flashcards', label: 'Audio Flashcards', icon: Layers },
              { id: 'writing_drill', label: 'Write & Spell', icon: PenTool },
              { id: 'blitz_60s', label: '60s Fluency Blitz', icon: Timer }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    stopAllAudio();
                    setMode(tab.id as any);
                    if (tab.id === 'blitz_60s') {
                      setBlitzSeconds(60);
                      setBlitzScore(0);
                      setBlitzRunning(true);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                    mode === tab.id
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* MODE 1: AUDIO FLASHCARDS */}
        {mode === 'flashcards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>
                Card {(cardIndex % deck.length) + 1} of {deck.length} • Category: <strong className="text-cyan-400">{currentCard.category}</strong>
              </span>
              <span className="text-emerald-400">
                ✓ {masteredIds.length} / {deck.length} Mastered
              </span>
            </div>

            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[290px] bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xl relative transition-all"
            >
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-bold text-cyan-400 mb-4">
                {isFlipped ? 'English Meaning & Cultural Context' : `${selectedDialect.dialect} Native Phrase`}
              </span>

              {!isFlipped ? (
                <>
                  <h2 className="text-2xl sm:text-4xl font-black text-white leading-snug mb-3">
                    {currentCard.native}
                  </h2>
                  {(currentCard.translit || isNonLatin) && (
                    <p className="text-sm font-mono text-cyan-300 mb-4">
                      🔤 {currentCard.translit || getTransliteration(currentCard.native, selectedDialect.id)}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-2xl sm:text-3xl font-black text-emerald-400 mb-3">
                    "{currentCard.english}"
                  </h2>
                  <p className="text-sm text-slate-300 max-w-lg">{currentCard.example}</p>
                </>
              )}

              <div className="mt-6 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => speakCard(currentCard.native, 1.0)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 size={15} /> Listen (1.0x)
                </button>
                <button
                  onClick={() => speakCard(currentCard.native, 0.78)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  🐢 Slow (0.75x)
                </button>
              </div>
              <span className="text-[11px] text-slate-500 mt-4">Tap card to flip</span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex((prev) => (prev + 1) % deck.length);
                }}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Review Again Later
              </button>
              <button
                onClick={handleMarkMastered}
                className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 size={16} /> Got It! Next Card ➔
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: WRITING & SPELLING DRILL */}
        {mode === 'writing_drill' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Write in {selectedDialect.dialect} (Script or Phonetics)
              </span>
              <button
                onClick={() => speakCard(currentCard.native, 0.9)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 size={14} /> Hear Prompt
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Translate & Write:</p>
              <h3 className="text-2xl font-black text-white mt-1">"{currentCard.english}"</h3>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={writtenAttempt}
                onChange={(e) => setWrittenAttempt(e.target.value)}
                placeholder={`Type in ${selectedDialect.dialect} or phonetics...`}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleCheckWriting}
                className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase cursor-pointer"
              >
                Check Writing
              </button>
            </div>

            {drillFeedback && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-300">{drillFeedback}</span>
                <button
                  onClick={() => {
                    setWrittenAttempt('');
                    setDrillFeedback(null);
                    setCardIndex((prev) => (prev + 1) % deck.length);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
                >
                  Next Phrase ➔
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: 60-SECOND KEEP FLUENCY BLITZ */}
        {mode === 'blitz_60s' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-sm">
                ⏱️ {blitzSeconds}s Remaining
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black text-sm">
                ⚡ Score: {blitzScore}
              </span>
            </div>

            {blitzSeconds > 0 ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Match the meaning fast:</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">{currentCard.native}</h3>
                  {currentCard.translit && (
                    <p className="text-xs font-mono text-cyan-400 mt-1">🔤 {currentCard.translit}</p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-left">
                  {deck.slice(0, 4).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        if (opt.id === currentCard.id) {
                          setBlitzScore((s) => s + 10);
                        }
                        setCardIndex((prev) => (prev + 1) % deck.length);
                      }}
                      className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-sm font-bold text-slate-200 cursor-pointer"
                    >
                      {opt.english}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-6">
                <Sparkles className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-2xl font-black text-white">60s Blitz Complete!</h3>
                <p className="text-sm text-slate-300">Final Reflex Score: <strong className="text-emerald-400">{blitzScore} pts</strong></p>
                <button
                  onClick={() => {
                    setBlitzSeconds(60);
                    setBlitzScore(0);
                    setBlitzRunning(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase cursor-pointer"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
