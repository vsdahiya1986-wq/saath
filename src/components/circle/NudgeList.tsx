'use client';
import { useCallback, useEffect, useState } from 'react';
import { getPerson, Nudge, Person } from '@/lib/db';
import { acknowledgeNudge, addNudgeNote, nudgesForPerson, nudgeText, refreshNudges } from '@/lib/nudges';
import { OnCall, pickOnCall } from '@/lib/rotation';
import { MePicker, useCircleMe } from './CircleMe';

/**
 * Circle Nudges (F7): shown at the top of Circle and on Circle Board, newest
 * first. Each says what was observed, who is on call today, and offers
 * Acknowledge and Add note.
 */
export default function NudgeList({ personId }: { personId: string | null }) {
  const [person, setPerson] = useState<Person | null>(null);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [onCall, setOnCall] = useState<OnCall | null>(null);
  const [noting, setNoting] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const circle = useCircleMe(personId);

  const load = useCallback(async () => {
    if (!personId) return;
    const p = await getPerson(personId);
    if (!p) return;
    await refreshNudges(p);
    setPerson(p);
    setNudges((await nudgesForPerson(personId)).filter((n) => n.state !== 'resolved'));
    setOnCall(await pickOnCall(personId));
  }, [personId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (!person) return null;
  const firstName = person.display_name.split(/[\s(]/)[0];

  async function acknowledge(n: Nudge) {
    await acknowledgeNudge(n.id, circle.me || 'Circle');
    await load();
  }

  async function saveNote(n: Nudge) {
    if (draft.trim()) await addNudgeNote(n.id, draft.trim());
    setNoting(null);
    setDraft('');
    await load();
  }

  return (
    <section className="core col-span-2 p-5 flex flex-col gap-3" style={{ borderTop: '6px solid var(--accent-warm)' }} data-testid="circle-nudges">
      <h2 style={{ fontSize: 22 }} className="font-extrabold">
        Circle nudges
      </h2>
      {nudges.length === 0 ? (
        <p style={{ fontSize: 17 }} className="muted">
          Nothing needs a look right now.
        </p>
      ) : (
        <>
          <MePicker {...circle} />
          {nudges.map((n) => (
            <div key={n.id} data-testid="nudge" data-kind={n.kind} data-state={n.state} className="flex flex-col gap-2" style={{ borderTop: '1px solid var(--card-border)', paddingTop: 12 }}>
              <p style={{ fontSize: 19 }} className="font-bold">
                {nudgeText(n, firstName)}
              </p>
              <p style={{ fontSize: 15 }} className="muted">
                {new Date(n.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                {onCall && n.state === 'open' ? ` · On call today: ${onCall.name}` : ''}
                {n.state === 'acknowledged' ? ` · Seen by ${n.acknowledged_by}` : ''}
              </p>
              {n.note && <p style={{ fontSize: 16 }}>Note: {n.note}</p>}
              {noting === n.id ? (
                <div className="flex flex-wrap gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    aria-label="Note"
                    maxLength={140}
                    className="flex-1 min-w-0"
                    style={{ fontSize: 17, padding: '10px 12px', border: '2px solid var(--card-border)', borderRadius: 12, background: 'var(--surface)' }}
                  />
                  <button onClick={() => saveNote(n)} className="btn btn-primary">
                    Save note
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {n.state === 'open' && (
                    <button onClick={() => acknowledge(n)} className="btn btn-primary">
                      Acknowledge
                    </button>
                  )}
                  <button onClick={() => setNoting(n.id)} className="btn btn-ghost">
                    Add note
                  </button>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </section>
  );
}
