'use client';
import { useEffect } from 'react';

/**
 * Registers /public/sw.js on mount. See sw.js for why: without this, the
 * app shell itself needs network to load even though IndexedDB already
 * stores data offline correctly (SIH26003 requirement g).
 */
export default function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('[sw] registration failed', err));
    }
  }, []);
  return null;
}
