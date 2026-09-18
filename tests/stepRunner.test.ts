import { describe, it, expect } from 'vitest';
import { onWrongAnswer, MAX_ATTEMPTS } from '@/lib/stepRunner';
import { partOfDayIndex, PARTS, SEASONS, orientationNow } from '@/lib/orientation';

/** B1: errorless learning — a wrong tap is never a dead end. */
describe('onWrongAnswer', () => {
  it('offers one gentle retry, then reveals and moves on', () => {
    expect(onWrongAnswer(0)).toBe('retry');
    expect(onWrongAnswer(1)).toBe('reveal');
  });

  it('never asks for a third attempt', () => {
    for (let attempts = MAX_ATTEMPTS - 1; attempts < 10; attempts++) {
      expect(onWrongAnswer(attempts)).toBe('reveal');
    }
  });
});

/** B1: the hour->period boundaries the Today & Me question is built from. */
describe('partOfDayIndex', () => {
  const cases: [number, string][] = [
    [4, 'Night'],
    [5, 'Morning'],
    [11, 'Morning'],
    [12, 'Afternoon'],
    [16, 'Afternoon'],
    [17, 'Evening'],
    [19, 'Evening'],
    [20, 'Night'],
    [23, 'Night'],
  ];

  for (const [hour, name] of cases) {
    it(`${hour}:00 is ${name}`, () => {
      expect(PARTS[partOfDayIndex(hour)].name).toBe(name);
    });
  }

  it('covers every hour of the day with a real part', () => {
    for (let h = 0; h < 24; h++) {
      expect(PARTS[partOfDayIndex(h)]).toBeDefined();
    }
  });
});

/**
 * The answer must always be one of the offered options, or no tap can ever be
 * right. Checked across a whole year because the season lookup is month-based.
 */
describe('orientationNow', () => {
  it('resolves a part and a season for every month', () => {
    for (let month = 0; month < 12; month++) {
      const now = orientationNow(new Date(2026, month, 15, 13, 0, 0));
      expect(PARTS.map((p) => p.name)).toContain(now.part);
      expect(SEASONS.map((s) => s.name)).toContain(now.season);
    }
  });

  it('agrees with partOfDayIndex, so the correct choice is always offered', () => {
    for (let h = 0; h < 24; h++) {
      const d = new Date(2026, 5, 15, h, 30, 0);
      expect(orientationNow(d).part).toBe(PARTS[partOfDayIndex(h)].name);
    }
  });
});
