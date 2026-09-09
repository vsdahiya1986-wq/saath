import { db, FollowupItem, FollowupState } from './db';
import { v4 as uuid } from 'uuid';

const LEGAL: Record<FollowupState, FollowupState[]> = {
  stored_locally: ['circle_notified_local', 'eligible', 'cancelled', 'expired'],
  circle_notified_local: ['acknowledged', 'eligible', 'cancelled', 'expired'],
  eligible: ['submitting', 'cancelled', 'expired'],
  submitting: ['submitted', 'submission_unknown'],
  submitted: ['delivered', 'acknowledged', 'submission_unknown'],
  submission_unknown: ['submitted', 'delivered', 'acknowledged'], // never back to eligible
  delivered: ['acknowledged'],
  acknowledged: ['resolved'],
  resolved: [],
  cancelled: [],
  expired: [],
};

export async function createHelpRequest(personId: string, ttlMinutes = 120): Promise<FollowupItem> {
  const now = new Date();
  const item: FollowupItem = {
    id: uuid(),
    person_id: personId,
    origin: 'help_request',
    state: 'stored_locally',
    attempts: 0,
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + ttlMinutes * 60000).toISOString(),
    history: [{ state: 'stored_locally', at: now.toISOString() }],
  };
  await db.followups.put(item);
  return item;
}

export async function transition(id: string, next: FollowupState, note?: string): Promise<FollowupItem> {
  const item = await db.followups.get(id);
  if (!item) throw new Error('followup not found');

  // Idempotent: repeating an accepted transition is a no-op, not a duplicate effect.
  if (item.state === next) return item;

  if (!LEGAL[item.state].includes(next)) {
    throw new Error(`Illegal transition ${item.state} -> ${next}`);
  }

  item.state = next;
  item.history.push({ state: next, at: new Date().toISOString(), note });
  if (next === 'submitting') item.attempts += 1;
  await db.followups.put(item);
  return item;
}

export async function expireStale(): Promise<void> {
  const now = Date.now();
  const open = await db.followups.where('state').anyOf('stored_locally', 'circle_notified_local', 'eligible').toArray();
  for (const i of open) {
    if (new Date(i.expires_at).getTime() < now) await transition(i.id, 'expired', 'ttl');
  }
}
