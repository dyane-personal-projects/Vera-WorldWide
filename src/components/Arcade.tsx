import React from 'react';
import { Gamepad2, Zap, Trophy, Crosshair, Users, Sparkles } from 'lucide-react';
import { UserProfile, DialectTrack, LessonNode } from '../types';

interface ArcadeProps {
  user: UserProfile | null;
  selectedDialect: DialectTrack;
  onStartMatch: (lesson: LessonNode) => void;
  onOpenStore: () => void;
}

export const Arcade: React.FC<ArcadeProps> = ({ user, selectedDialect, onStartMatch, onOpenStore }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Gamepad2 className="text-cyan-400" /> Arcade Arena
            </h1>
            <p className="text-slate-400 text-sm mt-1">Test your {selectedDialect.dialect} reflexes under pressure.</p>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold flex items-center gap-2">
              <Sparkles size={16} /> {user?.sparks || 0}
            </div>
            <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold flex items-center gap-2">
              <Zap size={16} /> {user?.subscription === 'premium' ? '∞' : (user?.energy || 0)}
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Rapid Fire Mode */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <Crosshair className="text-cyan-400 w-12 h-12 mb-4" />
            <h2 className="text-xl font-black text-white mb-2">Rapid Fire Drill</h2>
            <p className="text-sm text-slate-400 mb-6">A high-speed survival mode. Answer 10 authentic street phrases before the timer runs out.</p>
            <button 
              onClick={() => onStartMatch({ id: 'arcade_rapid_fire', title: 'Rapid Fire Survival', focus: 'Speed & Reflexes', type: 'rapid_fire', cost: 2, status: 'unlocked' })}
              className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            >
              <Zap size={16} /> Play (Costs 2 Zaps)
            </button>
          </div>

          {/* Multiplayer Vocab Clash */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-rose-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <Users className="text-rose-400 w-12 h-12 mb-4" />
            <h2 className="text-xl font-black text-white mb-2">Vocab Clash Arena</h2>
            <p className="text-sm text-slate-400 mb-6">Go head-to-head against another learner in a 1v1 street debate. Winner takes all Sparks.</p>
            <button 
              onClick={() => onStartMatch({ id: 'arcade_debate', title: 'Vocab Clash 1v1', focus: 'Debate & Strategy', type: 'boss', cost: 3, status: 'unlocked' })}
              className="w-full py-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all active:scale-95"
            >
              <Trophy size={16} /> Enter Arena (Costs 3 Zaps)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
