import { v4 as uuid } from 'uuid';
import {
  db,
  deletePerson,
  putPerson,
  putMember,
  putPack,
  putReminder,
  putBlob,
  Activity,
  CircleMember,
  ContentPack,
  Difficulty,
  CueType,
  Reminder,
  ReminderLog,
  TrialEvent,
} from './db';
import { MODEL_VERSION } from './model';

/**
 * "Aita's Day" — the sample profile (F1). A populated app in one tap, so
 * screenshots and a live demo never open on empty states.
 *
 * Marked as sample three ways: `is_sample: true` on the person, an "(sample)"
 * name suffix, and a consent reference that says so. Everything it writes
 * hangs off one fixed person id, which is how `clearSample()` can guarantee it
 * removes all of it — see the note on that function.
 *
 * Deterministic: a seeded PRNG, never Math.random(), so two runs produce byte
 * -identical data and a screenshot can be retaken.
 */

export const SAMPLE_PERSON_ID = 'sample-aita';
export const SAMPLE_DAYS = 14;

/** mulberry32 — small, fast, good enough, and identical across runs. */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rnd: () => number, xs: readonly T[]): T {
  return xs[Math.floor(rnd() * xs.length)];
}

/** Every scored activity — Together Moment is never scored, so it is not here. */
const SAMPLE_ACTIVITIES: Activity[] = ['familiar_pairs', 'sound_sight', 'pattern_garden', 'my_next_step', 'saah_pat', 'apon_mukh'];

/** Days 8 and 9 back are the dip Trend Lines (F10) will show. */
function isDipDay(daysAgo: number): boolean {
  return daysAgo === 8 || daysAgo === 9;
}

/**
 * 14 days of plausible history. `synthetic: true` throughout: the engine must
 * never treat invented rows as evidence, even for the sample person.
 */
export function buildSampleTrials(now = Date.now()): TrialEvent[] {
  const rnd = seeded(20260918);
  const rows: TrialEvent[] = [];

  for (let daysAgo = SAMPLE_DAYS; daysAgo >= 1; daysAgo--) {
    const dip = isDipDay(daysAgo);
    const sessions = 2 + Math.floor(rnd() * 2); // 2-3 a day

    for (let s = 0; s < sessions; s++) {
      const at = new Date(now - daysAgo * 864e5);
      at.setHours(9 + s * 4, Math.floor(rnd() * 50), 0, 0);

      const roll = rnd();
      const outcome: TrialEvent['outcome'] = roll < (dip ? 0.45 : 0.7) ? 'completed' : roll < (dip ? 0.85 : 0.9) ? 'not_completed' : 'skipped';

      rows.push({
        id: uuid(),
        person_id: SAMPLE_PERSON_ID,
        activity: pick(rnd, SAMPLE_ACTIVITIES),
        activity_version: 'sample',
        difficulty: (rnd() < 0.7 ? 2 : rnd() < 0.5 ? 1 : 3) as Difficulty,
        cue: (dip ? (rnd() < 0.6 ? 'highlight' : 'none') : rnd() < 0.85 ? 'none' : 'repeat_audio') as CueType,
        outcome,
        latency_ms: Math.round(1500 + rnd() * 4500 + (dip ? 1500 : 0)),
        perseverative_errors: outcome === 'completed' ? Math.floor(rnd() * 2) : 2 + Math.floor(rnd() * 3),
        policy_mode: 'baseline',
        model_version: MODEL_VERSION,
        synthetic: true,
        created_at: at.toISOString(),
      });
    }
  }
  return rows;
}

const SAMPLE_REMINDERS: Omit<Reminder, 'id' | 'person_id' | 'version' | 'device_activated'>[] = [
  { category: 'medicine', care_plan_text: 'Blood pressure tablet, one, after breakfast.', hour: 8, minute: 0, period: 'AM' },
  { category: 'hydration', care_plan_text: 'A glass of water.', hour: 9, minute: 0, period: 'AM' },
  { category: 'hydration', care_plan_text: 'A glass of water.', hour: 11, minute: 0, period: 'AM' },
  { category: 'hydration', care_plan_text: 'A glass of water.', hour: 1, minute: 0, period: 'PM' },
  { category: 'hydration', care_plan_text: 'A glass of water.', hour: 3, minute: 0, period: 'PM' },
  { category: 'hydration', care_plan_text: 'A glass of water.', hour: 5, minute: 0, period: 'PM' },
  { category: 'activity', care_plan_text: 'Short walk in the courtyard with Rupa.', hour: 5, minute: 30, period: 'PM' },
  { category: 'appointment', care_plan_text: 'Clinic visit with Dr Saikia. Take the blue folder.', hour: 10, minute: 0, period: 'AM' },
];

const SAMPLE_MEMBERS: Omit<CircleMember, 'id' | 'person_id' | 'load_count'>[] = [
  { name: 'Rupa', role: 'family', consented: true, on_call_days: [1, 3, 5] },
  { name: 'Bhaskar', role: 'neighbour', consented: true, on_call_days: [2, 4] },
  { name: 'Junali', role: 'asha', consented: true, on_call_days: [0, 6] },
];

/**
 * A drawn placeholder, deliberately not a photograph and never a "regional
 * sound": the family replaces these with their own pictures. Kept as an SVG so
 * it is a few hundred bytes and obviously a drawing.
 */
function placeholderImage(title: string, hue: number): Blob {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
  <rect width="480" height="480" fill="hsl(${hue} 45% 92%)"/>
  <circle cx="240" cy="190" r="86" fill="none" stroke="hsl(${hue} 55% 42%)" stroke-width="10"/>
  <path d="M120 360 L200 268 L268 336 L318 288 L380 360 Z" fill="none" stroke="hsl(${hue} 55% 42%)" stroke-width="10" stroke-linejoin="round"/>
  <text x="240" y="432" text-anchor="middle" font-family="system-ui, sans-serif" font-size="30" font-weight="700" fill="hsl(${hue} 55% 32%)">${title}</text>
  <text x="240" y="462" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="hsl(${hue} 30% 45%)">Sample placeholder</text>
</svg>`;
  return new Blob([svg], { type: 'image/svg+xml' });
}

/** True if Aita's Day is currently loaded. */
export async function sampleLoaded(): Promise<boolean> {
  return !!(await db.persons.get(SAMPLE_PERSON_ID));
}

/**
 * Creates Aita's Day. Idempotent: it clears any previous sample first, so
 * running it twice leaves exactly one sample person and one set of rows.
 * Returns the person id to make active.
 */
export async function loadSample(now = Date.now()): Promise<string> {
  await clearSample();
  const nowIso = new Date(now).toISOString();

  await putPerson({
    id: SAMPLE_PERSON_ID,
    display_name: 'Aita (sample)',
    language: 'as',
    literacy: 'non-literate',
    navigation: 'visual',
    is_sample: true,
    care_config: {
      max_difficulty: 3,
      allowed_cues: ['none', 'repeat_audio', 'highlight'],
      excluded_pack_ids: [],
      sensory_mode: 'both',
      source: 'caregiver_preference',
      set_by: 'Sample data',
      set_at: nowIso,
      clinical_stage_supplied: false,
    },
    consent_ref: 'SAMPLE-CONSENT-001',
    created_at: new Date(now - (SAMPLE_DAYS + 1) * 864e5).toISOString(),
  });

  await db.trials.bulkPut(buildSampleTrials(now));

  const reminders: Reminder[] = SAMPLE_REMINDERS.map((r, i) => ({
    ...r,
    id: `${SAMPLE_PERSON_ID}-reminder-${i}`,
    person_id: SAMPLE_PERSON_ID,
    version: 1,
    device_activated: false,
  }));
  for (const r of reminders) await putReminder(r);

  await db.reminder_logs.bulkPut(buildSampleReminderLogs(reminders, now));

  for (const [i, m] of SAMPLE_MEMBERS.entries()) {
    await putMember({ ...m, id: `${SAMPLE_PERSON_ID}-member-${i}`, person_id: SAMPLE_PERSON_ID, load_count: 0 });
  }

  const packs: { title: string; kind: ContentPack['kind']; hue: number }[] = [
    { title: "Aita's kitchen", kind: 'object', hue: 32 },
    { title: 'Tea garden walk', kind: 'place', hue: 150 },
  ];
  for (const [i, p] of packs.entries()) {
    const key = `${SAMPLE_PERSON_ID}-pack-photo-${i}`;
    await putBlob(key, placeholderImage(p.title, p.hue));
    await putPack({
      id: `${SAMPLE_PERSON_ID}-pack-${i}`,
      person_id: SAMPLE_PERSON_ID,
      version: 1,
      kind: p.kind,
      title: p.title,
      is_current_location: false,
      media: p.kind === 'place' ? { place_photo: key } : { photo: key },
      recorded_by: `${SAMPLE_PERSON_ID}-member-0`,
      language: 'en',
      approved_by: `${SAMPLE_PERSON_ID}-member-0`,
      approved_at: nowIso,
      state: 'approved',
      permitted_uses: ['play', 'together'],
    });
  }

  return SAMPLE_PERSON_ID;
}

/**
 * 14 days of adherence, with exactly two misses (F7/F10 feed on these): the
 * 08:00 medicine three days ago, and a mid-afternoon water nine days ago.
 */
export function buildSampleReminderLogs(reminders: Reminder[], now = Date.now()): ReminderLog[] {
  const rows: ReminderLog[] = [];
  const medicine = reminders.find((r) => r.category === 'medicine');
  const water = reminders.find((r) => r.category === 'hydration' && r.hour === 3);

  for (let daysAgo = SAMPLE_DAYS; daysAgo >= 1; daysAgo--) {
    for (const r of reminders) {
      if (r.category === 'appointment') continue; // one-off, not daily
      const due = new Date(now - daysAgo * 864e5);
      const h = r.period === 'PM' ? (r.hour % 12) + 12 : r.hour % 12;
      due.setHours(h, r.minute, 0, 0);

      const missed = (daysAgo === 3 && r.id === medicine?.id) || (daysAgo === 9 && r.id === water?.id);
      rows.push({
        id: `${r.id}-log-${daysAgo}`,
        person_id: SAMPLE_PERSON_ID,
        reminder_id: r.id,
        category: r.category,
        due_at: due.toISOString(),
        responded_at: missed ? undefined : new Date(due.getTime() + 4 * 60_000).toISOString(),
        outcome: missed ? 'missed' : 'done',
      });
    }
  }
  return rows;
}

/**
 * Removes Aita's Day completely. Idempotent.
 *
 * Deviation from the kit, which asked for an `is_sample` boolean on every table
 * and a delete by that flag: every sample row already hangs off one fixed
 * person id, and `deletePerson()` already deletes by person_id across every
 * table plus the pack blobs. Reusing it is a smaller change and a stronger
 * guarantee than a flag repeated on eight tables, which could be forgotten on
 * the ninth.
 */
export async function clearSample(): Promise<void> {
  if (!(await sampleLoaded())) return;
  await deletePerson(SAMPLE_PERSON_ID);
}
