import React, { useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Zap,
  ShieldCheck,
  Crown,
  ArrowLeft,
  BookOpen,
  Award
} from 'lucide-react';
import { UserProfile } from '../types';

interface StoreProps {
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onBackToDashboard: () => void;
  onOpenPaywall: (tier?: 'plus' | 'premium') => void;
}

export const Store: React.FC<StoreProps> = ({
  user,
  onUpdateUser,
  onBackToDashboard,
  onOpenPaywall
}) => {
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  const spendSparks = (cost: number, label: string, updater: (u: UserProfile) => UserProfile) => {
    if (!user) return;
    if ((user.sparks || 0) < cost) {
      setPurchaseNotice(`Not enough Sparks! You need ${cost} Sparks for ${label}. Complete a lesson or chat with your local teacher to earn more!`);
      return;
    }
    const updated = updater({ ...user, sparks: (user.sparks || 0) - cost });
    onUpdateUser(updated);
    localStorage.setItem('vera_active_user', JSON.stringify(updated));
    setPurchaseNotice(`✓ Purchased ${label}!`);
    setTimeout(() => setPurchaseNotice(null), 3500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBackToDashboard}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <ShoppingBag className="text-violet-400" /> Vera Sparks Store
              </h1>
              <p className="text-slate-400 text-sm">
                Spend your earned Sparks on Zaps, Streak Freezes, and Survival Packs.
              </p>
            </div>
          </div>

          <div className="px-5 py-2.5 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-300 font-black flex items-center gap-2 text-base">
            <Sparkles size={18} /> {user?.sparks ?? 150} Sparks
          </div>
        </header>

        {purchaseNotice && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-black">
            {purchaseNotice}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Item 1: +5 Energy Zaps */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <Zap className="w-10 h-10 text-cyan-400 mb-4" />
              <h3 className="font-black text-lg text-white mb-1">+5 Energy Zaps Refill</h3>
              <p className="text-xs text-slate-400 mb-6">
                Instantly add 5 Zaps so you can keep playing lessons and Arcade matches right now.
              </p>
            </div>
            <button
              onClick={() =>
                spendSparks(100, '+5 Energy Zaps', (u) => ({
                  ...u,
                  energy: (u.energy ?? 5) + 5
                }))
              }
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} className="text-violet-400" /> Buy for 100 Sparks
            </button>
          </div>

          {/* Item 2: Streak Freeze */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <ShieldCheck className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="font-black text-lg text-white mb-1">7-Day Streak Shield</h3>
              <p className="text-xs text-slate-400 mb-6">
                Protects your daily flame streak if you miss a day of practice, plus +2 bonus streak days.
              </p>
            </div>
            <button
              onClick={() =>
                spendSparks(150, 'Streak Shield (+2 Streak)', (u) => ({
                  ...u,
                  streak: (u.streak || 1) + 2
                }))
              }
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} className="text-violet-400" /> Buy for 150 Sparks
            </button>
          </div>

          {/* Item 3: Unlimited Upgrade */}
          <div className="bg-gradient-to-b from-indigo-950 to-slate-900 border border-indigo-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <Crown className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="font-black text-lg text-white mb-1">Vera Unlimited Pass</h3>
              <p className="text-xs text-indigo-200 mb-6">
                Unlock Infinite Energy (∞ Zaps), all Boss Battles, 1v1 Debate Arena, and 2x Sparks Multiplier.
              </p>
            </div>
            <button
              onClick={() => onOpenPaywall('premium')}
              className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg"
            >
              View Plus & Unlimited Plans ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
