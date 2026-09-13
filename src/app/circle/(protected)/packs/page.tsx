'use client';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { getActivePersonId } from '@/lib/usePerson';
import { ContentPack, putPack, packsForPerson, putBlob, getBlob, membersForPerson, CircleMember } from '@/lib/db';
import { VoiceRecorder, playPackAudio } from '@/lib/audio';
import Icon from '@/components/ui/Icon';
import BackButton from '@/components/ui/BackButton';

type Kind = ContentPack['kind'];

export default function PackStudio() {
  const [personId, setPersonId] = useState<string | null>(null);
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const [kind, setKind] = useState<Kind>('object');
  const [title, setTitle] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [isCurrentLocation, setIsCurrentLocation] = useState(false);
  const [recordedBy, setRecordedBy] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedKey, setRecordedKey] = useState<string | null>(null);
  const [permittedUses, setPermittedUses] = useState<ContentPack['permitted_uses']>(['play', 'help']);
  const recorderRef = useState(() => new VoiceRecorder())[0];

  async function refresh(id: string) {
    const ps = await packsForPerson(id);
    setPacks(ps);
    setMembers(await membersForPerson(id));
    const urls: Record<string, string> = {};
    for (const p of ps) {
      if (p.media.photo) {
        const b = await getBlob(p.media.photo);
        if (b) urls[p.id] = URL.createObjectURL(b);
      }
    }
    setPhotoUrls(urls);
  }

  useEffect(() => {
    getActivePersonId().then((id) => {
      setPersonId(id);
      if (id) refresh(id);
    });
  }, []);

  async function toggleRecord() {
    if (!recording) {
      await recorderRef.start();
      setRecording(true);
    } else {
      const key = uuid();
      await recorderRef.stopAndSave(key);
      setRecordedKey(key);
      setRecording(false);
    }
  }

  async function createPack() {
    if (!personId || !title.trim() || !recordedKey) return;
    let photoKey: string | undefined;
    if (photoFile) {
      photoKey = uuid();
      await putBlob(photoKey, photoFile);
    }
    const steps = kind === 'routine' ? stepsText.split('\n').map((s) => s.trim()).filter(Boolean) : undefined;
    const pack: ContentPack = {
      id: uuid(),
      person_id: personId,
      version: 1,
      kind,
      title: title.trim(),
      is_current_location: isCurrentLocation,
      media: { photo: photoKey, audio_key: recordedKey, steps },
      recorded_by: recordedBy,
      language: 'as',
      approved_by: recordedBy || 'self',
      approved_at: new Date().toISOString(),
      review_by: isCurrentLocation ? new Date(Date.now() + 30 * 864e5).toISOString() : undefined,
      state: 'approved',
      permitted_uses: permittedUses,
    };
    await putPack(pack);
    setTitle('');
    setStepsText('');
    setPhotoFile(null);
    setRecordedKey(null);
    setIsCurrentLocation(false);
    await refresh(personId);
  }

  async function withdraw(pack: ContentPack) {
    await putPack({ ...pack, state: 'withdrawn' });
    if (personId) await refresh(personId);
  }

  function togglePermittedUse(use: 'play' | 'help' | 'together') {
    setPermittedUses((cur) => (cur.includes(use) ? cur.filter((u) => u !== use) : [...cur, use]));
  }

  if (!personId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center bg-[var(--bg)]">
        <p>Set up a person profile first.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-6 max-w-lg mx-auto">
      <header className="flex items-center gap-3">
        <BackButton href="/circle" label="Back to Circle" />
        <h1 style={{ fontSize: 26 }} className="font-black text-[var(--text)]">
          Pack Studio
        </h1>
      </header>

      <section style={cardStyle} className="flex flex-col gap-3">
        <h2 style={{ fontSize: 18 }} className="font-black">
          New pack
        </h2>

        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 14 }}>Type</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} style={selectStyle}>
            <option value="object">Object</option>
            <option value="place">Place</option>
            <option value="routine">Routine</option>
            <option value="reminiscence">Reminiscence</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 14 }}>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="e.g. Reading glasses" />
        </label>

        {kind === 'routine' && (
          <label className="flex flex-col gap-1">
            <span style={{ fontSize: 14 }}>Steps, one per line, in order (used by My Next Step)</span>
            <textarea
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              placeholder={'Take medicine\nHave breakfast\nBrush teeth'}
              style={{ ...inputStyle, minHeight: 96, padding: 12 }}
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 14 }}>Photo</span>
          <label
            style={{ border: 'var(--border-w) dashed var(--border)', borderRadius: 'var(--radius)', minHeight: 56 }}
            className="flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icon name="camera" size={24} />
            <span style={{ fontSize: 15 }}>{photoFile ? photoFile.name : 'Choose a photo'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
          </label>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isCurrentLocation} onChange={(e) => setIsCurrentLocation(e.target.checked)} />
          <span style={{ fontSize: 14 }}>This can go stale (marks &quot;is_current_location&quot;)</span>
        </label>

        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 14 }}>Recorded by</span>
          <select value={recordedBy} onChange={(e) => setRecordedBy(e.target.value)} style={selectStyle}>
            <option value="">Select a circle member</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <span style={{ fontSize: 14 }}>Used in:</span>
          {(['play', 'help', 'together'] as const).map((use) => (
            <label key={use} className="flex items-center gap-1">
              <input type="checkbox" checked={permittedUses.includes(use)} onChange={() => togglePermittedUse(use)} />
              <span style={{ fontSize: 13 }}>{use}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleRecord}
            style={{
              minHeight: 48,
              border: `var(--border-w) solid ${recording ? 'var(--alert)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4"
          >
            <Icon name="mic" size={22} />
            <span style={{ fontSize: 15 }}>{recording ? 'Stop recording' : recordedKey ? 'Re-record' : 'Record prompt'}</span>
          </button>
          {recordedKey && !recording && (
            <button onClick={() => playPackAudio(recordedKey)} style={{ minHeight: 48, minWidth: 48, border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)' }}>
              <Icon name="listen" size={20} />
            </button>
          )}
        </div>

        <button
          onClick={createPack}
          disabled={!title.trim() || !recordedKey}
          style={{ minHeight: 56, background: 'var(--accent)', borderRadius: 'var(--radius)' }}
          className="text-[var(--on-accent)] font-black text-lg disabled:opacity-40"
        >
          Approve pack
        </button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 style={{ fontSize: 18 }} className="font-black">
          Existing packs
        </h2>
        {packs.map((p) => (
          <div key={p.id} style={cardStyle} className="flex items-center gap-3">
            {photoUrls[p.id] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrls[p.id]} alt={p.title} className="w-14 h-14 object-cover rounded" />
            ) : (
              <Icon name="photo" size={36} />
            )}
            <div className="flex-1">
              <div style={{ fontSize: 16 }} className="font-black">
                {p.title} <span style={{ fontSize: 12, fontWeight: 400 }}>v{p.version}</span>
              </div>
              <div style={{ fontSize: 12 }} className="text-[var(--text-muted)]">
                {p.kind} · {p.state} · used in {p.permitted_uses.join(', ')}
              </div>
            </div>
            <button onClick={() => playPackAudio(p.media.audio_key)} style={{ minWidth: 40, minHeight: 40 }}>
              <Icon name="listen" size={20} />
            </button>
            {p.state !== 'withdrawn' && (
              <button onClick={() => withdraw(p)} style={{ fontSize: 12, color: 'var(--alert)' }}>
                Withdraw
              </button>
            )}
          </div>
        ))}
        {!packs.length && <p style={{ fontSize: 14 }} className="text-[var(--text-muted)]">No packs yet.</p>}
      </section>
    </main>
  );
}

const cardStyle = { border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', padding: 16 } as const;
const inputStyle = { border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', minHeight: 48, padding: '0 12px', fontSize: 16 } as const;
const selectStyle = inputStyle;
