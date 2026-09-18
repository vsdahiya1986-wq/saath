import { db, FollowupItem, Nudge, Person, ReminderLog, TrialEvent } from './db';
import { encryptText, decryptText } from './crypto';
import { evidenceTrials } from './trends';

/**
 * Circle Nudges (F7) — the caregiver alert system.
 *
 * Every nudge describes something observed, never a conclusion. The card text
 * is fixed copy from docs/saath-kit/04_CONTENT.md §3; do not paraphrase it.
 *
 * Help requests already have a delivery state machine (events.ts). A nudge is
 * only the caregiver-facing card on top of one, with three states and two
 * one-way moves (open → acknowledged, plus a note), so it does not get a
 * second state machine.
 */

const DAY = 864e5;
export const QUIET_DAYS = 2;
export const STEADIER_MIN_SESSIONS = 5;
export const STEADIER_SHARE = 0.6;

export function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

export function nudgeText(n: Pick<Nudge, 'kind' | 'detail'>, personName: string): string {
  switch (n.kind) {
    case 'medicine_missed':
      return `Medicine at ${n.detail} was not marked done.`;
    case 'quiet_days':
      return 'No activities for two days.';
    case 'help_pressed':
      return `${personName} asked for help at ${n.detail}.`;
    case 'steadier_help':
      return 'Sessions needed more help than usual this week — worth a check-in with the health worker.';
  }
}

function weekKey(now: Date): string {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

/**
 * Every nudge the evidence supports right now. Pure; ids are derived from the
 * triggering row so the same trigger always yields the same id.
 */
export function nudgeCandidates(input: {
  person: Person;
  logs: ReminderLog[];
  trials: TrialEvent[];
  followups: FollowupItem[];
  now: Date;
}): Nudge[] {
  const { person, logs, followups, now } = input;
  const trials = evidenceTrials(person, input.trials);
  const base = { person_id: person.id, state: 'open' as const };
  const out: Nudge[] = [];

  for (const l of logs) {
    if (l.category === 'medicine' && l.outcome === 'missed') {
      out.push({ ...base, id: `nudge-med-${l.id}`, kind: 'medicine_missed', detail: clock(l.due_at), created_at: l.due_at });
    }
  }

  for (const f of followups) {
    if (f.origin === 'help_request') {
      out.push({ ...base, id: `nudge-help-${f.id}`, kind: 'help_pressed', detail: clock(f.created_at), created_at: f.created_at });
    }
  }

  // Quiet since the last completed activity — or since the profile was made,
  // so a brand-new person is not flagged on day one.
  const lastDone = trials.filter((t) => t.outcome === 'completed').reduce((m, t) => (t.created_at > m ? t.created_at : m), person.created_at);
  if (now.getTime() - new Date(lastDone).getTime() >= QUIET_DAYS * DAY) {
    out.push({ ...base, id: `nudge-quiet-${person.id}-${lastDone}`, kind: 'quiet_days', created_at: now.toISOString() });
  }

  const weekAgo = now.getTime() - 7 * DAY;
  const sessions = trials.filter(
    (t) => t.activity !== 'together' && (t.outcome === 'completed' || t.outcome === 'not_completed') && new Date(t.created_at).getTime() >= weekAgo,
  );
  const helped = sessions.filter((t) => t.cue !== 'none').length;
  if (sessions.length >= STEADIER_MIN_SESSIONS && helped / sessions.length >= STEADIER_SHARE) {
    out.push({ ...base, id: `nudge-steadier-${person.id}-${weekKey(now)}`, kind: 'steadier_help', created_at: now.toISOString() });
  }

  return out;
}

/** Stores any new nudges. Existing ones keep their state — never re-opened. */
export async function refreshNudges(person: Person, now = new Date()): Promise<void> {
  const [logs, trials, followups] = await Promise.all([
    db.reminder_logs.where({ person_id: person.id }).toArray(),
    db.trials.where({ person_id: person.id }).toArray(),
    db.followups.where({ person_id: person.id }).toArray(),
  ]);
  const candidates = nudgeCandidates({ person, logs, trials, followups, now });
  const existing = await db.nudges.bulkGet(candidates.map((c) => c.id));
  const fresh = candidates.filter((_, i) => !existing[i]);
  if (fresh.length) await db.nudges.bulkAdd(fresh);
}

/** Newest first, with notes decrypted. */
export async function nudgesForPerson(personId: string): Promise<Nudge[]> {
  const rows = await db.nudges.where({ person_id: personId }).toArray();
  rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return Promise.all(rows.map(async (n) => ({ ...n, note: n.note ? await decryptText(n.note) : undefined })));
}

export async function acknowledgeNudge(id: string, by: string): Promise<void> {
  await db.nudges.update(id, { state: 'acknowledged', acknowledged_by: by });
}

export async function addNudgeNote(id: string, note: string): Promise<void> {
  await db.nudges.update(id, { note: await encryptText(note) });
}
