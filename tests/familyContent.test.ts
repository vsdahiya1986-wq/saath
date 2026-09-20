import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { ContentPack, db, putBlob, putPack } from '@/lib/db';
import { familyHintKey, packHasContent, packPhotoUrl, usablePacks } from '@/lib/familyContent';
import { encryptBlob } from '@/lib/crypto';

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

/**
 * 09 items 1 and 2. `packPhotoUrl` is the only route from a pack to an
 * `<img src>`, so both bugs are provable here: a round built from packs that
 * resolve to no picture counts zero family items, and a voice note keyed as a
 * photo never becomes a URL.
 */
describe('packPhotoUrl guards what reaches an <img>', () => {
  const pack = (id: string, media: ContentPack['media']): ContentPack => ({
    id,
    person_id: 'p2',
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
    await db.blobs.clear();
    // jsdom has no object-URL support.
    URL.createObjectURL = ((b: Blob) => `blob:${b.type}`) as typeof URL.createObjectURL;
  });

  it('a voice note stored under a photo key does not become a picture', async () => {
    await putBlob('voice-as-photo', new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/webm' }));
    expect(await packPhotoUrl(pack('a', { photo: 'voice-as-photo' }))).toBeUndefined();
  });

  it('a missing blob does not become a picture', async () => {
    expect(await packPhotoUrl(pack('b', { photo: 'never-stored' }))).toBeUndefined();
    expect(await packPhotoUrl(pack('c', {}))).toBeUndefined();
  });

  it('a real photo does', async () => {
    // fake-indexeddb hands back a structured clone without `arrayBuffer()`, so the
    // stored row is stubbed rather than round-tripped through the fake store.
    const encrypted = await encryptBlob(new Blob([new Uint8Array([1])], { type: 'image/jpeg' }));
    vi.spyOn(db.blobs, 'get').mockResolvedValue({ key: 'real', blob: encrypted, mime: 'image/jpeg', at: '' });
    expect(await packPhotoUrl(pack('d', { photo: 'real' }))).toBe('blob:image/jpeg');
    vi.restoreAllMocks();
  });

  it('a round built only from packs that hold no picture counts no family items', async () => {
    await putBlob('voice', new Blob([new Uint8Array([9])], { type: 'audio/webm' }));
    await putPack(pack('empty', {}));
    await putPack(pack('voice-only', { audio_key: 'voice' }));
    await putPack(pack('photo-key-is-audio', { photo: 'voice' }));

    const cards = await Promise.all(
      (await usablePacks('p2')).map(async (p) => ({ fromFamily: !!(await packPhotoUrl(p)) })),
    );
    expect(cards.filter((c) => c.fromFamily)).toHaveLength(0);
    expect(familyHintKey(cards)).toBe('notice.add_photos');
  });
});
