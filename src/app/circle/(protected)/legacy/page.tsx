'use client';
import { useEffect, useState } from 'react';
import { getActivePersonId } from '@/lib/usePerson';
import { listLegacy, exportLegacyZip, LegacyEntry } from '@/lib/voiceLegacy';
import { playPackAudio } from '@/lib/audio';
import Icon from '@/components/ui/Icon';
import BackButton from '@/components/ui/BackButton';

export default function VoiceLegacy() {
  const [personId, setPersonId] = useState<string | null>(null);
  const [entries, setEntries] = useState<LegacyEntry[]>([]);

  useEffect(() => {
    getActivePersonId().then(async (id) => {
      setPersonId(id);
      if (id) setEntries(await listLegacy(id));
    });
  }, []);

  async function exportAll() {
    if (!personId) return;
    const zip = await exportLegacyZip(personId);
    const url = URL.createObjectURL(zip);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saath-voice-legacy.zip';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  if (!personId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center bg-[var(--bg)]">
        <p>Set up a person profile first.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-4 max-w-lg mx-auto">
      <header className="flex items-center gap-3">
        <BackButton href="/circle" label="Back to Circle" />
        <h1 style={{ fontSize: 26 }} className="font-black text-[var(--text)]">
          Voice Legacy
        </h1>
      </header>
      <p style={{ fontSize: 14 }} className="text-[var(--text-muted)]">
        Every prompt recorded in SAATH becomes part of a family&apos;s permanent voice archive. We don&apos;t
        synthesise a relative&apos;s voice — we help families keep the real one.
      </p>

      <div className="flex flex-col gap-2">
        {entries.map((e) => (
          <button
            key={e.packId}
            onClick={() => playPackAudio(e.audioKey)}
            style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', minHeight: 64 }}
            className="flex items-center gap-3 p-3 text-left"
          >
            <Icon name="mic" size={28} />
            <div className="flex-1">
              <div style={{ fontSize: 16 }} className="font-black">
                {e.title}
              </div>
              <div style={{ fontSize: 12 }} className="text-[var(--text-muted)]">
                {e.recordedByName} ({e.recordedByRole}) · {e.approvedAt ? new Date(e.approvedAt).toLocaleDateString() : ''}
              </div>
            </div>
            <Icon name="listen" size={20} />
          </button>
        ))}
        {!entries.length && (
          <p style={{ fontSize: 14 }} className="text-[var(--text-muted)]">
            No recordings yet — every prompt made in Pack Studio will appear here.
          </p>
        )}
      </div>

      <button
        onClick={exportAll}
        disabled={!entries.length}
        style={{ minHeight: 60, background: 'var(--accent)', borderRadius: 'var(--radius)' }}
        className="text-[var(--on-accent)] font-black disabled:opacity-40 mt-2"
      >
        Give the family a copy
      </button>
    </main>
  );
}
