'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePerson } from '@/lib/usePerson';
import { db, Reminder } from '@/lib/db';
import { playPackAudio, playCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import { CUE_KEY, CATEGORY_COLOR, STATUS_KEY, formatTime, logReminderResponse, ReminderStatus, todayStatuses } from '@/lib/reminders';
import ReminderDueCard from '@/components/ui/ReminderDueCard';
import { ACTIVITIES } from '@/content/activities';
import AnalogClock from '@/components/ui/AnalogClock';
import Icon from '@/components/ui/Icon';
import StatusBadge from '@/components/ui/StatusBadge';
import BackButton from '@/components/ui/BackButton';
import BottomNav from '@/components/ui/BottomNav';
import { optKey, orientationNow } from '@/lib/orientation';

const VISIBLE = 3;

/** Literacy tiers (SIH26003 h): analog clock faces for non-literate/basic, digits for fluent. */
const SIZES = {
  'non-literate': { clock: 104, label: 28 },
  basic: { clock: 88, label: 24 },
  fluent: { clock: 72, label: 22 },
} as const;

/** Today (SIH26003 e, h): reminders plus today's orientation and activity, as a screen-filling 2-column bento. */
export default function TodayScreen() {
  const router = useRouter();
  const { person, loading } = usePerson();
  const [rows, setRows] = useState<{ reminder: Reminder; status: ReminderStatus }[] | null>(null);
  const [playedToday, setPlayedToday] = useState<string[]>([]);
  // The full-screen due card appears once per visit; after an answer the
  // list below carries on, so answering one never pops up the next.
  const [cardDismissed, setCardDismissed] = useState(false);

  useEffect(() => {
    if (!person) return;
    let cancelled = false;
    (async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      // F2: the in-app fallback — whenever Today is open, anything due shows as
      // a full-screen card even if the device itself could not ring.
      const [statuses, trials] = await Promise.all([todayStatuses(person.id), db.trials.where({ person_id: person.id }).toArray()]);
      if (cancelled) return;
      setRows(statuses);
      const acts = [...new Set(trials.filter((x) => !x.synthetic && new Date(x.created_at) >= startOfDay).map((x) => x.activity))];
      setPlayedToday(acts.map((a) => t(ACTIVITIES.find((i) => i.activity === a)!.labelKey, person.language)));
    })();
    return () => {
      cancelled = true;
    };
  }, [person]);

  if (loading || !person) return null;

  const s = SIZES[person.literacy];
  const lang = person.language;
  const now = orientationNow();
  // 07 B2: never a wall of cards — the next three, and a count of the rest.
  const visible = (rows ?? []).slice(0, VISIBLE);
  const laterCount = (rows ?? []).slice(VISIBLE).filter((x) => x.status === 'upcoming').length;
  const firstDue = cardDismissed ? undefined : rows?.find((x) => x.status === 'due')?.reminder;

  function play(r: Reminder) {
    if (r.audio_pack_id) playPackAudio(r.audio_pack_id);
    else playCue(CUE_KEY[r.category], lang);
  }

  /** Every answer is logged (F2 step 4); the list re-reads its status from the log. */
  async function answer(r: Reminder, outcome: 'done' | 'snoozed') {
    await logReminderResponse(r, outcome);
    setCardDismissed(true);
    setRows(await todayStatuses(person!.id));
  }

  /**
   * 07 B1/B2: a card with its own controls, not one giant button. Calm for the
   * person: no red, no pink, no warning triangle — the time and a plain word
   * say where it stands. Circle keeps the stronger status view for caregivers.
   */
  function reminderCard({ reminder: r, status }: { reminder: Reminder; status: ReminderStatus }, big: boolean) {
    const color = CATEGORY_COLOR[r.category];
    return (
      <div
        key={r.id}
        data-testid="reminder-row"
        data-status={status}
        className={`core min-h-0 ${big ? 'col-span-2 p-5' : 'p-4'} flex flex-col gap-3`}
        style={{ borderTop: `6px solid ${color}`, opacity: status === 'done' ? 0.75 : 1 }}
      >
        <div className={`flex gap-4 ${big ? 'items-center' : 'flex-col'}`}>
          {person!.literacy !== 'fluent' ? (
            <span className="shrink-0">
              <AnalogClock hour={r.hour} minute={r.minute} size={big ? s.clock : Math.round(s.clock * 0.75)} />
            </span>
          ) : (
            <span style={{ fontSize: big ? 36 : 28, color }} className="font-extrabold tabular-nums shrink-0">
              {formatTime(r)}
            </span>
          )}
          <span className="flex-1 min-w-0 flex flex-col gap-1" style={{ overflowWrap: 'anywhere' }}>
            <span style={{ fontSize: 15, letterSpacing: '0.04em', color: status === 'missed' ? 'var(--accent-warm)' : color }} className="font-bold flex items-center gap-2">
              {status === 'done' && <Icon name="check" size={16} strokeWidth={3} />}
              {t(STATUS_KEY[status], lang)} · {formatTime(r)}
            </span>
            <span style={{ fontSize: big ? s.label + 4 : s.label }} className="font-extrabold leading-tight">
              {t(CUE_KEY[r.category], lang)}
            </span>
            <span style={{ fontSize: 17 }} className="muted">
              {r.care_plan_text}
            </span>
            {!r.device_activated && (
              <span style={{ fontSize: 15 }} className="muted font-semibold">
                {t('reminder.not_armed', lang)}
              </span>
            )}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {(status === 'due' || status === 'missed') && (
            <button onClick={() => answer(r, 'done')} data-testid="reminder-row-done" className="btn btn-primary">
              <Icon name="check" size={22} strokeWidth={2.6} /> {t('remind.done', lang)}
            </button>
          )}
          {status === 'due' && (
            <button onClick={() => answer(r, 'snoozed')} data-testid="reminder-row-not-now" className="btn btn-ghost">
              {t('remind.not_now', lang)}
            </button>
          )}
          <button onClick={() => play(r)} aria-label={t('a11y.listen', lang)} className="btn btn-ghost btn-icon" style={{ color }}>
            <Icon name="listen" size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="h-[100dvh] flex flex-col">
      {firstDue && (
        <ReminderDueCard person={person} reminder={firstDue} onDone={() => answer(firstDue, 'done')} onNotNow={() => answer(firstDue, 'snoozed')} />
      )}
      <header className="shrink-0 w-full max-w-5xl mx-auto px-5 pt-5 pb-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <BackButton href="/" label={t('common.back', lang)} />
          <StatusBadge lang={lang} />
        </div>
        <h1 className="title-xl">{t('today.title', lang)}</h1>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto w-full max-w-5xl mx-auto px-5 pb-4">
        <div className="grid grid-cols-2 gap-4 min-h-full" style={{ gridAutoRows: 'minmax(190px, 1fr)' }}>
          {rows !== null && !rows.length && (
            <div className="core col-span-2 p-5 flex items-center gap-5" style={{ borderTop: '6px solid var(--tint-today)' }}>
              <span style={{ color: 'var(--tint-today)' }}>
                <Icon name="clock" size={56} />
              </span>
              <div>
                <p style={{ fontSize: 24 }} className="font-extrabold">
                  {t('reminder.none', lang)}
                </p>
                <p style={{ fontSize: 17 }} className="muted">
                  {t('reminder.none_help', lang)}
                </p>
              </div>
            </div>
          )}
          {visible.map((row, i) => reminderCard(row, i === 0))}
          {laterCount > 0 && (
            <p data-testid="reminders-later" style={{ fontSize: 18 }} className="col-span-2 muted font-semibold">
              {laterCount} {t('reminder.more_later', lang)}
            </p>
          )}

          <div className="core p-4 flex flex-col gap-2 min-h-0" data-testid="today-orientation" style={{ borderTop: '6px solid var(--accent-warm)' }}>
            <span style={{ fontSize: 15, color: 'var(--accent-warm)', letterSpacing: '0.08em' }} className="font-bold uppercase">
              {t('today.is', lang)}
            </span>
            <span style={{ fontSize: 30 }} className="font-extrabold leading-tight">
              {t(optKey('weekday', now.weekday), lang)}
            </span>
            <span style={{ fontSize: 20 }} className="font-semibold">
              {now.day} {t(optKey('month', now.month), lang)}
            </span>
            <span style={{ fontSize: 17 }} className="muted flex items-center gap-2 mt-auto">
              <Icon name={now.seasonIcon} size={20} /> {t(optKey('season', now.season), lang)} · {t(optKey('period', now.part), lang)}
            </span>
          </div>

          <div className="core p-4 flex flex-col gap-2 min-h-0" data-testid="today-played" style={{ borderTop: '6px solid var(--tint-play)' }}>
            <span style={{ fontSize: 15, color: 'var(--tint-play)', letterSpacing: '0.08em' }} className="font-bold uppercase">
              {t('today.played', lang)}
            </span>
            <span style={{ fontSize: 40, color: 'var(--tint-play)' }} className="font-extrabold leading-none tabular-nums">
              {playedToday.length}
            </span>
            <span style={{ fontSize: 17 }} className="muted">
              {playedToday.length ? playedToday.join(', ') : t('today.nothing_yet', lang)}
            </span>
            <button onClick={() => router.push('/play')} className="btn btn-primary btn-block mt-auto">
              <Icon name="play" size={22} /> {t('home.play', lang)}
            </button>
          </div>
        </div>
      </div>

      <BottomNav lang={lang} backHref="/" backLabel={t('common.back', lang)} />
    </main>
  );
}
