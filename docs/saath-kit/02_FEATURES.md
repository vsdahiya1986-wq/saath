# 02 — Features to add

Every feature below is inspired by what rival SIH26003 teams do well, but carries **our own name and our
own implementation**. Never copy their code, art, text or names; never mention another team in the app.

Naming reminder: Assamese names are working titles pending native-speaker review. Where a name appears in
the UI, show the English gloss too, e.g. **Saah Pat · Tea Leaf**.

| ID | SAATH name | Phase | PS clause |
| --- | --- | --- | --- |
| F1 | Aita's Day (sample profile) | 3 | (f), screenshots |
| F2 | Ghonta reminders | 3 | (e) |
| F3 | No-Signal Mode | 3 | (g) |
| F4 | Saah Pat · Tea Leaf (attention game) | 4 | (a) attention |
| F5 | Apon Mukh · Dear Faces (memory game) | 4 | (a) memory, (d) |
| F6 | Aajir Tini · Today's Three | 4 | (a), (b) |
| F7 | Circle Nudges | 5 | expected: alert system |
| F8 | Care Note | 5 | (f) |
| F9 | Ghor Tiles (person switcher) | 5 | (f), (h) |
| F10 | Trend Lines | 5 | (f) |
| F11 | Visit Card (1-page summary) | 5 | (f) |
| F12 | Easy View (text size + targets) | 6 | (h) |
| F13 | Rest Pause | 6 | (h), well-being |
| F14 | Bol · Speak (voice answers) | Roadmap only | (c) |
| F15 | Circle Message (WhatsApp) | Roadmap only | (e) |

---

## F1 — Aita's Day (sample profile)

**Why:** judges and screenshots need a populated app in one tap. Empty states make a strong build look unfinished.

**Where:** Circle → new button "Load Aita's Day (sample)" near the top; and on the Welcome screen a
secondary link "See a sample" (below "Set up a profile").

**What it creates** (all rows flagged `is_sample: true` — add this boolean to every table it writes):
- Person: display name **"Aita (sample)"**, language `as` with an English toggle, literacy `non-literate`,
  navigation `visual`, `care_config.max_difficulty = 3`, `source: 'caregiver_preference'`,
  `consent_ref: 'SAMPLE-CONSENT-001'`.
- 14 days of trials across all activities (see `04_CONTENT.md` §4 for the exact generator rules):
  realistic latencies (1.5–6 s), ~70 % completion at difficulty 2, a dip on days 8–9 (used by F10),
  `synthetic: true` so the engine never treats them as real evidence for a real person.
- 4 reminders: medicine 08:00, water every 2 h (09:00, 11:00, 13:00, 15:00, 17:00), walk 17:30,
  clinic appointment next Tuesday 10:00 — with adherence logs for the last 14 days (2 missed, feeding F7/F10).
- 3 Circle members: daughter Rupa (family, on-call Mon/Wed/Fri), neighbour Bhaskar (neighbour, Tue/Thu),
  ASHA worker Junali (asha, Sat/Sun) — all `consented: true`.
- 2 Memory Garden packs: "Aita's kitchen" and "Tea garden walk", each with a generated placeholder image
  (drawn in-app, not a photograph) and a caption. No fake voice recordings.
- 3 care notes (F8) and 1 open Circle Nudge (F7).

**Rules**
- A permanent "Sample" chip in the header whenever the active person `is_sample`.
- "Clear sample data" button removes every `is_sample` row and any blobs it created.
- The sample person is never uploaded by sync (`synthetic`/`is_sample` filtered out in `sync.ts`).
- Implementation: `src/lib/sampleData.ts` exporting `loadSample()` / `clearSample()`, both idempotent.

**Tests:** unit — `loadSample()` twice leaves exactly one sample person; `clearSample()` removes all rows
and blobs. Playwright — one tap from Welcome reaches a populated Home with "Sample" visible.

---

## F2 — Ghonta reminders (make reminders real)

**Why:** clause (e) is scored and today nothing fires.

**Behaviour**
1. Circle → Reminders: create/edit/delete for the four categories (medicine, hydration, activity,
   appointment). Care-plan text is typed by the caregiver and stays encrypted; never generated.
2. Scheduling: Capacitor `LocalNotifications` on Android (already wired in `src/lib/reminders.ts`), and a
   web fallback using the service worker + `Notification` API when permission is granted; if neither is
   available, show an in-app due banner when the app is open. **Never fail silently** — the Reminders
   screen shows per-reminder status: "Will ring on this device" / "This browser cannot ring — install the
   app" / "Permission needed".
3. When a reminder is due, the elder sees one full-screen card: big icon, the care-plan text in large type,
   a spoken cue (cached Bhashini audio for the category, then the text if audio exists), and two buttons:
   **Done** (≥ 64 px, primary) and **Not now**.
4. Log every outcome to a new table `reminder_logs`:
   `{ id, person_id, reminder_id, due_at, responded_at?, outcome: 'done' | 'snoozed' | 'missed', is_sample }`.
   "Missed" is written by a sweep when `now > due_at + 30 min` and nothing was logged.
5. `rearmAll()` runs on app start and after a reboot (Capacitor `App` resume listener if available).

**Copy:** category titles come from `strings.ts` (`reminder.medicine` etc.), both languages.

**Tests:** unit — the due/missed sweep marks exactly the right rows at the boundary (29 min → nothing,
31 min → missed). Playwright — a reminder seeded 1 minute in the future shows the due card in-app and
"Done" writes a `reminder_logs` row.

---

## F3 — No-Signal Mode

**Why:** clause (g) and a memorable demo moment.

- Replace the internal "Failure Theatre" toggle (see R1) with a caregiver-facing switch in Circle:
  **No-Signal Mode** — "Pretend this phone has no network, to show how SAATH keeps working."
- When on: `sync.ts` refuses to sync and states why; the status badge on every screen reads
  **"Working offline"** with an icon; everything else keeps working.
- Add a small persistent badge to person-facing screens showing real network state
  (online / offline / simulated offline).
- Persist the flag in `localStorage` so it survives reload during a demo.

**Tests:** Playwright — with No-Signal Mode on, complete a game, add a Care Note, then turn it off and
assert the sync badge changes and queued items are marked for sync.

---

## F4 — Saah Pat · Tea Leaf (attention and concentration)

**Why:** clause (a) names attention/concentration and we have no dedicated attention activity.

**Mechanic (visual cancellation, errorless):** a grid of tea sprigs; the person taps only the
"two leaves and a bud" sprigs among look-alikes (three leaves, one leaf, a bud alone). No timer.
- Difficulty 1: 6 tiles, 2 targets, targets clearly different.
- Difficulty 2: 9 tiles, 3 targets.
- Difficulty 3: 12 tiles, 4 targets, distractors more similar.
- Difficulty 4: 16 tiles, 5 targets.
- Tapping a target: it fills in and a soft tick appears. Tapping a non-target: it dims briefly with
  "Not this one" spoken; **never a penalty, never a score**.
- Round ends when all targets are found, or after `targets + 4` non-target taps → the remaining targets
  are gently revealed and the round completes.
- 2 rounds per session; wire to `decide()` exactly like the working game, log `TrialEvent` with
  `activity: 'saah_pat'` (add to the `Activity` union and every switch), `perseverative_errors` = repeat
  taps on already-cleared tiles.
- Artwork: original SVG sprigs drawn in-app (same approach as existing `IconTile`), high contrast,
  distinguishable by shape not colour alone.

---

## F5 — Apon Mukh · Dear Faces (memory)

**Why:** clause (a) memory + (d) cultural familiarity; the family's own photos are the strongest content.

**Mechanic:** card-matching using approved Memory Garden photos of people/places, falling back to regional
objects when no family content exists (the existing `buildDeck()` fallback logic is a good model).
- Pairs: 3 / 4 / 5 / 6 by difficulty. Tap to flip, mismatches flip back after 1.2 s, matches stay.
- Under each matched pair show the caption ("Rupa, your daughter") and speak it if audio exists.
- Ends when all pairs are matched, or after `pairs × 4` mismatches → remaining pairs are revealed calmly
  and the round completes.
- `activity: 'apon_mukh'`.
- If the app already has a card-matching implementation on disk (the 12 Sept code had one in
  `FamiliarPairs.tsx`), **reuse it** rather than writing a new one — rename and repoint it at Memory
  Garden photos.

---

## F6 — Aajir Tini · Today's Three

- Home "Play" card shows three suggested activities for today, chosen from different cognitive domains,
  preferring those least recently played (`src/lib/rotation.ts` already does something similar — extend it).
- The full list stays available below ("All activities").
- Copy: "Today's three" / domain badges as today.
- Tests: unit — given a trial history, the picker returns three distinct activities from three domains.

---

## F7 — Circle Nudges (caregiver alert system)

**Why:** the official Expected Solution names a "caregiver monitoring and alert system"; we have none.

**Rules** (new table `nudges`: `{ id, person_id, kind, created_at, state: 'open'|'acknowledged'|'resolved', acknowledged_by?, note?, is_sample }`):
| Kind | Trigger | Card text (never alarming) |
| --- | --- | --- |
| `medicine_missed` | a medicine reminder logged `missed` | "Medicine at 8:00 was not marked done." |
| `quiet_days` | no completed activity for 2 days | "No activities for two days." |
| `help_pressed` | Help request raised | "Aita asked for help at 4:10 pm." |
| `steadier_help` | over the last 7 days the engine chose a help cue in ≥ 60 % of sessions (min 5 sessions) | "Sessions needed more help than usual this week — worth a check-in with the health worker." |

- Shown at the top of Circle and on Circle Board, newest first, with **Acknowledge** and **Add note**.
- Reuse the existing follow-up state machine (`src/lib/events.ts`) if it fits; do not build a second one.
- Routing to a member reuses `pickOnCall()` (`src/lib/rotation.ts`).
- Wording rules: describe the observation, never a conclusion. Forbidden: "decline", "worsening", "risk".

---

## F8 — Care Note (30-second log)

- Circle → "Add care note": four chips (meals, sleep, mood, fall) + optional one-line text (encrypted),
  auto-stamped with time and the member's name. New table `care_notes`.
- Shows in Circle Board timeline, newest first; included in Visit Card (F11).
- Target: complete in under 30 seconds with three taps; no free typing required.

---

## F9 — Ghor Tiles (person switcher)

- Circle → People on this device: large photo/initial tiles, one tap to switch the active person.
- No typing, no PIN between people (PIN already guards Circle itself).
- Header on person-facing screens shows the active person's name + "Switch" when more than one exists.
- Designed for an ASHA worker carrying one device between households.

---

## F10 — Trend Lines

- Inside Evidence Inspector (jury view) and a simplified version on Circle Board.
- Per activity and per cognitive domain: completion rate and median latency over 7 / 30 / 90 days,
  drawn as a simple inline SVG line (no chart library).
- **Only compare like with like** — same activity, same difficulty, same cue (Part 18 of the master plan).
  If a window has fewer than 5 comparable trials, print "Not enough comparable sessions yet" instead of a line.
- Labels: "worth a check-in", never "decline".

---

## F11 — Visit Card (one page for the doctor or ASHA)

- Circle → "Visit Card": one printable page (use `window.print()` with a print stylesheet; no new library).
- Contents: person's first name + age band, date range, sessions completed, adherence (from `reminder_logs`),
  domains practised, the last 5 care notes, any open nudges, and a footer:
  "SAATH is a cognitive-stimulation and care-coordination aid. It does not diagnose or assess dementia."
- Big type (≥ 14 pt print), black on white, no colour dependence.

---

## F12 — Easy View

- Global control (Circle → Display, plus a quick control on Home): text size **A / A+ / A++**
  (scale 1.0 / 1.15 / 1.3 applied to the existing CSS type tokens), saved per person.
- Raise every touch target to ≥ 64 px and spacing to ≥ 16 px; audit with a Playwright check that walks the
  person-facing pages and asserts each `button`/`a` bounding box ≥ 64 × 64.
- Amber `:focus-visible` ring everywhere.

---

## F13 — Rest Pause

- After ~10 minutes of continuous play, show a calm full-screen card: "Shall we rest for a while?"
  with **Rest now** and **One more**. Never forced, no countdown shown.
- Log `rest_prompt_shown` / the choice as a plain event (not a trial outcome).

---

## F14 / F15 — Roadmap only (do not build)

- **Bol · Speak** — answer by voice in Assamese via Bhashini ASR. Needs native-speaker testing.
- **Circle Message** — WhatsApp note to the circle when online. Needs Meta business verification.

Add both to a "Roadmap" section in `README.md` and in the app's About screen, clearly labelled as not built.
