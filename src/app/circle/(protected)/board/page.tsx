'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getActivePersonId } from '@/lib/usePerson';
import { computeLedger, EngagementLedger } from '@/lib/engagement';
import { conditionTrends, ConditionSeries } from '@/lib/analytics';
import { burdenReport, pickOnCall, BurdenRow, OnCall } from '@/lib/rotation';
import { db, FollowupItem } from '@/lib/db';

export default function CircleBoard() {
  const [personId, setPersonId] = useState<string | null>(null);
  const [ledger, setLedger] = useState<EngagementLedger | null>(null);
  const [trends, setTrends] = useState<ConditionSeries[]>([]);
  const [burden, setBurden] = useState<BurdenRow[]>([]);
  const [onCall, setOnCall] = useState<OnCall | null>(null);
  const [pendingHandoffs, setPendingHandoffs] = useState<FollowupItem[]>([]);

  useEffect(() => {
    getActivePersonId().then(async (id) => {
      setPersonId(id);
      if (!id) return;
      setLedger(await computeLedger(id));
      setTrends(await conditionTrends(id));
      setBurden(await burdenReport(id));
      setOnCall(await pickOnCall(id));
      setPendingHandoffs(await db.followups.where({ person_id: id }).toArray());
    });
  }, []);

  if (!personId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center bg-[var(--bg)]">
        <p>Set up a person profile first.</p>
      </main>
    );
  }

  const openFollowups = pendingHandoffs.filter((f) => !['resolved', 'cancelled', 'expired'].includes(f.state));

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-6 max-w-lg mx-auto">
      <h1 style={{ fontSize: 26 }} className="font-black text-[var(--text)]">
        Circle Board
      </h1>
      <p style={{ fontSize: 13 }} className="text-[var(--text-muted)] -mt-3">
        These are activity observations under stated conditions. They are not a clinical measure.
      </p>

      <section style={cardStyle}>
        <h2 style={h2Style}>Engagement</h2>
        {ledger && ledger.activityLevel !== 'no_data' ? (
          <>
            <p style={{ fontSize: 16 }}>
              {ACTIVITY_LEVEL_LABEL[ledger.activityLevel]} — {ledger.sessionsThisWeek} session(s) this week, across{' '}
              {ledger.distinctActivityFamilies} activity type(s), {ledger.weeksWithAnyParticipation} of the last 12 weeks.
            </p>
            <p style={{ fontSize: 12 }} className="text-[var(--text-muted)] mt-1">
              Last participation: {new Date(ledger.lastParticipation!).toLocaleString()} · Data fresh as of:{' '}
              {ledger.dataFreshAsOf ? new Date(ledger.dataFreshAsOf).toLocaleString() : 'never synced'}
            </p>
          </>
        ) : (
          <p style={{ fontSize: 16 }} className="text-[var(--text-muted)]">
            No data received yet.
          </p>
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>Who is carrying this</h2>
        {burden.length ? (
          <div className="flex flex-col gap-2">
            {burden.map((b) => (
              <div key={b.name} className="flex items-center gap-2">
                <span style={{ fontSize: 14, width: 90 }} className="truncate">
                  {b.name}
                </span>
                <div style={{ flex: 1, height: 14, background: '#eee', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${b.share}%`, height: '100%', background: b.share > 50 ? 'var(--warn)' : 'var(--accent)' }} />
                </div>
                <span style={{ fontSize: 13, width: 40, textAlign: 'right' }}>{b.share}%</span>
              </div>
            ))}
            <p style={{ fontSize: 13 }} className="text-[var(--text-muted)] mt-1">
              On call today: {onCall?.name ?? 'nobody available'}
              {burden[0]?.share > 50 ? ` — ${burden[0].name} has handled most requests. Consider rebalancing.` : ''}
            </p>
          </div>
        ) : (
          <p style={{ fontSize: 14 }} className="text-[var(--text-muted)]">
            No circle members with load data yet.
          </p>
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>Pending handoffs</h2>
        {openFollowups.length ? (
          openFollowups.map((f) => (
            <div key={f.id} style={{ fontSize: 14 }} className="flex justify-between">
              <span>{f.origin === 'help_request' ? 'Help request' : 'Missed check-in'}</span>
              <span className="text-[var(--text-muted)]">{f.state.replace(/_/g, ' ')}</span>
            </div>
          ))
        ) : (
          <p style={{ fontSize: 14 }} className="text-[var(--text-muted)]">
            Nothing pending.
          </p>
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>Trend analytics</h2>
        {trends.length ? (
          <div className="flex flex-col gap-3">
            {trends.map((s, i) => (
              <div key={i}>
                <p style={{ fontSize: 13 }} className="font-black">
                  {s.activity} · difficulty {s.difficulty} · {s.cue} cue
                </p>
                {s.interpretable ? (
                  <div className="flex items-end gap-1 h-16 mt-1">
                    {s.points.map((p, j) => (
                      <div
                        key={j}
                        title={`${p.weekStart}: n=${p.n}`}
                        style={{
                          width: 14,
                          height: p.supportedCompletionRate != null ? `${Math.max(6, p.supportedCompletionRate * 60)}px` : '4px',
                          background: p.supportedCompletionRate != null ? 'var(--accent)' : '#ddd',
                          borderRadius: 2,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ background: '#f3f4f6', borderRadius: 8, padding: 10 }}>
                    <p style={{ fontSize: 12 }} className="text-[var(--text-muted)]">
                      {s.note}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 14 }} className="text-[var(--text-muted)]">
            No comparable trial data yet.
          </p>
        )}
      </section>

      <Link href="/circle" style={{ fontSize: 14, color: 'var(--text-muted)' }} className="underline text-center">
        Back to Circle
      </Link>
    </main>
  );
}

const ACTIVITY_LEVEL_LABEL: Record<string, string> = {
  low: 'Low participation',
  steady: 'Steady participation',
  high: 'High participation',
};

const cardStyle = { border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', padding: 16 } as const;
const h2Style = { fontSize: 17, fontWeight: 900, marginBottom: 8 } as const;
