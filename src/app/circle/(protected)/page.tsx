'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import BottomNav from '@/components/ui/BottomNav';
import Icon, { IconName } from '@/components/ui/Icon';
import { getActivePersonId } from '@/lib/usePerson';
import { db, getPerson, packsForPerson, membersForPerson, remindersForPerson } from '@/lib/db';
import { isOverdue } from '@/lib/reminders';

interface CircleCounts {
  personName: string | null;
  packsApproved: number;
  packsTotal: number;
  members: number;
  remindersTotal: number;
  remindersOverdue: number;
  trials: number;
  handoffsPending: number;
}

const LINKS: { href: string; label: string; desc: string; icon: IconName; color: string; stat: (c: CircleCounts) => string | null; wide?: boolean }[] = [
  { href: '/circle/setup', label: 'Person profile', desc: 'Create or edit the person this device is for', icon: 'profile', color: '#5eead4', stat: (c) => (c.personName ? `Set up for ${c.personName}` : 'Not set up yet') },
  { href: '/circle/packs', label: 'Pack Studio', desc: 'Photos, prompts, routines — approve what plays', icon: 'camera', color: '#fcd34d', stat: (c) => (c.packsTotal ? `${c.packsApproved} of ${c.packsTotal} approved` : 'No packs yet') },
  { href: '/circle/roster', label: 'Circle roster', desc: 'Who is in the circle, on-call days', icon: 'people', color: '#c4b5fd', stat: (c) => (c.members ? `${c.members} ${c.members === 1 ? 'member' : 'members'}` : 'No one added yet') },
  { href: '/circle/reminders', label: 'Reminders', desc: 'Medicine, hydration, activity, appointments', icon: 'clock', color: '#7dd3fc', stat: (c) => (c.remindersTotal ? `${c.remindersTotal} set${c.remindersOverdue ? ` · ${c.remindersOverdue} overdue` : ''}` : 'None set yet') },
  { href: '/circle/board', label: 'Circle Board', desc: 'Activity levels, freshness, who is carrying this', icon: 'chart', color: '#f9a8d4', stat: (c) => (c.trials ? `${c.trials} session${c.trials === 1 ? '' : 's'} recorded` : 'No sessions yet') },
  { href: '/circle/handoff', label: 'Handoff', desc: 'Send configuration to another device', icon: 'skip', color: '#93c5fd', stat: (c) => (c.handoffsPending ? `${c.handoffsPending} pending` : null) },
  { href: '/circle/legacy', label: 'Voice Legacy', desc: "The family's own recordings, permanently", icon: 'mic', color: '#fda4af', stat: () => null },
  { href: '/inspector', label: 'Evidence Inspector', desc: 'Jury view — how the model decides, in plain words', icon: 'sparkle', color: '#5eead4', stat: () => 'Open the model’s reasoning', wide: true },
];

export default function CircleHome() {
  const [counts, setCounts] = useState<CircleCounts | null>(null);

  useEffect(() => {
    (async () => {
      const id = await getActivePersonId();
      if (!id) return;
      const [person, packs, members, reminders, trials, handoffs] = await Promise.all([
        getPerson(id),
        packsForPerson(id),
        membersForPerson(id),
        remindersForPerson(id),
        db.trials.where({ person_id: id }).count(),
        db.handoffs.where({ person_id: id }).toArray(),
      ]);
      setCounts({
        personName: person?.display_name ?? null,
        packsApproved: packs.filter((p) => p.state === 'approved').length,
        packsTotal: packs.length,
        members: members.length,
        remindersTotal: reminders.length,
        remindersOverdue: reminders.filter(isOverdue).length,
        trials,
        handoffsPending: handoffs.filter((h) => h.state !== 'accepted').length,
      });
    })();
  }, []);

  return (
    <main className="h-[100dvh] flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 pt-6 pb-8 flex flex-col gap-6">
          <header className="rise">
            <BackButton href="/" label="Back" />
          </header>
          <div className="flex flex-col gap-3 rise rise-1">
            <span className="eyebrow self-start">
              <Icon name="people" size={14} /> For family & health workers
            </span>
            <h1 className="title-xl">Circle</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LINKS.map((l, i) => {
              const stat = counts ? l.stat(counts) : null;
              return (
                <Link key={l.href} href={l.href} className={`shell hover-lift rise rise-${Math.min(i + 2, 6)} ${l.wide ? 'sm:col-span-2' : ''}`}>
                  <span
                    className="core p-5 flex flex-col gap-3 h-full"
                    style={{ background: `radial-gradient(100% 120% at 100% 0%, color-mix(in srgb, ${l.color} 12%, transparent), transparent 60%), linear-gradient(180deg, var(--surface-2), var(--surface))` }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 52, height: 52, color: l.color, background: `color-mix(in srgb, ${l.color} 14%, transparent)`, border: `1.5px solid color-mix(in srgb, ${l.color} 35%, transparent)` }}>
                        <Icon name={l.icon} size={26} />
                      </span>
                      <span style={{ fontSize: 23 }} className="font-extrabold flex-1">
                        {l.label}
                      </span>
                      <span className="muted">
                        <Icon name="arrow" size={24} />
                      </span>
                    </span>
                    <span style={{ fontSize: 17 }} className="muted">
                      {l.desc}
                    </span>
                    {stat && (
                      <span style={{ fontSize: 16, color: l.color, borderTop: '1px solid var(--hairline)' }} className="font-bold pt-3 mt-auto">
                        {stat}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>

          <section className="panel p-5 flex gap-4 items-start">
            <span style={{ color: 'var(--accent)' }}>
              <Icon name="shield" size={30} />
            </span>
            <div className="flex flex-col gap-1">
              <span style={{ fontSize: 19 }} className="font-extrabold">
                Data & privacy
              </span>
              <span style={{ fontSize: 16 }} className="muted">
                Names, care-plan text, photos and recordings are AES-256 encrypted at rest on this device. Nothing syncs unless a backend is
                configured for the deployment (it is not in this demo build) — and even then only coded gameplay data, never identifying
                fields. Consent is recorded per person in the profile screen, not inferred.
              </span>
            </div>
          </section>
        </div>
      </div>
      <BottomNav lang="en" backHref="/" backLabel="Back" />
    </main>
  );
}
