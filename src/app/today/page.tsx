'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePerson } from '@/lib/usePerson';
import { Reminder, remindersForPerson } from '@/lib/db';
import { playPackAudio, playCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import AnalogClock from '@/components/ui/AnalogClock';
import Icon from '@/components/ui/Icon';

const CUE_KEY: Record<Reminder['category'], string> = {
  medicine: 'remind.medicine',
  hydration: 'remind.hydration',
  activity: 'remind.activity',
  appointment: 'remind.appointment',
};

export default function TodayScreen() {
  const { person, loading } = usePerson();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (!person) return;
    remindersForPerson(person.id).then((rs) =>
      setReminders(rs.sort((a, b) => (a.period === b.period ? a.hour - b.hour : a.period === 'AM' ? -1 : 1)))
    );
  }, [person]);

  if (loading || !person) return null;

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-4">
      <h1 style={{ fontSize: 'var(--text-title)' }} className="font-black text-[var(--text)]">
        {t('today.title', person.language)}
      </h1>

      <div className="flex flex-col gap-3">
        {reminders.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              if (r.audio_pack_id) playPackAudio(r.audio_pack_id);
              else playCue(CUE_KEY[r.category], person.language);
            }}
            style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', minHeight: 'var(--touch-min)' }}
            className="flex items-center gap-4 p-4 text-left"
          >
            {person.literacy !== 'fluent' ? (
              <AnalogClock hour={r.hour} minute={r.minute} size={64} />
            ) : (
              <span style={{ fontSize: 22 }} className="font-black w-20">
                {r.hour}:{String(r.minute).padStart(2, '0')} {r.period}
              </span>
            )}
            <div className="flex-1">
              <div style={{ fontSize: 20 }} className="font-black">
                {t(CUE_KEY[r.category], person.language)}
              </div>
              <div style={{ fontSize: 14 }} className="text-[var(--text-muted)]">
                {r.care_plan_text}
              </div>
            </div>
            {!r.device_activated && <Icon name="warning" size={22} />}
            <Icon name="listen" size={22} />
          </button>
        ))}
        {!reminders.length && (
          <p style={{ fontSize: 16 }} className="text-[var(--text-muted)]">
            No reminders set yet.
          </p>
        )}
      </div>

      <Link href="/" style={{ fontSize: 14, color: 'var(--text-muted)' }} className="underline text-center mt-auto">
        {t('common.back', person.language)}
      </Link>
    </main>
  );
}
