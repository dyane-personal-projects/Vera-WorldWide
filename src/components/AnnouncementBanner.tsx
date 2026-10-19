import React from 'react';
import { Megaphone, Sparkles, AlertTriangle, Info, X } from 'lucide-react';
import { GlobalAnnouncement } from '../types';

interface AnnouncementBannerProps {
  announcement: GlobalAnnouncement | null;
  onDismiss?: () => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcement, onDismiss }) => {
  if (!announcement || !announcement.active || !announcement.content) {
    return null;
  }

  const getStyle = () => {
    switch (announcement.type) {
      case 'sale':
        return 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-500/30';
      case 'alert':
        return 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white border-amber-500/30';
      case 'info':
      default:
        return 'bg-gradient-to-r from-indigo-700 via-cyan-800 to-indigo-900 text-white border-cyan-500/30';
    }
  };

  const getIcon = () => {
    switch (announcement.type) {
      case 'sale':
        return <Sparkles size={16} className="text-amber-300 animate-pulse shrink-0" />;
      case 'alert':
        return <AlertTriangle size={16} className="text-amber-200 shrink-0" />;
      case 'info':
      default:
        return <Megaphone size={16} className="text-cyan-300 shrink-0" />;
    }
  };

  return (
    <div className={`w-full py-2.5 px-4 text-xs font-semibold tracking-wide border-b shadow-md flex items-center justify-between z-50 transition-all ${getStyle()}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-center flex-1 pr-4">
        {getIcon()}
        <span className="leading-snug">{announcement.content}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-md hover:bg-black/20 text-white/80 hover:text-white transition-colors"
          title="Dismiss"
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
