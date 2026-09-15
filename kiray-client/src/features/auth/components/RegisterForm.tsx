'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import type { UserRole } from '@/types/user';
import { RoleSelect } from './RoleSelect';
import { registerWithEmail, loginWithGoogle } from '../firebase';
import { useSyncUserMutation } from '../authApi';

interface RegisterFormProps {
  initialRole?: UserRole;
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  initialRole = 'rentee',
  onSuccess,
  onSwitchToLogin,
}) => {
  const [step, setStep] = useState<'role' | 'credentials'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [syncUser] = useSyncUserMutation();

  const handleRoleConfirm = () => {
    setStep('credentials');
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await registerWithEmail(email, password);
      // Sync the new user with selected role to MongoDB
      await syncUser({ role: selectedRole }).unwrap();
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Please log in instead.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Please provide a valid email address.');
      } else {
        setErrorMessage(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle();
      // Sync with backend using the selected role
      await syncUser({ role: selectedRole }).unwrap();
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(error.message || 'Google registration could not be completed.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="space-y-6">
        <RoleSelect
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          onConfirm={handleRoleConfirm}
        />
        {onSwitchToLogin && (
          <div className="text-center pt-2">
            <p className="text-xs text-stone-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-bold text-orange-600 hover:underline"
              >
                Log in here
              </button>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Selected Role Ribbon */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50 border border-orange-200">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-bold text-orange-950">
            Registering as:{' '}
            <span className="capitalize text-orange-600 font-extrabold">
              {selectedRole === 'landlord' ? 'Property Owner (Landlord)' : 'Tenant (Rentee)'}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setStep('role')}
          className="text-xs text-stone-600 hover:text-orange-600 font-semibold underline"
        >
          Change Role
        </button>
      </div>

      <div className="text-center space-y-1">
        <h3 className="font-display font-bold text-2xl text-slate-900">
          Create your {selectedRole === 'landlord' ? 'Owner' : 'Rentee'} Account
        </h3>
        <p className="text-xs text-stone-500">
          Zero commissions • Direct contacts • Transparent listings
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Continue with Google (Email & Google Only) */}
      <button
        type="button"
        onClick={handleGoogleRegister}
        disabled={isGoogleLoading || isLoading}
        className="w-full py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
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
        <span>Continue with Google</span>
      </button>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-stone-200"></div>
        <span className="flex-shrink mx-3 text-[11px] text-stone-400 font-semibold uppercase tracking-wider">
          OR
        </span>
        <div className="flex-grow border-t border-stone-200"></div>
      </div>

      {/* Email Registration Form */}
      <form onSubmit={handleEmailRegister} className="space-y-3.5">
        <div>
          <label htmlFor="register-fullname" className="block text-xs font-bold text-slate-800 mb-1">
            Full Name
          </label>
          <input
            id="register-fullname"
            type="text"
            placeholder="e.g. Dawit Bekele"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm outline-none focus:border-orange-500 transition"
            required
          />
        </div>

        <div>
          <label htmlFor="register-email" className="block text-xs font-bold text-slate-800 mb-1">
            Email Address
          </label>
          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm outline-none focus:border-orange-500 transition"
            required
          />
        </div>

        <div>
          <label htmlFor="register-password" className="block text-xs font-bold text-slate-800 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm outline-none focus:border-orange-500 transition pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-slate-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create {selectedRole === 'landlord' ? 'Owner' : 'Rentee'} Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {onSwitchToLogin && (
        <div className="text-center pt-2">
          <p className="text-xs text-stone-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-bold text-orange-600 hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      )}
    </div>
  );
};
