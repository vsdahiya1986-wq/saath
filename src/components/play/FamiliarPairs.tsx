'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CueType, Difficulty, Person } from '@/lib/db';
import { useCstSession } from '@/lib/useCstSession';
import { playCue, queueAutoCue, queueSpeak, speak } from '@/lib/audio';
import { MONTHS, PARTS, SEASONS, WEEKDAYS, orientationNow, partOfDayIndex } from '@/lib/orientation';
import { shuffle } from '@/content/cstContent';
import { onWrongAnswer } from '@/lib/stepRunner';
import Icon, { IconName } from '@/components/ui/Icon';
import AnalogClock from '@/components/ui/AnalogClock';
import GameFrame from './GameFrame';

/**
 * "Today & Me" — CST Session 10, Orientation. Reality orientation offered as
 * gentle conversation: every answer is checked against the device clock and
 * affirmed aloud, so the person leaves more oriented, not merely tested.
 */

const QUESTIONS_FOR: Record<Difficulty, number> = { 1: 2, 2: 3, 3: 4, 4: 4 };
const CHOICES_FOR: Record<Difficulty, number> = { 1: 2, 2: 3, 3: 3, 4: 4 };

interface Choice {
  id: string;
  label: string;
  icon?: IconName;
}
interface Question {
  id: string;
  question: string;
  choices: Choice[];
  answerId: string;
  affirm: string;
  clue?: 'clock';
}

function pickChoices(all: Choice[], answerId: string, n: number): Choice[] {
  const answer = all.find((c) => c.id === answerId)!;
  const others = shuffle(all.filter((c) => c.id !== answerId)).slice(0, n - 1);
  return shuffle([answer, ...others]);
}

function buildQuestions(difficulty: Difficulty): Question[] {
  const d = new Date();
  const n = CHOICES_FOR[difficulty];
  const now = orientationNow(d);
  const partChoices: Choice[] = PARTS.map((p) => ({ id: p.name, label: p.name, icon: p.icon }));
  const seasonChoices: Choice[] = SEASONS.map((s) => ({ id: s.name, label: s.name, icon: s.icon }));
  const weekdayChoices: Choice[] = WEEKDAYS.map((w) => ({ id: w, label: w, icon: 'calendar' }));
  const monthChoices: Choice[] = MONTHS.map((m) => ({ id: m, label: m, icon: 'calendar' }));

  const all: Question[] = [
    {
      id: 'part',
      question: 'What part of the day is it now?',
      choices: pickChoices(partChoices, PARTS[partOfDayIndex(d.getHours())].name, n),
      answerId: now.part,
      affirm: `Yes. It is ${now.part.toLowerCase()} now.`,
      clue: 'clock',
    },
    {
      id: 'season',
      question: 'Which season are we in?',
      choices: pickChoices(seasonChoices, now.season, n),
      answerId: now.season,
      affirm: `That's right. It is the ${now.season.toLowerCase()} season.`,
    },
    {
      id: 'weekday',
      question: 'What day of the week is it today?',
      choices: pickChoices(weekdayChoices, now.weekday, n),
      answerId: now.weekday,
      affirm: `Yes. Today is ${now.weekday}.`,
    },
    {
      id: 'month',
      question: 'Which month are we in?',
      choices: pickChoices(monthChoices, now.month, n),
      answerId: now.month,
      affirm: `That's right. It is ${now.month}.`,
    },
  ];
  return all.slice(0, QUESTIONS_FOR[difficulty]);
}

export default function FamiliarPairs({ person, onRestart }: { person: Person; onRestart: () => void }) {
  const lang = person.language;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [reduced, setReduced] = useState(false);
  const wrongThisRound = useRef(0);
  const locked = useRef(false);

  const session = useCstSession({
    person,
    activity: 'familiar_pairs',
    version: '2',
    onStart: (d, isCancelled) => {
      const qs = buildQuestions(d?.chosenDifficulty ?? 1);
      if (isCancelled()) return;
      setQuestions(qs);
      if (d?.chosenCue === 'reduce_choices') setReduced(true);
      if (d?.chosenCue === 'highlight' || d?.chosenCue === 'demonstrate') setHint(true);
      queueAutoCue('play.pairs.intro', lang);
    },
  });

  const q = questions[index];

  useEffect(() => {
    if (q && session.phase === 'playing') queueSpeak(q.question, lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id, session.phase === 'playing']);

  const visible = useMemo(() => {
    if (!q) return [];
    if (!reduced || q.choices.length <= 2) return q.choices;
    const distractor = q.choices.find((c) => c.id !== q.answerId)!;
    return q.choices.filter((c) => c.id === q.answerId || c.id === distractor.id);
  }, [q, reduced]);

  function advance() {
    locked.current = true;
    setTimeout(() => {
      wrongThisRound.current = 0;
      setPicked(null);
      setHint(false);
      locked.current = false;
      if (index + 1 >= questions.length) session.finish('completed');
      else setIndex(index + 1);
    }, 1800);
  }

  /** Marks the answer right on screen, says why, and moves on. */
  function accept(revealed: boolean) {
    if (!q) return;
    setPicked(q.answerId);
    const answer = q.choices.find((c) => c.id === q.answerId);
    speak(revealed ? `This one is ${answer?.label ?? q.answerId}.` : q.affirm, lang);
    advance();
  }

  function choose(id: string) {
    if (!q || locked.current || !session.isPlaying()) return;
    if (id === q.answerId) {
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

  /** B4: skip this question only — show its answer and move on. */
  function skipStep() {
    if (!q || locked.current || !session.isPlaying()) return;
    session.skipOne();
    accept(true);
  }

  async function onHelp() {
    const cue: CueType = await session.requestHelp();
    if (!q) return;
    if (cue === 'repeat_audio') speak(q.question, lang);
    else if (cue === 'highlight') {
      playCue('cue.highlight', lang);
      setHint(true);
    } else if (cue === 'reduce_choices') {
      playCue('cue.reduce', lang);
      setReduced(true);
    } else if (cue === 'demonstrate') {
      setHint(true);
      choose(q.answerId);
    }
  }

  const now = orientationNow();
  const big = person.literacy === 'non-literate';

  return (
    <GameFrame
      person={person}
      activity="familiar_pairs"
      session={session}
      onRestart={onRestart}
      progress={{ current: index + 1, total: questions.length }}
      onListen={() => q && speak(q.question, lang)}
      onHelp={onHelp}
      onSkipStep={skipStep}
      prompt={
        q && (
          <div className="flex items-center gap-4">
            {q.clue === 'clock' && (
              <span className="shrink-0 rounded-full p-1" style={{ background: 'var(--bg-2)' }}>
                <AnalogClock hour={new Date().getHours()} minute={new Date().getMinutes()} size={84} />
              </span>
            )}
            <p style={{ fontSize: big ? 30 : 27, letterSpacing: '-0.015em' }} className="font-extrabold leading-snug">
              {q.question}
            </p>
          </div>
        )
      }
      doneExtra={
        <div className="shell w-full max-w-md">
          <div className="core p-5 grid grid-cols-2 gap-4 text-left">
            {[
              { label: 'Today', value: now.weekday, icon: 'calendar' as IconName },
              { label: 'Date', value: `${now.day} ${now.month}`, icon: 'today' as IconName },
              { label: 'Season', value: now.season, icon: now.seasonIcon },
              { label: 'Time of day', value: now.part, icon: now.partIcon },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span style={{ color: 'var(--accent)' }}>
                  <Icon name={row.icon} size={28} />
                </span>
                <div>
                  <div style={{ fontSize: 13 }} className="muted uppercase tracking-wider font-bold">
                    {row.label}
                  </div>
                  <div style={{ fontSize: 20 }} className="font-extrabold">
                    {row.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className={`grid gap-4 ${visible.length > 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`} key={q?.id}>
        {visible.map((c, i) => {
          const isAnswer = q && c.id === q.answerId;
          const cls = picked === c.id ? 'is-correct' : wrongId === c.id ? 'is-wrong' : hint && isAnswer && !picked ? 'is-hint' : picked && !isAnswer ? 'is-faded' : '';
          return (
            <button
              key={c.id}
              data-testid="orientation-choice"
              onClick={() => choose(c.id)}
              disabled={session.phase !== 'playing'}
              className={`tile rise rise-${Math.min(i + 1, 6)} ${cls}`}
              style={{ fontSize: big ? 28 : 25, minHeight: big ? 150 : 132 }}
            >
              {c.icon && (
                <span style={{ color: picked === c.id ? 'var(--ok)' : 'var(--accent-2)' }}>
                  <Icon name={c.icon} size={big ? 52 : 44} />
                </span>
              )}
              {c.label}
              {picked === c.id && (
                <span className="absolute top-3 right-3" style={{ color: 'var(--ok)' }}>
                  <Icon name="check" size={28} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </GameFrame>
  );
}
