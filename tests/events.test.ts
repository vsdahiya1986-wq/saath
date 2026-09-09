import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import { createHelpRequest, transition, expireStale } from '@/lib/events';

describe('follow-up state machine', () => {
  beforeEach(async () => {
    await db.followups.clear();
  });

  it('never returns submission_unknown to eligible (duplicate-call guard)', async () => {
    const i = await createHelpRequest('p1');
    await transition(i.id, 'eligible');
    await transition(i.id, 'submitting');
    await transition(i.id, 'submission_unknown');
    await expect(transition(i.id, 'eligible')).rejects.toThrow(/Illegal/);
  });

  it('is idempotent — repeating a transition is a no-op', async () => {
    const i = await createHelpRequest('p1');
    await transition(i.id, 'eligible');
    const before = (await db.followups.get(i.id))!.history.length;
    await transition(i.id, 'eligible');
    const after = (await db.followups.get(i.id))!.history.length;
    expect(after).toBe(before);
  });

  it('does not treat delivery as acknowledgment', async () => {
    const i = await createHelpRequest('p1');
    await transition(i.id, 'eligible');
    await transition(i.id, 'submitting');
    await transition(i.id, 'submitted');
    await transition(i.id, 'delivered');
    expect((await db.followups.get(i.id))!.state).toBe('delivered');
    await expect(transition(i.id, 'resolved')).rejects.toThrow(/Illegal/);
  });

  it('expires stale items instead of escalating them', async () => {
    const i = await createHelpRequest('p1', -1); // already expired
    await expireStale();
    expect((await db.followups.get(i.id))!.state).toBe('expired');
  });

  it('records a full audit history', async () => {
    const i = await createHelpRequest('p1');
    await transition(i.id, 'circle_notified_local', 'LAN -> Bina');
    await transition(i.id, 'acknowledged', 'Bina pressed acknowledge');
    const f = (await db.followups.get(i.id))!;
    expect(f.history.map((h) => h.state)).toEqual(['stored_locally', 'circle_notified_local', 'acknowledged']);
  });
});
