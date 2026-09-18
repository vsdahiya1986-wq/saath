'use client';
import { useRef, useState } from 'react';
import type { CueType, Difficulty, Person } from '@/lib/db';
import { getBlob, packsForPerson } from '@/lib/db';
import { useCstSession } from '@/lib/useCstSession';
import { playCue, playPackAudio, queueAutoCue, speak } from '@/lib/audio';
import { t } from '@/lib/i18n';
import { HOME_OBJECTS, itemKey, shuffle } from '@/content/cstContent';
import { buildDeck, Card, DeckItem, mismatchBudget } from '@/lib/aponMukh';
import Icon, { IconName } from '@/components/ui/Icon';
import GameFrame from './GameFrame';

/**
 * "Apon Mukh · Dear Faces" — CST memory with the family's own photos (F5).
 *
 * Tap to flip; a mismatch flips back after 1.2s, a match stays and says who it
 * is. After `pairs × 4` mismatches the rest are turned face up calmly and the
 * round completes — errorless, like every other activity.
 */

const FLIP_BACK_MS = 1200;

async function buildPool(person: Person): Promise<{ pool: DeckItem[]; family: boolean }> {
  const packs = await packsForPerson(person.id, 'approved');
  const family: DeckItem[] = [];

  for (const p of packs.filter((p) => p.permitted_uses.includes('play') || p.permitted_uses.includes('together'))) {
    const key = p.media.photo ?? p.media.place_photo;
    const blob = key ? await getBlob(key) : undefined;
    if (blob) family.push({ id: p.id, label: p.title, photoUrl: URL.createObjectURL(blob), caption: p.title, audioKey: p.media.audio_key });
  }

  // Family faces first; regional drawings only fill out the deck.
  const fallback = shuffle(HOME_OBJECTS).map((o) => ({ id: o.id, label: o.label, labelKey: itemKey(o.id), icon: o.icon }));
  return { pool: [...shuffle(family), ...fallback], family: family.length > 0 };
}

export default function AponMukh({ person, onRestart }: { person: Person; onRestart: () => void }) {
  const lang = person.language;
  /** A family caption in the family's words; a regional drawing's name through `t()`. */
  const name = (i: DeckItem) => (i.labelKey ? t(i.labelKey, lang) : (i.caption ?? i.label));
  const [cards, setCards] = useState<Card[]>([]);
  const [family, setFamily] = useState(false);
  const [matched, setMatched] = useState<string[]>([]);
  const [faceUp, setFaceUp] = useState<string[]>([]);
  const [allRevealed, setAllRevealed] = useState(false);
  const mismatches = useRef(0);
  const locked = useRef(false);

  const session = useCstSession({
    person,
    activity: 'apon_mukh',
    version: '1',
    onStart: async (d, isCancelled) => {
      const { pool, family: fam } = await buildPool(person);
      if (isCancelled()) return;
      const difficulty: Difficulty = d?.chosenDifficulty ?? 1;
      setFamily(fam);
      setCards(buildDeck(pool, difficulty));
      queueAutoCue('play.apon_mukh.intro', lang);
    },
  });

  const matchedPairs = matched.length / 2;
  const pairCount = cards.length / 2;

  /** Turns everything face up and ends the round, without blame. */
  function revealRest() {
    setAllRevealed(true);
    locked.current = true;
    playCue('game.here_all', lang);
    setTimeout(() => session.finish('completed'), 2200);
  }

  function tap(card: Card) {
    if (locked.current || allRevealed || !session.isPlaying()) return;
    if (matched.includes(card.id) || faceUp.includes(card.id)) return;

    const next = [...faceUp, card.id];
    setFaceUp(next);
    if (next.length < 2) return;

    const [first, second] = next.map((id) => cards.find((c) => c.id === id)!);
    locked.current = true;

    if (first.itemId === second.itemId) {
      const done = matched.length + 2;
      setMatched((m) => [...m, first.id, second.id]);
      setFaceUp([]);
      locked.current = false;
      // The family's own voice naming the face if they recorded one, else ours.
      if (first.item.audioKey) playPackAudio(first.item.audioKey);
      else if (first.item.labelKey) playCue(first.item.labelKey, lang);
      else speak(first.item.caption ?? first.item.label, lang);
      if (done / 2 >= pairCount) {
        locked.current = true;
        setTimeout(() => session.finish('completed'), 1400);
      }
      return;
    }

    playCue('game.not_this_one', lang);
    mismatches.current += 1;
    session.addError();
    setTimeout(() => {
      setFaceUp([]);
      locked.current = false;
      if (mismatches.current >= mismatchBudget(pairCount)) revealRest();
    }, FLIP_BACK_MS);
  }

  async function onHelp() {
    const cue: CueType = await session.requestHelp();
    if (cue === 'repeat_audio') playCue('play.apon_mukh.intro', lang);
    else revealRest();
  }

  function skipStep() {
    if (locked.current || !session.isPlaying()) return;
    session.skipOne();
    revealRest();
  }

  const cols = cards.length <= 6 ? 'grid-cols-3' : cards.length <= 8 ? 'grid-cols-4' : 'grid-cols-4';

  return (
    <GameFrame
      person={person}
      activity="apon_mukh"
      session={session}
      onRestart={onRestart}
      progress={{ current: Math.min(matchedPairs + 1, pairCount), total: pairCount || 1 }}
      onListen={() => playCue('play.apon_mukh.intro', lang)}
      onHelp={onHelp}
      onSkipStep={skipStep}
      notice={t(family ? 'notice.family_photos' : 'notice.add_photos', lang)}
      prompt={
        <p data-testid="question" style={{ fontSize: 27, letterSpacing: '-0.015em' }} className="font-extrabold leading-snug">
          {t('q.apon_mukh.find_pairs', lang)}
        </p>
      }
    >
      <div className={`grid gap-4 ${cols}`}>
        {cards.map((card, i) => {
          const isOpen = allRevealed || matched.includes(card.id) || faceUp.includes(card.id);
          const isMatched = allRevealed || matched.includes(card.id);
          return (
            <button
              key={card.id}
              data-testid="memory-card"
              data-open={isOpen ? 'yes' : 'no'}
              aria-label={isOpen ? name(card.item) : `${i + 1}`}
              onClick={() => tap(card)}
              disabled={session.phase !== 'playing'}
              className={`tile rise rise-${Math.min(i + 1, 6)} ${isMatched ? 'is-correct' : ''}`}
              style={{ minHeight: 150 }}
            >
              {isOpen ? (
                <>
                  {card.item.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={card.item.photoUrl} alt="" className="object-cover" style={{ width: 96, height: 96, borderRadius: 16 }} />
                  ) : (
                    <span style={{ color: 'var(--accent-warm)' }}>
                      <Icon name={(card.item.icon as IconName) ?? 'square'} size={72} strokeWidth={1.8} />
                    </span>
                  )}
                  {isMatched && (
                    <span style={{ fontSize: 17 }} className="font-extrabold text-center leading-tight">
                      {name(card.item)}
                    </span>
                  )}
                </>
              ) : (
                <span style={{ color: 'var(--accent-2)' }}>
                  <Icon name="cardback" size={66} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </GameFrame>
  );
}
