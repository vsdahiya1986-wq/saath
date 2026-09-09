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

/** True simulated-offline switch for Failure Theatre — see /inspector/theatre. */
let forcedOffline = false;
export function setForcedOffline(v: boolean) {
  forcedOffline = v;
}
export function isForcedOffline() {
  return forcedOffline;
}

export async function syncTrials(): Promise<{ pushed: number; skipped: number; reason?: string }> {
  if (forcedOffline) return { pushed: 0, skipped: 0, reason: 'simulated offline (Failure Theatre)' };

  const sb = getClient();
  if (!sb) return { pushed: 0, skipped: 0, reason: 'Supabase not configured' };

  const status = await Network.getStatus();
  if (!status.connected) return { pushed: 0, skipped: 0, reason: 'device offline' };

  const pending = await db.trials.filter((t) => !t.synced_at).toArray();
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
