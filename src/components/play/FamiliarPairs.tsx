'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CueType, Difficulty, Person } from '@/lib/db';
import { useCstSession } from '@/lib/useCstSession';
import { playCue, queueAutoCue, say } from '@/lib/audio';
import { t } from '@/lib/i18n';
import { MONTHS, PARTS, SEASONS, WEEKDAYS, optKey, orientationNow, partOfDayIndex } from '@/lib/orientation';
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
  /** The English name, which is also what the device clock is compared with. */
  id: string;
  labelKey: string;
  icon?: IconName;
}
interface Question {
  id: string;
  questionKey: string;
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
  const partChoices: Choice[] = PARTS.map((p) => ({ id: p.name, labelKey: optKey('period', p.name), icon: p.icon }));
  const seasonChoices: Choice[] = SEASONS.map((s) => ({ id: s.name, labelKey: optKey('season', s.name), icon: s.icon }));
  const weekdayChoices: Choice[] = WEEKDAYS.map((w) => ({ id: w, labelKey: optKey('weekday', w), icon: 'calendar' }));
  const monthChoices: Choice[] = MONTHS.map((m) => ({ id: m, labelKey: optKey('month', m), icon: 'calendar' }));

  const all: Question[] = [
    {
      id: 'part',
      questionKey: 'q.today_me.part_of_day',
      choices: pickChoices(partChoices, PARTS[partOfDayIndex(d.getHours())].name, n),
      answerId: now.part,
      affirm: `Yes. It is ${now.part.toLowerCase()} now.`,
      clue: 'clock',
    },
    {
      id: 'season',
      questionKey: 'q.today_me.season',
      choices: pickChoices(seasonChoices, now.season, n),
      answerId: now.season,
      affirm: `That's right. It is the ${now.season.toLowerCase()} season.`,
    },
    {
      id: 'weekday',
      questionKey: 'q.today_me.weekday',
      choices: pickChoices(weekdayChoices, now.weekday, n),
      answerId: now.weekday,
      affirm: `Yes. Today is ${now.weekday}.`,
    },
    {
      id: 'month',
      questionKey: 'q.today_me.month',
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
    if (q && session.phase === 'playing') queueAutoCue(q.questionKey, lang);
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
    const answer = q.choices.find((c) => c.id === q.answerId)!;
    say(revealed ? `This one is ${q.answerId}.` : q.affirm, answer.labelKey, lang);
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
    if (cue === 'repeat_audio') playCue(q.questionKey, lang);
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
      onListen={() => q && playCue(q.questionKey, lang)}
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
            <p data-testid="question" style={{ fontSize: big ? 30 : 27, letterSpacing: '-0.015em' }} className="font-extrabold leading-snug">
              {t(q.questionKey, lang)}
            </p>
          </div>
        )
      }
      doneExtra={
        <div className="shell w-full max-w-md">
          <div className="core p-5 grid grid-cols-2 gap-4 text-left">
            {[
              { label: 'done.today', value: t(optKey('weekday', now.weekday), lang), icon: 'calendar' as IconName },
              { label: 'done.date', value: `${now.day} ${t(optKey('month', now.month), lang)}`, icon: 'today' as IconName },
              { label: 'done.season', value: t(optKey('season', now.season), lang), icon: now.seasonIcon },
              { label: 'done.time_of_day', value: t(optKey('period', now.part), lang), icon: now.partIcon },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span style={{ color: 'var(--accent)' }}>
                  <Icon name={row.icon} size={28} />
                </span>
                <div>
                  <div style={{ fontSize: 13 }} className="muted uppercase tracking-wider font-bold">
                    {t(row.label, lang)}
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
              {t(c.labelKey, lang)}
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
