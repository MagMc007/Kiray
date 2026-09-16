import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MapboxView } from '@/features/map/components/MapboxView';

describe('MapboxView Component', () => {
  it('renders graceful fallback and coordinates when NEXT_PUBLIC_MAPBOX_TOKEN is missing', () => {
    render(<MapboxView centerCoordinates={[38.7578, 8.9806]} />);

    expect(screen.getByText(/interactive mapbox map/i)).toBeInTheDocument();
    expect(screen.getByText(/NEXT_PUBLIC_MAPBOX_TOKEN/i)).toBeInTheDocument();
    expect(screen.getByText(/Addis Ababa/i)).toBeInTheDocument();
  });
});
