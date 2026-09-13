'use client';
import { Person } from '@/lib/db';
import { t } from '@/lib/i18n';
import { playCue } from '@/lib/audio';
import Icon from './Icon';

/** Always-available exit (F6): Pause / Skip / Stop, spoken on press, no traps. */
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
  return (
    <div className="dock shrink-0 grid grid-cols-3 gap-3 px-4 pt-3 pb-4" role="toolbar" aria-label="activity controls">
      <button
        onClick={() => {
          playCue(paused ? 'common.continue' : 'exit.pause', lang);
          onPauseToggle();
        }}
        className={`btn ${paused ? 'btn-primary' : 'btn-ghost'} px-2`}
      >
        <Icon name={paused ? 'play' : 'pause'} size={24} />
        <span>{paused ? t('common.continue', lang) : t('exit.pause', lang)}</span>
      </button>
      <button
        onClick={() => {
          playCue('exit.skip', lang);
          onSkip();
        }}
        className="btn btn-ghost px-2"
      >
        <Icon name="skip" size={24} />
        <span>{t('exit.skip', lang)}</span>
      </button>
      <button
        onClick={() => {
          playCue('exit.stop', lang);
          onStop();
        }}
        className="btn btn-ghost px-2"
        style={{ borderColor: 'var(--alert)', color: 'var(--alert)' }}
      >
        <Icon name="stop" size={24} />
        <span>{t('exit.stop', lang)}</span>
      </button>
    </div>
  );
}
