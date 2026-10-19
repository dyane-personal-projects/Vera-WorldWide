import React from 'react';
import {
  Compass,
  MessageSquareCode,
  ShieldCheck,
  Languages,
  Zap,
  Crown,
  ChevronLeft,
  ChevronRight,
  User,
  Vote,
  ExternalLink,
  Flame,
  Globe,
  BookOpen
} from 'lucide-react';
import { ActiveView, UserProfile } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  selectedDialectName: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenPaywall?: (tier: 'plus' | 'premium') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  user,
  onOpenAuth,
  selectedDialectName,
  isCollapsed,
  setIsCollapsed,
  onOpenPaywall
}) => {
  const isStaff = user?.role === 'staff';

  const navItems = [
    {
      id: 'landing' as ActiveView,
      label: 'Public Showcase',
      sublabel: 'Landing & Dialect Voting',
      icon: Compass,
      badge: null
    },
    {
      id: 'tutor' as ActiveView,
      label: 'The Vera Tutor',
      sublabel: 'Full-Screen AI Immersion',
      icon: MessageSquareCode,
      badge: 'LIVE AI'
    },
    {
      id: 'dashboard' as ActiveView,
      label: 'Learning Path',
      sublabel: 'Modules & Boss Fights',
      icon: Globe,
      badge: null
    },
    {
      id: 'arcade' as ActiveView,
      label: 'Arcade Arena',
      sublabel: 'Rapid Fire & Debate',
      icon: Flame,
      badge: 'PVP'
    },
    {
      id: 'vocab' as ActiveView,
      label: 'Vocab Vault',
      sublabel: 'Saved Native Slang',
      icon: BookOpen,
      badge: null
    },
    {
      id: 'store' as ActiveView,
      label: 'Vera Marketplace',
      sublabel: 'Plans & Energy Zaps',
      icon: Crown,
      badge: null
    },
    ...(isStaff ? [{
      id: 'admin' as ActiveView,
      label: 'Admin Dashboard',
      sublabel: 'Staff Telemetry & Control',
      icon: ShieldCheck,
      badge: 'STAFF VIP'
    }] : [])
  ];

  return (
    <aside
      className={`relative z-40 flex flex-col bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 transition-all duration-300 select-none ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        {!isCollapsed ? (
          <div
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Languages size={20} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                Vera <span className="text-emerald-400 font-extrabold text-sm tracking-normal uppercase">Global</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Neural Dialect Engine</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setActiveView('landing')}
            className="mx-auto w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-md flex items-center justify-center"
            title="Vera WorldWide"
          >
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Languages size={20} className="text-emerald-400" />
            </div>
          </button>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        <div className={`px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? 'NAV' : 'Navigation Areas'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id !== 'landing' && !user && (!isStaff || item.id !== 'admin')) {
                  onOpenAuth();
                  return;
                }
                setActiveView(item.id);
              }}
              className={`w-full flex items-center rounded-2xl transition-all text-left relative group ${
                isCollapsed ? 'justify-center p-3.5' : 'px-4 py-3.5 gap-3.5'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div
                className={`p-2 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'bg-slate-900 text-slate-400 group-hover:text-white group-hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold truncate text-white">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                          item.badge === 'STAFF'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{item.sublabel}</p>
                </div>
              )}

              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-l-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              )}
            </button>
          );
        })}

        {/* Selected Dialect Track card */}
        {!isCollapsed && (
          <div className="pt-6">
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Active Dialect Track
            </div>
            <div
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                  return;
                }
                setActiveView('tutor');
              }}
              className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:border-emerald-500/40 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Globe size={14} className="text-emerald-400" />
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {selectedDialectName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {isStaff ? '🔓 All released & unreleased tracks unlocked.' : 'Ready for immersion roleplay.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User & Access Footprint */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div
              onClick={onOpenAuth}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-900 cursor-pointer border border-transparent hover:border-slate-800 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{user?.displayName || 'Guest Learner'}</span>
                  {isStaff && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold font-mono">
                      STAFF
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'Tap to switch account'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 py-1 bg-slate-900/60 rounded-xl text-[10px] text-slate-400">
              <span
                onClick={() => onOpenPaywall && onOpenPaywall('premium')}
                className="flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-300 hover:text-white cursor-pointer transition-colors"
                title="Tap to manage or upgrade plan"
              >
                <Crown size={12} className={user?.subscription === 'premium' ? 'text-amber-400' : 'text-emerald-400'} />
                Tier: <span className="text-white font-bold">{user?.subscription?.toUpperCase() || 'FREE'}</span>
                {user?.subscription === 'free' && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 rounded font-bold">
                    UPGRADE
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <Flame size={12} /> {user?.streak || 1}d Streak
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-10 h-10 mx-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 hover:bg-slate-800 transition-colors"
            title={user?.email || 'Account'}
          >
            <User size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};
