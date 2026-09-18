import type { Difficulty } from './db';
import { shuffle } from '@/content/cstContent';

/**
 * Apon Mukh deck construction (F5), kept pure so the pair counts and the
 * give-up budget are unit-testable without a database or a DOM.
 */

export interface DeckItem {
  id: string;
  label: string;
  photoUrl?: string;
  icon?: string;
  caption?: string;
  /** Regional drawings only: the item's name through `t()` (fix pack A1). */
  labelKey?: string;
  /** The family's own recorded voice for this face, when one exists. */
  audioKey?: string;
}

export interface Card {
  /** Unique per card; two cards of a pair share `itemId`. */
  id: string;
  itemId: string;
  item: DeckItem;
}

export const PAIRS_FOR: Record<Difficulty, number> = { 1: 3, 2: 4, 3: 5, 4: 6 };

/** After this many mismatches the rest are revealed and the round completes. */
export function mismatchBudget(pairs: number): number {
  return pairs * 4;
}

/**
 * Two cards per item, shuffled. Family photos come first so the person's own
 * people are what they see whenever the Memory Garden has any — regional
 * drawings only fill the gaps.
 */
export function buildDeck(pool: DeckItem[], difficulty: Difficulty): Card[] {
  const wanted = Math.min(PAIRS_FOR[difficulty], pool.length);
  const chosen = pool.slice(0, wanted);
  return shuffle(chosen.flatMap((item) => [
    { id: `${item.id}-a`, itemId: item.id, item },
    { id: `${item.id}-b`, itemId: item.id, item },
  ]));
}
