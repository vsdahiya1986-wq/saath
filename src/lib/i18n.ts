import { STRINGS } from '@/content/strings';
import type { Lang } from './db';

type Manifest = Record<string, { file: string; text: string }>;

const cache: Partial<Record<Lang, Manifest>> = {};
const inflight: Partial<Record<Lang, Promise<Manifest>>> = {};

/**
 * Synchronous, always-safe lookup. Returns the cached Bhashini-translated
 * text if `loadManifest` has already resolved for this language, otherwise
 * the canonical English fallback. Never throws, never blocks render.
 */
export function t(key: string, lang: Lang = 'en'): string {
  const m = cache[lang];
  if (m && m[key]) return m[key].text;
  return STRINGS[key] ?? key;
}

/** Fetches the generated manifest for a language, once. No-ops offline/missing. */
export async function loadManifest(lang: Lang): Promise<void> {
  if (cache[lang] || inflight[lang]) {
    await inflight[lang];
    return;
  }
  inflight[lang] = fetch(`/content/lang/${lang}/manifest.json`)
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));
  cache[lang] = await inflight[lang]!;
}

export function audioFileFor(key: string, lang: Lang): string | null {
  return cache[lang]?.[key]?.file ?? null;
}
