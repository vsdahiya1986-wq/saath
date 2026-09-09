'use client';
import type { CSSProperties } from 'react';
import { Person } from '@/lib/db';
import { t } from '@/lib/i18n';
import Icon from './Icon';

/**
 * Always-available exit — F6. Present on every activity screen without
 * exception. No timer, no confirmation dialog that could trap someone.
 */
export default function ExitBar({
  person,
  paused,
  onPauseToggle,
  onSkip,
  onStop,
}: {
  person: Person;
  paused: boolean;
  onPauseToggle: () => void;
  onSkip: () => void;
  onStop: () => void;
}) {
  const lang = person.language;
  const btnClass = 'flex-1 flex flex-col items-center gap-1 py-3 font-black';
  const btnStyle: CSSProperties = {
    minHeight: 'var(--touch-min)',
    border: 'var(--border-w) solid var(--border)',
    borderRadius: 'var(--radius)',
  };

  return (
    <div className="flex gap-3 p-3" role="toolbar" aria-label="activity controls">
      <button onClick={onPauseToggle} className={btnClass} style={btnStyle}>
        <Icon name={paused ? 'play' : 'pause'} size={28} />
        <span style={{ fontSize: 15 }}>{paused ? t('common.continue', lang) : t('exit.pause', lang)}</span>
      </button>
      <button onClick={onSkip} className={btnClass} style={btnStyle}>
        <Icon name="skip" size={28} />
        <span style={{ fontSize: 15 }}>{t('exit.skip', lang)}</span>
      </button>
      <button
        onClick={onStop}
        className={btnClass}
        style={{ ...btnStyle, borderColor: 'var(--alert)', color: 'var(--alert)' }}
      >
        <Icon name="stop" size={28} />
        <span style={{ fontSize: 15 }}>{t('exit.stop', lang)}</span>
      </button>
    </div>
  );
}
