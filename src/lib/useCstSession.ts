'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Activity, CueType, Difficulty, Person } from './db';
import { decide, Decision } from './model';
import { lastDifficulty, useActivityTrial, TrialOutcome } from './activityHelpers';
import { queueAutoCue } from './audio';

export type Phase = 'loading' | 'playing' | 'paused' | 'done';

/** Escalating CST assistance, least to most support. */
const CUE_LADDER: CueType[] = ['repeat_audio', 'highlight', 'reduce_choices', 'demonstrate'];

/**
 * Everything every CST activity shares: the model's opening decision, one
 * logged trial per session, interruption logging, an escalating Help ladder
 * whose actually-used cue is what gets logged, and the next-time preview.
 */
export function useCstSession({
  person,
  activity,
  version,
  scored = true,
  onStart,
}: {
  person: Person;
  activity: Activity;
  version: string;
  scored?: boolean;
  onStart: (d: Decision | null, isCancelled: () => boolean) => Promise<void> | void;
}) {
  const router = useRouter();
  const { logTrial } = useActivityTrial(person.id, activity, version);

  const [phase, setPhaseState] = useState<Phase>('loading');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [outcome, setOutcome] = useState<'completed' | 'not_completed' | null>(null);
  const [nextPreview, setNextPreview] = useState<Decision | null>(null);
  const [errors, setErrors] = useState(0);
  const [cueUsed, setCueUsed] = useState<CueType>('none');

  const phaseRef = useRef<Phase>('loading');
  const errorsRef = useRef(0);
  const cueRef = useRef<CueType>('none');
  const decisionRef = useRef<Decision | null>(null);
  const difficultyRef = useRef<Difficulty>(1);
  const helpLevel = useRef(0);

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const bounds = {
    allowedCues: person.care_config.allowed_cues,
    maxDifficulty: person.care_config.max_difficulty,
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let d: Decision | null = null;
      if (scored) {
        const diff = await lastDifficulty(person.id, activity);
        d = await decide({ personId: person.id, activity, difficulty: diff, ...bounds });
        if (cancelled) return;
        decisionRef.current = d;
        difficultyRef.current = d.chosenDifficulty;
        cueRef.current = d.chosenCue;
        setDecision(d);
        setDifficulty(d.chosenDifficulty);
        setCueUsed(d.chosenCue);
      }
      await onStart(d, () => cancelled);
      if (cancelled) return;
      setPhase('playing');
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person.id, activity]);

  const log = useCallback(
    (o: TrialOutcome) =>
      logTrial({
        outcome: o,
        difficulty: difficultyRef.current,
        cue: cueRef.current,
        policyMode: decisionRef.current?.mode ?? 'baseline',
        modelVersion: decisionRef.current?.modelVersion ?? 'saath-bb-1.0',
        perseverativeErrors: scored ? errorsRef.current : undefined,
      }),
    [logTrial, scored]
  );

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && (phaseRef.current === 'playing' || phaseRef.current === 'paused')) log('interrupted');
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [log]);

  const addError = useCallback(() => {
    errorsRef.current += 1;
    setErrors(errorsRef.current);
    return errorsRef.current;
  }, []);

  const finish = useCallback(
    async (final: 'completed' | 'not_completed') => {
      if (phaseRef.current === 'done') return;
      setPhase('done');
      setOutcome(final);
      queueAutoCue(final === 'completed' ? 'game.well_done' : 'game.gentle_end', person.language);
      await log(final);
      if (!scored) return;
      const preview = await decide({ personId: person.id, activity, difficulty: difficultyRef.current, ...bounds });
      setNextPreview(preview);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [log, scored, person.id, activity, person.language]
  );

  const leave = useCallback(
    async (kind: 'skipped' | 'withdrawn', to: string) => {
      if (phaseRef.current !== 'done') await log(kind);
      router.push(to);
    },
    [log, router]
  );

  /** Returns the cue to apply now; each press escalates one step. */
  const requestHelp = useCallback(async (): Promise<CueType> => {
    if (phaseRef.current !== 'playing') return 'none';
    const allowed: CueType[] = person.care_config.allowed_cues.filter((c) => c !== 'none');
    const ladder: CueType[] = CUE_LADDER.filter((c) => !allowed.length || allowed.includes(c));
    let cue: CueType;
    if (helpLevel.current === 0) {
      const d = await decide({ personId: person.id, activity, difficulty: difficultyRef.current, ...bounds, explicitHelpRequested: true });
      decisionRef.current = d;
      setDecision(d);
      cue = d.chosenCue === 'none' ? ladder[0] ?? 'repeat_audio' : d.chosenCue;
    } else {
      const prevIdx = ladder.indexOf(cueRef.current);
      cue = ladder[Math.min(prevIdx + 1, ladder.length - 1)] ?? 'repeat_audio';
    }
    helpLevel.current += 1;
    cueRef.current = cue;
    setCueUsed(cue);
    return cue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person.id, activity]);

  const togglePause = useCallback(() => {
    setPhase(phaseRef.current === 'paused' ? 'playing' : 'paused');
  }, [setPhase]);

  return {
    phase,
    decision,
    difficulty,
    outcome,
    nextPreview,
    errors,
    cueUsed,
    addError,
    finish,
    leave,
    requestHelp,
    togglePause,
    isPlaying: () => phaseRef.current === 'playing',
  };
}

export type CstSession = ReturnType<typeof useCstSession>;
