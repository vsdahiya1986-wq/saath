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

### Roadmap (not started)

Phases 2–7 per `docs/saath-kit/CLAUDE_CODE_PROMPT.md`: removals, demo readiness, two new games,
caregiver layer, accessibility pass, deploy. B7–B11 are Phase 6.
