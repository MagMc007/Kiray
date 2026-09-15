'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import {
  selectAuthStatus,
  selectCurrentUser,
  selectIsAuthenticated,
} from '@/features/auth/authSlice';
import type { UserRole } from '@/types/user';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  adminOnly?: boolean;
  fallbackRedirect?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  adminOnly = false,
  fallbackRedirect = '/login',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  const isRoleAuthorized = (): boolean => {
    if (!currentUser) return false;
    if (adminOnly) return currentUser.role === 'admin';
    if (requiredRole) return currentUser.role === requiredRole;
    return true;
  };

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'idle' && !isAuthenticated)) {
      const redirectUrl = `${fallbackRedirect}?redirect=${encodeURIComponent(pathname || '/')}`;
      router.push(redirectUrl);
    }
  }, [status, isAuthenticated, pathname, fallbackRedirect, router]);

  // Loading / Resolving session
  if (status === 'loading' || (status === 'idle' && !isAuthenticated)) {
    return (
      <div
        data-testid="auth-guard-loading"
        className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-4"
      >
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        <p className="text-sm font-semibold text-stone-600">Verifying session...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div
        data-testid="auth-guard-unauthenticated"
        className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-3"
      >
        <p className="text-sm text-stone-500">Redirecting to login...</p>
      </div>
    );
  }

  // Role authorization failed
  if (!isRoleAuthorized()) {
    return (
      <div
        data-testid="auth-guard-unauthorized"
        className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4"
      >
        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-slate-900">
            Access Denied
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            {adminOnly
              ? 'This area is strictly restricted to platform administrators.'
              : `You must be logged in as a ${requiredRole} to access this section.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
