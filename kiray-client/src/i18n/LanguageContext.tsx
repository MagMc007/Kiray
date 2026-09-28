'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Locale, TranslationSchema } from './types';
import { en } from './translations/en';
import { am } from './translations/am';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: TranslationSchema;
  isAmharic: boolean;
}

const translations: Record<Locale, TranslationSchema> = {
  en,
  am,
};

const STORAGE_KEY = 'kiray_locale';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Load persisted language from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && (saved === 'en' || saved === 'am')) {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // LocalStorage unavailable in SSR / private mode
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // ignore
    }
  };

  const toggleLocale = () => {
    const next = locale === 'en' ? 'am' : 'en';
    setLocale(next);
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: translations[locale] || en,
      isAmharic: locale === 'am',
    }),
    [locale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

const defaultContextValue: LanguageContextType = {
  locale: 'en',
  setLocale: () => {},
  toggleLocale: () => {},
  t: en,
  isAmharic: false,
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  return context || defaultContextValue;
};
