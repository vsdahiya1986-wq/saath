import { describe, it, expect } from 'vitest';
import { BREAK_GAP_MS, nextRun, REST_AFTER_MS, restDue } from '@/lib/restPause';

const MIN = 60_000;

describe('Rest Pause (F13)', () => {
  it('is not due at the start or before ten minutes', () => {
    expect(restDue(null, 0)).toBe(false);
    let run = nextRun(null, 0);
    run = nextRun(run, 4 * MIN);
    expect(restDue(run, 9 * MIN)).toBe(false);
  });

  it('is due after ten minutes of back-to-back activities', () => {
    let run = nextRun(null, 0);
    for (const t of [3, 6, 9]) run = nextRun(run, t * MIN);
    expect(restDue(run, REST_AFTER_MS)).toBe(true);
  });

  it('a long break starts a fresh run', () => {
    let run = nextRun(null, 0);
    run = nextRun(run, 8 * MIN);
    const later = 8 * MIN + BREAK_GAP_MS + 1;
    expect(restDue(run, later)).toBe(false);
    expect(nextRun(run, later)).toEqual({ since: later, last: later });
  });
});
