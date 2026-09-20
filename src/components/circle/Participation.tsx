'use client';
import { useEffect, useState } from 'react';
import { db, getPerson, Mood, Person } from '@/lib/db';
import { preparePerson } from '@/lib/usePerson';
import { participation, Participation, today, Today } from '@/lib/participation';
import { t } from '@/lib/i18n';
import Icon, { IconName } from '@/components/ui/Icon';

interface Loaded {
  person: Person;
  stats: Participation;
  day: Today;
}

function useParticipation(personId: string | null): Loaded | null {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!personId) return;
      const [person, trials, logs] = await Promise.all([
        getPerson(personId),
        db.trials.where({ person_id: personId }).toArray(),
        db.reminder_logs.where({ person_id: personId }).toArray(),
      ]);
      if (!person || cancelled) return;
      // `t()` answers from the English fallback until this person's manifest is
      // cached, so a card built straight off `getPerson` renders English on an
      // Assamese profile whenever Circle is the first screen visited.
      await preparePerson(person);
      if (cancelled) return;
      setLoaded({ person, stats: participation(person, trials, logs), day: today(person, trials, logs) });
    })();
    return () => {
      cancelled = true;
    };
  }, [personId]);

  return loaded;
}

/**
 * Tier 2.2 — one observational line at the top of Circle. It compares this
 * person with their own previous week and never with anyone else, and every
 * sentence it can print is a fixed, translated string (`strip.*`): there is no
 * template that could assemble a judgement out of parts.
 */
export function StatusStrip({ personId }: { personId: string | null }) {
  const loaded = useParticipation(personId);
  if (!loaded) return null;
  const { stats, person } = loaded;
  const lang = person.language;

  return (
    <p
      data-testid="status-strip"
      data-strip={stats.strip}
      className="core col-span-2 px-5 py-3 flex items-center gap-3"
      style={{ fontSize: 17, borderTop: '6px solid var(--accent)', overflowWrap: 'anywhere' }}
    >
      <Icon name="chart" size={22} />
      <span>
        {t(stats.strip, lang)}
        {stats.remindersDown && ` ${t('strip.reminders_down', lang)}`}
      </span>
    </p>
  );
}

/** A count beside its translated phrase — never a number inside a sentence. */
function Count({ value, label }: { value: string; label: string }) {
  return (
    <p style={{ fontSize: 17, overflowWrap: 'anywhere' }} className="leading-snug">
      <span style={{ fontSize: 22, color: 'var(--accent)' }} className="font-extrabold tabular-nums">
        {value}
      </span>{' '}
      {label}
    </p>
  );
}

const MOOD_ICON: Record<Mood, IconName> = { good: 'face_good', ok: 'face_ok', low: 'face_low' };

/**
 * Tier 2.1 — thirty days of taking part, and Tier 3's "how today went" line in
 * the same card, because they are the same two questions a family member has.
 * Bars are one div each: at 360 px the row is 30 bars of 4 px with a 2 px gap,
 * and every label is a translated string that wraps rather than clipping.
 * With too little to say, `trend.too_little` replaces the comparison — the
 * line is never drawn through two points.
 */
export default function ParticipationCard({ personId }: { personId: string | null }) {
  const loaded = useParticipation(personId);
  if (!loaded) return null;
  const { stats, day, person } = loaded;
  const lang = person.language;
  const peak = Math.max(...stats.perDay, 1);
  const moods = (Object.keys(MOOD_ICON) as Mood[]).filter((m) => stats.moods[m] > 0);

  return (
    <section className="core col-span-2 p-5 flex flex-col gap-4" data-testid="participation" style={{ borderTop: '6px solid var(--accent)' }}>
      <div className="flex flex-col gap-2">
        <h2 style={{ fontSize: 20, overflowWrap: 'anywhere' }} className="font-extrabold">
          {t('trend.title', lang)}
        </h2>
        <div className="flex items-end gap-[2px]" style={{ height: 44 }} data-testid="participation-bars" aria-hidden="true">
          {stats.perDay.map((n, i) => (
            <span
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${n ? 10 + (n / peak) * 90 : 4}%`, minWidth: 4, background: n ? 'var(--accent)' : 'var(--card-border)' }}
            />
          ))}
        </div>
        <span style={{ fontSize: 14 }} className="muted">
          {t('trend.each_bar', lang)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <Count value={String(stats.sessions30)} label={t('trend.sessions', lang)} />
        {stats.enough ? (
          <>
            <Count value={`${stats.daysJoinedThisWeek} / 7`} label={t('trend.days_joined', lang)} />
            <Count value={`${stats.daysJoinedLastWeek} / 7`} label={t('trend.days_before', lang)} />
            <Count value={String(stats.unaidedThisWeek)} label={t('trend.unaided', lang)} />
            <Count value={String(stats.unaidedLastWeek)} label={t('trend.unaided_before', lang)} />
            {stats.remindersTotalThisWeek > 0 && (
              <Count value={`${stats.remindersDoneThisWeek} / ${stats.remindersTotalThisWeek}`} label={t('trend.reminders', lang)} />
            )}
          </>
        ) : (
          <p style={{ fontSize: 17, overflowWrap: 'anywhere' }} className="muted leading-snug" data-testid="participation-too-little">
            {t('trend.too_little', lang)}
          </p>
        )}
      </div>

      {moods.length > 0 && (
        <div className="flex flex-col gap-2" data-testid="participation-mood">
          <span style={{ fontSize: 15, overflowWrap: 'anywhere' }} className="muted font-semibold">
            {t('trend.mood_said', lang)}
          </span>
          <div className="flex flex-wrap gap-4">
            {moods.map((m) => (
              <span key={m} className="flex items-center gap-2" style={{ fontSize: 18 }}>
                <Icon name={MOOD_ICON[m]} size={26} strokeWidth={1.8} />
                <span className="font-extrabold tabular-nums">{stats.moods[m]}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1" data-testid="today-line" style={{ borderTop: '1px solid var(--card-border)', paddingTop: 12 }}>
        <h3 style={{ fontSize: 17, overflowWrap: 'anywhere' }} className="font-extrabold">
          {t('day.title', lang)}
        </h3>
        {day.empty ? (
          <p style={{ fontSize: 17, overflowWrap: 'anywhere' }} className="muted leading-snug">
            {t('day.nothing', lang)}
          </p>
        ) : (
          <>
            <Count value={String(day.activities)} label={t('day.activities', lang)} />
            {day.activities > 0 && <Count value={String(day.unaided)} label={t('day.no_help', lang)} />}
            {day.remindersTotal > 0 && <Count value={`${day.remindersDone} / ${day.remindersTotal}`} label={t('day.reminders', lang)} />}
          </>
        )}
      </div>

      <p style={{ fontSize: 14, overflowWrap: 'anywhere' }} className="muted leading-snug">
        {t('trend.observational', lang)}
      </p>
    </section>
  );
}
