'use client';
import { useEffect, useRef, useState } from 'react';
import type { CueType, Difficulty, Person } from '@/lib/db';
import { useCstSession } from '@/lib/useCstSession';
import { playCue, queueAutoCue, queueSay, say } from '@/lib/audio';
import { t } from '@/lib/i18n';
import { bucketKey, CATEGORIES, CategoryId, HOME_OBJECTS, HomeObject, itemKey, shuffle } from '@/content/cstContent';
import { onWrongAnswer } from '@/lib/stepRunner';
import Icon from '@/components/ui/Icon';
import IconTile from '@/components/ui/IconTile';
import { distinctIcons } from '@/lib/distinctIcons';
import GameFrame from './GameFrame';

/**
 * "Sort the Home" — CST Session 9, Categorising Objects. Everyday North-East
 * Indian household things are placed into the basket where they belong.
 */

const CATS_FOR: Record<Difficulty, number> = { 1: 2, 2: 2, 3: 3, 4: 3 };
const ITEMS_FOR: Record<Difficulty, number> = { 1: 4, 2: 6, 3: 6, 4: 9 };

function buildRound(difficulty: Difficulty): { cats: CategoryId[]; items: HomeObject[] } {
  const cats = shuffle(Object.keys(CATEGORIES) as CategoryId[]).slice(0, CATS_FOR[difficulty]);
  const pools = Object.fromEntries(cats.map((c) => [c, shuffle(HOME_OBJECTS.filter((o) => o.category === c))])) as Record<CategoryId, HomeObject[]>;
  const items: HomeObject[] = [];
  for (let i = 0; items.length < ITEMS_FOR[difficulty] && i < 30; i++) {
    const next = pools[cats[i % cats.length]].shift();
    if (next) items.push(next);
  }
  distinctIcons(cats.map((c) => CATEGORIES[c]), 'Sort the Home');
  return { cats, items: shuffle(items) };
}

export default function PatternGarden({ person, onRestart }: { person: Person; onRestart: () => void }) {
  const lang = person.language;
  const [cats, setCats] = useState<CategoryId[]>([]);
  const [items, setItems] = useState<HomeObject[]>([]);
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<HomeObject[]>([]);
  const [correctCat, setCorrectCat] = useState<CategoryId | null>(null);
  const [wrongCat, setWrongCat] = useState<CategoryId | null>(null);
  const [hint, setHint] = useState(false);
  const [retry, setRetry] = useState(false);
  const [reduced, setReduced] = useState(false);
  const wrongThisRound = useRef(0);
  const locked = useRef(false);

  const session = useCstSession({
    person,
    activity: 'pattern_garden',
    version: '2',
    onStart: (d, isCancelled) => {
      const r = buildRound(d?.chosenDifficulty ?? 1);
      if (isCancelled()) return;
      setCats(r.cats);
      setItems(r.items);
      if (d?.chosenCue === 'reduce_choices') setReduced(true);
      if (d?.chosenCue === 'highlight' || d?.chosenCue === 'demonstrate') setHint(true);
      queueAutoCue('play.pattern.intro', lang);
    },
  });

  const item = items[index];
  const question = item ? `Where does the ${item.label.toLowerCase()} belong?` : '';

  useEffect(() => {
    if (item && session.phase === 'playing') queueSay(question, itemKey(item.id), lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, session.phase === 'playing']);

  /** Drops the item into its basket, says why it belongs there, and moves on. */
  function accept(revealed: boolean) {
    if (!item) return;
    const cat = item.category;
    locked.current = true;
    setCorrectCat(cat);
    const where = CATEGORIES[cat].label.toLowerCase();
    say(revealed ? `The ${item.label.toLowerCase()} goes in ${where}.` : `Yes. The ${item.label.toLowerCase()} goes in ${where}.`, bucketKey(cat), lang);
    setTimeout(() => {
      setPlaced((p) => [...p, item]);
      setCorrectCat(null);
      setHint(false);
      setRetry(false);
      wrongThisRound.current = 0;
      locked.current = false;
      if (index + 1 >= items.length) session.finish('completed');
      else setIndex(index + 1);
    }, 1500);
  }

  function choose(cat: CategoryId) {
    if (!item || locked.current || !session.isPlaying()) return;
    if (cat === item.category) {
      accept(false);
      return;
    }
    setWrongCat(cat);
    setTimeout(() => setWrongCat(null), 600);
    session.addError();
    setHint(true);
    if (onWrongAnswer(wrongThisRound.current) === 'reveal') {
      accept(true);
      return;
    }
    wrongThisRound.current += 1;
    playCue('game.look_again', lang);
    setRetry(true);
  }

  /** B4: skip this item only — show where it belongs and move on. */
  function skipStep() {
    if (!item || locked.current || !session.isPlaying()) return;
    session.skipOne();
    accept(true);
  }

  async function onHelp() {
    const cue: CueType = await session.requestHelp();
    if (!item) return;
    if (cue === 'repeat_audio') say(question, itemKey(item.id), lang);
    else if (cue === 'highlight' || (cue === 'reduce_choices' && cats.length <= 2)) {
      playCue('cue.highlight', lang);
      setHint(true);
    } else if (cue === 'reduce_choices') {
      playCue('cue.reduce', lang);
      setReduced(true);
    } else if (cue === 'demonstrate') {
      setHint(true);
      choose(item.category);
    }
  }

  const hiddenCat = reduced && item && cats.length > 2 ? cats.find((c) => c !== item.category) : undefined;

  return (
    <GameFrame
      retry={retry}
      person={person}
      activity="pattern_garden"
      session={session}
      onRestart={onRestart}
      progress={{ current: index + 1, total: items.length }}
      onListen={() => item && say(question, itemKey(item.id), lang)}
      onHelp={onHelp}
      onSkipStep={skipStep}
      prompt={
        item && (
          <div className="flex flex-wrap items-center gap-4" key={item.id}>
            <span className="rise">
              <IconTile icon={item.icon} size={76} fg="var(--accent-warm)" />
            </span>
            <div className="flex flex-col gap-1 min-w-0 flex-1 basis-32">
              <span style={{ fontSize: 'clamp(24px, 7vw, 32px)', letterSpacing: '-0.02em' }} className="font-extrabold leading-tight">
                {t(itemKey(item.id), lang)}
              </span>
              <span data-testid="question" style={{ fontSize: 19 }} className="muted">
                {t('q.sort_home.where', lang)}
              </span>
            </div>
          </div>
        )
      }
    >
      <div className={`grid gap-4 ${cats.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
        {cats.map((cat, i) => {
          const c = CATEGORIES[cat];
          const inside = placed.filter((p) => p.category === cat);
          const isAnswer = item?.category === cat;
          const cls =
            correctCat === cat ? 'is-correct' : wrongCat === cat ? 'is-wrong' : hint && isAnswer && !correctCat ? 'is-hint' : hiddenCat === cat ? 'is-faded' : '';
          return (
            <button
              key={cat}
              data-testid="sort-basket"
              onClick={() => choose(cat)}
              disabled={session.phase !== 'playing'}
              className={`tile rise rise-${i + 1} ${cls}`}
              style={{ minHeight: 200, justifyContent: 'space-between', paddingTop: 20, paddingBottom: 18 }}
            >
              <IconTile icon={c.icon} size={44} fg={c.color} />
              <span style={{ fontSize: 24 }} className="font-extrabold text-center leading-tight">
                {t(bucketKey(cat), lang)}
              </span>
              <span className="flex flex-wrap justify-center gap-1.5 min-h-[34px]">
                {inside.map((p) => (
                  <span key={p.id} className="rise rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: 'var(--bg-2)', color: c.color }} title={t(itemKey(p.id), lang)}>
                    <Icon name={p.icon} size={20} />
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </GameFrame>
  );
}
