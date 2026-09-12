'use client';
import { useEffect, useState } from 'react';
import { usePerson } from '@/lib/usePerson';
import { Reminder, remindersForPerson } from '@/lib/db';
import { playPackAudio, playCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import AnalogClock from '@/components/ui/AnalogClock';
import Icon from '@/components/ui/Icon';
import StatusBadge from '@/components/ui/StatusBadge';
import BackButton from '@/components/ui/BackButton';

const CUE_KEY: Record<Reminder['category'], string> = {
  medicine: 'remind.medicine',
  hydration: 'remind.hydration',
  activity: 'remind.activity',
  appointment: 'remind.appointment',
};

/**
 * SIH26003 (e): "overdue/urgent reminders unmistakably distinct (color +
 * icon + position), not just a small warning icon." Reminder rows only
 * store a recurring daily hour/minute/period (see src/lib/db.ts) — there is
 * no per-day "done today" record, so "overdue" is the honest thing this
 * screen CAN derive without touching the data layer: has today's clock
 * already passed this reminder's time. It resets itself every midnight for
 * free, by the same logic, with no stored state to go stale.
 */
function minutesSinceMidnight(hour12: number, minute: number, period: 'AM' | 'PM'): number {
  const h = period === 'PM' ? (hour12 % 12) + 12 : hour12 % 12;
  return h * 60 + minute;
}

function isOverdue(r: Reminder): boolean {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return minutesSinceMidnight(r.hour, r.minute, r.period) < nowMinutes;
}

/** SIH26003 (h): literacy-scaling audit — see the matching comment in src/app/help/page.tsx. */
const SIZES = {
  'non-literate': { clock: 72, label: 24, sub: 15 },
  basic: { clock: 64, label: 20, sub: 14 },
  fluent: { clock: 56, label: 20, sub: 14 },
} as const;

export default function TodayScreen() {
  const { person, loading } = usePerson();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (!person) return;
    remindersForPerson(person.id).then((rs) =>
      setReminders(
        rs.sort((a, b) => {
          const overdueDiff = Number(isOverdue(b)) - Number(isOverdue(a));
          if (overdueDiff !== 0) return overdueDiff; // overdue reminders float to the top
          return minutesSinceMidnight(a.hour, a.minute, a.period) - minutesSinceMidnight(b.hour, b.minute, b.period);
        })
      )
    );
  }, [person]);

  if (loading || !person) return null;

  const s = SIZES[person.literacy];

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <BackButton href="/" label={t('common.back', person.language)} />
        <h1 style={{ fontSize: 'var(--text-title)' }} className="font-black text-[var(--text)] flex-1">
          {t('today.title', person.language)}
        </h1>
        <StatusBadge lang={person.language} />
      </header>

      <div className="flex flex-col gap-3">
        {reminders.map((r) => {
          const overdue = isOverdue(r);
          return (
            <button
              key={r.id}
              data-testid="reminder-row"
              data-overdue={overdue}
              onClick={() => {
                if (r.audio_pack_id) playPackAudio(r.audio_pack_id);
                else playCue(CUE_KEY[r.category], person.language);
              }}
              style={{
                border: `var(--border-w) solid ${overdue ? 'var(--alert)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                minHeight: 'var(--touch-min)',
                background: overdue ? '#FEF2F4' : 'var(--surface)',
              }}
              className="flex items-center gap-4 p-4 text-left"
            >
              {person.literacy !== 'fluent' ? (
                <AnalogClock hour={r.hour} minute={r.minute} size={s.clock} />
              ) : (
                <span style={{ fontSize: 22 }} className="font-black w-20">
                  {r.hour}:{String(r.minute).padStart(2, '0')} {r.period}
                </span>
              )}
              <div className="flex-1">
                {overdue && (
                  <div style={{ fontSize: 12, color: 'var(--alert)' }} className="font-black uppercase tracking-wide flex items-center gap-1 mb-0.5">
                    <Icon name="warning" size={14} /> Overdue
                  </div>
                )}
                <div style={{ fontSize: s.label }} className="font-black">
                  {t(CUE_KEY[r.category], person.language)}
                </div>
                <div style={{ fontSize: s.sub }} className="text-[var(--text-muted)]">
                  {r.care_plan_text}
                </div>
              </div>
              {!r.device_activated && (
                <span title="Not armed on this device">
                  <Icon name="warning" size={22} />
                </span>
              )}
              <Icon name="listen" size={22} />
            </button>
          );
        })}
        {!reminders.length && (
          <p style={{ fontSize: 16 }} className="text-[var(--text-muted)]">
            No reminders set yet.
          </p>
        )}
      </div>
    </main>
  );
}
