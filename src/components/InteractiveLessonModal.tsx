import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Heart,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Flame,
  Award,
  RotateCcw,
  Zap,
  Mic,
  MicOff,
  Swords,
  Shield,
  HelpCircle,
  Crown
} from 'lucide-react';
import { DialectTrack, LessonNode, UserProfile } from '../types';
import { getLessonExercises, LessonExercise } from '../data/lessonCurriculum';
import { soundFX } from '../utils/soundEffects';

interface InteractiveLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LessonNode | null;
  dialect: DialectTrack;
  user: UserProfile | null;
  onLessonComplete: (rewardSparks: number, lessonId?: string) => void;
  onOpenStore?: () => void;
}

export const InteractiveLessonModal: React.FC<InteractiveLessonModalProps> = ({
  isOpen,
  onClose,
  lesson,
  dialect,
  user,
  onLessonComplete,
  onOpenStore
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [bossHp, setBossHp] = useState(100);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [constructedWords, setConstructedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isOutOfHearts, setIsOutOfHearts] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [activeGlossaryWord, setActiveGlossaryWord] = useState<{ word: string; translation: string } | null>(null);

  const isBoss = lesson?.type === 'boss';
  const isInfiniteEnergy = user?.subscription === 'premium' || user?.role === 'staff';

  // Load distinct tailored exercises for this specific lesson and dialect
  const exercises = lesson ? getLessonExercises(lesson.id, dialect.id) : [];
  const currentExercise: LessonExercise = exercises[currentStep] || exercises[0];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setHearts(5);
      setBossHp(100);
      setIsFinished(false);
      setIsOutOfHearts(false);
      setIsChecked(false);
      setSelectedOption(null);
      setConstructedWords([]);
      setAvailableWords([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentExercise && currentExercise.type === 'word_order') {
      const words = Array.isArray(currentExercise.correctAnswer)
        ? [...currentExercise.correctAnswer]
        : (currentExercise.correctAnswer as string).split(' ');
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      setConstructedWords([]);
    } else {
      setSelectedOption(null);
    }
    setIsChecked(false);
    setIsCorrect(false);
    setSpokenTranscript('');
    setActiveGlossaryWord(null);
  }, [currentStep, lesson]);

  if (!isOpen || !lesson || !currentExercise) return null;

  const playAudio = (text: string, lang = 'es-MX') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (dialect.id.startsWith('es')) utterance.lang = 'es-MX';
      else if (dialect.id.startsWith('fr')) utterance.lang = 'fr-FR';
      else if (dialect.id.startsWith('ja')) utterance.lang = 'ja-JP';
      else if (dialect.id.startsWith('it')) utterance.lang = 'it-IT';
      else if (dialect.id.startsWith('pt')) utterance.lang = 'pt-BR';
      else if (dialect.id.startsWith('de')) utterance.lang = 'de-DE';
      else if (dialect.id.startsWith('ar')) utterance.lang = 'ar-SA';
      else utterance.lang = lang;

      utterance.rate = 0.92;
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleWordTap = (word: string, index: number, isFromAvailable: boolean) => {
    if (isChecked) return;
    soundFX.playTap();

    if (isFromAvailable) {
      setConstructedWords((prev) => [...prev, word]);
      setAvailableWords((prev) => prev.filter((_, i) => i !== index));
    } else {
      setAvailableWords((prev) => [...prev, word]);
      setConstructedWords((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Web Speech API Pronunciation challenge
  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback: auto-pass
      setSpokenTranscript(currentExercise.nativePhrase || '¡Todo al cien!');
      setSelectedOption(currentExercise.correctAnswer as string);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      if (dialect.id.startsWith('fr')) recognition.lang = 'fr-FR';
      else if (dialect.id.startsWith('ja')) recognition.lang = 'ja-JP';
      else if (dialect.id.startsWith('it')) recognition.lang = 'it-IT';
      else if (dialect.id.startsWith('pt')) recognition.lang = 'pt-BR';
      else if (dialect.id.startsWith('de')) recognition.lang = 'de-DE';
      else recognition.lang = 'es-MX';

      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListeningMic(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpokenTranscript(transcript);
        setSelectedOption(currentExercise.correctAnswer as string);
        setIsListeningMic(false);
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
        setSelectedOption(currentExercise.correctAnswer as string);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognition.start();
    } catch {
      setIsListeningMic(false);
      setSelectedOption(currentExercise.correctAnswer as string);
    }
  };

  const handleCheckAnswer = () => {
    let passed = false;

    if (currentExercise.type === 'word_order') {
      const correctArr = Array.isArray(currentExercise.correctAnswer)
        ? currentExercise.correctAnswer
        : (currentExercise.correctAnswer as string).split(' ');
      passed = constructedWords.join(' ').trim() === correctArr.join(' ').trim();
    } else {
      const expected = typeof currentExercise.correctAnswer === 'string'
        ? currentExercise.correctAnswer.trim()
        : String(currentExercise.correctAnswer);
      passed = (selectedOption || '').trim() === expected;
    }

    setIsCorrect(passed);
    setIsChecked(true);

    if (passed) {
      soundFX.playCorrect();
      if (isBoss) {
        const damage = currentExercise.bossHpDamage || 35;
        setBossHp((prev) => Math.max(0, prev - damage));
      }
    } else {
      soundFX.playIncorrect();
      if (!isInfiniteEnergy) {
        setHearts((prev) => {
          const next = Math.max(0, prev - 1);
          if (next === 0) {
            setIsOutOfHearts(true);
          }
          return next;
        });
      }
    }
  };

  const handleNextStep = () => {
    if (currentStep + 1 < exercises.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsFinished(true);
      soundFX.playVictory();
      onLessonComplete(lesson.rewardSparks || 50, lesson.id);
    }
  };

  const handleRefillHeartsFree = () => {
    setHearts(3);
    setIsOutOfHearts(false);
  };

  const handleRefillHeartsSparks = () => {
    setHearts(5);
    setIsOutOfHearts(false);
  };

  const progressPercent = Math.round(((currentStep + (isChecked ? 1 : 0)) / exercises.length) * 100);

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
      <div className={`w-full max-w-xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[96vh] text-slate-100 relative border ${
        isBoss
          ? 'bg-gradient-to-b from-slate-900 via-rose-950/20 to-slate-950 border-rose-500/50 shadow-rose-500/20'
          : 'bg-slate-900 border-slate-700/80 shadow-slate-950/80'
      }`}>
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-950/70">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Exit Lesson"
          >
            <X size={18} />
          </button>

          {/* Progress / Boss Bar */}
          {isBoss ? (
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                <span className="flex items-center gap-1"><Swords size={12} /> BOSS HEALTH</span>
                <span>{bossHp}% HP</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-rose-900/60">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${bossHp}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Hearts / Lives indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/40 border border-rose-900/60 rounded-xl text-xs font-mono text-rose-300 font-bold shrink-0">
            <Heart size={14} className="fill-rose-500 text-rose-500 animate-pulse" />
            <span>{isInfiniteEnergy ? '∞' : hearts}</span>
          </div>
        </div>

        {/* OUT OF HEARTS RECHARGE SCREEN */}
        {isOutOfHearts ? (
          <div className="p-8 text-center space-y-6 flex-1 flex flex-col justify-center items-center">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center mx-auto text-rose-400 shadow-xl shadow-rose-500/10">
              <Heart size={40} className="fill-rose-500/40" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold block mb-1">
                ENERGY DEPLETED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Ran Out of Hearts!
              </h2>
              <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto">
                Don't lose your learning streak! Refill your hearts to continue mastering {dialect.dialect}.
              </p>
            </div>

            <div className="space-y-3 w-full max-w-xs">
              <button
                onClick={handleRefillHeartsFree}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <RotateCcw size={14} className="text-emerald-400" />
                <span>Practice & Refill (+3 Hearts Free)</span>
              </button>

              <button
                onClick={handleRefillHeartsSparks}
                className="w-full py-3 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Recharge Full Hearts (50 Sparks)</span>
              </button>

              {onOpenStore && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenStore();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase font-mono tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Crown size={15} />
                  <span>Get Infinite Energy (Vera Premium)</span>
                </button>
              )}
            </div>
          </div>
        ) : isFinished ? (
          /* Finished / Victory Celebration Screen */
          <div className="p-8 text-center space-y-6 flex-1 flex flex-col justify-center items-center">
            <div className={`w-20 h-20 rounded-3xl p-1 shadow-2xl animate-bounce flex items-center justify-center ${
              isBoss
                ? 'bg-gradient-to-tr from-amber-400 to-rose-500 shadow-rose-500/30'
                : 'bg-gradient-to-tr from-amber-400 to-emerald-400 shadow-emerald-500/20'
            }`}>
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                {isBoss ? <Swords size={38} className="text-amber-400" /> : <Award size={38} className="text-amber-400" />}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                {isBoss ? 'BOSS DEFEATED • STREET RESPECT SECURED' : 'LESSON COMPLETED!'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {isBoss ? 'Masterful Cultural Command' : 'Native Instincts Sharpened'}
              </h2>
              <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto">
                {isBoss
                  ? `You handled high-pressure conversational conflict with native ease in ${dialect.dialect}.`
                  : `You've mastered this practical street scenario in ${dialect.dialect}.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-xl font-black text-emerald-400">+{lesson.rewardSparks || 50}</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Sparks Earned</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
                  <Flame size={18} className="fill-amber-400" />
                  <span>+1 Day</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Flame Streak</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full max-w-xs py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase font-mono tracking-wider shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Continue Learning Path
            </button>
          </div>
        ) : (
          /* Exercise Body */
          <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              {/* Question Header */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest mb-1">
                  <span className={isBoss ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {isBoss ? '⚡ High-Pressure Encounter' : `Step ${currentStep + 1} of ${exercises.length}`}
                  </span>
                  <span className="text-slate-400">{lesson.title}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                  {currentExercise.prompt}
                </h3>
              </div>

              {/* Native Audio Phonics Card */}
              {currentExercise.nativePhrase && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => playAudio(currentExercise.nativePhrase!, currentExercise.audioLang || 'es-MX')}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${
                        isPlayingAudio
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-105'
                          : 'bg-slate-900 text-emerald-400 border-slate-700 hover:bg-slate-800'
                      }`}
                      title="Play native speech"
                    >
                      <Volume2 size={20} className={isPlayingAudio ? 'animate-pulse' : ''} />
                    </button>
                    <div>
                      <p className="text-sm font-bold text-white italic">
                        "{currentExercise.nativePhrase}"
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dialect.persona} • Native Accent
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tap-to-Translate Glossary (if present) */}
              {currentExercise.wordGlossary && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-1">
                  <span className="text-slate-500 font-mono uppercase text-[9px]">Tap to translate:</span>
                  {Object.entries(currentExercise.wordGlossary).map(([word, translation]) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => setActiveGlossaryWord({ word, translation })}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 transition-colors"
                    >
                      {word}
                    </button>
                  ))}
                  {activeGlossaryWord && (
                    <span className="text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/30 animate-in fade-in">
                      "{activeGlossaryWord.word}" = {activeGlossaryWord.translation}
                    </span>
                  )}
                </div>
              )}

              {/* SPEAKING DRILL */}
              {currentExercise.type === 'speaking' && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <div className="text-xs text-slate-400">
                    Tap the microphone and pronounce the phrase out loud:
                  </div>

                  <button
                    type="button"
                    onClick={handleStartListening}
                    disabled={isListeningMic || isChecked}
                    className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all ${
                      isListeningMic
                        ? 'bg-rose-500 text-white animate-ping scale-110'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30'
                    }`}
                  >
                    <Mic size={26} />
                  </button>

                  <div className="text-[11px] font-mono text-slate-400">
                    {isListeningMic
                      ? 'Listening to your voice...'
                      : spokenTranscript
                      ? `Heard: "${spokenTranscript}"`
                      : 'Tap mic to test pronunciation'}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOption(currentExercise.correctAnswer as string)}
                    className="text-[10px] text-slate-500 hover:text-slate-400 underline font-mono"
                  >
                    Can't speak right now? Skip voice test
                  </button>
                </div>
              )}

              {/* MULTIPLE CHOICE / ROLEPLAY OPTIONS */}
              {currentExercise.options && (
                <div className="space-y-2.5">
                  {currentExercise.options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    let style = 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200';

                    if (isSelected && !isChecked) {
                      style = isBoss
                        ? 'bg-rose-950/40 border-rose-500 text-white font-bold shadow-md'
                        : 'bg-emerald-500/15 border-emerald-500 text-white font-bold shadow-md';
                    } else if (isChecked) {
                      if (option === currentExercise.correctAnswer) {
                        style = 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold';
                      } else if (isSelected && !isCorrect) {
                        style = 'bg-rose-950/40 border-rose-600 text-rose-300 font-bold';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isChecked}
                        onClick={() => setSelectedOption(option)}
                        className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${style}`}
                      >
                        <span>{option}</span>
                        {isChecked && option === currentExercise.correctAnswer && (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        )}
                        {isChecked && isSelected && !isCorrect && (
                          <AlertCircle size={16} className="text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* WORD BANK BUILDER (Duolingo Style) */}
              {currentExercise.type === 'word_order' && (
                <div className="space-y-4">
                  {/* Construction Slot */}
                  <div className="min-h-[70px] p-3 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 flex flex-wrap items-center gap-2">
                    {constructedWords.length === 0 ? (
                      <span className="text-xs text-slate-500 font-mono italic">
                        Tap words below in order to assemble the natural phrase...
                      </span>
                    ) : (
                      constructedWords.map((word, i) => (
                        <button
                          key={i}
                          disabled={isChecked}
                          onClick={() => handleWordTap(word, i, false)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-all"
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Scrambled Word Chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {availableWords.map((word, i) => (
                      <button
                        key={i}
                        disabled={isChecked}
                        onClick={() => handleWordTap(word, i, true)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs active:scale-95 transition-all shadow-sm"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Feedback Drawer & Action Button */}
            <div className="pt-6 border-t border-slate-800/80 mt-6">
              {isChecked && (
                <div
                  className={`p-4 rounded-2xl mb-4 border ${
                    isCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm mb-1">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span>{isBoss ? '💥 Critical Strike on Boss!' : '¡Exacto! Native Cadence Confirmed.'}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-rose-400" />
                        <span>{isBoss ? 'Shield Hit! Cultural Nuance:' : 'Almost! Local Nuance Tip:'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentExercise.explanation}
                  </p>
                  <div className="text-[11px] font-mono text-emerald-400 mt-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    💡 Cultural Tip: {currentExercise.culturalTip}
                  </div>
                </div>
              )}

              {!isChecked ? (
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  disabled={
                    currentExercise.type === 'word_order'
                      ? constructedWords.length === 0
                      : !selectedOption
                  }
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase font-mono tracking-wider shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  {isBoss ? 'Strike Boss with Comeback' : 'Check Answer'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase font-mono tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>{currentStep + 1 < exercises.length ? 'Next Question' : 'Complete Lesson'}</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
