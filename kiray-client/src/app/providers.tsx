'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { AuthListenerBootstrap } from '@/features/auth/useAuthListener';
import { LanguageProvider } from '@/i18n';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <AuthListenerBootstrap />
        {children}
      </LanguageProvider>
    </Provider>
  );
}

