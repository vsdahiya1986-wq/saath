import { db, getBlob, membersForPerson } from './db';
import { decryptText } from './crypto';
import { buildStoreZip } from './zip';

export interface LegacyEntry {
  packId: string;
  title: string;
  recordedByName: string;
  recordedByRole: string;
  language: string;
  approvedAt?: string;
  audioKey: string;
  kind: string;
}

export async function listLegacy(personId: string): Promise<LegacyEntry[]> {
  const packs = await db.packs.where({ person_id: personId }).toArray();
  const members = await membersForPerson(personId);
  const byId = new Map(members.map((m) => [m.id, m]));

  const withdrawn = packs.filter((p) => p.state !== 'withdrawn');
  const entries: LegacyEntry[] = [];
  for (const p of withdrawn) {
    const member = byId.get(p.recorded_by);
    entries.push({
      packId: p.id,
      title: await decryptText(p.title),
      recordedByName: member?.name ?? 'Family',
      recordedByRole: member?.role ?? 'family',
      language: p.language,
      approvedAt: p.approved_at,
      kind: p.kind,
      audioKey: p.media.audio_key,
    });
  }
  return entries.sort((a, b) => (b.approvedAt ?? '').localeCompare(a.approvedAt ?? ''));
}

/** Export the family's own recordings as a single downloadable ZIP. Their content, their property. */
export async function exportLegacyZip(personId: string): Promise<Blob> {
  const entries = await listLegacy(personId);
  const manifest = entries.map((e) => ({
    title: e.title,
    recorded_by: e.recordedByName,
    role: e.recordedByRole,
    language: e.language,
    approved_at: e.approvedAt,
    file: `${e.audioKey}.webm`,
  }));

  const files: { name: string; data: Uint8Array }[] = [
    { name: 'manifest.json', data: new TextEncoder().encode(JSON.stringify(manifest, null, 2)) },
  ];
  for (const e of entries) {
    const blob = await getBlob(e.audioKey);
    if (blob) files.push({ name: `${e.audioKey}.webm`, data: new Uint8Array(await blob.arrayBuffer()) });
  }
  return buildStoreZip(files);
}

export async function loadLegacyAudioBlob(audioKey: string) {
  return getBlob(audioKey);
}
