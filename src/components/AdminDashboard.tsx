import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Globe,
  Megaphone,
  MessageSquare,
  Crown,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';
import {
  UserProfile,
  LanguageVote,
  GlobalAnnouncement,
  ChatMessage,
  SubscriptionTier,
  DialectStatus
} from '../types';
import {
  subscribeToUsers,
  subscribeToLiveChats,
  updateUserSubscription,
  updateUserRole,
  deleteUserByAdmin,
  updateAnnouncement
} from '../firebase';
import { DIALECT_TRACKS, setDialectStatusOverride } from '../data/languages';
import { generateAnnouncementCopy } from '../services/gemini';

interface AdminDashboardProps {
  currentUser: UserProfile | null;
  votes: Record<string, LanguageVote>;
  announcement: GlobalAnnouncement | null;
  onRefreshVotes: () => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  votes,
  announcement,
  onExitAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'dialects' | 'banner' | 'logs'>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialectList, setDialectList] = useState(DIALECT_TRACKS);

  // Announcement state
  const [bannerText, setBannerText] = useState(announcement?.content || '');
  const [bannerActive, setBannerActive] = useState(announcement?.active ?? true);
  const [bannerType, setBannerType] = useState<'info' | 'sale' | 'alert'>(announcement?.type || 'sale');
  const [bannerSavedMsg, setBannerSavedMsg] = useState('');

  useEffect(() => {
    const unsubUsers = subscribeToUsers((list) => setUsers(list));
    const unsubChats = subscribeToLiveChats((list) => setChats(list));
    return () => {
      unsubUsers();
      unsubChats();
    };
  }, []);

  useEffect(() => {
    if (announcement) {
      setBannerText(announcement.content);
      setBannerActive(announcement.active);
      setBannerType(announcement.type || 'sale');
    }
  }, [announcement]);

  // Solo-Owner Metrics
  const plusCount = users.filter((u) => u.subscription === 'plus').length;
  const unlimitedCount = users.filter(
    (u) => (u.subscription === 'premium' || u.subscription === 'unlimited') && u.role !== 'staff'
  ).length;
  const estimatedMrr = (plusCount * 4.99 + unlimitedCount * 9.99).toFixed(2);
  const activeDialectsCount = dialectList.filter((d) => d.status === 'active').length;
  const votingDialectsCount = dialectList.filter((d) => d.status === 'coming_soon').length;

  const handleTierChange = async (uid: string, tier: SubscriptionTier) => {
    await updateUserSubscription(uid, tier);
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, subscription: tier } : u)));
  };

  const handleRoleToggle = async (u: UserProfile) => {
    const nextRole = u.role === 'staff' ? 'user' : 'staff';
    await updateUserRole(u.uid, nextRole);
    setUsers((prev) => prev.map((item) => (item.uid === u.uid ? { ...item, role: nextRole } : item)));
  };

  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm('Delete this user account permanently?')) return;
    await deleteUserByAdmin(uid);
    setUsers((prev) => prev.filter((u) => u.uid !== uid));
  };

  const handleDialectStatusChange = (dialectId: string, newStatus: DialectStatus) => {
    const updated = setDialectStatusOverride(dialectId, newStatus);
    setDialectList([...updated]);
  };

  const handleSaveBanner = async () => {
    await updateAnnouncement({
      content: bannerText,
      active: bannerActive,
      type: bannerType
    });
    setBannerSavedMsg('✓ Banner updated live across the app!');
    setTimeout(() => setBannerSavedMsg(''), 3000);
  };

  const handleDraftBannerIdea = async () => {
    const idea = await generateAnnouncementCopy();
    setBannerText(idea);
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        {/* Top Owner Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">Solo-Owner Command Center</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black uppercase">
                  Owner Root Access
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Logged in as {currentUser?.email || 'dyanecayer1821@gmail.com'} • Manage signups, tiers, dialects, and banners in one place.
              </p>
            </div>
          </div>

          <button
            onClick={onExitAdmin}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft size={15} /> Back to App
          </button>
        </header>

        {/* Quick KPI Strip (What You Actually Need to Know) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Registered Users</span>
            <div className="text-3xl font-black text-white mt-1">{users.length}</div>
            <span className="text-xs text-emerald-400 font-semibold">
              {plusCount} Plus • {unlimitedCount} Unlimited
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Est. Monthly Revenue</span>
            <div className="text-3xl font-black text-emerald-400 mt-1">${estimatedMrr}</div>
            <span className="text-xs text-slate-400">Plus ($4.99) + Unlimited ($9.99)</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Dialect Tracks</span>
            <div className="text-3xl font-black text-cyan-400 mt-1">{activeDialectsCount} Active</div>
            <span className="text-xs text-slate-400">{votingDialectsCount} in Voting Pool</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recorded Tutor Turns</span>
            <div className="text-3xl font-black text-violet-400 mt-1">{chats.length}</div>
            <span className="text-xs text-slate-400">1-on-1 local teacher sessions</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'overview', label: '1. Quick Overview', icon: Sparkles },
            { id: 'users', label: `2. Signups & Tiers (${users.length})`, icon: Users },
            { id: 'dialects', label: `3. Dialect Vault (${dialectList.length})`, icon: Globe },
            { id: 'banner', label: '4. Top Announcement Banner', icon: Megaphone },
            { id: 'logs', label: `5. Tutor Session Logs (${chats.length})`, icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Users size={18} className="text-emerald-400" /> Recent User Signups
              </h2>
              <div className="space-y-2.5">
                {users.slice(0, 6).map((u) => (
                  <div
                    key={u.uid}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{u.displayName || 'Learner'}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-black uppercase text-emerald-400">
                        {u.subscription}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 text-xs font-bold">
                        {u.cefrLevel || 'A1'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('users')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
              >
                Manage All Users & Subscriptions ➔
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Globe size={18} className="text-cyan-400" /> Community Voting Leaderboard
              </h2>
              <div className="space-y-2.5">
                {Object.values(votes)
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 6)
                  .map((v) => (
                    <div
                      key={v.languageId}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{v.flag}</span>
                        <div>
                          <div className="text-sm font-bold text-white">{v.dialect}</div>
                          <div className="text-[11px] text-slate-400">{v.region}</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black text-xs">
                        {v.count} votes
                      </span>
                    </div>
                  ))}
              </div>
              <button
                onClick={() => setActiveTab('dialects')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
              >
                Promote Any Dialect to Active Live ➔
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: USERS & SUBSCRIPTION TIER CONTROL */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-white">User Signups & Instant Tier Control</h2>
                <p className="text-xs text-slate-400">
                  Upgrade any user to Plus or Unlimited/Premium, grant Staff access, or delete accounts.
                </p>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search email or name..."
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <div
                  key={u.uid}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-sm">{u.displayName || 'Learner'}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-cyan-300">
                        Level {u.cefrLevel || 'A1'}
                      </span>
                      {u.role === 'staff' && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                          Staff
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {u.email} • ⚡ {u.sparks || 150} Sparks • 🔥 {u.streak || 1}d streak
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {(['free', 'plus', 'premium'] as SubscriptionTier[]).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => handleTierChange(u.uid, tier)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase cursor-pointer transition-all ${
                          u.subscription === tier
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {tier === 'premium' ? 'Unlimited ($9.99)' : tier === 'plus' ? 'Plus ($4.99)' : 'Free'}
                      </button>
                    ))}

                    <button
                      onClick={() => handleRoleToggle(u)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                    >
                      {u.role === 'staff' ? 'Revoke Staff' : 'Make Staff'}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(u.uid)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 cursor-pointer"
                      title="Delete user"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 1-CLICK DIALECT VAULT MANAGER */}
        {activeTab === 'dialects' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-black text-white">Dialect Release & Vault Switchboard</h2>
              <p className="text-xs text-slate-400">
                Click any status button to immediately move a dialect between <strong>Live Active</strong>,{' '}
                <strong>Voting Ballot</strong>, or <strong>Upcoming Vault</strong>.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {dialectList.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{d.flag}</span>
                    <div>
                      <div className="text-sm font-black text-white">{d.dialect}</div>
                      <div className="text-[11px] text-slate-400">{d.region}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(
                      [
                        { id: 'active', label: 'Live' },
                        { id: 'coming_soon', label: 'Ballot' },
                        { id: 'future_pool', label: 'Vault' }
                      ] as { id: DialectStatus; label: string }[]
                    ).map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleDialectStatusChange(d.id, st.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black cursor-pointer transition-all ${
                          d.status === st.id
                            ? st.id === 'active'
                              ? 'bg-emerald-500 text-slate-950'
                              : st.id === 'coming_soon'
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-violet-500 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GLOBAL ANNOUNCEMENT BANNER */}
        {activeTab === 'banner' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 max-w-2xl">
            <h2 className="text-lg font-black text-white">Global Top Announcement Banner</h2>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Banner Message</label>
              <textarea
                rows={3}
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bannerActive}
                  onChange={(e) => setBannerActive(e.target.checked)}
                />
                <span>Show Banner at Top of App</span>
              </label>

              <button
                onClick={handleDraftBannerIdea}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} /> Auto-Draft Promo Copy
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveBanner}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Publish Live Banner
              </button>
              {bannerSavedMsg && <span className="text-xs font-bold text-emerald-400">{bannerSavedMsg}</span>}
            </div>
          </div>
        )}

        {/* TAB 5: TUTOR SESSION LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-lg font-black text-white">Recent 1-on-1 Tutor Conversations</h2>
            {chats.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                No tutor messages logged yet in this session—send a message in the Tutor tab to see it appear live here!
              </p>
            ) : (
              <div className="space-y-3">
                {chats.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-emerald-400">{c.language}</span>
                      <span>{c.userEmail}</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong className="text-white">Learner:</strong> {c.message}
                    </p>
                    <p className="text-xs text-cyan-300">
                      <strong className="text-white">Local Teacher:</strong> {c.response}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
