'use client';
import { useEffect, useRef, useState } from 'react';
import type { CueType, Difficulty, Person } from '@/lib/db';
import { useCstSession } from '@/lib/useCstSession';
import { playCue, queueAutoCue, speak } from '@/lib/audio';
import { buildSaahPatRound, GRID, ROUNDS_PER_SESSION, SaahPatTile, wrongTapBudget } from '@/lib/saahPat';
import TeaSprig from './TeaSprig';
import GameFrame from './GameFrame';

/**
 * "Saah Pat · Tea Leaf" — CST attention and concentration (F4). Visual
 * cancellation: find every "two leaves and a bud" sprig among look-alikes,
 * the way a picker does on an Assam garden.
 *
 * No timer, no score, no penalty. A wrong tap dims and says "Not this one";
 * after `targets + 4` wrong taps the rest are revealed and the round ends, so
 * hunting can never become being stuck.
 */
export default function SaahPat({ person, onRestart }: { person: Person; onRestart: () => void }) {
  const lang = person.language;
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [tiles, setTiles] = useState<SaahPatTile[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [hinted, setHinted] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const wrongTaps = useRef(0);
  const tappedCleared = useRef(new Set<string>());
  const locked = useRef(false);

  const session = useCstSession({
    person,
    activity: 'saah_pat',
    version: '1',
    onStart: (d, isCancelled) => {
      const diff = d?.chosenDifficulty ?? 1;
      if (isCancelled()) return;
      setDifficulty(diff);
      setTiles(buildSaahPatRound(diff));
      queueAutoCue('play.saah_pat.intro', lang);
    },
  });

  const targets = tiles.filter((t) => t.isTarget);
  const remaining = targets.filter((t) => !found.includes(t.id));

  /** Ends the round, or the whole session after the last one. */
  function finishRound() {
    locked.current = true;
    setTimeout(() => {
      if (round + 1 >= ROUNDS_PER_SESSION) {
        session.finish('completed');
        return;
      }
      setRound((r) => r + 1);
      setTiles(buildSaahPatRound(difficulty));
      setFound([]);
      setRevealed(false);
      setHinted(false);
      wrongTaps.current = 0;
      tappedCleared.current = new Set();
      locked.current = false;
    }, 1400);
  }

  useEffect(() => {
    if (!remaining.length && targets.length && !locked.current) finishRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found.length, targets.length]);

  /** Out of patience, not out of luck: show the rest and move on. */
  function revealRest() {
    setRevealed(true);
    speak('Here are the others.', lang);
    setFound(targets.map((t) => t.id));
  }

  function tap(tile: SaahPatTile) {
    if (locked.current || !session.isPlaying() || revealed) return;

    if (tile.isTarget) {
      if (found.includes(tile.id)) {
        // A repeat tap on a cleared sprig is the perseveration the engine logs.
        if (!tappedCleared.current.has(tile.id)) {
          tappedCleared.current.add(tile.id);
          session.addError();
        }
        return;
      }
      setFound((f) => [...f, tile.id]);
      playCue('game.good', lang);
      return;
    }

    setWrongId(tile.id);
    setTimeout(() => setWrongId(null), 600);
    playCue('game.not_this_one', lang);
    wrongTaps.current += 1;
    if (wrongTaps.current >= wrongTapBudget(difficulty)) revealRest();
  }

  async function onHelp() {
    const cue: CueType = await session.requestHelp();
    if (cue === 'repeat_audio') speak('Find the sprigs with two leaves and a bud.', lang);
    else if (cue === 'reduce_choices' || cue === 'demonstrate') revealRest();
    else setHinted(true); // highlight: outline the ones still to find, taps stay live
  }

  /** B4: skipping a round shows what was left and moves on. */
  function skipStep() {
    if (locked.current || !session.isPlaying()) return;
    session.skipOne();
    revealRest();
  }

  const cols = tiles.length <= 6 ? 'grid-cols-3' : tiles.length <= 9 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <GameFrame
      person={person}
      activity="saah_pat"
      session={session}
      onRestart={onRestart}
      progress={{ current: round + 1, total: ROUNDS_PER_SESSION }}
      onListen={() => speak('Find the sprigs with two leaves and a bud.', lang)}
      onHelp={onHelp}
      onSkipStep={skipStep}
      prompt={
        <div className="flex items-center gap-5">
          <span style={{ color: 'var(--accent)' }}>
            <TeaSprig kind="two_and_bud" size={72} />
          </span>
          <div className="flex flex-col gap-1 min-w-0">
            <span style={{ fontSize: 27, letterSpacing: '-0.015em' }} className="font-extrabold leading-snug">
              Find every sprig like this one
            </span>
            <span style={{ fontSize: 19 }} className="muted" data-testid="saah-pat-remaining">
              {remaining.length ? `${remaining.length} still to find` : 'All found'}
            </span>
          </div>
        </div>
      }
    >
      <div className={`grid gap-4 ${cols}`} key={round}>
        {tiles.map((tile, i) => {
          const isFound = found.includes(tile.id);
          const showHint = (revealed || hinted) && tile.isTarget && !isFound;
          return (
            <button
              key={tile.id}
              data-testid="sprig-tile"
              data-target={tile.isTarget ? 'yes' : 'no'}
              aria-pressed={isFound}
              onClick={() => tap(tile)}
              disabled={session.phase !== 'playing'}
              className={`tile rise rise-${Math.min(i + 1, 6)} ${isFound ? 'is-correct' : wrongId === tile.id ? 'is-wrong' : showHint ? 'is-hint' : ''}`}
              style={{ minHeight: 130, color: isFound ? 'var(--ok)' : 'var(--accent-warm)' }}
            >
              <TeaSprig kind={tile.kind} size={76} />
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 16 }} className="muted text-center">
        {GRID[difficulty].targets} sprigs like the one above are hidden in this patch.
      </p>
    </GameFrame>
  );
}
