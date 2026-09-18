import { describe, it, expect } from 'vitest';
import { denied, lexical, verdictFor } from '../scripts/verify-translations.mjs';

/** 07 §1.4, pinned to the real mistranslations the live test found. */
describe('translation verdicts', () => {
  it('fails "Not armed" → অস্ত্ৰধাৰ on the Assamese denylist, whatever the similarity', () => {
    const r = verdictFor({ en: 'Not armed on this device', as: 'এই ডিভাইচত অস্ত্ৰধাৰ নাই', back: 'This device does not have a weapon', sim: 0.9 });
    expect(r.verdict).toBe('FAIL');
    expect(r.deny).toMatch(/অস্ত্ৰ/);
  });

  it('fails on a banned concept in the round trip even if the Assamese list misses it', () => {
    expect(denied('Reminders are not set up', 'x', 'There is no weapon here')).toMatch(/weapon/);
  });

  it('does not flag a banned word the English itself uses', () => {
    expect(denied('Mad about tea', 'x', 'Mad about tea')).toBeNull();
  });

  it('fails "Overdue" → "Excess": both meaning and words diverge', () => {
    expect(verdictFor({ en: 'Overdue', as: 'অতিৰিক্ত', back: 'Excess', sim: 0.21 }).verdict).toBe('FAIL');
  });

  it('passes a faithful round trip', () => {
    expect(verdictFor({ en: 'It is time for your medicine.', as: 'x', back: 'It is time for your medicine.', sim: 0.98 }).verdict).toBe('PASS');
  });

  it('passes a one-word label whose words survive although the embedding score dips', () => {
    expect(lexical('Play', 'will play')).toBe(1);
    expect(verdictFor({ en: 'Play', as: 'খেলিব', back: 'will play', sim: 0.6 }).verdict).toBe('PASS');
  });

  it('flags Assamese more than 1.8× the English as long', () => {
    expect(verdictFor({ en: 'Done', as: 'এইটো সম্পূৰ্ণ হৈছে', back: 'Done', sim: 1 }).long).toBe(true);
  });
});
