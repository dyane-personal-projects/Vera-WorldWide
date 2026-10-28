import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  Volume2,
  Sparkles,
  PhoneCall,
  Globe,
  CheckCircle2,
  BookOpen,
  PenTool,
  Eye,
  MessageSquare,
  Users,
  MapPin
} from 'lucide-react';
import { DialectTrack, UserProfile } from '../types';
import { DIALECT_TRACKS } from '../data/languages';
import {
  getTutorRosterForDialect,
  pickRandomTutorForDialect,
  TutorPersona
} from '../data/tutorPersonas';
import {
  generateTutorReply,
  playNativeAudio,
  stopAllAudio
} from '../services/gemini';
import {
  getTransliteration,
  isNonLatinScript,
  shouldShowTransliteration
} from '../utils/transliteration';
import { logChatToFirestore } from '../firebase';
import { LiveVoiceCallModal } from './LiveVoiceCallModal';

interface TutorChatProps {
  initialDialect: DialectTrack;
  user: UserProfile | null;
  onBackToLanding: () => void;
  onOpenAdmin: () => void;
  onRewardClaimed?: (updatedUser: UserProfile) => void;
}

interface TutorTurnMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  englishTranslation?: string;
  feedback?: string;
  rephraseSuggestion?: string;
  fluencyScore?: number;
  slangTip?: string;
  slangMeaning?: string;
  suggestedReplies?: string[];
  personaId?: string;
  personaName?: string;
  voiceGender?: 'male' | 'female';
}

type PracticeMode = 'conversation' | 'street_coach' | 'reading_script' | 'writing_dictation';

export const TutorChat: React.FC<TutorChatProps> = ({
  initialDialect,
  user,
  onRewardClaimed
}) => {
  const [selectedTrack, setSelectedTrack] = useState<DialectTrack>(initialDialect);
  const [activePersona, setActivePersona] = useState<TutorPersona>(() =>
    pickRandomTutorForDialect(initialDialect.id)
  );
  const [cefrLevel, setCefrLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>(() => {
    const raw = (user?.cefrLevel || 'A1').toUpperCase();
    if (raw.includes('C1')) return 'C1';
    if (raw.includes('B2')) return 'B2';
    if (raw.includes('B1')) return 'B1';
    if (raw.includes('A2')) return 'A2';
    return 'A1';
  });
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('street_coach');
  const [messages, setMessages] = useState<TutorTurnMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [showTransliteration, setShowTransliteration] = useState<boolean>(true);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dialectRoster = getTutorRosterForDialect(selectedTrack.id);
  const isNonLatin = isNonLatinScript(selectedTrack.id);

  // Sync when navbar dialect changes -> pick a fresh real local teacher from that country!
  useEffect(() => {
    setSelectedTrack(initialDialect);
    const freshTeacher = pickRandomTutorForDialect(initialDialect.id);
    setActivePersona(freshTeacher);
  }, [initialDialect.id]);

  // Whenever Teacher, Level, or Practice Mode changes, start a fresh live 1-on-1 session with that exact teacher's voice!
  useEffect(() => {
    stopAllAudio();
    setPlayingAudioId(null);

    const shouldShow =
      practiceMode === 'reading_script'
        ? false
        : shouldShowTransliteration(selectedTrack.id, cefrLevel);
    setShowTransliteration(shouldShow);

    const greetingObj =
      activePersona.levelGreetings[cefrLevel] || activePersona.levelGreetings.A1;

    const firstMsg: TutorTurnMessage = {
      id: 'greeting_' + activePersona.id + '_' + cefrLevel,
      role: 'assistant',
      content: greetingObj.native,
      englishTranslation: greetingObj.english,
      feedback: greetingObj.pedagogyNote,
      slangTip: activePersona.slang?.[0]?.term,
      slangMeaning: activePersona.slang?.[0]?.meaning,
      suggestedReplies: greetingObj.quickReplies,
      personaId: activePersona.id,
      personaName: activePersona.name,
      voiceGender: activePersona.voiceGender
    };

    setMessages([firstMsg]);

    // Auto-speak greeting using THIS exact teacher's gender-locked voice
    const timer = setTimeout(() => {
      speakWithPersona(
        greetingObj.native,
        firstMsg.id,
        cefrLevel === 'A1' ? 0.92 : 1.0,
        activePersona
      );
    }, 220);

    return () => clearTimeout(timer);
  }, [activePersona.id, cefrLevel, practiceMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /**
   * STRICT PERSONA-LOCKED AUDIO PLAYER:
   * Always passes the exact teacher's `id` and `voiceGender` ('male' or 'female')
   * so Badr/Youssef/Karim/Tarek/Diego/Mateo/Lucas/Kenji NEVER speak with a female voice!
   */
  const speakWithPersona = (
    text: string,
    msgId: string,
    rate = speechRate,
    personaToUse: TutorPersona = activePersona
  ) => {
    if (playingAudioId === msgId) {
      stopAllAudio();
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(msgId);
    playNativeAudio({
      text,
      dialectId: personaToUse.dialectId || selectedTrack.id,
      voiceName: personaToUse.recommendedVoice,
      voiceGender: personaToUse.voiceGender,
      personaId: personaToUse.id,
      rate,
      onEnd: () => setPlayingAudioId(null),
      onError: () => setPlayingAudioId(null)
    });
  };

  const handleSelectTeacherFromRoster = (teacher: TutorPersona) => {
    stopAllAudio();
    setPlayingAudioId(null);
    setActivePersona(teacher);
  };

  const handleSendMessage = async (overrideText?: string) => {
    const textToSend = (overrideText ?? inputText).trim();
    if (!textToSend || isLoading) return;

    stopAllAudio();
    setInputText('');

    const userTurn: TutorTurnMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: textToSend
    };

    const updatedHistory = [...messages, userTurn];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      const modeInstruction =
        practiceMode === 'reading_script'
          ? 'Focus on helping the student read and decode native script words.'
          : practiceMode === 'writing_dictation'
          ? 'Coach the student on spelling, word order, and writing naturally in this dialect.'
          : 'Teach the student how real locals in your city actually speak on the street and in cafés.';

      const res = await generateTutorReply({
        userMessage: textToSend,
        dialectName: `${selectedTrack.dialect} (${activePersona.city}, ${activePersona.country})`,
        persona: `${activePersona.name} (${activePersona.voiceGender} local teacher from ${activePersona.city}). ${activePersona.bio}`,
        culturalNote: `${activePersona.specialty}. ${modeInstruction}`,
        level: cefrLevel,
        chatHistory: updatedHistory.map((m) => ({
          role: m.role,
          content: m.content
        }))
      });

      const assistantMsgId = 'tutor_' + Date.now();
      const assistantTurn: TutorTurnMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: res.reply,
        englishTranslation: res.englishTranslation,
        feedback: res.feedback,
        rephraseSuggestion: res.rephraseSuggestion,
        fluencyScore: res.fluencyScore,
        slangTip: res.slangTip,
        slangMeaning: res.slangMeaning,
        suggestedReplies: res.suggestedReplies,
        personaId: activePersona.id,
        personaName: activePersona.name,
        voiceGender: activePersona.voiceGender
      };

      setMessages((prev) => [...prev, assistantTurn]);

      // Log to Firestore / Admin Feed & reward +5 Sparks per conversational turn
      logChatToFirestore({
        userId: user?.uid || 'guest',
        userEmail: user?.email || 'learner@veraworldwide.com',
        message: textToSend,
        response: res.reply,
        language: `${selectedTrack.dialect} (${activePersona.name})`,
        fluencyScore: res.fluencyScore,
        feedback: res.feedback
      });

      if (user && onRewardClaimed) {
        onRewardClaimed({
          ...user,
          sparks: (user.sparks || 150) + 5
        });
      }

      // Speak the reply aloud with the active teacher's exact gender-matched voice
      speakWithPersona(res.reply, assistantMsgId, speechRate, activePersona);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMic = () => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech recognition works best in Chrome or Safari.');
      return;
    }
    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = selectedTrack.id.startsWith('ar') ? 'ar-MA' : selectedTrack.id;
      setIsListeningMic(true);
      rec.onresult = (e: any) => {
        const transcript = e.results?.[0]?.[0]?.transcript || '';
        setIsListeningMic(false);
        if (transcript) {
          handleSendMessage(transcript);
        }
      };
      rec.onerror = () => setIsListeningMic(false);
      rec.onend = () => setIsListeningMic(false);
      rec.start();
    } catch {
      setIsListeningMic(false);
    }
  };

  const latestAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* TOP BAR 1: REAL LOCAL TEACHER ROSTER & LEVEL CONTROLS */}
      <header className="px-4 sm:px-6 py-3 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        {/* Active Local Teacher Identity Card */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activePersona.avatarBg} border flex items-center justify-center text-2xl shadow-lg relative shrink-0`}
          >
            <span>{activePersona.avatarEmoji}</span>
            <span
              className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 absolute -bottom-0.5 -right-0.5"
              title="Connected Live"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-white text-base tracking-tight">
                {activePersona.name}
              </h2>
              <span className="text-xs font-serif text-emerald-400 font-bold">
                ({activePersona.nativeName})
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                  activePersona.voiceGender === 'male'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}
              >
                {activePersona.voiceGender === 'male' ? '♂ Male Voice' : '♀ Female Voice'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <MapPin size={12} className="text-emerald-400 shrink-0" />
              <span>
                Live from <strong className="text-slate-200">{activePersona.city}</strong> •{' '}
                {activePersona.specialty}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: CEFR Level, Speed, Arabizi Toggle & Live Voice Call */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CEFR Level Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['A1', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setCefrLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  cefrLevel === lvl
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Set teaching level to ${lvl}`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Speech Speed Toggle */}
          <button
            onClick={() => setSpeechRate((r) => (r === 1.0 ? 0.8 : 1.0))}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
          >
            {speechRate === 1.0 ? '⚡ 1.0x Natural' : '🐢 0.8x Slow'}
          </button>

          {/* Phonetics / Arabizi Toggle */}
          {isNonLatin && (
            <button
              onClick={() => setShowTransliteration(!showTransliteration)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                showTransliteration
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              🔤 Phonetics: {showTransliteration ? 'ON' : 'OFF'}
            </button>
          )}

          {/* Live Voice Call Button */}
          <button
            onClick={() => {
              stopAllAudio();
              setIsLiveCallOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <PhoneCall size={14} />
            <span>Live Call</span>
          </button>
        </div>
      </header>

      {/* TOP BAR 2: SWITCH LOCAL TEACHER ROSTER + 4-SKILL LEARNING MODE */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-950 border-b border-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Local Teachers in This Country */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0">
            <Users size={13} className="text-cyan-400" /> Local Teachers in {activePersona.country}:
          </span>
          {dialectRoster.map((teacher) => {
            const isSelected = teacher.id === activePersona.id;
            return (
              <button
                key={teacher.id}
                onClick={() => handleSelectTeacherFromRoster(teacher)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <span>{teacher.avatarEmoji}</span>
                <span>{teacher.name.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400">({teacher.city.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>

        {/* 4-Skill Mode Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'street_coach', label: 'Street Coach', icon: Sparkles },
            { id: 'conversation', label: 'Free Roleplay', icon: MessageSquare },
            { id: 'reading_script', label: 'Read Script', icon: Eye },
            { id: 'writing_dictation', label: 'Write & Spell', icon: PenTool }
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setPracticeMode(m.id as PracticeMode)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  practiceMode === m.id
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon size={12} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN 1-ON-1 TEACHING STREAM */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const translit =
            isNonLatin && showTransliteration
              ? getTransliteration(msg.content, selectedTrack.id)
              : '';
          const isPlayingThis = playingAudioId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[82%] rounded-3xl p-5 shadow-xl ${
                  isUser
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900/95 border border-slate-800 text-slate-100'
                }`}
              >
                {/* Teacher Header + Audio Controls */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{activePersona.avatarEmoji}</span>
                      <span className="text-xs font-black text-emerald-400">
                        {msg.personaName || activePersona.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {activePersona.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          speakWithPersona(msg.content, msg.id, 1.0, activePersona)
                        }
                        className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                          isPlayingThis
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        <Volume2 size={14} className={isPlayingThis ? 'animate-bounce' : ''} />
                        <span>{isPlayingThis ? 'Stop' : 'Listen'}</span>
                      </button>
                      <button
                        onClick={() =>
                          speakWithPersona(msg.content, msg.id, 0.78, activePersona)
                        }
                        className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 cursor-pointer"
                        title="Listen slowly (0.75x)"
                      >
                        🐢 Slow
                      </button>
                    </div>
                  </div>
                )}

                {/* Native Script Spoken Reply */}
                <p className={`text-lg sm:text-xl leading-relaxed ${isUser ? 'font-bold' : 'font-black text-white'}`}>
                  {msg.content}
                </p>

                {/* Dual-Script Phonetics (Arabizi / Romaji) */}
                {translit && (
                  <p
                    className={`text-xs sm:text-sm font-mono mt-2 ${
                      isUser ? 'text-slate-900/80' : 'text-cyan-300'
                    }`}
                  >
                    🔤 {translit}
                  </p>
                )}

                {/* English Meaning */}
                {!isUser && msg.englishTranslation && (
                  <p className="text-sm text-slate-300 mt-2.5 pt-2.5 border-t border-slate-800/80 italic">
                    "{msg.englishTranslation}"
                  </p>
                )}

                {/* Real-Life Teacher Coaching Breakdown */}
                {!isUser && (msg.feedback || msg.rephraseSuggestion || msg.slangTip) && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-2.5 text-xs">
                    {msg.feedback && (
                      <div className="flex items-start gap-2">
                        <Sparkles size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-black text-emerald-400 uppercase tracking-wider">
                            {activePersona.name.split(' ')[0]}'s Teaching Note:{' '}
                          </span>
                          <span className="text-slate-200 leading-relaxed">{msg.feedback}</span>
                        </div>
                      </div>
                    )}

                    {msg.rephraseSuggestion && (
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
                        <div>
                          <span className="font-black text-cyan-400 uppercase tracking-wider block">
                            How We Say It Here in {activePersona.city.split(' ')[0]}:
                          </span>
                          <span className="text-white font-bold text-sm">{msg.rephraseSuggestion}</span>
                          {isNonLatin && showTransliteration && (
                            <span className="block text-[11px] font-mono text-cyan-300">
                              🔤 {getTransliteration(msg.rephraseSuggestion, selectedTrack.id)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            speakWithPersona(
                              msg.rephraseSuggestion!,
                              msg.id + '_rephrase',
                              0.95,
                              activePersona
                            )
                          }
                          className="p-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 shrink-0 cursor-pointer"
                          title="Hear local phrasing"
                        >
                          <Volume2 size={14} />
                        </button>
                      </div>
                    )}

                    {msg.slangTip && (
                      <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-black text-amber-400 uppercase tracking-wider">
                            Local Expression:{' '}
                          </span>
                          <strong className="text-white">{msg.slangTip}</strong> —{' '}
                          <span className="text-slate-300">{msg.slangMeaning}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 px-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {activePersona.name} is replying from {activePersona.city}...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* SUGGESTED QUICK REPLIES (With Phonetics so You Know What You Are Saying!) */}
      {latestAssistantMsg?.suggestedReplies && latestAssistantMsg.suggestedReplies.length > 0 && (
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/95 border-t border-slate-900">
          <div className="max-w-4xl mx-auto">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
              Tap a phrase to reply to {activePersona.name.split(' ')[0]} (or type/speak your own below):
            </span>
            <div className="flex flex-wrap gap-2">
              {latestAssistantMsg.suggestedReplies.map((rep, idx) => {
                const repTranslit =
                  isNonLatin && showTransliteration
                    ? getTransliteration(rep, selectedTrack.id)
                    : '';
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(rep)}
                    disabled={isLoading}
                    className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition-all cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-white block">{rep}</span>
                    {repTranslit && (
                      <span className="text-[11px] font-mono text-cyan-400 block">
                        🔤 {repTranslit}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* INPUT FOOTER (Microphone + Text Input) */}
      <footer className="p-3 sm:p-4 bg-slate-900/95 border-t border-slate-800 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-2.5">
          <button
            onClick={handleToggleMic}
            className={`p-3.5 rounded-2xl border transition-all shrink-0 cursor-pointer ${
              isListeningMic
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-950 hover:bg-slate-800 text-cyan-400 border-slate-800'
            }`}
            title="Speak in your microphone"
          >
            <Mic size={20} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Talk or write to ${activePersona.name.split(' ')[0]} in ${selectedTrack.dialect}, phonetics, or English...`}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </footer>

      {/* Live Phone Call Modal */}
      <LiveVoiceCallModal
        isOpen={isLiveCallOpen}
        onClose={() => {
          stopAllAudio();
          setIsLiveCallOpen(false);
        }}
        dialect={selectedTrack}
        persona={activePersona}
        cefrLevel={cefrLevel}
      />
    </div>
  );
};
