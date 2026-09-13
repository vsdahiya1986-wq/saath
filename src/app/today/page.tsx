'use client';
import { useEffect, useState } from 'react';
import { usePerson } from '@/lib/usePerson';
import { Reminder, remindersForPerson } from '@/lib/db';
import { playPackAudio, playCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import { CUE_KEY, CATEGORY_COLOR, isOverdue, sortReminders, formatTime } from '@/lib/reminders';
import AnalogClock from '@/components/ui/AnalogClock';
import Icon from '@/components/ui/Icon';
import StatusBadge from '@/components/ui/StatusBadge';
import BackButton from '@/components/ui/BackButton';
import BottomNav from '@/components/ui/BottomNav';
import { orientationNow } from '@/lib/orientation';

export default function TodayScreen() {
  const { person, loading } = usePerson();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (!person) return;
    remindersForPerson(person.id).then((rs) => setReminders(sortReminders(rs)));
  }, [person]);

  if (loading || !person) return null;

  const now = orientationNow();
  const showClock = person.literacy !== 'fluent';
  const [hero, ...rest] = reminders;

  function play(r: Reminder) {
    if (r.audio_pack_id) playPackAudio(r.audio_pack_id);
    else playCue(CUE_KEY[r.category], person!.language);
  }

  function renderRow(r: Reminder, big: boolean) {
    const overdue = isOverdue(r);
    const color = overdue ? 'var(--alert)' : CATEGORY_COLOR[r.category];
    return (
      <button
        data-testid="reminder-row"
        data-overdue={overdue}
        onClick={() => play(r)}
        className="shell hover-lift text-left w-full"
      >
        <span
          className="core flex items-center gap-5 p-5"
          style={{
            borderColor: overdue ? 'var(--alert)' : 'var(--border)',
            background: `radial-gradient(100% 140% at 0% 50%, color-mix(in srgb, ${color} 14%, transparent) 0%, transparent 60%), linear-gradient(180deg, var(--surface-2), var(--surface))`,
          }}
        >
          {showClock ? (
            <span className="shrink-0 rounded-full p-1" style={{ background: 'var(--bg-2)', boxShadow: `0 0 30px -10px ${color}` }}>
              <AnalogClock hour={r.hour} minute={r.minute} size={big ? 104 : 80} />
            </span>
          ) : (
            <span style={{ fontSize: big ? 34 : 28, color }} className="font-extrabold shrink-0 tabular-nums">
              {formatTime(r)}
            </span>
          )}
          <span className="flex-1 min-w-0 flex flex-col gap-1">
            <span style={{ fontSize: 14, color, letterSpacing: '0.12em' }} className="font-bold uppercase flex items-center gap-2">
              {overdue && <Icon name="warning" size={16} />}
              {big ? (overdue ? 'Overdue — next up' : 'Next up') : overdue ? 'Overdue' : formatTime(r)}
            </span>
            <span style={{ fontSize: big ? 28 : 23 }} className="font-extrabold leading-tight">
              {t(CUE_KEY[r.category], person!.language)}
            </span>
            <span style={{ fontSize: 17 }} className="muted">
              {r.care_plan_text}
            </span>
            {!r.device_activated && (
              <span style={{ fontSize: 14, color: 'var(--warn)' }} className="flex items-center gap-1 font-semibold">
                <Icon name="warning" size={14} /> Not armed on this device
              </span>
            )}
          </span>
          <span className="btn btn-ghost btn-icon shrink-0" style={{ color }} aria-hidden="true">
            <Icon name="listen" size={24} />
          </span>
        </span>
      </button>
    );
  }

  return (
    <main className="h-[100dvh] flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 pt-6 pb-8 flex flex-col gap-6">
          <header className="flex items-center justify-between gap-3 rise">
            <BackButton href="/" label={t('common.back', person.language)} />
            <StatusBadge lang={person.language} />
          </header>

          <div className="flex flex-col gap-2 rise rise-1">
            <span className="eyebrow self-start">
              <Icon name="calendar" size={14} /> {now.weekday}, {now.day} {now.month}
            </span>
            <h1 className="title-xl">{t('today.title', person.language)}</h1>
          </div>

          {!reminders.length && (
            <div className="panel p-8 text-center flex flex-col items-center gap-3 rise rise-2">
              <span style={{ color: 'var(--accent)' }}>
                <Icon name="clock" size={48} />
              </span>
              <p style={{ fontSize: 20 }} className="muted">
                No reminders set yet.
              </p>
            </div>
          )}

          {hero && (
            <div className="rise rise-2">
              {renderRow(hero, true)}
            </div>
          )}
          {rest.map((r, i) => (
            <div key={r.id} className={`rise rise-${Math.min(i + 3, 6)}`}>
              {renderRow(r, false)}
            </div>
          ))}
        </div>
      </div>
      <BottomNav lang={person.language} backHref="/" backLabel={t('common.back', person.language)} />
    </main>
  );
}
