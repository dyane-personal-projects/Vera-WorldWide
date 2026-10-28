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
  Award,
  Mic,
  PenTool,
  Headphones,
  Eye,
  MessageSquareCode
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

const CEFR_RANK: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5
};

export const LearningPath: React.FC<LearningPathProps> = ({
  user,
  selectedDialect,
  onStartLesson,
  onOpenStore,
  onOpenArcade,
  onOpenVocab,
  onOpenPlacement
}) => {
  const [filterSkill, setFilterSkill] = useState<'all' | 'speaking' | 'reading' | 'writing' | 'boss'>('all');

  const rawCefr = (user?.cefrLevel || 'A1').toUpperCase();
  const userCefr = rawCefr.includes('C1')
    ? 'C1'
    : rawCefr.includes('B2')
    ? 'B2'
    : rawCefr.includes('B1')
    ? 'B1'
    : rawCefr.includes('A2')
    ? 'A2'
    : 'A1';
  const userRank = CEFR_RANK[userCefr] || 1;

  const modules = [
    {
      number: 1,
      cefr: 'A1',
      title: `Unit 1 (CEFR A1): ${selectedDialect.dialect} Street Arrival & First Contact`,
      focus: 'Speak, read, and write core street greetings, polite requests, and café orders',
      lessons: [
        {
          id: 'l1',
          title: 'Lesson 1: Street Greetings & Warmth',
          focus: 'Listening + Speaking + Sentence Assembly',
          skillTag: 'speaking' as const,
          type: 'standard' as const,
          cost: 1,
          status: 'unlocked' as const
        },
        {
          id: 'l2',
          title: 'Lesson 2: Taxis, Cash & Directions',
          focus: 'Listening + Writing Dictation + Navigation',
          skillTag: 'writing' as const,
          type: 'standard' as const,
          cost: 1,
          status: 'unlocked' as const
        },
        {
          id: 'l3',
          title: 'Lesson 3: Street Food & Café Ordering',
          focus: 'Reading Native Script + Audio Ordering',
          skillTag: 'reading' as const,
          type: 'standard' as const,
          cost: 1,
          status: 'unlocked' as const,
          isReadingLesson: true
        },
        {
          id: 'b1',
          title: 'Boss Battle 1: The Transit Officer',
          focus: 'High-Stakes Live Roleplay Under Pressure',
          skillTag: 'boss' as const,
          type: 'boss' as const,
          cost: 3,
          status: 'unlocked' as const
        }
      ]
    },
    {
      number: 2,
      cefr: 'A2',
      title: `Unit 2 (CEFR A2): Markets, Bargaining & Social Life`,
      focus: 'Master souk negotiation, numbers, café table toasts, and writing real messages',
      lessons: [
        {
          id: 'l4',
          title: 'Lesson 4: Souk & Flea Market Haggling',
          focus: 'Bargaining Roleplay + Word Assembly + Writing',
          skillTag: 'speaking' as const,
          type: 'standard' as const,
          cost: 1,
          status: 'unlocked' as const
        },
        {
          id: 'l5',
          title: 'Lesson 5: Café Socializing & Table Banter',
          focus: 'Listening + Group Toasts + Writing Practice',
          skillTag: 'writing' as const,
          type: 'standard' as const,
          cost: 1,
          status: 'unlocked' as const
        },
        {
          id: 'b2',
          title: 'Boss Battle 2: The Master Merchant Duel',
          focus: 'Negotiate a Fair Cash Deal in Native Script',
          skillTag: 'boss' as const,
          type: 'boss' as const,
          cost: 3,
          status: 'unlocked' as const
        }
      ]
    },
    {
      number: 3,
      cefr: 'B1',
      title: `Unit 3 (CEFR B1–C1): Slang Secrets, Humor & Barrio Fluency`,
      focus: 'Decode fast contractions, playful sarcasm, pure native script reading, and proverbs',
      lessons: [
        {
          id: 'l6',
          title: 'Lesson 6: Evening Gatherings & Local Wit',
          focus: 'Pure Script Reading + Idioms + Speaking',
          skillTag: 'reading' as const,
          type: 'standard' as const,
          cost: 1,
          status: 'unlocked' as const,
          isReadingLesson: true
        },
        {
          id: 'l7',
          title: 'Lesson 7: Street Sarcasm & Fast Contractions',
          focus: 'Rapid Listening + Writing + Slang Mastery',
          skillTag: 'writing' as const,
          type: 'standard' as const,
          cost: 1,
          status: 'unlocked' as const
        },
        {
          id: 'b3',
          title: 'Boss Battle 3: The Neighborhood Elder',
          focus: 'Prove Your Cultural & Linguistic Mastery',
          skillTag: 'boss' as const,
          type: 'boss' as const,
          cost: 3,
          status: 'unlocked' as const
        }
      ]
    }
  ];

  const completedSet = new Set(user?.completedLessons || []);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 sticky top-0 bg-slate-950/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
              {selectedDialect.flag}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-white text-base sm:text-lg tracking-tight">
                {selectedDialect.dialect} Mastery Path
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-black text-xs">
                Placed at {userCefr}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Speak • Read • Write • Listen • {selectedDialect.region}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenPlacement}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-black transition-all cursor-pointer"
          >
            <Award size={14} /> Retake Placement Quiz
          </button>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black">
            <Flame size={15} className="fill-amber-400" /> <span>{user?.streak || 1}d</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-black">
            <Sparkles size={15} /> <span>{user?.sparks || 150}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-black">
            <Zap size={15} />
            <span>
              {user?.subscription === 'premium' || user?.subscription === 'unlimited' || user?.role === 'staff'
                ? '∞'
                : user?.energy ?? 5}
            </span>
          </div>
        </div>
      </header>

      {/* Skill Filter Bar & Ecosystem Shortcuts */}
      <div className="px-6 py-4 border-b border-slate-900 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All 4 Skills (Full Path)', icon: Sparkles },
            { id: 'speaking', label: 'Speaking & Listening', icon: Mic },
            { id: 'reading', label: 'Script & Reading', icon: Eye },
            { id: 'writing', label: 'Writing & Dictation', icon: PenTool },
            { id: 'boss', label: 'Boss Roleplays', icon: ShieldAlert }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterSkill(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterSkill === tab.id
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVocab}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen size={14} className="text-emerald-400" /> Vocab Vault
          </button>
          <button
            onClick={onOpenArcade}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Gamepad2 size={14} className="text-cyan-400" /> Arcade Arena
          </button>
          <button
            onClick={onOpenStore}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag size={14} className="text-violet-400" /> Store
          </button>
        </div>
      </div>

      {/* Placement-Connected Modules */}
      <div className="p-6 max-w-5xl mx-auto w-full space-y-8 pb-20">
        {modules.map((mod) => {
          const modRank = CEFR_RANK[mod.cefr] || 1;
          const isUnlockedByPlacement = userRank >= modRank;
          const filteredLessons = mod.lessons.filter(
            (l) => filterSkill === 'all' || l.skillTag === filterSkill
          );
          if (filteredLessons.length === 0) return null;

          return (
            <div
              key={mod.number}
              className="bg-slate-900/70 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase">
                      CEFR {mod.cefr}
                    </span>
                    {isUnlockedByPlacement && (
                      <span className="text-[11px] font-bold text-cyan-400">
                        ✓ Unlocked by your Placement Level ({userCefr})
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-white mt-1.5">{mod.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{mod.focus}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {filteredLessons.map((lesson, idx) => {
                  const isCompleted = completedSet.has(lesson.id);
                  const isBoss = lesson.type === 'boss';
                  const prevLessonId = mod.lessons[idx - 1]?.id;
                  const isUnlocked =
                    isUnlockedByPlacement ||
                    idx === 0 ||
                    isCompleted ||
                    (prevLessonId && completedSet.has(prevLessonId));

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => isUnlocked && onStartLesson(lesson)}
                      className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                        isCompleted
                          ? 'bg-emerald-950/25 border-emerald-500/40 hover:border-emerald-400 cursor-pointer'
                          : isUnlocked
                          ? isBoss
                            ? 'bg-gradient-to-br from-rose-950/40 to-slate-900 border-rose-500/40 hover:border-rose-400 cursor-pointer shadow-lg shadow-rose-950/20'
                            : 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/50 cursor-pointer'
                          : 'bg-slate-950/40 border-slate-900 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isBoss
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {isBoss ? 'Boss Roleplay' : 'Multi-Skill Lesson'}
                          </span>
                          <span className="text-[11px] font-bold text-cyan-400">⚡ {lesson.cost} Zap</span>
                        </div>
                        <h3 className="font-black text-white text-base">{lesson.title}</h3>
                        <p className="text-xs text-slate-400">{lesson.focus}</p>
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1"><Headphones size={12} className="text-emerald-400" /> Listen</span>
                          <span className="flex items-center gap-1"><Mic size={12} className="text-cyan-400" /> Speak</span>
                          <span className="flex items-center gap-1"><Eye size={12} className="text-amber-400" /> Read</span>
                          <span className="flex items-center gap-1"><PenTool size={12} className="text-violet-400" /> Write</span>
                        </div>
                      </div>

                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500 text-slate-950'
                            : isUnlocked
                            ? isBoss
                              ? 'bg-rose-500 text-white'
                              : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900 text-slate-600'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={22} />
                        ) : isUnlocked ? (
                          isBoss ? (
                            <ShieldAlert size={22} />
                          ) : (
                            <Play size={20} className="ml-0.5" />
                          )
                        ) : (
                          <Lock size={18} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
