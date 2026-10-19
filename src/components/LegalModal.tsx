import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, CheckCircle2, ExternalLink } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'privacy'
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Vera WorldWide Legal & Privacy</h2>
              <p className="text-xs text-slate-400">Official App Store & Google Play Disclosures</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-3 gap-4 shrink-0">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            <Lock size={14} />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-3 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            <FileText size={14} />
            <span>Terms of Service & EULA</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed font-sans custom-scrollbar">
          {activeTab === 'privacy' ? (
            <div className="space-y-4">
              <p className="text-slate-400 italic">
                Last updated: October 2026. Vera WorldWide is committed to protecting your privacy and ensuring transparency regarding your linguistic and personal data.
              </p>

              <div>
                <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" /> 1. Data Collection & Usage
                </h3>
                <p>
                  Vera WorldWide collects your email address, display name, language selections, and progress metrics (CEFR level, completed lessons, Sparks, and streak records) to provide personalized, adaptive conversational immersion.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" /> 2. Audio & Speech Processing
                </h3>
                <p>
                  Spoken voice input via the microphone is converted to text strictly for real-time pronunciation scoring and AI tutoring. Spoken audio stream data is never sold, shared with third-party advertisers, or used to build biometric profiles.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" /> 3. Data Storage & Security
                </h3>
                <p>
                  User accounts and progress are encrypted and stored in secure Google Cloud Firestore instances with strict role-based access rules. Only authenticated users can access their individual profiles.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" /> 4. Account & Data Deletion
                </h3>
                <p>
                  In compliance with Apple App Store Guideline 5.1.1, you have the right to permanently delete your account and all associated data at any time via the "Delete Account" button located in your profile settings.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-400 italic">
                Last updated: October 2026. By accessing Vera WorldWide, you agree to these Terms of Service and End-User License Agreement (EULA).
              </p>

              <div>
                <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400" /> 1. Subscription Tiers & Billing
                </h3>
                <p>
                  Vera WorldWide offers Free Explorer, Vera Plus ($4.99/mo), and Vera Unlimited ($9.99/mo) subscriptions. Subscriptions automatically renew at the end of each billing cycle unless cancelled at least 24 hours before renewal. Payments are processed securely via Stripe.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400" /> 2. Energy System & Fair Use
                </h3>
                <p>
                  Energy (Zaps) regenerates automatically at scheduled intervals for Free and Plus users. Unlimited subscribers enjoy unrestricted access subject to standard automated abuse prevention.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400" /> 3. AI Conversational Simulation Disclaimer
                </h3>
                <p>
                  Vera uses neural AI models to simulate authentic street conversations, cultural slang, and roleplay scenarios. Content is generated for educational immersion and cultural appreciation.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400" /> 4. Cancellation & Refunds
                </h3>
                <p>
                  You may cancel your subscription at any time without fees. Cancellation takes effect at the end of the current paid billing period.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>© {new Date().getFullYear()} Vera WorldWide Inc. All rights reserved.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
