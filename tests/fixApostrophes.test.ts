import { describe, it, expect } from 'vitest';
import { fixApostrophes } from '../scripts/lib/fixApostrophes.mjs';

describe('fixApostrophes (Bhashini punctuation artifact)', () => {
  it('joins a split in-word apostrophe, from either quote', () => {
    expect(fixApostrophes('এইটো ক "ত আছে?')).toBe("এইটো ক'ত আছে?");
    expect(fixApostrophes("ঘৰটো ছ 'ৰ্ট কৰক")).toBe("ঘৰটো ছ'ৰ্ট কৰক");
  });

  it('drops a stray trailing quote', () => {
    expect(fixApostrophes("মে '")).toBe('মে');
  });

  it('leaves clean text alone', () => {
    expect(fixApostrophes('এতিয়া দিনটোৰ কোনটো অংশ?')).toBe('এতিয়া দিনটোৰ কোনটো অংশ?');
    expect(fixApostrophes("Next time we'll keep the same pace.")).toBe("Next time we'll keep the same pace.");
  });
});
