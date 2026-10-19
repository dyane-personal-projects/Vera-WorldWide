// src/components/LegalComplianceModal.tsx
import React, { useState } from 'react';
import { ShieldCheck, Trash2, RefreshCw, X, AlertTriangle, CheckCircle2, FileText, Lock } from 'lucide-react';
import { UserProfile } from '../types';
import { deleteUserAccount, getOrCreateUserProfile, auth } from '../firebase';

interface LegalComplianceModalProps {
  isOpen: boolean;
  initialTab?: 'privacy' | 'terms' | 'account';
  onClose: () => void;
  user: UserProfile | null;
  onUserDeleted: () => void;
  onUserUpdated: (user: UserProfile) => void;
}

export const LegalComplianceModal: React.FC<LegalComplianceModalProps> = ({
  isOpen,
  initialTab = 'privacy',
  onClose,
  user,
  onUserDeleted,
  onUserUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'account'>(initialTab);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRestorePurchases = async () => {
    setRestoreMessage('Syncing subscription status with cloud...');
    const refreshed = await getOrCreateUserProfile(auth.currentUser);
    if (refreshed) {
      onUserUpdated(refreshed);
      setRestoreMessage(`Active Tier Restored: ${refreshed.subscription.toUpperCase()}`);
    } else {
      setRestoreMessage('No active cloud purchases found for this account.');
    }
    setTimeout(() => setRestoreMessage(null), 4000);
  };

  const handleDeleteAccount = async () => {
    if (!user || confirmDeleteText !== 'DELETE') return;
    setIsDeleting(true);
    await deleteUserAccount(user.uid);
    setIsDeleting(false);
    onUserDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="text-emerald-400" size={22} />
            <h2 className="text-lg font-black text-white">Vera WorldWide Legal & Account Center</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 gap-2 pt-3">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'privacy' ? 'border-emerald-400 text-emerald-400 bg-slate-900' : 'border-transparent text-slate-400'
            }`}
          >
            <Lock size={14} /> Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'terms' ? 'border-emerald-400 text-emerald-400 bg-slate-900' : 'border-transparent text-slate-400'
            }`}
          >
            <FileText size={14} /> Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'account' ? 'border-rose-400 text-rose-400 bg-slate-900' : 'border-transparent text-slate-400'
            }`}
          >
            <Trash2 size={14} /> Purchases & Data Deletion
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed flex-1">
          {activeTab === 'privacy' && (
            <>
              <h3 className="text-sm font-bold text-white">1. Data Collection & Usage</h3>
              <p>
                Vera WorldWide collects your email address, display name, learning progression (Sparks, Zaps, Streak, CEFR level), and conversational practice transcripts to provide adaptive AI language coaching.
              </p>
              <h3 className="text-sm font-bold text-white">2. Voice & Microphone Processing</h3>
              <p>
                When you use live voice shadowing or microphone input, audio is processed ephemerally via browser Speech-to-Text APIs and Google Gemini Neural models solely to grade pronunciation and generate dialect responses. We never sell your voice data to third parties.
              </p>
              <h3 className="text-sm font-bold text-white">3. Data Retention & Deletion Rights</h3>
              <p>
                Under Apple App Store Guideline 5.1.1, GDPR, and CCPA, you have the right to permanently delete your account and all associated cloud data at any time inside the "Purchases & Data Deletion" tab.
              </p>
            </>
          )}

          {activeTab === 'terms' && (
            <>
              <h3 className="text-sm font-bold text-white">1. Subscription Tiers & Billing</h3>
              <p>
                Vera WorldWide offers three membership tiers: Curious/Free ($0), Vera Plus ($4.99/month or $47.99/year), and Vera Unlimited/Premium ($9.99/month or $95.99/year). Subscriptions automatically renew unless canceled at least 24 hours before the end of the current billing period.
              </p>
              <h3 className="text-sm font-bold text-white">2. Fair Use & AI Coaching</h3>
              <p>
                Vera WorldWide teaches authentic colloquial street dialects and cultural idioms. Users agree not to use the platform for unlawful harassment or automated scraping.
              </p>
            </>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Restore Purchases (Guideline 3.1.2)</h4>
                    <p className="text-slate-400 text-xs">Sync your Plus or Unlimited subscription from the cloud.</p>
                  </div>
                  <button
                    onClick={handleRestorePurchases}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} /> Restore Purchases
                  </button>
                </div>
                {restoreMessage && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-700/50 text-emerald-300 flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} /> {restoreMessage}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/50 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <AlertTriangle size={16} /> Permanent Account Deletion (Guideline 5.1.1)
                </div>
                <p className="text-slate-300 text-xs">
                  This action permanently deletes your Vera WorldWide profile, Sparks balance, streak history, and cloud records. Type <strong>DELETE</strong> below to confirm.
                </p>
                {user ? (
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <input
                      type="text"
                      value={confirmDeleteText}
                      onChange={(e) => setConfirmDeleteText(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                    />
                    <button
                      disabled={confirmDeleteText !== 'DELETE' || isDeleting}
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-black text-xs flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={14} /> {isDeleting ? 'Deleting...' : 'Delete My Account Forever'}
                    </button>
                  </div>
                ) : (
                  <p className="text-amber-400 text-xs font-semibold">Please log in first to manage or delete your account.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};