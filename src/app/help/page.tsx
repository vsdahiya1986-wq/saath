'use client';
import { useEffect, useState } from 'react';
import { usePerson } from '@/lib/usePerson';
import { db, packsForPerson, getBlob, FollowupItem, FollowupState } from '@/lib/db';
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

export default function HelpScreen() {
  const { person, loading } = usePerson();
  const [cards, setCards] = useState<PromptCard[]>([]);
  const [status, setStatus] = useState<FollowupState | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!person) return;
    let cancelled = false;
    (async () => {
      const packs = await packsForPerson(person.id, 'approved');
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
        <div className="max-w-3xl mx-auto px-5 pt-6 pb-8 flex flex-col gap-6">
          <header className="flex items-center justify-between gap-3 rise">
            <BackButton href="/" label={t('common.back', person.language)} />
            <StatusBadge lang={person.language} />
          </header>

          <h1 className="title-xl rise rise-1">{t('help.title', person.language)}</h1>

          <div className="flex flex-col items-center gap-5 py-4 rise rise-2">
            <div className="relative flex items-center justify-center">
              <span className="absolute rounded-full breathe" style={{ inset: -18, background: 'radial-gradient(circle, rgba(251,113,133,0.35), transparent 70%)' }} />
              <button
                onClick={needSomeone}
                disabled={sending}
                aria-label={t('help.need', person.language)}
                className="relative flex flex-col items-center justify-center gap-3 rounded-full font-extrabold transition-transform active:scale-95"
                style={{
                  width: 'min(72vw, 280px)',
                  height: 'min(72vw, 280px)',
                  background: 'radial-gradient(circle at 35% 30%, #fecdd3 0%, #fb7185 45%, #e11d48 100%)',
                  color: 'var(--on-alert)',
                  fontSize: 28,
                  boxShadow: '0 30px 80px -20px rgba(244,63,94,0.8), inset 0 2px 0 rgba(255,255,255,0.4)',
                  transitionTimingFunction: 'var(--ease-spring)',
                  transitionDuration: '500ms',
                }}
              >
                <Icon name={sending ? 'clock' : 'people'} size={64} strokeWidth={2.2} />
                <span className="px-6 text-center leading-tight">{t('help.need', person.language)}</span>
              </button>
            </div>

            {status && (
              <div
                className="panel flex items-center gap-3 px-5 py-4 max-w-md"
                style={{ borderColor: sent ? 'var(--ok)' : 'var(--warn)' }}
              >
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

          <div className="flex flex-col gap-4">
            {cards.map((c, i) => (
              <button key={c.id} onClick={() => (c.audioKey ? playPackAudio(c.audioKey) : speak(c.title, person.language))} className={`shell hover-lift text-left rise rise-${Math.min(i + 3, 6)}`}>
                <span className="core flex items-center gap-4 p-4">
                  {c.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photoUrl} alt={c.title} className="object-cover" style={{ width: 72, height: 72, borderRadius: 16 }} />
                  ) : (
                    <span style={{ color: 'var(--accent)' }}>
                      <Icon name="photo" size={56} />
                    </span>
                  )}
                  <span style={{ fontSize: 24 }} className="font-extrabold flex-1">
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
                </span>
              </button>
            ))}
            {!cards.length && (
              <p style={{ fontSize: 18 }} className="muted text-center">
                No help prompts have been approved yet.
              </p>
            )}
          </div>
        </div>
      </div>
      <BottomNav lang={person.language} backHref="/" backLabel={t('common.back', person.language)} />
    </main>
  );
}
