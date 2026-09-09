'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Person, ContentPack, getBlob, packsForPerson, putPack } from '@/lib/db';
import { MODEL_VERSION } from '@/lib/model';
import { useActivityTrial } from '@/lib/activityHelpers';
import { playPackAudio, playCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import Icon from '@/components/ui/Icon';
import ExitBar from '@/components/ui/ExitBar';

const ACTIVITY_VERSION = '1';

/**
 * No score, no streak, no adaptive difficulty — deliberately. This is the
 * one activity the master plan (Part 3.1, F2) explicitly exempts from the
 * performance-scored model, and it never gets a generic regional fallback
 * either: a placeholder object is harmless practice content, but a
 * placeholder "memory" for a reminiscence activity would be hollow. If no
 * pack exists, we say so honestly instead of inventing one.
 */
export default function TogetherMoment({ person }: { person: Person }) {
  const router = useRouter();
  const { logTrial } = useActivityTrial(person.id, 'together', ACTIVITY_VERSION);

  const [phase, setPhase] = useState<'loading' | 'playing' | 'paused' | 'none'>('loading');
  const [pack, setPack] = useState<ContentPack | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [confirmingReject, setConfirmingReject] = useState(false);

  useEffect(() => {
    (async () => {
      const packs = await packsForPerson(person.id, 'approved');
      const candidates = packs.filter((p) => p.permitted_uses.includes('together'));
      if (!candidates.length) {
        setPhase('none');
        return;
      }
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      setPack(chosen);
      const photoKey = chosen.media.photo ?? chosen.media.place_photo;
      if (photoKey) {
        const blob = await getBlob(photoKey);
        if (blob) setPhotoUrl(URL.createObjectURL(blob));
      }
      if (chosen.media.audio_key) playPackAudio(chosen.media.audio_key);
      else playCue('play.together.intro', person.language);
      setPhase('playing');
    })();
  }, [person]);

  async function finish(outcome: 'completed' | 'skipped' | 'withdrawn') {
    await logTrial({
      outcome,
      difficulty: 1,
      cue: 'none',
      policyMode: 'baseline',
      modelVersion: MODEL_VERSION,
    });
    router.push(outcome === 'withdrawn' ? '/' : '/play');
  }

  async function rejectForever() {
    if (!pack) return;
    if (!confirmingReject) {
      setConfirmingReject(true);
      return;
    }
    await putPack({ ...pack, state: 'withdrawn' });
    await logTrial({ outcome: 'skipped', difficulty: 1, cue: 'none', policyMode: 'baseline', modelVersion: MODEL_VERSION });
    router.push('/play');
  }

  useEffect(() => {
    // visibilitychange, not pagehide: pagehide's async IndexedDB write is
    // frequently killed mid-flight by the browser tearing the page down
    // before it completes (observed live). visibilitychange fires earlier,
    // while the page is still fully alive, giving the write time to land.
    const onHide = () => {
      if (document.visibilityState === 'hidden' && (phase === 'playing' || phase === 'paused')) {
        logTrial({ outcome: 'interrupted', difficulty: 1, cue: 'none', policyMode: 'baseline', modelVersion: MODEL_VERSION });
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <p style={{ fontSize: 18 }}>Loading…</p>
      </main>
    );
  }

  if (phase === 'none') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg)] p-6 text-center">
        <p style={{ fontSize: 20 }}>No shared moments have been prepared yet.</p>
        <p style={{ fontSize: 15 }} className="text-[var(--text-muted)]">
          A family member can record one in Pack Studio, marked for &quot;together&quot;.
        </p>
        <button
          onClick={() => router.push('/play')}
          style={{ minHeight: 56, background: 'var(--accent)', borderRadius: 'var(--radius)' }}
          className="text-white font-black px-8 text-lg"
        >
          {t('common.back', person.language)}
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="p-4">
        <h1 style={{ fontSize: 22 }} className="font-black text-[var(--text)]">
          {t('activity.together', person.language)}
        </h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-4">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={pack?.title ?? ''} className="max-w-full max-h-72 object-contain rounded" style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)' }} />
        ) : (
          <Icon name="photo" size={96} />
        )}
        <p style={{ fontSize: 24 }} className="font-black text-center">
          {pack?.title}
        </p>
        <button
          onClick={() => pack && playPackAudio(pack.media.audio_key)}
          style={{ border: 'var(--border-w) solid var(--accent)', borderRadius: 'var(--radius)', minHeight: 64 }}
          className="flex items-center gap-2 px-6 text-[var(--accent)] font-black"
        >
          <Icon name="listen" size={26} /> {t('a11y.listen', person.language)}
        </button>

        <button
          onClick={() => finish('completed')}
          style={{ minHeight: 72, background: 'var(--accent)', borderRadius: 'var(--radius)' }}
          className="text-white font-black px-10 text-xl mt-4"
        >
          Done talking about this
        </button>

        <button
          onClick={rejectForever}
          style={{ fontSize: 13, color: 'var(--alert)' }}
          className="underline mt-2"
        >
          {confirmingReject ? 'Tap again to remove this forever' : "I don't want to see this again"}
        </button>
      </div>

      <ExitBar
        person={person}
        paused={phase === 'paused'}
        onPauseToggle={() => setPhase(phase === 'paused' ? 'playing' : 'paused')}
        onSkip={() => finish('skipped')}
        onStop={() => finish('withdrawn')}
      />
    </main>
  );
}
