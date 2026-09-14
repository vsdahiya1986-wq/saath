'use client';
import { useEffect, useState } from 'react';
import { getActivePersonId } from '@/lib/usePerson';
import { packsForPerson, putPack } from '@/lib/db';
import { createHelpRequest, transition } from '@/lib/events';
import { setForcedOffline, isForcedOffline, syncTrials } from '@/lib/sync';
import BackButton from '@/components/ui/BackButton';
import Icon, { IconName } from '@/components/ui/Icon';

interface LogLine {
  at: string;
  text: string;
}

export default function FailureTheatre() {
  const [personId, setPersonId] = useState<string | null>(null);
  const [offline, setOffline] = useState(isForcedOffline);
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
      push('No is_current_location pack exists yet — add one in the Memory Garden first.');
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
    push(`Help request ${item.id.slice(0, 8)} is now "submission_unknown" — we genuinely do not know if it arrived. It will never silently become "resolved".`);
  }

  async function simulateDuplicateSync() {
    const first = await syncTrials();
    const second = await syncTrials();
    push(`Sync #1: pushed ${first.pushed}, skipped ${first.skipped}${first.reason ? ` (${first.reason})` : ''}.`);
    push(`Sync #2 (immediately after): pushed ${second.pushed}, skipped ${second.skipped}${second.reason ? ` (${second.reason})` : ''}. No duplicate rows.`);
  }

  const actions: { label: string; desc: string; icon: IconName; run: () => void; active?: boolean }[] = [
    { label: offline ? 'Go back online' : 'Go offline', desc: 'Sync refuses honestly instead of pretending.', icon: 'shield', run: toggleOffline, active: offline },
    { label: 'Expire a location pack', desc: 'Out-of-date places get flagged, never asserted.', icon: 'clock', run: expirePack },
    { label: 'Lose a provider response', desc: 'Unknown delivery stays unknown — never "resolved".', icon: 'warning', run: simulateLostResponse },
    { label: 'Duplicate sync', desc: 'Idempotent: the second run creates no duplicates.', icon: 'refresh', run: simulateDuplicateSync },
  ];

  return (
    <main className="min-h-[100dvh]">
      <div className="max-w-4xl mx-auto px-5 pt-6 pb-16 flex flex-col gap-8">
        <header className="rise">
          <BackButton href="/inspector" label="Back to Evidence Inspector" />
        </header>
        <section className="flex flex-col gap-3 rise rise-1">
          <span className="eyebrow self-start" style={{ color: 'var(--warn)', background: 'var(--accent-warm-soft)' }}>
            <Icon name="warning" size={14} /> Demo mode
          </span>
          <h1 className="title-xl">Failure Theatre</h1>
          <p style={{ fontSize: 19 }} className="muted">
            Every button demonstrates honest failure handling, on demand.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((a, i) => (
            <button key={a.label} onClick={a.run} className={`shell hover-lift text-left rise rise-${i + 2}`}>
              <span className="core p-5 flex items-start gap-4" style={{ borderColor: a.active ? 'var(--warn)' : undefined }}>
                <span style={{ color: a.active ? 'var(--warn)' : 'var(--accent)' }}>
                  <Icon name={a.icon} size={32} />
                </span>
                <span className="flex flex-col gap-1">
                  <span style={{ fontSize: 21 }} className="font-extrabold">
                    {a.label}
                  </span>
                  <span style={{ fontSize: 16 }} className="muted">
                    {a.desc}
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>

        <section className="panel p-5 flex flex-col gap-3 min-h-[220px]">
          <h2 style={{ fontSize: 20 }} className="font-extrabold">
            Live log
          </h2>
          {log.map((l, i) => (
            <p key={i} style={{ fontSize: 16 }} className="rise">
              <span className="muted tabular-nums">{l.at}</span> — {l.text}
            </p>
          ))}
          {!log.length && (
            <p style={{ fontSize: 16 }} className="muted">
              Nothing yet. Press a button above.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
