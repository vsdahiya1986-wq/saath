import type { Difficulty } from './db';
import { shuffle } from '@/content/cstContent';
import { PLAIN_DISTRACTORS, SIMILAR_DISTRACTORS, SprigKind } from '@/components/play/TeaSprig';

/**
 * Saah Pat round construction (F4), kept out of the component so the grid
 * sizes and the give-up budget are unit-testable.
 */

export interface SaahPatTile {
  id: string;
  kind: SprigKind;
  isTarget: boolean;
}

/** Tiles and targets per difficulty, straight from the spec. */
export const GRID: Record<Difficulty, { tiles: number; targets: number; similar: boolean }> = {
  1: { tiles: 6, targets: 2, similar: false },
  2: { tiles: 9, targets: 3, similar: false },
  3: { tiles: 12, targets: 4, similar: true },
  4: { tiles: 16, targets: 5, similar: true },
};

export const ROUNDS_PER_SESSION = 2;

/**
 * Errorless ceiling: after this many wrong taps the remaining targets are
 * revealed and the round completes, so no one can be stuck hunting.
 */
export function wrongTapBudget(difficulty: Difficulty): number {
  return GRID[difficulty].targets + 4;
}

export function buildSaahPatRound(difficulty: Difficulty): SaahPatTile[] {
  const { tiles, targets, similar } = GRID[difficulty];
  // At difficulty 3-4 the look-alike (three leaves) dominates; below that the
  // distractors are plainly different shapes.
  const pool: SprigKind[] = similar ? [...SIMILAR_DISTRACTORS, ...SIMILAR_DISTRACTORS, ...PLAIN_DISTRACTORS] : [...PLAIN_DISTRACTORS];

  const out: SaahPatTile[] = [];
  for (let i = 0; i < targets; i++) out.push({ id: `t${i}`, kind: 'two_and_bud', isTarget: true });
  for (let i = 0; i < tiles - targets; i++) out.push({ id: `d${i}`, kind: pool[i % pool.length], isTarget: false });
  return shuffle(out);
}
