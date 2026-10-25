import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquareCode,
  Megaphone,
  BarChart3,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  AlertTriangle,
  Lock,
  Crown,
  Key,
  Globe2,
  Vote,
  RefreshCw,
  Send,
  Loader2,
  Filter,
  Check
} from 'lucide-react';
import { UserProfile, ChatMessage, LanguageVote, GlobalAnnouncement, UserRole, SubscriptionTier } from '../types';
import {
  subscribeToLiveChats,
  subscribeToUsers,
  updateUserRole,
  updateUserSubscription,
  updateAnnouncement,
  promoteToAdminWithPasscode
} from '../firebase';
import { generateAnnouncementCopy } from '../services/gemini';

interface AdminDashboardProps {
  currentUser: UserProfile | null;
  votes: Record<string, LanguageVote>;
  announcement: GlobalAnnouncement | null;
  onRefreshVotes: () => void;
  onExitAdmin: () => void;
}

type AdminTab = 'users' | 'monitoring' | 'announcements' | 'analytics';

const ADMIN_SECRET = 'VERA_MASTER';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  votes,
  announcement,
  onRefreshVotes,
  onExitAdmin
}) => {
  // Gatekeeper state: If user is already Staff or Owner, automatically grant access; otherwise require master key
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    currentUser?.role === 'staff' || currentUser?.email === 'dyanecayer1821@gmail.com'
  );
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [currentTab, setCurrentTab] = useState<AdminTab>('monitoring');

  // Live Firestore State
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [chatFeed, setChatFeed] = useState<ChatMessage[]>([]);

  // Filters
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('All');

  // Announcement Editor State
  const [announcementContent, setAnnouncementContent] = useState(announcement?.content || '');
  const [announcementActive, setAnnouncementActive] = useState(announcement?.active ?? true);
  const [announcementType, setAnnouncementType] = useState<'info' | 'sale' | 'alert'>(announcement?.type || 'sale');
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isDraftingAI, setIsDraftingAI] = useState(false);
  const [announcementSuccessNote, setAnnouncementSuccessNote] = useState('');

  // Update local announcement state when prop changes
  useEffect(() => {
    if (announcement) {
      setAnnouncementContent(announcement.content);
      setAnnouncementActive(announcement.active);
      setAnnouncementType(announcement.type || 'info');
    }
  }, [announcement]);

  // Subscribe to real-time chats & users once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    // Proactively clean any legacy mock placeholders from previous sessions
    try {
      const purgeMockIds = ['staff_master_01', 'user_sophia_88', 'user_tariq_09', 'user_clara_41'];
      const purgeMockEmails = ['alex.staff@veraworldwide.com', 'sophia.v@gmail.com', 'tariq.nasser@outlook.com', 'clara.m@yahoo.com'];
      
      const rawUsers = localStorage.getItem('vera_users_cache');
      if (rawUsers) {
        const parsed: UserProfile[] = JSON.parse(rawUsers);
        const filtered = parsed.filter(u => !purgeMockIds.includes(u.uid) && !purgeMockEmails.includes(u.email?.toLowerCase()));
        if (filtered.length !== parsed.length) {
          localStorage.setItem('vera_users_cache', JSON.stringify(filtered));
        }
      }

      const rawChats = localStorage.getItem('vera_chats_cache');
      if (rawChats) {
        const parsedChats: ChatMessage[] = JSON.parse(rawChats);
        const filteredChats = parsedChats.filter(c => !purgeMockIds.includes(c.userId) && !purgeMockEmails.includes(c.userEmail?.toLowerCase() || ''));
        if (filteredChats.length !== parsedChats.length) {
          localStorage.setItem('vera_chats_cache', JSON.stringify(filteredChats));
        }
      }
    } catch {}

    const unsubChats = subscribeToLiveChats((chats) => {
      setChatFeed(chats);
    });

    const unsubUsers = subscribeToUsers((users) => {
      setUserList(users);
    });

    return () => {
      unsubChats();
      unsubUsers();
    };
  }, [isAuthenticated]);

  const handleMasterAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passwordInput.trim().toUpperCase();
    if (clean === 'VERA2026' || clean === 'VERA_MASTER' || clean === 'VERA_ADMIN' || passwordInput === ADMIN_SECRET || currentUser?.role === 'staff' || currentUser?.email === 'dyanecayer1821@gmail.com') {
      setIsAuthenticated(true);
      setAuthError('');
      promoteToAdminWithPasscode(clean || 'VERA2026', currentUser);
    } else {
      setAuthError('Access Denied: Invalid Master Authorization Key. (Use VERA2026 or VERA_MASTER)');
    }
  };

  // Toggle user role
  const handleToggleStaffRole = async (targetUser: UserProfile) => {
    const newRole: UserRole = targetUser.role === 'staff' ? 'user' : 'staff';
    await updateUserRole(targetUser.uid, newRole);
  };

  // Change user subscription
  const handleChangeSubscription = async (targetUser: UserProfile, tier: SubscriptionTier) => {
    await updateUserSubscription(targetUser.uid, tier);
  };

  // Announcement submission
  const handleSaveAnnouncement = async () => {
    await updateAnnouncement({
      content: announcementContent,
      active: announcementActive,
      type: announcementType
    });
    setAnnouncementSuccessNote('Global broadcast pushed to all active clients!');
    setTimeout(() => setAnnouncementSuccessNote(''), 4000);
  };

  // AI Announcement drafting
  const handleDraftWithAI = async () => {
    if (!aiPromptInput.trim()) return;
    setIsDraftingAI(true);
    try {
      const generated = await generateAnnouncementCopy(aiPromptInput.trim());
      setAnnouncementContent(generated);
      setAnnouncementActive(true);
    } catch (err) {
      console.warn("AI drafting error", err);
    } finally {
      setIsDraftingAI(false);
    }
  };

  // Calculate analytics
  const totalUsers = userList.length;
  const staffCount = userList.filter((u) => u.role === 'staff').length;
  const tierCounts = {
    free: userList.filter((u) => u.subscription === 'free').length,
    plus: userList.filter((u) => u.subscription === 'plus').length,
    premium: userList.filter((u) => u.subscription === 'premium').length
  };
  const mrrEstimation = tierCounts.plus * 4.99 + tierCounts.premium * 9.99;
  const totalVotesCount = Object.values(votes).reduce((sum, v) => sum + (v.count || 0), 0);

  // Filtered lists
  const filteredUsers = userList.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      u.uid.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredChats = chatFeed.filter((chat) => {
    const matchesLanguage = selectedLanguageFilter === 'All' || chat.language === selectedLanguageFilter;
    const matchesQuery =
      chat.message.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
      chat.response.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
      (chat.userEmail && chat.userEmail.toLowerCase().includes(chatSearchQuery.toLowerCase()));
    return matchesLanguage && matchesQuery;
  });

  const uniqueLanguages = Array.from(new Set(chatFeed.map((c) => c.language).filter(Boolean)));

  // If locked, show security console gate
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 shadow-lg shadow-indigo-500/10">
            <Lock size={32} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Vera Master Telemetry</h2>
            <p className="text-xs text-slate-400 mt-1">
              Restricted to Internal Access personnel. Enter administrative master key to proceed.
            </p>
          </div>

          <form onSubmit={handleMasterAuth} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-center font-mono text-sm tracking-widest text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />

            {authError && <p className="text-xs text-rose-400 font-mono font-bold">{authError}</p>}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-lg shadow-indigo-600/30 transition-all"
            >
              Authenticate Master OS
            </button>
          </form>

          <div className="pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Authorized staff & workspace owner access only</span>
          </div>

          <button
            onClick={onExitAdmin}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Exit back to Showcase
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Admin Top Header */}
      <header className="h-16 px-6 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
              Vera Master Console <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">LIVE TELEMETRY</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">User RBAC • Chat Feeds • Announcements • Analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExitAdmin}
            className="text-xs text-slate-400 hover:text-white font-mono px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            Exit Console
          </button>
        </div>
      </header>

      {/* Admin Navigation Sub-Tabs */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-6 py-2.5 flex items-center justify-between overflow-x-auto shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTab('monitoring')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentTab === 'monitoring'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <MessageSquareCode size={15} />
            <span>Tutor Monitoring Feed</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900 font-mono text-cyan-300">
              {chatFeed.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Users size={15} />
            <span>User Management & RBAC</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900 font-mono text-emerald-300">
              {userList.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('announcements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentTab === 'announcements'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Megaphone size={15} />
            <span>Global Announcements</span>
            {announcementActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <BarChart3 size={15} />
            <span>Platform Analytics & Votes</span>
          </button>
        </div>

        <button
          onClick={onRefreshVotes}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* ============================================================== */}
        {/* TAB 1: MONITORING LIVE CHAT FEED */}
        {/* ============================================================== */}
        {currentTab === 'monitoring' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Search user queries, responses, or emails..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Filter size={14} className="text-slate-500" />
                <span className="text-xs text-slate-400 font-mono">Dialect:</span>
                <select
                  value={selectedLanguageFilter}
                  onChange={(e) => setSelectedLanguageFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-bold"
                >
                  <option value="All">All Dialects</option>
                  {uniqueLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Feed List */}
            <div className="space-y-4">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition-all shadow-md space-y-3"
                >
                  {/* Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {chat.language}
                      </span>
                      <span className="text-slate-400">{chat.userEmail || chat.userId}</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      {chat.fluencyScore && (
                        <span className="text-cyan-400 font-bold">
                          Fluency: {chat.fluencyScore}%
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Student Inquiry */}
                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                      Learner Prompt:
                    </span>
                    <p className="text-sm text-white font-medium">{chat.message}</p>
                  </div>

                  {/* Vera Tutor Response */}
                  <div className="bg-gradient-to-r from-slate-950 via-slate-950 to-indigo-950/20 p-3.5 rounded-2xl border border-indigo-950/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles size={11} /> Vera Tutor Generation:
                      </span>
                      {chat.feedback && (
                        <span className="text-[11px] text-slate-400 italic">
                          Feedback: "{chat.feedback}"
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{chat.response}</p>
                  </div>
                </div>
              ))}

              {filteredChats.length === 0 && (
                <div className="p-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 text-slate-500">
                  <MessageSquareCode size={36} className="mx-auto mb-3 opacity-40 text-slate-600" />
                  <p className="text-sm font-semibold">No conversational queries match your filter criteria.</p>
                  <p className="text-xs text-slate-600 mt-1">Try sending a message in The Vera Tutor to see it stream here live.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: USER MANAGEMENT & ROLE-BASED ACCESS CONTROL */}
        {/* ============================================================== */}
        {currentTab === 'users' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header info card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Users size={20} className="text-emerald-400" /> User Directory & "Internal Access" Provisioning
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Users flagged with <strong>Internal Access</strong> (Staff status) can unlock all languages and dialects,
                  including upcoming unreleased alpha branches (e.g., Moroccan Darija).
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400">Total Registered:</span>
                <span className="font-bold text-white">{userList.length}</span>
                <span className="text-slate-600 mx-1">|</span>
                <span className="text-emerald-400 font-bold">{staffCount} Staff/Owner</span>
                <span className="text-slate-600 mx-1">|</span>
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>0 Placeholders</span>
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search user UID, email, or name..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* User List Table */}
            <div className="grid grid-cols-1 gap-4">
              {filteredUsers.map((u) => {
                const isStaff = u.role === 'staff';
                const isOwner = u.email === 'dyanecayer1821@gmail.com' || (currentUser?.email && u.email === currentUser.email);

                return (
                  <div
                    key={u.uid}
                    className={`p-5 rounded-3xl transition-all shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border ${
                      isOwner
                        ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20 shadow-amber-950/20'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 border relative ${
                          isOwner
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-inner'
                            : isStaff
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {u.displayName ? u.displayName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                        {isOwner && (
                          <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 rounded-full p-0.5 shadow-sm">
                            <Crown size={12} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white truncate">{u.displayName || 'Vera Learner'}</span>
                          {isOwner ? (
                            <span className="text-[10px] font-mono font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <Crown size={10} /> PRIMARY OWNER (YOU)
                            </span>
                          ) : isStaff ? (
                            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                              STAFF ACCESS
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-400 font-mono truncate">{u.email}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">UID: {u.uid}</p>
                      </div>
                    </div>

                    {/* Controls: Role Toggle & Subscription Switcher */}
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      {/* Subscription Switcher */}
                      <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                        <span className="text-[10px] font-mono uppercase text-slate-500 px-1">Tier:</span>
                        {(['free', 'plus', 'premium'] as SubscriptionTier[]).map((tier) => (
                          <button
                            key={tier}
                            onClick={() => handleChangeSubscription(u, tier)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                              u.subscription === tier
                                ? tier === 'premium'
                                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                                  : tier === 'plus'
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                  : 'bg-slate-700 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {tier.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      {/* Staff Role Switcher */}
                      <button
                        onClick={() => handleToggleStaffRole(u)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-2 border ${
                          isStaff
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                      >
                        {isStaff ? (
                          <>
                            <ShieldCheck size={16} />
                            <span>INTERNAL ACCESS: ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <Lock size={14} className="text-slate-500" />
                            <span>GRANT INTERNAL ACCESS</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 text-slate-500">
                  <Users size={36} className="mx-auto mb-3 opacity-40 text-slate-600" />
                  <p className="text-sm font-semibold">No accounts found matching your query.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: GLOBAL ANNOUNCEMENTS */}
        {/* ============================================================== */}
        {currentTab === 'announcements' && (
          <div className="space-y-6 animate-in fade-in">
            {/* AI Copywriting Tool */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles size={16} /> Gemini AI Headline Synthesizer
              </div>
              <p className="text-xs text-slate-300">
                Draft a high-conversion broadcast headline in seconds. Type your update topic and let Vera generate professional marketing copy.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  placeholder="e.g. Flash 40% discount on Premium tier for the weekend..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleDraftWithAI}
                  disabled={isDraftingAI || !aiPromptInput.trim()}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
                >
                  {isDraftingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  <span>Draft Announcement</span>
                </button>
              </div>
            </div>

            {/* Broadcast Form */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white">Live Broadcast Payload</h3>
                {announcementSuccessNote && (
                  <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 size={14} /> {announcementSuccessNote}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  Banner Text Content
                </label>
                <textarea
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  rows={3}
                  placeholder="Type message broadcast to all users..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Type Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                  Broadcast Category / Theme
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'sale', label: 'Sale / Flash Promo', desc: 'Emerald gradient with shimmer' },
                    { id: 'info', label: 'Platform Update', desc: 'Indigo gradient with announcement icon' },
                    { id: 'alert', label: 'Critical Alert', desc: 'Amber gradient with caution icon' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAnnouncementType(t.id as any)}
                      className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all text-left ${
                        announcementType === t.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div>{t.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Toggle & Push Button */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setAnnouncementActive(!announcementActive)}
                  className="flex items-center gap-3 text-xs font-bold font-mono text-slate-300"
                >
                  {announcementActive ? (
                    <ToggleRight size={32} className="text-emerald-400" />
                  ) : (
                    <ToggleLeft size={32} className="text-slate-600" />
                  )}
                  <span>Status: {announcementActive ? 'ACTIVE (BROADCASTING)' : 'INACTIVE (HIDDEN)'}</span>
                </button>

                <button
                  onClick={handleSaveAnnouncement}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  Deploy Global Announcement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: PLATFORM ANALYTICS & LIVE VOTE BREAKDOWN */}
        {/* ============================================================== */}
        {currentTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">Total Users</div>
                <div className="text-3xl font-black text-white">{totalUsers}</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-1">100% cloud sync</div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">Estimated MRR</div>
                <div className="text-3xl font-black text-emerald-400">${mrrEstimation.toFixed(2)}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">Subscription base</div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">Total Sessions Logged</div>
                <div className="text-3xl font-black text-cyan-400">{chatFeed.length}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">Firestore 'chats'</div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">Community Ballots</div>
                <div className="text-3xl font-black text-indigo-400">{totalVotesCount.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">Dialect release poll</div>
              </div>
            </div>

            {/* Split Breakdown Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscription Breakdown */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-400" /> Subscription Tier Breakdown
                  </h3>
                  <span className="text-xs font-mono text-slate-400">Paid Conversion</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono font-bold mb-1">
                      <span className="text-slate-300">Vera Free</span>
                      <span className="text-slate-400">{tierCounts.free} ({totalUsers > 0 ? Math.round((tierCounts.free / totalUsers) * 100) : 0}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-slate-600 rounded-full"
                        style={{ width: `${totalUsers > 0 ? (tierCounts.free / totalUsers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono font-bold mb-1">
                      <span className="text-emerald-300">Vera Plus ($4.99/mo)</span>
                      <span className="text-emerald-400">{tierCounts.plus} ({totalUsers > 0 ? Math.round((tierCounts.plus / totalUsers) * 100) : 0}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${totalUsers > 0 ? (tierCounts.plus / totalUsers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono font-bold mb-1">
                      <span className="text-amber-300">Vera Premium ($9.99/mo)</span>
                      <span className="text-amber-400">{tierCounts.premium} ({totalUsers > 0 ? Math.round((tierCounts.premium / totalUsers) * 100) : 0}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${totalUsers > 0 ? (tierCounts.premium / totalUsers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Dialect Votes Breakdown */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Vote size={18} className="text-indigo-400" /> Live Dialect Ballot Standings
                  </h3>
                  <span className="text-xs font-mono text-indigo-400 font-bold">Weekly Drop Queue</span>
                </div>

                <div className="space-y-4">
                  {Object.entries(votes).map(([key, v]) => {
                    const percentage = totalVotesCount > 0 ? Math.round((v.count / totalVotesCount) * 100) : 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span>{v.flag}</span>
                            <span>{v.dialect}</span>
                          </span>
                          <span className="text-indigo-400 font-bold">
                            {v.count.toLocaleString()} votes ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
