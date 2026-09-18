'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CueType, Difficulty, Person } from '@/lib/db';
import { getBlob, packsForPerson } from '@/lib/db';
import { useCstSession } from '@/lib/useCstSession';
import { playCue, playPackAudio, queueAutoCue, queueSpeak, speak } from '@/lib/audio';
import { HOME_OBJECTS, shuffle } from '@/content/cstContent';
import { onWrongAnswer } from '@/lib/stepRunner';
import Icon, { IconName } from '@/components/ui/Icon';
import GameFrame from './GameFrame';

/**
 * "Hear & Find" — CST Session 7 (Word Association) with Session 2 (Sounds).
 * A word is spoken — in a family member's own recorded voice when one
 * exists — and the person finds the matching picture. Visual-only mode
 * shows the word instead, so hearing loss is never penalised.
 */

const ROUNDS_FOR: Record<Difficulty, number> = { 1: 3, 2: 4, 3: 5, 4: 5 };
const CHOICES_FOR: Record<Difficulty, number> = { 1: 2, 2: 3, 3: 4, 4: 6 };

interface Item {
  id: string;
  label: string;
  icon?: IconName;
  photoUrl?: string;
  audioKey?: string;
}
interface Round {
  target: Item;
  choices: Item[];
}

async function buildPool(person: Person): Promise<{ pool: Item[]; family: boolean }> {
  const packs = await packsForPerson(person.id, 'approved');
  const pool: Item[] = [];
  for (const p of packs.filter((p) => p.permitted_uses.includes('play') && (p.kind === 'object' || p.kind === 'place'))) {
    const key = p.media.photo ?? p.media.place_photo;
    const blob = key ? await getBlob(key) : undefined;
    if (blob) pool.push({ id: p.id, label: p.title, photoUrl: URL.createObjectURL(blob), audioKey: p.media.audio_key });
  }
  const family = pool.length > 0;
  return { pool: [...shuffle(pool), ...shuffle(HOME_OBJECTS).map((o) => ({ id: o.id, label: o.label, icon: o.icon }))], family };
}

/**
 * Family pictures are used as targets first (personalisation), in random
 * order. Distractors are the same kind as the target — photos among photos,
 * drawings among drawings — so a photo is never the obvious odd one out.
 */
function buildRounds(pool: Item[], difficulty: Difficulty): Round[] {
  const n = Math.min(CHOICES_FOR[difficulty], pool.length);
  const photos = pool.filter((p) => p.photoUrl);
  const drawings = pool.filter((p) => !p.photoUrl);
  const targets = [...photos, ...drawings].slice(0, ROUNDS_FOR[difficulty]);
  return shuffle(targets).map((target) => {
    const same = shuffle((target.photoUrl ? photos : drawings).filter((p) => p.id !== target.id));
    const other = shuffle((target.photoUrl ? drawings : photos).filter((p) => p.id !== target.id));
    return { target, choices: shuffle([target, ...[...same, ...other].slice(0, n - 1)]) };
  });
}

export default function SoundAndSight({ person, onRestart }: { person: Person; onRestart: () => void }) {
  const lang = person.language;
  const visualOnly = person.care_config.sensory_mode === 'visual_only';
  const [rounds, setRounds] = useState<Round[]>([]);
  const [family, setFamily] = useState(false);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [reduced, setReduced] = useState(false);
  const wrongThisRound = useRef(0);
  const locked = useRef(false);

  const session = useCstSession({
    person,
    activity: 'sound_sight',
    version: '2',
    onStart: async (d, isCancelled) => {
      const { pool, family: fam } = await buildPool(person);
      if (isCancelled()) return;
      setFamily(fam);
      setRounds(buildRounds(pool, d?.chosenDifficulty ?? 1));
      if (d?.chosenCue === 'reduce_choices') setReduced(true);
      if (d?.chosenCue === 'highlight' || d?.chosenCue === 'demonstrate') setHint(true);
      if (!visualOnly) queueAutoCue('play.sound.intro', lang);
    },
  });

  const round = rounds[index];

  function sayTarget(interrupt: boolean) {
    if (!round || visualOnly) return;
    const t = round.target;
    const line = t.photoUrl ? `Find ${t.label}` : `Find the ${t.label}`;
    if (t.audioKey) playPackAudio(t.audioKey);
    else if (interrupt) speak(line, lang);
    else queueSpeak(line, lang);
  }

  useEffect(() => {
    if (round && session.phase === 'playing') sayTarget(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round?.target.id, session.phase === 'playing']);

  const visible = useMemo(() => {
    if (!round) return [];
    if (!reduced || round.choices.length <= 2) return round.choices;
    const other = round.choices.find((c) => c.id !== round.target.id)!;
    return round.choices.filter((c) => c.id === round.target.id || c.id === other.id);
  }, [round, reduced]);

  /** Marks the target picture on screen, names it, and moves on. */
  function accept(revealed: boolean) {
    if (!round) return;
    const { label, photoUrl } = round.target;
    setPicked(round.target.id);
    speak(revealed ? `This one is ${label}.` : photoUrl ? `Yes, that is ${label}.` : `Yes, that is the ${label}.`, lang);
    locked.current = true;
    setTimeout(() => {
      wrongThisRound.current = 0;
      locked.current = false;
      setPicked(null);
      setHint(false);
      if (index + 1 >= rounds.length) session.finish('completed');
      else setIndex(index + 1);
    }, 1700);
  }

  function choose(id: string) {
    if (!round || locked.current || !session.isPlaying()) return;
    if (id === round.target.id) {
      accept(false);
      return;
    }
    setWrongId(id);
    setTimeout(() => setWrongId(null), 600);
    session.addError();
    setHint(true);
    if (onWrongAnswer(wrongThisRound.current) === 'reveal') {
      accept(true);
      return;
    }
    wrongThisRound.current += 1;
    playCue('game.look_again', lang);
  }

  /** B4: skip this round only — show its answer and move on. */
  function skipStep() {
    if (!round || locked.current || !session.isPlaying()) return;
    session.skipOne();
    accept(true);
  }

  async function onHelp() {
    const cue: CueType = await session.requestHelp();
    if (!round) return;
    if (cue === 'repeat_audio') {
      if (visualOnly) setHint(true);
      else sayTarget(true);
    } else if (cue === 'highlight') {
      playCue('cue.highlight', lang);
      setHint(true);
    } else if (cue === 'reduce_choices') {
      playCue('cue.reduce', lang);
      setReduced(true);
    } else if (cue === 'demonstrate') {
      setHint(true);
      choose(round.target.id);
    }
  }

  const hideWord = person.literacy === 'non-literate' && !visualOnly;
  const cols = visible.length <= 2 ? 'grid-cols-2' : visible.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3';

  return (
    <GameFrame
      person={person}
      activity="sound_sight"
      session={session}
      onRestart={onRestart}
      progress={{ current: index + 1, total: rounds.length }}
      onListen={visualOnly ? undefined : () => sayTarget(true)}
      onHelp={onHelp}
      onSkipStep={skipStep}
      notice={family ? 'Includes pictures from your family.' : visualOnly ? 'Visual mode — read the word, then find its picture.' : undefined}
      prompt={
        round && (
          <div className="flex flex-col gap-1">
            <span style={{ fontSize: 16 }} className="muted font-semibold">
              {visualOnly ? 'Find this picture' : 'Listen, then find'}
            </span>
            {/*
              B2: this used to render a bare "…" for a non-literate profile, on the
              theory that the word should be heard and not read. But the default
              profile IS non-literate, and when no voice is available (no Bhashini
              file, autoplay blocked, no Assamese TTS) the person was left with
              nothing to go on at all. The word is always shown now — reading it is
              optional, guessing blind is not.
            */}
            <span
              style={{ fontSize: hideWord ? 30 : 34, letterSpacing: '-0.02em' }}
              className="font-extrabold glow-text leading-tight flex items-center gap-3"
            >
              {hideWord && <Icon name="listen" size={30} />}
              {round.target.label}
            </span>
          </div>
        )
      }
    >
      <div className={`grid gap-4 ${cols}`} key={index}>
        {visible.map((c, i) => {
          const isTarget = round && c.id === round.target.id;
          const cls = picked === c.id ? 'is-correct' : wrongId === c.id ? 'is-wrong' : hint && isTarget && !picked ? 'is-hint' : picked && !isTarget ? 'is-faded' : '';
          return (
            <button
              key={c.id}
              data-testid="sound-sight-choice"
              aria-label={picked ? c.label : `Picture ${i + 1}`}
              onClick={() => choose(c.id)}
              disabled={session.phase !== 'playing'}
              className={`tile rise rise-${Math.min(i + 1, 6)} ${cls}`}
              style={{ minHeight: 170 }}
            >
              {c.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.photoUrl} alt="" className="object-cover" style={{ width: 110, height: 110, borderRadius: 18 }} />
              ) : (
                <span style={{ color: 'var(--accent-warm)' }}>
                  <Icon name={c.icon ?? 'square'} size={84} strokeWidth={1.8} />
                </span>
              )}
              {picked === c.id && (
                <span style={{ fontSize: 20 }} className="font-extrabold">
                  {c.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </GameFrame>
  );
}
