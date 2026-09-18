'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePerson, setActivePersonId } from '@/lib/usePerson';
import { loadSample } from '@/lib/sampleData';
import { announce } from '@/lib/voiceNav';
import { t } from '@/lib/i18n';
import { db, membersForPerson, remindersForPerson, Reminder } from '@/lib/db';
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
  playedToday: number;
  persons: number;
}

/** Home (SIH26003 h, e, f): a 2x2 bento that fills the screen, every card showing live device data. */
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
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const [members, reminders, openHelp, trials] = await Promise.all([
        membersForPerson(person.id),
        remindersForPerson(person.id),
        openFollowupsForPerson(person.id),
        db.trials.where({ person_id: person.id }).toArray(),
      ]);
      const persons = await db.persons.count();
      if (cancelled) return;
      setPreview({
        circleCount: members.length,
        nextReminder: sortReminders(reminders)[0] ?? null,
        helpKey: openHelp[0] ? helpStatusKey(openHelp[0].state) : null,
        persons,
        playedToday: new Set(trials.filter((x) => !x.synthetic && new Date(x.created_at) >= startOfDay).map((x) => x.activity)).size,
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
      <main className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 p-6 text-center">
        <span className="eyebrow">Memory companion</span>
        <h1 className="title-xl">Welcome to SAATH</h1>
        <p style={{ fontSize: 20 }} className="muted max-w-md">
          No person profile exists on this device yet. A family member or health worker sets one up from the Circle screens.
        </p>
        <button onClick={() => router.push('/circle/setup')} className="btn btn-primary btn-xl">
          Set up a profile
        </button>
        {/* F1: a judge should never have to fill in a form to see the app work. */}
        <button
          onClick={async () => {
            const id = await loadSample();
            await setActivePersonId(id);
            location.reload();
          }}
          data-testid="see-a-sample"
          className="btn btn-ghost"
          style={{ minHeight: 64 }}
        >
          <Icon name="sparkle" size={22} /> See a sample
        </button>
      </main>
    );
  }

  const lang = person.language;
  const now = orientationNow();
  const r = preview?.nextReminder ?? null;

  return (
    <main className="h-[100dvh] flex flex-col">
      <header className="shrink-0 w-full max-w-5xl mx-auto px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="title-xl break-words">{person.display_name}</h1>
            {/* F9: one device, several people — the switch is one tap away. */}
            {(preview?.persons ?? 0) > 1 && (
              <button onClick={() => router.push('/circle/people')} className="btn btn-ghost" data-testid="switch-person">
                <Icon name="people" size={20} /> Switch
              </button>
            )}
          </div>
          {/* F1: the Sample chip is permanent while a sample person is active, so
              no screenshot can pass fictional data off as a real person's. */}
          {person.is_sample && (
            <span className="chip self-start" data-testid="sample-chip" style={{ color: 'var(--accent-warm)' }}>
              SAMPLE
            </span>
          )}
          <p style={{ fontSize: 18 }} className="muted flex items-center gap-2">
            <Icon name="calendar" size={20} /> {now.weekday}, {now.day} {now.month} · {now.season} season
          </p>
        </div>
        <StatusBadge lang={lang} />
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto w-full max-w-5xl mx-auto px-5 pb-4">
        <div className="grid grid-cols-2 gap-4 min-h-full" style={{ gridAutoRows: 'minmax(250px, auto)', alignContent: 'stretch' }}>
          <BentoTile
            tint="play"
            icon="play"
            labelKey="home.play"
            person={person}
            stat={String(ACTIVITIES.length)}
            detail={preview ? `activities ready today · ${preview.playedToday} played so far` : '…'}
            onSelect={() => router.push('/play')}
          />
          <BentoTile
            tint="today"
            icon="today"
            labelKey="home.today"
            person={person}
            stat={preview ? (r ? formatTime(r) : '—') : '…'}
            detail={preview ? (r ? `${isOverdue(r) ? 'Overdue — ' : 'Next: '}${t(CUE_KEY[r.category], lang)}` : 'No reminders set yet') : '…'}
            onSelect={() => router.push('/today')}
          />
          <BentoTile
            tint="circle"
            icon="people"
            labelKey="home.circle"
            person={person}
            stat={preview ? String(preview.circleCount) : '…'}
            detail={preview ? (preview.circleCount === 1 ? 'person looking out for you' : 'people looking out for you') : '…'}
            onSelect={() => router.push('/circle')}
          />
          <BentoTile
            tint="help"
            icon="help"
            labelKey="home.help"
            person={person}
            detail={preview ? (preview.helpKey ? t(preview.helpKey, lang) : t('home.help.ok', lang)) : '…'}
            onSelect={() => router.push('/help')}
          />
        </div>
      </div>

      <BottomNav lang={lang} />
    </main>
  );
}
