import React, { useState, useEffect } from 'react';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Award,
  RotateCcw,
  Sparkles,
  BrainCircuit,
  Compass
} from 'lucide-react';
import { UserProfile, DialectTrack } from '../types';
import { getDialectPlacementQuestions, FluencyLevelKey, QuizQuestion } from '../data/placementCurriculum';
import { playNativeAudio, stopAllAudio } from '../services/gemini';
import { getTutorPersona } from '../data/tutorPersonas';
import { getTransliteration, usesNonLatinScript } from '../utils/transliteration';

interface PlacementQuizProps {
  user: UserProfile | null;
  selectedDialect: DialectTrack;
  onUpdateUserLevel: (level: string) => void;
  onComplete: () => void;
}

const LEVEL_TIERS: {
  key: FluencyLevelKey;
  cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  title: string;
  subtitle: string;
  badge: string;
}[] = [
  {
    key: 'beginner',
    cefr: 'A1',
    title: 'Beginner Foundations',
    subtitle: 'Essential street greetings, polite requests, and survival phrases',
    badge: 'A1'
  },
  {
    key: 'intermediate',
    cefr: 'A2',
    title: 'Elementary Street Flow',
    subtitle: 'Ordering at cafés, hailing taxis, small change, and daily timing',
    badge: 'A2'
  },
  {
    key: 'advanced',
    cefr: 'B1',
    title: 'Intermediate Banter',
    subtitle: 'Playful teasing, souk bargaining, and everyday local idioms',
    badge: 'B1'
  },
  {
    key: 'fluent',
    cefr: 'B2',
    title: 'Upper-Intermediate Fluency',
    subtitle: 'Fast contractions, social subtext, and neighborhood respect codes',
    badge: 'B2'
  },
  {
    key: 'native',
    cefr: 'C1',
    title: 'Mastery & Street Proverbs',
    subtitle: 'Deep cultural metaphors, folk wisdom, and native-speed humor',
    badge: 'C1'
  }
];

export const PlacementQuiz: React.FC<PlacementQuizProps> = ({
  selectedDialect,
  onUpdateUserLevel,
  onComplete
}) => {
  const [stage, setStage] = useState<'select_mode' | 'testing' | 'results'>('select_mode');
  const [activeTierIdx, setActiveTierIdx] = useState<number>(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [tierCorrectCount, setTierCorrectCount] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [assessedCefr, setAssessedCefr] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('A1');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showPhonetics, setShowPhonetics] = useState(true);

  const isNonLatin = usesNonLatinScript(selectedDialect.id);
  const activeTier = LEVEL_TIERS[activeTierIdx] || LEVEL_TIERS[0];
  const currentQ = questions[currentIndex];

  useEffect(() => {
    stopAllAudio();
    setStage('select_mode');
    setActiveTierIdx(0);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setTierCorrectCount(0);
    setTotalCorrect(0);
    setTotalAttempted(0);
  }, [selectedDialect.id]);

  const startQuizAtTier = (tierIndex: number) => {
    stopAllAudio();
    const tier = LEVEL_TIERS[tierIndex] || LEVEL_TIERS[0];
    const freshQuestions = getDialectPlacementQuestions(tier.key, selectedDialect.id);
    setActiveTierIdx(tierIndex);
    setQuestions(freshQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setTierCorrectCount(0);
    setAssessedCefr(tier.cefr);
    setStage('testing');
  };

  const handleSkipAsBeginner = () => {
    stopAllAudio();
    setAssessedCefr('A1');
    onUpdateUserLevel('A1');
    onComplete();
  };

  const handlePlayAudio = (textToSpeak?: string) => {
    const phrase = textToSpeak || currentQ?.spokenAudio;
    if (!phrase) return;
    const persona = getTutorPersona(selectedDialect.id);
    setIsPlayingAudio(true);
    playNativeAudio({
      text: phrase,
      dialectId: selectedDialect.id,
      voiceGender: persona.voiceGender,
      personaId: persona.id,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(index);
    setIsAnswered(true);
    setTotalAttempted((prev) => prev + 1);

    if (index === currentQ.correctIndex) {
      setTierCorrectCount((prev) => prev + 1);
      setTotalCorrect((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!currentQ) return;
    stopAllAudio();
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const passedTier = tierCorrectCount >= Math.ceil(questions.length * 0.7);

    if (passedTier && activeTierIdx + 1 < LEVEL_TIERS.length) {
      const nextIdx = activeTierIdx + 1;
      const nextTier = LEVEL_TIERS[nextIdx];
      setAssessedCefr(nextTier.cefr);
      setActiveTierIdx(nextIdx);
      setQuestions(getDialectPlacementQuestions(nextTier.key, selectedDialect.id));
      setCurrentIndex(0);
      setTierCorrectCount(0);
      return;
    }

    const finalCefr = passedTier ? activeTier.cefr : LEVEL_TIERS[Math.max(0, activeTierIdx - 1)].cefr;
    setAssessedCefr(finalCefr);
    onUpdateUserLevel(finalCefr);
    setStage('results');
  };

  if (stage === 'select_mode') {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
        <div className="max-w-3xl mx-auto space-y-8 py-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{selectedDialect.flag}</span>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                  {selectedDialect.dialect} • Adaptive Placement
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Where should we start your {selectedDialect.dialect} journey?
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
              Jump straight in as a complete beginner, or take our adaptive street-fluency assessment with native audio and randomized questions tailored to {selectedDialect.region}.
            </p>

            <div className="mt-6 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Compass size={18} className="text-emerald-400" />
                  <h3 className="font-black text-white text-base">I'm Brand New to {selectedDialect.dialect} (Start at A1)</h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Skip the test and start from zero with your local teacher guiding you word-by-word.
                </p>
              </div>
              <button
                onClick={handleSkipAsBeginner}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shrink-0 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Start at A1 ➔
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 px-1 flex items-center gap-2">
              <BrainCircuit size={16} className="text-cyan-400" />
              <span>Or Choose a Level to Test Your {selectedDialect.dialect} Skills:</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {LEVEL_TIERS.map((tier, idx) => (
                <button
                  key={tier.key}
                  onClick={() => startQuizAtTier(idx)}
                  className="p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-black text-xs">
                        CEFR {tier.badge}
                      </span>
                      <span className="text-xs font-bold text-slate-500 group-hover:text-cyan-400 transition-colors">
                        Start Assessment ➔
                      </span>
                    </div>
                    <h3 className="font-black text-white text-base group-hover:text-cyan-300 transition-colors">
                      {tier.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tier.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'results' || !currentQ) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center">
            <Award size={34} />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
              {selectedDialect.flag} {selectedDialect.dialect} Official Placement
            </span>
            <h2 className="text-3xl font-black text-white mt-1">Level {assessedCefr} Unlocked!</h2>
            <p className="text-sm text-slate-400 mt-2">
              You scored <span className="text-white font-bold">{totalCorrect} / {totalAttempted}</span> across our adaptive street-fluency assessment. Your local teachers and lesson path are now calibrated to <span className="text-emerald-400 font-bold">CEFR {assessedCefr}</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => startQuizAtTier(activeTierIdx)}
              className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw size={15} /> Retake With New Questions
            </button>
            <button
              onClick={onComplete}
              className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Continue to Learning Path ➔
            </button>
          </div>
        </div>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D'];
  const spokenTranslit =
    isNonLatin && currentQ.spokenAudio ? getTransliteration(currentQ.spokenAudio, selectedDialect.id) : '';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStage('select_mode')}
              className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ← Change Tier
            </button>
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
              {selectedDialect.flag} {selectedDialect.dialect} • {activeTier.badge} ({activeTier.title})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isNonLatin && (
              <button
                onClick={() => setShowPhonetics(!showPhonetics)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  showPhonetics
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                Phonetics: {showPhonetics ? 'ON' : 'OFF'}
              </button>
            )}
            <button
              onClick={() => startQuizAtTier(activeTierIdx)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
              title="Shuffle a new question order"
            >
              <RotateCcw size={12} /> Shuffle
            </button>
            <span className="text-xs text-slate-400 font-bold">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-bold text-cyan-400">
            <Sparkles size={12} />
            <span>{currentQ.context}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white leading-snug">{currentQ.prompt}</h3>

          {currentQ.spokenAudio && (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-base font-bold text-emerald-300">{currentQ.spokenAudio}</p>
                {isNonLatin && showPhonetics && spokenTranslit && (
                  <p className="text-xs font-mono text-cyan-300/90">🔤 {spokenTranslit}</p>
                )}
              </div>
              <button
                onClick={() => handlePlayAudio(currentQ.spokenAudio)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black shrink-0 transition-all cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                }`}
              >
                <Volume2 size={16} className={isPlayingAudio ? 'animate-bounce' : ''} />
                <span>{isPlayingAudio ? 'Speaking...' : 'Listen to Native Speaker'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const optTranslit = isNonLatin && showPhonetics ? getTransliteration(opt, selectedDialect.id) : '';
            const showOptTranslit = optTranslit && optTranslit.toLowerCase() !== opt.toLowerCase();

            let btnStyle = 'bg-slate-950/70 border-slate-800 hover:border-slate-600 text-slate-100';
            if (isAnswered) {
              if (idx === currentQ.correctIndex) {
                btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/10';
              } else if (idx === selectedOption) {
                btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
              } else {
                btnStyle = 'bg-slate-950/30 border-slate-800/50 text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-300 shrink-0 mt-0.5">
                    {optionLetters[idx] || idx + 1}
                  </span>
                  <div>
                    <div className="text-sm sm:text-base font-bold leading-snug">{opt}</div>
                    {showOptTranslit && (
                      <div className="text-xs font-mono text-cyan-400/90 mt-1">🔤 {optTranslit}</div>
                    )}
                  </div>
                </div>
                {isAnswered && idx === currentQ.correctIndex && (
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                )}
                {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                  <XCircle size={20} className="text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-black text-emerald-400 uppercase tracking-wider block mb-0.5">
                Cultural Breakdown:
              </span>
              {currentQ.explanation}
            </div>
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'See Placement Result'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
