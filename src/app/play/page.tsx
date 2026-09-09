'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePerson } from '@/lib/usePerson';
import { t } from '@/lib/i18n';
import { playCue } from '@/lib/audio';
import Icon, { IconName } from '@/components/ui/Icon';
import type { Activity } from '@/lib/db';

const ACTIVITIES: { activity: Activity; icon: IconName; labelKey: string }[] = [
  { activity: 'familiar_pairs', icon: 'photo', labelKey: 'activity.familiar_pairs' },
  { activity: 'sound_sight', icon: 'listen', labelKey: 'activity.sound_sight' },
  { activity: 'pattern_garden', icon: 'circle', labelKey: 'activity.pattern_garden' },
  { activity: 'my_next_step', icon: 'clock', labelKey: 'activity.my_next_step' },
  { activity: 'together', icon: 'help', labelKey: 'activity.together' },
];

export default function PlayPicker() {
  const router = useRouter();
  const { person, loading } = usePerson();

  if (loading || !person) return null;

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-4">
      <h1 style={{ fontSize: 'var(--text-title)' }} className="font-black text-[var(--text)]">
        {t('play.title', person.language)}
      </h1>
      {ACTIVITIES.map(({ activity, icon, labelKey }) => (
        <div
          key={activity}
          data-testid={`activity-card-${activity}`}
          className="flex items-center gap-5 bg-[var(--surface)] p-5"
          style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)' }}
        >
          <Icon name={icon} size={person.literacy === 'non-literate' ? 72 : 48} />
          <div className="flex-1" style={{ fontSize: person.literacy === 'non-literate' ? 26 : 22 }}>
            <span className="font-black text-[var(--text)]">{t(labelKey, person.language)}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playCue(labelKey, person.language);
            }}
            aria-label={t('a11y.listen', person.language)}
            style={{ minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)', border: 'var(--border-w) solid var(--accent)', borderRadius: 'var(--radius)' }}
            className="text-[var(--accent)] flex items-center justify-center"
          >
            <Icon name="listen" size={22} />
          </button>
          <button
            onClick={() => router.push(`/play/${activity}`)}
            style={{ minHeight: 72, background: 'var(--accent)', borderRadius: 'var(--radius)' }}
            className="text-white font-black px-7 text-xl active:opacity-80"
          >
            {t('common.open', person.language)}
          </button>
        </div>
      ))}
      <Link href="/" style={{ fontSize: 14, color: 'var(--text-muted)' }} className="underline mt-2">
        {t('common.back', person.language)}
      </Link>
    </main>
  );
}
