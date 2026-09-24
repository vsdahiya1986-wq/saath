import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { romanize, skeleton, soundsLike, findTransliterations } from '../scripts/romanize-as.mjs';

const allow: string[] = JSON.parse(
  fs.readFileSync(path.join('scripts', 'translation-allowlist.json'), 'utf8'),
).proper_nouns;

/**
 * The defect this file exists for. `home_intro` shipped as
 * "প্লে, হেল্প, বা টুডে" — Play, Help and Today spelled out as sounds in
 * Assamese script. An elder who does not read English hears noise, and the
 * round-trip gate passed it at 0.85 similarity, because reading a
 * transliteration back recovers the English perfectly. Sound is the only
 * signal that separates the two, so these tests work in sound.
 */
const CONTROLS = ['Play', 'Help', 'Today', 'Continue', 'Finish', 'Done'];
const find = (en: string, target: string) => findTransliterations(en, target, { allow, controls: CONTROLS });

describe('romanize', () => {
  it('sounds out Bengali-Assamese consonants with their inherent vowel', () => {
    expect(romanize('হেল্প')).toBe('helpa');
  });

  it('applies a matra in place of the inherent vowel', () => {
    expect(romanize('টেপ')).toBe('tepa');
  });

  it('honours the virama, which suppresses the inherent vowel', () => {
    expect(romanize('প্লে')).toBe('ple');
  });

  it('reads Devanagari as well as Bengali-Assamese', () => {
    expect(romanize('हेल्प')).toBe('helpa');
  });

  it('leaves text in neither script alone', () => {
    expect(romanize('Play')).toBe('Play');
  });
});

describe('skeleton', () => {
  it('folds spellings English and Indic script disagree on', () => {
    expect(skeleton('card')).toBe(skeleton('karda'));
  });

  it('treats y as a vowel, so play and ple share a spine', () => {
    expect(skeleton('play')).toBe('pl');
  });
});

describe('soundsLike', () => {
  it.each([
    ['প্লে', 'Play'],
    ['হেল্প', 'Help'],
    ['টুডে', 'Today'],
    ['ষ্টপ', 'Stop'],
    ['ৰুটিন', 'routine'],
    ['क्लिनिक', 'clinic'],
  ])('hears %s as English %s', (native, english) => {
    expect(soundsLike(native, english)).toBe(true);
  });

  it.each([
    ['না', 'no'],
    ['আৰু', 'and'],
    ['ঘৰ', 'home'],
    ['দিন', 'day'],
  ])('does not mistake the native word %s for %s', (native, english) => {
    expect(soundsLike(native, english)).toBe(false);
  });

  it('needs two consonants, so short words cannot collide by accident', () => {
    expect(soundsLike('না', 'no')).toBe(false);
  });
});

describe('findTransliterations', () => {
  it('blocks the original home_intro defect', () => {
    const found = find(
      'This is your memory companion. Choose Play, Help, or Today.',
      'এয়া আপোনাৰ স্মৃতিৰ সংগী। প্লে, হেল্প, বা টুডে বাছনি কৰক।',
    );
    expect(found.filter((f) => f.severity === 'blocking').map((f) => f.english))
      .toEqual(['Play', 'Help', 'Today']);
  });

  it('blocks the same defect in Hindi', () => {
    const found = find(
      'This is your memory companion. Choose Play, Help, or Today.',
      'यह आपकी स्मृति साथी है। प्ले, हेल्प या टुडे चुनें।',
    );
    expect(found.some((f) => f.severity === 'blocking')).toBe(true);
  });

  it('only warns on an ordinary loanword — that is how people speak', () => {
    const found = find('Tap the basket where this belongs.', 'এইটো য\'ত আছে সেই বাকচত টেপ কৰক।');
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ english: 'Tap', severity: 'warning', why: 'loanword' });
  });

  it('stays silent on a proper noun, whose correct rendering is its sound', () => {
    expect(find('Saah Pat · Tea Leaf', 'চাহ পাত · চাহ পাত')).toEqual([]);
  });

  it('says nothing when the translation is a real translation', () => {
    expect(find(
      'This is your memory companion. You can start an activity, look at your day, or ask for help.',
      'এয়া আপোনাৰ স্মৃতিৰ সংগী। আপুনি এটা কাৰ্য্যকলাপ আৰম্ভ কৰিব পাৰে, আপোনাৰ দিনটো চাব পাৰে বা সহায় বিচাৰিব পাৰে।',
    )).toEqual([]);
  });

  it('compares only within one string, so the corpus cannot cross-fire', () => {
    expect(find('Rest now', 'এয়া আপোনাৰ স্মৃতিৰ সংগী।')).toEqual([]);
  });
});

/** What actually ships must carry no blocking finding, in either language. */
describe('the shipped manifests', () => {
  const review = (lang: string) =>
    JSON.parse(fs.readFileSync(path.join('docs', `i18n-review${lang === 'hi' ? '.hi' : ''}.json`), 'utf8')).entries;

  it.each(['as', 'hi'])('%s ships no control named as a sound', (lang) => {
    const manifest = JSON.parse(fs.readFileSync(path.join('public', 'content', 'lang', lang, 'manifest.json'), 'utf8'));
    const entries = review(lang);
    const blocking: string[] = [];
    for (const [key, value] of Object.entries<{ text?: string }>(manifest)) {
      const en = entries[key]?.en;
      if (!en || !value.text || value.text === en) continue;
      for (const f of find(en, value.text)) {
        if (f.severity === 'blocking') blocking.push(`${key}: ${f.native} ≈ ${f.english}`);
      }
    }
    expect(blocking).toEqual([]);
  });
});
