'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Person, Difficulty, CueType } from '@/lib/db';
import { decide, Decision } from '@/lib/model';
import { lastDifficulty, useActivityTrial } from '@/lib/activityHelpers';
import { playCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import Icon, { IconName } from '@/components/ui/Icon';
import ExitBar from '@/components/ui/ExitBar';
import AdaptiveBadge from '@/components/ui/AdaptiveBadge';
import SessionOutcomeNote from '@/components/ui/SessionOutcomeNote';
import StatusBadge from '@/components/ui/StatusBadge';

const ACTIVITY_VERSION = '1';
const SHAPES: IconName[] = ['triangle', 'square', 'circle', 'star'];
const PERIOD_FOR_DIFFICULTY: Record<Difficulty, number> = { 1: 2, 2: 2, 3: 3, 4: 4 };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSequence(period: number) {
  const pattern = shuffle(SHAPES).slice(0, period);
  const visibleLength = period * 2;
  const visible = Array.from({ length: visibleLength }, (_, i) => pattern[i % period]);
  const answer = pattern[visibleLength % period];
  return { visible, answer, pattern };
}

export default function PatternGarden({ person }: { person: Person }) {
  const router = useRouter();
  const { logTrial } = useActivityTrial(person.id, 'pattern_garden', ACTIVITY_VERSION);

  const [phase, setPhase] = useState<'loading' | 'playing' | 'paused' | 'done'>('loading');
  const [outcome, setOutcome] = useState<'completed' | 'not_completed' | null>(null);
  const [nextPreview, setNextPreview] = useState<Decision | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [visible, setVisible] = useState<IconName[]>([]);
  const [answer, setAnswer] = useState<IconName | null>(null);
  const [mismatches, setMismatches] = useState(0);
  const [wrong, setWrong] = useState<IconName | null>(null);
  const [reduced, setReduced] = useState(false);
  const [highlightAnswer, setHighlightAnswer] = useState(false);

  /**
   * Priority 3 stretch (research finding #2: motion + cognitive challenge
   * beats static tap-only for cognitive gains) — dragging a shape onto the
   * "?" slot is an ADDITIONAL way to answer, not a replacement. Tap still
   * works exactly as before via the button's own onClick; this only adds a
   * second, more physically-embodied input path on top of it, so nobody who
   * can't perform a drag gesture loses the ability to play (every
   * interactive element keeps a persistent, non-gesture fallback — the same
   * rule the redesign brief applies everywhere else).
   */
  const [drag, setDrag] = useState<{ shape: IconName; x: number; y: number; overTarget: boolean } | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const suppressNextClick = useRef(false);
  const activeDragCleanup = useRef<(() => void) | null>(null);
  const DRAG_THRESHOLD_PX = 12;

  // Safety net for navigating away (Stop/Skip/Pause) mid-drag: without this,
  // a drag started right before unmount would leave its window listeners
  // attached forever, each still holding a closure over this instance.
  useEffect(() => {
    return () => activeDragCleanup.current?.();
  }, []);

  function isOverDropZone(x: number, y: number): boolean {
    const el = dropZoneRef.current;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  /**
   * Listens on `window`, not the button that started the gesture: a drag
   * naturally ends with the pointer over a DIFFERENT element (the drop
   * zone), and relying on that original button to still receive the "up"
   * event left the ghost stuck on screen whenever the browser routed the
   * final event elsewhere. Attaching to window for the gesture's duration
   * guarantees exactly one cleanup regardless of where the pointer ends up.
   */
  function onChoicePointerDown(shape: IconName, e: ReactPointerEvent<HTMLButtonElement>) {
    if (phase !== 'playing') return;
    const startX = e.clientX;
    const startY = e.clientY;
    let dragging = false;

    const onMove = (ev: PointerEvent) => {
      if (!dragging && Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD_PX) return;
      dragging = true;
      setDrag({ shape, x: ev.clientX, y: ev.clientY, overTarget: isOverDropZone(ev.clientX, ev.clientY) });
    };
    const removeListeners = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      activeDragCleanup.current = null;
    };
    const finish = (ev: PointerEvent) => {
      removeListeners();
      setDrag(null);
      if (dragging && isOverDropZone(ev.clientX, ev.clientY)) {
        suppressNextClick.current = true; // the browser still fires a click after pointerup; this round already answered
        pick(shape);
      }
    };
    const onUp = (ev: PointerEvent) => finish(ev);
    const onCancel = (ev: PointerEvent) => finish(ev);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    activeDragCleanup.current = removeListeners;
  }

  function onChoiceClick(shape: IconName) {
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      return;
    }
    pick(shape);
  }

  useEffect(() => {
    (async () => {
      const diff = await lastDifficulty(person.id, 'pattern_garden');
      const d = await decide({
        personId: person.id,
        activity: 'pattern_garden',
        difficulty: diff,
        allowedCues: person.care_config.allowed_cues,
        maxDifficulty: person.care_config.max_difficulty,
      });
      setDecision(d);
      setDifficulty(d.chosenDifficulty);

      const period = PERIOD_FOR_DIFFICULTY[d.chosenDifficulty];
      const { visible: v, answer: a } = buildSequence(period);
      setVisible(v);
      setAnswer(a);

      if (d.chosenCue === 'reduce_choices') setReduced(true);
      if (d.chosenCue === 'highlight' || d.chosenCue === 'demonstrate') setHighlightAnswer(true);
      if (d.chosenCue === 'repeat_audio') playCue('play.pattern.intro', person.language);

      setPhase('playing');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person]);

  const choices = useMemo(() => {
    if (!answer) return [];
    if (!reduced) return SHAPES;
    const distractor = SHAPES.find((s) => s !== answer)!;
    return shuffle([answer, distractor]);
  }, [answer, reduced]);

  const budget = useMemo(() => choices.length * 3, [choices]);

  /** In-activity assistance request — Part 3.1 F2 / Part 12 demo script. */
  async function onHelp() {
    if (phase !== 'playing') return;
    const d = await decide({
      personId: person.id,
      activity: 'pattern_garden',
      difficulty,
      allowedCues: person.care_config.allowed_cues,
      maxDifficulty: person.care_config.max_difficulty,
      explicitHelpRequested: true,
    });
    setDecision(d);
    switch (d.chosenCue) {
      case 'highlight':
        playCue('cue.highlight', person.language);
        setHighlightAnswer(true);
        break;
      case 'demonstrate':
        playCue('cue.demonstrate', person.language);
        setHighlightAnswer(true);
        break;
      case 'reduce_choices':
        playCue('cue.reduce', person.language);
        setReduced(true);
        break;
      default:
        playCue('play.pattern.intro', person.language);
    }
  }

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
      activity: 'pattern_garden',
      difficulty,
      allowedCues: person.care_config.allowed_cues,
      maxDifficulty: person.care_config.max_difficulty,
    });
    setNextPreview(preview);
  }

  async function pick(shape: IconName) {
    if (phase !== 'playing' || !answer) return;
    if (shape === answer) {
      await finishSession('completed', mismatches);
      return;
    }
    setWrong(shape);
    setTimeout(() => setWrong(null), 700);
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
      <header className="p-4 flex items-center justify-between gap-3">
        <h1 style={{ fontSize: 22 }} className="font-black text-[var(--text)]">
          {t('activity.pattern_garden', person.language)}
        </h1>
        <div className="flex items-center gap-2">
          <AdaptiveBadge decision={decision} lang={person.language} />
          <StatusBadge lang={person.language} />
        </div>
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
      <div className="flex-1 flex flex-col items-center gap-8 p-4">
        <div className="flex gap-2 flex-wrap justify-center">
          {visible.map((shape, i) => (
            <div key={i} style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', padding: 10 }}>
              <Icon name={shape} size={44} />
            </div>
          ))}
          <div
            ref={dropZoneRef}
            style={{
              border: `var(--border-w) dashed ${drag?.overTarget ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: 10,
              minWidth: 64,
              background: drag?.overTarget ? 'var(--accent-soft)' : 'transparent',
            }}
            className="flex items-center justify-center"
          >
            <span style={{ fontSize: 28 }} className="font-black">
              ?
            </span>
          </div>
        </div>

        <p style={{ fontSize: 13 }} className="text-[var(--text-muted)] -mt-4">
          Tap an answer, or drag it onto the {'"?"'}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {choices.map((shape) => (
            <button
              key={shape}
              data-testid="pattern-choice"
              onClick={() => onChoiceClick(shape)}
              onPointerDown={(e) => onChoicePointerDown(shape, e)}
              disabled={phase === 'paused'}
              style={{
                minHeight: 90,
                minWidth: 90,
                border: `var(--border-w) solid ${wrong === shape ? 'var(--alert)' : highlightAnswer && shape === answer ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                opacity: drag?.shape === shape ? 0.35 : 1,
                touchAction: 'none',
              }}
              className="flex items-center justify-center"
            >
              <Icon name={shape} size={48} />
            </button>
          ))}
        </div>
      </div>
      )}

      {drag && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: drag.x - 28,
            top: drag.y - 28,
            width: 56,
            height: 56,
            pointerEvents: 'none',
            background: 'var(--surface)',
            border: `var(--border-w) solid ${drag.overTarget ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            zIndex: 50,
          }}
          className="flex items-center justify-center"
        >
          <Icon name={drag.shape} size={32} />
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
        onSkip={() => logAndLeave('skipped', '/play')}
        onStop={() => logAndLeave('withdrawn', '/')}
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
