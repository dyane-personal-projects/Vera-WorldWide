import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Languages, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Flame, 
  Zap, 
  Sparkles,
  RefreshCcw
} from 'lucide-react';
import { UserProfile, LanguageVote, GlobalAnnouncement } from '../types';
import { subscribeToUsers, deleteUserByAdmin, updateUserRole } from '../firebase';
import { DIALECT_TRACKS } from '../data/languages';

interface AdminDashboardProps {
  currentUser: UserProfile | null;
  votes: Record<string, LanguageVote>;
  announcement: GlobalAnnouncement | null;
  onRefreshVotes: () => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onExitAdmin
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'dialects'>('users');
  const [dialectsState, setDialectsState] = useState(DIALECT_TRACKS);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToUsers((list) => {
      setUsers(list);
    });
    return () => unsub();
  }, []);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (confirm(`Are you sure you want to permanently delete user: ${email}?`)) {
      await deleteUserByAdmin(uid);
      setUsers(users.filter(u => u.uid !== uid));
      showNotice(`Successfully deleted user ${email}`);
    }
  };

  const handleToggleDialectStatus = (dialectId: string) => {
    setDialectsState(prev => prev.map(d => {
      if (d.id === dialectId) {
        const nextStatus = d.status === 'active' ? 'coming_soon' : 'active';
        showNotice(`Dialect "${d.dialect}" status changed to: ${nextStatus}`);
        return { ...d, status: nextStatus as any };
      }
      return d;
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Header */}
      <header className="px-6 py-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="font-black text-white text-lg tracking-tight">Vera Admin OS</h1>
            <p className="text-xs text-slate-400">Owner Access: <span className="text-emerald-400 font-semibold">{currentUser?.email || 'Admin'}</span></p>
          </div>
        </div>

        <button
          onClick={onExitAdmin}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all"
        >
          <ArrowLeft size={15} />
          <span>Exit Admin</span>
        </button>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Sparkles size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Tab Nav */}
      <div className="px-6 mt-6 flex gap-3 border-b border-slate-800/80 pb-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users size={16} />
          <span>User Management ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dialects')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'dialects'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Languages size={16} />
          <span>Dialect Storage & Voting ({dialectsState.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {activeTab === 'users' && (
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-white text-sm uppercase tracking-wider">Registered Learners & Staff</h3>
              <span className="text-xs text-slate-400 font-semibold">{users.length} Total Users</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">User Profile</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Subscription</th>
                    <th className="p-4">Sparks / Streak</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{u.displayName || 'Learner'}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          u.role === 'staff' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {u.subscription || 'free'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3 font-bold text-slate-200">
                          <span className="flex items-center gap-1 text-amber-400"><Sparkles size={13} /> {u.sparks ?? 100}</span>
                          <span className="flex items-center gap-1 text-rose-400"><Flame size={13} /> {u.streak ?? 1}d</span>
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleDeleteUser(u.uid, u.email)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold transition-all inline-flex items-center gap-1"
                          title="Permanently Delete User"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'dialects' && (
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800 overflow-hidden shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-white text-base tracking-tight">Dialect Storage & 1-Click Release Manager</h3>
                <p className="text-xs text-slate-400 mt-0.5">Toggle dialects between Active (Live on platform) and Coming Soon (Voting Pool).</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dialectsState.map((d) => (
                <div key={d.id} className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{d.flag}</span>
                      <div>
                        <h4 className="font-black text-white text-sm">{d.dialect}</h4>
                        <p className="text-[11px] text-slate-400">{d.region}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      d.status === 'active' 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {d.status === 'active' ? 'Active' : 'Voting Pool'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleDialectStatus(d.id)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      d.status === 'active'
                        ? 'bg-slate-900 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                    }`}
                  >
                    {d.status === 'active' ? (
                      <>
                        <EyeOff size={14} />
                        <span>Move to Voting Pool</span>
                      </>
                    ) : (
                      <>
                        <Eye size={14} />
                        <span>Promote to Active Drop</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
