'use client';
import { useEffect } from 'react';

/**
 * Registers /public/sw.js on mount. See sw.js for why: without this, the
 * app shell itself needs network to load even though IndexedDB already
 * stores data offline correctly (SIH26003 requirement g).
 */
export default function RegisterServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    // Dev chunks aren't content-hashed, so the SW's cache-first handler would serve stale code and hang hydration.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
      caches?.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      return;
    }
    navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('[sw] registration failed', err));
  }, []);
  return null;
}
