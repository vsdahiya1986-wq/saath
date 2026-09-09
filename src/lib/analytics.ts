import { db } from './db';
import type { Activity, CueType, Difficulty } from './types';

export interface TrendPoint {
  weekStart: string;
  supportedCompletionRate: number | null;
  n: number;
  medianLatencyMs: number | null;
}

export interface ConditionSeries {
  activity: Activity;
  difficulty: Difficulty;
  cue: CueType;
  points: TrendPoint[];
  interpretable: boolean; // false => show "insufficient comparable data"
  note: string;
}

const MIN_PER_POINT = 3;

/**
 * The trap this refuses to fall into: naive trend charts blend outcomes
 * across changed difficulty/assistance conditions, producing a line that
 * looks like decline or improvement but is really a configuration change.
 * Every series here is grouped by the FULL condition triple and never
 * merged across it — see Part 18 of the master plan.
 */
export async function conditionTrends(personId: string, weeks = 8): Promise<ConditionSeries[]> {
  const all = await db.trials.where({ person_id: personId }).toArray();
  const rows = all.filter((r) => !r.synthetic && (r.outcome === 'completed' || r.outcome === 'not_completed')).sort((a, b) => a.created_at.localeCompare(b.created_at));

  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = `${r.activity}|${r.difficulty}|${r.cue}`;
    const arr = groups.get(k);
    if (arr) arr.push(r);
    else groups.set(k, [r]);
  }

  const out: ConditionSeries[] = [];
  for (const [k, rs] of groups) {
    const [activity, difficultyStr, cue] = k.split('|');
    const byWeek = new Map<string, typeof rows>();
    for (const r of rs) {
      const d = new Date(r.created_at);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0, 0, 0, 0);
      const wk = d.toISOString().slice(0, 10);
      const arr = byWeek.get(wk);
      if (arr) arr.push(r);
      else byWeek.set(wk, [r]);
    }

    const points: TrendPoint[] = [...byWeek.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-weeks)
      .map(([weekStart, w]) => {
        const done = w.filter((x) => x.outcome === 'completed').length;
        const lat = w
          .map((x) => x.latency_ms)
          .filter((x): x is number => typeof x === 'number')
          .sort((a, b) => a - b);
        return {
          weekStart,
          n: w.length,
          supportedCompletionRate: w.length >= MIN_PER_POINT ? done / w.length : null,
          medianLatencyMs: lat.length ? lat[Math.floor(lat.length / 2)] : null,
        };
      });

    const usable = points.filter((p) => p.supportedCompletionRate !== null).length;
    out.push({
      activity: activity as Activity,
      difficulty: Number(difficultyStr) as Difficulty,
      cue: cue as CueType,
      points,
      interpretable: usable >= 3,
      note:
        usable >= 3
          ? `${usable} weeks with at least ${MIN_PER_POINT} comparable trials.`
          : `Insufficient comparable data — fewer than 3 weeks meet the minimum of ${MIN_PER_POINT} trials at this exact activity, difficulty and assistance level.`,
    });
  }
  return out.sort((a, b) => Number(b.interpretable) - Number(a.interpretable));
}
