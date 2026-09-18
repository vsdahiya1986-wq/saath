/**
 * The one place the errorless-learning rule lives (01_BUGS.md B1).
 *
 * Every choice activity had the same defect: the correct-answer branch
 * advanced the step and the wrong-answer branch only flashed an outline, so a
 * person who could not find the answer stayed on that step until an error cap
 * ended the whole session as `not_completed`. CST is errorless — being wrong
 * must never be a dead end.
 *
 * First wrong tap  -> 'retry'  : gentle cue + the engine's hint, same step.
 * Second wrong tap -> 'reveal' : show and say the right answer, then advance.
 * There is never a third attempt.
 */

export const MAX_ATTEMPTS = 2;

export type WrongAnswerAction = 'retry' | 'reveal';

/**
 * @param attemptsSoFar wrong taps already made on this step, before this one.
 */
export function onWrongAnswer(attemptsSoFar: number): WrongAnswerAction {
  return attemptsSoFar + 1 >= MAX_ATTEMPTS ? 'reveal' : 'retry';
}
