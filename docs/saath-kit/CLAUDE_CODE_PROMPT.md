# SAATH — Master Prompt for Claude Code

> **How to use this kit**
> 1. Copy the whole `saath-kit` folder into the root of your `saath` repo as `docs/saath-kit/`.
> 2. Open a terminal in the repo, start Claude Code, and paste **everything below the line** as your first message.
> 3. Claude Code works one phase at a time and stops after each phase. Reply `continue` to move on.
> 4. After Phase 1 is pushed, tell Claude (Cowork) so it can re-test the live app in your browser.

---

You are the lead engineer on **SAATH**, our Smart India Hackathon 2026 entry for problem statement
**SIH26003 (Ministry of Development of North Eastern Region)** — "AI-Based Cognitive Gaming and Memory
Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)". Idea submission closes
**30 September 2026**; we submit on **27 September**. The PPT is judged on screenshots and a live link, so
every screen you touch must look finished and work end to end.

## Read these first, in this order, before writing any code

1. `docs/saath-kit/00_CONTEXT.md` — product, official requirements, non-negotiable rules, live test evidence.
2. `docs/saath-kit/01_BUGS.md` — every confirmed defect, with reproduction steps, suspects and acceptance tests.
3. `docs/saath-kit/02_FEATURES.md` — every new feature, with exact names, UX, data model and tests.
4. `docs/saath-kit/03_REMOVALS.md` — what to delete or hide, and how to do it safely.
5. `docs/saath-kit/04_CONTENT.md` — content data to add (regional items, routines, sample profile, strings).
6. `docs/saath-kit/05_TESTS_AND_DONE.md` — test plan, starter test files, manual matrix, screenshot list, definition of done.
7. Existing repo guidance: `AGENTS.md`, `CLAUDE.md`, `BUILD_CHECKLIST.md`, `SAATH_MASTER_FINAL.md`
   (the master plan is the source of truth for the engine, encryption and language rules; this kit
   overrides it only where it says so explicitly).
8. **Next.js 16 is not the version you know.** Before touching routing, static export or the app router,
   read the relevant guide in `node_modules/next/dist/docs/` as `AGENTS.md` instructs.

## Important: the code on disk is newer than GitHub

GitHub was last pushed on 12 Sept 2026 (commit `585d6c1`). The build we tested on 17 Sept has
different game names and screens ("Today & Me", "Hear & Find", "Sort the Home", "My Next Step",
"Together Moment"). **Trust the files on disk, not the file names quoted in this kit.** Where this kit
names a file (e.g. `src/components/play/FamiliarPairs.tsx`), locate the current equivalent with
`grep`/`rg` first and tell me the real path before editing.

## Working rules (apply to every phase)

- **Plan, then act.** At the start of each phase, print a short plan: files you will change, tests you
  will add, risks. Then do it.
- **Tests first for bugs.** For every defect in `01_BUGS.md`, write the failing test, watch it fail,
  fix, watch it pass.
- **Gates after every phase** — all must be green before you commit:
  `npm run lint` · `npx tsc --noEmit` · `npm test` · `npx playwright test`
  (Playwright serves the static export, see `playwright.config.ts`; do not test against `next dev`).
- **Commit and push per phase** with a message like `phase-1: fix answer progression in choice games`
  and a body that states the root cause. Never force-push. Never commit `.env*`.
- **Update `CHANGELOG.md`** (create it if missing) after each phase: what changed, what is still roadmap.
- **Update `BUILD_CHECKLIST.md`** ticks as items land.
- **Stop at the end of each phase** and show me: test output summary, files changed, anything you were
  unsure about. Wait for `continue`.
- If something in this kit conflicts with what you find in the code, **stop and ask** rather than guess.
- Do not add new runtime dependencies without telling me why; prefer what is already in `package.json`.

## Phases

| Phase | Goal | Details in |
| --- | --- | --- |
| 0 | Safety snapshot: commit + push everything currently on disk | this file |
| 1 | Fix every P0 bug so all 5 existing activities complete end to end | `01_BUGS.md` B1–B6 |
| 2 | Remove / hide what is not needed; clean routes and naming | `03_REMOVALS.md` |
| 3 | Demo readiness: Aita's Day sample profile, Ghonta reminders, No-Signal Mode | `02_FEATURES.md` F1–F3 |
| 4 | Two new games: Saah Pat (attention) and Apon Mukh (memory) + Aajir Tini daily set | `02_FEATURES.md` F4–F6 |
| 5 | Caregiver layer: Circle Nudges, Care Note, Ghor Tiles, Trend Lines, Visit Card | `02_FEATURES.md` F7–F11 |
| 6 | Easy View + Rest Pause accessibility pass; P1/P2 bugs | `02_FEATURES.md` F12–F13, `01_BUGS.md` B7–B11 |
| 7 | Production build, full test run, Vercel deploy, screenshots for the PPT | `05_TESTS_AND_DONE.md` |

### Phase 0 — Safety snapshot (do this before anything else)

1. `git status` and `git log --oneline -5`. Show me the output.
2. If there are uncommitted changes: `git add -A`, review the staged list for secrets
   (`.env`, keys, `*.keystore`, Bhashini credentials) and unstage any, then
   `git commit -m "wip: snapshot of local build before fix pass"` and `git push`.
3. Create branch `fix/sih-final` and work there. Push the branch.
4. Record in `CHANGELOG.md`: date, snapshot commit hash, "starting SIH final fix pass".
5. Run the four gates once and report the baseline (what already fails).

**Stop.**

### Phases 1–7

Follow the linked files exactly. Each item there has an ID (B1, F4, R2 …). Use the IDs in commit
messages and in `CHANGELOG.md`.

## Definition of done (whole job)

See `05_TESTS_AND_DONE.md` §5. In short: all seven activities reach their completion screen by test
and by hand, in English and Assamese, online and in No-Signal Mode; Aita's Day loads in one tap; a Ghonta
reminder fires and logs "Done"; a Circle Nudge appears for a missed reminder; nothing references removed
features; all gates green; deployed to Vercel; screenshots saved to `docs/screenshots/`.

Start with **Phase 0** now.
