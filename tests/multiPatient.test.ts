import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import { decide } from '@/lib/model';
import { conditionTrends, ConditionSeries } from '@/lib/analytics';
import { buildDemoTrials, DEMO_WEEKS, DEMO_TRIALS_PER_WEEK } from '@/lib/demoSeed';

const NOW = new Date(2026, 8, 14, 12, 0, 0).getTime();

function firstToLastDelta(s: ConditionSeries): number {
  const pts = s.points.filter((p) => p.supportedCompletionRate != null);
  return pts[pts.length - 1].supportedCompletionRate! - pts[0].supportedCompletionRate!;
}

describe('demo personas (DEMO DATA)', () => {
  beforeEach(async () => {
    await db.trials.clear();
  });

  it('improving persona produces interpretable, rising weekly trends', async () => {
    await db.trials.bulkPut(buildDemoTrials('demo-up', 'improving', NOW));
    const trends = await conditionTrends('demo-up', DEMO_WEEKS);
    expect(trends).toHaveLength(4);
    for (const s of trends) {
      expect(s.interpretable).toBe(true);
      expect(s.points).toHaveLength(DEMO_WEEKS);
      expect(s.points.every((p) => p.n === DEMO_TRIALS_PER_WEEK)).toBe(true);
      expect(firstToLastDelta(s)).toBeGreaterThan(0.08);
    }
  });

  it('declining persona produces interpretable, falling weekly trends', async () => {
    await db.trials.bulkPut(buildDemoTrials('demo-down', 'declining', NOW));
    const trends = await conditionTrends('demo-down', DEMO_WEEKS);
    expect(trends).toHaveLength(4);
    for (const s of trends) {
      expect(s.interpretable).toBe(true);
      expect(firstToLastDelta(s)).toBeLessThan(-0.08);
    }
  });

  it('never creates future-dated sessions', () => {
    const rows = buildDemoTrials('demo-up', 'improving', NOW);
    expect(rows.every((r) => new Date(r.created_at).getTime() < NOW)).toBe(true);
  });
});

describe('multi-patient data separation', () => {
  beforeEach(async () => {
    await db.trials.clear();
  });

  it("one person's history never reaches another person's recommendation or trends", async () => {
    await db.trials.bulkPut(buildDemoTrials('person-a', 'improving', NOW));

    const other = await decide({ personId: 'person-b', activity: 'familiar_pairs', difficulty: 1, allowedCues: ['none'], maxDifficulty: 4 });
    expect(other.mode).toBe('baseline');
    expect(other.ranking[0].n).toBe(0);
    expect(await conditionTrends('person-b')).toEqual([]);

    const owner = await decide({ personId: 'person-a', activity: 'familiar_pairs', difficulty: 1, allowedCues: ['none'], maxDifficulty: 4 });
    expect(owner.ranking[0].n).toBe(DEMO_WEEKS * DEMO_TRIALS_PER_WEEK);
  });
});
