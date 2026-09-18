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

## Phase 5 — Caregiver layer (2026-09-18)

**F7 — Circle Nudges** (`src/lib/nudges.ts`, `src/components/circle/NudgeList.tsx`). `nudgeCandidates()` is
pure. It turns reminder logs, trials and help requests into `medicine_missed`, `quiet_days` (2 days without a
completed activity, never for a profile younger than that), `help_pressed` and `steadier_help` (help cue in
≥60 % of ≥5 sessions in 7 days). Ids are derived from the triggering row, so `refreshNudges()` is idempotent
and never re-opens an acknowledged nudge. The card text is the kit's fixed copy. Nudges are shown at the top of
Circle and on the Board, with the member on call today from `pickOnCall()`, **Acknowledge** and **Add note**
(the note is encrypted).
Not a second state machine: help requests keep their delivery states in `events.ts`. A nudge is only the
caregiver card on top of one, with two one-way updates.

**F8 — Care Note** (`CareNoteCard.tsx`). Four chips plus an optional encrypted line, stamped with the time and
the member. The member is picked once and remembered on the device (`CircleMe.tsx`), so a note is two taps:
a chip, then Save. Shown on the Board timeline and the Visit Card.

**F9 — Ghor Tiles.** The People screen already switched people in one tap. Its tiles now carry a large
initial, and Home shows **Switch** next to the name when the device has more than one person.

**F10 — Trend Lines** (`src/lib/trends.ts`, `TrendLines.tsx`). One line per activity, grouped by domain,
7 / 30 / 90 days, drawn as inline SVG. Each line uses only the trials at that activity's most common
difficulty-and-cue condition in the window. Below 5 such trials it prints "Not enough comparable sessions
yet." A clear drop is flagged "worth a check-in". The Board shows completion only; the Inspector adds median
response time and the condition. The Board's overall banner said **"Declining"** — now **"Worth a check-in"**,
no longer red. The demo-persona blurb no longer says "declining" either.

**F11 — Visit Card** (`/circle/visit`). First name, age band, last 30 days: sessions completed, reminders
done out of due, areas practised, the last 5 care notes, open nudges, and the non-diagnostic footer.
`window.print()` with a black-on-white 14pt print stylesheet in `globals.css`.

Data: `CareNote` / `Nudge` types and typed tables on the v2 stores declared in Phase 3 — **no new migration**.
`deletePerson()` now clears both, so `clearSample()` does too. `Person.age_band` is optional, and the profile
form has a selector for it.
Sample: Aita gets age band 70–79, 3 care notes and the one open `medicine_missed` nudge, stored under the
same id `refreshNudges()` derives, so it is never doubled.

Also fixed: saving a sample person from the profile form silently dropped `is_sample`, which removed the
SAMPLE chip. It is now preserved the same way `is_demo` already was.

⚠️ **Deviations — please check:**
- **Aita's sample history is denser.** The kit says "2–3 sessions/day". With one activity per session, spread
  over 6 games, no activity reached the 5 like-for-like trials F10 requires — **every trend line was empty**.
  A session is now one sitting of two activities (still 2–3 sittings a day). With that, 3 of 6 lines draw and
  one shows "worth a check-in" from the planned day 8–9 dip. The other three honestly say "not enough".
- **Sample trials count for Trend Lines and Nudges.** They are `synthetic: true`, which the engine and sync
  still ignore. But the sample person's screens would otherwise be permanently empty, so `evidenceTrials()`
  admits synthetic rows **only** for `is_sample` people. Real people never see synthetic evidence.
- **Domain trends are grouped, not merged.** "Per cognitive domain" is shown as each domain's activities
  together. Blending two activities into one line would break the like-for-like rule.
- **Circle strings are not in `strings.ts`.** `circle.*` and `note.*` keys were not added. Every Circle screen
  is English-only caregiver UI with hard-coded copy, so the keys would have no reader.
- **Care notes do not sync.** `sync.ts` only syncs coded trial data, and a care note holds free text.

Tests: `tests/nudges.test.ts` (10: each kind fires on its trigger and not before, fixed wording,
idempotent refresh), `tests/trends.test.ts` (6: under-5 → no line, like-for-like only, window, check-in
flag, synthetic only for sample), sample-data assertions for notes, the nudge and their cleanup, and
`tests/e2e/caregiver.spec.ts` (4: acknowledge a nudge; care note in two taps reaching Board and Visit Card;
no conclusion words on trend screens; Switch from Home).

Gates: lint clean · tsc clean · **120** unit tests · **28** Playwright tests.
One full run hit Playwright's 120 s web-server timeout while OneDrive was syncing `.next` (the build also once
failed with `EPERM` on a `.next` file). Both were environmental: the build takes about 22 s normally, and the
two tests that failed during that slow run pass alone and in a clean full run.

## Phase 6 — Easy View, Rest Pause, P1/P2 bugs (2026-09-18)

**B7 — language reverted to English after navigation.** Root cause: `t()` returns Assamese only once
`loadManifest(lang)` has cached the manifest, and the only caller of `loadManifest` was the audio code, when
a cue played. A screen that rendered before any cue played rendered English and stayed English until something
re-rendered it. `<html lang>` was also hard-coded to `en`. Fix, in one place: `usePerson` (which every
person-facing screen and `CircleGate` use) now runs `preparePerson()`. That awaits the manifest before
handing out the person and sets `<html lang>` and the text scale.
Proof it was real: `offline-journey.spec.ts` never picked a language, so its profile got the default
(Assamese), and it only passed because the Help button wrongly rendered as "I need someone". After the fix it
correctly reads "মোক কোনোবা এজন লাগে". That test now selects English explicitly, since it is about offline
behaviour. New e2e: an Assamese profile going Home → Play → every game → back keeps `lang="as"` and an
Assamese Play heading.

**F12 — Easy View.** An A / A+ / A++ control (`TextSizeControl.tsx`) on Home and in Circle → Display, saved as
`Person.text_scale`. ⚠️ **Deviation:** the kit said to scale "the existing CSS type tokens", but about 228
font sizes are inline pixel values that no token reaches. Scaling tokens would have changed almost nothing
visible. Native CSS `zoom` on `<html>` (1 / 1.15 / 1.3) scales text and touch targets together. No new
dependency. An e2e check confirms nothing scrolls sideways at A++ on a 390 px phone.
`--touch-min` 60 → 64 px, and `.btn` has a 64 px minimum width. The Playwright audit walks all 11
person-facing pages and asserts every visible button and link is at least 64 × 64. It found one:
Together Moment's "Open" link (46 × 60), now fixed. The focus ring is amber `#F59E0B`, 3 px, everywhere.

**F13 — Rest Pause** (`src/lib/restPause.ts`, `RestPause.tsx`). After about 10 minutes of back-to-back
activities (a gap of more than 15 minutes between starts begins a new run), the next activity first shows
"Shall we rest for a while?" with **Rest now** and **One more**. There is no countdown, and it never
interrupts a round mid-way. It is logged as plain `audit` events (`rest_prompt_shown`, `rest_now`,
`rest_one_more`), never as a trial. The run is tracked in `sessionStorage`, so it is per sitting.

**F14 / F15 — roadmap only.** Bol · Speak and Circle Message are listed as **not built** in the README and on
the About screen, which is now linked from Circle's privacy card (it was unreachable before).

**B8** was done in Phase 2 (R4). **B9:** the v2 schema landed in Phase 3; `tests/db-migration.test.ts` now
opens a real v1 database, upgrades it, and reads the old rows through the new indexes. **B10:**
`npm run preview` and the README rule already existed from Phase 2. **B11:** added to the manual device
matrix (`05_TESTS_AND_DONE.md` §4a). ⚠️ **It has not been run** — it needs a phone in airplane mode. The
checklist line that was ticked while saying "not yet literally tested" is now unticked.

New strings: `display.text_size`, `rest.title`, `rest.rest_now`, `rest.one_more` (still silent in Assamese
until `npm run generate-audio` is run).

Gates: lint clean · tsc clean · **124** unit tests · **33** Playwright tests.

## Phase 7 — Release preparation (2026-09-18)

**Screenshots.** `npm run screenshots` (`playwright.screenshots.config.ts`, `scripts/screenshots/capture.spec.ts`)
captures the 14 PPT shots at 1280 × 800 from the static export into `docs/screenshots/`. The clock is pinned to
08:05, so Aita's 08:00 medicine is due for shot 09 and every run is reproducible. It is not a gate, and
Vitest now excludes `scripts/screenshots/**` because it had been collecting the spec.
Every shot was checked by eye. That review found and fixed:
- **Circle said "1 sessions in the last 7 days"** for Aita. Circle's counts, and the Board's engagement
  ledger, skipped sample trials while Trend Lines counted them. Both now use the same `evidenceTrials()`
  rule, so it shows 33. Singular "session" is fixed too.
- **Visit Card print** showed the on-screen sync badge, and `CircleGate`'s full-height scroll box would have
  clipped a card longer than one screen. The badge is now `no-print`, and the print stylesheet releases
  the box.
- **The fishing-net icon I drew read as a wastebasket.** It is now a hooped hand net.
- The Inspector shot now shows the decision and its reason, not just the controls.

**Today's Three on Home (F6 gap from Phase 4).** The kit puts it on the Home Play card, but Phase 4 only
added it to the Play screen. Home's Play card now names today's three.

**Regional content (04_CONTENT §1 — never assigned to a phase, so not done until now).** 16 → 24 objects
and 3 → 5 routines (Evening prayer, Bath time), with 10 new line icons. ⚠️ The kit's "Bamboo stool" and
"Hand fan" already existed as Mora and Pankha, so **Weaving loom** and **Rice pot** were added instead. The
three games that read the in-code `HOME_OBJECTS` list get the same 8 objects, each with a Sort the Home
basket.
New content tests (§5): ≥ 24 objects and ≥ 5 routines; every routine has 3–4 steps with unique ids;
`HOME_OBJECTS` matches the manifest; every literal `t()` key exists in `STRINGS`; no clinical-claim words
in `src/` outside comments.
Not done from §5: the `tea_sprigs` check. That manifest block was skipped in Phase 4 because the sprigs
are drawn in code.

**README:** SIH26003 clause map (every row names its proof), plus the roadmap from Phase 6.

Gates: lint clean · tsc clean · **145** unit tests · **33** Playwright tests.
⚠️ `a due reminder shows the card in-app` failed once in one full run. It passed in a second full run and
3/3 times in isolation, and I could not reproduce it. Watch it in CI.
Follow-up: the one failure left no trace to diagnose. I ran 45 more attempts (the file 5× serially and 4×
under 4 parallel workers) and all passed. There is no guessed fix. `playwright.config.ts` now keeps a trace on
failure (`trace: 'retain-on-failure'`, no retries), so the next occurrence can be diagnosed.

**Not done — needs the owner:**
- **Push** `fix/sih-final` (7 phase commits, nothing pushed since Phase 0) and merge to `master`.
- **Vercel deploy.** No Vercel CLI or project is linked on this machine. `output: "export"` deploys as-is
  from the Vercel dashboard, and there is nothing to configure. The README has a placeholder for the URL.
- **`npm run generate-audio`** (Bhashini credentials). Until it runs, the newer strings are silent in
  Assamese and render as English text, visible in `02-home-as.png` ("Today's three:").
- **2-minute screen recording** for the README — best done by a person at demo pace.
- **B11** airplane-mode test on a real device.

## Assamese audio regenerated (2026-09-18)

The owner ran `npm run generate-audio` against Bhashini. All **81** strings now have a file in both `as` and
`en`, and `check-audio-coverage` reports the manifest up to date. The Phase 1–7 keys are no longer silent in
Assamese. The screenshots were retaken, and `02-home-as.png` now reads "আজিৰ তিনিটা" instead of
"Today's three".
Gates: lint · tsc · 145 unit · 33 Playwright, all green.

⚠️ **For native-speaker review:** `activity.saah_pat` ("Saah Pat · Tea Leaf") came back as
"চাহ পাত · চাহ পাত". The name and its gloss mean the same thing, so it reads twice. By project rule, no
Assamese is edited by hand. Fix it in review or by changing the English source and regenerating.
Still English on Assamese screens (hard-coded English on Home, pre-dating this pass): the date/season line
and the reminder-tile detail prefix ("Overdue — ", "Next: ").

## Fix pack Phase A — Assamese content (2026-09-18)

Source: `docs/saath-kit/06_FIX_PACK.md` (live verification on 18 Sept), saved into the kit.

**A1 — activity questions and options were English on Assamese profiles.** Root cause: the screen chrome
went through `t(key, lang)`, but every activity's *content* — questions, answer options, item names,
routine steps, basket names, reminiscence prompts, notices — was an English literal, or an English sentence
built at run time ("Where does the comb belong?", "After "Wake up", what comes next?"). Those can never be
translated. Spoken lines went through the device voice, which has no Assamese, so they were also silent.
- 157 new keys in `strings.ts` and `generate-audio.mjs`: questions (`q.*`), orientation names (`opt.period.*`,
  `opt.season.*`, `opt.weekday.*`, `opt.month.*`), baskets (`opt.bucket.*`), every object (`item.<id>`),
  every regional routine and step (`routine.<id>`, `step.<routine>.<step>`), the 8 reminiscence themes
  (`together.<theme>.theme|q|follow`), notices, completion and Today/Home text. The item, step, orientation
  and reminiscence keys are generated from their source lists, so the English matches exactly.
- No sentence is built around a name any more. "What comes next?" sits under the step just placed, and the
  Saah Pat count is a numeral beside the phrase. English keeps its fuller spoken sentences through the new
  `say()` / `queueSay()` in `audio.ts`, while other languages play the pre-generated Bhashini cue instead
  of going silent.
- A family's own photo captions and routine steps stay in the family's words; only our regional fallbacks
  are keyed. The kit's parallel `label_as` manifest field was not needed: `t('item.<id>')` already falls
  back to the English label.
- Bhashini was run for all 238 strings: **238/238 in both languages, coverage OK.**

**Bhashini punctuation artifact (found while checking the output).** Bhashini returns the Assamese in-word
apostrophe (ক'ত, হ'ব) as a space plus `"` or `'` — "এইটো ক "ত আছে?". It was already in strings from the
earlier run: Sort the Home's title in the current screenshots reads "ঘৰটো ছ 'ৰ্ট কৰক". Fixed in the
pipeline (`scripts/lib/fixApostrophes.mjs`, applied to every translation, 3 unit tests), and applied to
today's manifest without another API call (12 strings). It changes punctuation only, never letters. The
audio for those 12 was recorded from the unrepaired text and is refreshed on the next `generate-audio`.

**A2 — English fragments on Assamese screens.**
1. Home and Today date lines: weekday, month, season and time of day now come from the new keys
   (`localDate()` in `orientation.ts`).
2. "Overdue", "Next", "Next up", "Later today", "No reminders set yet", "Not armed on this device" (wording
   kept, only translated), "Today is", "Played today" and the Circle tile line are all keyed.
3. **CST session labels removed from the elder view** — the activity header, every Play card, and the
   "Cognitive Stimulation Therapy" eyebrow on Play (found by the B7 test snapshot). Chosen over
   translating: it is clinician metadata that meant nothing to the person. It stays in the Evidence
   Inspector's CST map.
Also: progress reads "2 / 4" instead of "2 of 4", with no English word.

**C1 done here as well:** `SessionOutcomeNote` shows one of four fixed, keyed lines ("Next time we'll keep the
same pace.") instead of engine wording, because it was also English on Assamese profiles.

Tests:
- `tests/e2e/assamese.spec.ts` (8): on Aita's Assamese profile, each of the 7 activities' question and
  options contain no English words, and the Home date line has no English. **All 8 failed before
  translation and pass after.**
- `tests/i18n-content.test.ts` (16): every generated key exists, and no play file contains the fix pack's
  English literals.
- `tests/fixApostrophes.test.ts` (3).
- Older e2e tests that selected elements by English text now use test ids (`progress`, `together-done`).
  The B7 walk gets a 120 s budget for its 21 navigations.

Gates: lint clean · tsc clean · **164** unit tests · **41** Playwright tests.

⚠️ **For a native Assamese speaker to review (machine translation, not edited by hand, per the rules):**
- `reminder.overdue` "Overdue" → **অতিৰিক্ত**, which means "extra/excess". **Wrong meaning; fix before the demo.**
- `opt.season.monsoon` → মৌচুমী বতাহ ("monsoon wind").
- `opt.weekday.friday` → শুক্ৰবাৰে (carries an "on Friday" ending); check the other weekdays too.
- Gamosa is spelled two ways: গমোছা (`item.reg_gamosa`) vs গেমোছা (`step.reg_bath_routine.dry`).
- `activity.saah_pat` → চাহ পাত · চাহ পাত (the name and its gloss translate to the same words).

Build note: a `.next` file stayed locked (EBUSY) through four build attempts while no build process was
running — OneDrive again. Renaming the locked file freed it. Failed builds partly clear `out/`, so the
preview server at :4180 served an incomplete site until the rebuild.

## Fix pack 07 — verified Assamese and everything still open (2026-09-18/19)

Source: `07_TRANSLATION_AND_REMAINING.md`.

### Part 0 check
The live test that said A1 was "not started" ran on `:4180` while failed builds (the OneDrive EBUSY lock)
had half-emptied `out/`. A1 had landed in `8c68947` with 8 passing Assamese tests. D1's `is_demo` belongs to
the two Inspector demo personas; Aita (the sample) has always been `is_sample`.

### Part 1 — Assamese: de-idiom, translate, verify
- **1.2:** 64 English strings rewritten to be literal (the document's 9, plus an audit of every string).
  The worst new find: "Tap the **right** basket" had been translated as the right-*hand* basket. 16 keys that
  no code used were deleted instead of translated.
- **1.3/1.4:** `scripts/verify-translations.mjs`. Engine A is Bhashini EN→AS. Engine B is Bhashini AS→EN, a
  separately trained model. The round trip is compared by meaning (all-MiniLM-L6-v2 embeddings, cosine) and
  by words (content-word overlap). There is a denylist in both languages (অস্ত্ৰ, সৈন্য, যুদ্ধ, আক্ৰমণ,
  মৃত্যু, ৰোগ, পাগল; weapon, war, death, disease, mad…), and a 1.8× length flag.
  FAIL = a denylist hit, or divergence on **both** meaning (< 0.75) and words (< 0.5). Both signals are
  required because one-word labels round-trip as other forms of the same word. Results are written to
  `docs/i18n-review.md` and `.json`.
- `generate-audio.mjs` no longer translates. It voices only PASS text; a FAIL shows English with no Assamese
  audio. Unchanged text reuses its recording (45 orphaned recordings were deleted).
- **Fifth gate:** `npm run verify-translations`, offline. What ships in the Assamese manifest must be
  exactly what passed, for exactly the current English. Added to the new `.github/workflows/ci.yml`
  (there was no CI before).
- **1.5 result:** a full re-translation of every key, then a second English pass on the failures, then
  re-verification. **224/227 verified (99%); 3 fall back to English.**

### Part 2
- **A1:** done in `8c68947`; still covered by `assamese.spec.ts` (8) and `i18n-content.test.ts`.
- **B1:** `reminderStatus()` — upcoming / due / snoozed / done / missed, derived from today's log.
  - "Not now" returns after 10 minutes. It counts as a press, so it is never swept as missed.
  - Done after a missed sweep still counts. Only a missed row nudges.
  - Today's cards stop being one button: Done and Not now on a due card, Done on a missed card, each at
    least 64 px, plus Listen.
  - Home's next reminder and Circle's count ("reminders missed today") now use the same statuses. Before, a
    reminder marked Done still showed as overdue.
- **B2:** the sample seeds 4 reminders relative to load time: medicine due now, water an hour ago (logged
  done), a walk in two hours, a clinic visit in five. The 14-day history is kept, with both historical misses
  and the Circle nudge. Today shows the next three plus "N more reminders later today". The person's screen
  has no red, no pink and no ⚠; lateness is a word in amber next to the time.
- **B3:** at 360 px the status badge pushed `/today` sideways. Chips now wrap (`white-space: normal`,
  `overflow-wrap: anywhere`) and the badges may shrink. The audit covers 11 screens × 3 widths on the
  Assamese profile.
- **C1:** done in Phase A. **C2:** Today's three are separated by commas; `·` only appears inside a name.
  **C3:** End → `/play`, matching `05_TESTS_AND_DONE`; the pause overlay's Stop matches.
  **C4:** `retry-message` shows "Let us look again." under the question after a first wrong answer.
  **C5:** not-this-one is a muted grey outline — no crimson, no shake.
  **C6:** new kettle, mora and card-back icons; the Saah Pat exemplar is in the tile colour.
  **C7:** Help has been ≥ 64 px since Phase 6 (`--touch-min`); the F12 audit measures it in every game.
- **D1:** no rename (see Part 0). The clear-sample test now walks **every** Dexie table, so a new table
  cannot be forgotten. **D2:** id→name→route table in the README and on the `Activity` union; no screen
  renders a raw id.
- **E1:** No-Signal Mode e2e: persists across reload, badge `simulated`, a full session and a Care Note
  complete under it, badge clears when turned off. **E2:** Trend Lines and the Visit Card
  (`caregiver.spec.ts`), Rest Pause (`accessibility.spec.ts`). **E3 (B11 device test): not run** — it needs
  a phone.

Gates: lint · tsc · **178** unit · **51** Playwright (one worker, low memory) · verify-translations — all green.

### Roadmap (not started)

All seven phases are done. The owner-only steps above remain, then Bol · Speak and Circle Message (F14/F15).
