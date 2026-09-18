import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { SaathDB } from '@/lib/db';

/**
 * B9: v2 added compound indexes and three tables on top of v1. A device that
 * still has a v1 database must upgrade and keep every row.
 */
describe('Dexie v1 → v2 upgrade', () => {
  it('keeps existing rows and serves the new indexes and tables', async () => {
    await Dexie.delete('saath_v1');

    // Exactly the v1 schema as it shipped.
    const v1 = new Dexie('saath_v1');
    v1.version(1).stores({
      persons: 'id',
      members: 'id, person_id',
      packs: 'id, person_id, state',
      trials: 'id, person_id, activity, synced_at, [person_id+activity]',
      followups: 'id, person_id, state',
      reminders: 'id, person_id, category',
      handoffs: 'id, person_id, state',
      audit: 'id, at',
      blobs: 'key',
    });
    await v1.table('persons').put({ id: 'p1', display_name: 'x' });
    await v1.table('trials').put({ id: 't1', person_id: 'p1', activity: 'sound_sight', created_at: '2026-09-01T10:00:00.000Z' });
    await v1.table('packs').put({ id: 'k1', person_id: 'p1', state: 'approved' });
    v1.close();

    const v2 = new SaathDB();
    await v2.open();
    expect(v2.verno).toBe(2);
    expect(await v2.persons.get('p1')).toBeTruthy();
    expect(await v2.trials.where('[person_id+created_at]').between(['p1', Dexie.minKey], ['p1', Dexie.maxKey]).count()).toBe(1);
    expect(await v2.packs.where({ person_id: 'p1', state: 'approved' }).count()).toBe(1);
    expect(await v2.care_notes.count()).toBe(0);
    expect(await v2.nudges.count()).toBe(0);
    expect(await v2.reminder_logs.count()).toBe(0);
    v2.close();
  });
});
