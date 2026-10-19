import React from 'react';
import { X, Download, Share, PlusSquare, Smartphone, Check } from 'lucide-react';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstalled?: () => void;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled
}) => {
  if (!isOpen) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onInstalled?.();
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-5 text-white shadow-xl shadow-cyan-950/50">
          <Smartphone size={32} />
        </div>

        <h2 className="text-2xl font-black text-white text-center mb-2 tracking-tight">
          Install Vera WorldWide
        </h2>
        <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
          Install Vera as a standalone mobile application on your iPhone, iPad, or Android device.
          Enjoy full offline access, zero browser bars, and instantaneous audio feedback.
        </p>

        {isIOS ? (
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 mb-6 text-xs">
            <div className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
              How to install on iOS Safari:
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-cyan-400">
                <Share size={16} />
              </div>
              <span>1. Tap the <strong>Share</strong> button at the bottom of Safari.</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-cyan-400">
                <PlusSquare size={16} />
              </div>
              <span>2. Scroll down and select <strong>Add to Home Screen</strong>.</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center shrink-0 text-emerald-400">
                <Check size={16} />
              </div>
              <span>3. Tap <strong>Add</strong> in the top-right corner. Enjoy full-screen Vera!</span>
            </div>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-black text-sm uppercase font-mono tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 mb-4"
          >
            <Download size={18} />
            <span>Install Now to Home Screen</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center mb-4">
            Vera is already installed or your browser supports installing directly from the address bar menu (three dots → &quot;Install App&quot;).
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
