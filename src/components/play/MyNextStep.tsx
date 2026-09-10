'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Person, Difficulty, CueType, packsForPerson } from '@/lib/db';
import { decide, Decision } from '@/lib/model';
import { lastDifficulty, useActivityTrial } from '@/lib/activityHelpers';
import { loadRegionalManifest } from '@/lib/regionalPacks';
import { playPackAudio, playCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import Icon, { IconName } from '@/components/ui/Icon';
import ExitBar from '@/components/ui/ExitBar';
import AdaptiveBadge from '@/components/ui/AdaptiveBadge';
import SessionOutcomeNote from '@/components/ui/SessionOutcomeNote';
import StatusBadge from '@/components/ui/StatusBadge';

const ACTIVITY_VERSION = '1';
const STEPS_FOR_DIFFICULTY: Record<Difficulty, number> = { 1: 3, 2: 3, 3: 4, 4: 5 };

interface Step {
  id: string;
  label: string;
  icon: IconName;
}

async function buildRoutine(person: Person, need: number): Promise<{ steps: Step[]; audioKey?: string; isRegional: boolean }> {
  const packs = await packsForPerson(person.id, 'approved');
  const routine = packs.find((p) => p.kind === 'routine' && p.permitted_uses.includes('play') && p.media.steps?.length);

  if (routine?.media.steps?.length) {
    const steps: Step[] = routine.media.steps.slice(0, need).map((label, i) => ({ id: `${routine.id}_${i}`, label, icon: 'clock' }));
    return { steps, audioKey: routine.media.audio_key, isRegional: false };
  }

  const manifest = await loadRegionalManifest();
  const steps = manifest.defaultRoutine.steps.slice(0, need).map((s) => ({ id: s.id, label: s.label, icon: s.icon }));
  return { steps, isRegional: true };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MyNextStep({ person }: { person: Person }) {
  const router = useRouter();
  const { logTrial } = useActivityTrial(person.id, 'my_next_step', ACTIVITY_VERSION);

  const [phase, setPhase] = useState<'loading' | 'playing' | 'paused' | 'done'>('loading');
  const [outcome, setOutcome] = useState<'completed' | 'not_completed' | null>(null);
  const [nextPreview, setNextPreview] = useState<Decision | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [steps, setSteps] = useState<Step[]>([]);
  const [tiles, setTiles] = useState<Step[]>([]);
  const [placed, setPlaced] = useState<Step[]>([]);
  const [audioKey, setAudioKey] = useState<string | undefined>();
  const [isRegional, setIsRegional] = useState(false);
  const [mismatches, setMismatches] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [highlightNext, setHighlightNext] = useState(false);

  useEffect(() => {
    (async () => {
      const diff = await lastDifficulty(person.id, 'my_next_step');
      const d = await decide({
        personId: person.id,
        activity: 'my_next_step',
        difficulty: diff,
        allowedCues: person.care_config.allowed_cues,
        maxDifficulty: person.care_config.max_difficulty,
      });
      setDecision(d);
      setDifficulty(d.chosenDifficulty);

      const need = STEPS_FOR_DIFFICULTY[d.chosenDifficulty];
      const { steps: s, audioKey: ak, isRegional: reg } = await buildRoutine(person, need);
      setSteps(s);
      setAudioKey(ak);
      setIsRegional(reg);

      let startTiles = shuffle(s);
      let startPlaced: Step[] = [];
      if (d.chosenCue === 'demonstrate' && s.length > 1) {
        startPlaced = [s[0]];
        startTiles = shuffle(s.slice(1));
      }
      setTiles(startTiles);
      setPlaced(startPlaced);

      if (d.chosenCue === 'highlight') setHighlightNext(true);
      if (ak) playPackAudio(ak);
      else playCue('play.step.intro', person.language);
      if (d.chosenCue === 'repeat_audio') {
        setTimeout(() => (ak ? playPackAudio(ak) : playCue('play.step.intro', person.language)), 1200);
      }

      setPhase('playing');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person]);

  const budget = useMemo(() => Math.max(6, steps.length * 3), [steps]);
  const nextCorrectId = steps[placed.length]?.id;

  async function logAndLeave(outcome: 'skipped' | 'withdrawn', to: string) {
    await logTrial({
      outcome,
      difficulty,
      cue: (decision?.chosenCue ?? 'none') as CueType,
      policyMode: decision?.mode ?? 'baseline',
      modelVersion: decision?.modelVersion ?? 'unknown',
      perseverativeErrors: mismatches,
    });
    router.push(to);
  }

  /** SIH26003 (b): show what decide() would choose next time, right on the completion screen. */
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
      activity: 'my_next_step',
      difficulty,
      allowedCues: person.care_config.allowed_cues,
      maxDifficulty: person.care_config.max_difficulty,
    });
    setNextPreview(preview);
  }

  /** In-activity assistance request — Part 3.1 F2 / Part 12 demo script. */
  async function onHelp() {
    if (phase !== 'playing') return;
    const d = await decide({
      personId: person.id,
      activity: 'my_next_step',
      difficulty,
      allowedCues: person.care_config.allowed_cues,
      maxDifficulty: person.care_config.max_difficulty,
      explicitHelpRequested: true,
    });
    setDecision(d);
    switch (d.chosenCue) {
      case 'highlight':
        playCue('cue.highlight', person.language);
        setHighlightNext(true);
        break;
      case 'demonstrate': {
        playCue('cue.demonstrate', person.language);
        const next = tiles.find((tile) => tile.id === nextCorrectId);
        if (next) await tap(next); // reuse the real placement + completion-check path
        break;
      }
      case 'repeat_audio':
        audioKey ? playPackAudio(audioKey) : playCue('play.step.intro', person.language);
        break;
      default:
        break;
    }
  }

  async function tap(tile: Step) {
    if (phase !== 'playing') return;
    if (tile.id === nextCorrectId) {
      const newPlaced = [...placed, tile];
      setPlaced(newPlaced);
      setTiles((ts) => ts.filter((s) => s.id !== tile.id));
      if (newPlaced.length === steps.length) await finishSession('completed', mismatches);
      return;
    }
    setWrongId(tile.id);
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
          {t('activity.my_next_step', person.language)}
        </h1>
        <div className="flex items-center gap-2">
          <AdaptiveBadge decision={decision} lang={person.language} />
          <StatusBadge lang={person.language} />
        </div>
        {isRegional && (
          <span style={{ fontSize: 12 }} className="text-[var(--text-muted)] max-w-[45%] text-right">
            Using a general routine. Add {person.display_name}&apos;s own in Pack Studio.
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

      {phase !== 'done' && (
      <>
      <div className="p-4">
        <p style={{ fontSize: 14 }} className="text-[var(--text-muted)] mb-2">
          Your order so far:
        </p>
        <div className="flex gap-2 flex-wrap min-h-[60px]">
          {placed.map((s) => (
            <div key={s.id} style={{ border: 'var(--border-w) solid var(--accent)', borderRadius: 'var(--radius)', padding: 8, background: '#ECFDF5' }} className="flex items-center gap-2">
              <Icon name={s.icon} size={28} />
              <span style={{ fontSize: 13 }}>{s.label}</span>
            </div>
          ))}
          {!placed.length && <span style={{ fontSize: 13 }} className="text-[var(--text-muted)]">Nothing yet</span>}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center gap-4 p-4">
        <p style={{ fontSize: 14 }} className="text-[var(--text-muted)]">
          Tap the next step:
        </p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              data-testid="step-tile"
              onClick={() => tap(tile)}
              disabled={phase === 'paused'}
              style={{
                minHeight: 84,
                border: `var(--border-w) solid ${wrongId === tile.id ? 'var(--alert)' : highlightNext && tile.id === nextCorrectId ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
              }}
              className="flex flex-col items-center justify-center gap-1 p-2"
            >
              <Icon name={tile.icon} size={32} />
              <span style={{ fontSize: 13 }}>{tile.label}</span>
            </button>
          ))}
        </div>
      </div>

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

      <ExitBar
        person={person}
        paused={phase === 'paused'}
        onPauseToggle={() => setPhase(phase === 'paused' ? 'playing' : 'paused')}
        onSkip={() => logAndLeave('skipped', '/play')}
        onStop={() => logAndLeave('withdrawn', '/')}
      />
      </>
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
