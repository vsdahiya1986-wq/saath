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

### Roadmap (not started)

Phases 3–7 per `docs/saath-kit/CLAUDE_CODE_PROMPT.md`: demo readiness (F1–F3 — F3 landed early with
R1), two new games, caregiver layer, accessibility pass, deploy. B7–B11 are Phase 6.
