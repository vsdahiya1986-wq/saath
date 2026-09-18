import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db, putReminder, Reminder } from '@/lib/db';
import { MISSED_AFTER_MIN, dueAt, selectDue, selectMissed, sweepMissed, logReminderResponse } from '@/lib/reminders';

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

describe('what counts as due now', () => {
  const r = reminder();
  const none = new Set<string>();

  it('is due from its own minute until the missed boundary', () => {
    expect(selectDue([r], none, at(0))).toHaveLength(1);
    expect(selectDue([r], none, at(MISSED_AFTER_MIN))).toHaveLength(1);
  });

  it('is not due before its time, or once it is missed', () => {
    expect(selectDue([r], none, at(-1))).toEqual([]);
    expect(selectDue([r], none, at(MISSED_AFTER_MIN + 1))).toEqual([]);
  });

  it('drops out as soon as it is answered', () => {
    expect(selectDue([r], new Set([r.id]), at(5))).toEqual([]);
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
});
