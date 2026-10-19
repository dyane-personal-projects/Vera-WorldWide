import React, { useState } from 'react';
import { Crown, CheckCircle2, Zap, Hexagon, Sparkles, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { SubscriptionTier, UserProfile } from '../types';
import { updateUserSubscription } from '../firebase';

interface StoreProps {
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onBackToDashboard: () => void;
  onOpenPaywall?: (tier: 'plus' | 'premium') => void;
}

export const Store: React.FC<StoreProps> = ({ user, onUpdateUser, onBackToDashboard, onOpenPaywall }) => {
  const [upgradingTier, setUpgradingTier] = useState<SubscriptionTier | null>(null);
  const [successNote, setSuccessNote] = useState<string>('');

  const currentTier = user?.subscription || 'free';

  const handleSelectTier = async (tier: SubscriptionTier) => {
    if (tier === currentTier) return;
    if (onOpenPaywall && (tier === 'plus' || tier === 'premium')) {
      onOpenPaywall(tier);
      return;
    }
    setUpgradingTier(tier);

    try {
      if (user?.uid) {
        await updateUserSubscription(user.uid, tier);
        onUpdateUser({
          ...user,
          subscription: tier,
          energy: tier === 'premium' ? 999 : tier === 'plus' ? 15 : 5
        });
      }
      setSuccessNote(`🎉 Subscription upgraded to Vera ${tier.toUpperCase()} successfully!`);
      setTimeout(() => setSuccessNote(''), 5000);
    } catch (err) {
      console.warn("Upgrade error", err);
    } finally {
      setUpgradingTier(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-sans p-6 md:p-12 max-w-5xl mx-auto w-full space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
          <Crown size={36} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          Vera Neural Marketplace
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Unlock high-velocity fluency. Upgrade your daily energy credits, access high-stakes Boss encounters,
          and explore unreleased alpha dialects.
        </p>

        {successNote && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold rounded-2xl animate-in fade-in">
            {successNote}
          </div>
        )}
      </div>

      {/* Pricing Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FREE */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-2">
              Explorer Tier
            </span>
            <h3 className="text-2xl font-black text-white mb-2">Vera Free</h3>
            <div className="text-4xl font-black text-white mb-6">
              $0<span className="text-xs text-slate-500 font-normal"> / mo</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>5 Energy credits per day</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Basic street dialogues</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Community dialect release voting</span>
              </li>
            </ul>
          </div>

          <button
            disabled={currentTier === 'free' || upgradingTier !== null}
            onClick={() => handleSelectTier('free')}
            className="mt-8 w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-xs font-mono uppercase tracking-wider transition-colors"
          >
            {currentTier === 'free' ? 'Current Plan' : 'Downgrade to Free'}
          </button>
        </div>

        {/* PLUS */}
        <div className="p-8 rounded-3xl bg-slate-900 border-2 border-emerald-500 relative flex flex-col justify-between shadow-2xl shadow-emerald-500/10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase font-mono tracking-widest px-3 py-1 rounded-full">
            Recommended
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-2">
              Conversationalist
            </span>
            <h3 className="text-2xl font-black text-white mb-2">Vera Plus</h3>
            <div className="text-4xl font-black text-white mb-6">
              $4.99<span className="text-xs text-slate-400 font-normal"> / mo</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>15 Energy credits per day</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Boss Scenarios & negotiations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Neural Speech Audio Voice Playback</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Detailed grammar & slang breakdown</span>
              </li>
            </ul>
          </div>

          <button
            disabled={currentTier === 'plus' || upgradingTier !== null}
            onClick={() => handleSelectTier('plus')}
            className="mt-8 w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs font-mono uppercase tracking-wider transition-all shadow-md shadow-emerald-500/30 flex items-center justify-center gap-2"
          >
            {upgradingTier === 'plus' ? <Loader2 size={16} className="animate-spin" /> : null}
            <span>{currentTier === 'plus' ? 'Current Plan' : 'Select Vera Plus'}</span>
          </button>
        </div>

        {/* PREMIUM */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/50 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block mb-2">
              Total Immersion
            </span>
            <h3 className="text-2xl font-black text-white mb-2">Vera Premium</h3>
            <div className="text-4xl font-black text-white mb-6">
              $9.99<span className="text-xs text-slate-400 font-normal"> / mo</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <Crown size={16} className="text-amber-400 shrink-0" />
                <span className="font-bold text-white">INFINITE Energy Credits</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                <span>All upcoming unreleased dialects</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                <span>Vocab Clash Arena & 1v1 Debate</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                <span>Fastest Gemini 2.5 Flash response priority</span>
              </li>
            </ul>
          </div>

          <button
            disabled={currentTier === 'premium' || upgradingTier !== null}
            onClick={() => handleSelectTier('premium')}
            className="mt-8 w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-black text-xs font-mono uppercase tracking-wider transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {upgradingTier === 'premium' ? <Loader2 size={16} className="animate-spin" /> : null}
            <span>{currentTier === 'premium' ? 'Current Plan' : 'Go Premium'}</span>
          </button>
        </div>
      </div>

      {/* Production Billing Security Footprint */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck size={16} /> 256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-white">
            <Sparkles size={14} className="text-cyan-400" /> Apple App Store & Google Play Certified
          </span>
          <span>•</span>
          <span className="text-slate-300">1-Click Instant Cancellation</span>
        </div>
        <p className="text-[11px] text-slate-500 max-w-xl mx-auto leading-relaxed">
          Subscriptions are managed through official App Store / Google Play / Direct Stripe In-App Billing.
          You receive an itemized receipt with every transaction. 7-day free trial on initial activation.
        </p>
      </div>
    </div>
  );
};
