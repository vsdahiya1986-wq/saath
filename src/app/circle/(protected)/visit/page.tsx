'use client';
import { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import { CHIP_LABEL } from '@/components/circle/CareNoteCard';
import { getActivePersonId } from '@/lib/usePerson';
import { careNotesForPerson, CareNote, db, getPerson, Nudge, Person } from '@/lib/db';
import { nudgesForPerson, nudgeText, refreshNudges } from '@/lib/nudges';
import { evidenceTrials } from '@/lib/trends';
import { activityInfo } from '@/content/activities';
import { t } from '@/lib/i18n';

const DAYS = 30;
const VISIT_FOOTER = 'SAATH is a cognitive-stimulation and care-coordination aid. It does not diagnose or assess dementia.';

interface Card {
  person: Person;
  from: Date;
  to: Date;
  completed: number;
  adherence: { done: number; total: number };
  domains: string[];
  notes: CareNote[];
  nudges: Nudge[];
}

const fmt = (d: Date | string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Visit Card (F11): one printable page for the doctor or ASHA. `window.print()`, no library. */
export default function VisitCard() {
  const [card, setCard] = useState<Card | null>(null);

  useEffect(() => {
    (async () => {
      const id = await getActivePersonId();
      const person = id ? await getPerson(id) : undefined;
      if (!person) return;
      await refreshNudges(person);
      const to = new Date();
      const from = new Date(to.getTime() - DAYS * 864e5);
      const since = from.toISOString();
      const [trials, logs, notes, nudges] = await Promise.all([
        db.trials.where({ person_id: person.id }).toArray(),
        db.reminder_logs.where({ person_id: person.id }).toArray(),
        careNotesForPerson(person.id),
        nudgesForPerson(person.id),
      ]);
      const done = evidenceTrials(person, trials).filter((x) => x.outcome === 'completed' && x.created_at >= since);
      const recentLogs = logs.filter((l) => l.due_at >= since);
      setCard({
        person,
        from,
        to,
        completed: done.length,
        adherence: { done: recentLogs.filter((l) => l.outcome === 'done').length, total: recentLogs.length },
        domains: [...new Set(done.map((x) => activityInfo(x.activity)?.domainKey).filter((k): k is string => !!k))].map((k) => t(k)),
        notes: notes.slice(0, 5),
        nudges: nudges.filter((n) => n.state === 'open'),
      });
    })();
  }, []);

  if (!card) return null;
  const { person } = card;
  const firstName = person.display_name.split(/[\s(]/)[0];
  const row = 'flex justify-between gap-4 py-2';

  return (
    <main className="visit-card w-full max-w-3xl mx-auto px-5 pt-2 pb-10 flex flex-col gap-4" style={{ fontSize: 18, color: 'var(--text)' }} data-testid="visit-card">
      <div className="no-print flex flex-wrap items-center gap-3">
        <BackButton href="/circle" label="Back to Circle" />
        <button onClick={() => window.print()} className="btn btn-primary">
          Print
        </button>
      </div>

      <header style={{ borderBottom: '2px solid currentColor', paddingBottom: 8 }}>
        <h1 style={{ fontSize: 30 }} className="font-extrabold">
          Visit Card · {firstName}
          {person.age_band ? `, ${person.age_band}` : ''}
        </h1>
        <p>
          {fmt(card.from)} – {fmt(card.to)}
          {person.is_sample ? ' · SAMPLE DATA' : ''}
        </p>
      </header>

      <section>
        <div className={row}>
          <span>Sessions completed</span>
          <strong>{card.completed}</strong>
        </div>
        <div className={row}>
          <span>Reminders marked done</span>
          <strong>{card.adherence.total ? `${card.adherence.done} of ${card.adherence.total}` : 'No reminders due'}</strong>
        </div>
        <div className={row}>
          <span>Areas practised</span>
          <strong className="text-right">{card.domains.join(', ') || 'None yet'}</strong>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 22 }} className="font-extrabold">
          Open nudges
        </h2>
        {card.nudges.length ? (
          <ul className="list-disc pl-6">
            {card.nudges.map((n) => (
              <li key={n.id}>
                {fmt(n.created_at)}: {nudgeText(n, firstName)}
              </li>
            ))}
          </ul>
        ) : (
          <p>None.</p>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: 22 }} className="font-extrabold">
          Recent care notes
        </h2>
        {card.notes.length ? (
          <ul className="list-disc pl-6">
            {card.notes.map((n) => (
              <li key={n.id}>
                {fmt(n.created_at)} · {n.chips.map((c) => CHIP_LABEL[c]).join(', ')}
                {n.text ? ` — ${n.text}` : ''} ({n.by})
              </li>
            ))}
          </ul>
        ) : (
          <p>None.</p>
        )}
      </section>

      <footer style={{ borderTop: '2px solid currentColor', paddingTop: 8, fontSize: 16 }} data-testid="visit-footer">
        {VISIT_FOOTER}
      </footer>
    </main>
  );
}
