'use client';

import React from 'react';
import { AuthGuard } from '@/components/feedback/AuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard adminOnly>{children}</AuthGuard>;
}
