import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db, putReminder, Reminder, ReminderLog } from '@/lib/db';
import { MISSED_AFTER_MIN, SNOOZE_MIN, dueAt, dueNow, reminderStatus, selectMissed, sweepMissed, logReminderResponse, todayStatuses } from '@/lib/reminders';

const PERSON = 'person-reminders';

function reminder(over: Partial<Reminder> = {}): Reminder {
  return {
    id: 'r1',
    person_id: PERSON,
    category: 'medicine',
    care_plan_text: 'One tablet after breakfast.',
    hour: 8,
    minute: 0,
    period: 'AM',
    version: 1,
    device_activated: false,
    ...over,
  };
}

/** 08:00 plus the given minutes, on a fixed day. */
function at(minutesAfterDue: number): Date {
  return new Date(2026, 8, 18, 8, minutesAfterDue, 0);
}

describe('the missed boundary', () => {
  const r = reminder();
  const none = new Set<string>();

  it(`does nothing at ${MISSED_AFTER_MIN - 1} minutes`, () => {
    expect(selectMissed([r], none, at(MISSED_AFTER_MIN - 1))).toEqual([]);
  });

  it(`does nothing exactly on the ${MISSED_AFTER_MIN} minute boundary`, () => {
    expect(selectMissed([r], none, at(MISSED_AFTER_MIN))).toEqual([]);
  });

  it(`marks missed at ${MISSED_AFTER_MIN + 1} minutes`, () => {
    expect(selectMissed([r], none, at(MISSED_AFTER_MIN + 1))).toHaveLength(1);
  });

  it('never marks one that was already answered', () => {
    expect(selectMissed([r], new Set([r.id]), at(120))).toEqual([]);
  });

  it('does not mark a reminder that is not due yet', () => {
    expect(selectMissed([r], none, at(-60))).toEqual([]);
  });
});

/** A log row for r1 answered `outcome` at `minutesAfterDue`. */
function log(outcome: ReminderLog['outcome'], minutesAfterDue: number): ReminderLog {
  return { id: `${outcome}${minutesAfterDue}`, person_id: PERSON, reminder_id: 'r1', category: 'medicine', due_at: at(0).toISOString(), responded_at: at(minutesAfterDue).toISOString(), outcome };
}

describe('reminderStatus (07 B1)', () => {
  const r = reminder();

  it('is upcoming before its time and due from its own minute to the missed boundary', () => {
    expect(reminderStatus(r, [], at(-1))).toBe('upcoming');
    expect(reminderStatus(r, [], at(0))).toBe('due');
    expect(reminderStatus(r, [], at(MISSED_AFTER_MIN))).toBe('due');
    expect(reminderStatus(r, [], at(MISSED_AFTER_MIN + 1))).toBe('missed');
  });

  it('Done ends it for the day', () => {
    expect(reminderStatus(r, [log('done', 3)], at(20))).toBe('done');
  });

  it(`Not now keeps it quiet for ${SNOOZE_MIN} minutes, then it is due again`, () => {
    expect(reminderStatus(r, [log('snoozed', 3)], at(3 + SNOOZE_MIN - 1))).toBe('snoozed');
    expect(reminderStatus(r, [log('snoozed', 3)], at(3 + SNOOZE_MIN))).toBe('due');
  });

  it('a snoozed reminder is never swept as missed — Not now was a press', () => {
    expect(selectMissed([r], new Set(['r1']), at(MISSED_AFTER_MIN + 60))).toEqual([]);
    expect(reminderStatus(r, [log('snoozed', 3)], at(MISSED_AFTER_MIN + 60))).toBe('due');
  });

  it('Done after the sweep wrote missed still counts as done', () => {
    expect(reminderStatus(r, [log('missed', MISSED_AFTER_MIN + 1), log('done', 45)], at(50))).toBe('done');
  });

  it('reads a PM reminder off the 24-hour clock, not the 12-hour one', () => {
    const evening = reminder({ hour: 5, minute: 30, period: 'PM' });
    expect(dueAt(evening, at(0)).getHours()).toBe(17);
  });
});

describe('sweepMissed', () => {
  beforeEach(async () => {
    await db.reminders.clear();
    await db.reminder_logs.clear();
  });

  it('writes one missed row, and is safe to run again', async () => {
    const r = reminder();
    await putReminder(r); // care_plan_text is encrypted at rest, so go through the repo

    expect(await sweepMissed(PERSON, at(MISSED_AFTER_MIN + 1))).toBe(1);
    expect(await db.reminder_logs.count()).toBe(1);

    // Running the sweep again must not pile up duplicate misses.
    expect(await sweepMissed(PERSON, at(MISSED_AFTER_MIN + 5))).toBe(0);
    expect(await db.reminder_logs.count()).toBe(1);
  });

  it('leaves an answered reminder alone', async () => {
    const r = reminder();
    await putReminder(r);
    await logReminderResponse(r, 'done', at(2));

    expect(await sweepMissed(PERSON, at(MISSED_AFTER_MIN + 1))).toBe(0);
    const logs = await db.reminder_logs.toArray();
    expect(logs).toHaveLength(1);
    expect(logs[0].outcome).toBe('done');
    expect(logs[0].responded_at).toBeTruthy();
  });

  it('Not now brings the card back after ten minutes, through dueNow', async () => {
    const r = reminder();
    await putReminder(r);
    await logReminderResponse(r, 'snoozed', at(2));
    expect(await dueNow(PERSON, at(5))).toEqual([]);
    expect((await dueNow(PERSON, at(2 + SNOOZE_MIN))).map((x) => x.id)).toEqual(['r1']);
    expect((await todayStatuses(PERSON, at(2 + SNOOZE_MIN)))[0].status).toBe('due');
  });
});
