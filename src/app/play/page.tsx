'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePerson } from '@/lib/usePerson';
import { t } from '@/lib/i18n';
import { playCue, queueAutoCue } from '@/lib/audio';
import Icon, { IconName } from '@/components/ui/Icon';
import IconTile from '@/components/ui/IconTile';
import StatusBadge from '@/components/ui/StatusBadge';
import BackButton from '@/components/ui/BackButton';
import type { Activity } from '@/lib/db';

// Each activity is mapped to exactly one of the 4 cognitive domains named in
// SIH26003 requirement (a): memory, attention/concentration, daily routine
// recall, pattern/object recognition. domainKey is shown as a visible badge
// on the card so a judge can see domain coverage at a glance, not just play
// a game and guess what it's meant to train.
const ACTIVITIES: { activity: Activity; icon: IconName; labelKey: string; domainKey: string }[] = [
  { activity: 'familiar_pairs', icon: 'photo', labelKey: 'activity.familiar_pairs', domainKey: 'domain.memory' },
  { activity: 'sound_sight', icon: 'listen', labelKey: 'activity.sound_sight', domainKey: 'domain.attention' },
  { activity: 'pattern_garden', icon: 'circle', labelKey: 'activity.pattern_garden', domainKey: 'domain.pattern' },
  { activity: 'my_next_step', icon: 'clock', labelKey: 'activity.my_next_step', domainKey: 'domain.routine' },
  { activity: 'together', icon: 'help', labelKey: 'activity.together', domainKey: 'domain.attention' },
];

// Visual-identity pass: each domain gets its own consistent, high-contrast
// colour (same domain = same colour everywhere, never reassigned — research
// finding #6) so a judge or family member can tell activities apart at a
// glance instead of every card reading identically in the single app accent.
// All four are ≥4.5:1 against a white card background.
const DOMAIN_COLOR: Record<string, string> = {
  'domain.memory': '#065f46',
  'domain.attention': '#6d28d9',
  'domain.pattern': '#92400e',
  'domain.routine': '#0369a1',
};

export default function PlayPicker() {
  const router = useRouter();
  const { person, loading } = usePerson();

  // SIH26003 bug fix: same root cause as BigChoice — a non-literate user
  // landing on this list previously got no audio at all unless they already
  // knew to tap the small per-card "listen" icon. Queue each card's label in
  // display order so they announce one after another instead of overlapping.
  useEffect(() => {
    if (!person || person.literacy !== 'non-literate') return;
    for (const { labelKey } of ACTIVITIES) {
      queueAutoCue(labelKey, person.language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?.id, person?.literacy, person?.language]);

  if (loading || !person) return null;

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <BackButton href="/" label={t('common.back', person.language)} />
        <h1 style={{ fontSize: 'var(--text-title)' }} className="font-black text-[var(--text)] flex-1">
          {t('play.title', person.language)}
        </h1>
        <StatusBadge lang={person.language} />
      </header>
      {ACTIVITIES.map(({ activity, icon, labelKey, domainKey }) => {
        const domainColor = DOMAIN_COLOR[domainKey];
        return (
        <div
          key={activity}
          data-testid={`activity-card-${activity}`}
          className="flex items-center gap-5 bg-[var(--surface)] p-5"
          style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)' }}
        >
          <IconTile icon={icon} size={person.literacy === 'non-literate' ? 72 : 48} fg={domainColor} bg={`${domainColor}1a`} />
          <div className="flex-1" style={{ fontSize: person.literacy === 'non-literate' ? 26 : 22 }}>
            <span className="font-black text-[var(--text)]">{t(labelKey, person.language)}</span>
            {person.literacy !== 'non-literate' && (
              <div
                style={{ fontSize: 13, color: domainColor, border: `2px solid ${domainColor}`, borderRadius: 999 }}
                className="inline-block px-3 py-0.5 mt-1 font-bold"
                data-testid={`domain-badge-${activity}`}
              >
                {t(domainKey, person.language)}
              </div>
            )}
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
        );
      })}
    </main>
  );
}
