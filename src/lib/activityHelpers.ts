'use client';
import { useCallback, useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { db, Activity, CueType, Difficulty, Mood } from './db';

/** The difficulty this person was last run at for this activity, or 1 if none yet. */
export async function lastDifficulty(personId: string, activity: Activity): Promise<Difficulty> {
  const rows = await db.trials.where({ person_id: personId, activity }).toArray();
  if (!rows.length) return 1;
  rows.sort((a, b) => a.created_at.localeCompare(b.created_at));
  return rows[rows.length - 1].difficulty;
}

export type TrialOutcome = 'completed' | 'not_completed' | 'skipped' | 'withdrawn' | 'interrupted';

/**
 * Shared trial-logging bookkeeping so every activity writes the same shape
 * of TrialEvent the same way: one write per session (guarded by `logged`),
 * latency measured from mount, a stable client-generated id.
 */
export function useActivityTrial(personId: string, activity: Activity, activityVersion: string) {
  const trialId = useRef(uuid());
  const startedAt = useRef(0);
  const logged = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const logTrial = useCallback(
    async (opts: {
      outcome: TrialOutcome;
      difficulty: Difficulty;
      cue: CueType;
      policyMode: 'baseline' | 'learned';
      modelVersion: string;
      perseverativeErrors?: number;
    }) => {
      if (logged.current) return;
      logged.current = true;
      await db.trials.put({
        id: trialId.current,
        person_id: personId,
        activity,
        activity_version: activityVersion,
        difficulty: opts.difficulty,
        cue: opts.cue,
        outcome: opts.outcome,
        latency_ms: Date.now() - startedAt.current,
        perseverative_errors: opts.perseverativeErrors,
        policy_mode: opts.policyMode,
        model_version: opts.modelVersion,
        synthetic: false,
        created_at: new Date().toISOString(),
      });
    },
    [personId, activity, activityVersion]
  );

  /**
   * The mood tap lands after the trial row is written, so it updates that row
   * rather than making a second one. A no-op if nothing has been logged yet.
   */
  const logMood = useCallback(
    async (mood: Mood) => {
      if (!logged.current) return;
      await db.trials.update(trialId.current, { mood });
    },
    []
  );

  return { logTrial, logMood, logged };
}
