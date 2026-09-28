'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Mail, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { sendResetPasswordEmail } from '../firebase';
import { useTranslation } from '@/i18n';

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail);
      setErrorMessage(null);
      setIsSuccess(false);
      setIsLoading(false);
    }
  }, [isOpen, defaultEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await sendResetPasswordEmail(email.trim());
      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/user-not-found') {
        setErrorMessage('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage(t.auth.errInvalidEmail);
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage(t.auth.errTooManyRequests);
      } else {
        setErrorMessage(error.message || 'Failed to send password reset email.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.auth.forgotPasswordTitle}
      description={t.auth.forgotPasswordDesc}
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

        {isSuccess ? (
          <div className="space-y-4 text-center py-2 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                {t.auth.resetLinkSentSuccess}
              </h4>
              <p className="text-xs text-stone-500">
                We sent a link to <span className="font-semibold text-slate-800">{email}</span>. Click the link in the email to set a new password.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              {t.auth.backToLogin}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-bold text-slate-800 mb-1">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <input
                  id="reset-email"
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm outline-none focus:border-orange-500 transition"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full py-2.5 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.auth.sendingResetLinkBtn}</span>
                </>
              ) : (
                <span>{t.auth.sendResetLinkBtn}</span>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-slate-800 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.auth.backToLogin}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
