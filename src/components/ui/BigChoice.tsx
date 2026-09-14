'use client';
import { useEffect } from 'react';
import { Person } from '@/lib/db';
import { playCue, queueAutoCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import Icon, { IconName } from './Icon';
import IconTile from './IconTile';

/**
 * Literacy-tiered scaling (SIH26003 h): non-literate = icon + audio dominant
 * with no subtitle, basic = icon and text equal weight, fluent = text-led.
 * These pixel values are the original, unchanged accessibility decision.
 */
const SIZES = {
  'non-literate': { icon: 96, label: 30, sub: 0 },
  basic: { icon: 64, label: 26, sub: 16 },
  fluent: { icon: 40, label: 22, sub: 15 },
} as const;

export default function BigChoice({
  icon,
  labelKey,
  subKey,
  person,
  onSelect,
  color,
  tag,
  testId,
}: {
  icon: IconName;
  labelKey: string;
  subKey: string;
  person: Person;
  onSelect: () => void;
  color?: string;
  tag?: string;
  testId?: string;
}) {
  const s = SIZES[person.literacy];

  // Non-literate users hear the choice on screen entry, before choosing; the Listen button replays it.
  useEffect(() => {
    if (person.literacy === 'non-literate') queueAutoCue(labelKey, person.language);
  }, [labelKey, person.language, person.literacy]);

  return (
    <div
      data-testid={testId}
      className="core hover-lift flex flex-wrap items-center gap-4 p-5 h-full"
      style={color ? { borderLeft: `8px solid ${color}` } : undefined}
    >
      <IconTile icon={icon} size={s.icon} fg={color} />
      <div className="flex-1 min-w-[140px]">
        {tag && person.literacy !== 'non-literate' && (
          <div style={{ fontSize: 13, color: color ?? 'var(--accent)', letterSpacing: '0.1em' }} className="font-bold uppercase">
            {tag}
          </div>
        )}
        <div style={{ fontSize: s.label }} className="font-extrabold leading-tight text-[var(--text)]">
          {t(labelKey, person.language)}
        </div>
        {s.sub > 0 && (
          <div style={{ fontSize: s.sub }} className="muted mt-1">
            {t(subKey, person.language)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            playCue(labelKey, person.language);
          }}
          aria-label={t('a11y.listen', person.language)}
          className="btn btn-ghost btn-icon"
          style={{ color: 'var(--accent)' }}
        >
          <Icon name="listen" size={24} />
        </button>
        <button onClick={onSelect} aria-label={t(labelKey, person.language)} className="btn btn-primary" style={{ minHeight: 72 }}>
          {t('common.open', person.language)}
        </button>
      </div>
    </div>
  );
}
