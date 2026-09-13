'use client';
import { useEffect, type ReactNode } from 'react';
import { Person } from '@/lib/db';
import { playCue, queueAutoCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import Icon, { IconName } from './Icon';
import IconTile from './IconTile';

export type Tint = 'play' | 'today' | 'circle' | 'help';

const SIZES = {
  'non-literate': { icon: 48, label: 34, sub: 18 },
  basic: { icon: 40, label: 30, sub: 18 },
  fluent: { icon: 34, label: 28, sub: 17 },
} as const;

/** One home-screen bento card: glowing icon, label, live preview, full-width Open. */
export default function BentoTile({
  icon,
  labelKey,
  person,
  tint,
  preview,
  onSelect,
  hero = false,
  className = '',
}: {
  icon: IconName;
  labelKey: string;
  person: Person;
  tint: Tint;
  preview: ReactNode;
  onSelect: () => void;
  hero?: boolean;
  className?: string;
}) {
  const s = SIZES[person.literacy];
  const color = `var(--tint-${tint})`;

  useEffect(() => {
    if (person.literacy === 'non-literate') queueAutoCue(labelKey, person.language);
  }, [labelKey, person.language, person.literacy]);

  return (
    <div className={`shell hover-lift ${className}`} data-testid={`bento-${tint}`}>
      <div
        className="core h-full flex flex-col gap-4 p-5 relative overflow-hidden"
        style={{ background: `radial-gradient(120% 90% at 100% 0%, var(--tint-${tint}-soft) 0%, transparent 60%), linear-gradient(180deg, var(--surface-2), var(--surface))` }}
      >
        <div className="flex items-start justify-between gap-3">
          <IconTile icon={icon} size={hero ? s.icon + 12 : s.icon} fg={color} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              playCue(labelKey, person.language);
            }}
            aria-label={t('a11y.listen', person.language)}
            className="btn btn-ghost btn-icon"
            style={{ color }}
          >
            <Icon name="listen" size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-end gap-1 min-h-0">
          <div style={{ fontSize: hero ? s.label + 8 : s.label, letterSpacing: '-0.02em' }} className="font-extrabold leading-tight">
            {t(labelKey, person.language)}
          </div>
          <div style={{ fontSize: s.sub }} className="muted leading-snug">
            {preview}
          </div>
        </div>

        <button
          onClick={onSelect}
          aria-label={t(labelKey, person.language)}
          className={`btn btn-block ${tint === 'help' ? 'btn-danger' : 'btn-primary'} ${hero ? 'btn-xl' : ''}`}
          style={{ justifyContent: 'space-between', paddingRight: 10 }}
        >
          <span className="pl-2">{t('common.open', person.language)}</span>
          <span className="nub">
            <Icon name="arrow" size={22} strokeWidth={2.6} />
          </span>
        </button>
      </div>
    </div>
  );
}
