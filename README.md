# SAATH

An offline-first memory companion for elderly people living with dementia in India's North Eastern
Region. Smart India Hackathon 2026 entry for **SIH26003** (Ministry of Development of North Eastern
Region).

The elder plays short, errorless Cognitive Stimulation Therapy activities; an on-device
Beta-Binomial engine adapts the difficulty and the help cue and explains every change in plain
words; reminders ring for medicine, water, activity and clinic visits; and a Circle of consented
family, neighbours and the ASHA worker share the caring work.

SAATH is a cognitive-stimulation and care-coordination aid. It does not diagnose, detect, stage or
treat dementia, and it makes no clinical claims.

<!-- Live URL badge goes here after the Vercel deploy (B6). -->

## The problem

Dementia care in the North Eastern Region runs on families, not clinics. Specialists are far away,
the elder speaks Assamese and often cannot read it, the phone in the house is a shared low-end
Android, and the network drops. A cognitive app that needs a login, a server, English literacy or a
data connection is an app that is never opened twice.

SAATH answers that shape: **everything runs on the phone, in Assamese, with the family's own photos
and voices, and it keeps working with the network off.**

## The seven activities

Each one delivers a named session of the 14-session CST programme. What each activity works on,
and the assessment task it resembles, is spelled out for the caregiver inside the app —
**Circle → Why these activities** — with the standing line that resembling an assessment is not
being one.

| Activity | Works on | CST session |
| --- | --- | --- |
| Today & Me | Knowing the time of day, the day and the season | 10 · Orientation |
| Hear & Find | Understanding a spoken word, matching it to a picture | 7 · Word Association |
| Sort the Home | Planning, grouping everyday things | 9 · Categorising Objects |
| My Next Step | Putting the steps of a task in order | 4 · Everyday Practical Life |
| Saah Pat · Tea Leaf | Looking carefully, staying with one task | 6 · Attention & Concentration |
| Apon Mukh · Dear Faces | Knowing faces, remembering people | 12 · Faces & Names |
| Together Moment | Talking with family about earlier days | 3 · Childhood & Reminiscence |

Every activity is **errorless**: a first wrong tap gives a gentle hint, a second reveals the answer
and moves on. There is never a third attempt, and nothing is scored.

## Offline first, not offline capable

`next build` produces a static export (`output: "export"`) that is served from a service worker and
packaged into an Android app with Capacitor. There is no server call in the elder's path at all:

- **Storage** — Dexie/IndexedDB on the device. Every write is local and immediate.
- **Voice** — Bhashini audio is generated at build time and shipped as files. Nothing is synthesised
  at run time, so a cue plays the same with the network off.
- **Reminders** — Capacitor local notifications, scheduled by the OS. A card that cannot ring says
  so, in those words, rather than pretending.
- **Sync is optional and one-way.** `syncTrials()` pushes activity records to Supabase when a family
  member has configured it. Photographs, voice notes, names and care notes are never sent. A
  caregiver-facing **No-Signal Mode** switch in Circle forces the whole app offline for a demo, and
  survives a reload.

## Keeping personal data on the phone

Field-level **AES-256-GCM** (`src/lib/crypto.ts`), with a 256-bit key minted on the device by a
CSPRNG and held in the platform secure store (Android Keystore / iOS Keychain via
`capacitor-secure-storage-plugin`; `localStorage` only in the web dev fallback). The key is never
hard-coded and never derived from a PIN, a device id or anything else guessable.

Encrypted at rest: the person's name, circle members' names and phone numbers, content-pack titles,
care-plan text, care notes, and every photo and voice-note blob. What the app keeps, what is locked,
what leaves the phone and how to erase all of it is written in plain language for the family in
**Circle → What we keep, and where**, which also names India's DPDP Act 2023 once, factually — it
describes what the app does and claims no certification.


## Running it

```bash
npm install
npm run preview     # production build, served at http://localhost:4180
```

**Demo and screenshots always from `npm run preview` or the Vercel URL**, never from `next dev`:
the dev server's chunks are not content-hashed, and Turbopack has crashed mid-demo before.

```bash
npm run dev         # development only
npm run lint        # eslint
npx tsc --noEmit    # typecheck
npm test            # vitest unit tests
npx playwright test # e2e against the static export
```

### Assamese audio

UI strings live in `src/content/strings.ts`, and `scripts/generate-audio.mjs` keeps its own copy of
the same key list — the two must stay in sync (`tests/content.test.ts` enforces it). Assamese is
produced and checked by machine, because no native reviewer is available (fix pack 07):

```bash
npm run translate            # Bhashini EN→AS, round-trip AS→EN, verdict per key → docs/i18n-review.{json,md}
npm run generate-audio       # voices only the Assamese that passed; unchanged text reuses its file
npm run verify-translations  # the offline gate (also in CI): what ships must be exactly what passed
```

A key **fails** on a denylisted concept (weapon, war, death, disease, …) in either language, or when the
round trip diverges in both meaning (sentence-embedding similarity < 0.75) and words (overlap < 0.5).
A failed key shows its English on screen and has no Assamese audio — English is honest, wrong Assamese
is not. `docs/i18n-review.md` lists every key, with the failures under "Needs human review" at the top.
No Assamese text is written by hand in code.

**What the gate actually caught.** The reminder warning used to read *"Not armed on this device"*.
Bhashini renders it as **এই ডিভাইচত অস্ত্ৰধাৰ নাই**, which comes back from the reverse model as
*"This device does not have a weapon"* — reproducible today, and exactly the kind of English idiom
that a five-language feature list ships unnoticed. The denylist stops it. The fix is not a better
translator, it is plainer English: the string is now *"Reminders are not set up on this phone."* →
**এই ফোনত ৰিমাইণ্ডাৰ আপ কৰা নাই।** → *"This phone does not have a reminder up."* (similarity 0.81,
word overlap 0.6, PASS). The same pass caught *"Tap the right basket"* being translated as the
right-**hand** basket.

**One language, verified, rather than five unchecked.** The scoring, the denylist and the gate are
language-agnostic — adding a language means a language code and one `--run`, and it arrives with the
same per-key evidence table. Assamese is the one we can defend, so it is the one that ships.

## SIH26003 clause map

| Clause | Where it is satisfied | Proof |
| --- | --- | --- |
| (a) memory | Apon Mukh · Dear Faces | `tests/e2e/games-progress.spec.ts` |
| (a) attention | Saah Pat · Tea Leaf | `tests/e2e/games-progress.spec.ts` |
| (a) routine recall | My Next Step | `tests/e2e/games-progress.spec.ts` |
| (a) pattern / object | Sort the Home | `tests/e2e/games-progress.spec.ts` |
| (a) orientation | Today & Me | `tests/e2e/games-progress.spec.ts` |
| (a) emotional engagement | Together Moment | e2e completes; content by hand |
| (b) adaptive AI | `src/lib/model.ts`, Evidence Inspector, in-game badge | `tests/model.test.ts` |
| (c) multilingual + voice | EN/AS strings, cached Bhashini audio, spoken cues | `tests/e2e/accessibility.spec.ts` (B7) |
| (d) cultural themes | regional manifest (24 objects, 5 routines), tea sprigs | `tests/content.test.ts` |
| (e) reminders | Ghonta: medicine, water, activity, clinic | `tests/reminders.test.ts` + e2e |
| (f) caregiver dashboards | Circle, Circle Board, Trend Lines, Care Note, Ghor Tiles, Visit Card | `tests/e2e/caregiver.spec.ts` + unit |
| (f) alerts | Circle Nudges | `tests/nudges.test.ts` |
| (g) offline | service worker + IndexedDB + No-Signal Mode | offline e2e; device test (B11) not yet run |
| (h) mobile / elderly UI | Easy View, 64 px targets, Rest Pause, Back/Home everywhere | `tests/e2e/accessibility.spec.ts` |
| secure data | AES-256-GCM fields and blobs | code + Circle privacy panel |

## Activity ids

Stored trials keep the ids the activities had before the September 2026 renames. The route slug and the
on-screen name changed; the stored id did not, so no history was migrated (fix pack 07 D2). Every screen
shows the human name.

| Stored id | Name on screen | Route |
| --- | --- | --- |
| `familiar_pairs` | Today & Me | `/play/today_me` |
| `sound_sight` | Hear & Find | `/play/hear_find` |
| `pattern_garden` | Sort the Home | `/play/sort_home` |
| `my_next_step` | My Next Step | `/play/next_step` |
| `saah_pat` | Saah Pat · Tea Leaf | `/play/saah_pat` |
| `apon_mukh` | Apon Mukh · Dear Faces | `/play/apon_mukh` |
| `together` | Together Moment | `/play/together` |

Old slugs (`/play/familiar_pairs` …) still redirect.

## Roadmap (not built)

These are planned and **not in the app**. The About screen (`/about/licenses`) says the same.

- **Bol · Speak** (F14): answer by voice in Assamese through Bhashini speech recognition. Needs testing with native speakers first.
- **Circle Message** (F15): a WhatsApp note to the circle when online. Needs Meta business verification.

## Deliberately not built

Rejected on purpose, not missing:

- **A 0–100 "cognitive score".** An unvalidated single number about a person's cognition reads as a
  clinical result to a worried family. Observational summaries instead, in the family's own words.
- **An LLM companion chat.** A model that can hallucinate, talking to a confused elderly user, is a
  safety problem — and it needs a live network and an API key, which is the opposite of this app.
- **A WhatsApp bot channel.** Good idea; Meta business verification does not fit the timeline.
- **More languages.** See above: unverified languages would cost the one thing this app does better
  than anyone.
- **Biometric / WebAuthn login for Circle.** The PIN works; new auth surface this close to
  submission is risk without a user.

## More

- [`SAATH_MASTER_FINAL.md`](SAATH_MASTER_FINAL.md) — the full build guide: the CST evidence base, the
  engine's arithmetic, the clause-by-clause design.
- [`CHANGELOG.md`](CHANGELOG.md) — what each fix pass changed, and why.
- [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md) — the working rules for this repo.
- [`docs/i18n-review.md`](docs/i18n-review.md) — the current translation evidence table, every key.

## Layout

```
src/app/          routes (Next.js app router, output: "export")
src/components/   play/ activity screens · ui/ shared elder-facing controls
src/lib/          db (Dexie + AES-256-GCM), model (the engine), audio, sync, i18n
src/content/      strings, activity metadata, CST content
public/content/   generated language manifests, regional packs
docs/saath-kit/   the Sept 2026 fix-pass brief
```

`AGENTS.md` holds the working rules. `CHANGELOG.md` records what each pass changed.
