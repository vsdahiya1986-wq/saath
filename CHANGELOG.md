# Changelog

## Phase 0 — Safety snapshot (2026-09-18)

Starting the SIH final fix pass against `docs/saath-kit/`.

- Snapshot commit `f144b76` — five local commits that were never pushed, plus the dev-mode
  service-worker unregister fix in `src/components/RegisterServiceWorker.tsx` and the
  `docs/saath-kit/` brief. `origin/master` was still at `585d6c1` (12 Sept).
- Branch `fix/sih-final` created off the snapshot; all phase work happens there.
- `eslint.config.mjs`: ignore `android/app/src/main/assets/public/**`. Capacitor copies the built
  bundle in there, and linting minified output was the *only* source of the 47 lint errors.

### Baseline gates

| Gate | Result |
| --- | --- |
| `npm run lint` | 47 errors / 2677 warnings, **all** from the generated Capacitor bundle; zero from `src`/`scripts`. Fixed by the ignore above. |
| `npx tsc --noEmit` | clean |
| `npm test` | 3 files, 17 tests passed |
| `npx playwright test` | 1 test passed (static export served from `out/`) |

So the repo was already green on real source before any fixes — the P0 defects in `01_BUGS.md`
are not covered by the current suites. Phases 1+ add the failing tests first.

## Phase 1 — P0 activity bugs (2026-09-18)

All five activities now reach their completion screen in English **and** Assamese, by test
(`tests/e2e/games-progress.spec.ts`, 13 cases) and by hand.

**B1 — answers do not advance.** Root cause was *not* an unreachable answer gate, a stuck promise
or a lock flag. In all four choice activities the correct-answer branch advanced the step and the
wrong-answer branch only flashed an outline and set a hint — so a person who could not find the
answer stayed on that step until an error cap (`items.length * 3` wrong taps) ended the whole
session as `not_completed`. Sort the Home only *looked* healthy because it prints the item name in
32px, so a tester always taps correctly. Reproduced before fixing: Today & Me sat on "Step 2 of 2"
for six taps, then ended on the gentle-end screen.
The errorless rule now lives in one place, `src/lib/stepRunner.ts`: first wrong tap → gentle retry
with the hint; second → reveal the answer, say it, advance. Never a third attempt. Each activity
supplies its own `accept(revealed)`, which is the path its correct branch already used.

**B2 — Hear & Find showed "…".** Not a missing i18n key or an unsettled promise: `hideWord`
(`literacy === 'non-literate'`) deliberately rendered a bare `…` so the word would be heard, not
read. But the profile default *is* non-literate, and with no Bhashini file, blocked autoplay or no
Assamese TTS the person had nothing at all to go on. The word is always shown now.

**B3 — My Next Step slots.** `STEPS_FOR[1]` was 3 against 4-step manifest routines, which is the
3-slots-for-4-steps mismatch; now `{1:2, 2:3, 3:4, 4:4}`. Added tap-to-undo on a placed step, and
empty slots show only their faint number instead of a "Next step…" placeholder that read like a
row that had failed to load. The hint copy already said "Memory Garden", which is what the Circle
screen calls it — no change needed.

**B4 — "Skip" ended the whole activity.** `ExitBar` is now Pause / **Skip this one** / **End**, all
≥64px. Skip logs the step `skipped` (still never counted as failure), reveals the answer and
advances; End logs `withdrawn`. End is no longer alarm-red.

**B5 — engine text shown to the elder.** `AdaptiveBadge` carried `title={decision.reason}`, so the
engine's own sentence surfaced as a browser tooltip. The badge now shows one of four friendly
lines, chosen from the new `Decision.fromDifficulty`. The technical reason stays in the Evidence
Inspector.

**B6** — Phase 0. The push is still pending the user's authorization.

Also in this phase: `partOfDayIndex` evening now ends at 19:59 per the kit's stated boundaries (was
20:59); `ICON_NAMES` exported so JSON content can be validated at runtime; dead `game.try_again`,
`exit.skip`, `exit.stop`, `adaptive.learned`, `adaptive.baseline` keys removed and a duplicate
`common.home` in the audio script dropped.

⚠️ **Assamese audio must be regenerated before the demo.** The new keys (`exit.skip_one`,
`exit.end`, `game.look_again`, the four `adaptive.*` lines) have no Bhashini file yet, and
`pickVoice` returns null for Assamese rather than mispronounce — so those cues are currently
**silent** in Assamese. Run `npm run generate-audio`. No Assamese text was invented in code.

## Phase 2 — Removals and renames (2026-09-18)

**R1 — Failure Theatre removed.** `/inspector/theatre` deleted with its pack-expiry, lost-response
and duplicate-sync demos (nothing else referenced them). Its one useful control became **No-Signal
Mode** (F3, brought forward so no capability was lost for a phase): a caregiver-facing switch on the
Circle screen. `sync.ts`'s `forcedOffline` is now persisted in `localStorage` so it survives demo
reloads, and `StatusBadge` reports `online | offline | simulated` with a `data-state` attribute — a
simulated outage must never be mistaken for a real one.

**R2 — Handoff removed.** `/circle/handoff` deleted, link and `handoffsPending` count removed. The
`handoffs` Dexie table and its `deletePerson()` cleanup are kept, commented as unused since Sept
2026, because dropping a table needs a migration and risks data loss for no gain.
⚠️ **Deviation from the kit:** it said to remove the "Pending handoffs" section from the Circle
Board. That section has always read `db.followups` — help requests and missed check-ins, which are a
real caregiver signal under clause (f). Deleting it would have destroyed working functionality, so it
is **renamed to "Open follow-ups"** instead, which is what it actually shows.

**R3 — Voice Legacy merged into Memory Garden.** `/circle/legacy` deleted; an **Export recordings**
button in Memory Garden reuses `exportLegacyZip()`. `voiceLegacy.ts` and `zip.ts` are therefore
**kept** — the export shipped.

**R4 — Routes renamed to match the visible names.** `/play/today_me`, `/play/hear_find`,
`/play/sort_home`, `/play/next_step`, `/play/together`.
Chosen approach: **stored ids are unchanged; the slug maps only at the route layer.** No Dexie
migration, so existing trial history and every `model.ts` query keep working untouched. Old URLs are
still generated as pages that client-side `router.replace()` to the new slug — `output: "export"`
rules out `next.config` redirects, which need a server.

**R5 — Dead assets.** Deleted `public/{file,globe,next,vercel,window}.svg` (unreferenced; `icon.svg`
is ours and kept). `README.md` was still the verbatim create-next-app template — replaced with a real
one covering `npm run preview`, the gates, and the Assamese audio rule. Did not chase `knip`.

**R6 — The floating purple widget is not ours.** No `Manage` string anywhere in `src/`, and the only
fixed-position panel in the codebase is GameFrame's pause overlay. It is a browser extension on the
test machine; no code changed.

**R7 — Copy clean-up.** `SessionOutcomeNote` told the elder "we may try level 3" — now "a little
more" / "gentler", since a level number reads like a grade. Removed-feature wording updated in
`BUILD_CHECKLIST.md` and a pass note added atop `SAATH_MASTER_FINAL.md` (history sections left
intact). Verified no score, streak or difficulty number reaches an elder-facing screen.

Gates: lint clean · tsc clean · 72 unit tests · **15** Playwright tests (added the R4 redirect test).

## Phase 3 — Demo readiness (2026-09-18)

F3 (No-Signal Mode) landed in Phase 2 alongside R1, so this phase is F1 and F2.

**Dexie v2 — one migration, three features (also closes B9).** Version 1 is untouched; v2 adds the
compound indexes Dexie had been warning about (`[person_id+state]`, `[person_id+created_at]`) plus
`reminder_logs`, and declares `care_notes` and `nudges` although Phase 5 is what uses them. One
upgrade is cheaper and safer than shipping a migration per feature.

**F1 — Aita's Day (`src/lib/sampleData.ts`).** `loadSample()` / `clearSample()`, both idempotent.
Seeded mulberry32 PRNG, never `Math.random()`, so two runs are byte-identical and a screenshot can be
retaken. Creates the person, 14 days of trials (~70% completion, a dip on days 8–9 for F10, all
`synthetic: true` so the engine never treats fiction as evidence), 8 reminders, 14 days of adherence
logs with exactly two misses, 3 circle members, and 2 Memory Garden packs with drawn SVG placeholders
— no photographs, no fake voice recordings.
Entry points: **"Load Aita's Day (sample)"** on Circle, **"See a sample"** on Welcome, and a permanent
**SAMPLE** chip on Home whenever the active person is a sample. `sync.ts` now filters sample, demo and
synthetic rows, so fiction can never reach a real backend.
⚠️ **Deviation:** the kit asked for an `is_sample` boolean on every table, with deletion by that flag.
Every sample row already hangs off one fixed person id, and `deletePerson()` already deletes by
`person_id` across every table — so `is_sample` went on `Person` only, `deletePerson()` was extended
to cover `reminder_logs` and pack blobs, and `clearSample()` reuses it. Smaller change, and a stronger
guarantee than a flag repeated on eight tables where the ninth gets forgotten.

**F2 — Ghonta reminders now actually fire and record.** `reminders.ts` gains `dueAt`, `selectDue`,
`selectMissed`, `sweepMissed` (idempotent, safe on every app start), `logReminderResponse` and
`ringCapability`. Every due occurrence ends as exactly one `reminder_logs` row — answered by the
person, or written as `missed` by the sweep 30 minutes later.
`ReminderDueCard` is the full-screen card: big category icon, the caregiver's own care-plan text in
30px, spoken once, and two ≥72px answers (**Done** / **Not now**). No countdown. The Reminders screen
now states per-device ring capability rather than failing silently.

Also fixed while here: the Reminders form's Hour/Minute/Period selects were in plain `<div>`s, so
they had **no accessible name at all**. Given `aria-label`s.

Gates: lint clean · tsc clean · **92** unit tests · **20** Playwright tests.
The reminder e2e test pins the clock with `page.clock.setFixedTime` — "is this due" depends on the
time of day and the form only offers quarter-hours, so a wall-clock run was not reproducible (it
passed alone and failed once in a full run before this).

## Phase 4 — Two new games and Today's Three (2026-09-18)

**F4 — Saah Pat · Tea Leaf** (`src/components/play/SaahPat.tsx`, `TeaSprig.tsx`, `src/lib/saahPat.ts`).
Visual cancellation: tap every "two leaves and a bud" sprig. Grid sizes from the spec (6/2, 9/3, 12/4,
16/5); difficulty 3–4 bring in the three-leaf look-alike. A wrong tap dims and says "Not this one"; after
`targets + 4` wrong taps the rest are revealed and the round completes. 2 rounds per session. Only a repeat
tap on an already-found sprig counts as a perseverative error. The four sprigs are original SVG line art
that differ by silhouette, drawn in one stroke colour so colour is never the only cue.
Bug fixed before commit: the Help "highlight" cue set the same flag as the give-up reveal, which blocks
taps — so asking for help would have frozen the round. It now has its own `hinted` state.

**F5 — Apon Mukh · Dear Faces** (`src/components/play/AponMukh.tsx`, `src/lib/aponMukh.ts`).
The 12 Sept `FamiliarPairs` card-matcher no longer exists — that file is now the "Today & Me" orientation
game — so there was nothing to reuse and this is new. It deals approved Memory Garden photos first and
fills gaps with regional objects. 3/4/5/6 pairs; a mismatch flips back after 1.2 s; a match shows its caption
and plays the family's recording if there is one, otherwise speaks the caption. After `pairs × 4` mismatches
everything turns face up and the round completes.

**F6 — Aajir Tini · Today's Three** (`pickAajirTini` in `src/lib/rotation.ts`). The Play screen shows three
activities from three different domains, least recently played first, with "All activities" underneath.
Synthetic (sample/demo) trials are ignored so made-up history never steers a real suggestion.

Wiring: `Activity` union, runner switch, `ACTIVITIES` (CST sessions 6 and 12), and `loadSample()` now seeds
both new games. Names show the English gloss as the kit asks: "Saah Pat · Tea Leaf", "Apon Mukh · Dear Faces".
New string keys: `activity.saah_pat`, `activity.apon_mukh`, `play.saah_pat.intro`, `play.apon_mukh.intro`,
`game.not_this_one`, `play.today_three`, `play.all_activities` — kept in sync with `generate-audio.mjs`.

⚠️ **Deviations from the kit:**
- Intro keys follow the existing `play.<x>.intro` convention, not `activity.<x>.intro`.
- The kit's `tea_sprigs` manifest block was not added. The sprigs are drawn in code, so nothing would read it.
- `demoSeed.ts` (the Inspector's improving and declining personas) still seeds only the original four games;
  its tests pin those counts.
- ⚠️ As in Phase 1, the new keys have no Assamese audio yet. Run `npm run generate-audio` before the demo.

Tests: `tests/phase4.test.ts` (12 unit tests: the Today's Three picker returns 3 distinct activities from
3 domains, grid and target counts, deck pair counts, give-up budgets) and 4 e2e tests (both games complete
in EN and AS by tapping arbitrary tiles in turn — tapping one tile again does nothing by design, so the test
cycles through them).

Gates: lint clean · tsc clean · **104** unit tests · **24** Playwright tests.

### Roadmap (not started)

Phases 5–7 per `docs/saath-kit/CLAUDE_CODE_PROMPT.md`: the caregiver layer, the accessibility pass, deploy. B7–B11 are Phase 6.
`loadSample()`'s care-notes and nudge rows wait on F7/F8 in Phase 5.
