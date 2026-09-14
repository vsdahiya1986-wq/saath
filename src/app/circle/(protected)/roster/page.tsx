'use client';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { getActivePersonId } from '@/lib/usePerson';
import { CircleMember, putMember, membersForPerson, db } from '@/lib/db';
import BackButton from '@/components/ui/BackButton';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Roster() {
  const [personId, setPersonId] = useState<string | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState<CircleMember['role']>('family');
  const [phone, setPhone] = useState('');
  const [lanUrl, setLanUrl] = useState('');
  const [days, setDays] = useState<number[]>([]);

  async function refresh(id: string) {
    setMembers(await membersForPerson(id));
  }

  useEffect(() => {
    getActivePersonId().then((id) => {
      setPersonId(id);
      if (id) refresh(id);
    });
  }, []);

  function toggleDay(d: number) {
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  }

  async function addMember() {
    if (!personId || !name.trim()) return;
    const member: CircleMember = {
      id: uuid(),
      person_id: personId,
      name: name.trim(),
      role,
      phone: phone.trim() || undefined,
      consented: true,
      on_call_days: days,
      lan_url: lanUrl.trim() || undefined,
      load_count: 0,
    };
    await putMember(member);
    setName('');
    setPhone('');
    setLanUrl('');
    setDays([]);
    await refresh(personId);
  }

  async function removeMember(id: string) {
    await db.members.delete(id);
    if (personId) await refresh(personId);
  }

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
          Circle roster
        </h1>
      </header>

      <section style={cardStyle} className="flex flex-col gap-3">
        <h2 style={{ fontSize: 18 }} className="font-black">
          Add a member
        </h2>
        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 14 }}>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </label>
        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 14 }}>Role</span>
          <select value={role} onChange={(e) => setRole(e.target.value as CircleMember['role'])} style={inputStyle}>
            <option value="family">Family</option>
            <option value="neighbour">Neighbour</option>
            <option value="volunteer">Volunteer</option>
            <option value="asha">ASHA worker</option>
            <option value="worker">Trained worker</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 14 }}>Phone (optional)</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
        </label>
        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 14 }}>LAN device URL (for offline alerts, optional)</span>
          <input value={lanUrl} onChange={(e) => setLanUrl(e.target.value)} placeholder="http://192.168.1.42:3000" style={inputStyle} />
        </label>
        <div>
          <span style={{ fontSize: 14 }}>On-call days</span>
          <div className="flex gap-1 mt-1">
            {DAY_LABELS.map((d, i) => (
              <button
                key={d}
                onClick={() => toggleDay(i)}
                style={{
                  minWidth: 60,
                  minHeight: 60,
                  border: 'var(--border-w) solid var(--border)',
                  borderRadius: 8,
                  background: days.includes(i) ? 'var(--accent)' : 'transparent',
                  color: days.includes(i) ? 'var(--on-accent)' : 'var(--text)',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <button onClick={addMember} disabled={!name.trim()} style={{ minHeight: 60, background: 'var(--accent)', borderRadius: 'var(--radius)' }} className="text-[var(--on-accent)] font-black disabled:opacity-40">
          Add to circle
        </button>
      </section>

      <section className="flex flex-col gap-2">
        {members.map((m) => (
          <div key={m.id} style={cardStyle} className="flex items-center gap-3">
            <div className="flex-1">
              <div style={{ fontSize: 16 }} className="font-black">
                {m.name} <span style={{ fontSize: 12, fontWeight: 400 }}>· {m.role}</span>
              </div>
              <div style={{ fontSize: 12 }} className="text-[var(--text-muted)]">
                On call: {m.on_call_days.map((d) => DAY_LABELS[d]).join(', ') || 'none set'} · load {m.load_count}
              </div>
            </div>
            <button onClick={() => removeMember(m.id)} style={{ fontSize: 16, fontWeight: 700, color: 'var(--alert)', minHeight: 60, padding: '0 14px' }}>
              Remove
            </button>
          </div>
        ))}
        {!members.length && <p style={{ fontSize: 14 }} className="text-[var(--text-muted)]">No circle members yet.</p>}
      </section>
    </main>
  );
}

const cardStyle = { background: 'var(--surface)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius)', padding: 16 } as const;
const inputStyle = { border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', minHeight: 60, padding: '0 12px', fontSize: 16 } as const;
