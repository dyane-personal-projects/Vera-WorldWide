// src/App.tsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  getOrCreateUserProfile,
  subscribeToVotes,
  subscribeToAnnouncement,
  castLanguageVote,
  updateUserSubscription,
  logOut
} from './firebase';
import { ActiveView, DialectTrack, GlobalAnnouncement, LanguageVote, LessonNode, SubscriptionTier, UserProfile } from './types';
import { DIALECT_TRACKS } from './data/languages';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { LandingPage } from './components/LandingPage';
import { TutorChat } from './components/TutorChat';
import { AdminDashboard } from './components/AdminDashboard';
import { LearningPath } from './components/LearningPath';
import { Arcade } from './components/Arcade';
import { VocabVault } from './components/VocabVault';
import { Store } from './components/Store';
import { PlacementQuiz } from './components/PlacementQuiz';
import { AuthModal } from './components/AuthModal';
import { SecretAdminModal } from './components/SecretAdminModal';
import { PaywallModal } from './components/PaywallModal';
import { SupportBubble } from './components/SupportBubble';
import { InteractiveLessonModal } from './components/InteractiveLessonModal';
import { LegalComplianceModal } from './components/LegalComplianceModal';
import { SupportedNativeLanguage, getSavedNativeLanguage, setSavedNativeLanguage } from './utils/i18n';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedDialect, setSelectedDialect] = useState<DialectTrack>(DIALECT_TRACKS[0]);
  const [nativeLang, setNativeLang] = useState<SupportedNativeLanguage>(getSavedNativeLanguage());

  // Firestore sync state
  const [votes, setVotes] = useState<Record<string, LanguageVote>>({});
  const [announcement, setAnnouncement] = useState<GlobalAnnouncement | null>(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallInitialTier, setPaywallInitialTier] = useState<'plus' | 'premium'>('premium');
  const [activeInteractiveLesson, setActiveInteractiveLesson] = useState<LessonNode | null>(null);
  const [isSecretAdminOpen, setIsSecretAdminOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | 'account' | null>(null);

  const handleOpenAuth = (mode?: 'login' | 'signup') => {
    setAuthModalMode(mode || 'signup');
    setIsAuthModalOpen(true);
  };

  const handleOpenPaywall = (tier: 'plus' | 'premium' = 'premium') => {
    setPaywallInitialTier(tier);
    setIsPaywallOpen(true);
  };

  const handleNativeLangChange = (lang: SupportedNativeLanguage) => {
    setNativeLang(lang);
    setSavedNativeLanguage(lang);
  };

  // Secret Admin Shortcut: Ctrl/Cmd + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsSecretAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (window.location.search.includes('admin=true') || window.location.hash.includes('admin')) {
      if (userProfile?.role === 'staff') {
        setActiveView('admin');
      } else {
        setIsSecretAdminOpen(true);
      }
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userProfile]);

  // 1. Listen for Firebase Auth & V1 Stripe Checkout Redirects (?success=true&tier=...)
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      try {
        const profile = await getOrCreateUserProfile(currentUser);
        if (profile && window.location.search.includes('success=true')) {
          const urlParams = new URLSearchParams(window.location.search);
          const purchasedTier = (urlParams.get('tier') as SubscriptionTier) || 'premium';
          await updateUserSubscription(profile.uid, purchasedTier);
          profile.subscription = purchasedTier;
          profile.energy = purchasedTier === 'plus' ? 15 : 999999;
          window.history.replaceState(null, '', window.location.pathname);
          setActiveView('dashboard');
        }
        setUserProfile(profile);
      } catch (err) {
        console.warn('Auth initialization error', err);
      }
    });

    const handleAuthEvent = (e: any) => {
      setUserProfile(e.detail || null);
    };
    window.addEventListener('vera_auth_changed', handleAuthEvent);

    return () => {
      unsubAuth();
      window.removeEventListener('vera_auth_changed', handleAuthEvent);
    };
  }, []);

  // 2. Intercept Legal/Privacy/Terms view switches into the Compliance Modal
  useEffect(() => {
    if (activeView === 'privacy') {
      setLegalModalTab('privacy');
      setActiveView('landing');
    } else if (activeView === 'terms' || activeView === 'legal') {
      setLegalModalTab('terms');
      setActiveView('landing');
    } else if (activeView === 'support') {
      setLegalModalTab('account');
      setActiveView('landing');
    }
  }, [activeView]);

  // 3. Gatekeeper: Protected views require authentication
  useEffect(() => {
    if (!userProfile && activeView !== 'landing') {
      setActiveView('landing');
      handleOpenAuth('login');
    }
  }, [userProfile, activeView]);

  // 4. Subscribe to Firestore Votes & Announcements
  useEffect(() => {
    const unsubVotes = subscribeToVotes((updatedVotes) => setVotes(updatedVotes));
    const unsubAnnouncement = subscribeToAnnouncement((ann) => {
      setAnnouncement(ann);
      setAnnouncementDismissed(false);
    });
    return () => {
      unsubVotes();
      unsubAnnouncement();
    };
  }, []);

  const handleStartTutorWithDialect = (dialect: DialectTrack) => {
    if (!userProfile) {
      handleOpenAuth('signup');
      return;
    }
    setSelectedDialect(dialect);
    // Waterfall onboarding check from V1: if user has no CEFR level yet, offer placement or jump straight in
    setActiveView('tutor');
  };

  // Enforce 3-Tier Subscription & Energy Rules on Lesson/Boss/Arcade Launch
  const handleStartLesson = (lesson: LessonNode) => {
    if (!userProfile) {
      handleOpenAuth('signup');
      return;
    }

    const isUnlimited =
      userProfile.subscription === 'premium' ||
      userProfile.subscription === 'unlimited' ||
      userProfile.role === 'staff';
    const isPlusOrAbove = isUnlimited || userProfile.subscription === 'plus';

    if (lesson.type === 'boss' && !isPlusOrAbove) {
      handleOpenPaywall('plus');
      return;
    }

    if (lesson.type === 'rapid_fire' && !isPlusOrAbove) {
      handleOpenPaywall('premium');
      return;
    }

    const zapCost = lesson.cost || (lesson.type === 'boss' ? 3 : lesson.type === 'rapid_fire' ? 2 : 1);
    if (!isUnlimited && (userProfile.energy ?? 5) < zapCost) {
      handleOpenPaywall(userProfile.subscription === 'free' ? 'plus' : 'premium');
      return;
    }

    setActiveInteractiveLesson(lesson);
  };

  const handleCastVote = async (dialectId: string) => {
    if (!userProfile) {
      handleOpenAuth('signup');
      return;
    }
    const weight =
      userProfile.subscription === 'premium' || userProfile.subscription === 'unlimited' || userProfile.role === 'staff'
        ? 3
        : userProfile.subscription === 'plus'
        ? 2
        : 1;
    await castLanguageVote(dialectId, weight);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {activeView !== 'landing' && (
        <div className="hidden md:flex h-full shrink-0 animate-in fade-in">
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            user={userProfile}
            onOpenAuth={() => handleOpenAuth('signup')}
            selectedDialectName={selectedDialect.dialect}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            onOpenPaywall={handleOpenPaywall}
          />
        </div>
      )}

      {activeView !== 'landing' && isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 h-full bg-slate-950 border-r border-slate-800 flex flex-col">
            <Sidebar
              activeView={activeView}
              setActiveView={(v) => {
                setActiveView(v);
                setIsMobileSidebarOpen(false);
              }}
              user={userProfile}
              onOpenAuth={() => {
                handleOpenAuth('signup');
                setIsMobileSidebarOpen(false);
              }}
              selectedDialectName={selectedDialect.dialect}
              isCollapsed={false}
              setIsCollapsed={() => {}}
              onOpenPaywall={(tier) => {
                handleOpenPaywall(tier);
                setIsMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {!announcementDismissed && (
          <AnnouncementBanner
            announcement={announcement}
            onDismiss={() => setAnnouncementDismissed(true)}
          />
        )}

        <Navbar
          activeView={activeView}
          setActiveView={setActiveView}
          user={userProfile}
          nativeLang={nativeLang}
          onNativeLangChange={handleNativeLangChange}
          selectedDialect={selectedDialect}
          onDialectChange={setSelectedDialect}
          onOpenAuth={handleOpenAuth}
          onLogOut={async () => {
            await logOut();
            setUserProfile(null);
            setActiveView('landing');
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenPlacement={() => setActiveView('placement')}
          onOpenPaywall={handleOpenPaywall}
        />

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {activeView === 'landing' && (
            <LandingPage
              onStartTutorWithDialect={handleStartTutorWithDialect}
              onOpenVoting={() => {
                const el = document.getElementById('coming-soon-voting');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenAdmin={() => {
                if (userProfile?.role === 'staff') {
                  setActiveView('admin');
                } else {
                  setIsSecretAdminOpen(true);
                }
              }}
              votes={votes}
              onCastVote={handleCastVote}
              user={userProfile}
              nativeLang={nativeLang}
              onNativeLangChange={handleNativeLangChange}
              selectedDialect={selectedDialect}
              onDialectChange={setSelectedDialect}
              onOpenAuth={handleOpenAuth}
              onOpenPaywall={handleOpenPaywall}
              onOpenPlacement={() => setActiveView('placement')}
            />
          )}

          {activeView === 'tutor' && (
            <TutorChat
              initialDialect={selectedDialect}
              user={userProfile}
              onBackToLanding={() => setActiveView('landing')}
              onOpenAdmin={() => {
                if (userProfile?.role === 'staff') {
                  setActiveView('admin');
                } else {
                  setIsSecretAdminOpen(true);
                }
              }}
              onRewardClaimed={(updated) => {
                setUserProfile(updated);
                localStorage.setItem('vera_active_user', JSON.stringify(updated));
              }}
            />
          )}

          {activeView === 'dashboard' && (
            <LearningPath
              user={userProfile}
              selectedDialect={selectedDialect}
              onStartLesson={handleStartLesson}
              onOpenStore={() => handleOpenPaywall('premium')}
              onOpenArcade={() => setActiveView('arcade')}
              onOpenVocab={() => setActiveView('vocab')}
              onOpenPlacement={() => setActiveView('placement')}
              onRewardClaimed={(updated) => {
                setUserProfile(updated);
                localStorage.setItem('vera_active_user', JSON.stringify(updated));
              }}
            />
          )}

          {activeView === 'arcade' && (
            <Arcade
              user={userProfile}
              selectedDialect={selectedDialect}
              onStartMatch={handleStartLesson}
              onOpenStore={() => setActiveView('store')}
            />
          )}

          {activeView === 'vocab' && <VocabVault selectedDialect={selectedDialect} />}

          {activeView === 'store' && (
            <Store
              user={userProfile}
              onUpdateUser={(updated) => setUserProfile(updated)}
              onBackToDashboard={() => setActiveView('dashboard')}
              onOpenPaywall={handleOpenPaywall}
            />
          )}

          {activeView === 'placement' && (
            <PlacementQuiz
              user={userProfile}
              selectedDialect={selectedDialect}
              onUpdateUserLevel={(lvl) => {
                if (userProfile) {
                  const updated = { ...userProfile, cefrLevel: lvl };
                  setUserProfile(updated);
                  localStorage.setItem('vera_active_user', JSON.stringify(updated));
                }
              }}
              onComplete={() => setActiveView('dashboard')}
            />
          )}

          {activeView === 'admin' && (
            <AdminDashboard
              currentUser={userProfile}
              votes={votes}
              announcement={announcement}
              onRefreshVotes={() => {}}
              onExitAdmin={() => setActiveView('landing')}
            />
          )}
        </div>

        {/* Persistent App Store Legal & Account Trigger Pill (Bottom Left) */}
        <button
          onClick={() => setLegalModalTab('account')}
          className="fixed bottom-4 left-4 z-20 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-400 hover:text-white transition-all shadow-lg"
        >
          Privacy • Terms • Restore
        </button>

        <SupportBubble user={userProfile} />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={userProfile}
        onUpdateCurrentUser={(updated) => {
          setUserProfile(updated);
          if (updated && activeView === 'landing') {
            setActiveView('tutor');
          }
        }}
        onSwitchToAdminOS={() => {
          setIsAuthModalOpen(false);
          setActiveView('admin');
        }}
        initialMode={authModalMode}
      />

      <SecretAdminModal
        isOpen={isSecretAdminOpen}
        onClose={() => setIsSecretAdminOpen(false)}
        currentUser={userProfile}
        onAdminActivated={(adminUser) => {
          setUserProfile(adminUser);
          setActiveView('admin');
        }}
      />

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        user={userProfile}
        initialTier={paywallInitialTier}
        onSubscriptionUpgraded={(updated) => {
          setUserProfile(updated);
        }}
        onOpenAuth={handleOpenAuth}
      />

      <LegalComplianceModal
        isOpen={Boolean(legalModalTab)}
        initialTab={legalModalTab || 'privacy'}
        onClose={() => setLegalModalTab(null)}
        user={userProfile}
        onUserDeleted={() => {
          setUserProfile(null);
          setActiveView('landing');
        }}
        onUserUpdated={(updated) => setUserProfile(updated)}
      />

      <InteractiveLessonModal
        isOpen={Boolean(activeInteractiveLesson)}
        onClose={() => setActiveInteractiveLesson(null)}
        lesson={activeInteractiveLesson}
        dialect={selectedDialect}
        user={userProfile}
        onLessonComplete={(sparksReward, lessonId) => {
          if (userProfile) {
            const completed = Array.from(
              new Set([...(userProfile.completedLessons || []), ...(lessonId ? [lessonId] : [])])
            );
            const isUnlimited =
              userProfile.subscription === 'premium' ||
              userProfile.subscription === 'unlimited' ||
              userProfile.role === 'staff';
            const isPlusOrAbove = isUnlimited || userProfile.subscription === 'plus';
            const multiplier = isPlusOrAbove ? 2 : 1;
            const zapCost =
              activeInteractiveLesson?.cost ||
              (activeInteractiveLesson?.type === 'boss' ? 3 : activeInteractiveLesson?.type === 'rapid_fire' ? 2 : 1);

            const updated: UserProfile = {
              ...userProfile,
              sparks: (userProfile.sparks || 100) + sparksReward * multiplier,
              streak: (userProfile.streak || 1) + 1,
              energy: isUnlimited ? 999999 : Math.max(0, (userProfile.energy ?? 5) - zapCost),
              lastEnergyRefillAt: Date.now(),
              completedLessons: completed
            };
            setUserProfile(updated);
            localStorage.setItem('vera_active_user', JSON.stringify(updated));
            if (lessonId) {
              try {
                const dialectKey = `vera_completed_${userProfile.uid || 'guest'}_${selectedDialect.id}`;
                const existing = JSON.parse(localStorage.getItem(dialectKey) || '[]');
                localStorage.setItem(dialectKey, JSON.stringify(Array.from(new Set([...existing, lessonId]))));
              } catch {}
            }
          }
        }}
        onOpenStore={() => handleOpenPaywall('premium')}
      />
    </div>
  );
}