import React, { useState, useEffect } from 'react';
import {
  Map,
  Play,
  Lock,
  Zap,
  Flame,
  Crown,
  ShieldAlert,
  Sparkles,
  Award,
  ArrowRight,
  Hexagon,
  Gamepad2,
  BookOpen,
  Check,
  Star,
  Swords,
  RotateCcw
} from 'lucide-react';
import { DialectTrack, LearningModule, LessonNode, UserProfile } from '../types';

interface LearningPathProps {
  user: UserProfile | null;
  selectedDialect: DialectTrack;
  onStartLesson: (lesson: LessonNode) => void;
  onOpenStore: () => void;
  onOpenArcade: () => void;
  onOpenVocab: () => void;
  onOpenPlacement: () => void;
  onRewardClaimed?: (updatedUser: UserProfile) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  user,
  selectedDialect,
  onStartLesson,
  onOpenStore,
  onOpenArcade,
  onOpenVocab,
  onOpenPlacement,
  onRewardClaimed
}) => {
  const [lockedNotice, setLockedNotice] = useState<{ title: string; lesson: LessonNode } | null>(null);
  const [showEnergyNotice, setShowEnergyNotice] = useState(false);

  const storageKey = `vera_completed_${user?.uid || 'guest'}_${selectedDialect.id}`;

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    return user?.completedLessons || [];
  });

  // Re-sync progress whenever selected dialect, user, or completedLessons changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setCompletedLessonIds(JSON.parse(raw));
        return;
      }
    } catch {}
    if (user?.completedLessons) {
      setCompletedLessonIds(user.completedLessons);
    } else {
      setCompletedLessonIds([]);
    }
  }, [selectedDialect.id, user?.uid, user?.completedLessons]);

  const sparks = user?.sparks || 250;
  const energy = user?.energy ?? (user?.subscription === 'premium' ? 999 : 5);
  const streak = user?.streak || 1;
  const level = user?.cefrLevel || 'A2';
  const isPremium = user?.subscription === 'premium';
  const isStaff = user?.role === 'staff';

  const isFr = selectedDialect.id.startsWith('fr');
  const isJa = selectedDialect.id.startsWith('ja');
  const isPt = selectedDialect.id.startsWith('pt');

  const isL1Done = completedLessonIds.includes('l1');
  const isL2Done = completedLessonIds.includes('l2');
  const isL3Done = completedLessonIds.includes('l3');
  const isB1Done = completedLessonIds.includes('b1');
  const isL4Done = completedLessonIds.includes('l4');
  const isL5Done = completedLessonIds.includes('l5');
  const isB2Done = completedLessonIds.includes('b2');
  const isL6Done = completedLessonIds.includes('l6');
  const isL7Done = completedLessonIds.includes('l7');
  const isB3Done = completedLessonIds.includes('b3');

  const hasBLevel = level.includes('B') || level.includes('C') || level.includes('MASTER') || isStaff;
  const hasCLevel = level.includes('C') || level.includes('MASTER') || isStaff;

  const units: LearningModule[] = [
    {
      number: 1,
      title: isFr
        ? 'Arrival & Métro in Paris & Île-de-France'
        : isJa
        ? 'Arrival & Subway Transit in Tokyo'
        : isPt
        ? 'Arrival & Beach Transit in Rio de Janeiro'
        : `Arrival & Transit in ${selectedDialect.region.split('&')[0].trim()}`,
      focus: isFr
        ? 'Parisian greetings, dropped negatives, Navigo passes, and café counter ordering.'
        : isJa
        ? 'Casual greetings, Suica cards, Yamanote line navigation, and ramen counters.'
        : isPt
        ? 'Carioca beach greetings, flat cab rates to Copacabana, and feira pastéis.'
        : 'First-contact greetings, airport logistics, taxis, and street food etiquette.',
      lessons: [
        {
          id: 'l1',
          title: isFr ? 'Parisian Greetings & Verlan' : isJa ? 'Tokyo Street Greetings' : isPt ? 'Carioca Beach Greetings' : 'Street Greetings & Handshakes',
          focus: isFr ? 'Master wesh, ça fait un bail, ça roule, and dropped negative cadence.' : isJa ? 'Master Yo! Hisashiburi, aikawarazu, and natural particles.' : isPt ? 'Master fala parceiro, tranquilidade, suave, and beach greetings.' : 'Master informal hellos, regional slang particles, and tone.',
          type: 'standard',
          cost: 1,
          rewardSparks: 50,
          status: isL1Done ? 'completed' : 'unlocked'
        },
        {
          id: 'l2',
          title: isFr ? 'Taking the Métro & Châtelet Hub' : isJa ? 'Yamanote Line & Cab Navigation' : isPt ? 'Hailing Cabs to Copacabana' : 'Hailing Cabs & Asking Fares',
          focus: isFr ? 'Navigo passes, transfers at Châtelet, and street landmark directions.' : isJa ? 'Suica top-ups, Shinjuku station exits, and cab instructions.' : isPt ? 'Confirm flat rates, direct drivers, and avoid tourist surcharges.' : 'Confirm flat rates, avoid tourist rates, and direct drivers.',
          type: 'standard',
          cost: 1,
          rewardSparks: 60,
          status: isL2Done ? 'completed' : isL1Done || hasBLevel ? 'unlocked' : 'locked'
        },
        {
          id: 'l3',
          title: isFr ? 'Boulangeries & Bistro Counters' : isJa ? 'Ramen Counters & Izakaya Orders' : isPt ? 'Ordering Açaí & Feira Pastéis' : 'Ordering Local Street Food',
          focus: isFr ? 'Order une tradition, croissants, and café serré without tourist hesitation.' : isJa ? 'Order tonkotsu ramen with firm noodles, and draft beer to start.' : isPt ? 'Order crispy pastéis with caldo de cana, and fresh açaí bowls.' : 'Pronounce ingredients, salsa levels, and local diminutives.',
          type: 'standard',
          cost: 1,
          rewardSparks: 70,
          status: isL3Done ? 'completed' : isL2Done || hasBLevel ? 'unlocked' : 'locked'
        }
      ],
      boss: {
        id: 'b1',
        title: isFr ? 'The Métro RATP Controller' : isJa ? 'The JR Station Attendant' : isPt ? 'The Terminal Bus Inspector' : 'The Hardline Transit Inspector',
        persona: isFr ? 'Contrôleur en Chef (Châtelet)' : isJa ? 'Senior Station Officer (Shinjuku Gate)' : isPt ? 'Fiscal de Linha (Central)' : 'Senior Station Officer',
        focus: 'Explain a missing transfer pass and negotiate a stamp under pressure.',
        type: 'boss',
        cost: 2,
        rewardSparks: 250,
        status: isB1Done ? 'completed' : isL3Done || hasBLevel ? 'unlocked' : 'locked'
      }
    },
    {
      number: 2,
      title: isFr
        ? 'Marchés & Flea Market Bargaining'
        : isJa
        ? 'Akihabara & Traditional Alleys'
        : isPt
        ? 'Feira de São Cristóvão & Street Markets'
        : 'The Neighborhood Night Market',
      focus: 'Bargaining with artisan merchants, table banter, and buying rounds.',
      lessons: [
        {
          id: 'l4',
          title: isFr ? 'Les Puces Antique Bargaining' : isJa ? 'Akihabara & Craft Haggling' : isPt ? 'Street Feira Haggling' : 'Artisan Market Haggling',
          focus: 'Tactful counter-offers, feigning hesitation, and closing deals.',
          type: 'standard',
          cost: 1,
          rewardSparks: 75,
          status: isL4Done ? 'completed' : isB1Done || hasBLevel ? 'unlocked' : 'locked'
        },
        {
          id: 'l5',
          title: isFr ? 'Café Terrace Socializing' : isJa ? 'Izakaya Table Banter' : isPt ? 'Boteco & Roda de Samba Banter' : 'Cafe Socializing & Slang',
          focus: 'Joining a lively table, local jokes, and conversational timing.',
          type: 'standard',
          cost: 1,
          rewardSparks: 80,
          status: isL5Done ? 'completed' : isL4Done || hasBLevel ? 'unlocked' : 'locked'
        }
      ],
      boss: {
        id: 'b2',
        title: isFr ? 'The Master Antiquaire Duel' : isJa ? 'The Master Craftsman Duel' : isPt ? 'The Master Artisan Duel' : 'The Master Merchant Duel',
        persona: isFr ? 'Marchand des Puces Propriétaire' : isJa ? 'Old Town Master Craftsman' : isPt ? 'Mestre da Feira de Artesanato' : 'Grand Bazaar Proprietor',
        focus: 'Secure an heirloom discount without insulting the artisan’s craft.',
        type: 'boss',
        cost: 3,
        rewardSparks: 300,
        status: isB2Done ? 'completed' : isL5Done || hasBLevel ? 'unlocked' : 'locked'
      }
    },
    {
      number: 3,
      title: isFr
        ? 'Parisian Nightlife & Belleville Banter'
        : isJa
        ? 'Tokyo Nightlife & Alley Culture'
        : isPt
        ? 'Lapa Nightlife & Bohemia Rhythms'
        : 'Nightlife, Banter & Urban Culture',
      focus: 'Bars, signature drinks, toasts, double entendres, and street sarcasm.',
      lessons: [
        {
          id: 'l6',
          title: isFr ? 'Nightlife & Apéro Toasts' : isJa ? 'Golden Gai & Kanpai Toasts' : isPt ? 'Lapa Toasts & Ice-Cold Caipirinhas' : 'Nightlife & Signature Toasts',
          focus: 'Ordering signature cocktails, toasts, buying rounds, and bar banter.',
          type: 'standard',
          cost: 1,
          rewardSparks: 90,
          status: isL6Done ? 'completed' : isB2Done || hasCLevel ? 'unlocked' : 'locked'
        },
        {
          id: 'l7',
          title: isFr ? 'Verlan Secrets & Sarcasm' : isJa ? 'Slang Secrets & Irony' : isPt ? 'Gírias & Carioca Banter' : 'Slang Secrets & Sarcasm',
          focus: 'Hyper-local idioms, banter, verlan, and identifying sarcasm.',
          type: 'standard',
          cost: 1,
          rewardSparks: 95,
          status: isL7Done ? 'completed' : isL6Done || hasCLevel ? 'unlocked' : 'locked'
        }
      ],
      boss: {
        id: 'b3',
        title: isFr ? 'The Belleville Legend Duel' : isJa ? 'The Shinjuku Master Duel' : isPt ? 'The Lapa Malandro Legend Duel' : 'The Barrio Legend Duel',
        persona: isFr ? 'Belleville Regular Elder' : isJa ? 'Shinjuku Street Elder' : isPt ? 'Velho Malandro da Lapa' : 'Street Legend Elder',
        focus: 'Fast-tempo street debate and cultural humor with neighborhood elders.',
        type: 'boss',
        cost: 3,
        rewardSparks: 400,
        status: isB3Done ? 'completed' : isL7Done || hasCLevel ? 'unlocked' : 'locked'
      }
    }
  ];

  const handleNodeClick = (lesson: LessonNode) => {
    const isLocked = lesson.status === 'locked' && !isStaff && !completedLessonIds.includes(lesson.id);
    if (isLocked) {
      setLockedNotice({ title: lesson.title, lesson });
      return;
    }
    if (!isPremium && !isStaff && energy <= 0) {
      setShowEnergyNotice(true);
      return;
    }
    onStartLesson(lesson);
  };

  const handleUnlockWithSparks = (lesson: LessonNode) => {
    const updated = Array.from(new Set([...completedLessonIds, lesson.id]));
    setCompletedLessonIds(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
    if (user && onRewardClaimed) {
      onRewardClaimed({
        ...user,
        completedLessons: updated
      });
    }
    setLockedNotice(null);
    onStartLesson(lesson);
  };

  const handleRefillEnergy = () => {
    if (!user) return;
    if ((user.sparks || 0) < 50) {
      setShowEnergyNotice(false);
      onOpenStore();
      return;
    }
    const updated = {
      ...user,
      sparks: Math.max(0, (user.sparks || 0) - 50),
      energy: 5
    };
    if (onRewardClaimed) {
      onRewardClaimed(updated);
    }
    setShowEnergyNotice(false);
  };

  const handleResetProgress = () => {
    setCompletedLessonIds([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    if (user && onRewardClaimed) {
      onRewardClaimed({
        ...user,
        completedLessons: []
      });
    }
  };

  // Serpentine offset positions (Duolingo style)
  const getOffsetClass = (index: number) => {
    const pattern = ['justify-center', 'justify-end pr-16', 'justify-center', 'justify-start pl-16'];
    return pattern[index % pattern.length];
  };

  const totalMilestones = 10;
  const totalCompleted = completedLessonIds.length;
  const progressPercent = Math.min(100, Math.round((totalCompleted / totalMilestones) * 100));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-sans p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Top Status & Resource Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-xl text-emerald-400">
              {level}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedDialect.flag}</span>
              <h2 className="text-xl font-black text-white">{selectedDialect.dialect}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Fluency Path • <span className="text-emerald-400 font-bold font-mono">CEFR {level}</span> • {selectedDialect.region}
            </p>
          </div>
        </div>

        {/* Energy & Streak Counters */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 border-r border-slate-800 text-rose-400 font-bold">
            <Flame size={16} className="fill-rose-500" />
            <span>{streak}d Streak</span>
          </div>
          <div
            onClick={onOpenStore}
            className="flex items-center gap-1.5 px-3 py-1 border-r border-slate-800 text-emerald-400 font-bold cursor-pointer hover:bg-slate-900 rounded-lg transition-colors"
            title="Click to recharge energy"
          >
            <Zap size={16} className="fill-emerald-400" />
            <span>{isPremium ? 'INFINITE' : `${energy} Zaps`}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 text-amber-400 font-bold">
            <Hexagon size={16} className="fill-amber-400" />
            <span>{sparks} Sparks</span>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenArcade}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 text-left transition-all group shadow-md"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white group-hover:text-rose-400">Vera Arcade</span>
            <Gamepad2 size={16} className="text-rose-400" />
          </div>
          <p className="text-[10px] text-slate-400">Rapid fire reflexes</p>
        </button>

        <button
          onClick={onOpenVocab}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group shadow-md"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white group-hover:text-cyan-400">Vocab Vault</span>
            <BookOpen size={16} className="text-cyan-400" />
          </div>
          <p className="text-[10px] text-slate-400">Saved native slang</p>
        </button>

        <button
          onClick={onOpenPlacement}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group shadow-md"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white group-hover:text-emerald-400">Calibration</span>
            <Award size={16} className="text-emerald-400" />
          </div>
          <p className="text-[10px] text-slate-400">CEFR level placement</p>
        </button>

        <button
          onClick={onOpenStore}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 text-left transition-all group shadow-md"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white group-hover:text-amber-400">Marketplace</span>
            <Crown size={16} className="text-amber-400" />
          </div>
          <p className="text-[10px] text-slate-400">Plans & Unlimited Energy</p>
        </button>
      </div>

      {/* Track Mastery Progress Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="w-full sm:w-auto flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-400" />
              <span>{selectedDialect.dialect} Mastery Progress</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {totalCompleted} of {totalMilestones} Completed ({progressPercent}%)
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenPlacement}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors flex items-center gap-1.5"
            title="Calibrate your CEFR level"
          >
            <Award size={13} className="text-emerald-400" />
            <span>Calibrate Level</span>
          </button>
          {totalCompleted > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Do you want to reset your lesson progress for this dialect?")) {
                  handleResetProgress();
                }
              }}
              className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
              title="Reset path progress"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Duolingo Serpentine Learning Path */}
      <div className="space-y-12 py-4">
        {units.map((unit) => {
          const unitAllNodes = [...unit.lessons, ...(unit.boss ? [unit.boss] : [])];
          const unitCompletedCount = unitAllNodes.filter(n => completedLessonIds.includes(n.id)).length;
          const isUnitFullyMastered = unitCompletedCount === unitAllNodes.length;

          return (
            <div key={unit.number} className="space-y-6">
              {/* Unit Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-500/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-slate-950/30 px-2.5 py-0.5 rounded-full inline-block">
                      UNIT {unit.number}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-200">
                      {unitCompletedCount}/{unitAllNodes.length} Done
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black">{unit.title}</h3>
                  <p className="text-xs text-emerald-100/90 mt-0.5">{unit.focus}</p>
                </div>
                <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl ${
                  isUnitFullyMastered ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30' : 'bg-slate-950/20 text-slate-100'
                }`}>
                  <Crown size={18} className={isUnitFullyMastered ? 'text-amber-300 fill-amber-300' : 'text-amber-300'} />
                  <span className="font-bold text-xs">{isUnitFullyMastered ? 'Unit Mastered!' : 'Unit Trophy'}</span>
                </div>
              </div>

              {/* Serpentine Node Column */}
              <div className="py-6 flex flex-col items-center space-y-6 relative">
                {unit.lessons.map((lesson, idx) => {
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const isUnlocked = isCompleted || lesson.status === 'unlocked' || (unit.number === 1 && idx === 0) || isStaff;
                  const offsetClass = getOffsetClass(idx);

                  return (
                    <div key={lesson.id} className={`w-full flex ${offsetClass} relative`}>
                      {/* Vertical connector line to next node */}
                      {idx < unit.lessons.length - 1 && (
                        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-0.5 h-8 border-l-2 border-dashed border-slate-800 -z-0" />
                      )}

                      <div className="relative flex flex-col items-center group z-10">
                        {/* Active lesson tooltip / start bubble */}
                        {isUnlocked && !isCompleted && (
                          <div className="absolute -top-10 bg-emerald-500 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/30 animate-bounce pointer-events-none">
                            START • +{lesson.rewardSparks}
                          </div>
                        )}

                        {/* 3D Round Node Button (Duolingo style) */}
                        <button
                          onClick={() => handleNodeClick(lesson)}
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-2xl relative ${
                            isCompleted
                              ? 'bg-gradient-to-b from-amber-400 to-amber-500 border-4 border-amber-300 text-slate-950 shadow-amber-500/30'
                              : isUnlocked
                              ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-4 border-emerald-300 text-slate-950 shadow-emerald-500/40 hover:scale-105'
                              : 'bg-slate-800 border-4 border-slate-700 text-slate-500 cursor-not-allowed opacity-80'
                          }`}
                          title={lesson.title}
                        >
                          {isCompleted ? (
                            <Crown size={28} className="text-slate-950" />
                          ) : isUnlocked ? (
                            <Star size={28} className="fill-slate-950 text-slate-950" />
                          ) : (
                            <Lock size={22} className="text-slate-500" />
                          )}

                          {/* Completed Check Badge */}
                          {isCompleted && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 font-black">
                              <Check size={14} />
                            </div>
                          )}
                        </button>

                        {/* Lesson title label */}
                        <span className="text-xs font-bold text-slate-300 mt-2 text-center max-w-[140px] truncate group-hover:text-white">
                          {lesson.title}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Boss Fight Node */}
                {unit.boss && (() => {
                  const isBossCompleted = completedLessonIds.includes(unit.boss.id);
                  const isBossUnlocked = isBossCompleted || unit.boss.status === 'unlocked' || isStaff;

                  return (
                    <div className="w-full flex justify-center pt-4 relative">
                      <div className="flex flex-col items-center group relative z-10">
                        {isBossUnlocked && !isBossCompleted && (
                          <div className="absolute -top-10 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-rose-500/30 animate-bounce pointer-events-none flex items-center gap-1">
                            <Flame size={12} />
                            <span>BOSS DUEL • +{unit.boss.rewardSparks}</span>
                          </div>
                        )}

                        <button
                          onClick={() => handleNodeClick(unit.boss!)}
                          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center transition-transform active:scale-95 shadow-2xl relative ${
                            isBossCompleted
                              ? 'bg-gradient-to-b from-amber-500 to-orange-600 border-4 border-amber-300 text-slate-950 shadow-amber-500/30'
                              : isBossUnlocked
                              ? 'bg-gradient-to-b from-rose-500 to-red-700 border-4 border-rose-400 text-white shadow-rose-500/30 hover:scale-105'
                              : 'bg-slate-800/80 border-4 border-slate-700/80 text-slate-500 cursor-not-allowed opacity-80'
                          }`}
                          title={unit.boss.title}
                        >
                          {isBossCompleted ? (
                            <Crown size={36} className="text-slate-950" />
                          ) : isBossUnlocked ? (
                            <Swords size={34} />
                          ) : (
                            <Lock size={26} className="text-slate-500" />
                          )}

                          {isBossCompleted && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 font-black">
                              <Check size={14} />
                            </div>
                          )}
                        </button>
                        <span className={`text-xs font-black mt-2 flex items-center gap-1 uppercase tracking-wider font-mono ${
                          isBossUnlocked ? 'text-rose-400' : 'text-slate-500'
                        }`}>
                          <Flame size={14} /> BOSS ENCOUNTER
                        </span>
                        <span className="text-xs font-bold text-white max-w-[160px] text-center truncate">
                          {unit.boss.title}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Locked Lesson Notice Modal */}
      {lockedNotice && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Lock size={26} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
                LOCKED MILESTONE
              </span>
              <h3 className="text-lg font-black text-white">{lockedNotice.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Complete previous lessons in this unit to unlock this milestone naturally, or unlock it immediately!
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleUnlockWithSparks(lockedNotice.lesson)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase font-mono tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                <span>Instant Unlock (Free VIP Access)</span>
              </button>

              <button
                onClick={() => setLockedNotice(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Back to Path
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Out of Energy / Daily Limit Dialog */}
      {showEnergyNotice && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Zap size={32} className="fill-emerald-400 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                ENERGY DEPLETED (0/5 ZAPS)
              </span>
              <h3 className="text-xl font-black text-white">Daily Energy Limit Reached</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Free tier accounts receive 5 conversational zaps per day. Refill instantly with your Sparks or upgrade to Vera Premium for Infinite Energy!
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowEnergyNotice(false);
                  onOpenStore();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase font-mono tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Crown size={15} />
                <span>Get Infinite Energy (Vera Pro / Premium)</span>
              </button>

              <button
                onClick={handleRefillEnergy}
                className="w-full py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Refill 5 Zaps (50 Sparks) • Balance: {sparks}</span>
              </button>

              <button
                onClick={() => setShowEnergyNotice(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
