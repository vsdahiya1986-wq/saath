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
  defaultRoutine: RegionalRoutine;
}

const EMPTY_ROUTINE: RegionalRoutine = { id: 'reg_empty', title: '', note: '', steps: [] };

let cached: RegionalManifest | null = null;

export async function loadRegionalManifest(): Promise<RegionalManifest> {
  if (cached) return cached;
  try {
    const res = await fetch('/content/packs/regional/manifest.json');
    cached = await res.json();
  } catch {
    cached = { objects: [], patterns: [], defaultRoutine: EMPTY_ROUTINE };
  }
  return cached!;
}
