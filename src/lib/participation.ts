import type { Mood, Person, ReminderLog, TrialEvent } from './db';
import { evidenceTrials } from './trends';

/**
 * Observational counts for the caregiver (fix pack 11, Tiers 2.1, 2.2 and 3).
 *
 * The rule this module exists to enforce: **count, never conclude.** Nothing
 * here scores, grades or compares this person with anyone else. Every
 * comparison is against their own previous week, and where the data is too
 * thin to say anything, `enough` is false and the screen says so instead of
 * drawing a line through two points.
 *
 * `src/lib/trends.ts` answers a different question — how one activity is going
 * at one comparable difficulty-and-cue condition. This one answers "did they
 * take part, and did the reminders get answered", which needs no such control.
 */

const DAY = 864e5;
/** Below this many days with any activity, a week-on-week comparison is noise. */
export const MIN_DAYS_FOR_COMPARISON = 3;
/** A week-on-week difference smaller than this is "about the same". */
const NOTABLE_DAYS = 2;
const QUIET_DAYS = 3;

export type StripKey = 'strip.usual' | 'strip.fewer' | 'strip.more' | 'strip.quiet' | 'strip.early';

export interface Participation {
  /** One count per day, oldest first, for the 30-day strip. */
  perDay: number[];
  sessions30: number;
  daysJoinedThisWeek: number;
  daysJoinedLastWeek: number;
  unaidedThisWeek: number;
  unaidedLastWeek: number;
  remindersDoneThisWeek: number;
  remindersTotalThisWeek: number;
  remindersDoneLastWeek: number;
  remindersTotalLastWeek: number;
  moods: Record<Mood, number>;
  /** False when there is too little to compare one week with the one before. */
  enough: boolean;
  /** The one observational line for the top of Circle (Tier 2.2). */
  strip: StripKey;
  /** True when the reminder clause is worth adding to that line. */
  remindersDown: boolean;
}

const startOfDay = (t: number) => new Date(new Date(t).setHours(0, 0, 0, 0)).getTime();
const dayIndex = (iso: string, from: number) => Math.floor((startOfDay(new Date(iso).getTime()) - from) / DAY);

/** A session the person got to the end of without asking for or being given help. */
const unaided = (t: TrialEvent) => t.outcome === 'completed' && t.cue === 'none';

export function participation(
  person: Pick<Person, 'is_sample'>,
  trials: TrialEvent[],
  logs: ReminderLog[],
  now = Date.now(),
): Participation {
  const today = startOfDay(now);
  const from = today - 29 * DAY;
  const evidence = evidenceTrials(person, trials).filter((t) => t.outcome !== 'interrupted');

  const perDay = Array(30).fill(0) as number[];
  const moods: Record<Mood, number> = { good: 0, ok: 0, low: 0 };
  for (const t of evidence) {
    const i = dayIndex(t.created_at, from);
    if (i < 0 || i > 29) continue;
    perDay[i] += 1;
    if (t.mood && i >= 23) moods[t.mood] += 1;
  }

  const inDays = (t: TrialEvent, lo: number, hi: number) => {
    const i = dayIndex(t.created_at, from);
    return i >= lo && i <= hi;
  };
  const daysWith = (lo: number, hi: number) => perDay.slice(lo, hi + 1).filter((n) => n > 0).length;

  // Days 23–29 are the last 7 days including today; 16–22 the 7 before that.
  const daysJoinedThisWeek = daysWith(23, 29);
  const daysJoinedLastWeek = daysWith(16, 22);

  const week = (l: ReminderLog, lo: number, hi: number) => {
    const i = dayIndex(l.due_at, from);
    return i >= lo && i <= hi;
  };
  const thisWeekLogs = logs.filter((l) => week(l, 23, 29));
  const lastWeekLogs = logs.filter((l) => week(l, 16, 22));
  const done = (ls: ReminderLog[]) => ls.filter((l) => l.outcome === 'done').length;

  const enough = daysJoinedThisWeek + daysJoinedLastWeek >= MIN_DAYS_FOR_COMPARISON;
  const quiet = perDay.slice(30 - QUIET_DAYS).every((n) => n === 0) && perDay.some((n) => n > 0);
  const delta = daysJoinedThisWeek - daysJoinedLastWeek;

  const strip: StripKey = quiet
    ? 'strip.quiet'
    : !enough
      ? 'strip.early'
      : delta <= -NOTABLE_DAYS
        ? 'strip.fewer'
        : delta >= NOTABLE_DAYS
          ? 'strip.more'
          : 'strip.usual';

  // Only worth saying when both weeks had reminders to answer, so the
  // comparison is against this person's own recent habit and not against zero.
  const rateThis = thisWeekLogs.length ? done(thisWeekLogs) / thisWeekLogs.length : null;
  const rateLast = lastWeekLogs.length ? done(lastWeekLogs) / lastWeekLogs.length : null;

  return {
    perDay,
    sessions30: perDay.reduce((a, b) => a + b, 0),
    daysJoinedThisWeek,
    daysJoinedLastWeek,
    unaidedThisWeek: evidence.filter((t) => unaided(t) && inDays(t, 23, 29)).length,
    unaidedLastWeek: evidence.filter((t) => unaided(t) && inDays(t, 16, 22)).length,
    remindersDoneThisWeek: done(thisWeekLogs),
    remindersTotalThisWeek: thisWeekLogs.length,
    remindersDoneLastWeek: done(lastWeekLogs),
    remindersTotalLastWeek: lastWeekLogs.length,
    moods,
    enough,
    strip,
    remindersDown: rateThis !== null && rateLast !== null && rateLast - rateThis >= 0.2,
  };
}

export interface Today {
  activities: number;
  unaided: number;
  remindersDone: number;
  remindersTotal: number;
  /** Nothing has happened yet today — the screen says so rather than showing zeros. */
  empty: boolean;
}

/**
 * Tier 3: the line a family member reads in five seconds. Counts of what the
 * day's rows actually say — no template picks an adjective, and nothing is
 * generated by a model.
 */
export function today(person: Pick<Person, 'is_sample'>, trials: TrialEvent[], logs: ReminderLog[], now = Date.now()): Today {
  const from = startOfDay(now);
  const evidence = evidenceTrials(person, trials).filter((t) => t.outcome !== 'interrupted' && new Date(t.created_at).getTime() >= from);
  const dueToday = logs.filter((l) => new Date(l.due_at).getTime() >= from);
  return {
    activities: evidence.length,
    unaided: evidence.filter(unaided).length,
    remindersDone: dueToday.filter((l) => l.outcome === 'done').length,
    remindersTotal: dueToday.length,
    empty: evidence.length === 0 && dueToday.length === 0,
  };
}
