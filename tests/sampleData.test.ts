import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
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
    expect(await db.reminders.where({ person_id: SAMPLE_PERSON_ID }).count()).toBe(8);
    expect(await db.members.where({ person_id: SAMPLE_PERSON_ID }).count()).toBe(3);
    expect(await db.packs.where({ person_id: SAMPLE_PERSON_ID }).count()).toBe(2);
    expect(await db.reminder_logs.where({ person_id: SAMPLE_PERSON_ID }).count()).toBeGreaterThan(50);
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
    expect(await db.reminders.count()).toBe(8);
  });

  it('removes every row and blob it created', async () => {
    await loadSample(NOW);
    expect(await db.blobs.count()).toBe(2);

    await clearSample();

    expect(await sampleLoaded()).toBe(false);
    for (const table of [db.persons, db.trials, db.reminders, db.reminder_logs, db.members, db.packs, db.blobs]) {
      expect(await table.count()).toBe(0);
    }
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
