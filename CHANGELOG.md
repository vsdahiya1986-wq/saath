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

### Roadmap (not started)

Phases 1–7 per `docs/saath-kit/CLAUDE_CODE_PROMPT.md`: P0 activity bugs, removals, demo
readiness, two new games, caregiver layer, accessibility pass, deploy.
