import { describe, it, expect } from 'vitest';
import type { ReminderLog, TrialEvent } from '@/lib/db';
import { participation, today, MIN_DAYS_FOR_COMPARISON } from '@/lib/participation';

const NOW = new Date('2026-09-20T18:00:00.000Z').getTime();
const DAY = 864e5;
const person = { is_sample: false };

let n = 0;
function trial(daysAgo: number, over: Partial<TrialEvent> = {}): TrialEvent {
  return {
    id: `t${n++}`,
    person_id: 'p1',
    activity: 'familiar_pairs',
    activity_version: '1',
    difficulty: 1,
    cue: 'none',
    outcome: 'completed',
    policy_mode: 'baseline',
    model_version: 'saath-bb-1.0',
    synthetic: false,
    created_at: new Date(NOW - daysAgo * DAY).toISOString(),
    ...over,
  };
}

function log(daysAgo: number, outcome: ReminderLog['outcome']): ReminderLog {
  return { id: `l${n++}`, person_id: 'p1', reminder_id: 'r1', category: 'medicine', due_at: new Date(NOW - daysAgo * DAY).toISOString(), outcome };
}

describe('participation counts, and refuses to compare what it cannot', () => {
  it('says the first days are still being collected rather than drawing a trend', () => {
    const p = participation(person, [trial(0), trial(0)], [], NOW);
    expect(p.enough).toBe(false);
    expect(p.strip).toBe('strip.early');
    // Two sessions on one day is one day joined, not two.
    expect(p.daysJoinedThisWeek).toBe(1);
    expect(p.sessions30).toBe(2);
  });

  it('needs days across the two weeks before it will compare them', () => {
    const days = [0, 1, 8];
    expect(days).toHaveLength(MIN_DAYS_FOR_COMPARISON);
    expect(participation(person, days.map((d) => trial(d)), [], NOW).enough).toBe(true);
  });

  it('counts a quieter week as fewer, and a busier one as more', () => {
    const lastWeek = [8, 9, 10, 11, 12].map((d) => trial(d));
    const fewer = participation(person, [...lastWeek, trial(0)], [], NOW);
    expect(fewer.daysJoinedLastWeek).toBe(5);
    expect(fewer.daysJoinedThisWeek).toBe(1);
    expect(fewer.strip).toBe('strip.fewer');

    const more = participation(person, [...[0, 1, 2, 3, 4].map((d) => trial(d)), trial(9)], [], NOW);
    expect(more.strip).toBe('strip.more');
  });

  it('calls a one-day difference the same as usual', () => {
    const t = [...[0, 1, 2].map((d) => trial(d)), ...[7, 8, 9, 10].map((d) => trial(d))];
    expect(participation(person, t, [], NOW).strip).toBe('strip.usual');
  });

  it('says nothing has happened for three days when nothing has', () => {
    expect(participation(person, [4, 5, 6, 11].map((d) => trial(d)), [], NOW).strip).toBe('strip.quiet');
  });

  it('never claims a quiet stretch for a person who has never played', () => {
    expect(participation(person, [], [], NOW).strip).toBe('strip.early');
  });

  it('counts only sessions finished with no help as unaided', () => {
    const t = [trial(1), trial(1, { cue: 'highlight' }), trial(1, { outcome: 'not_completed' }), trial(8)];
    const p = participation(person, t, [], NOW);
    expect(p.unaidedThisWeek).toBe(1);
    expect(p.unaidedLastWeek).toBe(1);
  });

  it('compares reminder answering with this person own previous week, not with zero', () => {
    const logs = [log(1, 'done'), log(2, 'missed'), log(3, 'missed'), log(8, 'done'), log(9, 'done'), log(10, 'done')];
    const p = participation(person, [trial(1), trial(8), trial(9)], logs, NOW);
    expect(p.remindersDoneThisWeek).toBe(1);
    expect(p.remindersTotalThisWeek).toBe(3);
    expect(p.remindersDown).toBe(true);

    // No reminders at all last week: nothing to compare, so nothing is said.
    expect(participation(person, [trial(1)], [log(1, 'missed')], NOW).remindersDown).toBe(false);
  });

  it('ignores a synthetic row for a real person and keeps it for the sample', () => {
    const t = [trial(1, { synthetic: true })];
    expect(participation(person, t, [], NOW).sessions30).toBe(0);
    expect(participation({ is_sample: true }, t, [], NOW).sessions30).toBe(1);
  });

  it('counts the moods of the last seven days only', () => {
    const t = [trial(1, { mood: 'good' }), trial(2, { mood: 'good' }), trial(3, { mood: 'low' }), trial(20, { mood: 'low' })];
    expect(participation(person, t, [], NOW).moods).toEqual({ good: 2, ok: 0, low: 1 });
  });
});

describe('how today went', () => {
  it('says nothing is recorded rather than showing zeros', () => {
    expect(today(person, [trial(1)], [log(1, 'done')], NOW).empty).toBe(true);
  });

  it('counts only today rows', () => {
    const d = today(person, [trial(0), trial(0, { cue: 'highlight' }), trial(2)], [log(0, 'done'), log(0, 'missed'), log(5, 'done')], NOW);
    expect(d).toEqual({ activities: 2, unaided: 1, remindersDone: 1, remindersTotal: 2, empty: false });
  });
});
