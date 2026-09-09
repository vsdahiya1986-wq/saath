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
