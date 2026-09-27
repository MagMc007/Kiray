'use client';

import React from 'react';
import { AuthGuard } from '@/components/feedback/AuthGuard';

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard adminOnly>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6" data-testid="admin-shell">
        {children}
      </div>
    </AuthGuard>
  );
}
