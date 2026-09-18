'use client';
import { useState } from 'react';
import type { Person, TrialEvent } from '@/lib/db';
import { ACTIVITIES } from '@/content/activities';
import { t } from '@/lib/i18n';
import { evidenceTrials, NOT_ENOUGH, TREND_WINDOWS, TrendWindow, trendLine } from '@/lib/trends';

/** A plain inline SVG line — no chart library (F10). Gaps are bridged, points are dotted. */
function Spark({ values, max, label }: { values: (number | null)[]; max: number; label: string }) {
  const W = 180;
  const H = 44;
  const pts = values
    .map((v, i) => (v === null ? null : { x: 6 + (i * (W - 12)) / (values.length - 1), y: H - 6 - (Math.min(v, max) / max) * (H - 12) }))
    .filter((p): p is { x: number; y: number } => p !== null);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label} style={{ color: 'var(--accent)' }}>
      <line x1={0} y1={H - 6} x2={W} y2={H - 6} stroke="var(--card-border)" />
      <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="currentColor" />
      ))}
    </svg>
  );
}

/**
 * Per activity, grouped by cognitive domain. `simple` (Circle Board) shows the
 * completion line only; the Evidence Inspector adds median response time and
 * the condition each line was drawn at.
 */
export default function TrendLines({ person, trials, simple = false }: { person: Person; trials: TrialEvent[]; simple?: boolean }) {
  const [windowDays, setWindowDays] = useState<TrendWindow>(30);
  const evidence = evidenceTrials(person, trials);
  const domains = [...new Set(ACTIVITIES.filter((a) => a.activity !== 'together').map((a) => a.domainKey))];

  return (
    <div className="flex flex-col gap-4" data-testid="trend-lines">
      <div className="flex gap-2" role="group" aria-label="Time window">
        {TREND_WINDOWS.map((w) => (
          <button key={w} onClick={() => setWindowDays(w)} aria-pressed={w === windowDays} className={`btn ${w === windowDays ? 'btn-primary' : 'btn-ghost'}`}>
            {w} days
          </button>
        ))}
      </div>

      {domains.map((domain) => (
        <section key={domain} className="flex flex-col gap-2">
          <h3 style={{ fontSize: 17 }} className="font-extrabold">
            {t(domain)}
          </h3>
          {ACTIVITIES.filter((a) => a.domainKey === domain).map((a) => {
            const line = trendLine(
              evidence.filter((x) => x.activity === a.activity),
              windowDays,
            );
            return (
              <div key={a.activity} className="flex flex-wrap items-center gap-x-4 gap-y-1" data-testid={`trend-${a.activity}`}>
                <span style={{ fontSize: 16, minWidth: 190 }} className="font-bold">
                  {t(a.labelKey)}
                </span>
                {line.enough ? (
                  <>
                    <Spark values={line.completion} max={1} label={`Completion ${Math.round(line.completionRate * 100)}%`} />
                    <span style={{ fontSize: 15 }}>{Math.round(line.completionRate * 100)}% completed</span>
                    {!simple && line.medianLatencyMs !== null && (
                      <>
                        <Spark values={line.latencyMs} max={Math.max(...line.latencyMs.map((x) => x ?? 0), 1)} label="Median response time" />
                        <span style={{ fontSize: 15 }}>{(line.medianLatencyMs / 1000).toFixed(1)} s median</span>
                      </>
                    )}
                    {!simple && (
                      <span style={{ fontSize: 13 }} className="muted">
                        level {line.difficulty} · {line.cue === 'none' ? 'no help' : line.cue.replace(/_/g, ' ')} · {line.comparable} sessions
                      </span>
                    )}
                    {line.worthCheckIn && (
                      <span className="chip" style={{ color: 'var(--accent-warm)' }}>
                        worth a check-in
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: 15 }} className="muted">
                    {NOT_ENOUGH}
                  </span>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
