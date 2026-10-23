import React, { useState } from 'react';
import { Volume2, CheckCircle2, XCircle, ArrowRight, Award, RotateCcw } from 'lucide-react';
import { UserProfile, DialectTrack } from '../types';
import { getDialectPlacementQuestions, FluencyLevelKey, QuizQuestion } from '../data/placementCurriculum';
import { playNativeAudio } from '../services/gemini';

interface PlacementQuizProps {
  user: UserProfile | null;
  selectedDialect: DialectTrack;
  onUpdateUserLevel: (level: string) => void;
  onComplete: () => void;
}

export const PlacementQuiz: React.FC<PlacementQuizProps> = ({
  selectedDialect,
  onUpdateUserLevel,
  onComplete
}) => {
  const [currentLevelKey, setCurrentLevelKey] = useState<FluencyLevelKey>('beginner');
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    return getDialectPlacementQuestions('beginner', selectedDialect.id);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [assessedTier, setAssessedTier] = useState('Beginner (A1)');

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Evaluate Level
      const finalScore = score + (selectedOption === currentQ.correctIndex ? 1 : 0);
      if (finalScore >= 3) {
        if (currentLevelKey === 'beginner') {
          setCurrentLevelKey('intermediate');
          setQuestions(getDialectPlacementQuestions('intermediate', selectedDialect.id));
          setCurrentIndex(0);
          setScore(0);
          setAssessedTier('Intermediate (B1)');
          return;
        } else if (currentLevelKey === 'intermediate') {
          setCurrentLevelKey('advanced');
          setQuestions(getDialectPlacementQuestions('advanced', selectedDialect.id));
          setCurrentIndex(0);
          setScore(0);
          setAssessedTier('Advanced (C1)');
          return;
        }
      }
      setQuizFinished(true);
      onUpdateUserLevel(assessedTier);
    }
  };

  const handlePlayAudio = () => {
    if (currentQ?.spokenAudio) {
      playNativeAudio({ text: currentQ.spokenAudio, dialectId: selectedDialect.id });
    }
  };

  if (quizFinished) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center">
            <Award size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Placement Assessment Complete!</h2>
            <p className="text-sm text-slate-400">Assessed Level: <span className="text-emerald-400 font-bold">{assessedTier}</span> in {selectedDialect.dialect}</p>
          </div>
          <button
            onClick={onComplete}
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
          >
            Enter Learning Path ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 overflow-y-auto">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{selectedDialect.dialect} • Level Assessment</span>
          <span className="text-xs text-slate-400 font-semibold">Question {currentIndex + 1} of {questions.length}</span>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white leading-relaxed">{currentQ.prompt}</h3>
          {currentQ.spokenAudio && (
            <button
              onClick={handlePlayAudio}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 transition-all"
            >
              <Volume2 size={15} />
              <span>Listen to Native Audio</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            let btnStyle = "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200";
            if (isAnswered) {
              if (idx === currentQ.correctIndex) {
                btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300";
              } else if (idx === selectedOption) {
                btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && idx === currentQ.correctIndex && <CheckCircle2 size={18} className="text-emerald-400" />}
                {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && <XCircle size={18} className="text-rose-400" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <p className="text-xs text-slate-400 max-w-sm"><strong className="text-white">Explanation:</strong> {currentQ.explanation}</p>
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
