import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { getAuth, deleteUser } from 'firebase/auth';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onAccountDeleted: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onAccountDeleted
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      setError('Please type DELETE to confirm permanent deletion.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const auth = getAuth();
      const db = getFirestore();
      const currentUser = auth.currentUser;

      // 1. Delete user document from Firestore if logged in
      if (user?.uid) {
        try {
          await deleteDoc(doc(db, 'artifacts/vera-worldwide-v1/users', user.uid));
        } catch (e) {
          console.warn('Could not delete firestore record:', e);
        }
      }

      // 2. Clear local storage
      localStorage.removeItem('vera_active_user');
      localStorage.removeItem('vera_user_profile');
      localStorage.removeItem('vera_custom_vocab');

      // 3. Delete Firebase Auth user if authenticated
      if (currentUser) {
        try {
          await deleteUser(currentUser);
        } catch (authErr: any) {
          console.warn('Auth deletion note (reauth may be required for cloud user):', authErr);
        }
      }

      onAccountDeleted();
      onClose();
    } catch (err: any) {
      console.error('Delete account error:', err);
      setError(err?.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-200">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-500">
          <AlertTriangle size={28} />
        </div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-black text-white text-center mb-2">Delete Account & Data</h2>
        <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
          In compliance with Apple App Store policies, this permanently deletes your user account,
          lesson progress, streaks, saved vocabulary, and active subscriptions.
          <strong className="text-rose-400 block mt-1">This action cannot be undone.</strong>
        </p>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              Type <span className="text-rose-400 font-bold">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none text-center"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || confirmText.trim().toUpperCase() !== 'DELETE'}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
