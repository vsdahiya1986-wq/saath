'use client';
import type { CueType, Difficulty, Lang } from '@/lib/db';
import { Decision } from '@/lib/model';
import { t } from '@/lib/i18n';
import Icon from './Icon';

/**
 * After a round, what the same decide() call would choose next time — in one
 * fixed, friendly line (fix pack C1). It used to say "not enough new evidence
 * yet to change anything": engine vocabulary, and English on every Assamese
 * profile. The technical reason stays in the Evidence Inspector.
 * R7: never a difficulty number — the direction is what matters.
 */
function nextKey(preview: Decision, playedDifficulty: Difficulty, playedCue: CueType): string {
  if (preview.chosenDifficulty > playedDifficulty) return 'next.more';
  if (preview.chosenDifficulty < playedDifficulty) return 'next.gentler';
  if (preview.chosenCue !== playedCue && preview.chosenCue !== 'none') return 'next.with_help';
  return 'next.same';
}

export default function SessionOutcomeNote({
  preview,
  playedDifficulty,
  playedCue,
  lang,
}: {
  preview: Decision;
  playedDifficulty: Difficulty;
  playedCue: CueType;
  lang: Lang;
}) {
  const key = nextKey(preview, playedDifficulty, playedCue);
  const same = key === 'next.same';

  return (
    <div
      className="panel flex items-start gap-3 p-4 text-left max-w-md w-full"
      data-testid={same ? undefined : 'session-outcome-note'}
      style={{ borderLeft: `8px solid ${same ? 'var(--card-border)' : 'var(--accent)'}` }}
    >
      <span style={{ color: same ? 'var(--text-muted)' : 'var(--accent)' }} className="mt-0.5 shrink-0">
        <Icon name={same ? 'refresh' : 'sparkle'} size={22} />
      </span>
      <p style={{ fontSize: 16 }} className={same ? 'muted' : ''}>
        {t(key, lang)}
      </p>
    </div>
  );
}
