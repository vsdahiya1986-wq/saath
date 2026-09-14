'use client';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { getActivePersonId } from '@/lib/usePerson';
import { ContentPack, putPack, packsForPerson, putBlob, getBlob, membersForPerson, CircleMember } from '@/lib/db';
import { VoiceRecorder, playPackAudio } from '@/lib/audio';
import Icon from '@/components/ui/Icon';
import BackButton from '@/components/ui/BackButton';

type Kind = ContentPack['kind'];

const KIND_LABEL: Record<Kind, string> = {
  object: 'A familiar object',
  place: 'A familiar place',
  routine: 'A daily routine',
  reminiscence: 'A family memory',
};

/**
 * Memory Garden (SIH26003 d, a.5) — family photos with attached voice notes,
 * used for Reminiscence Therapy. This is a naming and presentation layer over
 * the existing content-pack storage (ContentPack in src/lib/db.ts): route,
 * schema and encryption are unchanged.
 */
export default function MemoryGarden() {
  const [personId, setPersonId] = useState<string | null>(null);
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const [kind, setKind] = useState<Kind>('reminiscence');
  const [title, setTitle] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [isCurrentLocation, setIsCurrentLocation] = useState(false);
  const [recordedBy, setRecordedBy] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedKey, setRecordedKey] = useState<string | null>(null);
  const [permittedUses, setPermittedUses] = useState<ContentPack['permitted_uses']>(['play', 'together']);
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
    if (!personId || !title.trim() || (!recordedKey && !photoFile)) return;
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
      media: { photo: photoKey, audio_key: recordedKey ?? undefined, steps },
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
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <p>Set up a person profile first.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      <div className="w-full max-w-3xl mx-auto px-5 pt-2 pb-10 flex flex-col gap-5">
        <header className="flex flex-col items-start gap-3">
          <BackButton href="/circle" label="Back to Circle" />
          <span className="eyebrow">Reminiscence Therapy</span>
          <h1 className="title-xl">Memory Garden</h1>
          <p style={{ fontSize: 18 }} className="muted">
            Family photos with voice notes. They appear in Together Moment for shared reminiscence, and in the games when marked for play.
          </p>
        </header>

        <section className="core p-5 flex gap-4 items-start" style={{ borderLeft: '8px solid var(--accent-warm)' }} data-testid="reminiscence-evidence">
          <span style={{ color: 'var(--accent-warm)' }}>
            <Icon name="shield" size={28} />
          </span>
          <p style={{ fontSize: 16 }}>
            <b>Evidence:</b> Cochrane systematic review of Reminiscence Therapy for dementia (Woods, O&apos;Philbin, Farrell, Spector &amp;
            Orrell, 2018; CD001120) — 22 randomised trials, 1,972 participants: improved quality of life in care-home settings, small
            benefits to cognition and mood, and no adverse effects reported. SAATH&apos;s digital delivery has not itself been trialled.
          </p>
        </section>

        <section className="core p-5 flex flex-col gap-4">
          <h2 style={{ fontSize: 23 }} className="font-extrabold">
            Add a memory
          </h2>

          <label className="flex flex-col gap-1">
            <span style={{ fontSize: 17 }} className="font-semibold">
              What is it?
            </span>
            <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} style={inputStyle}>
              {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span style={{ fontSize: 17 }} className="font-semibold">
              Title
            </span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="e.g. Wedding day in Jorhat" />
          </label>

          {kind === 'routine' && (
            <label className="flex flex-col gap-1">
              <span style={{ fontSize: 17 }} className="font-semibold">
                Steps, one per line, in order (used by My Next Step)
              </span>
              <textarea
                value={stepsText}
                onChange={(e) => setStepsText(e.target.value)}
                placeholder={'Take medicine\nHave breakfast\nBrush teeth'}
                style={{ ...inputStyle, minHeight: 110, padding: 12 }}
              />
            </label>
          )}

          <label className="flex flex-col gap-1">
            <span style={{ fontSize: 17 }} className="font-semibold">
              Family photo
            </span>
            <label style={{ border: '2px dashed var(--control-border)', borderRadius: 'var(--radius)', minHeight: 72 }} className="flex items-center justify-center gap-2 cursor-pointer">
              <Icon name="camera" size={26} />
              <span style={{ fontSize: 17 }}>{photoFile ? photoFile.name : 'Choose a photo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
            </label>
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleRecord}
              className="btn btn-ghost flex-1"
              style={recording ? { color: 'var(--alert)', borderColor: 'var(--alert)' } : undefined}
            >
              <Icon name="mic" size={24} />
              {recording ? 'Stop recording' : recordedKey ? 'Re-record voice note' : 'Record a voice note'}
            </button>
            {recordedKey && !recording && (
              <button onClick={() => playPackAudio(recordedKey)} aria-label="Listen to voice note" className="btn btn-ghost btn-icon">
                <Icon name="listen" size={24} />
              </button>
            )}
          </div>
          <p style={{ fontSize: 15 }} className="muted -mt-2">
            A voice note is optional — without one, SAATH reads the title aloud.
          </p>

          <label className="flex flex-col gap-1">
            <span style={{ fontSize: 17 }} className="font-semibold">
              Recorded by
            </span>
            <select value={recordedBy} onChange={(e) => setRecordedBy(e.target.value)} style={inputStyle}>
              <option value="">Select a circle member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </label>

          <fieldset className="flex flex-wrap items-center gap-3">
            <legend style={{ fontSize: 17 }} className="font-semibold mb-1">
              Show it in
            </legend>
            {(['together', 'play', 'help'] as const).map((use) => (
              <label key={use} className="btn btn-ghost" style={{ fontSize: 18 }}>
                <input type="checkbox" checked={permittedUses.includes(use)} onChange={() => togglePermittedUse(use)} style={{ width: 22, height: 22 }} />
                {use === 'together' ? 'Together Moment' : use === 'play' ? 'Games' : 'Help'}
              </label>
            ))}
          </fieldset>

          <label className="flex items-center gap-3" style={{ minHeight: 60 }}>
            <input type="checkbox" checked={isCurrentLocation} onChange={(e) => setIsCurrentLocation(e.target.checked)} style={{ width: 22, height: 22 }} />
            <span style={{ fontSize: 16 }}>This can go out of date, e.g. where something is kept (review in 30 days)</span>
          </label>

          <button onClick={createPack} disabled={!title.trim() || (!recordedKey && !photoFile)} className="btn btn-primary btn-block">
            Save to the Memory Garden
          </button>
        </section>

        <section className="flex flex-col gap-3">
          <h2 style={{ fontSize: 23 }} className="font-extrabold">
            In the garden
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {packs.map((p) => (
              <div key={p.id} className="core p-4 flex items-center gap-3" data-testid="memory-card">
                {photoUrls[p.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrls[p.id]} alt={p.title} className="object-cover shrink-0" style={{ width: 72, height: 72, borderRadius: 12 }} />
                ) : (
                  <span style={{ color: 'var(--accent-warm)' }}>
                    <Icon name="photo" size={44} />
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 18, overflowWrap: 'anywhere' }} className="font-extrabold">
                    {p.title}
                  </div>
                  <div style={{ fontSize: 15 }} className="muted">
                    {KIND_LABEL[p.kind]} · {p.state} · {p.media.audio_key ? 'voice note' : 'no voice note'}
                  </div>
                </div>
                {p.media.audio_key && (
                  <button onClick={() => playPackAudio(p.media.audio_key)} aria-label="Listen" className="btn btn-ghost btn-icon shrink-0">
                    <Icon name="listen" size={22} />
                  </button>
                )}
                {p.state !== 'withdrawn' && (
                  <button onClick={() => withdraw(p)} style={{ fontSize: 16, fontWeight: 700, color: 'var(--alert)', minHeight: 60, padding: '0 10px' }} className="shrink-0">
                    Withdraw
                  </button>
                )}
              </div>
            ))}
          </div>
          {!packs.length && (
            <p style={{ fontSize: 17 }} className="muted">
              The garden is empty — add a family photo above.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

const inputStyle = { border: '2px solid var(--control-border)', borderRadius: 'var(--radius)', minHeight: 60, padding: '0 14px', fontSize: 18 } as const;
