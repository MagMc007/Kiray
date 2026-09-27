import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useTranslation } from '@/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { Footer } from '@/components/layout/Footer';

import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { AuthPageLayout } from '@/features/auth/components/AuthPageLayout';
import RenteeDashboardPage from '@/app/dashboard/rentee/page';
import { setCredentials, setCurrentUser } from '@/features/auth/authSlice';
import * as favoritesApiModule from '@/features/favorites/favoritesApi';
import { QuickSearchBar } from '@/features/listings/components/QuickSearchBar';
import { AdvancedFilterPanel } from '@/features/listings/components/AdvancedFilterPanel';
import { initialFilterState } from '@/features/listings/listingsSlice';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
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
    expect(screen.getByText('ቤቶችን ይመልክቱ')).toBeInTheDocument();
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

  it('renders Footer in Amharic when Amharic locale is active', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher variant="globe" />
        <Footer />
      </LanguageProvider>
    );

    // Initial English
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Browse All Rentals')).toBeInTheDocument();
    expect(screen.getByText('How Kiray Works')).toBeInTheDocument();
    expect(screen.getByText('support@kiray.et')).toBeInTheDocument();

    // Switch to Amharic
    fireEvent.click(screen.getByRole('button', { name: /English/i }));

    // Amharic footer text
    expect(screen.getByText('ያስሱ')).toBeInTheDocument();
    expect(screen.getByText('ሁሉንም ቤቶች ይመለክቱ')).toBeInTheDocument();
    expect(screen.getByText('ስለ ኪራይ')).toBeInTheDocument();
    expect(screen.getByText('ኪራይ እንዴት ይሰራል')).toBeInTheDocument();
    expect(screen.getByText('ማህበረሰብ እና እገዛ')).toBeInTheDocument();
    expect(screen.getByText('አዲስ አበባ፣ ኢትዮጵያ')).toBeInTheDocument();
  });

  it('renders LoginForm in Amharic when Amharic locale is active', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <LanguageProvider>
          <LanguageSwitcher variant="toggle" />
          <LoginForm />
        </LanguageProvider>
      </Provider>
    );

    // Switch to Amharic
    fireEvent.click(screen.getByRole('button', { name: 'አማ' }));

    // Amharic LoginForm elements
    expect(screen.getByText('እንኳን ደህና መጡ!')).toBeInTheDocument();
    expect(screen.getByText('ወደ ኪራይ መለያዎ ይግቡ')).toBeInTheDocument();
    expect(screen.getByText('በጉግል (Google) ይቀጥሉ')).toBeInTheDocument();
    expect(screen.getByLabelText('የኢሜይል አድራሻ')).toBeInTheDocument();
    expect(screen.getByLabelText('የይለፍ ቃል')).toBeInTheDocument();
    expect(screen.getByText('አስታውሰኝ')).toBeInTheDocument();
    expect(screen.getByText('የይለፍ ቃል ረሱ?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ግባ$/ })).toBeInTheDocument();
  });

  it('renders RegisterForm and RoleSelect in Amharic when Amharic locale is active', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <LanguageProvider>
          <LanguageSwitcher variant="toggle" />
          <RegisterForm />
        </LanguageProvider>
      </Provider>
    );

    // Switch to Amharic
    fireEvent.click(screen.getByRole('button', { name: 'አማ' }));

    // Role select step in Amharic
    expect(screen.getByText('ደረጃ 1 ከ 2')).toBeInTheDocument();
    expect(screen.getByText('ኪራይን እንዴት ይጠቀማሉ?')).toBeInTheDocument();
    expect(screen.getByText('እንደ ተከራይ ይመዝገቡ')).toBeInTheDocument();
    expect(screen.getByText('እንደ ባለቤት/አከራይ ይመዝገቡ')).toBeInTheDocument();
    expect(screen.getByText('ተከራይን ይምረጡ')).toBeInTheDocument();

    // Advance to credentials step
    const renteeCard = screen.getByText('እንደ ተከራይ ይመዝገቡ').closest('[role="button"]');
    if (renteeCard) {
      fireEvent.click(renteeCard);
    }

    // Credentials step in Amharic
    expect(screen.getByText(/ተከራይ መለያዎን ይፍጠሩ/i)).toBeInTheDocument();
    expect(screen.getByLabelText('ሙሉ ስም')).toBeInTheDocument();
    expect(screen.getByLabelText('የኢሜይል አድራሻ')).toBeInTheDocument();
    expect(screen.getByLabelText('የይለፍ ቃል')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ተከራይ አካዉንት ፍጠር/i })).toBeInTheDocument();
  });

  it('renders AuthPageLayout in Amharic including top bar, left panel, and safety footer', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <LanguageProvider>
          <AuthPageLayout initialMode="login" />
        </LanguageProvider>
      </Provider>
    );

    // Click the globe switcher on top header to switch to Amharic
    const globeBtn = screen.getByRole('button', { name: /English/i });
    fireEvent.click(globeBtn);

    // Top link
    expect(screen.getByText('ወደ ኪራይ መነሻ ተመለስ')).toBeInTheDocument();

    // Left panel text in Amharic
    expect(screen.getByText(/ወደ አዲሱ ቤትዎ የሚደረገው ጉዞ/i)).toBeInTheDocument();
    expect(screen.getByText('በካርታ ላይ ቅድሚያ ፍለጋ')).toBeInTheDocument();
    expect(screen.getByText('የተረጋገጠ እና ግልጽ')).toBeInTheDocument();
    expect(screen.getByText('ቀጥተኛ እና ፍትሃዊ')).toBeInTheDocument();
    expect(screen.getByText(/ያለ ደላላ ክፍያ የተረጋገጠ/i)).toBeInTheDocument();

    // Safety footer in Amharic
    expect(screen.getByText('ቤቱን ሳያዩ ክፍያ አይፈጽሙ')).toBeInTheDocument();
    expect(screen.getByText('መጀመሪያ የተከራይ መገለጫን ያረጋግጡ')).toBeInTheDocument();
  });

  it('renders RenteeDashboardPage in Amharic when Amharic locale is active', () => {
    vi.spyOn(favoritesApiModule, 'useGetSavedListingsQuery').mockReturnValue({
      data: {
        results: [],
        data: [],
        meta: {
          page: 1,
          limit: 12,
          totalPages: 1,
          total: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const store = makeStore();
    store.dispatch(
      setCredentials({
        firebaseUid: 'fb123',
        idToken: 'mock-token',
      })
    );
    store.dispatch(
      setCurrentUser({
        _id: 'u123',
        email: 'rentee@example.com',
        displayName: 'ዳግማዊ',
        role: 'rentee',
        status: 'active',
        firebaseUid: 'fb123',
        profileCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );

    render(
      <Provider store={store}>
        <LanguageProvider>
          <LanguageSwitcher variant="toggle" />
          <RenteeDashboardPage />
        </LanguageProvider>
      </Provider>
    );

    // Switch to Amharic
    fireEvent.click(screen.getByRole('button', { name: 'አማ' }));

    expect(screen.getByText('የተከራይ ዳሽቦርድ')).toBeInTheDocument();
    expect(screen.getByText(/እንኳን ደህና መጡ፣ ዳግማዊ/i)).toBeInTheDocument();
    expect(screen.getByText('የተቀመጡ ቤቶች እና እጩዎች')).toBeInTheDocument();
    const browseLinks = screen.getAllByRole('link', { name: /ቤቶችን ይመልክቱ/i });
    expect(browseLinks.length).toBeGreaterThanOrEqual(1);
    expect(browseLinks[0]).toHaveAttribute('href', '/listings');
    expect(screen.getByText('እስካሁን ምንም የተቀመጠ ቤት የለም')).toBeInTheDocument();
  });

  it('renders QuickSearchBar and AdvancedFilterPanel in Amharic', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher variant="toggle" />
        <QuickSearchBar
          filters={initialFilterState}
          onApplyFilters={vi.fn()}
          onResetFilters={vi.fn()}
          viewMode="grid"
          onViewModeChange={vi.fn()}
          totalListingsCount={15}
        />
        <AdvancedFilterPanel
          isOpen={true}
          onClose={vi.fn()}
          filters={initialFilterState}
          onApplyFilters={vi.fn()}
          onResetFilters={vi.fn()}
        />
      </LanguageProvider>
    );

    // Switch to Amharic
    fireEvent.click(screen.getByRole('button', { name: 'አማ' }));

    // QuickSearchBar in Amharic
    expect(
      screen.getByPlaceholderText('ቁልፍ ቃላት፣ ሰፈር ወይም ገጽታዎችን ይፈልጉ...')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ፈልግ' })).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('ቤቶች ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ዝርዝር' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ካርታ' })).toBeInTheDocument();

    // AdvancedFilterPanel in Amharic
    expect(screen.getByText('ቤቶችን ማጣሪያ')).toBeInTheDocument();
    expect(screen.getByText('ወርሃዊ ኪራይ (ETB)')).toBeInTheDocument();
    expect(screen.getByText('መኝታ ቤቶች')).toBeInTheDocument();
    expect(screen.getByText('መታጠቢያ ቤቶች')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2 መኝታ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ማጣሪያዎችን ተግብር' })).toBeInTheDocument();
  });
});

