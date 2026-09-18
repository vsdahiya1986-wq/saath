# 03 — What to remove, merge or hide (Phase 2)

Goal: nothing in the app that we cannot defend in 30 seconds to a judge, and no dead code that a
reviewer might open. Removals are **git-tracked deletions** (recoverable in history), not comment-outs.

**Before deleting anything:** `rg` for every import and route reference, delete the references first, then
the file, then run the four gates. Record each removal in `CHANGELOG.md` with one line of reasoning.

---

## R1 — Failure Theatre (`/inspector/theatre`) → fold into No-Signal Mode

- **Why:** an internal chaos-testing screen aimed at ourselves. Its one genuinely useful control (simulated
  offline) belongs in Circle as **No-Signal Mode** (F3), where a caregiver or judge can find it.
- **Do:** move the simulated-offline control to Circle (F3); delete `src/app/inspector/theatre/page.tsx`
  and its link from `src/app/inspector/page.tsx`; keep `setForcedOffline`/`isForcedOffline` in `sync.ts`
  but update the comment to name No-Signal Mode.
- Keep the pack-expiry and help-routing demos **only** if they are already referenced elsewhere; otherwise
  delete them with the page.

## R2 — Handoff screen (`/circle/handoff`) → delete

- **Why:** device-to-device configuration handoff is unfinished, is not in the official requirement list,
  and costs demo time to explain. Multi-person on one device (F9) covers the real ASHA workflow.
- **Do:** delete `src/app/circle/(protected)/handoff/page.tsx`; remove its entry from the Circle links
  array; remove the "Pending handoffs" section in `board/page.tsx`.
- **Database:** keep the `handoffs` table declaration and its cleanup in `deletePerson()` for now
  (removing a Dexie table needs a migration and risks data loss for zero gain). Add a comment:
  `// unused since Sept 2026 — kept to avoid a destructive migration`.

## R3 — Voice Legacy (`/circle/legacy`) → merge into Memory Garden

- **Why:** a separate "permanent archive + ZIP export" screen duplicates Memory Garden/Pack Studio and adds
  a ZIP code path (`src/lib/zip.ts`) that nothing else uses.
- **Do:** add an **Export recordings** button inside the Memory Garden / Pack Studio screen that reuses
  `exportLegacyZip()`; delete `src/app/circle/(protected)/legacy/page.tsx` and its Circle link.
- Keep `src/lib/voiceLegacy.ts` and `src/lib/zip.ts` **only** if the export button ships in this pass;
  if you decide to drop the export, delete both files too. State which you chose.

## R4 — Route names that do not match the visible names

Rename the activity routes so a judge reading the URL sees the same name as the screen:

| Now | New |
| --- | --- |
| `/play/familiar_pairs` (Today & Me) | `/play/today_me` |
| `/play/sound_sight` (Hear & Find) | `/play/hear_find` |
| `/play/pattern_garden` (Sort the Home) | `/play/sort_home` |
| `/play/my_next_step` | `/play/next_step` |
| `/play/together` | `/play/together` (unchanged) |
| new | `/play/saah_pat`, `/play/apon_mukh` |

- The `Activity` union in `db.ts` is the same set of ids; **migrate existing trial rows** in a Dexie v2
  upgrade (map old id → new id) so history and the engine keep working, or keep the stored ids and map
  only at the route layer — pick one, write it in the commit body, and make sure `model.ts` queries match.
- Add redirects from the old paths (Next.js `redirects()` or a small route handler) so any link we already
  shared still works.

## R5 — Create-React leftovers and dead assets

- Delete unused starter SVGs in `public/`: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`
  (confirm with `rg` first).
- Remove any `README` text left from `create-next-app`.
- Delete unused exports flagged by `npx knip` or `eslint --report-unused-disable-directives` if easy;
  do not chase this far.

## R6 — The floating purple widget (Home / camera / video / Manage)

- A floating purple panel with Home, a camera button, a video button and "Manage" appeared over **every**
  SAATH page during testing. If it comes from our code, delete it: it covers content, has no place in an
  elder-facing app, and a judge will ask what it records.
- **First check** whether it is ours: `rg -n "camera|video|Manage" src/components src/app | head`. If
  nothing matches, it is a browser extension on the test machine — say so and leave the code alone.

## R7 — Copy and label clean-up

- Remove the technical engine sentence from the elder-facing badge (B5).
- Remove any remaining "Failure Theatre", "Voice Legacy", "Handoff" wording from screens, README,
  `BUILD_CHECKLIST.md` and `SAATH_MASTER_FINAL.md` cross-references (leave the master plan's history
  sections intact, but add a note that these were removed in the Sept 2026 pass).
- Remove any place where difficulty or a score is shown to the elder as a number.

## R8 — Do **not** remove

- The Bayesian engine, Evidence Inspector, encryption, Circle model, regional-manifest honesty notes,
  the "no fake sounds" decision, the Playwright offline test, Capacitor/Android project, Supabase
  migrations (optional sync is a legitimate roadmap claim).
