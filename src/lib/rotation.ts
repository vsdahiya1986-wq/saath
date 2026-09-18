import { db, membersForPerson, Activity } from './db';
import { ACTIVITIES, ActivityInfo } from '@/content/activities';

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

// ---------------------------------------------------------------------------
// Aajir Tini · Today's Three (F6)
// ---------------------------------------------------------------------------

export const AAJIR_TINI_COUNT = 3;

/**
 * Three suggested activities for today, from three *different* cognitive
 * domains, preferring the ones least recently played — the same
 * least-recently-used fairness this file already applies to circle members,
 * pointed at activities instead of people.
 *
 * Pure so it is testable: pass the person's trials in, get three back.
 */
export function pickAajirTini(lastPlayed: Map<Activity, number>, count = AAJIR_TINI_COUNT): ActivityInfo[] {
  // Never played sorts first (0), then oldest first.
  const byStaleness = [...ACTIVITIES].sort((a, b) => (lastPlayed.get(a.activity) ?? 0) - (lastPlayed.get(b.activity) ?? 0));

  const chosen: ActivityInfo[] = [];
  const domains = new Set<string>();
  for (const info of byStaleness) {
    if (chosen.length >= count) break;
    if (domains.has(info.domainKey)) continue;
    chosen.push(info);
    domains.add(info.domainKey);
  }

  // Fewer domains than slots (only possible if the activity list shrinks):
  // fill the rest by staleness rather than return a short list.
  for (const info of byStaleness) {
    if (chosen.length >= count) break;
    if (!chosen.includes(info)) chosen.push(info);
  }
  return chosen;
}

/** When each activity was last played by this person, ignoring seeded rows. */
export async function lastPlayedMap(personId: string): Promise<Map<Activity, number>> {
  const trials = await db.trials.where({ person_id: personId }).toArray();
  const map = new Map<Activity, number>();
  for (const t of trials) {
    if (t.synthetic) continue; // invented history must not steer a real suggestion
    const at = new Date(t.created_at).getTime();
    if (at > (map.get(t.activity) ?? 0)) map.set(t.activity, at);
  }
  return map;
}

export async function aajirTiniFor(personId: string): Promise<ActivityInfo[]> {
  return pickAajirTini(await lastPlayedMap(personId));
}
