import { db } from './db';

/**
 * Rest Pause (F13). "Continuous play" is a run of activity starts with no
 * long gap between them; after REST_AFTER of it the next activity offers a
 * rest first. Asked between activities, never mid-round, never forced.
 */

export const REST_AFTER_MS = 10 * 60_000;
/** A gap this long between two activity starts ends the run. */
export const BREAK_GAP_MS = 15 * 60_000;

export interface PlayRun {
  since: number;
  last: number;
}

/** Pure: the run after one more activity starts at `now`. */
export function nextRun(run: PlayRun | null, now: number): PlayRun {
  if (!run || now - run.last > BREAK_GAP_MS) return { since: now, last: now };
  return { since: run.since, last: now };
}

export function restDue(run: PlayRun | null, now: number): boolean {
  return !!run && now - run.last <= BREAK_GAP_MS && now - run.since >= REST_AFTER_MS;
}

// Per tab: continuous play is about this sitting, not the device's history.
const KEY = 'saath_play_run';

export function readRun(): PlayRun | null {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
  } catch {
    return null;
  }
}

export function writeRun(run: PlayRun | null): void {
  try {
    if (run) sessionStorage.setItem(KEY, JSON.stringify(run));
    else sessionStorage.removeItem(KEY);
  } catch {}
}

/** A plain audit event, not a trial outcome — resting is never scored. */
export async function logRest(personId: string, action: 'rest_prompt_shown' | 'rest_now' | 'rest_one_more'): Promise<void> {
  await db.audit.put({ id: crypto.randomUUID(), actor: 'person', action, scope: personId, at: new Date().toISOString() });
}
