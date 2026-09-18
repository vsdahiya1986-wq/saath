# 01 — Defects to fix

Priority: **P0** = blocks demo/screenshots (Phase 1) · **P1** = visible quality issue (Phase 6) · **P2** = housekeeping (Phase 6).

For every item: reproduce → write failing test → find root cause → fix → test passes → note root cause
in the commit body and `CHANGELOG.md`.

---

## B1 (P0) — Answers do not advance in choice/sequence activities

**Affects:** Today & Me (route `familiar_pairs` on disk), Hear & Find (`sound_sight`), My Next Step (`my_next_step`).
**Works correctly (reference implementation):** Sort the Home (`pattern_garden`).

**Reproduce**
1. Create a profile (English), open Play → Today & Me.
2. Tap any answer ("Evening", "Morning" or "Afternoon").
3. Choice gets a green/orange outline. Progress stays "Step 1 of 2" forever. No console error.
4. Same pattern in Hear & Find ("1 of 3") and My Next Step ("1 of 3").

**Likely root causes — check each and report which one it was**
1. *Correct-answer gate that can never pass.* Today & Me asks "What part of the day is it now?" and
   compares against the clock. Check: hour→period boundaries (morning/afternoon/evening/night), timezone
   (use the device's local time, `Intl.DateTimeFormat().resolvedOptions().timeZone`), and that the
   generated choice set **always contains** the correct period. In our test at ~18:00 IST the options were
   "Evening / Afternoon" and "Evening / Morning", and neither advanced — so either the correct answer is
   computed differently from the options, or advancement is gated on something else.
2. *State set but step never incremented* — e.g. `setSelected(choice)` without `setStep(s => s + 1)`,
   or the increment lives inside a branch that never runs.
3. *A stuck promise* — an `await playCue(...)`, `await logTrial(...)` or `await decide(...)` that never
   resolves (e.g. audio `ended` event never fires when no audio file exists, or autoplay blocked). Any
   advance logic after that await never runs. **Audio must never block progression**: wrap audio in a
   timeout (max 1500 ms) and do not await it before advancing.
4. *A lock flag* (`busy`, `phase`, `disabled`, `locked`) set on tap and never cleared.
5. *Shared hook/component divergence* — compare the three broken handlers line by line with
   Sort the Home's working handler.

**Fix (required design, applies to all choice-based and sequence-based activities)**

Create one shared helper, e.g. `src/lib/stepRunner.ts` (or a hook `useStepRunner`), and use it in every
activity except Together Moment:

```ts
// Contract (adapt names to the codebase)
export interface StepResult { choiceId: string; correct: boolean; latencyMs: number; hinted: boolean }

export function useStepRunner<TStep>(steps: TStep[], opts: {
  onStepLogged: (i: number, r: StepResult) => Promise<void> | void; // never awaited before advancing
  onComplete: (results: StepResult[]) => void;
  feedbackMs?: number; // default 800
}): {
  index: number; total: number; current: TStep | undefined;
  answer: (choiceId: string, correct: boolean) => void; // the only way to answer
  skipOne: () => void;                                     // skip current step only (see B4)
  feedback: 'none' | 'right' | 'gentle-retry' | 'moving-on';
  attemptsOnStep: number;
};
```

Behaviour:
- Correct tap → show "right" feedback for `feedbackMs` → advance.
- Wrong tap, first attempt → "gentle-retry" feedback (soft amber, spoken "Let's look again") and apply the
  engine's hint cue (highlight / reduce choices). Stay on the step.
- Wrong tap, second attempt → "moving-on" feedback (show the right answer gently, spoken "This one is …")
  → advance anyway. **Never a third attempt. Never stuck.**
- Taps during feedback are ignored (debounced), but the lock **always** clears via `finally`/timer.
- Logging and audio are fire-and-forget; failures are caught and logged to console, never thrown.
- After the last step → `onComplete` → completion screen ("Well done. That was lovely.") with the existing
  `SessionOutcomeNote`.

**Today & Me specifics**
- Build the question from the real local time: `05:00–11:59 morning`, `12:00–16:59 afternoon`,
  `17:00–19:59 evening`, `20:00–04:59 night`. Put the boundaries in one exported function with unit tests.
- The option set is `[correct, one distractor]` at difficulty 1–2, `[correct, two distractors]` at 3–4,
  shuffled; **assert the correct option is present**.
- Second question ("What season is it?" or "What day is it today?") uses the same rule. Seasons for Assam:
  use the app's existing season helper (Home shows "Monsoon season"); reuse it, do not duplicate.

**Hear & Find specifics** — also fix B2 (label "...").

**My Next Step specifics** — also fix B3 (slot count and placement).

**Acceptance**
- Playwright `games-progress.spec.ts` (starter in `05_TESTS_AND_DONE.md`) passes for all five activities:
  tapping any option on every step ends on the completion screen within 20 taps.
- Unit tests for `periodForHour()` cover 04:59, 05:00, 11:59, 12:00, 16:59, 17:00, 19:59, 20:00.
- Manual: each game completes in English and Assamese.

---

## B2 (P0) — Hear & Find shows "..." instead of the item name

**Reproduce:** Play → Hear & Find. The "Listen, then find" card shows a speaker icon and `...`.

**Likely causes:** the label is read from an i18n key or pack title that is missing/undefined and a
fallback renders an ellipsis; or the component shows a loading placeholder that never resolves because a
promise (audio/pack decrypt) never settles.

**Fix**
1. Find where `...` is rendered for the target label and remove the ellipsis fallback.
2. Label resolution order: approved family pack title → regional manifest item `label` (via `t()` with a
   key like `item.<id>` if that pattern exists) → the icon name humanised. **Never render an empty or
   "..." label.**
3. Add unit test `tests/content.test.ts`: every item in `public/content/packs/regional/manifest.json`
   (`objects`, `patterns`, `routines[].steps`) has a non-empty `label`, a known `icon`, and a unique `id`.
4. When no family audio exists, keep the honest degrade-to-visual behaviour; show the label in large text
   and speak it via the cached Bhashini cue if available.

**Acceptance:** no rendered text node on any `/play/*` page equals `...` or `…` (Playwright assertion).

---

## B3 (P0) — My Next Step: empty slots and taps do nothing

**Reproduce:** Play → My Next Step. Hint says "Afternoon routine — a family can add their own in the
Memory Garden." Slot 1 shows "Next step…", slots 2–3 empty. Tap "Short walk": it highlights; nothing is placed.
The manifest's afternoon routine has 4 steps (Sit and rest, Have tea, Short walk, Drink water) but only 3
slots render and the progress says "1 of 3".

**Fix**
1. Number of slots = number of steps in the chosen routine for the chosen difficulty
   (difficulty 1 → first 2 steps, 2 → 3 steps, 3–4 → all 4). The progress counter uses the same number.
2. Interaction = **tap-to-place**: tapping an option places it into the next empty slot. Tapping a placed
   item returns it to the options. No drag required.
3. When all slots are filled → check order → run through the B1 feedback rules (one gentle retry
   highlighting the first wrong slot, then show the right order and complete).
4. Each routine is one "step" of the activity; a session plays 2–3 routines (progress "1 of 3" means
   routine 1 of 3).
5. Slot text shows the placed item's icon + label (never blank). Empty slots show a faint number only.
6. Fix the hint copy: routines are authored in **Pack Studio / Memory Garden** — use whichever name the
   Circle screen actually shows, consistently.

**Acceptance:** Playwright places items by tap in every slot and reaches completion; unit test that slot
count equals step count for difficulties 1–4.

---

## B4 (P0) — "Skip" ends the whole activity

**Fix:** split the exit bar into three clearly labelled buttons, each ≥ 64 px:
- **Pause / Continue** (unchanged).
- **Skip this one** → `skipOne()` from B1: logs the step as `skipped`, moves to the next step; on the last
  step it goes to the completion screen.
- **End** (was "Stop") → logs `withdrawn`, returns to `/play`. Use a calm colour, not alarm red.
Update `strings.ts` + `generate-audio.mjs` keys (`exit.skip_one`, `exit.end`) and the audio cues.
**Skipped and withdrawn are never counted as failure** (keep `isEligible()` in `model.ts` as is).

---

## B5 (P0) — Engine text shown to the elder

**Reproduce:** in any game, the badge shows "Insufficient comparable evidence (need 3 per cue at this
difficulty). Using conservative baseline."

**Fix:** the in-game `AdaptiveBadge` shows only a short, friendly line from a fixed map:
- baseline / no change → "Same pace as last time"
- easier → "A gentler round today"
- harder → "A little more today"
- help cue chosen → "With a little help today"
The full technical `decision.reason` appears **only** in the Evidence Inspector and in the Circle Board.
Add these four strings to `strings.ts` + audio keys.

---

## B6 (P0) — Code not on GitHub

Handled by Phase 0. Also add a README badge line with the live Vercel URL after Phase 7.

---

## B7 (P1) — Language occasionally reverts to English after navigation

**Fix:**
1. Language is always derived from the active person record (`usePerson`), never from component state or
   a module-level default.
2. `t(key, lang)` depends on `loadManifest(lang)` having resolved. Ensure the root layout (or `usePerson`)
   awaits `loadManifest(person.language)` before first render of person-facing screens, and re-renders
   when it resolves (e.g. a small `LanguageProvider` context with a `ready` flag).
3. Set `<html lang>` to `as` or `en` accordingly.
4. Playwright: create an Assamese profile, go Home → Play → each game → back; assert the page `lang`
   stays `as` and the Play heading is not the English string.

---

## B8 (P1) — Route slugs do not match visible names

Covered by R3 in `03_REMOVALS.md` (rename with redirects).

---

## B9 (P2) — Dexie compound index warning

Add a new schema version (keep version 1 intact):

```ts
this.version(2).stores({
  packs: 'id, person_id, state, [person_id+state]',
  trials: 'id, person_id, activity, synced_at, [person_id+activity], [person_id+created_at]',
  reminders: 'id, person_id, category',
  // new tables from 02_FEATURES.md go here too (care_notes, reminder_logs, nudges)
});
```

Add a `fake-indexeddb` test that opens a v1 database, upgrades to v2, and still reads existing rows.

---

## B10 (P2) — Demo must not run on `next dev`

- Add `npm run preview` = `next build && npx serve out -l 4180`.
- README: "Demo and screenshots always from `npm run preview` or the Vercel URL."

---

## B11 (P1) — Offline start not proven on a device

Keep the existing service worker. Add to the manual matrix (`05_TESTS_AND_DONE.md`): install the PWA /
Android build, switch on airplane mode, force-close, reopen, play one game, add one Care Note, turn the
network back on, confirm the sync status badge changes. Record the result in `BUILD_CHECKLIST.md`.
