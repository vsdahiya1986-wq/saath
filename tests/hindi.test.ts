import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { STRINGS } from '@/content/strings';
import { DENY_HI, DENY_AS, SIM_MIN, LEXICAL_MIN, verdictFor } from '../scripts/verify-translations.mjs';

/**
 * Fix pack 12: Hindi is a second target of the same pipeline, at the same bar
 * as Assamese. These tests are about the bar, not about the Hindi text — they
 * fail if a key is missing, if an unverified string ever ships, or if the two
 * languages are ever held to different thresholds.
 */
const read = (lang: string) => JSON.parse(fs.readFileSync(path.join('public', 'content', 'lang', lang, 'manifest.json'), 'utf8'));
const review = (file: string) => JSON.parse(fs.readFileSync(path.join('docs', file), 'utf8'));

const as = read('as');
const hi = read('hi');
const hiReview = review('i18n-review.hi.json');
const asReview = review('i18n-review.json');

describe('the Hindi set covers exactly what the Assamese set covers', () => {
  it('has no missing key', () => {
    expect(Object.keys(hi).filter((k) => !(k in as))).toEqual([]);
    expect(Object.keys(as).filter((k) => !(k in hi))).toEqual([]);
  });

  it('resolves every key in STRINGS', () => {
    expect(Object.keys(STRINGS).filter((k) => hi[k]?.text === undefined)).toEqual([]);
  });

  it('was translated from the English source, not from the Assamese', () => {
    for (const [key, en] of Object.entries(STRINGS)) {
      const r = hiReview.entries[key];
      expect(r, key).toBeDefined();
      expect(r.en, key).toBe(en);
    }
  });
});

describe('Hindi is held to the same bar', () => {
  it('uses the same thresholds as Assamese', () => {
    expect(hiReview.thresholds).toEqual(asReview.thresholds);
    expect(hiReview.thresholds).toEqual({ SIM_MIN, LEXICAL_MIN, LEN_MAX: hiReview.thresholds.LEN_MAX });
  });

  it('ships Hindi text only where the round trip passed, and English everywhere else', () => {
    for (const [key, en] of Object.entries(STRINGS)) {
      const shown = hi[key].text;
      const r = hiReview.entries[key];
      if (shown === en) expect(r.verdict, `${key} falls back to English`).toBe('FAIL');
      else expect(r.verdict, `${key} ships Hindi`).toBe('PASS');
      if (shown !== en) expect(shown, key).toBe(r.as);
    }
  });

  it('never ships a denylisted concept in either language', () => {
    const hits = (manifest: Record<string, { text: string }>, deny: string[]) =>
      Object.entries(manifest).filter(([, v]) => deny.some((w) => v.text.includes(w))).map(([k]) => k);
    expect(hits(hi, DENY_HI)).toEqual([]);
    expect(hits(as, DENY_AS)).toEqual([]);
  });

  it('applies the Hindi denylist to Hindi, not the Assamese one', () => {
    // The same sentence that fails in Assamese must fail in Hindi too.
    expect(verdictFor({ en: 'Not armed on this device', as: 'इस डिवाइस में कोई हथियार नहीं है', back: 'ok', sim: 1, lang: 'hi' }).verdict).toBe('FAIL');
    // Devanagari words mean nothing to the Assamese list, and vice versa.
    expect(verdictFor({ en: 'Not armed on this device', as: 'इस डिवाइस में कोई हथियार नहीं है', back: 'ok', sim: 1, lang: 'as' }).verdict).toBe('PASS');
  });
});

describe('what fell back to English', () => {
  it('is listed, and only where the round trip really failed', () => {
    const fallbacks = Object.keys(STRINGS).filter((k) => hi[k].text === STRINGS[k]);
    const failed = Object.entries(hiReview.entries).filter(([, r]) => (r as { verdict: string }).verdict === 'FAIL').map(([k]) => k);
    expect(fallbacks.sort()).toEqual(failed.sort());
    // A regression that silently stopped translating would show up here.
    expect(fallbacks.length).toBeLessThan(Object.keys(STRINGS).length * 0.1);
  });
});
