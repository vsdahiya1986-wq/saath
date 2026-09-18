import { describe, it, expect } from 'vitest';
import type { TrialEvent } from '@/lib/db';
import { evidenceTrials, MIN_COMPARABLE, trendLine } from '@/lib/trends';

const NOW = new Date('2026-09-18T12:00:00').getTime();

let seq = 0;
function trial(daysAgo: number, over: Partial<TrialEvent> = {}): TrialEvent {
  return {
    id: `t${seq++}`,
    person_id: 'p1',
    activity: 'sound_sight',
    activity_version: '1',
    difficulty: 2,
    cue: 'none',
    outcome: 'completed',
    latency_ms: 2000,
    policy_mode: 'baseline',
    model_version: 'x',
    synthetic: false,
    created_at: new Date(NOW - daysAgo * 864e5).toISOString(),
    ...over,
  };
}

describe('Trend Lines (F10)', () => {
  it(`draws nothing below ${MIN_COMPARABLE} comparable trials`, () => {
    expect(trendLine([1, 2, 3, 4].map((d) => trial(d)), 7, NOW).enough).toBe(false);
  });

  it('never counts another difficulty or cue as comparable', () => {
    const mixed = [trial(1), trial(2), trial(3), trial(4), trial(1, { difficulty: 3 }), trial(2, { cue: 'highlight' })];
    expect(trendLine(mixed, 7, NOW)).toEqual({ enough: false, comparable: 4 });
  });

  it('draws a line from one condition only', () => {
    const rows = [1, 2, 3, 4, 5].map((d) => trial(d)).concat([trial(1, { cue: 'highlight', outcome: 'not_completed' })]);
    const line = trendLine(rows, 7, NOW);
    expect(line.enough).toBe(true);
    if (!line.enough) return;
    expect(line.comparable).toBe(5);
    expect(line.cue).toBe('none');
    expect(line.completionRate).toBe(1); // the one failure was under a different cue
    expect(line.completion).toHaveLength(7);
  });

  it('respects the window and ignores skipped sessions', () => {
    const rows = [1, 2, 3, 4].map((d) => trial(d)).concat([trial(20), trial(2, { outcome: 'skipped' })]);
    expect(trendLine(rows, 7, NOW).enough).toBe(false);
    expect(trendLine(rows, 30, NOW).enough).toBe(true);
  });

  it('flags a clear drop as worth a check-in', () => {
    const rows = [6.5, 6.4, 6.3, 0.5, 0.4, 0.3].map((d, i) => trial(d, { outcome: i < 3 ? 'completed' : 'not_completed' }));
    const line = trendLine(rows, 7, NOW);
    expect(line.enough && line.worthCheckIn).toBe(true);
  });

  it('uses synthetic rows only for the sample person', () => {
    const rows = [trial(1, { synthetic: true }), trial(1)];
    expect(evidenceTrials({ is_sample: false }, rows)).toHaveLength(1);
    expect(evidenceTrials({ is_sample: true }, rows)).toHaveLength(2);
  });
});
