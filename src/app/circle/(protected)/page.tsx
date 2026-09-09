import Link from 'next/link';

const LINKS: { href: string; label: string; desc: string }[] = [
  { href: '/circle/setup', label: 'Person profile', desc: 'Create or edit the person this device is for' },
  { href: '/circle/packs', label: 'Pack Studio', desc: 'Photos, prompts, routines — approve what plays' },
  { href: '/circle/roster', label: 'Circle roster', desc: 'Who is in the circle, on-call days' },
  { href: '/circle/reminders', label: 'Reminders', desc: 'Medicine, hydration, activity, appointments' },
  { href: '/circle/board', label: 'Circle Board', desc: 'Activity levels, freshness, who is carrying this' },
  { href: '/circle/handoff', label: 'Handoff', desc: 'Send configuration to another device' },
  { href: '/circle/legacy', label: 'Voice Legacy', desc: "The family's own recordings, permanently" },
  { href: '/inspector', label: 'Evidence Inspector', desc: 'Jury view — model reasoning, not a feature' },
];

export default function CircleHome() {
  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-4">
      <h1 style={{ fontSize: 'var(--text-title)' }} className="font-black text-[var(--text)]">
        Circle
      </h1>
      <div className="flex flex-col gap-3">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)' }}
            className="p-4 flex flex-col gap-1"
          >
            <span style={{ fontSize: 20 }} className="font-black text-[var(--text)]">
              {l.label}
            </span>
            <span style={{ fontSize: 14 }} className="text-[var(--text-muted)]">
              {l.desc}
            </span>
          </Link>
        ))}
      </div>
      <Link href="/" style={{ fontSize: 14, color: 'var(--text-muted)' }} className="underline mt-4 text-center">
        Back to person view
      </Link>
    </main>
  );
}
