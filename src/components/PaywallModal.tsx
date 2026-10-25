import React, { useState } from 'react';
import { Crown, Check, X, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { UserProfile, SubscriptionTier } from '../types';
import { updateUserSubscription } from '../firebase';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  initialTier?: 'plus' | 'premium';
  onSubscriptionUpgraded: (user: UserProfile) => void;
  onOpenAuth: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, user, initialTier = 'premium', onSubscriptionUpgraded, onOpenAuth }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  if (!isOpen) return null;

  const handleCheckout = async (tier: SubscriptionTier) => {
    if (!user) {
      onClose();
      onOpenAuth();
      return;
    }
    // Simulate Stripe Checkout for MVP
    await updateUserSubscription(user.uid, tier);
    onSubscriptionUpgraded({ ...user, subscription: tier, energy: tier === 'premium' ? 999999 : 15 });
    alert(`Success! Upgraded to ${tier.toUpperCase()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full transition-colors z-20">
          <X size={20} />
        </button>

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-black text-white mb-4">Unlock True Fluency</h2>
          <div className="inline-flex bg-slate-950 p-1 rounded-full border border-slate-800">
            <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>Monthly</button>
            <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>Yearly (-20%)</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 relative z-10">
          {/* Plus Tier */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Vera Plus</h3>
            <div className="mb-6">
              {billingCycle === 'yearly' ? (
                <><span className="text-4xl font-black text-white">$4.99</span><span className="text-slate-500">/mo</span></>
              ) : (
                <><span className="text-4xl font-black text-white">$5.99</span><span className="text-slate-500">/mo</span></>
              )}
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-slate-300"><Check className="text-emerald-400" size={18} /> 15 Energy Zaps per day</li>
              <li className="flex items-center gap-3 text-sm text-slate-300"><Check className="text-emerald-400" size={18} /> 2x Sparks Multiplier</li>
              <li className="flex items-center gap-3 text-sm text-slate-300"><Check className="text-emerald-400" size={18} /> Boss Scenarios</li>
            </ul>
            <button onClick={() => handleCheckout('plus')} className="w-full py-4 rounded-xl border border-emerald-500/50 text-emerald-400 font-black hover:bg-emerald-500/10 transition-colors">
              Upgrade to Plus
            </button>
          </div>

          {/* Premium Tier */}
          <div className="bg-gradient-to-b from-indigo-900/50 to-slate-900 border border-indigo-500/50 rounded-3xl p-6 flex flex-col relative overflow-hidden shadow-2xl shadow-indigo-500/20">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">Most Popular</div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Crown className="text-amber-400" size={20}/> Premium</h3>
            <div className="mb-6">
              {billingCycle === 'yearly' ? (
                <><span className="text-4xl font-black text-white">$9.99</span><span className="text-indigo-300">/mo</span></>
              ) : (
                <><span className="text-4xl font-black text-white">$12.99</span><span className="text-indigo-300">/mo</span></>
              )}
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-white font-bold"><Zap className="text-amber-400" size={18} /> Infinite Energy</li>
              <li className="flex items-center gap-3 text-sm text-indigo-100"><Sparkles className="text-emerald-400" size={18} /> 3x Sparks Multiplier</li>
              <li className="flex items-center gap-3 text-sm text-indigo-100"><ShieldCheck className="text-emerald-400" size={18} /> Arcade Vocab Clash & Keep Fluency</li>
            </ul>
            <button onClick={() => handleCheckout('premium')} className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black transition-colors shadow-lg shadow-indigo-500/25">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
