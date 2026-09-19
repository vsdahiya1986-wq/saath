'use client';
import { Person } from '@/lib/db';
import { t } from '@/lib/i18n';
import { playCue } from '@/lib/audio';
import Icon from './Icon';

/**
 * Always-available exit: Pause / Skip this one / End, spoken on press, no traps.
 *
 * B4: the middle button used to be "Skip" and it ended the whole activity and
 * returned to /play — so the one control a confused person is most likely to
 * press threw away the session. It now skips the current step only. Leaving is
 * "End", and it is calm rather than alarm-red: stopping is allowed.
 */
export default function ExitBar({
  person,
  paused,
  onPauseToggle,
  onSkipOne,
  onEnd,
}: {
  person: Person;
  paused: boolean;
  onPauseToggle: () => void;
  /** Omitted by activities that have no steps to skip (Together Moment). */
  onSkipOne?: () => void;
  onEnd: () => void;
}) {
  const lang = person.language;
  // 08 item 5: at phone width a pill with the icon beside a long Assamese
  // label squeezed into a circle and spilled. Icon above, label below, and a
  // rounded rectangle that grows with the wrapped text instead.
  const EXIT_BTN = { minHeight: 64, flexDirection: 'column', gap: 4, borderRadius: 18, fontSize: 17, lineHeight: 1.2, textAlign: 'center', padding: '8px 6px', overflowWrap: 'anywhere' } as const;

  return (
    <div
      className={`dock shrink-0 grid ${onSkipOne ? 'grid-cols-3' : 'grid-cols-2'} gap-3 px-4 pt-3 pb-4`}
      role="toolbar"
      aria-label="activity controls"
    >
      <button
        onClick={() => {
          playCue(paused ? 'common.continue' : 'exit.pause', lang);
          onPauseToggle();
        }}
        className={`btn ${paused ? 'btn-primary' : 'btn-ghost'} px-2`}
        style={EXIT_BTN}
      >
        <Icon name={paused ? 'play' : 'pause'} size={24} />
        <span>{paused ? t('common.continue', lang) : t('exit.pause', lang)}</span>
      </button>
      {onSkipOne && (
        <button data-testid="exit-skip-one"
          onClick={() => {
            playCue('exit.skip_one', lang);
            onSkipOne();
          }}
          className="btn btn-ghost px-2"
          style={EXIT_BTN}
        >
          <Icon name="skip" size={24} />
          <span>{t('exit.skip_one', lang)}</span>
        </button>
      )}
      <button data-testid="exit-end"
        onClick={() => {
          playCue('exit.end', lang);
          onEnd();
        }}
        className="btn btn-ghost px-2"
        style={EXIT_BTN}
      >
        <Icon name="stop" size={24} />
        <span>{t('exit.end', lang)}</span>
      </button>
    </div>
  );
}
