import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthPageLayout } from '@/features/auth/components/AuthPageLayout';

export const metadata: Metadata = {
  title: 'Create Account | Kiray - Peer-to-Peer Rentals in Addis Ababa',
  description: 'Join Kiray as a rentee or property owner for zero-commission direct rentals.',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-100 flex items-center justify-center">Loading...</div>}>
      <AuthPageLayout initialMode="register" />
    </Suspense>
  );
}
