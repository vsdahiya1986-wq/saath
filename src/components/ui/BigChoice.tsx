'use client';
import { Person } from '@/lib/db';
import { playCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import Icon, { IconName } from './Icon';

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
}: {
  icon: IconName;
  labelKey: string;
  subKey: string;
  person: Person;
  onSelect: () => void;
}) {
  const s = SIZES[person.literacy];
  return (
    <div
      className="flex items-center gap-5 bg-[var(--surface)] p-5"
      style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)' }}
    >
      <Icon name={icon} size={s.icon} />
      <div className="flex-1">
        <div style={{ fontSize: s.label }} className="font-black text-[var(--text)]">
          {t(labelKey, person.language)}
        </div>
        {s.sub > 0 && (
          <div style={{ fontSize: s.sub }} className="text-[var(--text-muted)] mt-1">
            {t(subKey, person.language)}
          </div>
        )}
      </div>

      {/* Audio first for non-literate: hear before choosing */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          playCue(labelKey, person.language);
        }}
        aria-label={t('a11y.listen', person.language)}
        style={{
          minWidth: 'var(--touch-min)',
          minHeight: 'var(--touch-min)',
          border: 'var(--border-w) solid var(--accent)',
          borderRadius: 'var(--radius)',
        }}
        className="text-[var(--accent)] font-black px-4 flex items-center justify-center"
      >
        <Icon name="listen" size={22} />
      </button>

      <button
        onClick={onSelect}
        aria-label={t(labelKey, person.language)}
        style={{ minHeight: 72, background: 'var(--accent)', borderRadius: 'var(--radius)' }}
        className="text-white font-black px-7 text-xl active:opacity-80"
      >
        {t('common.open', person.language)}
      </button>
    </div>
  );
}
