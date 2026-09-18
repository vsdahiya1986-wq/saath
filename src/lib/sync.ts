import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db } from './db';
import { Network } from '@capacitor/network';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null; // not configured yet — see .env.local.example
  if (!client) client = createClient(url, key);
  return client;
}

/**
 * No-Signal Mode (F3): the caregiver-facing simulated-offline switch, set from
 * Circle. Replaces the internal Failure Theatre toggle removed in R1. Persisted
 * so it survives the reloads of a live demo.
 */
const NO_SIGNAL_KEY = 'saath_no_signal';
const listeners = new Set<() => void>();

function readStored(): boolean {
  try {
    return localStorage.getItem(NO_SIGNAL_KEY) === '1';
  } catch {
    return false; // private mode / blocked storage: simply not in No-Signal Mode
  }
}

let forcedOffline: boolean | null = null;

export function isForcedOffline(): boolean {
  if (forcedOffline === null) forcedOffline = typeof window === 'undefined' ? false : readStored();
  return forcedOffline;
}

export function setForcedOffline(v: boolean) {
  forcedOffline = v;
  try {
    localStorage.setItem(NO_SIGNAL_KEY, v ? '1' : '0');
  } catch {
    // Not persisting is survivable; the switch still works for this session.
  }
  listeners.forEach((cb) => cb());
}

/** Lets a badge re-render the moment the switch is flipped. */
export function subscribeForcedOffline(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export async function syncTrials(): Promise<{ pushed: number; skipped: number; reason?: string }> {
  if (isForcedOffline()) return { pushed: 0, skipped: 0, reason: 'No-Signal Mode is on — nothing leaves this device' };

  const sb = getClient();
  if (!sb) return { pushed: 0, skipped: 0, reason: 'Supabase not configured' };

  const status = await Network.getStatus();
  if (!status.connected) return { pushed: 0, skipped: 0, reason: 'device offline' };

  // F1: demo personas and Aita's Day are fiction — they never leave the device,
  // so a sample can never contaminate a real backend.
  const fictional = new Set((await db.persons.toArray()).filter((p) => p.is_sample || p.is_demo).map((p) => p.id));
  const pending = await db.trials.filter((t) => !t.synced_at && !t.synthetic && !fictional.has(t.person_id)).toArray();
  if (!pending.length) return { pushed: 0, skipped: 0 };

  // Client-generated UUIDs are the idempotency key.
  // upsert + ignoreDuplicates => repeated sync never double-applies.
  const rows = pending.map((t) => {
    const row: Partial<typeof t> = { ...t };
    delete row.synced_at;
    return row;
  });
  const { error } = await sb.from('trials').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });

  if (error) return { pushed: 0, skipped: pending.length, reason: error.message };

  const now = new Date().toISOString();
  await db.transaction('rw', db.trials, async () => {
    for (const t of pending) await db.trials.update(t.id, { synced_at: now });
  });
  return { pushed: pending.length, skipped: 0 };
}

export async function pendingCount(): Promise<number> {
  return db.trials.filter((t) => !t.synced_at).count();
}

export async function lastSyncedAt(): Promise<string | null> {
  const rows = await db.trials.filter((t) => !!t.synced_at).toArray();
  return rows.length ? rows.map((r) => r.synced_at!).sort().at(-1)! : null;
}
