import { ContentPack, packsForPerson } from './db';

/**
 * 08 item 1: the hint said "These are your family's own photos" whenever an
 * approved pack existed — even when every card on screen was a regional
 * drawing. It is now decided from what the round actually shows.
 */
export type FamilyHintKey = 'notice.family_photos' | 'notice.some_family' | 'notice.add_photos';

export function familyHintKey(items: { fromFamily: boolean }[]): FamilyHintKey {
  const family = items.filter((i) => i.fromFamily).length;
  if (items.length > 0 && family === items.length) return 'notice.family_photos';
  if (family > 0) return 'notice.some_family';
  return 'notice.add_photos';
}

/**
 * A pack counts as content only if it carries something to show or hear. An
 * "approved" pack with no photo, recording or steps is treated as absent by
 * every activity that reads packs.
 */
export function packHasContent(p: ContentPack): boolean {
  return !!(p.media.photo || p.media.place_photo || p.media.audio_key || p.media.steps?.length);
}

/** The packs every activity reads: approved, and not empty. */
export async function usablePacks(personId: string): Promise<ContentPack[]> {
  return (await packsForPerson(personId, 'approved')).filter(packHasContent);
}
