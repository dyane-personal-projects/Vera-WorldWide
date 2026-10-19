import React from 'react';
import { Gamepad2, Users, Trophy, Zap, Flame, Crown, ArrowRight, Play } from 'lucide-react';
import { DialectTrack, LessonNode, UserProfile } from '../types';

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
  const isPremium = user?.subscription === 'premium' || user?.role === 'staff';

  const handleStartRapidFire = () => {
    onStartMatch({
      id: 'arcade_rapid_fire',
      title: `Arcade: Rapid Fire (${selectedDialect.dialect})`,
      focus: 'Answer quickly under 15-second time pressure without breaking colloquial rhythm.',
      type: 'rapid_fire',
      cost: 1,
      rewardSparks: 100,
      status: 'unlocked',
      persona: 'Speed Match Referee'
    });
  };

  const handleStartDebate = () => {
    if (!isPremium) {
      onOpenStore();
      return;
    }
    onStartMatch({
      id: 'arcade_debate',
      title: `1v1 Street Debate (${selectedDialect.dialect})`,
      focus: 'Defend your perspective against an argumentative local dialect master.',
      type: 'boss',
      cost: 2,
      rewardSparks: 250,
      status: 'unlocked',
      persona: 'Fiery Street Debater'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-sans p-6 md:p-12 max-w-5xl mx-auto w-full space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500 shadow-xl shadow-rose-500/10">
          <Gamepad2 size={36} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          Vera Arcade Arena
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          High-velocity conversational reflex testing. Put your conversational muscle memory
          to the test under timer constraints in <strong>{selectedDialect.dialect}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Rapid Fire Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-rose-500/50 transition-all shadow-xl group">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                Speed Drill
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                <Flame size={14} /> +100 Sparks
              </span>
            </div>

            <h3 className="text-2xl font-black text-white mb-2 group-hover:text-rose-400 transition-colors">
              Rapid Fire Mode
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Vera fires quick-fire questions at street speed. You must reply immediately without hesitation or breaking native syntax.
            </p>
          </div>

          <button
            onClick={handleStartRapidFire}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2"
          >
            <Play size={16} fill="currentColor" />
            <span>Launch Rapid Match (1 Zap)</span>
          </button>
        </div>

        {/* 1v1 Debate Card */}
        <div
          className={`bg-slate-900 border rounded-3xl p-8 flex flex-col justify-between transition-all shadow-xl relative overflow-hidden ${
            isPremium ? 'border-indigo-500/50 hover:border-indigo-400' : 'border-slate-800/80'
          }`}
        >
          {!isPremium && (
            <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-mono font-bold uppercase tracking-widest px-4 py-1 rounded-bl-2xl">
              Premium Tier
            </div>
          )}

          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Competitive Arena
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                <Crown size={14} /> +250 Sparks
              </span>
            </div>

            <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
              <Users size={24} className="text-indigo-400" />
              <span>1v1 Dialect Debate</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Face off against a high-pressure local persona arguing over city culture, gastronomy, or sports.
              Scored on conviction and colloquial precision.
            </p>
          </div>

          <button
            onClick={handleStartDebate}
            className={`w-full py-4 rounded-2xl font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
              isPremium
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/25'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isPremium ? (
              <>
                <Play size={16} fill="currentColor" />
                <span>Enter Debate Ring (2 Zaps)</span>
              </>
            ) : (
              <>
                <Crown size={16} />
                <span>Unlock with Premium Immersion</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
