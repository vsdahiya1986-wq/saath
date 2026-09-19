'use client';
import { useEffect, useState } from 'react';
import { usePerson } from '@/lib/usePerson';
import { db, getBlob, FollowupItem, FollowupState } from '@/lib/db';
import { usablePacks } from '@/lib/familyContent';
import { createHelpRequest } from '@/lib/events';
import { routeHelpRequest } from '@/lib/alerts';
import { playPackAudio, playCue, speak } from '@/lib/audio';
import { t } from '@/lib/i18n';
import Icon from '@/components/ui/Icon';
import StatusBadge from '@/components/ui/StatusBadge';
import BackButton from '@/components/ui/BackButton';
import BottomNav from '@/components/ui/BottomNav';

interface PromptCard {
  id: string;
  title: string;
  audioKey?: string;
  photoUrl?: string;
  stale: boolean;
}

function isStale(reviewBy?: string, state?: string): boolean {
  if (state === 'stale') return true;
  if (!reviewBy) return false;
  return new Date(reviewBy).getTime() < Date.now();
}

/** Help (SIH26003 f, g, h): one large "I need someone" action with an honest, offline-aware delivery status. */
export default function HelpScreen() {
  const { person, loading } = usePerson();
  const [cards, setCards] = useState<PromptCard[]>([]);
  const [status, setStatus] = useState<FollowupState | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!person) return;
    let cancelled = false;
    (async () => {
      const packs = await usablePacks(person.id);
      const built: PromptCard[] = [];
      for (const p of packs.filter((p) => p.permitted_uses.includes('help'))) {
        const photoBlob = p.media.photo ? await getBlob(p.media.photo) : undefined;
        built.push({
          id: p.id,
          title: p.title,
          audioKey: p.media.audio_key,
          photoUrl: photoBlob ? URL.createObjectURL(photoBlob) : undefined,
          stale: isStale(p.review_by, p.state) && p.is_current_location,
        });
      }
      if (!cancelled) setCards(built);
    })();
    return () => {
      cancelled = true;
    };
  }, [person]);

  async function needSomeone() {
    if (!person || sending) return;
    setSending(true);
    const item: FollowupItem = await createHelpRequest(person.id);
    setStatus(item.state);
    await routeHelpRequest(item.id, person.id);
    const fresh = await db.followups.get(item.id);
    const state = fresh?.state ?? item.state;
    setStatus(state);
    setSending(false);
    playCue(state === 'circle_notified_local' ? 'help.sent_local' : 'help.stored', person.language);
  }

  if (loading || !person) return null;
  const sent = status === 'circle_notified_local';

  return (
    <main className="h-[100dvh] flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto px-5 pt-5 pb-6 flex flex-col gap-5">
          <header className="flex items-center justify-between gap-3">
            <BackButton href="/" label={t('common.back', person.language)} />
            <StatusBadge lang={person.language} />
          </header>

          <h1 className="title-xl">{t('help.title', person.language)}</h1>

          <div className="flex flex-col items-center gap-5 py-2">
            <button
              onClick={needSomeone}
              disabled={sending}
              aria-label={t('help.need', person.language)}
              className="flex flex-col items-center justify-center gap-3 rounded-full font-extrabold transition-transform active:scale-95"
              style={{
                width: 'min(72vw, 280px)',
                height: 'min(72vw, 280px)',
                background: 'var(--alert)',
                color: 'var(--on-alert)',
                fontSize: 28,
                border: '6px solid var(--surface)',
                boxShadow: 'var(--shadow-raised)',
              }}
            >
              <Icon name={sending ? 'clock' : 'people'} size={64} strokeWidth={2.2} />
              <span className="px-6 text-center leading-tight">{t('help.need', person.language)}</span>
            </button>

            {status && (
              <div className="panel flex items-center gap-3 px-5 py-4 max-w-md" style={{ borderLeft: `8px solid ${sent ? 'var(--ok)' : 'var(--warn)'}` }}>
                <span style={{ color: sent ? 'var(--ok)' : 'var(--warn)' }}>
                  <Icon name={sent ? 'check' : 'shield'} size={28} />
                </span>
                <p style={{ fontSize: 19 }} className="font-semibold" data-testid="help-status">
                  {sent && t('help.sent_local', person.language)}
                  {(status === 'stored_locally' || status === 'eligible' || status === 'submitting') && t('help.stored', person.language)}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((c) => (
              <button
                key={c.id}
                onClick={() => (c.audioKey ? playPackAudio(c.audioKey) : speak(c.title, person.language))}
                className="core hover-lift flex items-center gap-4 p-4 text-left"
              >
                {c.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.photoUrl} alt={c.title} className="object-cover" style={{ width: 72, height: 72, borderRadius: 14 }} />
                ) : (
                  <span style={{ color: 'var(--accent)' }}>
                    <Icon name="photo" size={56} />
                  </span>
                )}
                <span style={{ fontSize: 23 }} className="font-extrabold flex-1">
                  {c.title}
                </span>
                {c.stale && (
                  <span title={t('help.stale_warning', person.language)} style={{ color: 'var(--warn)' }}>
                    <Icon name="warning" size={30} />
                  </span>
                )}
                <span className="btn btn-ghost btn-icon" style={{ color: 'var(--accent)' }} aria-hidden="true">
                  <Icon name="listen" size={24} />
                </span>
              </button>
            ))}
          </div>
          {!cards.length && (
            <p style={{ fontSize: 18 }} className="muted text-center">
              No help prompts have been approved yet.
            </p>
          )}
        </div>
      </div>
      <BottomNav lang={person.language} backHref="/" backLabel={t('common.back', person.language)} />
    </main>
  );
}
