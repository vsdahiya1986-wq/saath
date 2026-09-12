import type { IconName } from '@/components/ui/Icon';

export interface RegionalItem {
  id: string;
  icon: IconName;
  label: string;
}

export interface RegionalRoutine {
  id: string;
  title: string;
  note: string;
  steps: RegionalItem[];
}

interface RegionalManifest {
  objects: RegionalItem[];
  patterns: RegionalItem[];
  routines: RegionalRoutine[];
}

let cached: RegionalManifest | null = null;

export async function loadRegionalManifest(): Promise<RegionalManifest> {
  if (cached) return cached;
  try {
    const res = await fetch('/content/packs/regional/manifest.json');
    cached = await res.json();
  } catch {
    cached = { objects: [], patterns: [], routines: [] };
  }
  return cached!;
}

/**
 * SIH26003 bug fix: My Next Step previously always showed the same single
 * "Morning routine" fallback every session (manifest had exactly one). Pick
 * one of several routine templates at random per session instead — content
 * variety, not a logic change (see the manifest's own `routines` array).
 */
export function pickRegionalRoutine(manifest: RegionalManifest): RegionalRoutine {
  if (!manifest.routines.length) return { id: 'reg_empty', title: '', note: '', steps: [] };
  return manifest.routines[Math.floor(Math.random() * manifest.routines.length)];
}
