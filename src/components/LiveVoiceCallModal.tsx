import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, Sparkles, Radio } from 'lucide-react';
import { DialectTrack } from '../types';
import { TutorPersona, getTutorPersona } from '../data/tutorPersonas';
import { playNativeAudio, stopAllAudio } from '../services/gemini';

interface LiveVoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  dialect?: DialectTrack;
  persona?: TutorPersona;
  cefrLevel?: string;
}

export const LiveVoiceCallModal: React.FC<LiveVoiceCallModalProps> = ({
  isOpen,
  onClose,
  dialect,
  persona,
  cefrLevel = 'A1'
}) => {
  const activeDialect = dialect || {
    id: 'es-MX',
    name: 'Spanish',
    dialect: 'Mexican Spanish',
    flag: '🇲🇽',
    region: 'Mexico City',
    continent: 'North America',
    status: 'active',
    level: 'A1 - C1',
    samplePhrase: '¡Qué onda!',
    translation: 'What\'s up!',
    persona: 'Sofía',
    description: 'Mexican Spanish',
    culturalNote: 'Roma Norte'
  };

  const activePersona = persona || getTutorPersona(activeDialect.id);

  const [callState, setCallState] = useState<'connecting' | 'listening' | 'speaking' | 'idle'>('connecting');
  const [transcript, setTranscript] = useState('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
      return;
    }

    setCallState('connecting');
    const greeting =
      activePersona.levelGreetings?.[cefrLevel as keyof typeof activePersona.levelGreetings]?.native ||
      activePersona.levelGreetings?.A1?.native ||
      `¡Hola! Soy ${activePersona.name}, tu profesor de ${activeDialect.dialect}.`;

    setTranscript(`Connected to ${activePersona.name} (${activePersona.city})`);

    const timer = setTimeout(() => {
      setCallState('speaking');
      playNativeAudio({
        text: greeting,
        dialectId: activeDialect.id,
        voiceName: activePersona.recommendedVoice,
        voiceGender: activePersona.voiceGender,
        personaId: activePersona.id,
        rate: speechRate,
        onEnd: () => setCallState('listening'),
        onError: () => setCallState('listening')
      });
    }, 800);

    return () => {
      clearTimeout(timer);
      stopAllAudio();
    };
  }, [isOpen, activePersona.id, cefrLevel]);

  if (!isOpen) return null;

  const handleSimulateUserSpeech = () => {
    stopAllAudio();
    setCallState('speaking');
    const followUps = [
      `¡Todo muy bien por acá! ¿Y tú qué tal en ${activePersona.city}?`,
      'Me encanta practicar contigo.',
      '¿Qué me recomiendas hacer hoy?'
    ];
    const userSpoke = followUps[Math.floor(Math.random() * followUps.length)];
    setTranscript(`You: "${userSpoke}"`);

    setTimeout(() => {
      const reply =
        activePersona.levelGreetings?.A2?.native ||
        `¡Qué bueno escuchar eso! Aquí en ${activePersona.city} el día está increíble.`;
      setTranscript(`${activePersona.name}: "${reply}"`);
      playNativeAudio({
        text: reply,
        dialectId: activeDialect.id,
        voiceName: activePersona.recommendedVoice,
        voiceGender: activePersona.voiceGender,
        personaId: activePersona.id,
        rate: speechRate,
        onEnd: () => setCallState('listening'),
        onError: () => setCallState('listening')
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 text-center space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Teacher Avatar & Pulse Ring */}
        <div className="relative w-28 h-28 mx-auto">
          {callState === 'speaking' && (
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
          )}
          <div
            className={`w-full h-full rounded-full bg-gradient-to-br ${activePersona.avatarBg} border-2 border-emerald-500/50 flex items-center justify-center text-4xl shadow-xl relative z-10`}
          >
            {activePersona.avatarEmoji}
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
            <Radio size={12} className="animate-pulse text-emerald-400" />
            <span>Live Voice Call • {activeDialect.dialect}</span>
          </div>
          <h2 className="text-2xl font-black text-white">{activePersona.name}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Live from {activePersona.city} • {activePersona.country}
          </p>
        </div>

        {/* Live Transcript Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 min-h-[80px] flex items-center justify-center">
          <p className="text-xs text-slate-200 font-medium leading-relaxed italic">{transcript}</p>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSimulateUserSpeech}
              disabled={callState === 'speaking'}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Mic size={16} /> Speak to {activePersona.name.split(' ')[0]}
            </button>
            <button
              onClick={() => setSpeechRate((r) => (r === 1.0 ? 0.8 : 1.0))}
              className="px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
            >
              {speechRate === 1.0 ? '⚡ 1.0x' : '🐢 0.8x'}
            </button>
          </div>

          <button
            onClick={() => {
              stopAllAudio();
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <PhoneOff size={16} /> End Call
          </button>
        </div>
      </div>
    </div>
  );
};
