'use client';
import { useEffect } from 'react';
import type { Person, Reminder } from '@/lib/db';
import { CATEGORY_COLOR, CUE_KEY, formatTime } from '@/lib/reminders';
import { playCue, playPackAudio, queueSpeak } from '@/lib/audio';
import { t } from '@/lib/i18n';
import Icon, { IconName } from './Icon';

const CATEGORY_ICON: Record<Reminder['category'], IconName> = {
  medicine: 'heart',
  hydration: 'tumbler',
  activity: 'play',
  appointment: 'today',
};

/**
 * F2 step 3: the one thing the elder sees when a reminder is due. Big icon,
 * the caregiver's own care-plan text in large type, spoken once, and exactly
 * two answers. No countdown, nothing that moves on its own.
 */
export default function ReminderDueCard({
  person,
  reminder,
  onDone,
  onNotNow,
}: {
  person: Person;
  reminder: Reminder;
  onDone: () => void;
  onNotNow: () => void;
}) {
  const lang = person.language;
  const color = CATEGORY_COLOR[reminder.category];

  useEffect(() => {
    // The category cue has generated Bhashini audio; the care-plan text is the
    // caregiver's own words, so it can only be spoken by the device voice.
    if (reminder.audio_pack_id) playPackAudio(reminder.audio_pack_id);
    else playCue(CUE_KEY[reminder.category], lang);
    queueSpeak(reminder.care_plan_text, lang);
  }, [reminder.id, reminder.audio_pack_id, reminder.care_plan_text, reminder.category, lang]);

  return (
    <div
      data-testid="reminder-due-card"
      data-category={reminder.category}
      role="dialog"
      aria-label={t(CUE_KEY[reminder.category], lang)}
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 p-6 text-center"
      style={{ zIndex: 60, background: 'var(--bg)' }}
    >
      <span className="flex items-center justify-center rounded-full" style={{ width: 150, height: 150, background: color, color: 'var(--on-accent)' }}>
        <Icon name={CATEGORY_ICON[reminder.category]} size={72} strokeWidth={2.4} />
      </span>

      <p style={{ fontSize: 20, color }} className="font-bold uppercase" data-testid="reminder-due-time">
        {formatTime(reminder)}
      </p>
      {/* 08 item 3: the translated sentence is the primary line; the care-plan
          text stays in the caregiver's own words as the detail beneath it —
          never the only text on the person's screen. */}
      <p data-testid="reminder-due-sentence" style={{ fontSize: 32, maxWidth: '22ch', overflowWrap: 'anywhere' }} className="font-extrabold leading-snug">
        {t(CUE_KEY[reminder.category], lang)}
      </p>
      <p data-testid="reminder-due-detail" style={{ fontSize: 22, maxWidth: '28ch', overflowWrap: 'anywhere' }} className="muted font-semibold leading-snug">
        {reminder.care_plan_text}
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={onDone} data-testid="reminder-done" className="btn btn-primary btn-xl" style={{ minHeight: 72, minWidth: 180 }}>
          <Icon name="check" size={30} strokeWidth={2.6} /> {t('remind.done', lang)}
        </button>
        <button onClick={onNotNow} data-testid="reminder-not-now" className="btn btn-ghost btn-xl" style={{ minHeight: 72, minWidth: 180 }}>
          {t('remind.not_now', lang)}
        </button>
      </div>
    </div>
  );
}
