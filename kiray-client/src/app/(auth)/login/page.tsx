import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthPageLayout } from '@/features/auth/components/AuthPageLayout';

export const metadata: Metadata = {
  title: 'Log In | Kiray - Peer-to-Peer Rentals in Addis Ababa',
  description: 'Sign in to access your direct rentals, saved properties, and landlord tools.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-100 flex items-center justify-center">Loading...</div>}>
      <AuthPageLayout initialMode="login" />
    </Suspense>
  );
}
