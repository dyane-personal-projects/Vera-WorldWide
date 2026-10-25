import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ArrowRight, Sparkles, Volume2, ShieldAlert } from 'lucide-react';
import { LessonNode, DialectTrack, UserProfile } from '../types';
import { getLessonExercises, LessonExercise } from '../data/lessonCurriculum';
import { playNativeAudio } from '../services/gemini';

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
  if (!isOpen || !lesson) return null;

  const exercises = getLessonExercises(lesson.id, dialect.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentEx: LessonExercise = exercises[currentIndex] || exercises[0];

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentEx.correctAnswer;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      const reward = lesson.type === 'boss' ? 50 : 25;
      onLessonComplete(reward, lesson.id);
    }
  };

  const handlePlayAudio = () => {
    if (currentEx?.nativePhrase) {
      playNativeAudio({ text: currentEx.nativePhrase, dialectId: dialect.id });
    }
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center">
            <Sparkles size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Lesson Conquered!</h2>
            <p className="text-sm text-slate-400">You earned <span className="text-violet-400 font-bold">+{lesson.type === 'boss' ? 50 : 25} Sparks</span> and extended your streak!</p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
          >
            Continue Learning Path ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {lesson.type === 'boss' ? <ShieldAlert className="text-rose-400" size={18} /> : <Sparkles className="text-emerald-400" size={18} />}
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{lesson.title}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-white leading-relaxed">{currentEx.prompt}</h3>
          {currentEx.nativePhrase && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
              <span className="font-serif font-bold text-emerald-400 text-lg">{currentEx.nativePhrase}</span>
              <button
                onClick={handlePlayAudio}
                className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all shrink-0"
              >
                <Volume2 size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {currentEx.options?.map((opt, idx) => {
            let btnStyle = "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200";
            if (isAnswered) {
              if (opt === currentEx.correctAnswer) {
                btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300";
              } else if (opt === selectedOption) {
                btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && opt === currentEx.correctAnswer && <CheckCircle2 size={18} className="text-emerald-400" />}
                {isAnswered && opt === selectedOption && opt !== currentEx.correctAnswer && <XCircle size={18} className="text-rose-400" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <p className="text-xs text-slate-400 max-w-sm"><strong className="text-white">Explanation:</strong> {currentEx.explanation}</p>
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0"
            >
              <span>Next</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
