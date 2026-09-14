import { LocalNotifications } from '@capacitor/local-notifications';
import { Reminder, putReminder, remindersForPerson } from './db';

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
