'use client';
import { useEffect, useState } from 'react';
import { getActivePersonId } from '@/lib/usePerson';
import { getPerson, db, Person, Activity, Difficulty, TrialEvent, packsForPerson, ContentPack } from '@/lib/db';
import { decide, Decision } from '@/lib/model';
import Link from 'next/link';

const ACTIVITIES: Activity[] = ['familiar_pairs', 'sound_sight', 'pattern_garden', 'my_next_step', 'together'];

export default function EvidenceInspector() {
  const [person, setPerson] = useState<Person | null>(null);
  const [activity, setActivity] = useState<Activity>('familiar_pairs');
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [includeSynthetic, setIncludeSynthetic] = useState(false);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [recent, setRecent] = useState<TrialEvent[]>([]);
  const [packs, setPacks] = useState<ContentPack[]>([]);

  useEffect(() => {
    getActivePersonId().then(async (id) => {
      if (!id) return;
      const p = await getPerson(id);
      setPerson(p ?? null);
      setPacks(await packsForPerson(id));
    });
  }, []);

  useEffect(() => {
    if (!person) return;
    (async () => {
      const d = await decide({
        personId: person.id,
        activity,
        difficulty,
        allowedCues: person.care_config.allowed_cues,
        maxDifficulty: person.care_config.max_difficulty,
        includeSynthetic,
      });
      setDecision(d);
      const all = await db.trials.where({ person_id: person.id, activity }).toArray();
      setRecent(all.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 15));
    })();
  }, [person, activity, difficulty, includeSynthetic]);

  if (!person) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center bg-[var(--bg)]">
        <p>Set up a person profile first.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-5 max-w-2xl mx-auto">
      <h1 style={{ fontSize: 26 }} className="font-black text-[var(--text)]">
        Evidence Inspector
      </h1>
      <p style={{ fontSize: 13 }} className="text-[var(--text-muted)] -mt-3">
        Jury view — the model&apos;s own reasoning, not a marketing screen.
      </p>

      <div className="flex gap-3">
        <select value={activity} onChange={(e) => setActivity(e.target.value as Activity)} style={inputStyle}>
          {ACTIVITIES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value) as Difficulty)} style={inputStyle}>
          {[1, 2, 3, 4].map((d) => (
            <option key={d} value={d}>
              difficulty {d}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2" style={{ fontSize: 13 }}>
          <input type="checkbox" checked={includeSynthetic} onChange={(e) => setIncludeSynthetic(e.target.checked)} />
          include synthetic (demo only)
        </label>
      </div>

      {decision && (
        <section style={cardStyle} className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span
              style={{
                fontSize: 13,
                fontWeight: 900,
                padding: '3px 10px',
                borderRadius: 20,
                border: `var(--border-w) solid ${decision.mode === 'learned' ? 'var(--accent)' : 'var(--border)'}`,
                color: decision.mode === 'learned' ? 'var(--accent)' : 'var(--text)',
              }}
            >
              {decision.mode.toUpperCase()}
            </span>
            <span style={{ fontSize: 12 }} className="text-[var(--text-muted)]">
              model {decision.modelVersion}
            </span>
          </div>
          <p style={{ fontSize: 15 }}>{decision.reason}</p>
          <p style={{ fontSize: 14 }}>
            Chosen cue: <b>{decision.chosenCue}</b> · Chosen difficulty: <b>{decision.chosenDifficulty}</b> · Baseline cue:{' '}
            <b>{decision.baselineCue}</b> ·{' '}
            <span style={{ color: decision.changedFromBaseline ? 'var(--accent)' : 'var(--text-muted)' }}>
              {decision.changedFromBaseline ? 'CHANGED from baseline' : 'unchanged from baseline'}
            </span>
          </p>

          <table style={{ fontSize: 13, width: '100%' }} className="mt-2">
            <thead>
              <tr className="text-left text-[var(--text-muted)]">
                <th>cue</th>
                <th>n</th>
                <th>completions</th>
                <th>posterior mean</th>
                <th>supported</th>
              </tr>
            </thead>
            <tbody>
              {decision.ranking.map((r) => (
                <tr key={r.cue}>
                  <td>{r.cue}</td>
                  <td>{r.n}</td>
                  <td>{r.completions}</td>
                  <td>{r.posteriorMean.toFixed(3)}</td>
                  <td>{r.supported ? 'yes' : 'no'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <details className="mt-2">
            <summary style={{ fontSize: 12 }} className="text-[var(--text-muted)] cursor-pointer">
              Predeclared config (engineering, not clinical cutoffs)
            </summary>
            <pre style={{ fontSize: 11, overflowX: 'auto' }}>{JSON.stringify(decision.config, null, 2)}</pre>
          </details>
        </section>
      )}

      <section style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Event lifecycle timeline</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ fontSize: 12, width: '100%' }}>
            <thead>
              <tr className="text-left text-[var(--text-muted)]">
                <th>when</th>
                <th>difficulty</th>
                <th>cue</th>
                <th>outcome</th>
                <th>mode</th>
                <th>synthetic</th>
                <th>synced</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.created_at).toLocaleString()}</td>
                  <td>{t.difficulty}</td>
                  <td>{t.cue}</td>
                  <td>{t.outcome}</td>
                  <td>{t.policy_mode}</td>
                  <td>{t.synthetic ? 'SYNTHETIC' : 'real'}</td>
                  <td>{t.synced_at ? 'yes' : 'no'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!recent.length && <p className="text-[var(--text-muted)] mt-2">No trials logged yet for this activity.</p>}
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Pack versions</h2>
        {packs.map((p) => (
          <div key={p.id} style={{ fontSize: 13 }} className="flex justify-between">
            <span>{p.id.slice(0, 8)}…</span>
            <span>
              v{p.version} · {p.state}
            </span>
          </div>
        ))}
      </section>

      <div className="flex gap-4 justify-center">
        <Link href="/inspector/cst" className="underline" style={{ fontSize: 14 }}>
          CST Protocol Map
        </Link>
        <Link href="/inspector/theatre" className="underline" style={{ fontSize: 14 }}>
          Failure Theatre
        </Link>
        <Link href="/circle" className="underline" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Back to Circle
        </Link>
      </div>
    </main>
  );
}

const cardStyle = { border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', padding: 16 } as const;
const inputStyle = { border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', minHeight: 44, padding: '0 10px', fontSize: 14 } as const;
