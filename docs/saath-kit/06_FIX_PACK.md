# 06 — Fix pack after live verification (18 Sept 2026)

This file supersedes nothing in `00`–`05`; it adds the defects found by **live browser testing of the
running app** at `http://localhost:4180` on 18 Sept 2026, after Phases 1–4 (and part of 6) were reported
complete. Everything below was seen on screen, not inferred from code.

## How to use

Work the phases in order. After each phase run the four gates, commit with the root cause in the body,
update `CHANGELOG.md`, then stop and wait for "continue".

```bash
npm run lint
npx tsc --noEmit
npm test
npx playwright test
```

**File paths in this document are best-effort.** Locate the real files with `rg`/`grep` before editing.
Trust the code on disk over any path quoted here.

---

## Non-negotiables (unchanged, repeated because Phase A touches content)

- **Never invent Assamese text in code.** Translations come from the Bhashini pipeline
  (`scripts/generate-audio.mjs`) or a file a human reviewer has approved. If a translation is missing,
  the fallback is the English string plus a `TODO` in the manifest — never a machine guess typed into a
  `.ts` file by you.
- Every new user-visible string is added to **both** `src/content/strings.ts` **and** the key list in
  `scripts/generate-audio.mjs`. The sync test in `tests/content.test.ts` must stay green.
- No clinical claims, no scores, no timers, no engine jargon on elder-facing screens.
- Errorless learning: the person is never stuck and never told off.

---

## What is already verified good — do NOT "fix" these

Confirmed working live on 18 Sept; leave them alone:

- All seven activities reach completion by tapping. Shared step runner, debounce and lock-clearing all
  behave (three rapid taps advanced exactly one step).
- Errorless retry: first wrong answer highlights the correct option in amber and stays on the step;
  second wrong answer reveals the answer and advances.
- Saah Pat and Apon Mukh both play and complete. Apon Mukh's regional-object fallback works.
- Aita's Day loads in one tap, is labelled `SAMPLE`, and its description copy is honest.
- Circle Nudges fire with the specified wording. Circle members and on-call rotation are correct.
- Reminder cards carry an honest **"Not armed on this device"** warning. Keep this.
- Removals R1/R2/R3/R5 are genuinely deleted (404), old route slugs still resolve, trial history survived
  the rename with no data loss.
- Zero console errors from SAATH's own code.

**R6 is resolved: the floating purple widget (Home / camera / video / Manage) is NOT our code.** It is the
Excalidraw browser extension on the test machine, confirmed by its console stack traces. Do not delete
anything for R6. Add a line to the screenshot checklist telling the operator to disable browser extensions
before capturing.

---

# PHASE A — Assamese content (P0, blocks screenshots)

## A1 — Activity questions and answer options render in English on Assamese profiles

**This is the most serious defect in the app.** Multilingual support is PS clause (c) and one of the three
winning angles. A judge opening the Assamese screenshot currently sees English questions.

**Reproduce**
1. Circle → Load Aita's Day (sample). Aita's language is `as`.
2. Home renders correctly in Assamese: খেলিব, আজি, খোলক, ঘৰ.
3. Open Play → Today & Me (`/play/today_me`).
4. Title (আজি আৰু মই), adaptive badge (যোৱাবাৰৰ দৰে একেই গতি), exit bar (ৰৈ থাকক / এইটো এৰি দিয়ক /
   শেষ কৰক) and Help (সহায় কৰক) are **correctly Assamese**.
5. But the question reads **"What part of the day is it now?"** and the options read **"Afternoon"** and
   **"Evening"**. Step 2 reads **"Which season are we in?"** with **"Monsoon"** / **"Spring"**.

**Diagnosis to confirm**
The UI chrome goes through `t(key, lang)`; the activity *content* (question prompts, answer option labels,
item names) is being rendered from hardcoded English or from a content module that never consults `lang`.
Find every place an activity renders a question or an option label and check whether it passes through
`t()`. Grep for the literal strings first:

```bash
rg -n "What part of the day|Which season are we in|Where does this belong|Listen, then find|Find the pairs|Find every sprig" src/
rg -n "Morning|Afternoon|Evening|Night|Monsoon|Spring|Autumn|Winter" src/ --type ts --type tsx
```

**Required fix**
1. Every elder-facing question prompt and every answer-option label resolves through `t(key, lang)`.
   No activity component may render a bare English literal.
2. Add the content keys to `src/content/strings.ts` **and** the key list in `scripts/generate-audio.mjs`.
   Suggested key shape (match existing conventions if they differ):

```
q.today_me.part_of_day       What part of the day is it now?
q.today_me.season            Which season are we in?
q.sort_home.where            Where does this belong?
q.hear_find.listen           Listen, then find
q.apon_mukh.find_pairs       Find the pairs
q.saah_pat.find_sprigs       Find every sprig like this one
q.next_step.first            What do you do first?
q.next_step.after            After "{item}", what comes next?

opt.period.morning           Morning
opt.period.afternoon         Afternoon
opt.period.evening           Evening
opt.period.night             Night
opt.season.spring            Spring
opt.season.monsoon           Monsoon
opt.season.autumn            Autumn
opt.season.winter            Winter
opt.bucket.kitchen           Kitchen
opt.bucket.around_house      Around the house
```

3. Regional manifest item labels (`objects`, `patterns`, `routines[].steps`) must also resolve per
   language. If the manifest is English-only, add a parallel `label_as` field **populated from the
   Bhashini pipeline or a reviewed file** — not typed by you — and have the resolver prefer
   `label_<lang>` then fall back to `label` with the English text. An untranslated label falling back to
   English is acceptable and honest; a *fabricated* Assamese label is not.
4. Run `node scripts/generate-audio.mjs` (or whatever the documented command is) so the new keys get
   Assamese text and cached audio. If the Bhashini credentials are unavailable in this environment,
   **stop and say so** — add the keys, leave the Assamese values empty with the English fallback active,
   and report exactly which keys still need a real translation pass. Do not fill them in yourself.

**Acceptance**
- Playwright: with the sample (Assamese) profile, for each of the seven activities, assert the question
  element's text is **not** equal to its English string.
- A new unit test asserts no component under `src/app/play/` contains a hardcoded English question or
  option literal (regex scan against the list above).
- Manual: every game completes in Assamese with no English visible in the question or options.

## A2 — English fragments leaking into Assamese screens

Three specific leaks seen:

1. **Home date line** renders `Friday, 18 September · Monsoon season` in English on the Assamese profile.
   Localise weekday, month and season. Use the app's existing season helper; add weekday/month name keys
   rather than relying on `toLocaleDateString` unless the `as` locale is reliably available.
2. **The word "Overdue"** appears inside an otherwise-Assamese sentence on the Today card:
   `Overdue — এতিয়া আপোনাৰ ঔষধৰ সময়।`. Add `reminder.overdue` and render it translated.
3. **`CST SESSION 10 · ORIENTATION`** shows on elder-facing activity screens in English. This is clinician
   metadata. Decide one of: remove it from the elder view entirely (preferred — it means nothing to Aita
   and adds clutter), or translate it and keep it. State which you chose and why in the commit body.

---

# PHASE B — Reminders (P0)

## B1 — Reminder cards have no Done / Not now

**Reproduce:** load Aita's Day, open Today (`/today`). Three reminder cards render (medicine 8:00, water
9:00, clinic 10:00). **None has any action control.** There is no way to mark a reminder done.

**Why this is serious:** the `reminder_logs` table exists but nothing can write a `done` outcome, so the
missed-sweep will eventually mark every reminder missed and Circle Nudges will fire for reminders the
person actually completed. The feature is half-built and the half that is missing is the one that makes
the nudge logic truthful.

**Required fix**
1. Every due or overdue reminder card gets two controls, each ≥ 64 px:
   - **Done** (`reminder.done`) → writes a `reminder_logs` row `{reminder_id, person_id, due_at,
     outcome: 'done', logged_at}`, card collapses to a quiet done state.
   - **Not now** (`reminder.not_now`) → writes `outcome: 'snoozed'`, card returns in 10 minutes.
2. The missed sweep writes `outcome: 'missed'` only when neither was pressed within 30 minutes of
   `due_at` (boundary already specified in `02_FEATURES.md` F2 — keep it).
3. A `missed` row is what triggers the `medicine_missed` Circle Nudge. Confirm the nudge does not fire for
   `done` or `snoozed`.
4. Keep the honest `Not armed on this device` warning exactly as it is.

**Acceptance:** `tests/reminders.test.ts` covers done / snoozed / missed and the 30-minute boundary;
`tests/nudges.test.ts` asserts `medicine_missed` fires on a missed row and not on a done or snoozed one;
Playwright marks a reminder Done from `/today` and asserts the card changes state.

## B2 — Aita's Day seeds every reminder as already overdue

**Reproduce:** load the sample at any time of day. Home shows `8:00 AM — Overdue`. `/today` shows three
cards, all `OVERDUE`, all in alarm red on pink fills with ⚠ icons.

**Two problems.** First, for a dementia app, greeting the person with three red overdue alerts on their own
home screen is the anxiety pattern the brief rules out. Second, as demo data it reads as neglect — the
screenshot says "this person is missing all her medication."

**Required fix**
1. Seed the sample reminders **relative to load time**, not at fixed clock times: one clearly upcoming
   (e.g. `now + 2h`), one due now, and at most one in the recent past. Keep the seeded `reminder_logs`
   history (including the two historical missed entries that feed Trend Lines and the existing nudge) —
   that history is what makes Circle look real. It is only *today's* live cards that must not all be red.
2. Redesign the due state for the elder view: calm, not alarm. Drop the red/pink treatment and the ⚠ on
   the person-facing card; a neutral or amber accent and the plain sentence is enough. Never use colour as
   the only signal — the time and the word carry the meaning.
3. The caregiver views (Circle, Circle Board) may keep a stronger visual weight. The distinction is: the
   elder sees an invitation, the caregiver sees a status.

**Acceptance:** `tests/sampleData.test.ts` asserts that immediately after `loadSample()` not all of today's
reminders are overdue and at least one is in the future; a visual check that no ⚠ or red fill appears on
`/today` for the sample profile.

## B3 — Assamese text clips on the reminder card

The clinic reminder's Assamese body (`আপোনাৰ এটা ক্লিনিক এপইণ্টমেণ্ট আ…`) runs off the card's right edge
and is cut off. Assamese strings are typically longer than their English equivalents — audit every card,
badge and button for overflow at 360 px, 768 px and 1280 px widths with the Assamese profile active, and
allow wrapping rather than clipping. Add this to the manual matrix.

---

# PHASE C — Copy and polish (P1)

## C1 — Completion note still shows engine language
**Seen on:** every activity's completion screen, still present after Phase 1.
`Next time we'll keep the same pace — not enough new evidence yet to change anything.`
"Evidence" is engine vocabulary. `SessionOutcomeNote` must use the same friendly fixed map as the in-game
badge (B5 in `01_BUGS.md`). Cut it to `Next time we'll keep the same pace.` The full technical
`decision.reason` stays in the Evidence Inspector and Circle Board only.

## C2 — "Today's three" separator is ambiguous
**Seen on:** home screen, both languages.
Renders as `Today's three: Saah Pat · Tea Leaf · Apon Mukh · Dear Faces · Together Moment`. The middle dot
separates both the halves of one activity's name *and* one activity from the next, so three activities read
as five. Separate activities with `, ` and reserve `·` for inside a name. In Assamese, check the separator
convention is appropriate rather than transliterating the comma.

## C3 — "End" returns Home, the test expects /play
`05_TESTS_AND_DONE.md`'s spec asserts `End` returns to `/play`; the app returns to `/`. Both are defensible.
Pick one, change the other to match, and say which in the commit body.

## C4 — Gentle retry has no visible message
On a first wrong answer the correct option is highlighted amber, but no `Let's look again` text appears.
If the spoken cue does not play (autoplay blocked, no audio file), the retry is silent and the person gets
no feedback at all. Render the `step.try_again` string visibly alongside the highlight.

## C5 — Wrong answer uses alarm red
The second wrong attempt outlines the chosen option in crimson. Errorless learning argues for minimising
the felt experience of error — use a muted neutral or soft amber for the not-this-one state and reserve the
green check for the reveal.

## C6 — Icon mismatches (visible in screenshots)
- My Next Step: "Have tea" renders a bowl-like glyph, "Sit and rest" renders a database/stack glyph.
- Apon Mukh: the face-down card back is a blue crossed square that reads as a broken-image placeholder.
  Give it a deliberate back — a simple woven or gamosa-inspired motif in the existing line style.
- Saah Pat: the target exemplar in the prompt card is green while all grid tiles are orange, which invites
  the person to hunt for a green sprig. Render the exemplar in the same colour as the tiles; the shape is
  the signal.

## C7 — Help button is 60 px
Every other interactive target measured ≥ 64 px. The Help button is 60 px high. Raise it and add the
target-size assertion from `05_TESTS_AND_DONE.md` to CI so it cannot regress.

---

# PHASE D — Data consistency (P2)

## D1 — `is_demo` vs `is_sample`
The seeded person record carries **`is_demo`**, but `02_FEATURES.md` F1, `04_CONTENT.md` §4 and
`05_TESTS_AND_DONE.md` all specify **`is_sample`**. If `clearSample()` or the test looks for `is_sample`
while the generator writes `is_demo`, clearing will silently leave rows behind. Pick one name, apply it to
every table the generator touches (persons, trials, reminders, reminder_logs, members, packs, care_notes,
nudges, blobs), update the tests, and add a migration that renames the field on existing rows.

**Acceptance:** `tests/sampleData.test.ts` asserts `clearSample()` leaves zero rows carrying the flag in
every table, and zero orphaned blobs.

## D2 — Mixed activity id space
Stored trial rows use the **old** ids (`familiar_pairs`, `sound_sight`, `pattern_garden`, `my_next_step`)
while the two new games store **new-style** ids (`saah_pat`, `apon_mukh`). Verified live: 10 trials, no data
lost — the route-layer mapping choice was the safe one. But the id space is now inconsistent and it will
read oddly in the Evidence Inspector and any analytics shown to a judge.

Do **not** migrate the ids this close to the deadline. Instead: document the mapping in `README.md` and in a
comment on the `Activity` union in `db.ts`, and make sure every display surface renders the human name, never
the raw id.

---

# PHASE E — Still unverified, needs a pass

1. **No-Signal Mode (F3)** was never reached in testing. Verify: the toggle lives in Circle, persists, the
   badge is honest about simulated vs real offline, and a full session plus a Care Note completes with the
   network simulated off.
2. **Real OS notifications** cannot fire in a browser — the app correctly says "Not armed on this device".
   This can only be proven on the Android/Capacitor build. Run the manual matrix item from `01_BUGS.md`
   B11 on a real device and record the result in `BUILD_CHECKLIST.md`.
3. **Trend Lines, Visit Card, Rest Pause** (F10, F11, F13) were not reached. Confirm they exist and behave.

---

# Order of work

| Phase | Contents | Why this order |
| --- | --- | --- |
| A | Assamese content + English leaks | Blocks every screenshot; it is the headline claim |
| B | Reminder actions, sample seeding, overflow | Second most visible; makes the nudge logic truthful |
| C | Copy and polish | Cheap, all visible in screenshots |
| D | Data consistency | Invisible but a latent data-loss bug |
| E | Verify the untested features | Before screenshots, not after |

Screenshots (Phase 7 of the original kit) happen only after A, B and C are green, with browser extensions
disabled, on the Aita's Day profile, and captured **twice** — once in English, once in Assamese.
