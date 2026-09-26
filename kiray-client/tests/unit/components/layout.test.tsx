import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Logo } from '@/components/layout/Logo';
import { TrustRibbon } from '@/components/layout/TrustRibbon';
import { Footer } from '@/components/layout/Footer';

describe('Layout Components (Step 6)', () => {
  describe('Logo', () => {
    it('renders Kiray brand name and default motto', () => {
      render(<Logo />);
      expect(screen.getByText('Kiray')).toBeInTheDocument();
      expect(screen.getByText('Find your next home.')).toBeInTheDocument();
      expect(screen.getByAltText('Kiray Logo')).toBeInTheDocument();
    });

    it('handles click callback', () => {
      const handleClick = vi.fn();
      render(<Logo onClick={handleClick} />);
      const logoElement = screen.getByText('Kiray');
      fireEvent.click(logoElement);
      expect(handleClick).toHaveBeenCalled();
    });

    it('renders dark variant with white text styling', () => {
      render(<Logo variant="dark" />);
      expect(screen.getByText('Kiray')).toHaveClass('text-white');
    });
  });

  describe('TrustRibbon', () => {
    it('renders all 4 trust pillars', () => {
      render(<TrustRibbon />);
      expect(screen.getByText('Map First Discovery')).toBeInTheDocument();
      expect(screen.getByText('Verified Owners')).toBeInTheDocument();
      expect(screen.getByText('Reviews & Ratings')).toBeInTheDocument();
      expect(screen.getByText('Report Suspicious Listings')).toBeInTheDocument();
    });

    it('triggers action callbacks on pillar clicks', () => {
      const handleMapClick = vi.fn();
      const handleOwnersClick = vi.fn();

      render(<TrustRibbon onMapClick={handleMapClick} onOwnersClick={handleOwnersClick} />);

      fireEvent.click(screen.getByText('Map First Discovery'));
      expect(handleMapClick).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('Verified Owners'));
      expect(handleOwnersClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Footer', () => {
    it('renders platform links, explore links, and support information', () => {
      render(<Footer />);
      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText('Browse All Rentals')).toBeInTheDocument();
      expect(screen.getByText('How Kiray Works')).toBeInTheDocument();
      expect(screen.getByText('support@kiray.et')).toBeInTheDocument();
    });

    it('triggers action callbacks when clicking platform buttons', () => {
      const handleHowItWorks = vi.fn();
      const handleSafetyTips = vi.fn();
      const handleCreateListing = vi.fn();

      render(
        <Footer
          onOpenHowItWorks={handleHowItWorks}
          onOpenSafetyTips={handleSafetyTips}
          onOpenCreateListing={handleCreateListing}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /how kiray works/i }));
      expect(handleHowItWorks).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /safety & anti-scam guide/i }));
      expect(handleSafetyTips).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /list your property \(free\)/i }));
      expect(handleCreateListing).toHaveBeenCalledTimes(1);
    });
  });
});
