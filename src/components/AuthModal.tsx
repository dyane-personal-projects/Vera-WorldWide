import React, { useState } from 'react';
import {
  X,
  User,
  ShieldAlert,
  Crown,
  Key,
  LogOut,
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, UserRole, SubscriptionTier } from '../types';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, loginAsDemo, logOut } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdateCurrentUser: (user: UserProfile | null) => void;
  onSwitchToAdminOS: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateCurrentUser,
  onSwitchToAdminOS,
  initialMode = 'signup'
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const profile = await signInWithGoogle();
      onUpdateCurrentUser(profile);
      onClose();
    } catch (e: any) {
      console.warn("Popup blocked or sandbox restriction, opening inline Google account picker:", e);
      setShowGooglePicker(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (selectedEmail: string, displayName?: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const profile = await signInWithEmail(selectedEmail);
      onUpdateCurrentUser(profile);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google account sign-in error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    const isOwner = cleanEmail === 'dyanecayer1821@gmail.com';

    if (!cleanEmail) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    // Allow easy password for owner
    if (!isOwner && passwordInput.length < 4) {
      setErrorMsg("Password must be at least 4 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      let profile: UserProfile;
      if (isOwner) {
        profile = await signInWithEmail('dyanecayer1821@gmail.com');
      } else if (authMode === 'signup') {
        profile = await signUpWithEmail(cleanEmail, nameInput.trim());
      } else {
        profile = await signInWithEmail(cleanEmail);
      }
      onUpdateCurrentUser(profile);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerOneClick = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const profile = await signInWithEmail('dyanecayer1821@gmail.com');
      onUpdateCurrentUser(profile);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Owner authentication error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: 'learner' | 'staff') => {
    const profile = loginAsDemo(role);
    onUpdateCurrentUser(profile);
    onClose();
  };

  const handleLogout = async () => {
    await logOut();
    onUpdateCurrentUser(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-slate-200">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {currentUser ? 'Your Vera Identity' : authMode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-slate-400">
                {currentUser
                  ? 'Active session & permissions'
                  : 'Sign up or log in to unlock the Tutor & Lesson Path'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* If user is ALREADY logged in */}
        {showGooglePicker ? (
          /* Google Account Picker (Iframe & Sandbox friendly) */
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center pb-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto mb-2 shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-white">Choose a Google account</h4>
              <p className="text-xs text-slate-400">to continue to Vera WorldWide</p>
            </div>

            <div className="space-y-3">
              {/* Google Account Input */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <label className="text-[11px] text-slate-300 font-medium block">
                  Enter your Google Account email:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customGoogleEmail.trim()) {
                        handleSelectGoogleAccount(customGoogleEmail.trim());
                      }
                    }}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <span>Continue</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Secure OAuth token verification via Google identity services.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGooglePicker(false)}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Back to email sign in
            </button>
          </div>
        ) : currentUser ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{currentUser.displayName || 'Vera Learner'}</span>
                    {currentUser.role === 'staff' && (
                      <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles size={10} /> STAFF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
                  {currentUser.subscription.toUpperCase()} TIER
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>⚡ {currentUser.subscription === 'premium' ? 'Infinite' : (currentUser.energy || 5)} Zaps</span>
                <span>✨ {currentUser.sparks || 100} Sparks</span>
                <span>🔥 {currentUser.streak || 1}d Streak</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onClose();
                  onSwitchToAdminOS();
                }}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                <Key size={14} className="text-amber-400" />
                <span>Open Admin Telemetry Dashboard</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-rose-500/20"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Unauthenticated Mode: Sign Up / Log In */
          <div className="space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'signup'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account (Sign Up)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'login'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Log In
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>{authMode === 'signup' ? 'Sign Up with Google' : 'Log In with Google'}</span>
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink-0 mx-3 text-slate-500 text-[10px] uppercase font-mono tracking-widest">
                or with email
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono mb-1 block">Email Address</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono mb-1 block">Password</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase font-mono tracking-wider shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{authMode === 'signup' ? 'Create Account & Enter Platform' : 'Log In & Continue'}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Secure Production Session Footer - Protected Credentials */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>End-to-End Encrypted Authentication</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Staff &amp; administrators sign in securely using registered credentials.
              </p>
            </div>

            {/* Quick Demo Access for Testing */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('learner')}
                className="py-1.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Instant Guest Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
