import { db, membersForPerson } from './db';

export interface OnCall {
  memberId: string;
  name: string;
  role: string;
  reachableOnLan: boolean;
  loadCount: number;
  lastOnCall?: string;
}

/**
 * Least-recently-loaded consented member available today.
 * Load is measured in acknowledged follow-ups, i.e. actual work done.
 */
export async function pickOnCall(personId: string): Promise<OnCall | null> {
  const today = new Date().getDay();
  const all = await membersForPerson(personId);
  const consented = all.filter((m) => m.consented);

  const availableToday = consented.filter((m) => m.on_call_days.includes(today));
  const pool = availableToday.length ? availableToday : consented;
  if (!pool.length) return null;

  pool.sort((a, b) => (a.load_count ?? 0) - (b.load_count ?? 0) || (a.last_on_call ?? '').localeCompare(b.last_on_call ?? ''));

  const m = pool[0];
  return {
    memberId: m.id,
    name: m.name,
    role: m.role,
    reachableOnLan: !!m.lan_url,
    loadCount: m.load_count ?? 0,
    lastOnCall: m.last_on_call,
  };
}

export async function recordLoad(memberId: string): Promise<void> {
  const m = await db.members.get(memberId);
  if (!m) return;
  await db.members.update(memberId, { load_count: (m.load_count ?? 0) + 1, last_on_call: new Date().toISOString() });
}

export interface BurdenRow {
  name: string;
  role: string;
  load: number;
  share: number;
}

/** Burden fairness — surfaced to the whole circle, not hidden in a log. */
export async function burdenReport(personId: string): Promise<BurdenRow[]> {
  const all = await membersForPerson(personId);
  const consented = all.filter((m) => m.consented).sort((a, b) => (b.load_count ?? 0) - (a.load_count ?? 0));
  const total = consented.reduce((s, r) => s + (r.load_count ?? 0), 0) || 1;
  return consented.map((r) => ({
    name: r.name,
    role: r.role,
    load: r.load_count ?? 0,
    share: Math.round(((r.load_count ?? 0) / total) * 100),
  }));
}
