// SAATH service worker — app-shell + asset caching for true offline use.
//
// Root cause this fixes (SIH26003 requirement g): IndexedDB/Dexie already
// stores person data offline correctly, but nothing cached the app's own
// JS/HTML/CSS, so a reload or cold start needed network just to load the
// shell at all. This worker precaches every file the static export produced
// (see scripts/generate-sw-precache.mjs, run as a postbuild step) so a cold
// reload works offline immediately after the very first visit — not only
// after a user happens to have organically triggered every chunk's fetch.
const CACHE_VERSION = 'saath-v1';

// Minimal fallback for `next dev` (no postbuild manifest exists there) —
// production/export always precaches the generated manifest instead.
const FALLBACK_PRECACHE_URLS = ['/', '/manifest.json', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      const urls = await fetch('/sw-precache-manifest.json')
        .then((r) => (r.ok ? r.json() : FALLBACK_PRECACHE_URLS))
        .catch(() => FALLBACK_PRECACHE_URLS);
      // Cache each URL independently — one missing/renamed file must not
      // abort caching of everything else.
      await Promise.all(
        urls.map((url) => cache.add(url).catch((err) => console.warn('[sw] precache failed', url, err)))
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Network-first for page loads: online users get the latest build,
    // offline users get whatever shell was last cached (install-time or a
    // prior visit) instead of the browser's own offline error page.
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE_VERSION);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(CACHE_VERSION);
          return (
            (await cache.match(request)) ||
            (await cache.match(url.pathname)) ||
            (await cache.match('/')) ||
            Response.error()
          );
        }
      })()
    );
    return;
  }

  // Cache-first, stale-while-revalidate for everything else: hashed
  // _next/static chunks, generated Bhashini audio, regional content packs,
  // images. Content-hashed build assets never change under one URL, so
  // serving the cached copy immediately is always correct; the background
  // refetch keeps non-hashed assets (audio manifests, packs) from going
  // permanently stale across builds.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => undefined);
      return cached || (await network) || Response.error();
    })()
  );
});
