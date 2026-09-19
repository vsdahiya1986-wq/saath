'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CueType, Difficulty, Person } from '@/lib/db';
import { usablePacks } from '@/lib/familyContent';
import { useCstSession } from '@/lib/useCstSession';
import { loadRegionalManifest, pickRegionalRoutine } from '@/lib/regionalPacks';
import { playCue, playPackAudio, queueAutoCue, say, speak } from '@/lib/audio';
import { t } from '@/lib/i18n';
import { shuffle } from '@/content/cstContent';
import { onWrongAnswer } from '@/lib/stepRunner';
import Icon, { IconName } from '@/components/ui/Icon';
import { distinctIcons } from '@/lib/distinctIcons';
import GameFrame from './GameFrame';

/** "My Next Step" — CST Session 4, Everyday Practical Life: order a familiar daily routine. */

/**
 * B3: slot count is the step count, so a 4-step routine never renders 3 slots.
 * Difficulty 1 shortens the routine to its first 2 steps rather than dropping
 * the last step of a 4-step one and asking for an order that isn't the routine.
 */
const STEPS_FOR: Record<Difficulty, number> = { 1: 2, 2: 3, 3: 4, 4: 4 };

interface Step {
  id: string;
  /** The family's own words, or the English fallback for a regional step. */
  label: string;
  /** Regional steps only: translated through `t()` (fix pack A1). */
  labelKey?: string;
  icon: IconName;
}

async function buildRoutine(person: Person, need: number) {
  const packs = await usablePacks(person.id);
  const routine = packs.find((p) => p.kind === 'routine' && p.permitted_uses.includes('play') && p.media.steps?.length);
  if (routine?.media.steps?.length) {
    return {
      title: routine.title,
      steps: routine.media.steps.slice(0, need).map((label, i) => ({ id: `${routine.id}_${i}`, label, icon: 'clock' as IconName })),
      audioKey: routine.media.audio_key,
      family: true,
    };
  }
  const r = pickRegionalRoutine(await loadRegionalManifest());
  return {
    title: t(`routine.${r.id}`, person.language),
    steps: distinctIcons(
      r.steps.slice(0, need).map((s) => ({ id: s.id, label: s.label, labelKey: `step.${r.id}.${s.id}`, icon: s.icon })),
      'My Next Step',
    ),
    audioKey: undefined,
    family: false,
  };
}

export default function MyNextStep({ person, onRestart }: { person: Person; onRestart: () => void }) {
  const lang = person.language;
  const name = (s: Step) => (s.labelKey ? t(s.labelKey, lang) : s.label);
  /** Regional steps have a recording; a family's own step is read by the device voice. */
  const sayStep = (s: Step, revealed: boolean) => {
    const line = revealed ? `Next comes ${s.label}.` : s.label;
    return s.labelKey ? say(line, s.labelKey, lang) : speak(line, lang);
  };
  const [title, setTitle] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [tiles, setTiles] = useState<Step[]>([]);
  const [placed, setPlaced] = useState<Step[]>([]);
  const [audioKey, setAudioKey] = useState<string | undefined>();
  const [family, setFamily] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [retry, setRetry] = useState(false);
  const [reduced, setReduced] = useState(false);
  const wrongThisStep = useRef(0);
  const locked = useRef(false);

  const session = useCstSession({
    person,
    activity: 'my_next_step',
    version: '2',
    onStart: async (d, isCancelled) => {
      const r = await buildRoutine(person, STEPS_FOR[d?.chosenDifficulty ?? 1]);
      if (isCancelled()) return;
      setTitle(r.title);
      setSteps(r.steps);
      setAudioKey(r.audioKey);
      setFamily(r.family);
      if (d?.chosenCue === 'demonstrate' && r.steps.length > 1) {
        setPlaced([r.steps[0]]);
        setTiles(shuffle(r.steps.slice(1)));
      } else {
        setTiles(shuffle(r.steps));
      }
      if (d?.chosenCue === 'highlight') setHint(true);
      if (d?.chosenCue === 'reduce_choices') setReduced(true);
      if (r.audioKey) playPackAudio(r.audioKey);
      else queueAutoCue('play.step.intro', lang);
    },
  });

  const nextCorrect = steps[placed.length];
  // No sentence built around a step name: that can only be spoken in English.
  // The step just placed is on screen directly above the question.
  const questionKey = placed.length === 0 ? 'q.next_step.first' : 'q.next_step.after';
  const question = t(questionKey, lang);

  useEffect(() => {
    if (nextCorrect && session.phase === 'playing') queueAutoCue(questionKey, lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed.length, steps.length, session.phase === 'playing']);

  const visibleTiles = useMemo(() => {
    if (!reduced || tiles.length <= 2 || !nextCorrect) return tiles;
    const other = tiles.find((t) => t.id !== nextCorrect.id)!;
    return tiles.filter((t) => t.id === nextCorrect.id || t.id === other.id);
  }, [tiles, reduced, nextCorrect]);

  /** Places the step that actually comes next, says it, and moves the routine on. */
  function accept(revealed: boolean) {
    if (!nextCorrect) return;
    const step = nextCorrect;
    const newPlaced = [...placed, step];
    setPlaced(newPlaced);
    setTiles((ts) => ts.filter((s) => s.id !== step.id));
    setHint(false);
    setRetry(false);
    wrongThisStep.current = 0;
    sayStep(step, revealed);
    if (newPlaced.length === steps.length) {
      locked.current = true;
      setTimeout(() => session.finish('completed'), 900);
    }
  }

  /** Tap-to-undo (B3): a placed step goes back to the options, no drag anywhere. */
  function unplace(i: number) {
    if (locked.current || !session.isPlaying()) return;
    const returning = placed.slice(i);
    setPlaced(placed.slice(0, i));
    setTiles((ts) => [...returning, ...ts]);
    wrongThisStep.current = 0;
    setHint(false);
    setRetry(false);
  }

  function tap(tile: Step) {
    if (locked.current || !session.isPlaying() || !nextCorrect) return;
    if (tile.id === nextCorrect.id) {
      accept(false);
      return;
    }
    setWrongId(tile.id);
    setTimeout(() => setWrongId(null), 600);
    session.addError();
    setHint(true);
    if (onWrongAnswer(wrongThisStep.current) === 'reveal') {
      accept(true);
      return;
    }
    wrongThisStep.current += 1;
    playCue('game.look_again', lang);
    setRetry(true);
  }

  /** B4: skip this step only — place the one that comes next and move on. */
  function skipStep() {
    if (!nextCorrect || locked.current || !session.isPlaying()) return;
    session.skipOne();
    accept(true);
  }

  async function onHelp() {
    const cue: CueType = await session.requestHelp();
    if (!nextCorrect) return;
    if (cue === 'repeat_audio') {
      if (audioKey) playPackAudio(audioKey);
      else playCue(questionKey, lang);
    } else if (cue === 'highlight') {
      playCue('cue.highlight', lang);
      setHint(true);
    } else if (cue === 'reduce_choices') {
      playCue('cue.reduce', lang);
      setReduced(true);
    } else if (cue === 'demonstrate') {
      tap(nextCorrect);
    }
  }

  return (
    <GameFrame
      retry={retry}
      person={person}
      activity="my_next_step"
      session={session}
      onRestart={onRestart}
      progress={{ current: placed.length + 1, total: steps.length }}
      onListen={() => playCue(questionKey, lang)}
      onHelp={onHelp}
      onSkipStep={skipStep}
      notice={family ? `${t('notice.family_routine', lang)}: ${title}` : title ? `${title} — ${t('notice.routine_generic', lang)}` : undefined}
      prompt={
        <p data-testid="question" style={{ fontSize: 27, letterSpacing: '-0.015em' }} className="font-extrabold leading-snug">
          {question}
        </p>
      }
    >
      <ol className="flex flex-col gap-3">
        {steps.map((s, i) => {
          const done = placed[i];
          const isNext = i === placed.length;
          return (
            <li
              key={s.id}
              className="panel flex items-center gap-4 px-4 py-3 transition-all"
              style={{
                borderColor: done ? 'var(--ok)' : isNext ? 'var(--accent)' : 'var(--control-border)',
                borderWidth: 2,
                borderStyle: done ? 'solid' : 'dashed',
                background: done ? 'var(--ok-soft)' : 'var(--surface)',
                transitionTimingFunction: 'var(--ease-spring)',
                transitionDuration: '500ms',
              }}
            >
              <span
                className="flex items-center justify-center rounded-full font-extrabold shrink-0"
                style={{ width: 44, height: 44, fontSize: 20, background: done ? 'var(--ok)' : 'var(--surface-3)', color: done ? 'var(--on-accent)' : 'var(--text-muted)' }}
              >
                {done ? <Icon name="check" size={24} strokeWidth={3} /> : i + 1}
              </span>
              {done ? (
                <button
                  onClick={() => unplace(i)}
                  data-testid="placed-step"
                  aria-label={name(done)}
                  className="flex items-center gap-3 rise text-left flex-1"
                  style={{ fontSize: 22, minHeight: 64 }}
                >
                  <span style={{ color: 'var(--ok)' }}>
                    <Icon name={done.icon} size={28} />
                  </span>
                  <span className="font-bold">{name(done)}</span>
                </button>
              ) : null /* B3: an empty slot carries only its faint number — no "Next step…" placeholder */}
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-2 gap-4">
        {visibleTiles.map((tile, i) => {
          const cls = wrongId === tile.id ? 'is-wrong' : hint && tile.id === nextCorrect?.id ? 'is-hint' : '';
          return (
            <button
              key={tile.id}
              data-testid="step-tile"
              onClick={() => tap(tile)}
              disabled={session.phase !== 'playing'}
              className={`tile rise rise-${Math.min(i + 1, 6)} ${cls}`}
              style={{ fontSize: 22 }}
            >
              <span style={{ color: 'var(--accent-2)' }}>
                <Icon name={tile.icon} size={46} />
              </span>
              <span className="text-center leading-tight">{name(tile)}</span>
            </button>
          );
        })}
      </div>
    </GameFrame>
  );
}
