'use client';
import { useCallback, useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { getPerson, Person } from './db';
import { loadManifest } from './i18n';

const ACTIVE_PERSON_KEY = 'saath_active_person_id';

export async function getActivePersonId(): Promise<string | null> {
  const { value } = await Preferences.get({ key: ACTIVE_PERSON_KEY });
  return value ?? null;
}

export async function setActivePersonId(id: string): Promise<void> {
  await Preferences.set({ key: ACTIVE_PERSON_KEY, value: id });
}

export async function clearActivePersonId(): Promise<void> {
  await Preferences.remove({ key: ACTIVE_PERSON_KEY });
}

/**
 * Everything a person's screens depend on before first paint (B7, F12): their
 * language's strings, `<html lang>`, and their text size. `t()` falls back to
 * English until the manifest is cached, so a screen rendered before this
 * resolved stayed English until something else re-rendered it.
 */
export async function preparePerson(p: Person): Promise<Person> {
  await loadManifest(p.language);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = p.language;
    document.documentElement.dataset.textScale = String(p.text_scale ?? 1);
  }
  return p;
}

async function loadActive(): Promise<Person | null> {
  const id = await getActivePersonId();
  const p = id ? await getPerson(id) : undefined;
  return p ? preparePerson(p) : null;
}

export function usePerson() {
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setPerson(await loadActive());
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadActive().then((p) => {
      if (cancelled) return;
      setPerson(p);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { person, loading, reload };
}
