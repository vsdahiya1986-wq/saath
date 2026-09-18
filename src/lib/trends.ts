import type { CueType, Difficulty, Person, TrialEvent } from './db';

/**
 * Trend Lines (F10). Only like is compared with like (Part 18 of the master
 * plan): a line is drawn from the trials at one activity's most common
 * difficulty-and-cue condition in the window, never blended across a change
 * of difficulty or help. Fewer than MIN_COMPARABLE such trials → no line.
 */

export const TREND_WINDOWS = [7, 30, 90] as const;
export type TrendWindow = (typeof TREND_WINDOWS)[number];
export const MIN_COMPARABLE = 5;
export const NOT_ENOUGH = 'Not enough comparable sessions yet.';
const BUCKETS = 7;
/** A drop this large from the first to the last point earns a gentle flag. */
const CHECK_IN_DROP = 0.2;
const DAY = 864e5;

export type TrendLine =
  | { enough: false; comparable: number }
  | {
      enough: true;
      comparable: number;
      difficulty: Difficulty;
      cue: CueType;
      /** One value per bucket, oldest first; null where there were no trials. */
      completion: (number | null)[];
      latencyMs: (number | null)[];
      completionRate: number;
      medianLatencyMs: number | null;
      worthCheckIn: boolean;
    };

/**
 * The trials that count as evidence for this person. Synthetic rows never do —
 * except for Aita's Day, where every row is fiction by design and clearly
 * marked SAMPLE, so its screens are not permanently empty.
 */
export function evidenceTrials(person: Pick<Person, 'is_sample'>, trials: TrialEvent[]): TrialEvent[] {
  return person.is_sample ? trials : trials.filter((t) => !t.synthetic);
}

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/** `trials` should already be one activity's. */
export function trendLine(trials: TrialEvent[], windowDays: TrendWindow, now = Date.now()): TrendLine {
  const start = now - windowDays * DAY;
  const inWindow = trials.filter((t) => (t.outcome === 'completed' || t.outcome === 'not_completed') && new Date(t.created_at).getTime() >= start);

  const byCondition = new Map<string, TrialEvent[]>();
  for (const t of inWindow) {
    const k = `${t.difficulty}|${t.cue}`;
    byCondition.set(k, [...(byCondition.get(k) ?? []), t]);
  }
  const comparable = [...byCondition.values()].sort((a, b) => b.length - a.length)[0] ?? [];
  if (comparable.length < MIN_COMPARABLE) return { enough: false, comparable: comparable.length };

  const size = (windowDays * DAY) / BUCKETS;
  const buckets: TrialEvent[][] = Array.from({ length: BUCKETS }, () => []);
  for (const t of comparable) {
    buckets[Math.min(BUCKETS - 1, Math.floor((new Date(t.created_at).getTime() - start) / size))].push(t);
  }
  const rate = (ts: TrialEvent[]) => ts.filter((t) => t.outcome === 'completed').length / ts.length;
  const latencies = (ts: TrialEvent[]) => ts.map((t) => t.latency_ms).filter((x): x is number => typeof x === 'number');

  const completion = buckets.map((b) => (b.length ? rate(b) : null));
  const points = completion.filter((x): x is number => x !== null);
  return {
    enough: true,
    comparable: comparable.length,
    difficulty: comparable[0].difficulty,
    cue: comparable[0].cue,
    completion,
    latencyMs: buckets.map((b) => median(latencies(b))),
    completionRate: rate(comparable),
    medianLatencyMs: median(latencies(comparable)),
    worthCheckIn: points.length >= 2 && points[0] - points[points.length - 1] >= CHECK_IN_DROP,
  };
}
