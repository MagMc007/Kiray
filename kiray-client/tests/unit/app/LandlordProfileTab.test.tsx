import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import LandlordDashboardPage from '@/app/dashboard/landlord/page';
import { setCredentials, setCurrentUser } from '@/features/auth/authSlice';
import type { User } from '@/types/user';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/landlord',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

describe('LandlordDashboardPage Profile & WhatsApp Field', () => {
  let store: ReturnType<typeof makeStore>;

  const mockLandlord: User = {
    _id: 'u_ll_100',
    email: 'landlord@kiray.et',
    displayName: 'Alemayehu',
    fullName: 'Alemayehu Tadesse',
    phoneNumber: ['+251966204556'],
    phone: '+251966204556',
    whatsapp: '+251911223344',
    bio: 'Experienced landlord in Bole.',
    role: 'landlord',
    status: 'active',
    firebaseUid: 'fb_ll_100',
    profileCompleted: true,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    store = makeStore();
    store.dispatch(setCredentials({ firebaseUid: mockLandlord.firebaseUid, idToken: 'mock_token' }));
    store.dispatch(setCurrentUser(mockLandlord));
  });

  it('renders the WhatsApp Number field and Same as primary phone button in profile tab', async () => {
    render(
      <Provider store={store}>
        <LandlordDashboardPage />
      </Provider>
    );

    // Switch to Profile Tab
    const profileTabButton = screen.getByRole('button', { name: /Landlord Profile/i });
    fireEvent.click(profileTabButton);

    // Verify WhatsApp input rendered with initial value
    const whatsappInput = screen.getByPlaceholderText('+251911223344') as HTMLInputElement;
    expect(whatsappInput).toBeInTheDocument();
    expect(whatsappInput.value).toBe('+251911223344');

    // Verify "Same as primary phone" button is visible
    const samePhoneBtn = screen.getByRole('button', { name: /Same as primary phone/i });
    expect(samePhoneBtn).toBeInTheDocument();
  });

  it('copies primary phone to WhatsApp when Same as primary phone is clicked', async () => {
    render(
      <Provider store={store}>
        <LandlordDashboardPage />
      </Provider>
    );

    // Switch to Profile Tab
    const profileTabButton = screen.getByRole('button', { name: /Landlord Profile/i });
    fireEvent.click(profileTabButton);

    const whatsappInput = screen.getByPlaceholderText('+251911223344') as HTMLInputElement;
    // Clear whatsapp
    fireEvent.change(whatsappInput, { target: { value: '' } });
    expect(whatsappInput.value).toBe('');

    // Click "Same as primary phone"
    const samePhoneBtn = screen.getByRole('button', { name: /Same as primary phone/i });
    fireEvent.click(samePhoneBtn);

    // Verify whatsapp value is updated to primary phone
    expect(whatsappInput.value).toBe('+251966204556');
  });

  it('normalizes local phone numbers on blur', async () => {
    render(
      <Provider store={store}>
        <LandlordDashboardPage />
      </Provider>
    );

    // Switch to Profile Tab
    const profileTabButton = screen.getByRole('button', { name: /Landlord Profile/i });
    fireEvent.click(profileTabButton);

    const whatsappInput = screen.getByPlaceholderText('+251911223344') as HTMLInputElement;
    fireEvent.change(whatsappInput, { target: { value: '0912345678' } });
    fireEvent.blur(whatsappInput);

    expect(whatsappInput.value).toBe('+251912345678');
  });
});
