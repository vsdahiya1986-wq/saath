import { db } from './db';
import { evidenceTrials } from './trends';

export type ActivityLevel = 'no_data' | 'low' | 'steady' | 'high';

export interface EngagementLedger {
  personId: string;
  sessionsThisWeek: number;
  sessionsLast4Weeks: number;
  weeksWithAnyParticipation: number; // continuity, NOT consecutive days
  distinctActivityFamilies: number; // breadth across CST domains
  cstSessionEquivalents: number; // sessions toward the 14-session protocol shape
  activityLevel: ActivityLevel;
  lastParticipation: string | null;
  dataFreshAsOf: string | null; // never conflate with participation
}

const WEEK = 7 * 864e5;

export async function computeLedger(personId: string): Promise<EngagementLedger> {
  const all = await db.trials.where({ person_id: personId }).toArray();
  const person = await db.persons.get(personId);
  const rows = evidenceTrials(person ?? {}, all).sort((a, b) => a.created_at.localeCompare(b.created_at));

  if (!rows.length) {
    return {
      personId,
      sessionsThisWeek: 0,
      sessionsLast4Weeks: 0,
      weeksWithAnyParticipation: 0,
      distinctActivityFamilies: 0,
      cstSessionEquivalents: 0,
      activityLevel: 'no_data',
      lastParticipation: null,
      dataFreshAsOf: null,
    };
  }

  const now = Date.now();

  // A "session" = trials grouped within a 45-minute window (not one tap = one session).
  const sessions: number[] = [];
  let last = -Infinity;
  for (const r of rows) {
    const time = new Date(r.created_at).getTime();
    if (time - last > 45 * 60_000) sessions.push(time);
    last = time;
  }

  const sessionsThisWeek = sessions.filter((t) => now - t <= WEEK).length;
  const sessionsLast4Weeks = sessions.filter((t) => now - t <= 4 * WEEK).length;

  const weekKeys = new Set(sessions.map((t) => Math.floor((now - t) / WEEK)));
  const weeksWithAnyParticipation = [...weekKeys].filter((k) => k < 12).length;

  const distinctActivityFamilies = new Set(rows.map((r) => r.activity)).size;

  // Engineering bands. NOT clinical thresholds — say this out loud.
  let activityLevel: ActivityLevel = 'no_data';
  if (sessionsThisWeek >= 3) activityLevel = 'high';
  else if (sessionsThisWeek >= 1) activityLevel = 'steady';
  else if (sessionsLast4Weeks > 0) activityLevel = 'low';

  const syncedRows = rows.filter((r) => r.synced_at);

  return {
    personId,
    sessionsThisWeek,
    sessionsLast4Weeks,
    weeksWithAnyParticipation,
    distinctActivityFamilies,
    cstSessionEquivalents: sessions.length,
    activityLevel,
    lastParticipation: new Date(sessions.at(-1)!).toISOString(),
    dataFreshAsOf: syncedRows.length ? syncedRows.map((r) => r.synced_at!).sort().at(-1)! : null,
  };
}
