import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { STRINGS } from '@/content/strings';
import { CATEGORIES, CategoryId, HOME_OBJECTS, REMINISCENCE_PROMPTS, bucketKey, itemKey, togetherKey } from '@/content/cstContent';
import { MONTHS, PARTS, SEASONS, WEEKDAYS, optKey } from '@/lib/orientation';
import { ACTIVITIES } from '@/content/activities';

/**
 * Fix pack A1: activity content was rendered as bare English literals, so an
 * Assamese profile saw English questions and options. Every name is now a key;
 * these tests make sure each key a component can build actually exists.
 */
const manifest = JSON.parse(fs.readFileSync(path.join('public', 'content', 'packs', 'regional', 'manifest.json'), 'utf8'));

describe('every activity-content key exists in STRINGS', () => {
  const expected = [
    ...HOME_OBJECTS.map((o) => itemKey(o.id)),
    ...(Object.keys(CATEGORIES) as CategoryId[]).map(bucketKey),
    ...PARTS.map((p) => optKey('period', p.name)),
    ...SEASONS.map((s) => optKey('season', s.name)),
    ...WEEKDAYS.map((w) => optKey('weekday', w)),
    ...MONTHS.map((m) => optKey('month', m)),
    ...REMINISCENCE_PROMPTS.flatMap((p) => (['theme', 'q', 'follow'] as const).map((part) => togetherKey(p.theme, part))),
    ...manifest.routines.flatMap((r: { id: string; steps: { id: string }[] }) => [`routine.${r.id}`, ...r.steps.map((s) => `step.${r.id}.${s.id}`)]),
  ];

  it('has all of them', () => {
    expect(expected.filter((k) => !(k in STRINGS))).toEqual([]);
  });

  it('keeps English item names in step with the object list', () => {
    for (const o of HOME_OBJECTS) expect(STRINGS[itemKey(o.id)]).toBe(o.label);
  });
});

/** The English literals the live test found on Assamese screens. */
const FORBIDDEN = [
  'What part of the day',
  'Which season are we in',
  'What day of the week',
  'Which month are we in',
  'Where does this belong',
  'Listen, then find',
  'Find this picture',
  'Find the pairs',
  'Find every sprig',
  'What do you do first',
  'what comes next',
  'Who is here?',
  'Tell me more',
  'Done talking',
  'Play again',
  'More activities',
  'still to find',
  'not enough new evidence',
];

describe('play screens render no hard-coded English content', () => {
  const walk = (d: string): string[] =>
    fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.tsx?$/.test(e.name) ? [path.join(d, e.name)] : []));
  const files = [path.join('src', 'components', 'play'), path.join('src', 'app', 'play')].flatMap(walk);

  for (const f of files) {
    it(`${f} has none`, () => {
      // Comments may quote the old copy to explain the change; code may not.
      const code = fs
        .readFileSync(f, 'utf8')
        .split(/\r?\n/)
        .filter((l) => !/^\s*(\/\/|\*|\/\*|\{\/\*)/.test(l))
        .map((l) => l.replace(/\s\/\/\s.*$/, ''))
        .join('\n');
      expect(FORBIDDEN.filter((phrase) => code.includes(phrase))).toEqual([]);
    });
  }
});

/**
 * Fix pack 10: "Why these activities" builds three keys per activity from the
 * stored activity id. A new activity, or a rename, silently prints the key
 * itself on screen unless this fails first.
 */
describe('the Why screen has a line for every activity', () => {
  it('works_on, similar_to and reason exist for all seven', () => {
    const expected = ACTIVITIES.flatMap((a) => ['works_on', 'similar_to', 'reason'].map((part) => `why.${a.activity}.${part}`));
    expect(expected.filter((k) => !(k in STRINGS))).toEqual([]);
    expect(expected).toHaveLength(21);
  });

  it('says on the screen itself that it is not a test', () => {
    expect(STRINGS['why.not_a_test']).toMatch(/not a medical test/i);
    expect(STRINGS['why.not_a_test']).toMatch(/no score/i);
  });

  it('names the DPDP Act without claiming certification', () => {
    expect(STRINGS['privacy.dpdp']).toContain('Digital Personal Data Protection Act, 2023');
    expect(STRINGS['privacy.dpdp']).toMatch(/not a claim of certification/i);
    expect(STRINGS['privacy.dpdp']).not.toMatch(/compliant|certified/i);
  });
});
