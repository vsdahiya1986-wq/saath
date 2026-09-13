import Dexie, { Table } from 'dexie';
import { encryptText, decryptText, encryptBlob, decryptBlob } from './crypto';

export type Lang = 'as' | 'en';
export type Literacy = 'non-literate' | 'basic' | 'fluent';
export type Nav = 'visual' | 'voice-guided';
export type CueType = 'none' | 'repeat_audio' | 'highlight' | 'reduce_choices' | 'demonstrate';
export type Activity = 'familiar_pairs' | 'sound_sight' | 'pattern_garden' | 'my_next_step' | 'together';
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
      handoffs: 'id, person_id, state',
      audit: 'id, at',
      blobs: 'key',
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
  await db.transaction('rw', [db.persons, db.members, db.packs, db.trials, db.followups, db.reminders, db.handoffs, db.audit], async () => {
    await db.persons.delete(id);
    await db.members.where({ person_id: id }).delete();
    await db.packs.where({ person_id: id }).delete();
    await db.trials.where({ person_id: id }).delete();
    await db.followups.where({ person_id: id }).delete();
    await db.reminders.where({ person_id: id }).delete();
    await db.handoffs.where({ person_id: id }).delete();
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
