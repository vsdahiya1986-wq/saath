'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePerson } from '@/lib/usePerson';
import { db, Reminder, remindersForPerson } from '@/lib/db';
import { playPackAudio, playCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import { CUE_KEY, CATEGORY_COLOR, isOverdue, sortReminders, formatTime, dueNow, logReminderResponse } from '@/lib/reminders';
import ReminderDueCard from '@/components/ui/ReminderDueCard';
import { ACTIVITIES } from '@/content/activities';
import AnalogClock from '@/components/ui/AnalogClock';
import Icon from '@/components/ui/Icon';
import StatusBadge from '@/components/ui/StatusBadge';
import BackButton from '@/components/ui/BackButton';
import BottomNav from '@/components/ui/BottomNav';
import { orientationNow } from '@/lib/orientation';

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
  const [reminders, setReminders] = useState<Reminder[] | null>(null);
  const [playedToday, setPlayedToday] = useState<string[]>([]);
  const [due, setDue] = useState<Reminder[]>([]);

  useEffect(() => {
    if (!person) return;
    let cancelled = false;
    (async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const [rs, trials] = await Promise.all([remindersForPerson(person.id), db.trials.where({ person_id: person.id }).toArray()]);
      if (cancelled) return;
      setReminders(sortReminders(rs));
      // F2: the in-app fallback — whenever Today is open, anything due shows as
      // a full-screen card even if the device itself could not ring.
      const dueList = await dueNow(person.id);
      if (!cancelled) setDue(dueList);
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
  const [hero, ...rest] = reminders ?? [];

  function play(r: Reminder) {
    if (r.audio_pack_id) playPackAudio(r.audio_pack_id);
    else playCue(CUE_KEY[r.category], lang);
  }

  /** Every due card is answered, and every answer is logged (F2 step 4). */
  async function answerDue(r: Reminder, outcome: 'done' | 'snoozed') {
    await logReminderResponse(r, outcome);
    setDue((rest) => rest.filter((x) => x.id !== r.id));
  }

  function reminderTile(r: Reminder, big: boolean) {
    const overdue = isOverdue(r);
    const color = overdue ? 'var(--alert)' : CATEGORY_COLOR[r.category];
    return (
      <button
        key={r.id}
        data-testid="reminder-row"
        data-overdue={overdue}
        onClick={() => play(r)}
        className={`core hover-lift text-left min-h-0 ${big ? 'col-span-2 flex items-center gap-5 p-5' : 'flex flex-col gap-3 p-4'}`}
        style={{ borderTop: `6px solid ${color}`, background: overdue ? 'var(--alert-soft)' : 'var(--surface)' }}
      >
        {person!.literacy !== 'fluent' ? (
          <span className="shrink-0">
            <AnalogClock hour={r.hour} minute={r.minute} size={big ? s.clock : Math.round(s.clock * 0.75)} />
          </span>
        ) : (
          <span style={{ fontSize: big ? 36 : 28, color }} className="font-extrabold tabular-nums shrink-0">
            {formatTime(r)}
          </span>
        )}
        <span className="flex-1 min-w-0 flex flex-col gap-1">
          <span style={{ fontSize: 15, color, letterSpacing: '0.08em' }} className="font-bold uppercase flex items-center gap-2">
            {overdue && <Icon name="warning" size={16} />}
            {big ? (overdue ? 'Overdue — next up' : 'Next up') : overdue ? 'Overdue' : 'Later today'} · {formatTime(r)}
          </span>
          <span style={{ fontSize: big ? s.label + 4 : s.label }} className="font-extrabold leading-tight">
            {t(CUE_KEY[r.category], lang)}
          </span>
          <span style={{ fontSize: 17 }} className="muted">
            {r.care_plan_text}
          </span>
          {!r.device_activated && (
            <span style={{ fontSize: 15, color: 'var(--warn)' }} className="flex items-center gap-1 font-semibold">
              <Icon name="warning" size={14} /> Not armed on this device
            </span>
          )}
        </span>
        <span className="btn btn-ghost btn-icon shrink-0 self-start" style={{ color }} aria-hidden="true">
          <Icon name="listen" size={24} />
        </span>
      </button>
    );
  }

  return (
    <main className="h-[100dvh] flex flex-col">
      {due[0] && (
        <ReminderDueCard
          person={person}
          reminder={due[0]}
          onDone={() => answerDue(due[0], 'done')}
          onNotNow={() => answerDue(due[0], 'snoozed')}
        />
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
          {reminders !== null && !hero && (
            <div className="core col-span-2 p-5 flex items-center gap-5" style={{ borderTop: '6px solid var(--tint-today)' }}>
              <span style={{ color: 'var(--tint-today)' }}>
                <Icon name="clock" size={56} />
              </span>
              <div>
                <p style={{ fontSize: 24 }} className="font-extrabold">
                  No reminders set yet
                </p>
                <p style={{ fontSize: 17 }} className="muted">
                  A family member or health worker can add medicine, water, activity and clinic reminders in Circle.
                </p>
              </div>
            </div>
          )}
          {hero && reminderTile(hero, true)}
          {rest.map((r) => reminderTile(r, false))}

          <div className="core p-4 flex flex-col gap-2 min-h-0" data-testid="today-orientation" style={{ borderTop: '6px solid var(--accent-warm)' }}>
            <span style={{ fontSize: 15, color: 'var(--accent-warm)', letterSpacing: '0.08em' }} className="font-bold uppercase">
              Today is
            </span>
            <span style={{ fontSize: 30 }} className="font-extrabold leading-tight">
              {now.weekday}
            </span>
            <span style={{ fontSize: 20 }} className="font-semibold">
              {now.day} {now.month}
            </span>
            <span style={{ fontSize: 17 }} className="muted flex items-center gap-2 mt-auto">
              <Icon name={now.seasonIcon} size={20} /> {now.season} season · {now.part}
            </span>
          </div>

          <div className="core p-4 flex flex-col gap-2 min-h-0" data-testid="today-played" style={{ borderTop: '6px solid var(--tint-play)' }}>
            <span style={{ fontSize: 15, color: 'var(--tint-play)', letterSpacing: '0.08em' }} className="font-bold uppercase">
              Played today
            </span>
            <span style={{ fontSize: 40, color: 'var(--tint-play)' }} className="font-extrabold leading-none tabular-nums">
              {playedToday.length}
            </span>
            <span style={{ fontSize: 17 }} className="muted">
              {playedToday.length ? playedToday.join(', ') : 'Nothing yet today'}
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
