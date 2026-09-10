'use client';
import type { CueType, Difficulty } from '@/lib/db';
import { Decision } from '@/lib/model';

const CUE_LABEL: Record<CueType, string> = {
  none: 'no extra help',
  repeat_audio: 'repeating instructions',
  highlight: 'highlighting the answer',
  reduce_choices: 'fewer choices',
  demonstrate: 'a demonstration first',
};

/**
 * SIH26003 requirement (b): "have the Evidence Inspector show *why*
 * difficulty changed after a session" — this is the in-session sibling of
 * that: right after a round ends, run the SAME decide() the next round
 * would use and show the one-line result here, so the adaptation is visible
 * at the moment it's decided, not only in the jury-facing Inspector.
 *
 * `preview` is a fresh Decision computed with the just-played difficulty as
 * input (see each activity's completion branch) — this component only
 * renders it, it never calls decide() itself.
 *
 * Text here is deliberately English-only and untranslated, like
 * `Decision.reason` itself in src/lib/model.ts — this is model-reasoning
 * text, the same category as the Evidence Inspector's jury-facing copy, not
 * translated end-user UI text (and the values are dynamic/interpolated, so
 * they couldn't have Bhashini-pregenerated audio regardless).
 */
export default function SessionOutcomeNote({
  preview,
  playedDifficulty,
  playedCue,
}: {
  preview: Decision;
  playedDifficulty: Difficulty;
  playedCue: CueType;
}) {
  const sameNextTime = preview.chosenDifficulty === playedDifficulty && preview.chosenCue === playedCue;

  if (sameNextTime) {
    return (
      <p style={{ fontSize: 13 }} className="text-[var(--text-muted)] text-center max-w-xs">
        We&apos;ll try the same way next time — not enough new evidence yet to change anything.
      </p>
    );
  }

  const diffChanged = preview.chosenDifficulty !== playedDifficulty;
  const cueChanged = preview.chosenCue !== playedCue;

  return (
    <p style={{ fontSize: 13 }} className="text-[var(--accent)] text-center max-w-xs font-bold" data-testid="session-outcome-note">
      Next time{diffChanged ? ` we may try difficulty ${preview.chosenDifficulty}` : ''}
      {diffChanged && cueChanged ? ' with ' : cueChanged ? ' we may try ' : ''}
      {cueChanged ? CUE_LABEL[preview.chosenCue] : ''} — based on how this session went.
    </p>
  );
}
