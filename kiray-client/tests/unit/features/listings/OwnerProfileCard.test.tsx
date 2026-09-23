import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OwnerProfileCard } from '@/features/listings/components/OwnerProfileCard';
import type { User } from '@/types/user';

describe('OwnerProfileCard Component', () => {
  const mockOwner: User = {
    _id: 'owner_123',
    firebaseUid: 'fb_123',
    email: 'landlord@kiray.et',
    displayName: 'Abebe Kebede',
    fullName: 'Abebe Kebede',
    role: 'landlord',
    status: 'active',
    phone: '+251911223344',
    whatsapp: '+251911223344',
    bio: 'Experienced property owner in Bole and Kazanchis.',
    isVerified: true,
    profileCompleted: true,
    totalListings: 5,
    activeListings: 4,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  it('renders owner display name, verified badge, and contact options', () => {
    render(
      <OwnerProfileCard
        owner={mockOwner}
        listingId="listing_001"
      />
    );

    expect(screen.getByText('Abebe Kebede')).toBeInTheDocument();
    expect(screen.getByText('Call Landlord (+251911223344)')).toBeInTheDocument();
    expect(screen.getByText('Chat on WhatsApp')).toBeInTheDocument();
    expect(screen.getByText(/Experienced property owner/)).toBeInTheDocument();
  });

  it('triggers onContactClick callback when clicking Call Landlord CTA', () => {
    const onContactClick = vi.fn();

    render(
      <OwnerProfileCard
        owner={mockOwner}
        listingId="listing_001"
        onContactClick={onContactClick}
      />
    );

    const callButton = screen.getByText('Call Landlord (+251911223344)');
    fireEvent.click(callButton);

    expect(onContactClick).toHaveBeenCalledWith('call');
  });

  it('triggers onContactClick callback when clicking Chat on WhatsApp CTA', () => {
    const onContactClick = vi.fn();

    render(
      <OwnerProfileCard
        owner={mockOwner}
        listingId="listing_001"
        onContactClick={onContactClick}
      />
    );

    const whatsappButton = screen.getByText('Chat on WhatsApp');
    fireEvent.click(whatsappButton);

    expect(onContactClick).toHaveBeenCalledWith('whatsapp');
  });
});
