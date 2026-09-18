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
the same key list — the two must stay in sync (`tests/content.test.ts` enforces it). Voice files are
generated through Bhashini:

```bash
npm run generate-audio   # needs Bhashini credentials in .env.local
```

Keys with no generated file fall back to the device's speech voice. For Assamese there is usually no
such voice, so an ungenerated cue stays **silent** rather than mispronounce. No Assamese text is
written by hand in code.

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
