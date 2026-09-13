'use client';
import { Decision } from '@/lib/model';
import type { Lang } from '@/lib/db';
import { t } from '@/lib/i18n';
import Icon from './Icon';

/** In-session trace of the same Decision the Evidence Inspector explains in full. */
export default function AdaptiveBadge({ decision, lang }: { decision: Decision; lang: Lang }) {
  const learned = decision.mode === 'learned';
  return (
    <div
      title={decision.reason}
      data-testid="adaptive-badge"
      className="chip shrink-0"
      style={{ color: learned ? 'var(--accent)' : 'var(--text-muted)' }}
    >
      <Icon name={learned ? 'sparkle' : 'circle'} size={14} />
      {t(learned ? 'adaptive.learned' : 'adaptive.baseline', lang)}
    </div>
  );
}
