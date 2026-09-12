'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Person, Difficulty, CueType, getBlob, packsForPerson } from '@/lib/db';
import { decide, Decision } from '@/lib/model';
import { lastDifficulty, useActivityTrial } from '@/lib/activityHelpers';
import { loadRegionalManifest, RegionalItem } from '@/lib/regionalPacks';
import { playPackAudio, playCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import Icon from '@/components/ui/Icon';
import IconTile from '@/components/ui/IconTile';
import ExitBar from '@/components/ui/ExitBar';
import AdaptiveBadge from '@/components/ui/AdaptiveBadge';
import SessionOutcomeNote from '@/components/ui/SessionOutcomeNote';
import StatusBadge from '@/components/ui/StatusBadge';

const ACTIVITY_VERSION = '1';
const CHOICES_FOR_DIFFICULTY: Record<Difficulty, number> = { 1: 2, 2: 3, 3: 4, 4: 5 };

interface Choice {
  id: string;
  label: string;
  icon?: RegionalItem['icon'];
  photoUrl?: string;
  audioKey?: string;
  isRegional: boolean;
}

async function buildPool(person: Person, need: number): Promise<{ pool: Choice[]; hasAudio: boolean }> {
  const packs = await packsForPerson(person.id, 'approved');
  const usable = packs.filter((p) => p.permitted_uses.includes('play') && (p.kind === 'object' || p.kind === 'place'));

  const pool: Choice[] = [];
  for (const p of usable) {
    const photoKey = p.media.photo ?? p.media.place_photo;
    const photoBlob = photoKey ? await getBlob(photoKey) : undefined;
    if (!photoBlob) continue; // Sound & Sight needs a visible image per choice
    pool.push({
      id: p.id,
      label: p.title,
      photoUrl: URL.createObjectURL(photoBlob),
      audioKey: p.media.audio_key,
      isRegional: false,
    });
  }

  const hasAudio = pool.length > 0;

  if (pool.length < need) {
    const manifest = await loadRegionalManifest();
    // Shuffle before picking: manifest.objects is now a 16-item pool (see
    // Part 20 expansion) specifically so sessions vary — reading it in
    // fixed array order would always pick the same first `need` items and
    // silently waste the expanded pool.
    for (const r of shuffle(manifest.objects)) {
      if (pool.length >= need) break;
      if (pool.some((c) => c.id === r.id)) continue;
      pool.push({ id: r.id, label: r.label, icon: r.icon, isRegional: true });
    }
  }
  return { pool: pool.slice(0, need), hasAudio };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SoundAndSight({ person }: { person: Person }) {
  const router = useRouter();
  const { logTrial } = useActivityTrial(person.id, 'sound_sight', ACTIVITY_VERSION);

  const [phase, setPhase] = useState<'loading' | 'playing' | 'paused' | 'done'>('loading');
  const [outcome, setOutcome] = useState<'completed' | 'not_completed' | null>(null);
  const [nextPreview, setNextPreview] = useState<Decision | null>(null);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [audioMode, setAudioMode] = useState(false);
  const [usedRegional, setUsedRegional] = useState(false);
  const [mismatches, setMismatches] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
  const [demoTargetShown, setDemoTargetShown] = useState(false);

  const visualOnly = person.care_config.sensory_mode === 'visual_only';

  useEffect(() => {
    (async () => {
      const diff = await lastDifficulty(person.id, 'sound_sight');
      const d = await decide({
        personId: person.id,
        activity: 'sound_sight',
        difficulty: diff,
        allowedCues: person.care_config.allowed_cues,
        maxDifficulty: person.care_config.max_difficulty,
      });
      setDecision(d);
      setDifficulty(d.chosenDifficulty);

      const need = CHOICES_FOR_DIFFICULTY[d.chosenDifficulty];
      const { pool, hasAudio } = await buildPool(person, need);
      setUsedRegional(pool.some((c) => c.isRegional));
      const useAudio = hasAudio && !visualOnly;
      setAudioMode(useAudio);

      const shuffled = shuffle(pool);
      setChoices(shuffled);
      const target = shuffled[Math.floor(Math.random() * shuffled.length)];
      setTargetId(target.id);

      // Apply the chosen assistance cue up front, where it makes sense as a head start.
      if (d.chosenCue === 'reduce_choices' && shuffled.length > 2) setReduced(true);
      if (d.chosenCue === 'demonstrate') setDemoTargetShown(true);
      if (useAudio && target.audioKey) playPackAudio(target.audioKey);

      setPhase('playing');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person]);

  const visibleChoices = useMemo(() => {
    if (!reduced || choices.length <= 2) return choices;
    // Keep the target plus one random distractor when the cue trims the field.
    const target = choices.find((c) => c.id === targetId)!;
    const others = choices.filter((c) => c.id !== targetId);
    return shuffle([target, others[0]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, choices, targetId]);

  const budget = useMemo(() => visibleChoices.length * 3, [visibleChoices]);

  const target = choices.find((c) => c.id === targetId);

  function replay() {
    if (audioMode && target?.audioKey) playPackAudio(target.audioKey);
  }

  /** In-activity assistance request — Part 3.1 F2 / Part 12 demo script. */
  async function onHelp() {
    if (phase !== 'playing') return;
    const d = await decide({
      personId: person.id,
      activity: 'sound_sight',
      difficulty,
      allowedCues: person.care_config.allowed_cues,
      maxDifficulty: person.care_config.max_difficulty,
      explicitHelpRequested: true,
    });
    setDecision(d);
    switch (d.chosenCue) {
      case 'highlight':
        playCue('cue.highlight', person.language);
        setDemoTargetShown(true);
        break;
      case 'demonstrate':
        playCue('cue.demonstrate', person.language);
        setDemoTargetShown(true);
        break;
      case 'reduce_choices':
        playCue('cue.reduce', person.language);
        setReduced(true);
        break;
      default:
        replay();
    }
  }

  /**
   * SIH26003 (b): instead of navigating away the instant the round ends,
   * show a brief completion screen with a preview of what decide() would
   * choose next time — logTrial() must land first since decide() reads
   * db.trials.
   */
  async function finishSession(finalOutcome: 'completed' | 'not_completed', errors: number) {
    await logTrial({
      outcome: finalOutcome,
      difficulty,
      cue: (decision?.chosenCue ?? 'none') as CueType,
      policyMode: decision?.mode ?? 'baseline',
      modelVersion: decision?.modelVersion ?? 'unknown',
      perseverativeErrors: errors,
    });
    setOutcome(finalOutcome);
    setPhase('done');
    const preview = await decide({
      personId: person.id,
      activity: 'sound_sight',
      difficulty,
      allowedCues: person.care_config.allowed_cues,
      maxDifficulty: person.care_config.max_difficulty,
    });
    setNextPreview(preview);
  }

  async function pick(choiceId: string) {
    if (phase !== 'playing') return;
    if (choiceId === targetId) {
      await finishSession('completed', mismatches);
      return;
    }
    setWrongId(choiceId);
    setTimeout(() => setWrongId(null), 700);
    const next = mismatches + 1;
    setMismatches(next);
    if (next >= budget) await finishSession('not_completed', next);
  }

  useEffect(() => {
    // visibilitychange, not pagehide: pagehide's async IndexedDB write is
    // frequently killed mid-flight by the browser tearing the page down
    // before it completes (observed live). visibilitychange fires earlier,
    // while the page is still fully alive, giving the write time to land.
    const onHide = () => {
      if (document.visibilityState === 'hidden' && (phase === 'playing' || phase === 'paused')) {
        logTrial({
          outcome: 'interrupted',
          difficulty,
          cue: (decision?.chosenCue ?? 'none') as CueType,
          policyMode: decision?.mode ?? 'baseline',
          modelVersion: decision?.modelVersion ?? 'unknown',
          perseverativeErrors: mismatches,
        });
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, difficulty, decision, mismatches]);

  if (phase === 'loading' || !decision) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <p style={{ fontSize: 18 }}>Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="p-4 flex items-center justify-between gap-3 flex-wrap">
        <h1 style={{ fontSize: 22 }} className="font-black text-[var(--text)]">
          {t('activity.sound_sight', person.language)}
        </h1>
        <div className="flex items-center gap-2">
          <AdaptiveBadge decision={decision} lang={person.language} />
          <StatusBadge lang={person.language} />
        </div>
        {usedRegional && (
          <span style={{ fontSize: 12 }} className="text-[var(--text-muted)] max-w-[45%] text-right">
            Using general pictures. Add {person.display_name}&apos;s own things when you can.
          </span>
        )}
      </header>

      {phase === 'done' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
          {outcome === 'completed' ? (
            <>
              <Icon name="check" size={64} />
              <p style={{ fontSize: 22 }} className="font-black">
                Well done.
              </p>
            </>
          ) : (
            <p style={{ fontSize: 20 }}>That is completely fine. We can try again another time.</p>
          )}
          {nextPreview && decision && (
            <SessionOutcomeNote preview={nextPreview} playedDifficulty={difficulty} playedCue={decision.chosenCue} />
          )}
          <button onClick={() => router.push('/play')} style={btnStyle}>
            {t('common.back', person.language)}
          </button>
        </div>
      )}

      {phase !== 'done' && !audioMode && (
        <p style={{ fontSize: 13 }} className="text-center text-[var(--text-muted)] px-4 -mt-2 mb-2">
          {visualOnly
            ? 'Visual mode — find the picture that matches the one shown.'
            : 'No recorded sounds yet — showing picture-matching instead.'}
        </p>
      )}

      {phase !== 'done' && (
      <div className="flex-1 flex flex-col items-center gap-6 p-4">
        {audioMode ? (
          <button
            onClick={replay}
            style={{ border: 'var(--border-w) solid var(--accent)', borderRadius: 'var(--radius)', minHeight: 96, minWidth: 200 }}
            className="flex items-center justify-center gap-3 text-[var(--accent)] font-black text-xl"
          >
            <Icon name="listen" size={40} /> {t('a11y.listen', person.language)}
          </button>
        ) : (
          target && (
            <div className="flex flex-col items-center gap-2">
              {target.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={target.photoUrl} alt="" className="w-28 h-28 object-cover rounded" style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)' }} />
              ) : (
                <div style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', padding: 12 }}>
                  <IconTile icon={target.icon ?? 'square'} size={56} />
                </div>
              )}
            </div>
          )
        )}

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {visibleChoices.map((c) => (
            <button
              key={c.id}
              data-testid="sound-sight-choice"
              onClick={() => pick(c.id)}
              disabled={phase === 'paused'}
              style={{
                minHeight: 110,
                border: `var(--border-w) solid ${wrongId === c.id ? 'var(--alert)' : demoTargetShown && c.id === targetId ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
              }}
              className="flex items-center justify-center p-3"
            >
              {c.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.photoUrl} alt="" className="w-16 h-16 object-cover rounded" />
              ) : (
                <IconTile icon={c.icon ?? 'square'} size={40} />
              )}
            </button>
          ))}
        </div>
      </div>
      )}

      {phase === 'playing' && (
        <div className="px-4 pb-2 flex justify-center">
          <button
            onClick={onHelp}
            style={{ border: 'var(--border-w) solid var(--accent)', borderRadius: 'var(--radius)', minHeight: 56 }}
            className="flex items-center gap-2 px-6 text-[var(--accent)] font-black"
          >
            <Icon name="help" size={22} /> {t('home.help', person.language)}
          </button>
        </div>
      )}

      {phase !== 'done' && (
      <ExitBar
        person={person}
        paused={phase === 'paused'}
        onPauseToggle={() => setPhase(phase === 'paused' ? 'playing' : 'paused')}
        onSkip={() =>
          logTrial({
            outcome: 'skipped',
            difficulty,
            cue: (decision?.chosenCue ?? 'none') as CueType,
            policyMode: decision?.mode ?? 'baseline',
            modelVersion: decision?.modelVersion ?? 'unknown',
            perseverativeErrors: mismatches,
          }).then(() => router.push('/play'))
        }
        onStop={() =>
          logTrial({
            outcome: 'withdrawn',
            difficulty,
            cue: (decision?.chosenCue ?? 'none') as CueType,
            policyMode: decision?.mode ?? 'baseline',
            modelVersion: decision?.modelVersion ?? 'unknown',
            perseverativeErrors: mismatches,
          }).then(() => router.push('/'))
        }
      />
      )}
    </main>
  );
}

const btnStyle = {
  minHeight: 56,
  background: 'var(--accent)',
  borderRadius: 'var(--radius)',
  color: 'white',
  fontWeight: 900,
  padding: '0 28px',
  fontSize: 18,
} as const;
