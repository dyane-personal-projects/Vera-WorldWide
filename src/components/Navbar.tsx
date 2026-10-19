import React from 'react';
import {
  Compass,
  MessageSquareCode,
  ShieldCheck,
  Languages,
  Crown,
  User,
  Menu,
  ArrowRight,
  LogOut,
  BrainCircuit
} from 'lucide-react';
import { ActiveView, DialectTrack, UserProfile } from '../types';
import { SupportedNativeLanguage, t } from '../utils/i18n';
import { LanguagePairSelector } from './LanguagePairSelector';

interface NavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  user: UserProfile | null;
  nativeLang: SupportedNativeLanguage;
  onNativeLangChange: (lang: SupportedNativeLanguage) => void;
  selectedDialect: DialectTrack;
  onDialectChange: (track: DialectTrack) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogOut: () => void;
  onToggleMobileSidebar: () => void;
  onOpenPlacement?: () => void;
  onOpenPaywall?: (tier: 'plus' | 'premium') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  user,
  nativeLang,
  onNativeLangChange,
  selectedDialect,
  onDialectChange,
  onOpenAuth,
  onLogOut,
  onToggleMobileSidebar,
  onOpenPlacement,
  onOpenPaywall
}) => {
  const isStaff = user?.role === 'staff';

  return (
    <nav className="h-16 bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800/90 px-3 sm:px-6 md:px-8 flex items-center justify-between z-30 shrink-0 sticky top-0 shadow-sm shadow-slate-950/60 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu toggle (only when inside the app) */}
        {activeView !== 'landing' && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 border border-slate-800 md:hidden transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Brand Lockup */}
        <div
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Languages size={16} className="text-emerald-400" />
            </div>
          </div>
          <span className="font-black text-white text-base tracking-tight hidden sm:inline-block">
            Vera <span className="text-emerald-400">WorldWide</span>
          </span>
        </div>

        {/* Language Pair Selector (I speak / I want to learn) */}
        <div className="hidden sm:block ml-1">
          <LanguagePairSelector
            currentNativeLang={nativeLang}
            onNativeLangChange={onNativeLangChange}
            selectedDialect={selectedDialect}
            onDialectChange={onDialectChange}
            compact={true}
          />
        </div>

        {/* Marketing Navigation Links (When on Landing Page) */}
        {activeView === 'landing' ? (
          <div className="hidden xl:flex items-center gap-5 ml-4 text-xs font-semibold text-slate-300">
            <a href="#active-dialects" className="hover:text-emerald-400 transition-colors">
              {t('nav_dialects', nativeLang)}
            </a>
            <a href="#coming-soon-voting" className="hover:text-emerald-400 transition-colors">
              {t('nav_ballot', nativeLang)}
            </a>
            <a href="#pricing-plans" className="hover:text-emerald-400 transition-colors">
              {t('nav_pricing', nativeLang)}
            </a>
            {onOpenPlacement && (
              <button
                onClick={onOpenPlacement}
                className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/30 border border-cyan-800/40 hover:border-cyan-500/50"
              >
                <BrainCircuit size={13} />
                <span>Level Quiz</span>
              </button>
            )}
          </div>
        ) : (
          /* In-App Quick View Switcher */
          <div className="hidden lg:flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 ml-3">
            <button
              onClick={() => setActiveView('landing')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 text-slate-400 hover:text-white"
            >
              <Compass size={14} /> {t('nav_showcase', nativeLang)}
            </button>
            <button
              onClick={() => setActiveView('tutor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'tutor'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquareCode size={14} /> {t('nav_tutor', nativeLang)}
            </button>
            <button
              onClick={() => setActiveView('placement')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'placement'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <BrainCircuit size={14} /> Level Quiz
            </button>
            {isStaff && (
              <button
                onClick={() => setActiveView('admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck size={14} className="text-amber-400" /> Admin Console
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Always provide clear Sign Up and Log In */}
      <div className="flex items-center gap-2">
        {/* Mobile Language Selector */}
        <div className="sm:hidden">
          <LanguagePairSelector
            currentNativeLang={nativeLang}
            onNativeLangChange={onNativeLangChange}
            selectedDialect={selectedDialect}
            onDialectChange={onDialectChange}
            compact={true}
          />
        </div>

        {!user ? (
          <>
            <button
              onClick={() => onOpenAuth('login')}
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
            >
              {t('nav_login', nativeLang)}
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
            >
              <span>{t('nav_signup', nativeLang)}</span>
              <ArrowRight size={14} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            {activeView === 'landing' ? (
              <button
                onClick={() => setActiveView('tutor')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
              >
                <MessageSquareCode size={14} />
                <span className="hidden sm:inline">Open Tutor</span>
              </button>
            ) : null}

            {/* Upgrade CTA button if on Free plan */}
            {user.subscription === 'free' && onOpenPaywall && (
              <button
                onClick={() => onOpenPaywall('premium')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs font-mono uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                title="Unlock Unlimited Energy and Boss Battles"
              >
                <Crown size={13} className="text-slate-950" />
                <span>Upgrade</span>
              </button>
            )}

            {/* Profile Avatar Pill */}
            <button
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 rounded-2xl text-xs font-semibold text-slate-200 transition-colors"
              title="Account Profile & Settings"
            >
              <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 text-xs font-bold">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={12} />}
              </div>
              <span className="max-w-[90px] truncate text-[11px]">
                {user.displayName}
              </span>
              {user.subscription && user.subscription !== 'free' && (
                <Crown size={12} className={user.subscription === 'premium' ? 'text-amber-400' : 'text-emerald-400'} />
              )}
            </button>

            {/* Log Out button */}
            <button
              onClick={onLogOut}
              className="text-[11px] font-mono text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 px-2 py-1.5 rounded-xl border border-slate-800 hover:border-rose-900/60 transition-all flex items-center gap-1"
              title="Log Out / Switch Account"
            >
              <LogOut size={12} />
              <span className="hidden md:inline">{t('nav_logout', nativeLang)}</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
