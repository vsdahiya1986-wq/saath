'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import BottomNav from '@/components/ui/BottomNav';
import Icon, { IconName } from '@/components/ui/Icon';
import NoSignalMode from '@/components/circle/NoSignalMode';
import SampleDataCard from '@/components/circle/SampleDataCard';
import NudgeList from '@/components/circle/NudgeList';
import CareNoteCard from '@/components/circle/CareNoteCard';
import { getActivePersonId } from '@/lib/usePerson';
import { db, getPerson, packsForPerson, membersForPerson, remindersForPerson } from '@/lib/db';
import { isOverdue } from '@/lib/reminders';

interface CircleCounts {
  personName: string | null;
  isDemo: boolean;
  persons: number;
  packsApproved: number;
  packsTotal: number;
  recordings: number;
  members: number;
  remindersTotal: number;
  remindersOverdue: number;
  trials: number;
  sessionsThisWeek: number;
}

type Stat = { value: string | null; label: string };

const LINKS: { href: string; label: string; desc: string; icon: IconName; color: string; stat: (c: CircleCounts) => Stat; wide?: boolean }[] = [
  { href: '/circle/people', label: 'People on this device', desc: 'Switch between the people this device cares for', icon: 'people', color: '#0f766e', stat: (c) => ({ value: String(c.persons), label: c.persons === 1 ? 'person' : 'people' }) },
  { href: '/circle/setup', label: 'Person profile', desc: 'Edit the person who is active now', icon: 'profile', color: '#065f46', stat: (c) => ({ value: c.personName, label: c.personName ? 'profile set up' : 'Not set up yet' }) },
  { href: '/circle/packs', label: 'Memory Garden', desc: 'Family photos with voice notes', icon: 'photo', color: '#b45309', stat: (c) => ({ value: String(c.packsApproved), label: `of ${c.packsTotal} memories approved` }) },
  { href: '/circle/roster', label: 'Circle roster', desc: 'Who is in the circle, on-call days', icon: 'people', color: '#6d28d9', stat: (c) => ({ value: String(c.members), label: c.members === 1 ? 'member' : 'members' }) },
  { href: '/circle/reminders', label: 'Reminders', desc: 'Medicine, hydration, activity, appointments', icon: 'clock', color: '#0369a1', stat: (c) => ({ value: String(c.remindersTotal), label: `set${c.remindersOverdue ? ` · ${c.remindersOverdue} overdue` : ''}` }) },
  { href: '/circle/visit', label: 'Visit Card', desc: 'One printable page for the doctor or ASHA', icon: 'calendar', color: '#334155', stat: () => ({ value: null, label: 'Print or save as PDF' }) },
  { href: '/circle/board', label: 'Circle Board', desc: 'Trends, activity levels, who is carrying this', icon: 'chart', color: '#9d174d', stat: (c) => ({ value: String(c.trials), label: 'sessions recorded' }) },
  // R2: Handoff removed — unfinished, not in the requirement list, and multi-person
  // on one device covers the real ASHA workflow.
  // R3: Voice Legacy folded into Memory Garden, which now has the export button.
  { href: '/inspector', label: 'Evidence Inspector', desc: 'How the model decides, in plain words', icon: 'sparkle', color: '#065f46', stat: () => ({ value: null, label: 'Open the model’s reasoning' }), wide: true },
];

/** Circle hub (SIH26003 f): caregiver/worker tools as a dense 2-column bento, each tile with a live count. */
export default function CircleHome() {
  const [counts, setCounts] = useState<CircleCounts | null>(null);
  const [personId, setPersonId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const id = await getActivePersonId();
      if (!id) return;
      setPersonId(id);
      const [person, persons, packs, members, reminders, trials] = await Promise.all([
        getPerson(id),
        db.persons.count(),
        packsForPerson(id),
        membersForPerson(id),
        remindersForPerson(id),
        db.trials.where({ person_id: id }).toArray(),
      ]);
      const weekAgo = Date.now() - 7 * 864e5;
      setCounts({
        personName: person?.display_name ?? null,
        isDemo: !!person?.is_demo,
        persons,
        packsApproved: packs.filter((p) => p.state === 'approved').length,
        packsTotal: packs.length,
        recordings: packs.filter((p) => p.state !== 'withdrawn' && p.media.audio_key).length,
        members: members.length,
        remindersTotal: reminders.length,
        remindersOverdue: reminders.filter(isOverdue).length,
        trials: trials.filter((x) => !x.synthetic).length,
        sessionsThisWeek: trials.filter((x) => !x.synthetic && new Date(x.created_at).getTime() >= weekAgo).length,
      });
    })();
  }, []);

  return (
    <main className="flex-1 min-h-0 flex flex-col">
      <header className="shrink-0 w-full max-w-5xl mx-auto px-5 pt-2 pb-3 flex flex-col items-start gap-3">
        <BackButton href="/" label="Back" />
        <h1 className="title-xl">Circle</h1>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto w-full max-w-5xl mx-auto px-5 pb-4">
        <div className="grid grid-cols-2 gap-4" style={{ gridAutoRows: 'minmax(180px, auto)' }}>
          <NudgeList personId={personId} />

          <div className="core col-span-2 p-5 flex flex-wrap items-center gap-x-8 gap-y-3" style={{ borderTop: '6px solid var(--accent)' }} data-testid="circle-summary">
            <div className="flex flex-col">
              <span style={{ fontSize: 15, letterSpacing: '0.08em' }} className="font-bold uppercase muted">
                Caring for
              </span>
              <span style={{ fontSize: 30, overflowWrap: 'anywhere' }} className="font-extrabold">
                {counts?.personName ?? '…'}
              </span>
              {counts?.isDemo && (
                <span className="chip self-start mt-1" style={{ color: 'var(--accent-warm)' }}>
                  DEMO DATA
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: 36, color: 'var(--accent)' }} className="font-extrabold tabular-nums leading-none">
                {counts ? counts.sessionsThisWeek : '…'}
              </span>
              <span style={{ fontSize: 16 }} className="muted">
                sessions in the last 7 days
              </span>
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: 36, color: counts?.remindersOverdue ? 'var(--alert)' : 'var(--accent)' }} className="font-extrabold tabular-nums leading-none">
                {counts ? counts.remindersOverdue : '…'}
              </span>
              <span style={{ fontSize: 16 }} className="muted">
                reminders overdue today
              </span>
            </div>
            <Link href="/circle/people" className="btn btn-ghost">
              <Icon name="people" size={22} /> Switch person
            </Link>
          </div>

          <SampleDataCard onChange={() => location.reload()} />

          <CareNoteCard personId={personId} />

          {LINKS.map((l) => {
            const stat = counts ? l.stat(counts) : null;
            return (
              <Link key={l.href} href={l.href} className={`core hover-lift p-4 flex flex-col gap-2 ${l.wide ? 'col-span-2' : ''}`} style={{ borderTop: `6px solid ${l.color}` }}>
                <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 52, height: 52, color: l.color, background: `color-mix(in srgb, ${l.color} 12%, var(--surface))` }}>
                  <Icon name={l.icon} size={26} />
                </span>
                <span style={{ fontSize: 22, overflowWrap: 'anywhere' }} className="font-extrabold leading-tight">
                  {l.label}
                </span>
                <span style={{ fontSize: 16 }} className="muted">
                  {l.desc}
                </span>
                <span className="mt-auto flex items-baseline gap-2 flex-wrap">
                  {stat?.value && (
                    <span style={{ fontSize: 30, color: l.color, overflowWrap: 'anywhere' }} className="font-extrabold tabular-nums leading-none">
                      {stat.value}
                    </span>
                  )}
                  <span style={{ fontSize: 16, color: l.color }} className="font-bold">
                    {stat ? stat.label : '…'}
                  </span>
                </span>
              </Link>
            );
          })}

          <NoSignalMode />

          <section className="core col-span-2 p-5 flex gap-4 items-start">
            <span style={{ color: 'var(--accent)' }}>
              <Icon name="shield" size={30} />
            </span>
            <div className="flex flex-col gap-1">
              <span style={{ fontSize: 19 }} className="font-extrabold">
                Data & privacy
              </span>
              <span style={{ fontSize: 16 }} className="muted">
                Names, care-plan text, photos and recordings are AES-256 encrypted at rest on this device, and every record belongs to one
                person. Nothing syncs unless a backend is configured for the deployment (it is not in this demo build) — and even then only
                coded gameplay data, never identifying fields.
              </span>
            </div>
          </section>
        </div>
      </div>
      <BottomNav lang="en" backHref="/" backLabel="Back" />
    </main>
  );
}
