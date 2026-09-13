'use client';
import type { CueType, Difficulty } from '@/lib/db';
import { Decision } from '@/lib/model';
import Icon from './Icon';

export const CUE_LABEL: Record<CueType, string> = {
  none: 'no extra help',
  repeat_audio: 'repeating instructions',
  highlight: 'highlighting the answer',
  reduce_choices: 'fewer choices',
  demonstrate: 'a demonstration first',
};

/** After a round, show what the same decide() call would choose next time. */
export default function SessionOutcomeNote({
  preview,
  playedDifficulty,
  playedCue,
}: {
  preview: Decision;
  playedDifficulty: Difficulty;
  playedCue: CueType;
}) {
  const diffChanged = preview.chosenDifficulty !== playedDifficulty;
  const cueChanged = preview.chosenCue !== playedCue;
  const same = !diffChanged && !cueChanged;

  return (
    <div
      className="panel flex items-start gap-3 p-4 text-left max-w-md w-full"
      data-testid={same ? undefined : 'session-outcome-note'}
      style={{ borderColor: same ? 'var(--border)' : 'rgba(94,234,212,0.45)' }}
    >
      <span style={{ color: same ? 'var(--text-muted)' : 'var(--accent)' }} className="mt-0.5 shrink-0">
        <Icon name={same ? 'refresh' : 'sparkle'} size={22} />
      </span>
      <p style={{ fontSize: 16 }} className={same ? 'muted' : ''}>
        {same ? (
          <>Next time we&apos;ll keep the same pace — not enough new evidence yet to change anything.</>
        ) : (
          <>
            Next time{diffChanged ? ` we may try level ${preview.chosenDifficulty}` : ''}
            {diffChanged && cueChanged ? ' with ' : cueChanged ? ' we may try ' : ''}
            {cueChanged ? CUE_LABEL[preview.chosenCue] : ''} — based on how this session went.
          </>
        )}
      </p>
    </div>
  );
}
