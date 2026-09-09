'use client';
import { useCallback, useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { getPerson, Person } from './db';

const ACTIVE_PERSON_KEY = 'saath_active_person_id';

export async function getActivePersonId(): Promise<string | null> {
  const { value } = await Preferences.get({ key: ACTIVE_PERSON_KEY });
  return value ?? null;
}

export async function setActivePersonId(id: string): Promise<void> {
  await Preferences.set({ key: ACTIVE_PERSON_KEY, value: id });
}

export function usePerson() {
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const id = await getActivePersonId();
    if (!id) {
      setPerson(null);
      setLoading(false);
      return;
    }
    const p = await getPerson(id);
    setPerson(p ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = await getActivePersonId();
      if (!id) {
        if (!cancelled) {
          setPerson(null);
          setLoading(false);
        }
        return;
      }
      const p = await getPerson(id);
      if (!cancelled) {
        setPerson(p ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { person, loading, reload };
}
