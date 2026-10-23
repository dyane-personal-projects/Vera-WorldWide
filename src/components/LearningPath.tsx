import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Zap, 
  Lock, 
  CheckCircle2, 
  Play, 
  ShieldAlert, 
  ShoppingBag, 
  Gamepad2, 
  BookOpen,
  Award
} from 'lucide-react';
import { UserProfile, DialectTrack, LessonNode } from '../types';

interface LearningPathProps {
  user: UserProfile | null;
  selectedDialect: DialectTrack;
  onStartLesson: (lesson: LessonNode) => void;
  onOpenStore: () => void;
  onOpenArcade: () => void;
  onOpenVocab: () => void;
  onOpenPlacement: () => void;
  onRewardClaimed: (updated: UserProfile) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  user,
  selectedDialect,
  onStartLesson,
  onOpenStore,
  onOpenArcade,
  onOpenVocab,
  onOpenPlacement
}) => {
  const [activeTab, setActiveTab] = useState<'path' | 'scenarios'>('path');

  // Standard modules and lessons for the active track
  const modules = [
    {
      number: 1,
      title: 'Module 1: Street Greetings & First Contact',
      focus: 'Master casual introductions and local slang',
      lessons: [
        { id: 'l1', title: 'Lesson 1: Casual Meetups', focus: 'Greetings', type: 'standard' as const, cost: 1, status: 'unlocked' as const },
        { id: 'l2', title: 'Lesson 2: Hailing Transport', focus: 'Transit', type: 'standard' as const, cost: 1, status: 'locked' as const },
        { id: 'l3', title: 'Lesson 3: Food & Café Banter', focus: 'Dining', type: 'standard' as const, cost: 1, status: 'locked' as const },
        { id: 'b1', title: 'Boss Battle: The Transit Inspector', focus: 'High-Stakes Roleplay', type: 'boss' as const, cost: 3, status: 'locked' as const }
      ]
    },
    {
      number: 2,
      title: 'Module 2: Markets & Social Navigation',
      focus: 'Bargaining, directions, and local culture',
      lessons: [
        { id: 'l4', title: 'Lesson 4: Artisan Market Haggling', focus: 'Bargaining', type: 'standard' as const, cost: 1, status: 'locked' as const },
        { id: 'l5', title: 'Lesson 5: Café Socializing & Toasts', focus: 'Nightlife', type: 'standard' as const, cost: 1, status: 'locked' as const },
        { id: 'l6', title: 'Lesson 6: Slang Secrets & Sarcasm', focus: 'Humor', type: 'standard' as const, cost: 2, status: 'locked' as const },
        { id: 'b2', title: 'Boss Battle: The Master Merchant Duel', focus: 'Intense Souk Debate', type: 'boss' as const, cost: 3, status: 'locked' as const }
      ]
    }
  ];

  const completedSet = new Set(user?.completedLessons || []);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Header Bar */}
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
              {selectedDialect.flag}
            </div>
          </div>
          <div>
            <h1 className="font-black text-white text-base tracking-tight">{selectedDialect.dialect} Immersion</h1>
            <p className="text-[11px] text-slate-400">Level: <span className="text-emerald-400 font-bold">{user?.cefrLevel || 'A1'}</span></p>
          </div>
        </div>

        {/* Gamification Stats Pill */}
        <div className="flex items-center gap-4">
          <button onClick={onOpenPlacement} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-cyan-400 text-xs font-bold hover:bg-cyan-900/40 transition-all">
            <Award size={14} /> Level Quiz
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Flame size={15} className="fill-amber-400" /> <span>{user?.streak || 1}d</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold">
            <Sparkles size={15} className="fill-violet-400" /> <span>{user?.sparks || 150}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
            <Zap size={15} className="fill-cyan-400" /> <span>{user?.subscription === 'premium' ? '∞' : (user?.energy ?? 5)}</span>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="px-6 mt-6 flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('path')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'path'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Learning Path
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'scenarios'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Boss Scenarios
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onOpenVocab} className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <BookOpen size={14} className="text-emerald-400" /> Vocab Vault
          </button>
          <button onClick={onOpenArcade} className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Gamepad2 size={14} className="text-cyan-400" /> Arcade Arena
          </button>
          <button onClick={onOpenStore} className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <ShoppingBag size={14} className="text-violet-400" /> Vera Store
          </button>
        </div>
      </div>

      {/* Path Content */}
      <div className="p-6 max-w-4xl mx-auto w-full space-y-12">
        {modules.map((mod) => (
          <div key={mod.number} className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-8">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Module {mod.number}</span>
              <h3 className="text-xl font-black text-white mt-1">{mod.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{mod.focus}</p>
            </div>

            {/* Serpentine Node Map */}
            <div className="flex flex-col items-center gap-6 relative">
              {mod.lessons.map((lesson, idx) => {
                const isCompleted = completedSet.has(lesson.id);
                const isBoss = lesson.type === 'boss';
                const isUnlocked = idx === 0 || isCompleted || completedSet.has(mod.lessons[idx - 1]?.id);

                return (
                  <div key={lesson.id} className={`flex items-center gap-4 ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                    <button
                      onClick={() => isUnlocked && onStartLesson(lesson)}
                      disabled={!isUnlocked}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl relative group ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 scale-105'
                          : isUnlocked
                          ? isBoss
                            ? 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-rose-500/30 animate-pulse'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-110'
                          : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={28} className="stroke-[3]" />
                      ) : isUnlocked ? (
                        isBoss ? <ShieldAlert size={26} /> : <Play size={24} className="ml-0.5" />
                      ) : (
                        <Lock size={20} />
                      )}
                    </button>

                    <div className={`max-w-xs ${idx % 2 === 1 ? 'text-right' : 'text-left'}`}>
                      <h4 className="font-black text-white text-sm">{lesson.title}</h4>
                      <p className="text-[11px] text-slate-400">{lesson.focus} • <span className="text-cyan-400 font-bold">{lesson.cost} Zap</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
