import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db, FollowupItem, Person, ReminderLog, TrialEvent } from '@/lib/db';
import { nudgeCandidates, nudgeText, refreshNudges } from '@/lib/nudges';
import { loadSample, SAMPLE_PERSON_ID } from '@/lib/sampleData';

const NOW = new Date('2026-09-18T12:00:00');
const DAY = 864e5;
const ago = (days: number) => new Date(NOW.getTime() - days * DAY).toISOString();

const person = { id: 'p1', display_name: 'Aita', created_at: ago(30) } as Person;

let seq = 0;
function trial(daysAgo: number, over: Partial<TrialEvent> = {}): TrialEvent {
  return {
    id: `t${seq++}`,
    person_id: 'p1',
    activity: 'sound_sight',
    activity_version: '1',
    difficulty: 2,
    cue: 'none',
    outcome: 'completed',
    policy_mode: 'baseline',
    model_version: 'x',
    synthetic: false,
    created_at: ago(daysAgo),
    ...over,
  };
}

function kinds(input: { logs?: ReminderLog[]; trials?: TrialEvent[]; followups?: FollowupItem[]; p?: Person }) {
  return nudgeCandidates({ person: input.p ?? person, logs: input.logs ?? [], trials: input.trials ?? [trial(0.5)], followups: input.followups ?? [], now: NOW }).map((n) => n.kind);
}

const log = (category: ReminderLog['category'], outcome: ReminderLog['outcome']): ReminderLog => ({
  id: `${category}-${outcome}`,
  person_id: 'p1',
  reminder_id: 'r',
  category,
  due_at: ago(1),
  outcome,
});

describe('Circle Nudges (F7)', () => {
  it('stays silent when nothing happened', () => {
    expect(kinds({})).toEqual([]);
  });

  it('medicine_missed: a missed medicine log, not a missed water or a done dose', () => {
    expect(kinds({ logs: [log('medicine', 'done'), log('hydration', 'missed')] })).toEqual([]);
    expect(kinds({ logs: [log('medicine', 'missed')] })).toEqual(['medicine_missed']);
  });

  it('quiet_days: at two days without a completed activity, not before', () => {
    expect(kinds({ trials: [trial(1.9)] })).toEqual([]);
    expect(kinds({ trials: [trial(2)] })).toEqual(['quiet_days']);
    expect(kinds({ trials: [trial(0.5, { outcome: 'not_completed' }), trial(3)] })).toEqual(['quiet_days']);
  });

  it('quiet_days: never for a profile made yesterday', () => {
    expect(kinds({ trials: [], p: { ...person, created_at: ago(1) } })).toEqual([]);
  });

  it('help_pressed: one per help request, not per missed check-in', () => {
    const f = { id: 'f1', origin: 'help_request', created_at: ago(0.1) } as FollowupItem;
    expect(kinds({ followups: [f, { ...f, id: 'f2', origin: 'missed_checkin' }] })).toEqual(['help_pressed']);
  });

  it('steadier_help: help in at least 60% of at least 5 sessions this week', () => {
    const helped = (n: number, days = 1) => Array.from({ length: n }, () => trial(days, { cue: 'highlight' }));
    const plain = (n: number) => Array.from({ length: n }, () => trial(1));
    expect(kinds({ trials: helped(4) })).toEqual([]); // too few sessions
    expect(kinds({ trials: [...helped(2), ...plain(3)] })).toEqual([]); // 40%
    expect(kinds({ trials: [...helped(3), ...plain(2)] })).toEqual(['steadier_help']); // 60%
    expect(kinds({ trials: [...helped(5, 8), trial(0.5)] })).toEqual([]); // older than a week
  });

  it('ignores synthetic trials for a real person', () => {
    expect(kinds({ trials: [trial(0.5, { synthetic: true }), trial(3)] })).toEqual(['quiet_days']);
  });

  it('uses the fixed wording and no alarming words', () => {
    const texts = (['medicine_missed', 'quiet_days', 'help_pressed', 'steadier_help'] as const).map((kind) => nudgeText({ kind, detail: '8:00 am' }, 'Aita'));
    expect(texts[0]).toBe('Medicine at 8:00 am was not marked done.');
    expect(texts[1]).toBe('No activities for two days.');
    expect(texts[2]).toBe('Aita asked for help at 8:00 am.');
    for (const text of texts) expect(text).not.toMatch(/declin|worsen|risk/i);
  });
});

describe('refreshNudges', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('is idempotent and never re-opens an acknowledged nudge', async () => {
    await loadSample(NOW.getTime());
    const p = (await db.persons.get(SAMPLE_PERSON_ID))!;
    await refreshNudges(p, NOW);
    const count = await db.nudges.count();
    const [n] = await db.nudges.toArray();
    await db.nudges.update(n.id, { state: 'acknowledged' });

    await refreshNudges(p, NOW);
    expect(await db.nudges.count()).toBe(count);
    expect((await db.nudges.get(n.id))!.state).toBe('acknowledged');
  });

  it('does not double the sample nudge', async () => {
    await loadSample(NOW.getTime());
    await refreshNudges((await db.persons.get(SAMPLE_PERSON_ID))!, NOW);
    const meds = (await db.nudges.toArray()).filter((x) => x.kind === 'medicine_missed');
    expect(meds).toHaveLength(1);
  });
});
