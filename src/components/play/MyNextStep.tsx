'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CueType, Difficulty, Person } from '@/lib/db';
import { packsForPerson } from '@/lib/db';
import { useCstSession } from '@/lib/useCstSession';
import { loadRegionalManifest, pickRegionalRoutine } from '@/lib/regionalPacks';
import { playCue, playPackAudio, queueAutoCue, queueSpeak, speak } from '@/lib/audio';
import { shuffle } from '@/content/cstContent';
import Icon, { IconName } from '@/components/ui/Icon';
import GameFrame from './GameFrame';

/** "My Next Step" — CST Session 4, Everyday Practical Life: order a familiar daily routine. */

const STEPS_FOR: Record<Difficulty, number> = { 1: 3, 2: 3, 3: 4, 4: 4 };

interface Step {
  id: string;
  label: string;
  icon: IconName;
}

async function buildRoutine(person: Person, need: number) {
  const packs = await packsForPerson(person.id, 'approved');
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
  return { title: r.title, steps: r.steps.slice(0, need).map((s) => ({ id: s.id, label: s.label, icon: s.icon })), audioKey: undefined, family: false };
}

export default function MyNextStep({ person, onRestart }: { person: Person; onRestart: () => void }) {
  const lang = person.language;
  const [title, setTitle] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [tiles, setTiles] = useState<Step[]>([]);
  const [placed, setPlaced] = useState<Step[]>([]);
  const [audioKey, setAudioKey] = useState<string | undefined>();
  const [family, setFamily] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [reduced, setReduced] = useState(false);
  const wrongThisStep = useRef(0);

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
  const question = placed.length === 0 ? 'What do you do first?' : `After "${placed[placed.length - 1].label}", what comes next?`;

  useEffect(() => {
    if (nextCorrect && session.phase === 'playing') queueSpeak(question, lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed.length, steps.length, session.phase === 'playing']);

  const visibleTiles = useMemo(() => {
    if (!reduced || tiles.length <= 2 || !nextCorrect) return tiles;
    const other = tiles.find((t) => t.id !== nextCorrect.id)!;
    return tiles.filter((t) => t.id === nextCorrect.id || t.id === other.id);
  }, [tiles, reduced, nextCorrect]);

  function tap(tile: Step) {
    if (!session.isPlaying() || !nextCorrect) return;
    if (tile.id === nextCorrect.id) {
      const newPlaced = [...placed, tile];
      setPlaced(newPlaced);
      setTiles((ts) => ts.filter((s) => s.id !== tile.id));
      setHint(false);
      wrongThisStep.current = 0;
      speak(tile.label, lang);
      if (newPlaced.length === steps.length) setTimeout(() => session.finish('completed'), 900);
      return;
    }
    setWrongId(tile.id);
    setTimeout(() => setWrongId(null), 600);
    playCue('game.try_again', lang);
    wrongThisStep.current += 1;
    if (wrongThisStep.current >= 2) setHint(true);
    if (session.addError() >= Math.max(6, steps.length * 3)) session.finish('not_completed');
  }

  async function onHelp() {
    const cue: CueType = await session.requestHelp();
    if (!nextCorrect) return;
    if (cue === 'repeat_audio') {
      if (audioKey) playPackAudio(audioKey);
      else speak(question, lang);
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
      person={person}
      activity="my_next_step"
      session={session}
      onRestart={onRestart}
      progress={{ current: placed.length + 1, total: steps.length }}
      onListen={() => speak(question, lang)}
      onHelp={onHelp}
      notice={family ? `Your family's own routine: ${title}` : title ? `${title} — a family can add their own in Pack Studio.` : undefined}
      prompt={
        <p style={{ fontSize: 27, letterSpacing: '-0.015em' }} className="font-extrabold leading-snug">
          {question}
        </p>
      }
    >
      <ol className="flex flex-col gap-3" aria-label="Your order so far">
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
                <span className="flex items-center gap-3 rise" style={{ fontSize: 22 }}>
                  <span style={{ color: 'var(--ok)' }}>
                    <Icon name={done.icon} size={28} />
                  </span>
                  <span className="font-bold">{done.label}</span>
                </span>
              ) : (
                <span className="muted" style={{ fontSize: 19 }}>
                  {isNext ? 'Next step…' : ' '}
                </span>
              )}
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
              <span className="text-center leading-tight">{tile.label}</span>
            </button>
          );
        })}
      </div>
    </GameFrame>
  );
}
