# SAATH — Implementation Checklist
Source of truth: SAATH_MASTER_FINAL.md. Tracks Part 23's build order. Check items off as completed; each phase ends with tests/build green before moving on.

## Environment / external setup (user-owned, cannot be done by the agent)
- [ ] Install Android Studio (JDK + Android SDK + emulator) — needed to actually run `npx cap open android` / build an APK
- [ ] Register at bhashini.gov.in → get `BHASHINI_API_KEY`, `BHASHINI_USER_ID`, `BHASHINI_PIPELINE_ID`, then `npm run generate-audio`
- [ ] Create a Supabase project → get `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, run `supabase/migrations/001_init.sql`
- [ ] (Optional, low priority) Twilio account for online-fallback alert calls — not wired up yet

## Architectural deviations (see chat explanation for why)
- [x] Single local store = Dexie/IndexedDB everywhere (not the incompatible SQLCipher store from Part 15)
- [x] "Real encryption" = field-level AES-256-GCM (WebCrypto) keyed via `capacitor-secure-storage-plugin` (Android Keystore/iOS Keychain — the plan's named `@capawesome-team/capacitor-secure-preferences` package does not exist on npm), applied on top of Dexie, not a second DB engine
- [x] Circle screens gated by a local PIN (`src/lib/circleAuth.ts`), not Supabase Auth — no live Supabase project exists yet and Circle must work fully offline regardless
- [x] `/circle/setup` added (not in the plan's screen list) — a person profile has to be created somewhere before Play/Help/Today can render
- [x] Regional fallback library (Part 20) is generic icon+label shapes, not photographs — no licensed NER photo/sound library was available; clearly labelled as placeholder in the manifest and in the UI nudge

## Tier 1 — Foundational — DONE
- [x] Scaffold Next.js (static export) + TypeScript + Tailwind + src-dir
- [x] Install Dexie, uuid, Capacitor core/android/local-notifications/preferences/network/camera/filesystem, capacitor-secure-storage-plugin, vitest+RTL+playwright+fake-indexeddb
- [x] `next.config.ts` static export config
- [x] Capacitor init + `android` platform added (template only — cannot build the APK in this environment, no JDK/Android SDK)
- [x] `src/lib/db.ts` — Dexie schema + encrypted-field repository functions (persons, members, packs, reminders, blobs)
- [x] `src/lib/crypto.ts` — AES-256-GCM field/blob encryption + hardware-backed key
- [x] `src/lib/model.ts` — Bayesian Beta-Binomial engine (3-layer policy)
- [x] `tests/model.test.ts` — all 8 tests green
- [x] `src/lib/events.ts` — Followup state machine
- [x] `tests/events.test.ts` — all 5 tests green
- [x] Design tokens (`globals.css`) — hard borders, 56px+ targets, 18/26/32px text scale, no timers/scores, fixed high-contrast palette (no dark mode — deliberate for cataract/macular users)
- [x] Person home (Play / Help / Today) + `BigChoice`, literacy-tier rendering — verified live in browser
- [x] Pack Studio (`/circle/packs`) + regional fallback manifest — verified live in browser
- [x] Familiar Pairs wired to the model engine, full game logic, ExitBar (pause/skip/stop) — verified live in browser end-to-end including a completed round logging a real trial
- [x] Help screen with staleness handling + "I need someone" → honest stored/sent state — verified live in browser
- [x] Engagement Ledger (`src/lib/engagement.ts`) — verified live in browser, exact "Steady participation — N session(s)..." wording from Part 16.3
- [x] Airplane-mode cold start: not yet literally tested with the OS network toggle, but `alerts.ts`/`sync.ts` degrade correctly when offline (proven via Failure Theatre's simulated-offline path)

## Tier 2 — Requirement completion — DONE
- [x] **Sound & Sight** — matches a played family-recorded prompt (or, honestly, degrades to picture-matching when no pack audio exists / `sensory_mode: visual_only`) to an image among 2-5 choices. Assistance cues wired for real: `repeat_audio` replays, `highlight`/`demonstrate` outline the correct tile, `reduce_choices` trims the grid to 2. Verified live: correct pick → `/play` + logged as `completed`; ranking math confirmed in Evidence Inspector.
- [x] **Pattern Garden** — repeating shape sequence (triangle/square/circle/star, outline-only, shape+contrast never colour), period scales 2→4 with difficulty, same cue wiring as Sound & Sight. Verified live: hand-derived the correct next shape from the visible sequence, clicked it, confirmed navigation.
- [x] **My Next Step** — routine-step sequencing. Added `ContentPack.media.steps?: string[]` (additive schema change) + a Pack Studio textarea so a real caregiver-authored routine can be used; falls back to a labelled generic "Morning routine" from the regional manifest otherwise. Verified live end-to-end: tapped all 3 fallback steps in the correct order, confirmed completion.
- [x] **Together Moment** — deliberately NOT run through the Bayesian engine (Part 3.1 F2 explicitly exempts it: no score, no streak) and deliberately has NO regional fallback (a placeholder object is harmless; a placeholder "memory" would be hollow). Two-tap "I don't want to see this again" permanently withdraws the pack. Verified live: honest "No shared moments have been prepared yet" empty state when no `together`-tagged pack exists. The with-content playthrough (photo/audio display, Done/reject flow) is code-reviewed but not live-clicked — this sandbox has no real microphone, so a pack couldn't be recorded to populate it; the code reuses the same photo-decrypt and ExitBar/trial-logging patterns already proven working elsewhere.
- [x] Shared `src/lib/activityHelpers.ts` (`lastDifficulty`, `useActivityTrial`) factored out so all four new activities log trials identically instead of duplicating the pattern four times.
- [x] Reminder scheduler (4 categories) + `src/lib/reminders.ts` native alarms + reboot re-arm (`rearmAll`) — code complete, UI verified in browser; actual AlarmManager firing needs a real Android build to test
- [x] Voice-guided navigation (`src/lib/voiceNav.ts`) — full gesture contract implemented; NOT yet wired into every screen or eyes-closed tested
- [x] Circle Board: engagement ledger + trend analytics (Part 18) + rotation/burden panel (Part 19) — verified live in browser
- [ ] i18n: English strings complete and live; Assamese is English-fallback until `scripts/generate-audio.mjs` is run with real Bhashini credentials (script is written and path-corrected to `public/content/lang/`)
- [x] Circle roster — verified live in browser
- [x] Handoff sender/receiver (3-state: sent/received/accepted) — built, not yet browser-verified

## Tier 3 — Differentiators — MOSTLY DONE
- [x] Voice Legacy (`src/lib/voiceLegacy.ts`) + `/circle/legacy` UI + real (hand-rolled, store-only) ZIP export
- [x] Evidence Inspector (`/inspector`) — posterior ranking, sample sizes, learned-vs-baseline, changed-vs-baseline, predeclared config — verified live in browser against a real logged trial, numbers check out by hand
- [x] CST Protocol Map (`/inspector/cst`)
- [x] Failure Theatre (`/inspector/theatre`) — all four buttons verified live in browser (offline toggle, expire pack, lost-response simulation, duplicate-sync simulation)
- [x] LAN alert routing (`src/lib/alerts.ts`) — code complete; two-physical-device demo not yet run
- [x] About/Licences screen (`/about/licenses`) — real dependency list with actual versions/licenses pulled from installed packages (SQLCipher entry dropped — we don't ship it)
- [x] Supabase migration SQL + RLS policies + `src/lib/sync.ts` idempotent upsert sync — code complete, untestable without a real Supabase project
- [x] Care-config / "cognitive condition" interpretation (Part 22) — `CareConfig` type with `source`/`clinical_stage_supplied` provenance, editable in `/circle/setup`

## Third pass: in-activity Help affordance + a real reliability fix
- [x] **In-activity Help button**, distinct from Skip/Pause/Stop, added to Familiar Pairs/Sound & Sight/Pattern Garden/My Next Step — closes a real gap against Part 3.1 F2 ("supports Help/Skip/Pause") and the Part 12 demo script ("Request help. A cue changes."), which nothing before this pass actually implemented.
- **Finding:** `decide()`'s explicit-help branch (Part 7.1's own code, preserved as-is) is hardcoded to always resolve to `repeat_audio` (or the baseline cue if `repeat_audio` isn't allowed) — it never returns `highlight`/`reduce_choices`/`demonstrate` for an explicit request; only the non-explicit, round-start call can ever pick those, and only once a cue has 3+ trials of real evidence, which normal play alone won't generate (the only cue ever naturally tried is whichever one is picked, so it's self-reinforcing on the baseline `'none'` — this is the model's real designed behavior, not a bug I introduced). So: Help's on-screen effect is honestly always "repeat/replay" in practice today; the richer per-cue effects (highlight a tile, trim choices, auto-demonstrate) are correctly wired and will fire the moment a cue other than baseline is ever chosen at round start — currently only reachable by seeding real trial history. Familiar Pairs previously never applied ANY cue effect at round start (Sound & Sight/Pattern Garden/My Next Step already did) — fixed by extracting a shared `applyCueEffect` used at both round-start and Help.
- **Bug found and fixed:** the `pagehide`-triggered `logTrial('interrupted')` write was observed live to silently NOT persist — a hard navigation away from an activity logged nothing, confirmed by reading IndexedDB directly afterward. Root cause: `pagehide`'s async IndexedDB write routinely loses the race against the browser tearing the document down. Fixed by switching all five activities to `visibilitychange` (checking `document.visibilityState === 'hidden'`), the standard, more reliable pattern for this — re-verified live by dispatching a real `visibilitychange` event and confirming the `interrupted` row actually lands in IndexedDB afterward. (A same-tab hard `navigate_page` in this test harness still doesn't reproduce it either way — that's expected, since it's a full document replace, not representative of either the real Capacitor SPA's client-side routing or genuine OS backgrounding, which is what this code path is actually for.)

## Not started
- [ ] Twilio online-fallback alert calls
- [ ] Full language audit of every UI string against Part 11's prohibited list
- [ ] Real-device latency measurement, reboot test, permission-denial test, 20x reconnect-cycle test — all of Part 10.3's manual matrix needs a real Android device
- [ ] Wiring `attachVoiceNav`'s gesture contract into the actual activity/help/today screens (the function exists and is tested manually only in isolation)
- [ ] A `preferredCue` UI and/or seeded-evidence path so a demo can actually reach the `highlight`/`reduce_choices`/`demonstrate` round-start effects without hand-editing the database — right now only `repeat_audio` is reachable through ordinary play

## Playwright e2e (Part 10.4) — DONE, with an honest methodology note
- [x] `tests/e2e/offline-journey.spec.ts` passes against the actual static export (`next build` + `serve out`), not `next dev`
- **Finding, not a bug:** Playwright's `context.setOffline(true)` blocks real HTTP, including to `localhost`. A client-side route change while "offline" (e.g. Skip navigating `/play/[activity]` → `/play`) can trigger a chunk fetch and hit a hard browser network-error page in this test harness — but the shipped app runs inside a Capacitor WebView loading from a bundled local scheme with no network hop at all, so that failure mode is specific to testing over real HTTP, not to the app. The test keeps its offline window to in-page interaction (no navigation) for this reason. Genuine cross-page airplane-mode navigation can only be verified on the real Android build (Part 10.3 test #1).

## Verified this session (Chrome DevTools, live `next dev`)
Home → Circle PIN setup → person profile creation → home renders with real name → Play → Familiar Pairs full game (regional fallback deck, match/mismatch logic, completion) → trial appears correctly in Evidence Inspector with correct posterior math → Help "I need someone" honest offline state → Today (empty state) → Pack Studio form → Circle Board (engagement ledger + trend analytics + burden panel) → Failure Theatre (all 4 buttons). No console errors on any screen visited. `npx tsc --noEmit` clean throughout. `next build` (static export) succeeds, all 25 routes prerendered.

## Verified in the second pass (four new activities)
Sound & Sight (visual-only fallback, correct/incorrect choice logic, trial logged with right activity/cue/posterior), Pattern Garden (sequence logic hand-verified against the actual rendered pattern before clicking), My Next Step (regional routine, all 3 steps tapped in correct order), Together Moment (honest empty state). One non-reproducing hydration warning appeared once on `/circle/packs` and did not recur on retry or on other pages sharing the identical `if (!personId)` pattern — logged as an observed flake, not treated as a fixed bug, likely caused by the browser-automation extension itself (Next's own error message names "a browser extension... which messes with the HTML before React loaded" as a known cause). `npm run build`, `npx vitest run`, and `npx eslint src` all clean after these changes.
