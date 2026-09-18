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
