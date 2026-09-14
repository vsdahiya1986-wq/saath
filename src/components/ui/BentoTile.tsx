'use client';
import { useEffect, type ReactNode } from 'react';
import { Person } from '@/lib/db';
import { playCue, queueAutoCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import Icon, { IconName } from './Icon';
import IconTile from './IconTile';

export type Tint = 'play' | 'today' | 'circle' | 'help';

/** Same three literacy tiers as BigChoice.tsx (SIH26003 h): icon/audio-led for non-literate, text-led for fluent. */
const SIZES = {
  'non-literate': { icon: 52, label: 30, stat: 40, detail: 17 },
  basic: { icon: 42, label: 26, stat: 34, detail: 17 },
  fluent: { icon: 34, label: 24, stat: 30, detail: 16 },
} as const;

/** One cell of a 2-column bento grid: icon, label, a live data preview, and a full-width Open button. */
export default function BentoTile({
  icon,
  labelKey,
  person,
  tint,
  stat,
  detail,
  onSelect,
}: {
  icon: IconName;
  labelKey: string;
  person: Person;
  tint: Tint;
  stat?: string;
  detail: ReactNode;
  onSelect: () => void;
}) {
  const s = SIZES[person.literacy];
  const color = `var(--tint-${tint})`;

  useEffect(() => {
    if (person.literacy === 'non-literate') queueAutoCue(labelKey, person.language);
  }, [labelKey, person.language, person.literacy]);

  return (
    <div data-testid={`bento-${tint}`} className="core hover-lift h-full flex flex-col gap-3 p-4" style={{ borderTop: `6px solid ${color}` }}>
      <div className="flex items-start justify-between gap-2">
        <IconTile icon={icon} size={s.icon} fg={color} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            playCue(labelKey, person.language);
          }}
          aria-label={t('a11y.listen', person.language)}
          className="btn btn-ghost btn-icon shrink-0"
          style={{ color }}
        >
          <Icon name="listen" size={24} />
        </button>
      </div>

      <div style={{ fontSize: s.label }} className="font-extrabold leading-tight">
        {t(labelKey, person.language)}
      </div>

      <div className="flex-1 flex flex-col justify-center gap-1">
        {stat && (
          <div style={{ fontSize: s.stat, color }} className="font-extrabold leading-none tabular-nums break-words">
            {stat}
          </div>
        )}
        <div style={{ fontSize: s.detail }} className="muted leading-snug" data-testid={`bento-${tint}-preview`}>
          {detail}
        </div>
      </div>

      <button onClick={onSelect} aria-label={t(labelKey, person.language)} className={`btn btn-block ${tint === 'help' ? 'btn-danger' : 'btn-primary'}`}>
        {t('common.open', person.language)}
      </button>
    </div>
  );
}
