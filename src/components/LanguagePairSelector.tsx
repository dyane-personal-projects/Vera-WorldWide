import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, ArrowRight, Sparkles } from 'lucide-react';
import {
  SupportedNativeLanguage,
  SUPPORTED_NATIVE_LANGUAGES,
  getSavedNativeLanguage,
  setSavedNativeLanguage,
  t
} from '../utils/i18n';
import { DialectTrack } from '../types';
import { DIALECT_TRACKS } from '../data/languages';

interface LanguagePairSelectorProps {
  currentNativeLang: SupportedNativeLanguage;
  onNativeLangChange: (lang: SupportedNativeLanguage) => void;
  selectedDialect: DialectTrack;
  onDialectChange: (dialect: DialectTrack) => void;
  compact?: boolean;
}

export const LanguagePairSelector: React.FC<LanguagePairSelectorProps> = ({
  currentNativeLang,
  onNativeLangChange,
  selectedDialect,
  onDialectChange,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'native' | 'learning'>('learning');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const nativeOption = SUPPORTED_NATIVE_LANGUAGES.find((l) => l.code === currentNativeLang) || SUPPORTED_NATIVE_LANGUAGES[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-emerald-500/50 transition-all text-xs font-semibold text-slate-200 shadow-sm ${
          compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2'
        }`}
        title="Language settings: What you speak & What you are learning"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-sm">{nativeOption.flag}</span>
          <span className="hidden sm:inline font-mono text-[10px] text-slate-400 uppercase">
            {t('i_speak', currentNativeLang)}:
          </span>
          <span className="font-bold text-white">{nativeOption.name}</span>
        </span>

        <ArrowRight size={12} className="text-emerald-400 mx-0.5" />

        <span className="flex items-center gap-1.5">
          <span className="text-sm">{selectedDialect.flag}</span>
          <span className="hidden sm:inline font-mono text-[10px] text-slate-400 uppercase">
            {t('i_want_to_learn', currentNativeLang)}:
          </span>
          <span className="font-bold text-emerald-400">{selectedDialect.dialect}</span>
        </span>

        <ChevronDown size={13} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 w-80 sm:w-96 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 text-slate-100">
          {/* Header Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-3">
            <button
              onClick={() => setActiveTab('learning')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'learning'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{selectedDialect.flag}</span>
              <span>{t('i_want_to_learn', currentNativeLang)}</span>
            </button>

            <button
              onClick={() => setActiveTab('native')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'native'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{nativeOption.flag}</span>
              <span>{t('i_speak', currentNativeLang)}</span>
            </button>
          </div>

          {activeTab === 'learning' ? (
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-2 px-1 flex items-center justify-between">
                <span>Select Target Dialect to Practice</span>
                <span className="text-emerald-400 font-bold">{DIALECT_TRACKS.length} Tracks</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {DIALECT_TRACKS.map((track) => {
                  const isSelected = selectedDialect.id === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => {
                        onDialectChange(track);
                        setIsOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-2xl text-left flex items-center justify-between transition-colors border ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{track.flag}</span>
                        <div>
                          <div className="text-xs font-bold text-white">{track.dialect}</div>
                          <div className="text-[10px] text-slate-400">{track.region}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {track.status === 'coming_soon' && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono">
                            VOTE
                          </span>
                        )}
                        {isSelected && <Check size={14} className="text-emerald-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-2 px-1 flex items-center justify-between">
                <span>Translate Website UI To:</span>
                <span className="text-indigo-400 font-bold">Instant Switch</span>
              </div>
              <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-1 scrollbar-thin">
                {SUPPORTED_NATIVE_LANGUAGES.map((lang) => {
                  const isSelected = currentNativeLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onNativeLangChange(lang.code);
                        setSavedNativeLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      className={`p-2.5 rounded-2xl text-left flex items-center justify-between transition-colors border ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        <div>
                          <div className="text-xs font-bold text-white">{lang.name}</div>
                          <div className="text-[10px] text-slate-400">{lang.nativeName}</div>
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
