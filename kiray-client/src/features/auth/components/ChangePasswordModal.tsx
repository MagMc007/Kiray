'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { changeUserPassword, getUserAuthProviders, sendResetPasswordEmail, auth } from '../firebase';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '../authSlice';
import { useTranslation } from '@/i18n';

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const currentUser = useAppSelector(selectCurrentUser);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleResetLoading, setIsGoogleResetLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check auth providers: does the user have password provider or Google-only?
  const providers = getUserAuthProviders();
  const isGoogleOnly =
    providers.length > 0 &&
    !providers.includes('password') &&
    providers.includes('google.com');

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsLoading(false);
      setIsGoogleResetLoading(false);
    }
  }, [isOpen]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage(t.auth.errPasswordLength);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t.auth.errPasswordsDoNotMatch);
      return;
    }

    setIsLoading(true);

    try {
      await changeUserPassword(currentPassword, newPassword);
      setSuccessMessage(t.auth.passwordUpdatedSuccess);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        setErrorMessage(t.auth.errWrongCurrentPassword);
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage(t.auth.errWeakPassword);
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage(t.auth.errTooManyRequests);
      } else {
        setErrorMessage(error.message || 'Failed to update password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendGoogleReset = async () => {
    const email = currentUser?.email || auth?.currentUser?.email;
    if (!email) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleResetLoading(true);

    try {
      await sendResetPasswordEmail(email);
      setSuccessMessage(t.auth.resetLinkSentSuccess);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Failed to send password setup email.');
    } finally {
      setIsGoogleResetLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.auth.changePasswordTitle}
      description={t.auth.changePasswordDesc}
      maxWidth="md"
    >
      <div className="space-y-4">
        {errorMessage && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {isGoogleOnly ? (
          /* Google-authenticated account notice and setup link */
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
                <span className="text-xs font-bold text-slate-800">
                  Google Account ({currentUser?.email})
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t.auth.googleAccountPasswordNotice}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSendGoogleReset}
              disabled={isGoogleResetLoading}
              className="w-full py-2.5 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGoogleResetLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.auth.sendingResetLinkBtn}</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{t.auth.sendGoogleResetBtn}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Password-authenticated account change form */
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="current-password"
                className="block text-xs font-bold text-slate-800 mb-1"
              >
                {t.auth.currentPasswordLabel}
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder={t.auth.currentPasswordPlaceholder}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm outline-none focus:border-orange-500 transition"
                  required
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-slate-700 cursor-pointer"
                  aria-label={
                    showCurrentPassword ? t.auth.hidePassword : t.auth.showPassword
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-bold text-slate-800 mb-1"
              >
                {t.auth.newPasswordLabel}
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder={t.auth.newPasswordPlaceholder}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm outline-none focus:border-orange-500 transition"
                  required
                  minLength={6}
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-slate-700 cursor-pointer"
                  aria-label={
                    showNewPassword ? t.auth.hidePassword : t.auth.showPassword
                  }
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-bold text-slate-800 mb-1"
              >
                {t.auth.confirmPasswordLabel}
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t.auth.confirmPasswordPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm outline-none focus:border-orange-500 transition"
                  required
                  minLength={6}
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-slate-700 cursor-pointer"
                  aria-label={
                    showConfirmPassword ? t.auth.hidePassword : t.auth.showPassword
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full py-2.5 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.auth.updatingPasswordBtn}</span>
                </>
              ) : (
                <span>{t.auth.updatePasswordBtn}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};
