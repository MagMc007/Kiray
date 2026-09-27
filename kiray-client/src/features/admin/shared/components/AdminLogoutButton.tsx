'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/features/auth/authSlice';
import { baseApi } from '@/store/baseApi';
import { logoutFirebase } from '@/features/auth/firebase';

interface AdminLogoutButtonProps {
  className?: string;
}

export const AdminLogoutButton: React.FC<AdminLogoutButtonProps> = ({ className }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutFirebase();
    } catch {
      // Ignore firebase signout errors if uninitialized
    }
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    router.push('/login');
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 text-xs font-semibold border border-rose-500/30 transition cursor-pointer disabled:opacity-50 ${className || ''}`}
      title="Log out of admin session"
      data-testid="admin-logout-btn"
    >
      {isLoggingOut ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
      ) : (
        <LogOut className="w-3.5 h-3.5 text-rose-400" />
      )}
      <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
    </button>
  );
};
