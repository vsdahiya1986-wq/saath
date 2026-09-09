'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getActivePersonId } from '@/lib/usePerson';
import { packsForPerson, putPack } from '@/lib/db';
import { createHelpRequest, transition } from '@/lib/events';
import { setForcedOffline, isForcedOffline, syncTrials } from '@/lib/sync';

interface LogLine {
  at: string;
  text: string;
}

export default function FailureTheatre() {
  const [personId, setPersonId] = useState<string | null>(null);
  const [offline, setOffline] = useState(isForcedOffline());
  const [log, setLog] = useState<LogLine[]>([]);

  useEffect(() => {
    getActivePersonId().then(setPersonId);
  }, []);

  function push(text: string) {
    setLog((l) => [{ at: new Date().toLocaleTimeString(), text }, ...l]);
  }

  function toggleOffline() {
    const next = !offline;
    setForcedOffline(next);
    setOffline(next);
    push(next ? 'Simulated offline: ON — sync.ts now refuses to sync and says why.' : 'Simulated offline: OFF.');
  }

  async function expirePack() {
    if (!personId) return;
    const packs = await packsForPerson(personId, 'approved');
    const stale = packs.find((p) => p.is_current_location);
    if (!stale) {
      push('No is_current_location pack exists yet — create one in Pack Studio first.');
      return;
    }
    await putPack({ ...stale, state: 'stale', review_by: new Date(Date.now() - 864e5).toISOString() });
    push(`Expired "${stale.title}" — Help screen will now withhold/flag it instead of asserting it is current.`);
  }

  async function simulateLostResponse() {
    if (!personId) return;
    const item = await createHelpRequest(personId);
    await transition(item.id, 'eligible');
    await transition(item.id, 'submitting');
    await transition(item.id, 'submission_unknown');
    push(
      `Help request ${item.id.slice(0, 8)} is now "submission_unknown" — we genuinely do not know if it arrived. It will never silently become "resolved".`
    );
  }

  async function simulateDuplicateSync() {
    const first = await syncTrials();
    const second = await syncTrials();
    push(`Sync #1: pushed ${first.pushed}, skipped ${first.skipped}${first.reason ? ` (${first.reason})` : ''}.`);
    push(`Sync #2 (immediately after): pushed ${second.pushed}, skipped ${second.skipped}${second.reason ? ` (${second.reason})` : ''}. No duplicate rows.`);
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-5 max-w-2xl mx-auto">
      <h1 style={{ fontSize: 26 }} className="font-black text-[var(--text)]">
        Failure Theatre
      </h1>
      <p style={{ fontSize: 14 }} className="text-[var(--text-muted)] -mt-3">
        Demo-mode only. Every button here demonstrates honest failure handling, on demand.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={toggleOffline} style={btnStyle}>
          {offline ? 'Go back online' : 'Go offline'}
        </button>
        <button onClick={expirePack} style={btnStyle}>
          Expire a location pack
        </button>
        <button onClick={simulateLostResponse} style={btnStyle}>
          Simulate lost provider response
        </button>
        <button onClick={simulateDuplicateSync} style={btnStyle}>
          Simulate duplicate sync
        </button>
      </div>

      <section style={cardStyle} className="flex flex-col gap-2 min-h-[200px]">
        <h2 style={{ fontSize: 15, fontWeight: 900 }}>Log</h2>
        {log.map((l, i) => (
          <p key={i} style={{ fontSize: 13 }}>
            <span className="text-[var(--text-muted)]">{l.at}</span> — {l.text}
          </p>
        ))}
        {!log.length && <p style={{ fontSize: 13 }} className="text-[var(--text-muted)]">Nothing yet. Press a button above.</p>}
      </section>

      <Link href="/inspector" className="underline text-center" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
        Back to Evidence Inspector
      </Link>
    </main>
  );
}

const cardStyle = { border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', padding: 16 } as const;
const btnStyle = { minHeight: 64, border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 700, padding: '0 10px' } as const;
