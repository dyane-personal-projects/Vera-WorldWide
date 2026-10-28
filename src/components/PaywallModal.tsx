import React, { useState } from 'react';
import { Crown, Check, X, Zap, Sparkles, ShieldCheck, CreditCard } from 'lucide-react';
import { UserProfile, SubscriptionTier } from '../types';
import { updateUserSubscription } from '../firebase';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  initialTier?: 'plus' | 'premium';
  onSubscriptionUpgraded: (user: UserProfile) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubscriptionUpgraded,
  onOpenAuth
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (!user) {
      onClose();
      onOpenAuth('signup');
      return;
    }
    setIsProcessing(true);
    await updateUserSubscription(user.uid, tier);
    const updated: UserProfile = {
      ...user,
      subscription: tier,
      energy: tier === 'premium' || tier === 'unlimited' ? 999999 : 15,
      maxEnergy: tier === 'premium' || tier === 'unlimited' ? 999999 : 15
    };
    onSubscriptionUpgraded(updated);
    localStorage.setItem('vera_active_user', JSON.stringify(updated));
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-8">
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
            Real Fluency • 1/3 the Price of Competitors
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 mb-3">
            Choose Your Vera WorldWide Pass
          </h2>
          <div className="inline-flex bg-slate-950 p-1 rounded-full border border-slate-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-black cursor-pointer transition-all ${
                billingCycle === 'monthly' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full text-xs font-black cursor-pointer transition-all ${
                billingCycle === 'yearly' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Annual Billing (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tier 2: Vera Plus */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-white mb-1">Vera Plus</h3>
              <p className="text-xs text-slate-400 mb-4">For daily learners building real street confidence.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">
                  {billingCycle === 'yearly' ? '$3.99' : '$4.99'}
                </span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>
              <ul className="space-y-3 mb-8 text-xs text-slate-200">
                <li className="flex items-center gap-2.5"><Check size={16} className="text-emerald-400" /> <strong>15 Energy Zaps</strong> per day</li>
                <li className="flex items-center gap-2.5"><Check size={16} className="text-emerald-400" /> Unlock High-Stakes <strong>Boss Battles</strong></li>
                <li className="flex items-center gap-2.5"><Check size={16} className="text-emerald-400" /> Live Mic Pronunciation Coaching</li>
                <li className="flex items-center gap-2.5"><Check size={16} className="text-emerald-400" /> <strong>2.0x Sparks</strong> Multiplier & 2x Voting Weight</li>
              </ul>
            </div>
            <button
              disabled={isProcessing}
              onClick={() => handleUpgrade('plus')}
              className="w-full py-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-black text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <CreditCard size={15} /> Activate Vera Plus
            </button>
          </div>

          {/* Tier 3: Vera Unlimited (Premium) */}
          <div className="bg-gradient-to-b from-indigo-950/80 to-slate-950 border-2 border-indigo-500 rounded-3xl p-6 flex flex-col justify-between relative shadow-2xl shadow-indigo-500/15">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-2xl">
              Best Value • Unlimited
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
                <Crown size={20} className="text-amber-400" /> Vera Unlimited
              </h3>
              <p className="text-xs text-indigo-200 mb-4">Zero limits. Full access to every local teacher & arena.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">
                  {billingCycle === 'yearly' ? '$7.99' : '$9.99'}
                </span>
                <span className="text-xs text-indigo-300"> / month</span>
              </div>
              <ul className="space-y-3 mb-8 text-xs text-white">
                <li className="flex items-center gap-2.5 font-bold"><Zap size={16} className="text-amber-400" /> <strong>UNLIMITED (∞) Energy Zaps</strong> — Never wait</li>
                <li className="flex items-center gap-2.5"><Sparkles size={16} className="text-emerald-400" /> All Local Teachers & Live Voice Phone Calls</li>
                <li className="flex items-center gap-2.5"><ShieldCheck size={16} className="text-emerald-400" /> Unlock 1v1 Vocab Clash Debate Arena & Bosses</li>
                <li className="flex items-center gap-2.5"><Check size={16} className="text-emerald-400" /> 3x Priority Dialect Voting & Founder Badge</li>
              </ul>
            </div>
            <button
              disabled={isProcessing}
              onClick={() => handleUpgrade('premium')}
              className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <Crown size={15} /> Activate Vera Unlimited
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
