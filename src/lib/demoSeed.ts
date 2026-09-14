import { v4 as uuid } from 'uuid';
import { db, putPerson, deletePerson, Activity, Lang, Literacy, TrialEvent } from './db';
import { MODEL_VERSION } from './model';

/**
 * DEMO DATA — NOT REAL PATIENTS (SIH26003 f, b).
 *
 * Seeds two fictional personas on opposite cognitive trajectories so the
 * Circle Board's trend analytics and the Evidence Inspector have real shape
 * during a demo. They are marked as demo data three ways: `is_demo: true`,
 * a "Demo ·" name prefix, and a consent reference that says they are
 * fictional.
 *
 * Every trial is stored under the persona's own person_id, so this history
 * can never inform a real person's recommendations. Trials are deliberately
 * `synthetic: false`: the trend analytics correctly ignore synthetic rows,
 * and within a demo persona's record this is that persona's own history.
 *
 * Each persona is held at level 1 by its care-team bound (max_difficulty 1),
 * so every week sits under one unchanged activity/difficulty/assistance
 * condition — the only way analytics.ts will draw a trend at all.
 */

export type Trajectory = 'improving' | 'declining';

export const DEMO_PERSONAS: { id: string; name: string; trajectory: Trajectory; language: Lang; literacy: Literacy }[] = [
  { id: 'demo-persona-improving', name: 'Demo · Ratna Bora', trajectory: 'improving', language: 'as', literacy: 'basic' },
  { id: 'demo-persona-declining', name: 'Demo · Hemanta Das', trajectory: 'declining', language: 'en', literacy: 'non-literate' },
];

export const DEMO_WEEKS = 8;
export const DEMO_TRIALS_PER_WEEK = 4;
const SCORED_ACTIVITIES: Activity[] = ['familiar_pairs', 'sound_sight', 'pattern_garden', 'my_next_step'];
const TRIAL_DAYS = [1, 2, 4, 6]; // Mon, Tue, Thu, Sat within each week

/**
 * Pure: builds DEMO_WEEKS complete calendar weeks of history ending with the
 * last full week before `now` (never future-dated). Completion rate moves
 * linearly 25% -> 100% (improving) or 100% -> 25% (declining).
 */
export function buildDemoTrials(personId: string, trajectory: Trajectory, now = Date.now()): TrialEvent[] {
  const currentSunday = new Date(now);
  currentSunday.setHours(0, 0, 0, 0);
  currentSunday.setDate(currentSunday.getDate() - currentSunday.getDay());

  const rows: TrialEvent[] = [];
  for (let w = 0; w < DEMO_WEEKS; w++) {
    const progress = w / (DEMO_WEEKS - 1);
    const rate = trajectory === 'improving' ? 0.25 + 0.75 * progress : 1 - 0.75 * progress;
    const completions = Math.round(rate * DEMO_TRIALS_PER_WEEK);

    SCORED_ACTIVITIES.forEach((activity, a) => {
      for (let k = 0; k < DEMO_TRIALS_PER_WEEK; k++) {
        const at = new Date(currentSunday);
        at.setDate(at.getDate() - (DEMO_WEEKS - w) * 7 + TRIAL_DAYS[k]);
        at.setHours(10, a * 15, 0, 0);
        const completed = k < completions;
        rows.push({
          id: uuid(),
          person_id: personId,
          activity,
          activity_version: 'demo-seed',
          difficulty: 1,
          cue: 'none',
          outcome: completed ? 'completed' : 'not_completed',
          latency_ms: Math.round(trajectory === 'improving' ? 42000 - 20000 * progress : 22000 + 20000 * progress),
          perseverative_errors: completed ? 1 : 4,
          policy_mode: 'baseline',
          model_version: MODEL_VERSION,
          synthetic: false,
          created_at: at.toISOString(),
        });
      }
    });
  }
  return rows;
}

/** Creates (or refreshes) both demo personas and replaces their seeded history. Returns their ids. */
export async function seedDemoPersonas(now = Date.now()): Promise<string[]> {
  for (const p of DEMO_PERSONAS) {
    await putPerson({
      id: p.id,
      display_name: p.name,
      language: p.language,
      literacy: p.literacy,
      navigation: 'visual',
      is_demo: true,
      care_config: {
        max_difficulty: 1,
        allowed_cues: ['none', 'repeat_audio', 'highlight', 'reduce_choices', 'demonstrate'],
        excluded_pack_ids: [],
        sensory_mode: 'both',
        source: 'not_assessed',
        set_by: 'demo_seed',
        set_at: new Date(now).toISOString(),
        clinical_stage_supplied: false,
      },
      consent_ref: 'DEMO — fictional persona, not a real person',
      created_at: new Date(now - (DEMO_WEEKS + 1) * 7 * 864e5).toISOString(),
    });
    const previous = await db.trials.where({ person_id: p.id }).primaryKeys();
    await db.trials.bulkDelete(previous);
    await db.trials.bulkPut(buildDemoTrials(p.id, p.trajectory, now));
  }
  return DEMO_PERSONAS.map((p) => p.id);
}

/** Removes both demo personas and everything stored under them. */
export async function removeDemoPersonas(): Promise<void> {
  for (const p of DEMO_PERSONAS) await deletePerson(p.id);
}
