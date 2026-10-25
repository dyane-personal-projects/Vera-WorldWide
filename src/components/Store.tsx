import React from 'react';
import { ShoppingBag, Sparkles, Zap, Palette, Crown, ArrowLeft } from 'lucide-react';
import { UserProfile } from '../types';

interface StoreProps {
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onBackToDashboard: () => void;
  onOpenPaywall: () => void;
}

export const Store: React.FC<StoreProps> = ({ user, onUpdateUser, onBackToDashboard, onOpenPaywall }) => {
  const buyEnergy = () => {
    if ((user?.sparks || 0) >= 150) {
      onUpdateUser({ ...user!, sparks: user!.sparks! - 150, energy: (user!.energy || 0) + 5 });
      alert("Successfully purchased 5 Zaps!");
    } else {
      alert("Not enough Sparks! Keep learning.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <button onClick={onBackToDashboard} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 transition-colors"><ArrowLeft size={18} /></button>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2"><ShoppingBag className="text-violet-400" /> Vera Store</h1>
              <p className="text-slate-400 text-sm mt-1">Spend your Sparks to unlock upgrades.</p>
            </div>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-400 font-black flex items-center gap-2 text-lg shadow-lg shadow-violet-500/20">
            <Sparkles size={20} /> {user?.sparks || 0} Sparks
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center hover:border-cyan-500/50 transition-colors">
            <Zap className="w-12 h-12 mx-auto text-cyan-400 mb-4" />
            <h3 className="font-bold text-lg text-white mb-2">Energy Refill</h3>
            <p className="text-xs text-slate-400 mb-6">Instantly restore 5 Zaps to keep your learning streak alive.</p>
            <button onClick={buyEnergy} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 transition-colors">
              <Sparkles size={14} className="text-violet-400"/> 150 Sparks
            </button>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center hover:border-emerald-500/50 transition-colors">
            <Palette className="w-12 h-12 mx-auto text-emerald-400 mb-4" />
            <h3 className="font-bold text-lg text-white mb-2">Dark Emerald Theme</h3>
            <p className="text-xs text-slate-400 mb-6">Unlock the exclusive deep emerald UI color palette for your app.</p>
            <button className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 font-bold flex items-center justify-center gap-2 cursor-not-allowed">
              <Sparkles size={14} /> 5,000 Sparks
            </button>
          </div>

          <div className="bg-gradient-to-b from-indigo-900 to-slate-900 border border-indigo-500/50 rounded-3xl p-6 text-center shadow-2xl shadow-indigo-500/10">
            <Crown className="w-12 h-12 mx-auto text-amber-400 mb-4" />
            <h3 className="font-bold text-lg text-white mb-2">Infinite Energy</h3>
            <p className="text-xs text-indigo-200 mb-6">Upgrade to Premium for unlimited Zaps and a 2x Sparks multiplier.</p>
            <button onClick={onOpenPaywall} className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black flex items-center justify-center gap-2 transition-colors shadow-lg">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
