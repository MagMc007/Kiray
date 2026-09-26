import '@testing-library/jest-dom';

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
