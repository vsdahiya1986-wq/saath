import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db, TrialEvent } from '@/lib/db';
import { decide, MODEL_VERSION } from '@/lib/model';
import { v4 as uuid } from 'uuid';

async function seed(cue: TrialEvent['cue'], outcomes: ('completed' | 'not_completed')[]) {
  for (const o of outcomes) {
    await db.trials.put({
      id: uuid(),
      person_id: 'p1',
      activity: 'familiar_pairs',
      activity_version: '1',
      difficulty: 1,
      cue,
      outcome: o,
      policy_mode: 'baseline',
      model_version: MODEL_VERSION,
      synthetic: false,
      created_at: new Date().toISOString(),
    });
  }
}

describe('Bayesian assistance engine', () => {
  beforeEach(async () => {
    await db.trials.clear();
  });

  it('falls back to baseline below the evidence threshold', async () => {
    await seed('highlight', ['completed', 'completed']); // n=2 < MIN_EVIDENCE=3
    const d = await decide({
      personId: 'p1',
      activity: 'familiar_pairs',
      difficulty: 1,
      allowedCues: ['none', 'highlight'],
      maxDifficulty: 4,
      preferredCue: 'none',
    });
    expect(d.mode).toBe('baseline');
    expect(d.chosenCue).toBe('none');
  });

  it('switches to learned once evidence crosses the threshold', async () => {
    await seed('highlight', ['completed', 'completed', 'completed']);
    await seed('none', ['not_completed', 'not_completed', 'not_completed']);
    const d = await decide({
      personId: 'p1',
      activity: 'familiar_pairs',
      difficulty: 1,
      allowedCues: ['none', 'highlight'],
      maxDifficulty: 4,
      preferredCue: 'none',
    });
    expect(d.mode).toBe('learned');
    expect(d.chosenCue).toBe('highlight');
    expect(d.changedFromBaseline).toBe(true);
  });

  it('computes the posterior mean correctly', async () => {
    await seed('highlight', ['completed', 'completed', 'completed', 'not_completed']);
    const d = await decide({
      personId: 'p1',
      activity: 'familiar_pairs',
      difficulty: 1,
      allowedCues: ['highlight'],
      maxDifficulty: 4,
    });
    const e = d.ranking.find((r) => r.cue === 'highlight')!;
    // (1+3)/(1+1+3+1) = 4/6
    expect(e.posteriorMean).toBeCloseTo(4 / 6, 6);
  });

  it('NEVER proposes a cue outside care config', async () => {
    await seed('demonstrate', ['completed', 'completed', 'completed', 'completed', 'completed']);
    const d = await decide({
      personId: 'p1',
      activity: 'familiar_pairs',
      difficulty: 1,
      allowedCues: ['none', 'highlight'], // demonstrate excluded by care team
      maxDifficulty: 4,
    });
    expect(d.chosenCue).not.toBe('demonstrate');
  });

  it('never exceeds max difficulty', async () => {
    await seed('none', Array(10).fill('completed'));
    const d = await decide({
      personId: 'p1',
      activity: 'familiar_pairs',
      difficulty: 2,
      allowedCues: ['none'],
      maxDifficulty: 2,
    });
    expect(d.chosenDifficulty).toBeLessThanOrEqual(2);
  });

  it('does not treat a voluntary skip as cognitive failure', async () => {
    await db.trials.put({
      id: uuid(),
      person_id: 'p1',
      activity: 'familiar_pairs',
      activity_version: '1',
      difficulty: 1,
      cue: 'none',
      outcome: 'skipped',
      policy_mode: 'baseline',
      model_version: MODEL_VERSION,
      synthetic: false,
      created_at: new Date().toISOString(),
    });
    const d = await decide({
      personId: 'p1',
      activity: 'familiar_pairs',
      difficulty: 1,
      allowedCues: ['none'],
      maxDifficulty: 4,
    });
    expect(d.ranking.find((r) => r.cue === 'none')!.n).toBe(0);
  });

  it('lets an explicit help request override the model', async () => {
    await seed('none', Array(10).fill('completed'));
    const d = await decide({
      personId: 'p1',
      activity: 'familiar_pairs',
      difficulty: 1,
      allowedCues: ['none', 'repeat_audio'],
      maxDifficulty: 4,
      explicitHelpRequested: true,
    });
    expect(d.chosenCue).toBe('repeat_audio');
  });

  it('excludes synthetic trials from real recommendations', async () => {
    for (let i = 0; i < 5; i++) {
      await db.trials.put({
        id: uuid(),
        person_id: 'p1',
        activity: 'familiar_pairs',
        activity_version: '1',
        difficulty: 1,
        cue: 'highlight',
        outcome: 'completed',
        policy_mode: 'baseline',
        model_version: MODEL_VERSION,
        synthetic: true,
        created_at: new Date().toISOString(),
      });
    }
    const d = await decide({
      personId: 'p1',
      activity: 'familiar_pairs',
      difficulty: 1,
      allowedCues: ['none', 'highlight'],
      maxDifficulty: 4,
    });
    expect(d.mode).toBe('baseline');
  });
});
