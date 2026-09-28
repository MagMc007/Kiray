'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/i18n';

export interface LanguageSwitcherProps {
  className?: string;
  variant?: 'globe' | 'toggle' | 'compact';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'globe',
}) => {
  const { locale, setLocale, toggleLocale } = useTranslation();

  if (variant === 'toggle') {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-xl bg-stone-100 border border-stone-200/90 text-xs font-bold select-none ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => setLocale('en')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            locale === 'en'
              ? 'bg-white text-orange-600 shadow-2xs font-extrabold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          aria-pressed={locale === 'en'}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLocale('am')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            locale === 'am'
              ? 'bg-white text-orange-600 shadow-2xs font-extrabold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          aria-pressed={locale === 'am'}
        >
          አማ
        </button>
      </div>
    );
  }

  // Default 'globe' or 'compact' tab button: toggles between English and Amharic on click
  return (
    <button
      type="button"
      id="nav-language-globe-btn"
      onClick={toggleLocale}
      className={`inline-flex items-center gap-2 py-1.5 px-3 rounded-full border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 active:scale-95 text-slate-800 transition shadow-2xs text-xs font-semibold cursor-pointer select-none group ${className}`}
      title={locale === 'en' ? 'Switch to አማርኛ' : 'Switch to English'}
      aria-label={`Current language: ${locale === 'en' ? 'English' : 'አማርኛ'}. Click to switch.`}
    >
      <Globe className="w-4 h-4 text-orange-600 group-hover:rotate-12 transition-transform duration-200" />
      <span className="font-bold text-slate-800 text-xs">
        {locale === 'en' ? 'Eng' : 'አማ'}
      </span>
    </button>
  );
};
