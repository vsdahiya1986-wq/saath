'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import { db, Person, Difficulty, CueType, getBlob, packsForPerson } from '@/lib/db';
import { decide, Decision } from '@/lib/model';
import { loadRegionalManifest, RegionalItem } from '@/lib/regionalPacks';
import { t } from '@/lib/i18n';
import { playCue } from '@/lib/audio';
import Icon from '@/components/ui/Icon';
import ExitBar from '@/components/ui/ExitBar';
import AdaptiveBadge from '@/components/ui/AdaptiveBadge';
import SessionOutcomeNote from '@/components/ui/SessionOutcomeNote';
import StatusBadge from '@/components/ui/StatusBadge';

const ACTIVITY_VERSION = '1';
const PAIRS_FOR_DIFFICULTY: Record<Difficulty, number> = { 1: 3, 2: 4, 3: 5, 4: 6 };

interface DeckItem {
  matchId: string;
  label: string;
  icon?: RegionalItem['icon'];
  photoUrl?: string;
  isRegional: boolean;
}
interface Card extends DeckItem {
  cardId: string;
  matched: boolean;
}

async function lastDifficulty(personId: string): Promise<Difficulty> {
  const rows = await db.trials.where({ person_id: personId, activity: 'familiar_pairs' }).toArray();
  if (!rows.length) return 1;
  rows.sort((a, b) => a.created_at.localeCompare(b.created_at));
  return rows[rows.length - 1].difficulty;
}

async function buildDeck(person: Person, need: number): Promise<DeckItem[]> {
  const packs = await packsForPerson(person.id, 'approved');
  const usable = packs.filter((p) => p.permitted_uses.includes('play') && (p.kind === 'object' || p.kind === 'place') && p.state === 'approved');

  const items: DeckItem[] = [];
  for (const p of usable.slice(0, need)) {
    const photoKey = p.media.photo ?? p.media.place_photo;
    const photoBlob = photoKey ? await getBlob(photoKey) : undefined;
    items.push({
      matchId: p.id,
      label: p.title,
      photoUrl: photoBlob ? URL.createObjectURL(photoBlob) : undefined,
      isRegional: false,
    });
  }

  if (items.length < need) {
    const manifest = await loadRegionalManifest();
    for (const r of manifest.objects) {
      if (items.length >= need) break;
      items.push({ matchId: r.id, label: r.label, icon: r.icon, isRegional: true });
    }
  }
  return items.slice(0, need);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = 'loading' | 'playing' | 'paused';
type Outcome = 'completed' | 'not_completed';

export default function FamiliarPairs({ person }: { person: Person }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('loading');
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [mismatches, setMismatches] = useState(0);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [nextPreview, setNextPreview] = useState<Decision | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [usedRegional, setUsedRegional] = useState(false);
  const [hintIds, setHintIds] = useState<string[]>([]);
  const startedAt = useRef(0);
  const logged = useRef(false);
  const trialId = useRef(uuid());

  /**
   * Applies an assistance cue's actual effect against a given snapshot of
   * the board. Used both for the round-start cue (whatever decide() chose
   * before the person touched a card) and for an explicit Help request —
   * the same vocabulary, two different triggers.
   */
  function applyCueEffect(cue: CueType, deckSnapshot: Card[]) {
    const unmatched = deckSnapshot.filter((c) => !c.matched);
    const byMatchId = new Map<string, Card[]>();
    for (const c of unmatched) {
      const arr = byMatchId.get(c.matchId);
      if (arr) arr.push(c);
      else byMatchId.set(c.matchId, [c]);
    }
    const pairs = [...byMatchId.values()].filter((cs) => cs.length === 2);

    switch (cue) {
      case 'highlight':
        playCue('cue.highlight', person.language);
        if (pairs.length) {
          const ids = pairs[0].map((c) => c.cardId);
          setHintIds(ids);
          setTimeout(() => setHintIds([]), 1200);
        }
        break;
      case 'demonstrate':
        playCue('cue.demonstrate', person.language);
        if (pairs.length) {
          const ids = pairs[0].map((c) => c.cardId);
          setCards((cs) => cs.map((c) => (ids.includes(c.cardId) ? { ...c, matched: true } : c)));
        }
        break;
      case 'reduce_choices':
        playCue('cue.reduce', person.language);
        if (pairs.length > 1) {
          const remove = pairs[pairs.length - 1].map((c) => c.cardId);
          setCards((cs) => cs.filter((c) => !remove.includes(c.cardId)));
        }
        break;
      default:
        playCue('play.pairs.intro', person.language);
    }
  }

  useEffect(() => {
    (async () => {
      const diff = await lastDifficulty(person.id);
      const d = await decide({
        personId: person.id,
        activity: 'familiar_pairs',
        difficulty: diff,
        allowedCues: person.care_config.allowed_cues,
        maxDifficulty: person.care_config.max_difficulty,
      });
      setDecision(d);
      setDifficulty(d.chosenDifficulty);

      const need = PAIRS_FOR_DIFFICULTY[d.chosenDifficulty];
      const items = await buildDeck(person, need);
      setUsedRegional(items.some((i) => i.isRegional));
      const deck = shuffle(
        items.flatMap((item) => [
          { ...item, cardId: uuid(), matched: false },
          { ...item, cardId: uuid(), matched: false },
        ])
      );
      setCards(deck);
      startedAt.current = Date.now();
      setPhase('playing');
      // A cue the model already has evidence for (never reachable at
      // cold-start — see Part 7's baseline fallback) gets applied as a
      // head start; otherwise this is just the intro cue.
      applyCueEffect(d.chosenCue, deck);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person]);

  const budget = useMemo(() => PAIRS_FOR_DIFFICULTY[difficulty] * 4, [difficulty]);

  // Derived, not stored: React docs recommend computing state derivable from
  // props/state during render rather than setting it via an effect, which
  // avoids an extra cascading render.
  const outcome: Outcome | null = useMemo(() => {
    if (phase !== 'playing' || !cards.length) return null;
    if (cards.every((c) => c.matched)) return 'completed';
    if (mismatches >= budget) return 'not_completed';
    return null;
  }, [phase, cards, mismatches, budget]);

  async function logTrial(outcome: 'completed' | 'not_completed' | 'skipped' | 'withdrawn' | 'interrupted') {
    if (logged.current) return;
    logged.current = true;
    await db.trials.put({
      id: trialId.current,
      person_id: person.id,
      activity: 'familiar_pairs',
      activity_version: ACTIVITY_VERSION,
      difficulty,
      cue: (decision?.chosenCue ?? 'none') as CueType,
      outcome,
      latency_ms: Date.now() - startedAt.current,
      perseverative_errors: mismatches,
      policy_mode: decision?.mode ?? 'baseline',
      model_version: decision?.modelVersion ?? 'unknown',
      synthetic: false,
      created_at: new Date().toISOString(),
    });
  }

  useEffect(() => {
    // visibilitychange, not pagehide: pagehide's async IndexedDB write is
    // frequently killed mid-flight by the browser tearing the page down
    // before it completes (observed live). visibilitychange fires earlier,
    // while the page is still fully alive, giving the write time to land.
    const onHide = () => {
      if (document.visibilityState === 'hidden' && !outcome && (phase === 'playing' || phase === 'paused')) {
        logTrial('interrupted');
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, outcome, mismatches, difficulty, decision]);

  async function onCardTap(card: Card) {
    if (phase !== 'playing' || outcome || card.matched || flipped.includes(card.cardId) || flipped.length === 2) return;
    const next = [...flipped, card.cardId];
    setFlipped(next);
    if (next.length === 2) {
      const [aId, bId] = next;
      const a = cards.find((c) => c.cardId === aId)!;
      const b = cards.find((c) => c.cardId === bId)!;
      if (a.matchId === b.matchId) {
        setTimeout(() => {
          setCards((cs) => cs.map((c) => (c.cardId === aId || c.cardId === bId ? { ...c, matched: true } : c)));
          setFlipped([]);
        }, 500);
      } else {
        setMismatches((m) => m + 1);
        setTimeout(() => setFlipped([]), 900);
      }
    }
  }

  useEffect(() => {
    if (!outcome) return;
    (async () => {
      await logTrial(outcome);
      // SIH26003 (b): preview what the SAME decide() call would choose next
      // time, now that this trial is logged — makes the "why" visible right
      // where the session just ended, not only in the Evidence Inspector.
      // Awaiting logTrial first matters: decide() reads db.trials, so the
      // preview must run after this session's own trial has landed.
      const preview = await decide({
        personId: person.id,
        activity: 'familiar_pairs',
        difficulty,
        allowedCues: person.care_config.allowed_cues,
        maxDifficulty: person.care_config.max_difficulty,
      });
      setNextPreview(preview);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  /**
   * The in-activity assistance request — Part 3.1 F2 ("supports Help/Skip/
   * Pause") and the demo script in Part 12 ("Request help. A cue
   * changes."). Distinct from Skip/Pause/Stop (F6, ExitBar): Help asks the
   * model what would help right now, applies it, and — because the cue
   * actually used gets logged with the eventual outcome — is also how the
   * model ever accumulates evidence for cues other than the baseline.
   */
  async function onHelp() {
    if (phase !== 'playing' || outcome) return;
    const d = await decide({
      personId: person.id,
      activity: 'familiar_pairs',
      difficulty,
      allowedCues: person.care_config.allowed_cues,
      maxDifficulty: person.care_config.max_difficulty,
      explicitHelpRequested: true,
    });
    setDecision(d);
    applyCueEffect(d.chosenCue, cards);
  }

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
          {t('activity.familiar_pairs', person.language)}
        </h1>
        <div className="flex items-center gap-2">
          <AdaptiveBadge decision={decision} lang={person.language} />
          <StatusBadge lang={person.language} />
        </div>
        {usedRegional && (
          <span style={{ fontSize: 12 }} className="text-[var(--text-muted)] max-w-[45%] text-right">
            Using general pictures. Add {person.display_name}&apos;s own things when you can.
          </span>
        )}
      </header>

      {outcome === 'completed' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Icon name="check" size={64} />
          <p style={{ fontSize: 22 }} className="font-black">
            Well done.
          </p>
          {nextPreview && <SessionOutcomeNote preview={nextPreview} playedDifficulty={difficulty} playedCue={decision.chosenCue} />}
          <button onClick={() => router.push('/play')} style={btnStyle}>
            {t('common.back', person.language)}
          </button>
        </div>
      )}

      {outcome === 'not_completed' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
          <p style={{ fontSize: 20 }}>That is completely fine. We can try again another time.</p>
          {nextPreview && <SessionOutcomeNote preview={nextPreview} playedDifficulty={difficulty} playedCue={decision.chosenCue} />}
          <button onClick={() => router.push('/play')} style={btnStyle}>
            {t('common.back', person.language)}
          </button>
        </div>
      )}

      {!outcome && (phase === 'playing' || phase === 'paused') && (
        <>
          <div
            className="grid gap-3 p-4 flex-1"
            style={{ gridTemplateColumns: `repeat(${Math.min(4, Math.ceil(Math.sqrt(cards.length)))}, minmax(0,1fr))` }}
          >
            {cards.map((card) => {
              const isFaceUp = card.matched || flipped.includes(card.cardId) || hintIds.includes(card.cardId);
              return (
                <button
                  key={card.cardId}
                  data-testid="card"
                  onClick={() => onCardTap(card)}
                  disabled={phase === 'paused'}
                  style={{
                    minHeight: 90,
                    border: 'var(--border-w) solid var(--border)',
                    borderRadius: 'var(--radius)',
                    background: card.matched ? '#ECFDF5' : 'var(--surface)',
                  }}
                  className="flex flex-col items-center justify-center gap-1 p-2"
                >
                  {isFaceUp ? (
                    <>
                      {card.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={card.photoUrl} alt={card.label} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <Icon name={card.icon ?? 'square'} size={40} />
                      )}
                      <span style={{ fontSize: 13 }}>{card.label}</span>
                    </>
                  ) : (
                    <Icon name="cardback" size={36} />
                  )}
                </button>
              );
            })}
          </div>
          {phase === 'paused' && (
            <div className="p-4 text-center">
              <p style={{ fontSize: 18 }}>{t('common.pause', person.language)}</p>
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
          <ExitBar
            person={person}
            paused={phase === 'paused'}
            onPauseToggle={() => setPhase(phase === 'paused' ? 'playing' : 'paused')}
            onSkip={() => {
              logTrial('skipped');
              router.push('/play');
            }}
            onStop={() => {
              logTrial('withdrawn');
              router.push('/');
            }}
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
