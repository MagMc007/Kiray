import '@testing-library/jest-dom';
import { vi } from 'vitest';

const raf = (callback: FrameRequestCallback): number => {
  return setTimeout(() => callback(Date.now()), 0) as unknown as number;
};

const caf = (id: number): void => {
  clearTimeout(id);
};

if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = raf;
}
if (typeof globalThis.cancelAnimationFrame === 'undefined') {
  globalThis.cancelAnimationFrame = caf;
}

if (typeof window !== 'undefined') {
  if (typeof window.requestAnimationFrame === 'undefined') {
    window.requestAnimationFrame = raf;
  }
  if (typeof window.cancelAnimationFrame === 'undefined') {
    window.cancelAnimationFrame = caf;
  }
}

// Polyfill Node global scope for bare cancelAnimationFrame / requestAnimationFrame lookups
(global as unknown as { requestAnimationFrame: typeof raf }).requestAnimationFrame =
  globalThis.requestAnimationFrame;
(global as unknown as { cancelAnimationFrame: typeof caf }).cancelAnimationFrame =
  globalThis.cancelAnimationFrame;

vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
  };
});

// Global mapbox-gl mock — prevents "Failed to initialize WebGL" on headless CI
// runners (GitHub Actions Linux) that have no GPU. The local vi.mock in
// MapboxView.test.tsx only covers that one file; this covers every test.
vi.mock('mapbox-gl', () => ({
  default: {
    accessToken: '',
    Map: vi.fn(() => ({
      addControl: vi.fn(),
      once: vi.fn((event: string, cb: () => void) => {
        if (event === 'load') cb();
      }),
      on: vi.fn(),
      flyTo: vi.fn(),
      remove: vi.fn(),
      getZoom: vi.fn(() => 12),
    })),
    NavigationControl: vi.fn(),
    FullscreenControl: vi.fn(),
    Marker: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      getLngLat: vi.fn(() => ({ lng: 0, lat: 0 })),
      remove: vi.fn(),
    })),
    Popup: vi.fn(),
  },
}));
