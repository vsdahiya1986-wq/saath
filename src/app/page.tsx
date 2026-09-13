'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePerson } from '@/lib/usePerson';
import { announce } from '@/lib/voiceNav';
import { t } from '@/lib/i18n';
import { membersForPerson, remindersForPerson, Reminder } from '@/lib/db';
import { openFollowupsForPerson, helpStatusKey } from '@/lib/events';
import { CUE_KEY, sortReminders, formatTime, isOverdue } from '@/lib/reminders';
import { ACTIVITIES } from '@/content/activities';
import BentoTile from '@/components/ui/BentoTile';
import BottomNav from '@/components/ui/BottomNav';
import StatusBadge from '@/components/ui/StatusBadge';
import Icon from '@/components/ui/Icon';
import { orientationNow } from '@/lib/orientation';

interface HomePreview {
  circleCount: number;
  nextReminder: Reminder | null;
  helpKey: 'help.sent_local' | 'help.stored' | null;
}

export default function PersonHome() {
  const router = useRouter();
  const { person, loading } = usePerson();
  const [preview, setPreview] = useState<HomePreview | null>(null);

  useEffect(() => {
    if (person?.navigation === 'voice-guided') announce('home_intro', person.language);
  }, [person?.navigation, person?.language]);

  useEffect(() => {
    if (!person) return;
    let cancelled = false;
    (async () => {
      const [members, reminders, openHelp] = await Promise.all([
        membersForPerson(person.id),
        remindersForPerson(person.id),
        openFollowupsForPerson(person.id),
      ]);
      if (cancelled) return;
      setPreview({
        circleCount: members.length,
        nextReminder: sortReminders(reminders)[0] ?? null,
        helpKey: openHelp[0] ? helpStatusKey(openHelp[0].state) : null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [person]);

  if (loading) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center">
        <div className="spinner" aria-label="Loading" />
      </main>
    );
  }

  if (!person) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center gap-8 p-6 text-center">
        <span className="eyebrow rise">
          <Icon name="sparkle" size={14} /> Memory companion
        </span>
        <h1 className="title-xl rise rise-1">
          Welcome to <span className="glow-text">SAATH</span>
        </h1>
        <p style={{ fontSize: 20 }} className="muted max-w-md rise rise-2">
          No person profile exists on this device yet. A family member or health worker sets one up from the Circle screens.
        </p>
        <button onClick={() => router.push('/circle/setup')} className="btn btn-primary btn-xl rise rise-3" style={{ paddingRight: 12 }}>
          Set up a profile
          <span className="nub">
            <Icon name="arrow" size={24} strokeWidth={2.6} />
          </span>
        </button>
      </main>
    );
  }

  const now = orientationNow();
  const circlePreview =
    preview === null ? '…' : preview.circleCount === 0 ? 'No one added yet' : `${preview.circleCount} ${preview.circleCount === 1 ? 'person' : 'people'} looking out for you`;
  const todayPreview = (() => {
    if (preview === null) return '…';
    const r = preview.nextReminder;
    if (!r) return 'No reminders set yet';
    return `${isOverdue(r) ? 'Overdue — ' : 'Next: '}${t(CUE_KEY[r.category], person.language)} · ${formatTime(r)}`;
  })();
  const helpPreview = preview === null ? '…' : preview.helpKey ? t(preview.helpKey, person.language) : t('home.help.ok', person.language);

  return (
    <main className="h-[100dvh] flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 pt-6 pb-8 flex flex-col gap-6">
          <header className="flex items-start justify-between gap-4 rise">
            <div className="flex flex-col gap-3 min-w-0">
              <span className="eyebrow self-start">
                <Icon name={now.partIcon} size={16} /> Good {now.part.toLowerCase()}
              </span>
              <h1 className="title-xl break-words">{person.display_name}</h1>
            </div>
            <StatusBadge lang={person.language} />
          </header>

          <div className="panel rise rise-1 flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4" aria-label="Today">
            <span className="flex items-center gap-2 font-bold" style={{ fontSize: 20 }}>
              <span style={{ color: 'var(--accent)' }}>
                <Icon name="calendar" size={24} />
              </span>
              {now.weekday}, {now.day} {now.month}
            </span>
            <span className="flex items-center gap-2 muted" style={{ fontSize: 18 }}>
              <span style={{ color: 'var(--accent-warm)' }}>
                <Icon name={now.seasonIcon} size={22} />
              </span>
              {now.season} season
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <BentoTile
              hero
              className="sm:col-span-2 rise rise-2"
              tint="play"
              icon="play"
              labelKey="home.play"
              person={person}
              preview={`${ACTIVITIES.length} brain-friendly activities based on Cognitive Stimulation Therapy`}
              onSelect={() => router.push('/play')}
            />
            <BentoTile className="rise rise-3" tint="today" icon="today" labelKey="home.today" person={person} preview={todayPreview} onSelect={() => router.push('/today')} />
            <BentoTile className="rise rise-4" tint="help" icon="help" labelKey="home.help" person={person} preview={helpPreview} onSelect={() => router.push('/help')} />
            <BentoTile
              className="sm:col-span-2 rise rise-5"
              tint="circle"
              icon="people"
              labelKey="home.circle"
              person={person}
              preview={circlePreview}
              onSelect={() => router.push('/circle')}
            />
          </div>
        </div>
      </div>

      <BottomNav lang={person.language} />
    </main>
  );
}
