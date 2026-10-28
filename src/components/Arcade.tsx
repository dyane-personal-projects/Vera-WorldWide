import React from 'react';
import { Gamepad2, Zap, Trophy, Crosshair, Users, Sparkles, Flame, ShieldAlert } from 'lucide-react';
import { UserProfile, DialectTrack, LessonNode } from '../types';

interface ArcadeProps {
  user: UserProfile | null;
  selectedDialect: DialectTrack;
  onStartMatch: (lesson: LessonNode) => void;
  onOpenStore: () => void;
}

export const Arcade: React.FC<ArcadeProps> = ({
  user,
  selectedDialect,
  onStartMatch,
  onOpenStore
}) => {
  const isUnlimited =
    user?.subscription === 'premium' ||
    user?.subscription === 'unlimited' ||
    user?.role === 'staff';

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <Gamepad2 className="text-cyan-400" />
              <span>{selectedDialect.flag} {selectedDialect.dialect} Arcade Arena</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              High-speed street reflex drills, 1v1 neighborhood debates, and Boss challenges.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenStore}
              className="px-4 py-2 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 font-black text-xs flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={15} /> {user?.sparks || 150} Sparks
            </button>
            <div className="px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-black text-xs flex items-center gap-2">
              <Zap size={15} /> {isUnlimited ? '∞ Zaps' : `${user?.energy ?? 5} Zaps`}
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Mode 1: Rapid Fire Survival */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-cyan-500/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Crosshair size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                Reflex & Listening Speed
              </span>
              <h2 className="text-xl font-black text-white mt-1 mb-2">Rapid Fire Survival</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Decode real {selectedDialect.dialect} street phrases, audio clips, and word scrambles under pressure.
              </p>
            </div>
            <button
              onClick={() =>
                onStartMatch({
                  id: 'arcade_rapid_fire',
                  title: `${selectedDialect.dialect} Rapid Fire Drill`,
                  focus: 'High-Speed Street Reflexes',
                  type: 'rapid_fire',
                  cost: 2,
                  status: 'unlocked'
                })
              }
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Zap size={15} /> Launch Rapid Fire (2 Zaps)
            </button>
          </div>

          {/* Mode 2: 1v1 Street Debate */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-rose-500/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                1v1 Cultural Duel
              </span>
              <h2 className="text-xl font-black text-white mt-1 mb-2">Vocab Clash Debate</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Go head-to-head in a lively {selectedDialect.dialect} street food & culture debate. Win +60 Sparks!
              </p>
            </div>
            <button
              onClick={() =>
                onStartMatch({
                  id: 'arcade_debate',
                  title: `${selectedDialect.dialect} 1v1 Street Debate`,
                  focus: 'Cultural Wit & Persuasion',
                  type: 'boss',
                  cost: 3,
                  status: 'unlocked'
                })
              }
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/20"
            >
              <Trophy size={15} /> Enter 1v1 Arena (3 Zaps)
            </button>
          </div>

          {/* Mode 3: Boss Rematch Gauntlet */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-amber-500/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <ShieldAlert size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                High-Stakes Negotiation
              </span>
              <h2 className="text-xl font-black text-white mt-1 mb-2">Souk & Transit Gauntlet</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Test your composure against the Transit Inspector and Master Artisan in pure {selectedDialect.dialect}.
              </p>
            </div>
            <button
              onClick={() =>
                onStartMatch({
                  id: 'b1',
                  title: `${selectedDialect.dialect} Inspector Boss Rematch`,
                  focus: 'High-Stakes Roleplay',
                  type: 'boss',
                  cost: 3,
                  status: 'unlocked'
                })
              }
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Flame size={15} /> Fight Boss Gauntlet (3 Zaps)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
