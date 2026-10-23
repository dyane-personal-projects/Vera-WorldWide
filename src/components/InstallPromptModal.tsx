import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPromptModal: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIOSDevice = /ipad|iphone|ipod/.test(ua.toLowerCase()) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem('vera_install_dismissed');
    if (dismissed) return;

    // Listen for standard PWA install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not standalone, show prompt after 4 seconds
    if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches) {
      const timer = setTimeout(() => setShowBanner(true), 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('vera_install_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-6 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-5 shadow-2xl shadow-emerald-500/10 text-slate-100 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Smartphone size={22} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <h4 className="font-black text-white text-sm tracking-tight flex items-center gap-1.5">
                Install Vera App <Sparkles size={13} className="text-amber-400 fill-amber-400" />
              </h4>
              <p className="text-[11px] text-slate-400">Add to Home Screen for full immersive speed.</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {isIOS ? (
          <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
            <p className="font-semibold text-emerald-400">To install on iOS Safari:</p>
            <p className="text-[11px] leading-relaxed">
              1. Tap the <span className="text-white font-bold">Share</span> button at the bottom of your browser.<br />
              2. Scroll down and tap <span className="text-white font-bold">« Add to Home Screen »</span>.
            </p>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95"
          >
            <Download size={15} />
            <span>Install App Now</span>
          </button>
        )}
      </div>
    </div>
  );
};
