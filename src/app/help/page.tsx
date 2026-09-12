'use client';
import { useEffect, useState } from 'react';
import { usePerson } from '@/lib/usePerson';
import { db, packsForPerson, getBlob, FollowupItem, FollowupState } from '@/lib/db';
import { createHelpRequest } from '@/lib/events';
import { routeHelpRequest } from '@/lib/alerts';
import { playPackAudio } from '@/lib/audio';
import { t } from '@/lib/i18n';
import Icon from '@/components/ui/Icon';
import StatusBadge from '@/components/ui/StatusBadge';
import BackButton from '@/components/ui/BackButton';

interface PromptCard {
  id: string;
  title: string;
  audioKey: string;
  photoUrl?: string;
  stale: boolean;
}

function isStale(reviewBy?: string, state?: string): boolean {
  if (state === 'stale') return true;
  if (!reviewBy) return false;
  return new Date(reviewBy).getTime() < Date.now();
}

/**
 * SIH26003 (h): audit every screen against BigChoice's literacy-scaling
 * pattern (src/components/ui/BigChoice.tsx) — this screen previously used
 * one fixed size regardless of person.literacy, unlike BigChoice itself.
 * Same tiers, same numbers, for visual consistency across the app.
 */
const SIZES = {
  'non-literate': { icon: 56, label: 26, warn: 32 },
  basic: { icon: 44, label: 20, warn: 26 },
  fluent: { icon: 40, label: 20, warn: 26 },
} as const;

export default function HelpScreen() {
  const { person, loading } = usePerson();
  const [cards, setCards] = useState<PromptCard[]>([]);
  const [status, setStatus] = useState<FollowupState | null>(null);

  useEffect(() => {
    if (!person) return;
    (async () => {
      const packs = await packsForPerson(person.id, 'approved');
      const usable = packs.filter((p) => p.permitted_uses.includes('help'));
      const built: PromptCard[] = [];
      for (const p of usable) {
        const photoBlob = p.media.photo ? await getBlob(p.media.photo) : undefined;
        built.push({
          id: p.id,
          title: p.title,
          audioKey: p.media.audio_key,
          photoUrl: photoBlob ? URL.createObjectURL(photoBlob) : undefined,
          stale: isStale(p.review_by, p.state) && p.is_current_location,
        });
      }
      setCards(built);
    })();
  }, [person]);

  async function needSomeone() {
    if (!person) return;
    const item: FollowupItem = await createHelpRequest(person.id);
    setStatus(item.state);
    await routeHelpRequest(item.id, person.id);
    // Re-read the authoritative state rather than assuming what routing did.
    const fresh = await db.followups.get(item.id);
    setStatus(fresh?.state ?? item.state);
  }

  if (loading || !person) return null;

  const s = SIZES[person.literacy];

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <BackButton href="/" label={t('common.back', person.language)} />
        <h1 style={{ fontSize: 'var(--text-title)' }} className="font-black text-[var(--text)] flex-1">
          {t('help.title', person.language)}
        </h1>
        <StatusBadge lang={person.language} />
      </header>

      <div className="flex flex-col gap-3">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => playPackAudio(c.audioKey)}
            style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', minHeight: 'var(--touch-min)' }}
            className="flex items-center gap-4 p-4 text-left"
          >
            {c.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.photoUrl}
                alt={c.title}
                className="object-cover rounded"
                style={{ width: s.icon, height: s.icon }}
              />
            ) : (
              <Icon name="photo" size={s.icon} />
            )}
            <span style={{ fontSize: s.label }} className="font-black flex-1">
              {c.title}
            </span>
            {c.stale && (
              <span title={t('help.stale_warning', person.language)}>
                <Icon name="warning" size={s.warn} />
              </span>
            )}
            <Icon name="listen" size={22} />
          </button>
        ))}
        {!cards.length && (
          <p style={{ fontSize: 16 }} className="text-[var(--text-muted)]">
            No help prompts have been approved yet.
          </p>
        )}
      </div>

      <button
        onClick={needSomeone}
        style={{ minHeight: 88, background: 'var(--alert)', borderRadius: 'var(--radius)' }}
        className="text-white font-black text-2xl mt-auto"
      >
        {t('help.need', person.language)}
      </button>

      {status && (
        <p style={{ fontSize: 16 }} className="text-center" data-testid="help-status">
          {status === 'circle_notified_local' && t('help.sent_local', person.language)}
          {(status === 'stored_locally' || status === 'eligible' || status === 'submitting') && t('help.stored', person.language)}
        </p>
      )}
    </main>
  );
}
