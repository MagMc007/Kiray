import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MapboxView } from '@/features/map/components/MapboxView';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/listings',
}));

let dragEndListeners: Array<() => void> = [];
const mockMarkerInstance = {
  setLngLat: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
  on: vi.fn((event, callback) => {
    if (event === 'dragend') {
      dragEndListeners.push(callback);
    }
    return mockMarkerInstance;
  }),
  getLngLat: vi.fn().mockReturnValue({ lng: 38.7712, lat: 9.0234 }),
  remove: vi.fn(),
};

const mapListeners: Record<string, Function[]> = {};
const mockMapInstance = {
  addControl: vi.fn(),
  once: vi.fn((event, callback) => {
    if (event === 'load') callback();
  }),
  on: vi.fn((event, callback) => {
    if (!mapListeners[event]) mapListeners[event] = [];
    mapListeners[event].push(callback);
  }),
  flyTo: vi.fn(),
  remove: vi.fn(),
  getZoom: vi.fn().mockReturnValue(12),
};

const mockMarkerConstructor = vi.fn((options) => mockMarkerInstance);

vi.mock('mapbox-gl', () => ({
  default: {
    accessToken: '',
    Map: vi.fn(() => mockMapInstance),
    NavigationControl: vi.fn(),
    FullscreenControl: vi.fn(),
    Marker: vi.fn((options) => mockMarkerConstructor(options)),
    Popup: vi.fn(),
  },
}));

describe('MapboxView Component', () => {
  const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
    dragEndListeners = [];
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = originalEnv;
  });

  it('renders graceful fallback and coordinates when NEXT_PUBLIC_MAPBOX_TOKEN is missing', () => {
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    render(<MapboxView centerCoordinates={[38.7578, 8.9806]} />);

    expect(screen.getByText(/interactive mapbox map/i)).toBeInTheDocument();
    expect(screen.getByText(/NEXT_PUBLIC_MAPBOX_TOKEN/i)).toBeInTheDocument();
    expect(screen.getByText(/Addis Ababa/i)).toBeInTheDocument();
  });

  it('creates draggable pin when interactivePicker is enabled and pre-coordinates are provided', () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'mock-mapbox-token';

    render(
      <MapboxView
        interactivePicker={true}
        initialPickerCoordinates={[38.75, 9.02]}
        centerCoordinates={[38.75, 9.02]}
      />
    );

    expect(mockMarkerConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        draggable: true,
        anchor: 'bottom',
      })
    );
  });

  it('triggers onCoordinatesChange when dragging the pin completes', () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'mock-mapbox-token';
    const handleCoordinatesChange = vi.fn();

    render(
      <MapboxView
        interactivePicker={true}
        initialPickerCoordinates={[38.75, 9.02]}
        onCoordinatesChange={handleCoordinatesChange}
      />
    );

    // Simulate dragend event
    expect(dragEndListeners.length).toBeGreaterThan(0);
    dragEndListeners[0]();

    expect(handleCoordinatesChange).toHaveBeenCalledWith([38.7712, 9.0234]);
  });

  it('flies map and repositions marker when flyToCoordinates updates', () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'mock-mapbox-token';

    const { rerender } = render(
      <MapboxView
        interactivePicker={true}
        initialPickerCoordinates={[38.75, 9.02]}
      />
    );

    rerender(
      <MapboxView
        interactivePicker={true}
        initialPickerCoordinates={[38.75, 9.02]}
        flyToCoordinates={[38.79, 9.05]}
      />
    );

    expect(mockMapInstance.flyTo).toHaveBeenCalledWith(
      expect.objectContaining({
        center: [38.79, 9.05],
        zoom: 16.5,
      })
    );
    expect(mockMarkerInstance.setLngLat).toHaveBeenCalledWith([38.79, 9.05]);
  });
});
