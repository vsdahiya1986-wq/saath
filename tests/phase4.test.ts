import { describe, it, expect } from 'vitest';
import type { Activity, Difficulty } from '@/lib/db';
import { ACTIVITIES } from '@/content/activities';
import { pickAajirTini } from '@/lib/rotation';
import { buildSaahPatRound, GRID, wrongTapBudget } from '@/lib/saahPat';
import { buildDeck, mismatchBudget, PAIRS_FOR } from '@/lib/aponMukh';

const DIFFS: Difficulty[] = [1, 2, 3, 4];

describe('Aajir Tini (F6)', () => {
  it('returns three distinct activities from three domains', () => {
    const three = pickAajirTini(new Map());
    expect(three).toHaveLength(3);
    expect(new Set(three.map((a) => a.activity)).size).toBe(3);
    expect(new Set(three.map((a) => a.domainKey)).size).toBe(3);
  });

  it('prefers the least recently played in each domain', () => {
    // Everything played recently except Saah Pat and Apon Mukh.
    const now = Date.now();
    const played = new Map<Activity, number>(ACTIVITIES.map((a) => [a.activity, now]));
    played.delete('saah_pat');
    played.delete('apon_mukh');
    const picked = pickAajirTini(played).map((a) => a.activity);
    expect(picked).toContain('saah_pat');
    expect(picked).toContain('apon_mukh');
  });
});

describe('Saah Pat rounds (F4)', () => {
  for (const d of DIFFS) {
    it(`difficulty ${d} has the spec's tiles and targets`, () => {
      const round = buildSaahPatRound(d);
      expect(round).toHaveLength(GRID[d].tiles);
      expect(round.filter((t) => t.isTarget)).toHaveLength(GRID[d].targets);
      expect(round.filter((t) => !t.isTarget).every((t) => t.kind !== 'two_and_bud')).toBe(true);
      expect(new Set(round.map((t) => t.id)).size).toBe(round.length);
      expect(wrongTapBudget(d)).toBe(GRID[d].targets + 4);
    });
  }
});

describe('Apon Mukh deck (F5)', () => {
  const pool = Array.from({ length: 10 }, (_, i) => ({ id: `p${i}`, label: `Item ${i}` }));

  for (const d of DIFFS) {
    it(`difficulty ${d} deals ${PAIRS_FOR[d]} pairs`, () => {
      const deck = buildDeck(pool, d);
      expect(deck).toHaveLength(PAIRS_FOR[d] * 2);
      const counts = new Map<string, number>();
      for (const c of deck) counts.set(c.itemId, (counts.get(c.itemId) ?? 0) + 1);
      expect([...counts.values()].every((n) => n === 2)).toBe(true);
    });
  }

  it('puts the front of the pool (family photos) in the deck first', () => {
    const deck = buildDeck(pool, 1);
    expect(new Set(deck.map((c) => c.itemId))).toEqual(new Set(['p0', 'p1', 'p2']));
  });

  it('shrinks to the pool instead of dealing empty cards', () => {
    expect(buildDeck(pool.slice(0, 2), 4)).toHaveLength(4);
    expect(mismatchBudget(3)).toBe(12);
  });
});
