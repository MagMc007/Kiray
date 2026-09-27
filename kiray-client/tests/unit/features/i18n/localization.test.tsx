import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useTranslation } from '@/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { HeroSection } from '@/features/landing/components/HeroSection';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
}));

function TestConsumer() {
  const { locale, setLocale, toggleLocale, t } = useTranslation();
  return (
    <div>
      <span data-testid="current-locale">{locale}</span>
      <span data-testid="translated-title">{t.hero.titleHighlight}</span>
      <button onClick={() => setLocale('am')} data-testid="set-am-btn">
        Set AM
      </button>
      <button onClick={toggleLocale} data-testid="toggle-btn">
        Toggle
      </button>
    </div>
  );
}

describe('Localization & Amharic i18n', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default English locale and translates correctly', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-locale').textContent).toBe('en');
    expect(screen.getByTestId('translated-title').textContent).toBe('made simple.');
  });

  it('switches to Amharic when requested and updates translations', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByTestId('set-am-btn'));

    expect(screen.getByTestId('current-locale').textContent).toBe('am');
    expect(screen.getByTestId('translated-title').textContent).toBe('ቀላል ሆኗል።');
  });

  it('toggles locale using LanguageSwitcher buttons', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher variant="toggle" />
        <TestConsumer />
      </LanguageProvider>
    );

    const amButton = screen.getByRole('button', { name: 'አማ' });
    fireEvent.click(amButton);

    expect(screen.getByTestId('current-locale').textContent).toBe('am');
    expect(screen.getByTestId('translated-title').textContent).toBe('ቀላል ሆኗል።');

    const enButton = screen.getByRole('button', { name: 'EN' });
    fireEvent.click(enButton);

    expect(screen.getByTestId('current-locale').textContent).toBe('en');
    expect(screen.getByTestId('translated-title').textContent).toBe('made simple.');
  });

  it('renders HeroSection in Amharic when Amharic locale is active', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher variant="toggle" />
        <HeroSection />
      </LanguageProvider>
    );

    // Initial English
    expect(screen.getByText(/Your journey to a new home/i)).toBeInTheDocument();
    expect(screen.getByText('made simple.')).toBeInTheDocument();
    expect(screen.getByText('Browse Properties')).toBeInTheDocument();

    // Switch to Amharic
    fireEvent.click(screen.getByRole('button', { name: 'አማ' }));

    // Amharic content renders
    expect(screen.getByText(/ወደ አዲሱ ቤትዎ/i)).toBeInTheDocument();
    expect(screen.getByText('ቀላል ሆኗል።')).toBeInTheDocument();
    expect(screen.getByText('ቤቶችንይመልክቱ')).toBeInTheDocument();
    expect(screen.getByText('ቤትዎን ያከራዩ')).toBeInTheDocument();
  });

  it('switches language when clicking globe tab button', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher variant="globe" />
        <TestConsumer />
      </LanguageProvider>
    );

    const globeBtn = screen.getByRole('button', { name: /English/i });
    expect(globeBtn).toBeInTheDocument();
    expect(screen.getByTestId('current-locale').textContent).toBe('en');

    // Click globe button -> switches to Amharic
    fireEvent.click(globeBtn);
    expect(screen.getByTestId('current-locale').textContent).toBe('am');
    expect(screen.getByRole('button', { name: /አማርኛ/i })).toBeInTheDocument();

    // Click again -> switches back to English
    fireEvent.click(screen.getByRole('button', { name: /አማርኛ/i }));
    expect(screen.getByTestId('current-locale').textContent).toBe('en');
    expect(screen.getByRole('button', { name: /English/i })).toBeInTheDocument();
  });
});
