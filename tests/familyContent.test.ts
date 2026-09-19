import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { ContentPack, db, putPack } from '@/lib/db';
import { familyHintKey, packHasContent, usablePacks } from '@/lib/familyContent';

/** 08 item 1: the hint must describe what is on screen, not whether a pack exists. */
describe('familyHintKey', () => {
  const family = { fromFamily: true };
  const drawing = { fromFamily: false };

  it('says a family can add photos when nothing on screen came from the family', () => {
    expect(familyHintKey([drawing, drawing, drawing])).toBe('notice.add_photos');
    expect(familyHintKey([])).toBe('notice.add_photos');
  });

  it('says "some of these" for a mix', () => {
    expect(familyHintKey([family, drawing, drawing])).toBe('notice.some_family');
  });

  it('says "these are your family’s" only when every item is theirs', () => {
    expect(familyHintKey([family, family])).toBe('notice.family_photos');
  });
});

describe('an approved pack with nothing in it is treated as absent', () => {
  const pack = (id: string, media: ContentPack['media']): ContentPack => ({
    id,
    person_id: 'p1',
    version: 1,
    kind: 'object',
    title: id,
    is_current_location: false,
    media,
    recorded_by: 'm1',
    language: 'en',
    state: 'approved',
    permitted_uses: ['play', 'together'],
  });

  beforeEach(async () => {
    await db.packs.clear();
  });

  it('packHasContent needs a photo, a recording or steps', () => {
    expect(packHasContent(pack('empty', {}))).toBe(false);
    expect(packHasContent(pack('empty-steps', { steps: [] }))).toBe(false);
    expect(packHasContent(pack('photo', { photo: 'k' }))).toBe(true);
    expect(packHasContent(pack('voice', { audio_key: 'a' }))).toBe(true);
    expect(packHasContent(pack('routine', { steps: ['Wake up'] }))).toBe(true);
  });

  it('usablePacks, which every activity reads, leaves the empty one out', async () => {
    await putPack(pack('empty', {}));
    await putPack(pack('photo', { photo: 'k' }));
    expect((await usablePacks('p1')).map((p) => p.id)).toEqual(['photo']);
  });
});
