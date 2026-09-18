import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import { todayStatuses } from '@/lib/reminders';
import { buildSampleTrials, clearSample, loadSample, sampleLoaded, SAMPLE_DAYS, SAMPLE_PERSON_ID } from '@/lib/sampleData';

const NOW = new Date(2026, 8, 18, 12, 0, 0).getTime();

describe("Aita's Day (F1)", () => {
  beforeEach(async () => {
    await Promise.all([db.persons.clear(), db.trials.clear(), db.reminders.clear(), db.reminder_logs.clear(), db.members.clear(), db.packs.clear(), db.blobs.clear()]);
  });

  it('is deterministic — two builds are identical apart from row ids', () => {
    // Row ids are uuids by design; everything that shapes a screenshot must match.
    const withoutId = (rows: ReturnType<typeof buildSampleTrials>) => rows.map((r) => ({ ...r, id: '' }));
    expect(withoutId(buildSampleTrials(NOW))).toEqual(withoutId(buildSampleTrials(NOW)));
  });

  it('populates every screen a judge will open', async () => {
    await loadSample(NOW);

    expect(await sampleLoaded()).toBe(true);
    expect(await db.trials.where({ person_id: SAMPLE_PERSON_ID }).count()).toBeGreaterThan(SAMPLE_DAYS);
    expect(await db.reminders.where({ person_id: SAMPLE_PERSON_ID }).count()).toBe(4);
    expect(await db.members.where({ person_id: SAMPLE_PERSON_ID }).count()).toBe(3);
    expect(await db.packs.where({ person_id: SAMPLE_PERSON_ID }).count()).toBe(2);
    expect(await db.reminder_logs.where({ person_id: SAMPLE_PERSON_ID }).count()).toBeGreaterThan(40);
    expect(await db.care_notes.where({ person_id: SAMPLE_PERSON_ID }).count()).toBe(3);
    const nudges = await db.nudges.where({ person_id: SAMPLE_PERSON_ID }).toArray();
    expect(nudges.map((n) => [n.kind, n.state])).toEqual([['medicine_missed', 'open']]);
  });

  it('is labelled as a sample everywhere it could be mistaken for a person', async () => {
    await loadSample(NOW);
    const person = await db.persons.get(SAMPLE_PERSON_ID);
    expect(person!.is_sample).toBe(true);
    expect(person!.consent_ref).toBe('SAMPLE-CONSENT-001');
  });

  it('never gives the engine invented evidence', async () => {
    await loadSample(NOW);
    const trials = await db.trials.where({ person_id: SAMPLE_PERSON_ID }).toArray();
    expect(trials.every((t) => t.synthetic)).toBe(true);
  });

  /** 07 B2: loaded at any hour, today's cards must not all be late. */
  for (const hour of [7, 12, 19, 22]) {
    it(`greets the person calmly when loaded at ${hour}:00 — one upcoming, none missed today`, async () => {
      const at = new Date(2026, 8, 18, hour, 0, 0);
      await loadSample(at.getTime());
      const statuses = await todayStatuses(SAMPLE_PERSON_ID, at);
      expect(statuses.some((x) => x.status === 'upcoming')).toBe(true);
      expect(statuses.every((x) => x.status === 'missed' || x.status === 'due')).toBe(false);
      expect(statuses.filter((x) => x.status === 'missed')).toEqual([]);
    });
  }

  it('has exactly the two missed doses the caregiver features need', async () => {
    await loadSample(NOW);
    const logs = await db.reminder_logs.where({ person_id: SAMPLE_PERSON_ID }).toArray();
    expect(logs.filter((l) => l.outcome === 'missed')).toHaveLength(2);
  });

  it('leaves exactly one sample person when loaded twice', async () => {
    await loadSample(NOW);
    const firstTrials = await db.trials.count();
    await loadSample(NOW);

    expect(await db.persons.count()).toBe(1);
    expect(await db.trials.count()).toBe(firstTrials);
    expect(await db.reminders.count()).toBe(4);
  });

  it('removes every row and blob it created', async () => {
    await loadSample(NOW);
    expect(await db.blobs.count()).toBe(2);

    await clearSample();

    expect(await sampleLoaded()).toBe(false);
    // 07 D1: every table the database has, not a hand-kept list — a table
    // added later cannot be forgotten. The audit log keeps its one deletion record.
    for (const table of db.tables.filter((tb) => tb.name !== 'audit')) {
      expect(await table.count(), table.name).toBe(0);
    }
    const audit = await db.audit.toArray();
    expect(audit.every((a) => a.action === 'delete_person' && a.scope === SAMPLE_PERSON_ID)).toBe(true);
  });

  it('can be cleared when it was never loaded', async () => {
    await expect(clearSample()).resolves.toBeUndefined();
  });

  it('does not leave a real person behind when the sample is cleared', async () => {
    await db.persons.put({
      id: 'real-person',
      display_name: 'encrypted',
      language: 'en',
      literacy: 'basic',
      navigation: 'visual',
      care_config: {
        max_difficulty: 2,
        allowed_cues: ['none'],
        excluded_pack_ids: [],
        sensory_mode: 'both',
        source: 'caregiver_preference',
        set_by: 'test',
        set_at: new Date(NOW).toISOString(),
        clinical_stage_supplied: false,
      },
      consent_ref: 'REAL-1',
      created_at: new Date(NOW).toISOString(),
    });

    await loadSample(NOW);
    await clearSample();

    expect(await db.persons.count()).toBe(1);
    expect((await db.persons.toArray())[0].id).toBe('real-person');
  });
});
