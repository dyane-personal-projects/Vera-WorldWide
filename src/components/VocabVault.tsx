import React, { useState } from 'react';
import { BookOpen, Search, Volume2, Sparkles, Filter, Check } from 'lucide-react';
import { DialectTrack } from '../types';

interface VocabVaultProps {
  selectedDialect: DialectTrack;
}

interface VocabItem {
  id: string;
  word: string;
  translation: string;
  context: string;
  dialect: string;
  type: 'slang' | 'grammar' | 'idiom';
}

export const VocabVault: React.FC<VocabVaultProps> = ({ selectedDialect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'slang' | 'grammar' | 'idiom'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const vocabularyItems: VocabItem[] = [
    // Mexican Spanish
    {
      id: 'v1',
      word: 'Me late un buen',
      translation: 'I really like that / sounds great to me',
      context: 'Colloquial Mexican expression used to express enthusiastic agreement instead of formal "me gusta".',
      dialect: 'Mexican Spanish',
      type: 'slang'
    },
    {
      id: 'v2',
      word: '¿Me da dos de pastor con todo?',
      translation: 'Could I get two pastor tacos with everything?',
      context: '"Con todo" at a taco stand implies cilantro, diced onion, and pineapple.',
      dialect: 'Mexican Spanish',
      type: 'idiom'
    },
    {
      id: 'v3',
      word: 'No te hagas pato',
      translation: "Don't play dumb / don't avoid responsibility",
      context: 'Used playfully when someone pretends not to notice or understand an obligation.',
      dialect: 'Mexican Spanish',
      type: 'slang'
    },
    // Parisian French
    {
      id: 'v4',
      word: "C'est trop ouf",
      translation: "That's completely crazy / insane",
      context: 'Verlan reversal of "fou". Ubiquitous in modern Parisian youth & street banter.',
      dialect: 'Parisian French',
      type: 'slang'
    },
    {
      id: 'v5',
      word: 'Ça te dit de capter ?',
      translation: 'Do you want to meet up / hang out?',
      context: 'Informal alternative to "voulez-vous que l’on se voie ?".',
      dialect: 'Parisian French',
      type: 'idiom'
    },
    // Tokyo Japanese
    {
      id: 'v6',
      word: 'お疲れ様です (Otsukaresama desu)',
      translation: 'Thank you for your hard work / standard polite greeting',
      context: 'Essential greeting used in workplaces and casual gatherings to acknowledge effort.',
      dialect: 'Tokyo Standard',
      type: 'grammar'
    },
    {
      id: 'v7',
      word: 'めっちゃウマい (Meccha umai)',
      translation: 'Super delicious / incredible taste',
      context: 'Very casual food compliment commonly heard at ramen shops and izakayas.',
      dialect: 'Tokyo Standard',
      type: 'slang'
    },
    // Moroccan Darija
    {
      id: 'v8',
      word: 'Bzzaf 3lik (بزاف عليك)',
      translation: 'Way too much for you / out of your league',
      context: 'Lighthearted teasing phrase heard in market haggling and banter.',
      dialect: 'Moroccan Darija',
      type: 'idiom'
    },
    {
      id: 'v9',
      word: 'Safi, mzyan (صافي، مزيان)',
      translation: 'Done, sounds great',
      context: 'Closing agreement formula in Moroccan transactions and conversations.',
      dialect: 'Moroccan Darija',
      type: 'grammar'
    },
    // Carioca Brazilian Portuguese
    {
      id: 'v10',
      word: 'Mano do céu, que rolê maneiro!',
      translation: 'Good heavens bro, what an awesome hangout!',
      context: '"Maneiro" is the signature Rio slang for cool or great.',
      dialect: 'Carioca Brazilian',
      type: 'slang'
    },
    {
      id: 'v11',
      word: 'Suave na nave',
      translation: 'Smooth sailing / totally chill',
      context: 'Classic rhyming Brazilian slang indicating peace of mind and no stress.',
      dialect: 'Carioca Brazilian',
      type: 'idiom'
    },
    // Neapolitan Italian
    {
      id: 'v12',
      word: 'Stamme senza pensieri',
      translation: "Let's be without worries / zero stress",
      context: 'Iconic Neapolitan life philosophy spoken with open arms and warm camaraderie.',
      dialect: 'Neapolitan (Napulitano)',
      type: 'idiom'
    },
    {
      id: 'v13',
      word: 'Uè guaglió, comme staje?',
      translation: 'Hey kid/bro, how are you doing?',
      context: '"Guaglió" is the affectionate Neapolitan term for a youth or close friend.',
      dialect: 'Neapolitan (Napulitano)',
      type: 'slang'
    },
    // Bavarian German
    {
      id: 'v14',
      word: 'A gscheide Brotzeit',
      translation: 'A proper hearty Bavarian snack',
      context: 'Traditional mid-afternoon tavern spread with pretzel, cheese, and cold cuts.',
      dialect: 'Bavarian (Boarisch)',
      type: 'grammar'
    },
    {
      id: 'v15',
      word: 'Servus beinand!',
      translation: 'Greetings to everyone gathered here!',
      context: 'Warm Alpine greeting used upon entering a traditional beer garden or tavern.',
      dialect: 'Bavarian (Boarisch)',
      type: 'slang'
    },
    // Egyptian Masri Arabic
    {
      id: 'v16',
      word: 'يا سيدي الفل والياسمين (Ya seedi)',
      translation: 'My dear gentleman, purest blossoms of jasmine',
      context: 'Flowery and warm traditional Cairene greeting showing boundless street hospitality.',
      dialect: 'Egyptian Masri',
      type: 'idiom'
    },
    {
      id: 'v17',
      word: 'على راسي يا باشا (Ala rasi ya basha)',
      translation: 'Upon my head, boss (At your complete service)',
      context: 'Respectful and affectionate response when someone asks a favor.',
      dialect: 'Egyptian Masri',
      type: 'slang'
    },
    // Colombian Paisa Spanish
    {
      id: 'v18',
      word: '¡Qué hubo pues, mi parce!',
      translation: "What's up then, my buddy / partner!",
      context: '"Parce" or "parcero" is the definitive Colombian term for a close friend.',
      dialect: 'Colombian Paisa',
      type: 'slang'
    },
    {
      id: 'v19',
      word: 'Más bueno que el pan',
      translation: 'Better than bread (Extremely sweet, kind, or enjoyable)',
      context: 'Paisa idiom describing a wonderful person or fantastic situation.',
      dialect: 'Colombian Paisa',
      type: 'idiom'
    }
  ];

  // Load custom vocabulary items saved during interactive tutor sessions
  const customItems: VocabItem[] = (() => {
    try {
      const raw = localStorage.getItem('vera_custom_vocab');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const allItems = [...customItems, ...vocabularyItems];

  const filteredVocab = allItems.filter((item) => {
    const matchesDialect =
      item.dialect === selectedDialect.dialect ||
      item.dialect.toLowerCase().includes(selectedDialect.name.toLowerCase());
    const matchesSearch =
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.context.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;

    return (matchesDialect || searchQuery.length > 0) && matchesSearch && matchesFilter;
  });

  const playAudio = (item: VocabItem) => {
    if (playingId === item.id) {
      window.speechSynthesis?.cancel();
      setPlayingId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.word);
      if (item.dialect.includes('Spanish')) utterance.lang = 'es-MX';
      else if (item.dialect.includes('French')) utterance.lang = 'fr-FR';
      else if (item.dialect.includes('Japanese')) utterance.lang = 'ja-JP';
      else if (item.dialect.includes('Arabic')) utterance.lang = 'ar-SA';
      else if (item.dialect.includes('Portuguese')) utterance.lang = 'pt-BR';
      else if (item.dialect.includes('Italian')) utterance.lang = 'it-IT';
      else if (item.dialect.includes('German')) utterance.lang = 'de-DE';

      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);

      setPlayingId(item.id);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-sans p-6 md:p-12 max-w-5xl mx-auto w-full space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
            <BookOpen size={16} /> Linguistic Vault & Memory Bank
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Dialect Memory: {selectedDialect.dialect}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review colloquial phrases, street expressions, and grammatical distinctions saved during your sessions.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          {(['all', 'slang', 'idiom', 'grammar'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold capitalize transition-all ${
                selectedFilter === filter
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search slang, translations, or context in ${selectedDialect.dialect}...`}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
        />
      </div>

      {/* Vocab Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVocab.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
                    item.type === 'slang'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : item.type === 'idiom'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  }`}
                >
                  {item.type}
                </span>

                <button
                  onClick={() => playAudio(item)}
                  className={`p-2 rounded-xl border transition-colors ${
                    playingId === item.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-pulse'
                      : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                  }`}
                  title="Listen to native audio"
                >
                  <Volume2 size={16} />
                </button>
              </div>

              <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors mb-1">
                {item.word}
              </h3>
              <p className="text-sm font-semibold text-cyan-400 mb-3">{item.translation}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-0.5">
                Dialect Context
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{item.context}</p>
            </div>
          </div>
        ))}

        {filteredVocab.length === 0 && (
          <div className="col-span-full py-16 text-center bg-slate-900/30 rounded-3xl border border-slate-800/80 text-slate-500 space-y-2">
            <BookOpen size={32} className="mx-auto opacity-40 text-slate-600" />
            <p className="text-sm font-bold">No saved memories match "{searchQuery}".</p>
            <p className="text-xs text-slate-600">Start talking to Vera to automatically populate regional slang into your vault.</p>
          </div>
        )}
      </div>
    </div>
  );
};
