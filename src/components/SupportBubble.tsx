import React, { useState } from 'react';
import { LifeBuoy, X, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { submitSupportTicket } from '../firebase';
import { UserProfile } from '../types';

interface SupportBubbleProps {
  user: UserProfile | null;
}

export const SupportBubble: React.FC<SupportBubbleProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitSupportTicket({
        userId: user?.uid || 'guest',
        userEmail: user?.email || 'learner@veraworldwide.com',
        message: message.trim()
      });
      setSubmitted(true);
      setMessage('');
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      console.warn("Support ticket error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {isOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-80 sm:w-96 mb-3 shadow-2xl animate-in fade-in slide-in-from-bottom-3 text-slate-200">
          <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <LifeBuoy size={18} className="text-emerald-400" />
              <h4 className="font-bold text-white text-sm">Vera Concierge & Requests</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {submitted ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-white">Ticket logged to Firestore!</p>
              <p className="text-[11px] text-slate-400">Our dialect team reviews all inquiries promptly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Need help or want to recommend a specific regional dialect for the upcoming drop? Let our team know below.
              </p>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Could you add a Sicilian Italian or Jamaican Patois track?"
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />

              <button
                type="submit"
                disabled={!message.trim() || isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <Send size={13} />
                <span>{isSubmitting ? 'Transmitting...' : 'Submit to Concierge'}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all p-3.5 border border-emerald-400/30 ml-auto"
        title="Need Help or Request a Dialect?"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </div>
  );
};
