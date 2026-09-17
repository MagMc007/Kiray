import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RatingStars } from '@/features/comments/components/RatingStars';

describe('RatingStars Component', () => {
  it('renders read-only stars correctly', () => {
    render(<RatingStars rating={4} maxRating={5} showValue />);

    expect(screen.getByText('4.0')).toBeInTheDocument();
    expect(screen.getByLabelText('Rating: 4 out of 5 stars')).toBeInTheDocument();
  });

  it('handles interactive star selection', () => {
    const handleChange = vi.fn();
    render(
      <RatingStars
        rating={3}
        maxRating={5}
        interactive
        onChange={handleChange}
      />
    );

    const star4 = screen.getByRole('radio', { name: /4 stars/i });
    fireEvent.click(star4);

    expect(handleChange).toHaveBeenCalledWith(4);
  });
});
