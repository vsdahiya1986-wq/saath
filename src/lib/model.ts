import { db, CueType, Activity, Difficulty, TrialEvent } from './db';

export const MODEL_VERSION = 'saath-bb-1.0';

/** Predeclared experimental configuration. Record these WITH the model version. */
export const CONFIG = {
  PRIOR_A: 1, // Beta prior alpha — engineering choice, NOT a clinical norm
  PRIOR_B: 1, // Beta prior beta
  MIN_EVIDENCE: 3, // minimum comparable trials before a cue is "supported"
  TIE_TOLERANCE: 0.05, // posterior means within this are a tie -> use preference
  TARGET_LOW: 0.6, // engineering target band for supported completion
  TARGET_HIGH: 0.85,
} as const;

export interface CueEstimate {
  cue: CueType;
  posteriorMean: number;
  n: number;
  completions: number;
  supported: boolean;
}

export interface Decision {
  mode: 'baseline' | 'learned';
  chosenCue: CueType;
  chosenDifficulty: Difficulty;
  ranking: CueEstimate[];
  changedFromBaseline: boolean;
  baselineCue: CueType;
  reason: string;
  modelVersion: string;
  config: typeof CONFIG;
}

/**
 * An eligible outcome is a completed or non-completed trial with full context.
 * Skips, withdrawals and interruptions are recorded but NEVER counted as
 * cognitive failure. Synthetic trials never inform a real recommendation.
 */
function isEligible(t: TrialEvent): boolean {
  return (t.outcome === 'completed' || t.outcome === 'not_completed') && !t.synthetic;
}

function posteriorMean(s: number, f: number): number {
  return (CONFIG.PRIOR_A + s) / (CONFIG.PRIOR_A + CONFIG.PRIOR_B + s + f);
}

export async function decide(opts: {
  personId: string;
  activity: Activity;
  difficulty: Difficulty;
  allowedCues: CueType[]; // Layer 1: care-config bound
  maxDifficulty: Difficulty; // Layer 1: care-config bound
  preferredCue?: CueType;
  explicitHelpRequested?: boolean;
  includeSynthetic?: boolean; // demo/test only
}): Promise<Decision> {
  const { personId, activity, difficulty, allowedCues, maxDifficulty, preferredCue, explicitHelpRequested, includeSynthetic } = opts;

  const baselineCue = preferredCue ?? allowedCues[0] ?? 'none';

  // ---- LAYER 1: explicit human intent always wins -------------------------
  if (explicitHelpRequested) {
    const helpCue = allowedCues.includes('repeat_audio') ? 'repeat_audio' : baselineCue;
    return {
      mode: 'baseline',
      chosenCue: helpCue,
      chosenDifficulty: difficulty,
      ranking: [],
      changedFromBaseline: false,
      baselineCue,
      reason: 'Explicit help request — human intent overrides the model.',
      modelVersion: MODEL_VERSION,
      config: CONFIG,
    };
  }

  // ---- Gather comparable evidence ----------------------------------------
  const all = await db.trials.where({ person_id: personId, activity }).toArray();
  const comparable = all.filter((t) => t.difficulty === difficulty && (includeSynthetic ? true : isEligible(t)));

  const ranking: CueEstimate[] = allowedCues.map((cue) => {
    const rel = comparable.filter((t) => t.cue === cue);
    const s = rel.filter((t) => t.outcome === 'completed').length;
    const f = rel.filter((t) => t.outcome === 'not_completed').length;
    return {
      cue,
      completions: s,
      n: s + f,
      posteriorMean: posteriorMean(s, f),
      supported: s + f >= CONFIG.MIN_EVIDENCE,
    };
  });

  const supported = ranking.filter((r) => r.supported);

  // ---- LAYER 2: transparent cold-start fallback --------------------------
  if (supported.length === 0) {
    return {
      mode: 'baseline',
      chosenCue: baselineCue,
      chosenDifficulty: difficulty,
      ranking,
      changedFromBaseline: false,
      baselineCue,
      reason: `Insufficient comparable evidence (need ${CONFIG.MIN_EVIDENCE} per cue at this difficulty). Using conservative baseline.`,
      modelVersion: MODEL_VERSION,
      config: CONFIG,
    };
  }

  // ---- LAYER 3: learned ranking, bounded --------------------------------
  supported.sort((a, b) => b.posteriorMean - a.posteriorMean);
  let chosenCue = supported[0].cue;

  // Break near-ties with the person's configured preference
  if (preferredCue) {
    const top = supported[0].posteriorMean;
    const tied = supported.filter((r) => top - r.posteriorMean <= CONFIG.TIE_TOLERANCE);
    const pref = tied.find((r) => r.cue === preferredCue);
    if (pref) chosenCue = pref.cue;
  }

  // Difficulty: only adjacent, only with comparable history, respecting bounds
  let chosenDifficulty: Difficulty = difficulty;
  const best = supported.find((r) => r.cue === chosenCue)!;
  if (best.posteriorMean > CONFIG.TARGET_HIGH && difficulty < maxDifficulty) {
    chosenDifficulty = (difficulty + 1) as Difficulty; // caregiver confirms increases in pilot
  } else if (best.posteriorMean < CONFIG.TARGET_LOW && difficulty > 1) {
    chosenDifficulty = (difficulty - 1) as Difficulty;
  }

  return {
    mode: 'learned',
    chosenCue,
    chosenDifficulty,
    ranking,
    changedFromBaseline: chosenCue !== baselineCue || chosenDifficulty !== difficulty,
    baselineCue,
    reason: `Ranked ${supported.length} supported cue option(s) by posterior mean supported-completion probability at difficulty ${difficulty}.`,
    modelVersion: MODEL_VERSION,
    config: CONFIG,
  };
}
