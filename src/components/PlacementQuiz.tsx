import React, { useState } from 'react';
import {
  Target,
  Play,
  HelpCircle,
  BrainCircuit,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Zap,
  Flame,
  ShieldCheck,
  Check
} from 'lucide-react';
import { DialectTrack, UserProfile } from '../types';
import { updateUserCefrLevel } from '../firebase';
import { getDialectPlacementQuestions, QuizQuestion, FluencyLevelKey } from '../data/placementCurriculum';
import { isNonLatinScript, shouldShowTransliteration, getTransliteration } from '../utils/transliteration';

interface PlacementQuizProps {
  user: UserProfile | null;
  selectedDialect: DialectTrack;
  onUpdateUserLevel: (level: string) => void;
  onComplete: () => void;
}

export type { FluencyLevelKey };

interface LevelDefinition {
  key: FluencyLevelKey;
  cefrCode: string;
  name: string;
  tagline: string;
  color: string;
  borderColor: string;
  bgLight: string;
  description: string;
  nextTier?: FluencyLevelKey;
  prevTier?: FluencyLevelKey;
}

const FLUENCY_LEVELS: LevelDefinition[] = [
  {
    key: 'beginner',
    cefrCode: 'A1/A2',
    name: 'Beginner',
    tagline: 'Foundations & Travel Basics',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500',
    bgLight: 'bg-emerald-500/10',
    description: 'You understand basic greetings, simple numbers, asking directions, and polite ordering.',
    nextTier: 'intermediate'
  },
  {
    key: 'intermediate',
    cefrCode: 'B1/B2',
    name: 'Intermediate',
    tagline: 'Conversational Street Explorer',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500',
    bgLight: 'bg-cyan-500/10',
    description: 'You can hold daily conversations, hail cabs, haggle at markets, and describe past events.',
    nextTier: 'advanced',
    prevTier: 'beginner'
  },
  {
    key: 'advanced',
    cefrCode: 'C1',
    name: 'Advanced',
    tagline: 'Confident & Nuanced Speaker',
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500',
    bgLight: 'bg-indigo-500/10',
    description: 'You speak with rapid flow, understand everyday street slang, humor, and debate topics naturally.',
    nextTier: 'fluent',
    prevTier: 'intermediate'
  },
  {
    key: 'fluent',
    cefrCode: 'C2',
    name: 'Fluent',
    tagline: 'Effortless Conversational Command',
    color: 'text-amber-400',
    borderColor: 'border-amber-500',
    bgLight: 'bg-amber-500/10',
    description: 'Near-native speed. You catch fast sarcasm, double meanings, idioms, and speak without pauses.',
    nextTier: 'native',
    prevTier: 'advanced'
  },
  {
    key: 'native',
    cefrCode: 'MASTER',
    name: 'Native (Street Master)',
    tagline: 'Deep Regional Vernacular',
    color: 'text-rose-400',
    borderColor: 'border-rose-500',
    bgLight: 'bg-rose-500/10',
    description: 'You master hyper-local street slang, regional cadences, verlan, and neighborhood cultural banter.',
    prevTier: 'fluent'
  }
];

export const PlacementQuiz: React.FC<PlacementQuizProps> = ({
  user,
  selectedDialect,
  onUpdateUserLevel,
  onComplete
}) => {
  const [selectedLevelKey, setSelectedLevelKey] = useState<FluencyLevelKey>('intermediate');
  const [hasStartedQuiz, setHasStartedQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const isArabic = selectedDialect.id.startsWith('ar');
  const isNonLatin = isNonLatinScript(selectedDialect.id);
  const [showTransliteration, setShowTransliteration] = useState(() =>
    shouldShowTransliteration(selectedDialect.id, selectedLevelKey)
  );

  const activeLevelDef = FLUENCY_LEVELS.find((l) => l.key === selectedLevelKey) || FLUENCY_LEVELS[1];
  const activeQuestions = getDialectPlacementQuestions(selectedLevelKey, selectedDialect.id);
  const currentQ = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  // Reset question state and update transliteration default when dialect or level changes
  React.useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsChecked(false);
    setShowTransliteration(shouldShowTransliteration(selectedDialect.id, selectedLevelKey));
  }, [selectedDialect.id, selectedLevelKey]);

  const playSpokenAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedDialect.id.startsWith('es')) utterance.lang = 'es-MX';
      else if (selectedDialect.id.startsWith('fr')) utterance.lang = 'fr-FR';
      else if (selectedDialect.id.startsWith('ja')) utterance.lang = 'ja-JP';
      else if (selectedDialect.id.startsWith('ar')) utterance.lang = 'ar-EG';
      else if (selectedDialect.id.startsWith('pt')) utterance.lang = 'pt-BR';
      else if (selectedDialect.id.startsWith('it')) utterance.lang = 'it-IT';
      else if (selectedDialect.id.startsWith('de')) utterance.lang = 'de-DE';
      else utterance.lang = 'en-US';

      utterance.rate = 0.95;
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isChecked) return;
    setSelectedOptionIndex(idx);
    setIsChecked(true);

    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < activeQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsChecked(false);
    } else {
      setQuizFinished(true);
    }
  };

  // Determine diagnostic placement (Above, At, or Below)
  const getPlacementResult = () => {
    const total = activeQuestions.length;
    const percentage = (score / total) * 100;

    if (score === total) {
      // 100% -> Above level
      const recommendedTierKey = activeLevelDef.nextTier || activeLevelDef.key;
      const recommendedDef = FLUENCY_LEVELS.find((l) => l.key === recommendedTierKey) || activeLevelDef;

      return {
        status: 'above' as const,
        badgeText: 'ABOVE THIS LEVEL! 🚀',
        badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        headline: `Mastered ${activeLevelDef.name} with Flying Colors!`,
        summary: `You scored a perfect ${score}/${total} (100%). You have fully mastered ${activeLevelDef.name} proficiencies in ${selectedDialect.dialect}.`,
        recommendedLevel: recommendedDef.cefrCode,
        recommendedName: recommendedDef.name,
        recommendationMsg: activeLevelDef.nextTier
          ? `We strongly recommend advancing you to ${recommendedDef.name} (${recommendedDef.cefrCode}) to accelerate your learning!`
          : `You have reached peak Native Master street fluency!`
      };
    } else if (score >= 3) {
      // 75% -> At level
      return {
        status: 'at' as const,
        badgeText: 'PERFECTLY MATCHED (AT THIS LEVEL)! 🎯',
        badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        headline: `Verified at ${activeLevelDef.name} Level!`,
        summary: `You scored ${score}/${total} (75%). Your conversational instincts are firmly rooted in this tier.`,
        recommendedLevel: activeLevelDef.cefrCode,
        recommendedName: activeLevelDef.name,
        recommendationMsg: `Your lessons will be calibrated precisely to ${activeLevelDef.name} (${activeLevelDef.cefrCode})—the ideal sweet spot for rapid street fluency.`
      };
    } else {
      // < 75% -> Below level
      const recommendedTierKey = activeLevelDef.prevTier || activeLevelDef.key;
      const recommendedDef = FLUENCY_LEVELS.find((l) => l.key === recommendedTierKey) || activeLevelDef;

      return {
        status: 'below' as const,
        badgeText: 'BELOW THIS LEVEL (GROWTH ZONE) 💡',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        headline: `Found Your Growth Zone in ${selectedDialect.dialect}`,
        summary: `You scored ${score}/${total} on the ${activeLevelDef.name} assessment. A few fast street idioms caught you off guard.`,
        recommendedLevel: recommendedDef.cefrCode,
        recommendedName: recommendedDef.name,
        recommendationMsg: activeLevelDef.prevTier
          ? `We recommend calibrating your path at ${recommendedDef.name} (${recommendedDef.cefrCode}) so you build strong, instinctive reflexes without getting frustrated.`
          : `We recommend starting with foundational street survival lessons to build initial confidence.`
      };
    }
  };

  const handleApplyPlacement = async (levelToApply: string) => {
    if (user?.uid) {
      await updateUserCefrLevel(user.uid, levelToApply);
    }
    onUpdateUserLevel(levelToApply);
    onComplete();
  };

  // STEP 1: Level Picker Screen
  if (!hasStartedQuiz) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-950 text-slate-100 font-sans overflow-y-auto">
        <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold">
              <BrainCircuit size={14} className="text-cyan-400" />
              <span>DIAGNOSTIC LEVEL CALIBRATION • {selectedDialect.flag} {selectedDialect.dialect}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              What level do you feel you are at?
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Select your self-assessed level. We will launch a tailored 4-question quiz for that tier to determine if your lessons should be <span className="text-white font-bold">at, above, or below</span> that level.
            </p>
          </div>

          {/* 5 Fluency Level Cards */}
          <div className="space-y-3">
            {FLUENCY_LEVELS.map((level) => {
              const isSelected = selectedLevelKey === level.key;

              return (
                <div
                  key={level.key}
                  onClick={() => setSelectedLevelKey(level.key)}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? `bg-slate-950 ${level.borderColor} shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50`
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl ${level.bgLight} border ${level.borderColor}/40 flex items-center justify-center shrink-0`}>
                      <span className={`text-xs font-black font-mono ${level.color}`}>{level.cefrCode}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{level.name}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">({level.tagline})</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {level.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-700'}`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={onComplete}
              className="w-full sm:w-auto text-xs text-slate-400 hover:text-white transition-colors"
            >
              Skip & Keep Current Level ({user?.cefrLevel || 'A2'})
            </button>

            <button
              onClick={() => {
                setHasStartedQuiz(true);
                setCurrentQuestionIndex(0);
                setScore(0);
                setSelectedOptionIndex(null);
                setIsChecked(false);
                setQuizFinished(false);
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase font-mono tracking-wider shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play size={15} fill="currentColor" />
              <span>Start {activeLevelDef.name} Quiz</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: Quiz Finished & Diagnostic Outcome Screen
  if (quizFinished) {
    const result = getPlacementResult();

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-950 text-slate-100 font-sans">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-xl shadow-cyan-500/20">
            <Award size={36} />
          </div>

          <div className="space-y-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${result.badgeColor}`}>
              <TrendingUp size={14} />
              <span>{result.badgeText}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {result.headline}
            </h2>
            <p className="text-xs text-slate-400">
              Assessed Tier: <span className="font-bold text-white">{activeLevelDef.name}</span> • Score: <span className="font-bold text-cyan-400">{score}/{activeQuestions.length}</span>
            </p>
          </div>

          {/* Diagnostic Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              {result.summary}
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <Zap size={15} className="text-cyan-400 shrink-0" />
              <span>{result.recommendationMsg}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <button
              onClick={() => handleApplyPlacement(result.recommendedLevel)}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase font-mono tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Apply {result.recommendedName} ({result.recommendedLevel}) & Adapt Lessons</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => {
                setHasStartedQuiz(false);
                setQuizFinished(false);
              }}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} />
              <span>Choose Another Level Quiz</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Interactive Question Screen
  const progressPercent = Math.round(((currentQuestionIndex + (isChecked ? 1 : 0)) / activeQuestions.length) * 100);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between text-xs font-mono pb-4 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-lg ${activeLevelDef.bgLight} ${activeLevelDef.color} font-bold text-[10px]`}>
              {activeLevelDef.name} ({activeLevelDef.cefrCode})
            </span>
            <span className="text-slate-400">
              Q{currentQuestionIndex + 1} of {activeQuestions.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isNonLatin && (
              <button
                type="button"
                onClick={() => setShowTransliteration(!showTransliteration)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all border flex items-center gap-1.5 ${
                  showTransliteration
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Toggle Franco-Arab / Romaji transliterations"
              >
                <span>Aa Translit:</span>
                <span className={showTransliteration ? 'text-cyan-400' : 'text-slate-500'}>
                  {showTransliteration ? 'ON' : 'OFF'}
                </span>
              </button>
            )}
            <span className="text-slate-400">{selectedDialect.flag} {selectedDialect.dialect}</span>
            <span className="text-cyan-400 font-bold">{score} pts</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Title & Scenario */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
            Scenario: {currentQ.context}
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
            {currentQ.prompt}
          </h2>
        </div>

        {/* Spoken Audio Demonstration Button */}
        {currentQ.spokenAudio && (
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => playSpokenAudio(currentQ.spokenAudio!)}
                className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                  isPlayingAudio
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 scale-105'
                    : 'bg-slate-900 text-cyan-400 border-slate-800 hover:bg-slate-800'
                }`}
                title="Listen to native pronunciation"
              >
                <Volume2 size={16} className={isPlayingAudio ? 'animate-pulse' : ''} />
              </button>
              <div className="min-w-0">
                <p dir={isArabic ? 'rtl' : 'ltr'} className={`text-xs font-bold text-white italic ${isArabic ? 'text-right' : ''}`}>
                  "{currentQ.spokenAudio}"
                </p>
                {isNonLatin && showTransliteration && (
                  <p className={`text-[11px] font-mono text-cyan-300 font-medium tracking-wide mt-0.5 ${isArabic ? 'text-right' : ''}`}>
                    Phonetic: {getTransliteration(currentQ.spokenAudio, selectedDialect.id)}
                  </p>
                )}
                <span className="text-[10px] text-slate-500 font-mono">Native Pronunciation</span>
              </div>
            </div>
          </div>
        )}

        {/* Multiple Choice Options */}
        <div className="grid grid-cols-1 gap-2.5">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOptionIndex === i;
            const isCorrect = i === currentQ.correctIndex;
            const optTranslit = isNonLatin ? getTransliteration(opt, selectedDialect.id) : '';
            const hasDistinctTranslit = optTranslit && optTranslit !== opt;

            let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700';
            if (isChecked) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold';
              } else if (isSelected) {
                btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-300 font-bold';
              }
            }

            return (
              <button
                key={i}
                disabled={isChecked}
                onClick={() => handleSelectOption(i)}
                className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 ${btnStyle}`}
              >
                <div className="flex-1 min-w-0">
                  <div dir={isArabic ? 'rtl' : 'ltr'} className={isArabic ? 'text-right' : ''}>
                    {opt}
                  </div>
                  {isNonLatin && showTransliteration && hasDistinctTranslit && (
                    <div className={`text-[11px] font-mono text-cyan-300/90 font-medium mt-1 ${isArabic ? 'text-right' : ''}`}>
                      {optTranslit}
                    </div>
                  )}
                </div>
                {isChecked && isCorrect && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                {isChecked && isSelected && !isCorrect && <AlertCircle size={16} className="text-rose-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Immediate Explanation Drawer */}
        {isChecked && (
          <div className={`p-4 rounded-2xl border text-xs animate-in fade-in ${
            selectedOptionIndex === currentQ.correctIndex
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
          }`}>
            <span className="font-bold block mb-1">
              {selectedOptionIndex === currentQ.correctIndex ? '✓ Correct!' : '💡 Cultural Explanation:'}
            </span>
            <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Next Question / Skip */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={() => {
              setHasStartedQuiz(false);
            }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Change Level
          </button>

          {isChecked ? (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase font-mono tracking-wider shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>{currentQuestionIndex + 1 < activeQuestions.length ? 'Next Question' : 'View Placement Results'}</span>
              <ArrowRight size={15} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
