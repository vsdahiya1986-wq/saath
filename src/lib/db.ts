import Dexie, { Table } from 'dexie';
import { encryptText, decryptText, encryptBlob, decryptBlob } from './crypto';

export type Lang = 'as' | 'en';
export type Literacy = 'non-literate' | 'basic' | 'fluent';
export type Nav = 'visual' | 'voice-guided';
export type CueType = 'none' | 'repeat_audio' | 'highlight' | 'reduce_choices' | 'demonstrate';
export type Activity = 'familiar_pairs' | 'sound_sight' | 'pattern_garden' | 'my_next_step' | 'together' | 'saah_pat' | 'apon_mukh';
export type Difficulty = 1 | 2 | 3 | 4;

/**
 * Provenance for the care-team-supplied difficulty/cue bounds — see Part 22
 * of the master plan. This is a documented configuration constraining what
 * the model may propose. It is NEVER a disease stage inferred from gameplay.
 */
export interface CareConfig {
  max_difficulty: Difficulty;
  allowed_cues: CueType[];
  excluded_pack_ids: string[];
  sensory_mode: 'both' | 'visual_only' | 'audio_supported';
  source: 'clinician' | 'trained_worker' | 'caregiver_preference' | 'not_assessed';
  set_by: string;
  set_at: string;
  clinical_stage_supplied: boolean;
}

export interface Person {
  id: string;
  display_name: string; // encrypted at rest — see PersonRepo
  language: Lang;
  literacy: Literacy;
  navigation: Nav;
  care_config: CareConfig;
  consent_ref: string;
  created_at: string;
  /** DEMO DATA marker — true only for the fictional personas created by src/lib/demoSeed.ts. */
  is_demo?: boolean;
  /** SAMPLE marker — true only for Aita's Day, created by src/lib/sampleData.ts (F1). */
  is_sample?: boolean;
  /** Printed on the Visit Card (F11). A band, never a birth date. */
  age_band?: '60-69' | '70-79' | '80+';
}

export interface CircleMember {
  id: string;
  person_id: string;
  name: string; // encrypted at rest
  role: 'family' | 'neighbour' | 'volunteer' | 'asha' | 'worker';
  phone?: string; // encrypted at rest
  consented: boolean;
  on_call_days: number[]; // 0=Sun..6=Sat
  device_id?: string;
  lan_url?: string; // e.g. http://192.168.1.42:3000
  load_count: number; // Part 19 — rotation fairness
  last_on_call?: string;
}

export interface ContentPack {
  id: string;
  person_id: string;
  version: number;
  kind: 'object' | 'place' | 'routine' | 'reminiscence';
  title: string; // encrypted at rest
  is_current_location: boolean;
  media: { photo?: string; place_photo?: string; audio_key?: string; steps?: string[] }; // steps: ordered, caregiver-authored, kind === 'routine' only
  recorded_by: string; // circle member id
  language: Lang;
  approved_by?: string;
  approved_at?: string;
  review_by?: string; // ISO date
  state: 'draft' | 'approved' | 'stale' | 'withdrawn';
  permitted_uses: ('play' | 'help' | 'together')[];
}

export interface TrialEvent {
  id: string;
  person_id: string;
  activity: Activity;
  activity_version: string;
  difficulty: Difficulty;
  cue: CueType;
  pack_id?: string;
  recorded_by?: string;
  outcome: 'completed' | 'not_completed' | 'skipped' | 'withdrawn' | 'interrupted';
  latency_ms?: number;
  perseverative_errors?: number;
  policy_mode: 'baseline' | 'learned';
  model_version: string;
  synthetic: boolean;
  created_at: string;
  synced_at?: string;
}

export type FollowupState =
  | 'stored_locally'
  | 'circle_notified_local'
  | 'eligible'
  | 'submitting'
  | 'submitted'
  | 'submission_unknown'
  | 'delivered'
  | 'acknowledged'
  | 'resolved'
  | 'cancelled'
  | 'expired';

export interface FollowupItem {
  id: string;
  person_id: string;
  origin: 'help_request' | 'missed_checkin';
  state: FollowupState;
  target_member_id?: string;
  attempts: number;
  created_at: string;
  expires_at: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  history: { state: FollowupState; at: string; note?: string }[];
}

export interface Reminder {
  id: string;
  person_id: string;
  category: 'medicine' | 'hydration' | 'activity' | 'appointment';
  care_plan_text: string; // encrypted at rest — pasted from care plan, NEVER generated
  hour: number; // 1-12
  minute: number;
  period: 'AM' | 'PM';
  audio_pack_id?: string;
  version: number;
  device_activated: boolean;
  native_notification_id?: number;
}

/**
 * One row per time a reminder came due (F2). Written when the person answers,
 * or by the missed sweep when nothing was answered in time. Nothing here is
 * free text, so nothing needs encrypting — the care-plan text it refers to
 * stays encrypted on the Reminder itself.
 */
export interface ReminderLog {
  id: string;
  person_id: string;
  reminder_id: string;
  category: Reminder['category'];
  due_at: string;
  responded_at?: string;
  outcome: 'done' | 'snoozed' | 'missed';
}

/**
 * Care Note (F8): a 30-second log by a circle member. The chips are coded;
 * the optional line of text is free text, so it is encrypted at rest.
 */
export type CareChip = 'meals' | 'sleep' | 'mood' | 'fall';

export interface CareNote {
  id: string;
  person_id: string;
  chips: CareChip[];
  text?: string; // encrypted at rest
  by: string; // the member's name, as shown when it was written
  created_at: string;
}

/**
 * Circle Nudge (F7). Ids are derived from what triggered them, so re-running
 * the check never duplicates one. `detail` carries the time or name the fixed
 * card text needs.
 */
export interface Nudge {
  id: string;
  person_id: string;
  kind: 'medicine_missed' | 'quiet_days' | 'help_pressed' | 'steadier_help';
  detail?: string;
  created_at: string;
  state: 'open' | 'acknowledged' | 'resolved';
  acknowledged_by?: string;
  note?: string; // encrypted at rest
}

/** unused since Sept 2026 (R2) — kept to avoid a destructive migration */
export interface Handoff {
  id: string;
  person_id: string;
  from_member: string;
  to_member: string;
  pack_versions: Record<string, number>;
  state: 'sent' | 'received' | 'accepted';
  sent_at: string;
  received_at?: string;
  accepted_at?: string;
}

export interface AuditRecord {
  id: string;
  actor: string;
  action: string;
  scope: string;
  at: string;
}

export class SaathDB extends Dexie {
  persons!: Table<Person>;
  members!: Table<CircleMember>;
  packs!: Table<ContentPack>;
  trials!: Table<TrialEvent>;
  followups!: Table<FollowupItem>;
  reminders!: Table<Reminder>;
  handoffs!: Table<Handoff>;
  reminder_logs!: Table<ReminderLog>;
  care_notes!: Table<CareNote>;
  nudges!: Table<Nudge>;
  audit!: Table<AuditRecord>;
  blobs!: Table<{ key: string; blob: Blob; mime: string; at: string }>;

  constructor() {
    super('saath_v1');
    this.version(1).stores({
      persons: 'id',
      members: 'id, person_id',
      packs: 'id, person_id, state',
      trials: 'id, person_id, activity, synced_at, [person_id+activity]',
      followups: 'id, person_id, state',
      reminders: 'id, person_id, category',
      handoffs: 'id, person_id, state', // unused since Sept 2026 (R2) — kept to avoid a destructive migration
      audit: 'id, at',
      blobs: 'key',
    });

    /**
     * v2 (B9 + F2): adds the compound indexes Dexie was warning about, and the
     * tables the Sept 2026 features need. `care_notes` and `nudges` are declared
     * here although they are only used from Phase 5 — declaring all three stores
     * in one upgrade is cheaper and safer than shipping a migration per feature.
     * Version 1 is left exactly as it was; existing rows are carried forward.
     */
    this.version(2).stores({
      packs: 'id, person_id, state, [person_id+state]',
      trials: 'id, person_id, activity, synced_at, [person_id+activity], [person_id+created_at]',
      reminders: 'id, person_id, category',
      reminder_logs: 'id, person_id, reminder_id, due_at, [person_id+due_at]',
      care_notes: 'id, person_id, created_at, [person_id+created_at]',
      nudges: 'id, person_id, state, [person_id+state]',
    });
  }
}

export const db = new SaathDB();

/**
 * Only display_name / member name+phone / pack title / reminder care-plan
 * text are encrypted at the field level (see crypto.ts for why field-level,
 * not a whole-database swap). Coded, categorical trial data (activity, cue,
 * outcome, difficulty) stays plaintext: it must remain indexable for the
 * Bayesian engine's queries and is meaningless without the linked, encrypted
 * Person record anyway.
 */

export async function putPerson(p: Person): Promise<void> {
  await db.persons.put({ ...p, display_name: await encryptText(p.display_name) });
}

export async function getPerson(id: string): Promise<Person | undefined> {
  const row = await db.persons.get(id);
  if (!row) return undefined;
  return { ...row, display_name: await decryptText(row.display_name) };
}

export async function allPersons(): Promise<Person[]> {
  const rows = await db.persons.toArray();
  return Promise.all(rows.map(async (r) => ({ ...r, display_name: await decryptText(r.display_name) })));
}

export async function deletePerson(id: string): Promise<void> {
  // Blobs are keyed, not person-scoped, so collect their keys before the rows go.
  const packs = await db.packs.where({ person_id: id }).toArray();
  const blobKeys = packs.flatMap((p) => [p.media.photo, p.media.place_photo, p.media.audio_key].filter((k): k is string => !!k));

  await db.transaction('rw', [db.persons, db.members, db.packs, db.trials, db.followups, db.reminders, db.handoffs, db.reminder_logs, db.care_notes, db.nudges, db.blobs, db.audit], async () => {
    await db.persons.delete(id);
    await db.members.where({ person_id: id }).delete();
    await db.packs.where({ person_id: id }).delete();
    await db.trials.where({ person_id: id }).delete();
    await db.followups.where({ person_id: id }).delete();
    await db.reminders.where({ person_id: id }).delete();
    await db.handoffs.where({ person_id: id }).delete();
    await db.reminder_logs.where({ person_id: id }).delete();
    await db.care_notes.where({ person_id: id }).delete();
    await db.nudges.where({ person_id: id }).delete();
    await db.blobs.bulkDelete(blobKeys);
    await db.audit.put({ id: crypto.randomUUID(), actor: 'system', action: 'delete_person', scope: id, at: new Date().toISOString() });
  });
}

export async function putMember(m: CircleMember): Promise<void> {
  await db.members.put({
    ...m,
    name: await encryptText(m.name),
    phone: m.phone ? await encryptText(m.phone) : undefined,
  });
}

async function decryptMember(row: CircleMember): Promise<CircleMember> {
  return {
    ...row,
    name: await decryptText(row.name),
    phone: row.phone ? await decryptText(row.phone) : undefined,
  };
}

export async function getMember(id: string): Promise<CircleMember | undefined> {
  const row = await db.members.get(id);
  return row ? decryptMember(row) : undefined;
}

export async function membersForPerson(personId: string): Promise<CircleMember[]> {
  const rows = await db.members.where({ person_id: personId }).toArray();
  return Promise.all(rows.map(decryptMember));
}

export async function putPack(p: ContentPack): Promise<void> {
  await db.packs.put({ ...p, title: await encryptText(p.title) });
}

async function decryptPack(row: ContentPack): Promise<ContentPack> {
  return { ...row, title: await decryptText(row.title) };
}

export async function getPack(id: string): Promise<ContentPack | undefined> {
  const row = await db.packs.get(id);
  return row ? decryptPack(row) : undefined;
}

export async function packsForPerson(personId: string, state?: ContentPack['state']): Promise<ContentPack[]> {
  const rows = state
    ? await db.packs.where({ person_id: personId, state }).toArray()
    : await db.packs.where({ person_id: personId }).toArray();
  return Promise.all(rows.map(decryptPack));
}

export async function putReminder(r: Reminder): Promise<void> {
  await db.reminders.put({ ...r, care_plan_text: await encryptText(r.care_plan_text) });
}

async function decryptReminder(row: Reminder): Promise<Reminder> {
  return { ...row, care_plan_text: await decryptText(row.care_plan_text) };
}

export async function getReminder(id: string): Promise<Reminder | undefined> {
  const row = await db.reminders.get(id);
  return row ? decryptReminder(row) : undefined;
}

export async function remindersForPerson(personId: string): Promise<Reminder[]> {
  const rows = await db.reminders.where({ person_id: personId }).toArray();
  return Promise.all(rows.map(decryptReminder));
}

export async function putCareNote(n: CareNote): Promise<void> {
  await db.care_notes.put({ ...n, text: n.text ? await encryptText(n.text) : undefined });
}

/** Newest first. */
export async function careNotesForPerson(personId: string): Promise<CareNote[]> {
  const rows = await db.care_notes.where({ person_id: personId }).toArray();
  rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return Promise.all(rows.map(async (r) => ({ ...r, text: r.text ? await decryptText(r.text) : undefined })));
}

/** Photos and voice recordings — encrypted the same way as sensitive text. */
export async function putBlob(key: string, blob: Blob): Promise<void> {
  const encrypted = await encryptBlob(blob);
  await db.blobs.put({ key, blob: encrypted, mime: blob.type || 'application/octet-stream', at: new Date().toISOString() });
}

export async function getBlob(key: string): Promise<Blob | undefined> {
  const row = await db.blobs.get(key);
  if (!row) return undefined;
  return decryptBlob(row.blob, row.mime);
}
