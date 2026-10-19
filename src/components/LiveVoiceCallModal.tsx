import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Globe,
  Award,
  Zap,
  Clock,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { TutorPersona } from '../data/tutorPersonas';
import { DialectTrack } from '../types';
import { TutorResponse, playNativeAudio, stopAllAudio } from '../services/gemini';
import { soundFX } from '../utils/soundEffects';
import { isNonLatinScript, getTransliteration } from '../utils/transliteration';

interface LiveVoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: TutorPersona;
  dialectTrack: DialectTrack;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  onLevelChange: (level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1') => void;
  onSendMessage: (text: string) => Promise<TutorResponse>;
  onSparksEarned?: (amount: number) => void;
  showTransliteration: boolean;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
}

export const LiveVoiceCallModal: React.FC<LiveVoiceCallModalProps> = ({
  isOpen,
  onClose,
  tutor,
  dialectTrack,
  level,
  onLevelChange,
  onSendMessage,
  onSparksEarned,
  showTransliteration,
  speechRate,
  onSpeechRateChange
}) => {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [callDuration, setCallDuration] = useState(0);
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [lastTutorReply, setLastTutorReply] = useState<TutorResponse | null>(null);
  const [transcriptHistory, setTranscriptHistory] = useState<Array<{ role: 'tutor' | 'user'; text: string; translit?: string; english?: string }>>([]);
  const [earnedSparks, setEarnedSparks] = useState(0);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  const isNonLatin = isNonLatinScript(dialectTrack.id);

  // Initialize Speech Recognition for live phone call
  useEffect(() => {
    isMountedRef.current = true;
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        
        // Match speech recognition language
        let langCode = 'es-MX';
        if (dialectTrack.id.startsWith('ar')) langCode = 'ar-EG';
        else if (dialectTrack.id.startsWith('fr')) langCode = 'fr-FR';
        else if (dialectTrack.id.startsWith('ja')) langCode = 'ja-JP';
        else if (dialectTrack.id.startsWith('pt')) langCode = 'pt-BR';
        recognition.lang = langCode;

        recognition.onstart = () => {
          if (isMountedRef.current) setIsUserSpeaking(false);
        };

        recognition.onspeechstart = () => {
          if (isMountedRef.current) setIsUserSpeaking(true);
        };

        recognition.onspeechend = () => {
          if (isMountedRef.current) setIsUserSpeaking(false);
        };

        recognition.onresult = async (event: any) => {
          const lastResultIndex = event.results.length - 1;
          const transcript = event.results[lastResultIndex][0].transcript.trim();
          if (transcript && !isProcessingVoice && !isTutorSpeaking) {
            handleUserVoiceInput(transcript);
          }
        };

        recognition.onerror = () => {
          if (isMountedRef.current) setIsUserSpeaking(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Live call speech recognition error:', err);
      }
    }

    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [dialectTrack.id]);

  // Handle Call Connection & Initial Greeting
  useEffect(() => {
    if (!isOpen) return;

    soundFX.playTap();
    setCallStatus('ringing');
    setCallDuration(0);
    setEarnedSparks(0);
    setTranscriptHistory([]);

    const ringTimeout = setTimeout(() => {
      soundFX.playCorrect();
      setCallStatus('connected');

      // Start call timer
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => {
          const next = prev + 1;
          // Award +5 sparks every 30 seconds of live conversation
          if (next % 30 === 0) {
            setEarnedSparks((s) => s + 5);
            onSparksEarned?.(5);
          }
          return next;
        });
      }, 1000);

      // Tutor speaks initial level-adaptive greeting
      const greetingData = tutor.levelGreetings[level] || tutor.levelGreetings.A1;
      const initialResponse: TutorResponse = {
        reply: greetingData.native,
        englishTranslation: greetingData.english,
        feedback: `Level ${level} live session with ${tutor.name}.`,
        fluencyScore: 100,
        suggestedReplies: greetingData.quickReplies
      };

      setLastTutorReply(initialResponse);
      setTranscriptHistory([
        {
          role: 'tutor',
          text: greetingData.native,
          translit: greetingData.translit || (isNonLatin ? getTransliteration(greetingData.native, dialectTrack.id) : undefined),
          english: greetingData.english
        }
      ]);

      // Speak greeting
      speakTutor(greetingData.native);

      // Start listening after greeting finishes
      try {
        if (recognitionRef.current && !isMicMuted) {
          recognitionRef.current.start();
        }
      } catch {}
    }, 1200);

    return () => {
      clearTimeout(ringTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
      stopAllAudio();
    };
  }, [isOpen, tutor.id, level]);

  const speakTutor = (text: string) => {
    setIsTutorSpeaking(true);
    playNativeAudio({
      text,
      dialectId: dialectTrack.id,
      voiceName: tutor.recommendedVoice,
      rate: speechRate,
      onStart: () => setIsTutorSpeaking(true),
      onEnd: () => {
        setIsTutorSpeaking(false);
        // Resume listening
        try {
          if (recognitionRef.current && !isMicMuted) {
            recognitionRef.current.start();
          }
        } catch {}
      },
      onError: () => setIsTutorSpeaking(false)
    });
  };

  const handleUserVoiceInput = async (spokenText: string) => {
    if (!spokenText.trim() || isProcessingVoice) return;

    soundFX.playTap();
    setIsProcessingVoice(true);
    setIsUserSpeaking(false);

    // Stop tutor speaking if interrupted
    stopAllAudio();

    // Add user line to transcript
    const userTranslit = isNonLatin ? getTransliteration(spokenText, dialectTrack.id) : undefined;
    setTranscriptHistory((prev) => [
      ...prev,
      { role: 'user', text: spokenText, translit: userTranslit }
    ]);

    try {
      const tutorReply = await onSendMessage(spokenText);
      setLastTutorReply(tutorReply);

      const replyTranslit = isNonLatin
        ? getTransliteration(tutorReply.reply, dialectTrack.id)
        : undefined;

      setTranscriptHistory((prev) => [
        ...prev,
        {
          role: 'tutor',
          text: tutorReply.reply,
          translit: replyTranslit,
          english: tutorReply.englishTranslation
        }
      ]);

      setIsProcessingVoice(false);
      speakTutor(tutorReply.reply);
    } catch {
      setIsProcessingVoice(false);
    }
  };

  const handleEndCall = () => {
    soundFX.playTap();
    stopAllAudio();
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setCallStatus('ended');
  };

  const handleRepeatLast = () => {
    if (lastTutorReply?.reply) {
      soundFX.playTap();
      speakTutor(lastTutorReply.reply);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh] max-h-[780px] relative text-slate-100">
        
        {/* Top Call Header */}
        <header className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
                {tutor.avatarEmoji}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">{tutor.name}</span>
                <span className="text-xs">{tutor.flag}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                <span>{tutor.city}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">24/7 Live Tutor</span>
              </div>
            </div>
          </div>

          {/* Level Switcher & Call Duration */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowLevelPicker(!showLevelPicker)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-[11px] font-mono text-emerald-300 transition-colors shadow-sm"
              >
                <span>Level: {level}</span>
                <ChevronDown size={12} />
              </button>

              {showLevelPicker && (
                <div className="absolute right-0 top-9 w-44 bg-slate-950 border border-slate-700 rounded-2xl p-1.5 shadow-2xl z-30 space-y-1">
                  {(['A1', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        onLevelChange(lvl);
                        setShowLevelPicker(false);
                        soundFX.playTap();
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center justify-between ${
                        level === lvl
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{lvl} {lvl === 'A1' ? 'Beginner' : lvl === 'B1' ? 'Intermediate' : lvl === 'C1' ? 'Mastery' : ''}</span>
                      {level === lvl && <CheckCircle2 size={13} className="text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Clock size={12} className="text-emerald-400" />
              <span>{formatTimer(callDuration)}</span>
            </div>
          </div>
        </header>

        {/* Center: Live Call Stage */}
        <main className="flex-1 overflow-y-auto p-5 flex flex-col items-center justify-between gap-4 relative">
          {callStatus === 'ringing' ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-5xl animate-bounce">
                  {tutor.avatarEmoji}
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping" />
              </div>
              <p className="font-bold text-sm text-slate-200">Connecting to {tutor.name} in {tutor.city}...</p>
              <p className="text-xs text-slate-400 font-mono">24/7 Encrypted Native Immersion Channel</p>
            </div>
          ) : callStatus === 'connected' ? (
            <>
              {/* Tutor Pulsing Avatar with Audio Waveform Rings */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <div className="relative">
                  {/* Expanding Soundwave Rings when tutor speaks */}
                  {isTutorSpeaking && (
                    <>
                      <div className="absolute -inset-3 rounded-full border-2 border-emerald-400/50 animate-ping pointer-events-none" />
                      <div className="absolute -inset-6 rounded-full border border-teal-400/30 animate-pulse pointer-events-none" />
                    </>
                  )}

                  {/* Expanding Blue Rings when user speaks */}
                  {isUserSpeaking && (
                    <div className="absolute -inset-4 rounded-full border-2 border-cyan-400/60 animate-ping pointer-events-none" />
                  )}

                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br ${tutor.avatarBg} border-2 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl transition-all duration-300 ${
                    isTutorSpeaking
                      ? 'scale-105 border-emerald-400 shadow-emerald-500/30 ring-4 ring-emerald-500/20'
                      : isUserSpeaking
                      ? 'scale-105 border-cyan-400 shadow-cyan-500/30 ring-4 ring-cyan-500/20'
                      : 'border-slate-700 shadow-slate-950/80'
                  }`}>
                    {tutor.avatarEmoji}
                  </div>
                </div>

                {/* Live Speaking Status Pill */}
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                    isTutorSpeaking
                      ? 'bg-emerald-500 text-slate-950 animate-pulse'
                      : isUserSpeaking
                      ? 'bg-cyan-500 text-slate-950 animate-pulse'
                      : isProcessingVoice
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {isTutorSpeaking ? (
                      <>
                        <Volume2 size={13} />
                        <span>{tutor.name} is speaking...</span>
                      </>
                    ) : isUserSpeaking ? (
                      <>
                        <Mic size={13} />
                        <span>Listening to you...</span>
                      </>
                    ) : isProcessingVoice ? (
                      <>
                        <Sparkles size={13} className="animate-spin" />
                        <span>Tutor is thinking...</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Ready • Speak anytime or tap a reply below</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Conversation Transcript Display */}
              <div className="w-full flex-1 max-h-56 sm:max-h-64 overflow-y-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-3 font-sans shadow-inner">
                {transcriptHistory.slice(-4).map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] font-mono text-slate-500 mb-0.5">
                      {item.role === 'user' ? 'You' : tutor.name}
                    </div>
                    <div className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm max-w-[90%] ${
                      item.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-800/90 text-slate-100 rounded-bl-none border border-slate-700/60'
                    }`}>
                      <p className="font-semibold leading-relaxed" dir={dialectTrack.id.startsWith('ar') ? 'rtl' : 'ltr'}>
                        {item.text}
                      </p>

                      {/* Transliteration for Arabic/non-Latin scripts */}
                      {showTransliteration && item.translit && (
                        <p className="text-[11px] text-cyan-300 font-mono mt-1 pt-1 border-t border-white/10" dir="ltr">
                          Aa: {item.translit}
                        </p>
                      )}

                      {/* English translation for tutor speech */}
                      {item.english && (
                        <p className="text-[11px] text-slate-300 italic mt-1 pt-1 border-t border-white/10" dir="ltr">
                          "{item.english}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Reply Pills for Immediate Practice */}
              {lastTutorReply?.suggestedReplies && lastTutorReply.suggestedReplies.length > 0 && (
                <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[10px] font-mono uppercase text-slate-500 shrink-0">Try saying:</span>
                  {lastTutorReply.suggestedReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleUserVoiceInput(reply)}
                      className="px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-xs text-slate-300 hover:text-emerald-300 whitespace-nowrap transition-all shadow-sm active:scale-95 shrink-0"
                      dir={dialectTrack.id.startsWith('ar') ? 'rtl' : 'ltr'}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Call Summary Screen */
            <div className="flex-1 flex flex-col items-center justify-center space-y-5 text-center p-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Call Completed!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You spent <strong className="text-white">{formatTimer(callDuration)}</strong> in live conversational immersion with {tutor.name}.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 w-full max-w-sm flex items-center justify-around font-mono text-xs">
                <div>
                  <div className="text-slate-500">Duration</div>
                  <div className="text-base font-bold text-white">{formatTimer(callDuration)}</div>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div>
                  <div className="text-slate-500">Sparks Earned</div>
                  <div className="text-base font-bold text-amber-400 flex items-center gap-1">
                    <Zap size={14} />
                    <span>+{Math.max(15, earnedSparks)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full max-w-xs py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-colors shadow-lg shadow-emerald-950/40"
              >
                Return to Chat
              </button>
            </div>
          )}
        </main>

        {/* Bottom Call Action Bar */}
        {callStatus === 'connected' && (
          <footer className="p-4 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-around shrink-0">
            {/* Speed toggle */}
            <button
              onClick={() => {
                soundFX.playTap();
                onSpeechRateChange(speechRate === 1.0 ? 0.8 : 1.0);
              }}
              className={`p-3 rounded-2xl border transition-all text-xs font-mono flex flex-col items-center gap-1 ${
                speechRate === 0.8
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Slow/Normal Speed"
            >
              <Sliders size={18} />
              <span className="text-[9px] font-bold">{speechRate === 0.8 ? '0.8x SLOW' : '1.0x NORMAL'}</span>
            </button>

            {/* Repeat Last Button */}
            <button
              onClick={handleRepeatLast}
              disabled={isTutorSpeaking || !lastTutorReply}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-mono flex flex-col items-center gap-1"
              title="Repeat tutor's last sentence"
            >
              <RotateCcw size={18} />
              <span className="text-[9px] font-bold">REPEAT</span>
            </button>

            {/* Mic Mute / Unmute Button */}
            <button
              onClick={() => {
                soundFX.playTap();
                setIsMicMuted(!isMicMuted);
                if (!isMicMuted && recognitionRef.current) {
                  try { recognitionRef.current.stop(); } catch {}
                } else if (isMicMuted && recognitionRef.current) {
                  try { recognitionRef.current.start(); } catch {}
                }
              }}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-1 ${
                isMicMuted
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
              <span className="text-[9px] font-bold font-mono">{isMicMuted ? 'MUTED' : 'MIC ON'}</span>
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 transition-all flex flex-col items-center gap-1 active:scale-95"
              title="Hang up phone call"
            >
              <PhoneOff size={20} />
              <span className="text-[9px] font-bold font-mono">END CALL</span>
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};
