'use client';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { getActivePersonId } from '@/lib/usePerson';
import { db, Handoff, CircleMember, membersForPerson, packsForPerson } from '@/lib/db';
import BackButton from '@/components/ui/BackButton';

export default function HandoffScreen() {
  const [personId, setPersonId] = useState<string | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  async function refresh(id: string) {
    setMembers(await membersForPerson(id));
    setHandoffs(await db.handoffs.where({ person_id: id }).toArray());
  }

  useEffect(() => {
    getActivePersonId().then((id) => {
      setPersonId(id);
      if (id) refresh(id);
    });
  }, []);

  async function send() {
    if (!personId || !from || !to) return;
    const packs = await packsForPerson(personId);
    const versions: Record<string, number> = {};
    for (const p of packs) versions[p.id] = p.version;

    const h: Handoff = {
      id: uuid(),
      person_id: personId,
      from_member: from,
      to_member: to,
      pack_versions: versions,
      state: 'sent',
      sent_at: new Date().toISOString(),
    };
    await db.handoffs.put(h);
    await refresh(personId);
  }

  async function markReceived(h: Handoff) {
    await db.handoffs.put({ ...h, state: 'received', received_at: new Date().toISOString() });
    if (personId) await refresh(personId);
  }

  async function markAccepted(h: Handoff) {
    await db.handoffs.put({ ...h, state: 'accepted', accepted_at: new Date().toISOString() });
    if (personId) await refresh(personId);
  }

  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? id;

  if (!personId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center bg-[var(--bg)]">
        <p>Set up a person profile first.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-6 max-w-lg mx-auto">
      <header className="flex items-center gap-3">
        <BackButton href="/circle" label="Back to Circle" />
        <h1 style={{ fontSize: 26 }} className="font-black text-[var(--text)]">
          Handoff
        </h1>
      </header>
      <p style={{ fontSize: 13 }} className="text-[var(--text-muted)] -mt-3">
        A snapshot of current pack versions, sent from one worker to another, always with an explicit accept step.
      </p>

      <section style={cardStyle} className="flex flex-col gap-3">
        <h2 style={h2Style}>Send configuration</h2>
        <select value={from} onChange={(e) => setFrom(e.target.value)} style={inputStyle}>
          <option value="">From…</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <select value={to} onChange={(e) => setTo(e.target.value)} style={inputStyle}>
          <option value="">To…</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <button onClick={send} disabled={!from || !to} style={{ minHeight: 60, background: 'var(--accent)', borderRadius: 'var(--radius)' }} className="text-[var(--on-accent)] font-black disabled:opacity-40">
          Send
        </button>
      </section>

      <section className="flex flex-col gap-2">
        <h2 style={h2Style}>History</h2>
        {handoffs
          .sort((a, b) => b.sent_at.localeCompare(a.sent_at))
          .map((h) => (
            <div key={h.id} style={cardStyle} className="flex items-center gap-3">
              <div className="flex-1">
                <div style={{ fontSize: 15 }} className="font-black">
                  {nameOf(h.from_member)} → {nameOf(h.to_member)}
                </div>
                <div style={{ fontSize: 12 }} className="text-[var(--text-muted)]">
                  {Object.keys(h.pack_versions).length} pack(s) · sent {new Date(h.sent_at).toLocaleString()}
                </div>
              </div>
              <span
                style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, border: 'var(--border-w) solid var(--border)' }}
                className="capitalize"
              >
                {h.state}
              </span>
              {h.state === 'sent' && (
                <button onClick={() => markReceived(h)} style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', minHeight: 60, padding: '0 14px' }}>
                  Mark received
                </button>
              )}
              {h.state === 'received' && (
                <button onClick={() => markAccepted(h)} style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', minHeight: 60, padding: '0 14px' }}>
                  Accept
                </button>
              )}
            </div>
          ))}
        {!handoffs.length && <p style={{ fontSize: 14 }} className="text-[var(--text-muted)]">No handoffs yet.</p>}
      </section>
    </main>
  );
}

const cardStyle = { background: 'var(--surface)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius)', padding: 16 } as const;
const inputStyle = { border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', minHeight: 60, padding: '0 12px', fontSize: 16 } as const;
const h2Style = { fontSize: 17, fontWeight: 900 } as const;
