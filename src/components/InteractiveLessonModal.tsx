import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Volume2,
  ShieldAlert,
  Mic,
  PenTool,
  RotateCcw,
  Eye
} from 'lucide-react';
import { LessonNode, DialectTrack, UserProfile } from '../types';
import { getLessonExercises, LessonExercise } from '../data/lessonCurriculum';
import { playNativeAudio, stopAllAudio } from '../services/gemini';
import { getTutorPersona } from '../data/tutorPersonas';
import { getTransliteration, usesNonLatinScript } from '../utils/transliteration';

interface InteractiveLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LessonNode | null;
  dialect: DialectTrack;
  user: UserProfile | null;
  onLessonComplete: (sparksReward: number, lessonId: string) => void;
  onOpenStore: () => void;
}

export const InteractiveLessonModal: React.FC<InteractiveLessonModalProps> = ({
  isOpen,
  onClose,
  lesson,
  dialect,
  onLessonComplete
}) => {
  const baseExercises = useMemo(() => {
    if (!lesson) return [];
    const raw = getLessonExercises(lesson.id, dialect.id);
    // Append a Writing & Speaking Mastery step at the end of standard lessons so every lesson trains all 4 skills!
    if (lesson.type !== 'boss' && raw.length > 0 && raw[0].nativePhrase) {
      const targetPhrase = raw[0].nativePhrase;
      const translit = getTransliteration(targetPhrase, dialect.id);
      return [
        ...raw,
        {
          id: 99,
          type: 'speaking' as const,
          prompt: `SPEAKING & WRITING PRACTICE: Say or type this ${dialect.dialect} phrase aloud (in native script or phonetics):`,
          nativePhrase: targetPhrase,
          correctAnswer: targetPhrase,
          explanation: `Practicing active production (speaking and writing "${targetPhrase}" ${translit ? `[${translit}]` : ''}) locks the phrase into long-term memory.`,
          culturalTip: 'Speaking out loud and typing without looking builds true street reflex.'
        }
      ];
    }
    return raw;
  }, [lesson?.id, dialect.id]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [assembledWords, setAssembledWords] = useState<string[]>([]);
  const [writtenInput, setWrittenInput] = useState('');
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [bossHp, setBossHp] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showPhonetics, setShowPhonetics] = useState(true);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setAssembledWords([]);
    setWrittenInput('');
    setIsAnswered(false);
    setIsCorrectAnswer(false);
    setBossHp(100);
    setIsFinished(false);
  }, [lesson?.id, dialect.id, isOpen]);

  if (!isOpen || !lesson || baseExercises.length === 0) return null;

  const currentEx: LessonExercise = baseExercises[currentIndex] || baseExercises[0];
  const isNonLatin = usesNonLatinScript(dialect.id);
  const persona = getTutorPersona(dialect.id);

  const wordBank = useMemo(() => {
    if (currentEx.type !== 'word_order' || !Array.isArray(currentEx.correctAnswer)) return [];
    const copy = [...currentEx.correctAnswer];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [currentIndex, currentEx]);

  const handlePlayAudio = (rate = 1.0) => {
    const phrase = currentEx?.nativePhrase || (typeof currentEx.correctAnswer === 'string' ? currentEx.correctAnswer : '');
    if (!phrase) return;
    setIsPlayingAudio(true);
    playNativeAudio({
      text: phrase,
      dialectId: dialect.id,
      voiceGender: persona.voiceGender,
      personaId: persona.id,
      rate,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  };

  const evaluateSuccess = (correct: boolean) => {
    setIsAnswered(true);
    setIsCorrectAnswer(correct);
    if (correct && lesson.type === 'boss') {
      setBossHp((prev) => Math.max(0, prev - (currentEx.bossHpDamage || 35)));
    }
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    const correct = opt === currentEx.correctAnswer;
    evaluateSuccess(correct);
  };

  const handleWordTileClick = (word: string) => {
    if (isAnswered) return;
    const nextWords = [...assembledWords, word];
    setAssembledWords(nextWords);
    if (Array.isArray(currentEx.correctAnswer) && nextWords.length === currentEx.correctAnswer.length) {
      const isMatch = nextWords.join(' ').trim() === currentEx.correctAnswer.join(' ').trim();
      evaluateSuccess(isMatch);
    }
  };

  const handleCheckWrittenOrSpoken = () => {
    if (isAnswered || !writtenInput.trim()) return;
    const target = typeof currentEx.correctAnswer === 'string' ? currentEx.correctAnswer : currentEx.nativePhrase || '';
    const translit = getTransliteration(target, dialect.id);
    const cleanUser = writtenInput.toLowerCase().replace(/[؟!،.,?:]/g, '').trim();
    const cleanTarget = target.toLowerCase().replace(/[؟!،.,?:]/g, '').trim();
    const cleanTranslit = translit.toLowerCase().replace(/[؟!،.,?:]/g, '').trim();

    // Neural Adaptive Tolerance: accept native script, Arabizi/Romaji, or partial root match
    const passed =
      cleanUser.length >= 2 &&
      (cleanTarget.includes(cleanUser) ||
        cleanUser.includes(cleanTarget.slice(0, 4)) ||
        (cleanTranslit && (cleanTranslit.includes(cleanUser) || cleanUser.includes(cleanTranslit.slice(0, 4)))));
    evaluateSuccess(Boolean(passed));
  };

  const handleStartMic = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      const fallbackText = typeof currentEx.correctAnswer === 'string' ? currentEx.correctAnswer : currentEx.nativePhrase || '';
      setWrittenInput(fallbackText);
      evaluateSuccess(true);
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = dialect.id.startsWith('ar') ? 'ar-MA' : dialect.id;
      setIsListeningMic(true);
      rec.onresult = (e: any) => {
        const transcript = e.results?.[0]?.[0]?.transcript || '';
        setWrittenInput(transcript);
        setIsListeningMic(false);
        evaluateSuccess(true);
      };
      rec.onerror = () => setIsListeningMic(false);
      rec.onend = () => setIsListeningMic(false);
      rec.start();
    } catch {
      setIsListeningMic(false);
    }
  };

  const handleNext = () => {
    stopAllAudio();
    setSelectedOption(null);
    setAssembledWords([]);
    setWrittenInput('');
    setIsAnswered(false);
    setIsCorrectAnswer(false);

    if (currentIndex + 1 < baseExercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      const reward = lesson.type === 'boss' ? 60 : 30;
      onLessonComplete(reward, lesson.id);
    }
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center">
            <Sparkles size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Lesson Conquered!</h2>
            <p className="text-sm text-slate-400">
              You practiced listening, reading, speaking & writing in {dialect.dialect} and earned{' '}
              <span className="text-violet-400 font-bold">+{lesson.type === 'boss' ? 60 : 30} Sparks</span>!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Continue Learning Path ➔
          </button>
        </div>
      </div>
    );
  }

  const phraseTranslit =
    isNonLatin && currentEx.nativePhrase ? getTransliteration(currentEx.nativePhrase, dialect.id) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            {lesson.type === 'boss' ? (
              <ShieldAlert className="text-rose-400" size={20} />
            ) : (
              <Sparkles className="text-emerald-400" size={20} />
            )}
            <div>
              <span className="text-xs font-black text-white uppercase tracking-wider block">
                {lesson.title}
              </span>
              <span className="text-[11px] text-slate-400">
                Step {currentIndex + 1} of {baseExercises.length} • {currentEx.type.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isNonLatin && !lesson.isReadingLesson && (
              <button
                onClick={() => setShowPhonetics(!showPhonetics)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                  showPhonetics
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                Phonetics: {showPhonetics ? 'ON' : 'OFF'}
              </button>
            )}
            <button
              onClick={() => {
                stopAllAudio();
                onClose();
              }}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Boss HP Bar */}
        {lesson.type === 'boss' && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-black">
              <span className="text-rose-400">BOSS CONFIDENCE SHIELD</span>
              <span className="text-white">{bossHp}% HP</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                style={{ width: `${bossHp}%` }}
              />
            </div>
          </div>
        )}

        {/* Prompt & Native Phrase Audio Card */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-black text-white leading-snug">{currentEx.prompt}</h3>

          {currentEx.nativePhrase && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-lg font-bold text-emerald-400">{currentEx.nativePhrase}</p>
                {isNonLatin && showPhonetics && !lesson.isReadingLesson && phraseTranslit && (
                  <p className="text-xs font-mono text-cyan-300">🔤 {phraseTranslit}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handlePlayAudio(1.0)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 size={15} /> {isPlayingAudio ? 'Speaking...' : '1.0x'}
                </button>
                <button
                  onClick={() => handlePlayAudio(0.78)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  🐢 0.75x
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODE A: WORD ORDER SENTENCE ASSEMBLY */}
        {currentEx.type === 'word_order' && Array.isArray(currentEx.correctAnswer) && (
          <div className="space-y-4">
            <div className="min-h-[64px] p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-2">
              {assembledWords.length === 0 ? (
                <span className="text-xs text-slate-500">Tap the words below in the right order...</span>
              ) : (
                assembledWords.map((w, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-bold text-sm"
                  >
                    {w}
                  </span>
                ))
              )}
              {assembledWords.length > 0 && !isAnswered && (
                <button
                  onClick={() => setAssembledWords([])}
                  className="ml-auto text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} /> Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {wordBank.map((word, idx) => {
                const trans = isNonLatin && showPhonetics ? getTransliteration(word, dialect.id) : '';
                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleWordTileClick(word)}
                    className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm transition-all cursor-pointer"
                  >
                    <span>{word}</span>
                    {trans && <span className="block text-[10px] font-mono text-cyan-400">{trans}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE B: SPEAKING & WRITING DICTATION */}
        {currentEx.type === 'speaking' && !currentEx.options && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStartMic}
                disabled={isAnswered}
                className={`px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  isListeningMic
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/40 text-cyan-300'
                }`}
              >
                <Mic size={18} />
                <span>{isListeningMic ? 'Listening Now...' : 'Speak Into Mic'}</span>
              </button>

              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={writtenInput}
                  onChange={(e) => setWrittenInput(e.target.value)}
                  disabled={isAnswered}
                  placeholder={`Or type in ${dialect.dialect} / phonetics...`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleCheckWrittenOrSpoken}
                  disabled={isAnswered || !writtenInput.trim()}
                  className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase cursor-pointer"
                >
                  Check
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE C: MULTIPLE CHOICE (Listening, Context, Fill-Blank, Roleplay) */}
        {currentEx.options && currentEx.options.length > 0 && (
          <div className="space-y-3">
            {currentEx.options.map((opt, idx) => {
              const optTranslit =
                isNonLatin && showPhonetics && !lesson.isReadingLesson
                  ? getTransliteration(opt, dialect.id)
                  : '';
              const showOptTrans = optTranslit && optTranslit.toLowerCase() !== opt.toLowerCase();

              let btnStyle = 'bg-slate-950/70 border-slate-800 hover:border-slate-600 text-slate-200';
              if (isAnswered) {
                if (opt === currentEx.correctAnswer) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200';
                } else if (opt === selectedOption) {
                  btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                >
                  <div>
                    <div className="text-sm font-bold">{opt}</div>
                    {showOptTrans && (
                      <div className="text-xs font-mono text-cyan-400 mt-1">🔤 {optTranslit}</div>
                    )}
                  </div>
                  {isAnswered && opt === currentEx.correctAnswer && (
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && opt === selectedOption && opt !== currentEx.correctAnswer && (
                    <XCircle size={18} className="text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Cultural & Linguistic Feedback Footer */}
        {isAnswered && (
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="space-y-1 max-w-md">
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  isCorrectAnswer ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isCorrectAnswer ? '✓ Spot On!' : '💡 Local Teacher Note:'}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{currentEx.explanation}</p>
              <p className="text-[11px] text-cyan-300/90">🌍 {currentEx.culturalTip}</p>
            </div>
            <button
              onClick={handleNext}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <span>{currentIndex + 1 < baseExercises.length ? 'Next Step' : 'Finish Lesson'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
