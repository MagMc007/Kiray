'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { loginWithEmail, loginWithGoogle } from '../firebase';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { useLazyGetMeQuery, useSyncUserMutation } from '../authApi';
import type { User } from '@/types/user';
import { useTranslation } from '@/i18n';

interface LoginFormProps {
  onSuccess?: (user?: User) => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const { t } = useTranslation();
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const [triggerGetMe] = useLazyGetMeQuery();
  const [syncUser] = useSyncUserMutation();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await loginWithEmail(email, password);
      const user = await triggerGetMe().unwrap();
      onSuccess?.(user);
    } catch (err: unknown) {
      const error = err as {
        code?: string;
        message?: string;
        data?: { message?: string; error?: string };
      };
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        setErrorMessage(t.auth.errInvalidCredentials);
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage(t.auth.errTooManyRequests);
      } else {
        setErrorMessage(
          error.data?.error ||
            error.data?.message ||
            error.message ||
            t.auth.errFailedSignIn
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle();
      try {
        const user = await triggerGetMe().unwrap();
        onSuccess?.(user);
      } catch {
        // First-time Google user on login tab: auto-sync with rentee default
        const user = await syncUser({ role: 'rentee' }).unwrap();
        onSuccess?.(user);
      }
    } catch (err: unknown) {
      const error = err as {
        code?: string;
        message?: string;
        data?: { message?: string; error?: string };
      };
      if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(
          error.data?.error ||
            error.data?.message ||
            error.message ||
            t.auth.errGoogleSignIn
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsGoogleLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      <div className="text-center space-y-0.5">
        <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
          {t.auth.loginWelcome}
        </h3>
        <p className="text-xs text-stone-500">
          {t.auth.loginSubtitle}
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Google OAuth One-Click (Email & Google Only) */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
        )}
        <span>{t.auth.continueWithGoogle}</span>
      </button>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-stone-200"></div>
        <span className="flex-shrink mx-3 text-[11px] text-stone-400 font-semibold uppercase tracking-wider">
          {t.auth.orDivider}
        </span>
        <div className="flex-grow border-t border-stone-200"></div>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-xs font-bold text-slate-800 mb-1">
            {t.auth.emailLabel}
          </label>
          <div className="relative">
            <input
              id="login-email"
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

        <div>
          <label htmlFor="login-password" className="block text-xs font-bold text-slate-800 mb-1">
            {t.auth.passwordLabel}
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t.auth.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm outline-none focus:border-orange-500 transition"
              required
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-slate-700"
              aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-orange-600 rounded"
            />
            <span>{t.auth.rememberMe}</span>
          </label>
          <button
            type="button"
            onClick={() => setIsForgotPasswordOpen(true)}
            className="text-orange-600 hover:underline font-semibold cursor-pointer"
          >
            {t.auth.forgotPassword}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full py-2.5 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.auth.loggingInBtn}</span>
            </>
          ) : (
            <span>{t.auth.loginBtn}</span>
          )}
        </button>
      </form>

      {onSwitchToRegister && (
        <div className="text-center pt-1">
          <p className="text-xs text-stone-500">
            {t.auth.noAccountPrompt}{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-bold text-orange-600 hover:underline"
            >
              {t.auth.createOneLink}
            </button>
          </p>
        </div>
      )}

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        defaultEmail={email}
      />
    </div>
  );
};
