import React, { useState } from 'react';
import {
  MessageSquareCode,
  Globe2,
  Sparkles,
  Vote,
  CheckCircle2,
  ChevronRight,
  Flame,
  Zap,
  Crown,
  Volume2,
  Lock,
  ArrowRight,
  Brain,
  BrainCircuit,
  ShieldCheck,
  Star,
  Users,
  Compass
} from 'lucide-react';
import { DialectTrack, LanguageVote, UserProfile } from '../types';
import { DIALECT_TRACKS } from '../data/languages';
import { SupportedNativeLanguage, t } from '../utils/i18n';
import { LanguagePairSelector } from './LanguagePairSelector';

interface LandingPageProps {
  onStartTutorWithDialect: (dialect: DialectTrack) => void;
  onOpenVoting: () => void;
  onOpenAdmin: () => void;
  votes: Record<string, LanguageVote>;
  onCastVote: (dialectId: string) => void;
  user: UserProfile | null;
  nativeLang: SupportedNativeLanguage;
  onNativeLangChange: (lang: SupportedNativeLanguage) => void;
  selectedDialect: DialectTrack;
  onDialectChange: (dialect: DialectTrack) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenPaywall: (tier: 'plus' | 'premium') => void;
  onOpenPlacement: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTutorWithDialect,
  onOpenVoting,
  onOpenAdmin,
  votes,
  onCastVote,
  user,
  nativeLang,
  onNativeLangChange,
  selectedDialect,
  onDialectChange,
  onOpenAuth,
  onOpenPaywall,
  onOpenPlacement
}) => {
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [hasVotedFor, setHasVotedFor] = useState<string | null>(null);

  const isStaff = user?.role === 'staff';

  const handleProtectedTutor = (track: DialectTrack) => {
    if (!user) {
      onOpenAuth('signup');
      return;
    }
    onStartTutorWithDialect(track);
  };

  const handleVoteClick = (id: string) => {
    if (!user) {
      onOpenAuth('signup');
      return;
    }
    onCastVote(id);
    setHasVotedFor(id);
  };

  const continents = ['All', 'North America', 'South America', 'Europe', 'Africa', 'Asia', 'Middle East'];

  // Filter dialects
  const filteredTracks = DIALECT_TRACKS.filter((track) => {
    if (selectedContinent === 'All') return true;
    return track.continent === selectedContinent;
  });

  const activeTracks = filteredTracks.filter((t) => t.status === 'active');
  const upcomingTracks = filteredTracks.filter((t) => t.status === 'coming_soon');

  // Audio preview helper using Web Speech Synthesis
  const handlePlaySample = (track: DialectTrack) => {
    if (playingAudioId === track.id) {
      window.speechSynthesis?.cancel();
      setPlayingAudioId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(track.samplePhrase);
      
      if (track.id.startsWith('es')) utterance.lang = 'es-MX';
      else if (track.id.startsWith('fr')) utterance.lang = 'fr-FR';
      else if (track.id.startsWith('ja')) utterance.lang = 'ja-JP';
      else if (track.id.startsWith('ar')) utterance.lang = 'ar-SA';
      else if (track.id.startsWith('it')) utterance.lang = 'it-IT';
      else if (track.id.startsWith('pt')) utterance.lang = 'pt-BR';
      else if (track.id.startsWith('zh')) utterance.lang = 'zh-HK';
      else if (track.id.startsWith('de')) utterance.lang = 'de-DE';

      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);

      setPlayingAudioId(track.id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const totalVotesCount = Object.values(votes).reduce((sum, v) => sum + (v.count || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* Live Dialect Immersion Status Ribbon - Non-repetitive contextual ticker */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950 border-b border-slate-800/60 px-4 md:px-8 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <p className="font-mono text-[11px] text-slate-300 truncate">
            <span className="text-emerald-400 font-bold uppercase tracking-wider">Live Immersion Lab:</span>{' '}
            <span className="text-white font-semibold">{selectedDialect.dialect}</span>{' '}
            <span className="text-slate-400">({selectedDialect.region})</span> •{' '}
            <span className="text-slate-400 hidden sm:inline">{selectedDialect.description}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 shrink-0">
          <span className="hidden md:inline px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
            CEFR A1–Master
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-semibold uppercase">
            {selectedDialect.level || 'All Levels'}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 px-6 max-w-7xl mx-auto overflow-hidden">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-lg shadow-emerald-500/10">
            <Sparkles size={14} className="text-emerald-400 animate-pulse" />
            <span>{t('hero_badge', nativeLang)}</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
            {t('hero_title_1', nativeLang)} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              {t('hero_title_2', nativeLang)}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            {t('hero_subtitle', nativeLang)}
          </p>

          {/* Interactive Language Setup Card (I speak -> I want to learn) */}
          <div className="pt-2 flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Set Your Track:</span>
              <LanguagePairSelector
                currentNativeLang={nativeLang}
                onNativeLangChange={onNativeLangChange}
                selectedDialect={selectedDialect}
                onDialectChange={onDialectChange}
              />
            </div>

            {/* Diagnostic Level Quiz Prompt */}
            <button
              onClick={onOpenPlacement}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-semibold shadow-md shadow-cyan-500/10 transition-all group"
            >
              <BrainCircuit size={15} className="text-cyan-400 group-hover:rotate-12 transition-transform shrink-0" />
              <span>Not sure of your level? <strong>Take the 2-Minute Diagnostic Level Quiz</strong></span>
              <ArrowRight size={13} className="text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>

          {/* App Store & Google Play Availability Pill */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available for iOS Safari PWA, Android Google Play & Web</span>
            </div>
          </div>

          {/* Action CTAs: Explicit Sign Up and Log In */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (user) {
                  onStartTutorWithDialect(selectedDialect);
                } else {
                  onOpenAuth('signup');
                }
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              <MessageSquareCode size={18} />
              <span>{user ? t('hero_cta_tutor', nativeLang) : t('hero_cta_signup', nativeLang)}</span>
              <ArrowRight size={16} />
            </button>

            {!user ? (
              <button
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm tracking-wide transition-all hover:border-slate-600 flex items-center justify-center gap-2"
              >
                <span>{t('hero_cta_login', nativeLang)}</span>
              </button>
            ) : null}

            <a
              href="#coming-soon-voting"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium text-sm tracking-wide transition-all hover:border-slate-700 flex items-center justify-center gap-2"
            >
              <Vote size={18} className="text-emerald-400" />
              <span>{t('hero_cta_vote', nativeLang)}</span>
            </a>
          </div>

          {/* Social Proof metrics */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-2xl font-black text-white">12+</div>
              <div className="text-xs text-slate-400">Native Dialect Models</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-2xl font-black text-emerald-400">98.4%</div>
              <div className="text-xs text-slate-400">Native Phrasing Rating</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-2xl font-black text-cyan-400">{totalVotesCount.toLocaleString()}</div>
              <div className="text-xs text-slate-400">Community Dialect Votes</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-2xl font-black text-amber-400">Adaptive</div>
              <div className="text-xs text-slate-400">Real-Time Fluency Feedback</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dialect Explorer Section */}
      <section id="active-dialects" className="py-16 px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
              <Globe2 size={14} /> Global Language Catalog
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Active Regional Tracks
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Each track is trained on distinct phonetics, colloquial idioms, and high-velocity scenario prompts.
            </p>
          </div>

          {/* Continent Filter */}
          <div className="flex flex-wrap gap-2">
            {continents.map((continent) => (
              <button
                key={continent}
                onClick={() => setSelectedContinent(continent)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedContinent === continent
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {continent}
              </button>
            ))}
          </div>
        </div>

        {/* Active Dialect Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTracks.map((track) => (
            <div
              key={track.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl p-1 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                      {track.flag}
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                        {track.dialect}
                      </h3>
                      <p className="text-xs text-slate-400">{track.region}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md uppercase">
                    {track.level}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {track.description}
                </p>

                {/* Sample phrase audio card */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Sample Dialogue • {track.persona}
                    </span>
                    <button
                      onClick={() => handlePlaySample(track)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        playingAudioId === track.id
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse'
                          : 'bg-slate-900 text-slate-400 hover:text-white border-slate-700'
                      }`}
                      title="Listen to sample audio"
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 italic mb-1">
                    "{track.samplePhrase}"
                  </p>
                  <p className="text-[11px] text-slate-400">
                    → {track.translation}
                  </p>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="pt-2">
                <button
                  onClick={() => handleProtectedTutor(track)}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-emerald-500/10"
                >
                  {user ? <MessageSquareCode size={14} /> : <Lock size={14} />}
                  <span>{user ? `Start Tutoring in ${track.dialect}` : `Sign In to Unlock ${track.dialect}`}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* "Coming Soon" Voting System Section */}
      <section id="coming-soon-voting" className="py-20 px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="p-8 md:p-12 rounded-[36px] bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          {/* Ambient light */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-bold mb-3">
                <Vote size={14} className="text-indigo-400" />
                <span>COMMUNITY RELEASES • WEEKLY CYCLE</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                The Coming Soon Dialect Ballot
              </h2>
              <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
                We release upcoming regional dialects based entirely on active community ballots. Vote for your desired dialect
                or unlock priority preview tracks with Vera Premium.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-center shrink-0 min-w-[200px]">
              <div className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold mb-1">
                Total Ballots Logged
              </div>
              <div className="text-3xl font-black text-white">{totalVotesCount.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 mt-1">Live Firestore Counter</div>
            </div>
          </div>

          {/* Voting Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTracks.map((track) => {
              const voteRecord = votes[track.id];
              const count = voteRecord?.count || 0;
              const isSelected = hasVotedFor === track.id;

              return (
                <div
                  key={track.id}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-xl shadow-indigo-500/20'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div>
                    {/* Top flag and count */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{track.flag}</span>
                        <div>
                          <h3 className="text-lg font-black text-white">{track.dialect}</h3>
                          <span className="text-xs text-slate-400">{track.region}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-indigo-400">{count.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">votes</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {track.description}
                    </p>

                    <div className="text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 text-slate-300 italic mb-4">
                      "{track.samplePhrase}"
                    </div>
                  </div>

                  {/* Vote Trigger */}
                  <div>
                    <button
                      onClick={() => handleVoteClick(track.id)}
                      className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                          : 'bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 size={14} className="text-white" />
                          <span>Ballot Cast for {track.dialect}</span>
                        </>
                      ) : (
                        <>
                          <Vote size={14} />
                          <span>Cast Vote for {track.dialect}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subscription Tiers Section */}
      <section id="pricing-plans" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold mb-2">
            {t('pricing_badge', nativeLang)}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            {t('pricing_title', nativeLang)}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {t('pricing_subtitle', nativeLang)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">Starter</div>
              <h3 className="text-2xl font-black text-white mb-2">{t('free_plan', nativeLang)}</h3>
              <div className="text-4xl font-black text-white mb-6">
                {t('free_price', nativeLang)}
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>5 Conversational energy credits daily</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Access to standard released dialects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Community dialect release voting rights</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => user ? onStartTutorWithDialect(selectedDialect) : onOpenAuth('signup')}
              className="mt-8 w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              {user ? 'Active Free Plan' : t('free_cta', nativeLang)}
            </button>
          </div>

          {/* Plus Tier */}
          <div className="p-8 rounded-3xl bg-slate-900 border-2 border-emerald-500 relative flex flex-col justify-between shadow-2xl shadow-emerald-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase font-mono tracking-widest px-3 py-1 rounded-full">
              {t('popular_badge', nativeLang)}
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-2">Conversationalist</div>
              <h3 className="text-2xl font-black text-white mb-2">{t('plus_plan', nativeLang)}</h3>
              <div className="text-4xl font-black text-white mb-6">
                {t('plus_price', nativeLang)}
              </div>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>15 Conversational energy credits daily</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>High-pressure Boss Scenarios unlocked</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Grammar correction & native feedback engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Audio synthesis with regional native accents</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenPaywall('plus')}
              className="mt-8 w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/30 active:scale-95"
            >
              {t('plus_cta', nativeLang)}
            </button>
          </div>

          {/* Premium Tier */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/40 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold mb-2">Total Immersion</div>
              <h3 className="text-2xl font-black text-white mb-2">{t('premium_plan', nativeLang)}</h3>
              <div className="text-4xl font-black text-white mb-6">
                {t('premium_price', nativeLang)}
              </div>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Crown size={16} className="text-amber-400 shrink-0" />
                  <span className="font-bold text-white">UNLIMITED conversational energy</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>All upcoming alpha preview dialects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>Priority Neural AI reasoning speed</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>Vocab Clash Arena & multiplayer debate tracks</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenPaywall('premium')}
              className="mt-8 w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-all shadow-md shadow-indigo-600/30 active:scale-95"
            >
              {t('premium_cta', nativeLang)}
            </button>
          </div>
        </div>

        {/* App Store & In-App Purchase Guarantee Strip */}
        <div className="mt-12 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck size={16} /> 256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span className="text-white font-bold">
              Apple App Store & Google Play Ready
            </span>
            <span>•</span>
            <span className="text-slate-400">
              7-Day Free Trial Included
            </span>
            <span>•</span>
            <span className="text-slate-400">
              Instant 1-Click Cancellation
            </span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-2xl mx-auto">
            All subscriptions include automatic receipt generation, instant cloud syncing across devices,
            and complete access to unscripted native dialect immersion.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800 text-center">
        <h2 className="text-3xl font-black text-white mb-12">Proof of Fluency</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              "Other language apps spent 6 months teaching me how to say 'the apple is red'. Vera got me ordering
              at street taco stands in Mexico City without looking like a lost tourist in 2 weeks."
            </p>
            <div className="text-xs font-bold text-white">David K. — CDMX Immersion</div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              "The dialect focus is the killer feature. Standard French sounded so rigid when I arrived in Paris.
              Vera’s Parisian track taught me actual verlan and conversational rhythm."
            </p>
            <div className="text-xs font-bold text-white">Elena R. — Paris Tech Lead</div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              "Voted for Moroccan Darija and got staff preview access. The phonetic accuracy and cultural hints
              are unlike anything else on the market."
            </p>
            <div className="text-xs font-bold text-white">Marcus T. — Language Enthusiast</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe2 size={16} className="text-emerald-400" />
            <span className="font-bold text-slate-400">Vera WorldWide Inc.</span>
            <span>• The Neural Dialect Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#coming-soon-voting" className="hover:text-emerald-400 transition-colors">
              Dialect Ballot
            </a>
            <span
              onClick={() => {
                // Secret trigger: clicking copyright 3 times opens Admin terminal
                const now = Date.now();
                const last = (window as any).__lastSecretClick || 0;
                const count = ((window as any).__secretClickCount || 0) + 1;
                (window as any).__lastSecretClick = now;
                (window as any).__secretClickCount = (now - last < 1500) ? count : 1;
                if ((window as any).__secretClickCount >= 3) {
                  (window as any).__secretClickCount = 0;
                  onOpenAdmin();
                }
              }}
              className="cursor-default select-none transition-colors hover:text-slate-400"
              title="Vera Global Architecture"
            >
              © {new Date().getFullYear()} All Rights Reserved (v2.4)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
