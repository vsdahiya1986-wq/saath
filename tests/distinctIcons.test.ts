import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { distinctIcons, duplicateIcons } from '@/lib/distinctIcons';
import { CATEGORIES, HOME_OBJECTS } from '@/content/cstContent';
import { PARTS, SEASONS } from '@/lib/orientation';

/**
 * 08 item 2: no option set may repeat an icon. Every set an activity can
 * generate is a subset of one of these sources, so if each source is
 * duplicate-free, every generated set is too.
 */
const manifest = JSON.parse(fs.readFileSync(path.join('public', 'content', 'packs', 'regional', 'manifest.json'), 'utf8'));

describe('every option source has distinct icons', () => {
  it('Today & Me: parts of the day (evening and night used to share a moon)', () => {
    expect(duplicateIcons(PARTS)).toEqual([]);
  });

  it('Today & Me: seasons (spring and autumn used to share a leaf)', () => {
    expect(duplicateIcons(SEASONS)).toEqual([]);
  });

  it('Hear & Find and Apon Mukh: the object pool', () => {
    expect(duplicateIcons(HOME_OBJECTS)).toEqual([]);
  });

  it('Sort the Home: the baskets', () => {
    expect(duplicateIcons(Object.values(CATEGORIES))).toEqual([]);
  });

  for (const r of manifest.routines) {
    it(`My Next Step: ${r.title}`, () => {
      expect(duplicateIcons(r.steps)).toEqual([]);
    });
  }
});

describe('distinctIcons guard', () => {
  it('fails loudly outside production', () => {
    expect(() => distinctIcons([{ icon: 'moon' }, { icon: 'moon' }], 'test')).toThrow(/moon/);
  });

  it('ignores options with no icon', () => {
    expect(distinctIcons([{}, {}, { icon: 'sun' }], 'test')).toHaveLength(3);
  });
});
