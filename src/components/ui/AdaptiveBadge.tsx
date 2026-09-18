'use client';
import { Decision } from '@/lib/model';
import type { Lang } from '@/lib/db';
import { t } from '@/lib/i18n';
import Icon from './Icon';

/**
 * In-session trace of the Decision, in the elder's words only.
 *
 * B5: this carried `title={decision.reason}`, so the engine's own sentence
 * ("Insufficient comparable evidence (need 3 per cue at this difficulty)…")
 * surfaced to the person as a browser tooltip. The technical reason belongs to
 * the Evidence Inspector and the Circle Board; here it is one friendly line.
 */
function friendlyKey(d: Decision): string {
  if (d.chosenCue !== 'none') return 'adaptive.with_help';
  if (d.chosenDifficulty > d.fromDifficulty) return 'adaptive.harder';
  if (d.chosenDifficulty < d.fromDifficulty) return 'adaptive.easier';
  return 'adaptive.same';
}

export default function AdaptiveBadge({ decision, lang }: { decision: Decision; lang: Lang }) {
  const learned = decision.mode === 'learned';
  return (
    <div data-testid="adaptive-badge" className="chip shrink-0" style={{ color: learned ? 'var(--accent)' : 'var(--text-muted)' }}>
      <Icon name={learned ? 'sparkle' : 'circle'} size={14} />
      {t(friendlyKey(decision), lang)}
    </div>
  );
}
