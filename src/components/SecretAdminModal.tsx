import React, { useState } from 'react';
import {
  ShieldAlert,
  Key,
  X,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { UserProfile } from '../types';
import { promoteToAdminWithPasscode } from '../firebase';

interface SecretAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAdminActivated: (adminUser: UserProfile) => void;
}

export const SecretAdminModal: React.FC<SecretAdminModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAdminActivated
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = passcode.trim();
    const promoted = promoteToAdminWithPasscode(trimmed, currentUser);

    if (promoted) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPasscode('');
        onAdminActivated(promoted);
        onClose();
      }, 700);
    } else {
      setErrorMsg('Unauthorized key. Access denied to Master Telemetry OS.');
    }
  };

  const handleInstantOwnerLogin = () => {
    const ownerPromoted = promoteToAdminWithPasscode('VERA2026', {
      uid: 'owner_dyane_root',
      email: 'dyanecayer1821@gmail.com',
      displayName: 'Owner & Admin',
      role: 'staff',
      subscription: 'premium',
      sparks: 99999,
      energy: 999999,
      streak: 99,
      selectedDialect: 'Mexican Spanish',
      createdAt: Date.now()
    });

    if (ownerPromoted) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onAdminActivated(ownerPromoted);
        onClose();
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-slate-200">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <span>Vera Master Telemetry Gate</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                INTERNAL RESTRICTED PROTOCOL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-lg font-black text-white">Master Credentials Confirmed</h4>
            <p className="text-xs text-emerald-400 font-mono">
              Staff VIP & 100% Free Total Immersion unlocked. Opening console...
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-center gap-2 text-indigo-300 font-bold mb-1">
                <Crown size={14} className="text-amber-400" />
                <span>Owner & Staff Super-Access</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Grants permanent <span className="text-emerald-400 font-bold">100% Free Access</span> to all features, infinite conversational energy, unreleased dialect tracks, and administrative telemetry.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono font-medium">
                {errorMsg}
              </div>
            )}

            {/* Quick One-Click Unlock for Workspace Owner */}
            <button
              onClick={handleInstantOwnerLogin}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md group"
            >
              <Crown size={15} className="text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>One-Click Owner Access</span>
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink-0 mx-3 text-slate-500 text-[10px] uppercase font-mono tracking-widest">
                or enter master key
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono mb-1.5 block">
                  Master Access Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Key size={14} />
                  </div>
                  <input
                    type="password"
                    autoFocus
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono tracking-widest transition-colors"
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  Enter authorized staff passkey or master security passphrase.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase font-mono tracking-wider shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Authenticate & Unlock Free App</span>
                <ArrowRight size={14} />
              </button>
            </form>

            <div className="text-[10px] text-slate-500 text-center font-mono">
              Shortcuts: <kbd className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded">Ctrl + Shift + A</kbd> or 3x click on version in footer.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
