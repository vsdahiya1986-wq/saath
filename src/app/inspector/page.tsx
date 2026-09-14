'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { v4 as uuid } from 'uuid';
import { getActivePersonId } from '@/lib/usePerson';
import { getPerson, db, Person, Activity, Difficulty, TrialEvent, packsForPerson, ContentPack, CueType } from '@/lib/db';
import { decide, Decision, MODEL_VERSION } from '@/lib/model';
import { lastDifficulty } from '@/lib/activityHelpers';
import { ACTIVITIES, DOMAIN_COLOR, activityInfo } from '@/content/activities';
import { t } from '@/lib/i18n';
import BackButton from '@/components/ui/BackButton';
import Icon, { IconName } from '@/components/ui/Icon';
import IconTile from '@/components/ui/IconTile';
import { CUE_LABEL } from '@/components/ui/SessionOutcomeNote';

const OUTCOME_STYLE: Record<TrialEvent['outcome'], { label: string; color: string; icon: IconName }> = {
  completed: { label: 'Completed', color: 'var(--ok)', icon: 'check' },
  not_completed: { label: 'Not completed', color: 'var(--warn)', icon: 'circle' },
  skipped: { label: 'Skipped', color: 'var(--text-muted)', icon: 'skip' },
  withdrawn: { label: 'Stopped by person', color: 'var(--text-muted)', icon: 'stop' },
  interrupted: { label: 'Interrupted', color: 'var(--text-muted)', icon: 'pause' },
};

const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Evidence Inspector (SIH26003 b, f): the adaptive model's decision, reasons and evidence in plain language. */
export default function EvidenceInspector() {
  const [person, setPerson] = useState<Person | null>(null);
  const [activity, setActivity] = useState<Activity>('familiar_pairs');
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [includeSynthetic, setIncludeSynthetic] = useState(false);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [trials, setTrials] = useState<TrialEvent[]>([]);
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [tick, setTick] = useState(0);

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
    let cancelled = false;
    lastDifficulty(person.id, activity).then((d) => {
      if (!cancelled) setDifficulty(d);
    });
    return () => {
      cancelled = true;
    };
  }, [person, activity]);

  useEffect(() => {
    if (!person) return;
    let cancelled = false;
    (async () => {
      const d = await decide({
        personId: person.id,
        activity,
        difficulty,
        allowedCues: person.care_config.allowed_cues,
        maxDifficulty: person.care_config.max_difficulty,
        includeSynthetic,
      });
      const all = await db.trials.where({ person_id: person.id, activity }).toArray();
      if (cancelled) return;
      setDecision(d);
      setTrials(all.sort((a, b) => b.created_at.localeCompare(a.created_at)));
    })();
    return () => {
      cancelled = true;
    };
  }, [person, activity, difficulty, includeSynthetic, tick]);

  const seedDemo = useCallback(async () => {
    if (!person) return;
    const cues = person.care_config.allowed_cues.length ? person.care_config.allowed_cues : (['none'] as CueType[]);
    const rows: TrialEvent[] = [];
    const base = Date.now() - 7 * 864e5;
    cues.forEach((cue, ci) => {
      const successes = [2, 4, 3, 1, 3][ci % 5];
      for (let k = 0; k < 4; k++) {
        rows.push({
          id: uuid(),
          person_id: person.id,
          activity,
          activity_version: 'demo',
          difficulty,
          cue,
          outcome: k < successes ? 'completed' : 'not_completed',
          latency_ms: 20000 + k * 3000,
          perseverative_errors: k < successes ? 1 : 4,
          policy_mode: 'baseline',
          model_version: MODEL_VERSION,
          synthetic: true,
          created_at: new Date(base + (ci * 4 + k) * 36e5).toISOString(),
        });
      }
    });
    await db.trials.bulkPut(rows);
    setIncludeSynthetic(true);
    setTick((x) => x + 1);
  }, [person, activity, difficulty]);

  const clearDemo = useCallback(async () => {
    if (!person) return;
    const ids = (await db.trials.where({ person_id: person.id }).toArray()).filter((r) => r.synthetic).map((r) => r.id);
    await db.trials.bulkDelete(ids);
    setTick((x) => x + 1);
  }, [person]);

  if (!person) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 p-6 text-center">
        <Icon name="profile" size={56} />
        <p style={{ fontSize: 20 }}>Set up a person profile first.</p>
        <BackButton href="/circle" label="Back to Circle" />
      </main>
    );
  }

  const info = activityInfo(activity);
  const color = DOMAIN_COLOR[info.domainKey];
  const learned = decision?.mode === 'learned';
  const scoped = trials.filter((x) => includeSynthetic || !x.synthetic);
  const eligible = scoped.filter((x) => x.outcome === 'completed' || x.outcome === 'not_completed');
  const completionRate = eligible.length ? eligible.filter((x) => x.outcome === 'completed').length / eligible.length : null;
  const syntheticCount = trials.filter((x) => x.synthetic).length;
  const minEvidence = decision?.config.MIN_EVIDENCE ?? 3;
  const activeLayer = !decision ? 0 : decision.ranking.length === 0 ? 1 : learned ? 3 : 2;

  return (
    <main className="min-h-[100dvh]">
      <div className="max-w-5xl mx-auto px-5 pt-4 pb-16 flex flex-col gap-8">
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <BackButton href="/circle" label="Back to Circle" />
          <div className="flex gap-2 flex-wrap">
            <Link href="/inspector/cst" className="btn btn-ghost" style={{ fontSize: 18 }}>
              <Icon name="shield" size={20} /> CST Protocol Map
            </Link>
            <Link href="/inspector/theatre" className="btn btn-ghost" style={{ fontSize: 18 }}>
              <Icon name="warning" size={20} /> Failure Theatre
            </Link>
          </div>
        </header>

        <section className="flex flex-col gap-3">
          <span className="eyebrow self-start">
            <Icon name="chart" size={14} /> Jury view · model {decision?.modelVersion ?? MODEL_VERSION}
          </span>
          <h1 className="title-xl">Evidence Inspector</h1>
          <p style={{ fontSize: 19 }} className="muted max-w-2xl">
            Exactly how SAATH decides the level and type of help for {person.display_name} — every number below comes straight from this
            device&apos;s own session records.
          </p>
        </section>

        <section className="core p-5 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="muted font-bold uppercase tracking-widest" style={{ fontSize: 14 }}>
              1 · Choose an activity
            </span>
            <div className="flex flex-wrap gap-2" role="tablist">
              {ACTIVITIES.map((a) => {
                const active = a.activity === activity;
                const c = DOMAIN_COLOR[a.domainKey];
                return (
                  <button
                    key={a.activity}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActivity(a.activity)}
                    className="btn"
                    style={{
                      fontSize: 18,
                      padding: '0 18px',
                      color: active ? '#ffffff' : c,
                      background: active ? c : 'var(--surface)',
                      border: `2px solid ${c}`,
                    }}
                  >
                    <Icon name={a.icon} size={20} /> {t(a.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex flex-col gap-2">
              <span className="muted font-bold uppercase tracking-widest" style={{ fontSize: 14 }}>
                2 · Level
              </span>
              <div className="flex gap-2">
                {([1, 2, 3, 4] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    aria-pressed={difficulty === d}
                    className={`btn ${difficulty === d ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ width: 60, padding: 0, fontSize: 21 }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="muted font-bold uppercase tracking-widest" style={{ fontSize: 14 }}>
                3 · Demo data
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => setIncludeSynthetic(!includeSynthetic)}
                  role="switch"
                  aria-checked={includeSynthetic}
                  className="btn btn-ghost"
                  style={{ fontSize: 17, borderColor: includeSynthetic ? 'var(--accent-warm)' : undefined }}
                >
                  <span className="relative rounded-full" style={{ width: 48, height: 28, background: includeSynthetic ? 'var(--accent-warm)' : 'var(--surface-3)' }}>
                    <span
                      className="absolute top-[4px] rounded-full transition-transform"
                      style={{ width: 20, height: 20, left: 4, background: 'var(--surface)', transform: includeSynthetic ? 'translateX(20px)' : 'none' }}
                    />
                  </span>
                  Include synthetic
                </button>
                <button onClick={seedDemo} className="btn btn-ghost" style={{ fontSize: 17 }}>
                  <Icon name="sparkle" size={18} /> Add demo trials
                </button>
                {syntheticCount > 0 && (
                  <button onClick={clearDemo} className="btn btn-ghost" style={{ fontSize: 17, color: 'var(--alert)', borderColor: 'var(--alert)' }}>
                    Clear {syntheticCount} demo
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {decision && (
          <>
            <section className="core p-6 sm:p-8 flex flex-col gap-6" style={{ borderTop: `8px solid ${learned ? 'var(--accent)' : 'var(--accent-2)'}` }}>
              <div className="flex items-start gap-4 flex-wrap">
                <IconTile icon={info.icon} size={40} fg={color} />
                <div className="flex-1 min-w-[240px] flex flex-col gap-2">
                  <span className="chip self-start" style={{ color: learned ? 'var(--accent)' : 'var(--accent-2)', fontSize: 16 }} data-testid="inspector-mode">
                    <Icon name={learned ? 'sparkle' : 'shield'} size={16} />
                    {learned ? 'LEARNED — personalised from evidence' : 'BASELINE — safe default'}
                  </span>
                  <p style={{ fontSize: 'clamp(22px, 3.4vw, 30px)' }} className="font-extrabold leading-snug">
                    Next {t(info.labelKey)} session: <span style={{ color }}>{CUE_LABEL[decision.chosenCue]}</span> at{' '}
                    <span style={{ color }}>level {decision.chosenDifficulty}</span>.
                  </p>
                  <p style={{ fontSize: 18 }} className="muted">
                    <b className="text-[var(--text)]">Why: </b>
                    {decision.reason}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Stat label="Compared with baseline" value={decision.changedFromBaseline ? 'Changed' : 'Same'} tone={decision.changedFromBaseline ? 'var(--accent)' : 'var(--text-muted)'} sub={`Baseline help: ${CUE_LABEL[decision.baselineCue]}`} />
                <Stat label="Sessions recorded" value={String(scoped.length)} sub={`${eligible.length} count as evidence`} />
                <Stat label="Completion rate" value={completionRate === null ? '—' : pct(completionRate)} sub="completed ÷ (completed + not completed)" tone="var(--ok)" />
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="title-lg">How the decision is made</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { n: 1, title: 'A person asks for help', body: 'Human intent always wins. Pressing Help overrides the model immediately.', icon: 'people' as IconName },
                  { n: 2, title: 'Is there enough evidence?', body: `Each type of help needs at least ${minEvidence} finished sessions at this level. If none do, a safe default is used.`, icon: 'shield' as IconName },
                  { n: 3, title: 'Pick what works best', body: 'Types of help with enough evidence are ranked by their estimated success. Level moves by at most one step.', icon: 'sparkle' as IconName },
                ].map((step) => {
                  const active = step.n === activeLayer;
                  return (
                    <div key={step.n} className="panel p-5 flex flex-col gap-3" style={{ borderTop: `6px solid ${active ? 'var(--accent)' : 'var(--card-border)'}`, opacity: active ? 1 : 0.75 }}>
                      <div className="flex items-center gap-3">
                        <span
                          className="flex items-center justify-center rounded-full font-extrabold"
                          style={{ width: 40, height: 40, background: active ? 'var(--accent)' : 'var(--surface-3)', color: active ? 'var(--on-accent)' : 'var(--text-muted)' }}
                        >
                          {step.n}
                        </span>
                        <span style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
                          <Icon name={step.icon} size={24} />
                        </span>
                        {active && (
                          <span className="chip ml-auto" style={{ color: 'var(--accent)', fontSize: 13 }}>
                            USED NOW
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: 21 }} className="font-extrabold">
                        {step.title}
                      </h3>
                      <p style={{ fontSize: 17 }} className="muted">
                        {step.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-end justify-between gap-3 flex-wrap">
                <h2 className="title-lg">Evidence for each type of help · level {difficulty}</h2>
                <span style={{ fontSize: 16 }} className="muted">
                  Estimated success = (completions + 1) ÷ (sessions + 2)
                </span>
              </div>
              {decision.ranking.length === 0 && (
                <div className="panel p-5" style={{ fontSize: 18 }}>
                  Ranking is skipped when a person explicitly asks for help.
                </div>
              )}
              <div className="flex flex-col gap-3">
                {decision.ranking.map((r) => {
                  const chosen = r.cue === decision.chosenCue;
                  return (
                    <div key={r.cue} className="panel p-5 flex flex-col gap-3" style={{ borderLeft: `8px solid ${chosen ? 'var(--accent)' : 'var(--card-border)'}` }}>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <span style={{ fontSize: 22 }} className="font-extrabold capitalize">
                            {CUE_LABEL[r.cue]}
                          </span>
                          {chosen && (
                            <span className="chip" style={{ color: 'var(--accent)', fontSize: 13 }}>
                              <Icon name="check" size={14} /> CHOSEN
                            </span>
                          )}
                        </div>
                        <span className="chip" style={{ color: r.supported ? 'var(--ok)' : 'var(--warn)', fontSize: 15 }}>
                          {r.supported ? 'Enough evidence' : `Needs ${minEvidence - r.n} more`}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="progress-track flex-1" style={{ height: 18 }}>
                          <div className="progress-fill" style={{ transform: `scaleX(${r.posteriorMean})`, background: chosen ? 'var(--accent)' : '#9ca3af' }} />
                        </div>
                        <span style={{ fontSize: 24, minWidth: 64 }} className="font-extrabold tabular-nums text-right">
                          {pct(r.posteriorMean)}
                        </span>
                      </div>
                      <div className="flex items-center gap-5 flex-wrap" style={{ fontSize: 17 }}>
                        <span className="flex items-center gap-2 muted">
                          Evidence
                          <span className="flex gap-1">
                            {Array.from({ length: Math.max(minEvidence, r.n) }).map((_, i) => (
                              <span key={i} className="rounded-full" style={{ width: 14, height: 14, background: i < r.n ? (r.supported ? 'var(--ok)' : 'var(--warn)') : 'var(--surface-3)' }} />
                            ))}
                          </span>
                        </span>
                        <span className="muted">
                          <b className="text-[var(--text)]">{r.completions}</b> completed of <b className="text-[var(--text)]">{r.n}</b>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="title-lg">Fixed rules, declared in advance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Evidence needed" value={`${decision.config.MIN_EVIDENCE} sessions`} sub="per type of help, per level" />
                <Stat label="Level goes up when" value={`> ${pct(decision.config.TARGET_HIGH)}`} sub="estimated success" tone="var(--ok)" />
                <Stat label="Level goes down when" value={`< ${pct(decision.config.TARGET_LOW)}`} sub="estimated success" tone="var(--warn)" />
                <Stat label="Tie margin" value={pct(decision.config.TIE_TOLERANCE)} sub="then preference decides" />
              </div>
              <p style={{ fontSize: 16 }} className="muted">
                These are engineering settings, not clinical cutoffs. Skips, stops and interruptions are recorded but never counted as failure.
                Synthetic demo data never affects a real recommendation unless the switch above is on. Care-team bounds: levels up to{' '}
                {person.care_config.max_difficulty}, help allowed: {person.care_config.allowed_cues.map((c) => CUE_LABEL[c]).join(', ')}.
              </p>
            </section>
          </>
        )}

        <section className="flex flex-col gap-4">
          <h2 className="title-lg">Session timeline · {t(info.labelKey)}</h2>
          {!scoped.length && (
            <div className="panel p-6 muted" style={{ fontSize: 18 }}>
              No sessions logged yet for this activity. Play it once, or add demo trials above.
            </div>
          )}
          <ol className="flex flex-col gap-2">
            {scoped.slice(0, 20).map((row) => {
              const o = OUTCOME_STYLE[row.outcome];
              return (
                <li key={row.id} className="panel px-4 py-3 flex items-center gap-4 flex-wrap">
                  <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 40, height: 40, color: o.color, border: `2px solid ${o.color}` }}>
                    <Icon name={o.icon} size={20} />
                  </span>
                  <div className="flex-1 min-w-[180px]">
                    <div style={{ fontSize: 18, color: o.color }} className="font-extrabold">
                      {o.label}
                    </div>
                    <div style={{ fontSize: 15 }} className="muted">
                      {new Date(row.created_at).toLocaleString()}
                    </div>
                  </div>
                  <span className="chip" style={{ color: 'var(--accent-2)' }}>
                    Level {row.difficulty}
                  </span>
                  <span className="chip" style={{ color: 'var(--text-muted)' }}>
                    {CUE_LABEL[row.cue]}
                  </span>
                  <span className="chip" style={{ color: row.policy_mode === 'learned' ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {row.policy_mode}
                  </span>
                  {row.synthetic && (
                    <span className="chip" style={{ color: 'var(--accent-warm)' }}>
                      synthetic
                    </span>
                  )}
                  <span className="chip" style={{ color: row.synced_at ? 'var(--ok)' : 'var(--text-dim)' }}>
                    {row.synced_at ? 'synced' : 'on device'}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="title-lg">Content pack versions</h2>
          {!packs.length && (
            <p className="muted" style={{ fontSize: 18 }}>
              No family packs on this device yet.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {packs.map((p) => (
              <div key={p.id} className="panel px-4 py-3 flex items-center justify-between gap-3">
                <span className="font-bold truncate" style={{ fontSize: 18 }}>
                  {p.title}
                </span>
                <span className="chip" style={{ color: p.state === 'approved' ? 'var(--ok)' : 'var(--warn)' }}>
                  v{p.version} · {p.state}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="panel p-4 flex flex-col gap-1">
      <span style={{ fontSize: 14 }} className="muted font-bold uppercase tracking-widest">
        {label}
      </span>
      <span style={{ fontSize: 28, color: tone ?? 'var(--text)' }} className="font-extrabold tabular-nums">
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 15 }} className="muted">
          {sub}
        </span>
      )}
    </div>
  );
}
