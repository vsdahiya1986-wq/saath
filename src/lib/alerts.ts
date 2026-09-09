import { db, membersForPerson } from './db';
import { transition } from './events';
import { Network } from '@capacitor/network';

/** On-call member for today, preferring one reachable on the local network. */
async function pickTarget(personId: string) {
  const today = new Date().getDay();
  const members = await membersForPerson(personId);
  const onCall = members.filter((m) => m.consented && m.on_call_days.includes(today));
  return onCall.find((m) => !!m.lan_url) ?? onCall[0] ?? members.find((m) => m.consented);
}

export async function routeHelpRequest(followupId: string, personId: string): Promise<void> {
  const target = await pickTarget(personId);
  if (!target) return;

  // 1) Try the local network first — works with no internet at all.
  if (target.lan_url) {
    try {
      const res = await fetch(`${target.lan_url}/api/circle-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followupId, personId, at: new Date().toISOString() }),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        await transition(followupId, 'circle_notified_local', `LAN -> ${target.name}`);
        await db.members.update(target.id, { load_count: (target.load_count ?? 0) + 1, last_on_call: new Date().toISOString() });
        return;
      }
    } catch {
      // fall through — genuinely offline or member away
    }
  }

  // 2) Otherwise queue for the server. Only mark eligible if we actually have a path.
  const status = await Network.getStatus();
  if (status.connected) {
    await transition(followupId, 'eligible', 'queued for server');
  }
  // If neither, it stays stored_locally — and the UI says exactly that.
}
