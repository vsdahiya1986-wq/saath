# 00 — Context for the SAATH fix pass

## 1. What SAATH is (one paragraph)

SAATH is an offline-first memory companion for elderly people living with dementia in India's North
Eastern Region. The elder plays short, errorless Cognitive Stimulation Therapy (CST) activities on a
shared phone or tablet; an on-device Beta-Binomial engine adapts the difficulty and the help cue and
explains every change in plain words; reminders ring for medicine, water, activity and clinic visits; and a
"Circle" of 3–6 consented family members, neighbours and the ASHA worker share the caring work. All
sensitive data is AES-256-GCM encrypted on the device; nothing leaves the device unless an optional
Supabase backend is configured.

## 2. The three winning angles (every screen should support at least one)

1. **Works with no signal and no reading** — fully offline, icon + voice first, runs on the family's phone.
2. **A circle, not a lone caregiver** — care shared across neighbours and the ASHA worker.
3. **AI you can check** — on-device, explainable adaptation, encrypted data, no diagnosis claims.

## 3. Official SIH26003 requirements (read live on sih.gov.in, 17 Sept 2026)

The solution should:

- **(a)** include interactive cognitive games and activities focused on memory improvement, attention and
  concentration, daily routine recall, pattern and object recognition, and emotional and mental engagement;
- **(b)** use AI/ML algorithms to adapt difficulty levels based on patient performance and cognitive condition;
- **(c)** support multilingual and voice-assisted interaction suitable for elderly users in NER;
- **(d)** include culturally familiar themes, visuals, sounds and regional language support;
- **(e)** provide reminders for medicines, hydration, daily activities and medical appointments;
- **(f)** enable caregivers and healthcare workers to monitor patient progress through dashboards and activity levels;
- **(g)** work in low-connectivity environments with offline functionality;
- **(h)** be accessible through mobile/tablet devices with a simple, elderly-friendly interface.

**Expected solution:** adaptive gaming and memory training modules; voice-enabled multilingual interface;
cognitive performance tracking and analytics dashboard; **caregiver monitoring and alert system**;
offline synchronisation; secure patient data management; simple accessible UI/UX; long-term engagement,
emotional well-being and social interaction.

After this pass, every clause above must map to a working screen. The mapping lives in
`05_TESTS_AND_DONE.md` §4.

## 4. Non-negotiable rules

### Clinical honesty
- SAATH is a cognitive-stimulation and care-coordination aid. **Never** claim diagnosis, detection,
  staging, validation or treatment. Forbidden words in UI and docs: "diagnose", "detect dementia",
  "clinically proven", "validated", "cure", "score your memory", "decline detected".
- Trend features say "worth a check-in with the health worker", never "decline".
- Sample data is always labelled **"Sample"**, everywhere it appears.
- Keep the existing language-discipline list in `SAATH_MASTER_FINAL.md` Part 11.

### Elderly UX (raise the current 56px standard)
- Touch targets **≥ 64 × 64 px**, at least 16 px apart.
- Body text ≥ 18 px; primary actions 22–24 px; titles per existing tokens.
- **No timers, no countdowns, no scores shown to the elder, no streaks.**
- No swipe-only, drag-only or double-tap interactions. Use **tap-to-place / tap-to-undo**.
  (The recent "drag-to-answer" addition in Pattern Garden must also accept a plain tap.)
- No auto-advancing carousels. Nothing moves unless the person tapped.
- Focus ring: **amber** (`#F59E0B`, 3 px) on `:focus-visible` everywhere.
- Every screen has visible **Back** and **Home**.
- **Errorless learning: a person can never get stuck.** Any tap produces gentle feedback and the activity
  always moves forward (see B1).
- Colour is never the only signal; pair it with icon/shape/text.

### Data and privacy
- Keep field-level AES-256-GCM encryption (`src/lib/crypto.ts`) for names, phones, pack titles, care-plan
  text, care notes, photos and recordings. Any **new** free-text or media field must be encrypted the same way.
- Coded gameplay data stays plaintext (needed for engine queries), as today.
- Core flows must never require the network. Supabase stays optional.
- DPDP Act 2023: consent reference stays on the profile; add "Delete this person and all their data"
  confirmation copy if missing.

### Content honesty
- **Never ship fake audio or synthesized "regional sounds".** Keep the existing decision documented in
  `public/content/packs/regional/manifest.json`.
- Regional items are original icon + label shapes, clearly marked as placeholders to be replaced by the
  family's own photos.
- Assamese text comes only from the existing Bhashini pipeline (`scripts/generate-audio.mjs`) or a
  native-speaker-reviewed file. Do not invent Assamese translations in code. Mark anything unreviewed.

### Languages
- English (`en`) and Assamese (`as`) only. Every new UI string goes into `src/content/strings.ts` **and**
  the key list inside `scripts/generate-audio.mjs` (they must stay in sync; add a test that checks this).

### Naming (important for the SIH "idea must be new" rule and for originality)
- Features inspired by other SIH26003 teams use **only SAATH's own names** (see `02_FEATURES.md`).
- Never copy another team's code, artwork, text, game names or branding. Never name another team in
  the app or docs.
- Do not reuse anything from the earlier "Recall" / "Cognitive NER" prototypes (names, URLs, screenshots).

## 5. Live test evidence (production-like build on localhost:4180, 17 Sept 2026)

| Area | Result |
| --- | --- |
| Welcome → Circle PIN → profile setup | Works; stats change from "..." to real 0s after save |
| Consent / privacy copy | Works, strong |
| Language EN/AS | Works; Play screen fully rendered in Assamese; once reverted to English after navigation |
| Home (Play, Today, Circle, Help) | Works; "3 played so far" matched Circle Board |
| **Sort the Home** (`/play/pattern_garden`) | **Works end to end** (4/4, pile-up icons, completion + adaptive note) |
| **Together Moment** (`/play/together`) | **Works** (prompt + "Tell me more") |
| **Today & Me** (`/play/familiar_pairs`) | **Broken**: tapping Evening / Morning / Afternoon highlights the choice, stays on "Step 1 of 2", no console error |
| **Hear & Find** (`/play/sound_sight`) | **Broken**: target word renders as "..."; tapping a choice highlights it, stays on "1 of 3" |
| **My Next Step** (`/play/my_next_step`) | **Broken**: slot 1 shows "Next step…", slots 2–3 empty; tapping "Short walk" highlights it, fills nothing, never advances. Note: the fallback routines in the manifest have **4** steps but the UI rendered **3** slots |
| Skip button | Ends the whole activity and returns to `/play` |
| Adaptive badge in game | Shows engine text to the elder: "Insufficient comparable evidence (need 3 per cue at this difficulty). Using conservative baseline." |
| Today's reminders | Screen works; 0 reminders; firing untested |
| Circle, Board, Roster, Memory Garden | Screens work; Board "3 sessions recorded" |
| Route names | Mismatched with visible names |
| Dexie | Console warning: packs query `{person_id, state}` "would benefit from a compound index [person_id+state]" |
| Dev server | Turbopack crashed once ("Jest worker encountered 2 child process exceptions") — demo from a production build only |
| Floating purple widget (Home / camera / video / Manage) | Seen on every SAATH page. **Check whether it is in our code.** If it is ours, remove it (R6). If it is a browser extension, ignore it. |
