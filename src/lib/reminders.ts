import { LocalNotifications } from '@capacitor/local-notifications';
import { v4 as uuid } from 'uuid';
import { db, Reminder, ReminderLog, putReminder, remindersForPerson } from './db';

export async function ensurePermission(): Promise<boolean> {
  const p = await LocalNotifications.requestPermissions();
  return p.display === 'granted';
}

function nextOccurrence(hour12: number, minute: number, period: 'AM' | 'PM'): Date {
  const h = period === 'PM' ? (hour12 % 12) + 12 : hour12 % 12;
  const d = new Date();
  d.setHours(h, minute, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

function titleFor(c: Reminder['category']): string {
  return { medicine: 'Medicine', hydration: 'Water', activity: 'Activity', appointment: 'Clinic' }[c];
}

export async function scheduleReminder(r: Reminder): Promise<void> {
  const id = r.native_notification_id ?? Math.floor(Math.random() * 2_000_000_000);
  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title: titleFor(r.category),
        body: r.care_plan_text, // care-plan text only, never generated
        schedule: { at: nextOccurrence(r.hour, r.minute, r.period), repeats: true, every: 'day' },
        sound: 'default',
        extra: { reminderId: r.id, personId: r.person_id, category: r.category },
      },
    ],
  });
  await putReminder({ ...r, native_notification_id: id, device_activated: true });
}

export async function cancelReminder(r: Reminder): Promise<void> {
  if (r.native_notification_id) {
    await LocalNotifications.cancel({ notifications: [{ id: r.native_notification_id }] });
  }
}

/** Re-arm everything after a reboot or app cold start. */
export async function rearmAll(personId: string): Promise<void> {
  const rs = await remindersForPerson(personId);
  for (const r of rs) await scheduleReminder(r);
}

export const CUE_KEY: Record<Reminder['category'], string> = {
  medicine: 'remind.medicine',
  hydration: 'remind.hydration',
  activity: 'remind.activity',
  appointment: 'remind.appointment',
};

/**
 * Per-category tint (SIH26003 visual-identity pass, same rule as
 * content/activities.ts's DOMAIN_COLOR) — deliberately excludes --alert's red
 * so a category colour is never mistaken for the independent "this one is
 * overdue" signal, which stays red regardless of category everywhere it's
 * used. All three are already ≥4.5:1 against white, reused from the existing
 * DOMAIN_COLOR / --accent-warm tokens rather than invented fresh.
 */
export const CATEGORY_COLOR: Record<Reminder['category'], string> = {
  medicine: '#6d28d9',
  hydration: '#0369a1',
  activity: '#065f46',
  appointment: '#b45309',
};

/**
 * SIH26003 (e): "overdue/urgent reminders unmistakably distinct (color +
 * icon + position), not just a small warning icon." Reminder rows only
 * store a recurring daily hour/minute/period — there is no per-day "done
 * today" record, so "overdue" is the honest thing this screen CAN derive
 * without touching the data layer: has today's clock already passed this
 * reminder's time. It resets itself every midnight for free, by the same
 * logic, with no stored state to go stale.
 */
export function minutesSinceMidnight(hour12: number, minute: number, period: 'AM' | 'PM'): number {
  const h = period === 'PM' ? (hour12 % 12) + 12 : hour12 % 12;
  return h * 60 + minute;
}

export function isOverdue(r: Reminder): boolean {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return minutesSinceMidnight(r.hour, r.minute, r.period) < nowMinutes;
}

/** Overdue reminders float to the top; within each group, soonest first. */
export function sortReminders(reminders: Reminder[]): Reminder[] {
  return [...reminders].sort((a, b) => {
    const overdueDiff = Number(isOverdue(b)) - Number(isOverdue(a));
    if (overdueDiff !== 0) return overdueDiff;
    return minutesSinceMidnight(a.hour, a.minute, a.period) - minutesSinceMidnight(b.hour, b.minute, b.period);
  });
}

export function formatTime(r: Reminder): string {
  return `${r.hour}:${String(r.minute).padStart(2, '0')} ${r.period}`;
}

// ---------------------------------------------------------------------------
// F2: a reminder that rings but records nothing is not a reminder. Every time
// one comes due it ends up as exactly one reminder_logs row — answered by the
// person, or written as 'missed' by the sweep below.
// ---------------------------------------------------------------------------

/** A reminder is considered missed once this long has passed with no answer. */
export const MISSED_AFTER_MIN = 30;

/** Today's occurrence of a recurring reminder, as a timestamp. */
export function dueAt(r: Reminder, now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, minutesSinceMidnight(r.hour, r.minute, r.period), 0, 0);
  return d;
}

/**
 * Pure decision, so the boundary is testable without a database: which of
 * today's due reminders have gone unanswered long enough to count as missed.
 */
export function selectMissed(reminders: Reminder[], answeredIds: Set<string>, now = new Date()): Reminder[] {
  return reminders.filter((r) => {
    if (answeredIds.has(r.id)) return false;
    const elapsedMin = (now.getTime() - dueAt(r, now).getTime()) / 60_000;
    return elapsedMin > MISSED_AFTER_MIN;
  });
}

/** Today's reminders that are due now and still unanswered (drives the due card). */
export function selectDue(reminders: Reminder[], answeredIds: Set<string>, now = new Date()): Reminder[] {
  return sortReminders(
    reminders.filter((r) => {
      if (answeredIds.has(r.id)) return false;
      const elapsedMin = (now.getTime() - dueAt(r, now).getTime()) / 60_000;
      return elapsedMin >= 0 && elapsedMin <= MISSED_AFTER_MIN;
    })
  );
}

async function logsForToday(personId: string, now: Date): Promise<ReminderLog[]> {
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const rows = await db.reminder_logs.where({ person_id: personId }).toArray();
  return rows.filter((l) => new Date(l.due_at).getTime() >= midnight.getTime());
}

export async function putReminderLog(log: ReminderLog): Promise<void> {
  await db.reminder_logs.put(log);
}

/** Records what the person chose on the due card. */
export async function logReminderResponse(r: Reminder, outcome: 'done' | 'snoozed', now = new Date()): Promise<void> {
  await putReminderLog({
    id: uuid(),
    person_id: r.person_id,
    reminder_id: r.id,
    category: r.category,
    due_at: dueAt(r, now).toISOString(),
    responded_at: now.toISOString(),
    outcome,
  });
}

/**
 * Writes a 'missed' row for anything that came due today and was never
 * answered. Idempotent: a reminder already logged today is left alone, so this
 * can run on every app start.
 */
export async function sweepMissed(personId: string, now = new Date()): Promise<number> {
  const reminders = await remindersForPerson(personId);
  const logged = new Set((await logsForToday(personId, now)).map((l) => l.reminder_id));
  const missed = selectMissed(reminders, logged, now);
  for (const r of missed) {
    await putReminderLog({
      id: uuid(),
      person_id: personId,
      reminder_id: r.id,
      category: r.category,
      due_at: dueAt(r, now).toISOString(),
      outcome: 'missed',
    });
  }
  return missed.length;
}

/** Today's unanswered, currently-due reminders, after sweeping the stale ones. */
export async function dueNow(personId: string, now = new Date()): Promise<Reminder[]> {
  await sweepMissed(personId, now);
  const reminders = await remindersForPerson(personId);
  const logged = new Set((await logsForToday(personId, now)).map((l) => l.reminder_id));
  return selectDue(reminders, logged, now);
}

export type RingCapability = 'native' | 'web' | 'in_app' | 'permission_needed';

/**
 * How this device can actually ring, so the Reminders screen can say so rather
 * than fail silently. Capacitor's LocalNotifications resolves on the web too,
 * but only the native shell can wake the device, so native is detected by the
 * Capacitor bridge being present.
 */
export async function ringCapability(): Promise<RingCapability> {
  const native = typeof window !== 'undefined' && !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
  if (native) return 'native';
  if (typeof Notification === 'undefined') return 'in_app';
  if (Notification.permission === 'granted') return 'web';
  return 'permission_needed';
}

export const RING_STATUS_TEXT: Record<RingCapability, string> = {
  native: 'Will ring on this device',
  web: 'Will ring in this browser while it is open',
  in_app: 'This browser cannot ring — install the app',
  permission_needed: 'Permission needed to ring',
};
