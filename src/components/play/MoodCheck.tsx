'use client';
import type { Lang, Mood } from '@/lib/db';
import { t } from '@/lib/i18n';
import Icon, { IconName } from '@/components/ui/Icon';

const FACES: { mood: Mood; icon: IconName; key: string }[] = [
  { mood: 'good', icon: 'face_good', key: 'mood.good' },
  { mood: 'ok', icon: 'face_ok', key: 'mood.ok' },
  { mood: 'low', icon: 'face_low', key: 'mood.low' },
];

/**
 * One optional tap after an activity (fix pack 11, Tier 2.3). It appears on
 * the completion screen only, below Play again — it cannot block starting or
 * finishing anything, and walking away is how a person skips it, so there is
 * no extra "Skip" control to read. A tap writes `mood` onto the trial row that
 * was already logged; nothing else in the app reads it except the Circle
 * summary, and never the engine.
 */
export default function MoodCheck({ lang, mood, onPick }: { lang: Lang; mood: Mood | null; onPick: (m: Mood) => void }) {
  return (
    <section className="flex flex-col items-center gap-3" data-testid="mood-check">
      <p style={{ fontSize: 19, overflowWrap: 'anywhere' }} className="muted font-semibold">
        {t('mood.question', lang)}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {FACES.map((f) => {
          const picked = mood === f.mood;
          return (
            <button
              key={f.mood}
              onClick={() => onPick(f.mood)}
              aria-pressed={picked}
              data-testid={`mood-${f.mood}`}
              className={`btn ${picked ? 'btn-primary' : 'btn-ghost'} flex-col`}
              style={{ minHeight: 96, minWidth: 96, paddingTop: 10, paddingBottom: 10 }}
            >
              <Icon name={f.icon} size={40} strokeWidth={1.8} />
              <span style={{ fontSize: 16, overflowWrap: 'anywhere' }}>{t(f.key, lang)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
