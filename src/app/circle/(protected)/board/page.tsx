'use client';
import { useEffect, useState } from 'react';
import { getActivePersonId } from '@/lib/usePerson';
import { computeLedger, EngagementLedger } from '@/lib/engagement';
import { conditionTrends, ConditionSeries } from '@/lib/analytics';
import { burdenReport, pickOnCall, BurdenRow, OnCall } from '@/lib/rotation';
import { careNotesForPerson, CareNote, db, FollowupItem, getPerson, Person, TrialEvent } from '@/lib/db';
import NudgeList from '@/components/circle/NudgeList';
import TrendLines from '@/components/circle/TrendLines';
import { CHIP_LABEL } from '@/components/circle/CareNoteCard';
import BackButton from '@/components/ui/BackButton';

type OverallTrend = 'improving' | 'stable' | 'declining' | 'insufficient';

/**
 * SIH26003 (f): "an at-a-glance status (improving/stable/declining) readable
 * in 3 seconds." Deliberately simple and stated as an engineering heuristic,
 * matching this page's own existing disclaimer — NOT a clinical read: for
 * each interpretable condition series (see src/lib/analytics.ts's own
 * refusal to blend across changed difficulty/cue), compare the first vs
 * last comparable weekly point and average those deltas. A small threshold
 * (8 percentage points) keeps single-week noise from reading as a trend.
 */
function overallTrend(trends: ConditionSeries[]): { trend: OverallTrend; basis: number } {
  const deltas: number[] = [];
  for (const s of trends) {
    if (!s.interpretable) continue;
    const pts = s.points.filter((p) => p.supportedCompletionRate != null);
    if (pts.length < 2) continue;
    deltas.push(pts[pts.length - 1].supportedCompletionRate! - pts[0].supportedCompletionRate!);
  }
  if (!deltas.length) return { trend: 'insufficient', basis: 0 };
  const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  if (avg > 0.08) return { trend: 'improving', basis: deltas.length };
  if (avg < -0.08) return { trend: 'declining', basis: deltas.length };
  return { trend: 'stable', basis: deltas.length };
}

const TREND_STYLE: Record<OverallTrend, { label: string; color: string; icon: string }> = {
  improving: { label: 'Improving', color: 'var(--ok)', icon: '▲' },
  stable: { label: 'Stable', color: 'var(--accent)', icon: '▬' },
  // F10 wording rule: describe, never conclude — no "decline" on screen.
  declining: { label: 'Worth a check-in', color: 'var(--accent-warm)', icon: '▼' },
  insufficient: { label: 'Not enough data yet', color: 'var(--text-muted)', icon: '—' },
};

export default function CircleBoard() {
  const [personId, setPersonId] = useState<string | null>(null);
  const [ledger, setLedger] = useState<EngagementLedger | null>(null);
  const [trends, setTrends] = useState<ConditionSeries[]>([]);
  const [burden, setBurden] = useState<BurdenRow[]>([]);
  const [onCall, setOnCall] = useState<OnCall | null>(null);
  // R2: this section was labelled "Pending handoffs" but has always read
  // db.followups — help requests and missed check-ins, which are a real
  // caregiver signal (clause f). Renamed rather than deleted with Handoff.
  const [followups, setFollowups] = useState<FollowupItem[]>([]);
  const [person, setPerson] = useState<Person | null>(null);
  const [trials, setTrials] = useState<TrialEvent[]>([]);
  const [notes, setNotes] = useState<CareNote[]>([]);

  useEffect(() => {
    getActivePersonId().then(async (id) => {
      setPersonId(id);
      if (!id) return;
      setLedger(await computeLedger(id));
      setTrends(await conditionTrends(id));
      setBurden(await burdenReport(id));
      setOnCall(await pickOnCall(id));
      setFollowups(await db.followups.where({ person_id: id }).toArray());
      setPerson((await getPerson(id)) ?? null);
      setTrials(await db.trials.where({ person_id: id }).toArray());
      setNotes(await careNotesForPerson(id));
    });
  }, []);

  if (!personId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center bg-[var(--bg)]">
        <p>Set up a person profile first.</p>
      </main>
    );
  }

  const openFollowups = followups.filter((f) => !['resolved', 'cancelled', 'expired'].includes(f.state));
  const { trend, basis } = overallTrend(trends);
  const trendStyle = TREND_STYLE[trend];

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-6 max-w-lg mx-auto">
      <header className="flex items-center gap-3">
        <BackButton href="/circle" label="Back to Circle" />
        <h1 style={{ fontSize: 26 }} className="font-black text-[var(--text)]">
          Circle Board
        </h1>
      </header>
      <p style={{ fontSize: 13 }} className="text-[var(--text-muted)] -mt-3">
        These are activity observations under stated conditions. They are not a clinical measure.
      </p>

      <NudgeList personId={personId} />

      <section
        data-testid="overall-trend"
        style={{ border: `var(--border-w) solid ${trendStyle.color}`, borderRadius: 'var(--radius)', padding: 16, background: trend === 'improving' ? 'var(--ok-soft)' : 'var(--surface)' }}
        className="flex items-center gap-4"
      >
        <span style={{ fontSize: 36, color: trendStyle.color, lineHeight: 1 }} aria-hidden="true">
          {trendStyle.icon}
        </span>
        <div>
          <p style={{ fontSize: 20, color: trendStyle.color }} className="font-black">
            {trendStyle.label}
          </p>
          <p style={{ fontSize: 12 }} className="text-[var(--text-muted)]">
            {trend === 'insufficient'
              ? 'Needs at least 3 comparable weeks under one unchanged activity/difficulty/assistance condition.'
              : `Based on ${basis} comparable condition series over the trend window below.`}
          </p>
        </div>
      </section>

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
                <div style={{ flex: 1, height: 14, background: 'var(--surface-3)', borderRadius: 6, overflow: 'hidden' }}>
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
        <h2 style={h2Style}>Open follow-ups</h2>
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
        <h2 style={h2Style}>Trend lines</h2>
        {person && <TrendLines person={person} trials={trials} simple />}
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>Care notes</h2>
        {notes.length ? (
          notes.map((n) => (
            <div key={n.id} style={{ fontSize: 14 }} className="flex flex-col py-1" data-testid="care-note-row">
              <span className="font-bold">
                {n.chips.map((c) => CHIP_LABEL[c]).join(', ')}
                {n.text ? ` — ${n.text}` : ''}
              </span>
              <span className="text-[var(--text-muted)]">
                {new Date(n.created_at).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · {n.by}
              </span>
            </div>
          ))
        ) : (
          <p style={{ fontSize: 14 }} className="text-[var(--text-muted)]">
            No care notes yet.
          </p>
        )}
      </section>
    </main>
  );
}

const ACTIVITY_LEVEL_LABEL: Record<string, string> = {
  low: 'Low participation',
  steady: 'Steady participation',
  high: 'High participation',
};

const cardStyle = { background: 'var(--surface)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius)', padding: 16 } as const;
const h2Style = { fontSize: 17, fontWeight: 900, marginBottom: 8 } as const;
