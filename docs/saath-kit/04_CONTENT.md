# 04 — Content to add

Rules that apply to everything here: no photographs of real people, no synthesized "regional" sounds, no
invented Assamese text in code (translations come from the Bhashini pipeline or a reviewed file), every
placeholder honestly labelled.

---

## 1. Regional manifest (`public/content/packs/regional/manifest.json`)

Keep the existing `source` / `reviewer` / `note` honesty block and extend it.

### 1.1 Objects — raise to at least 24
Existing 16 stay. Add at least 8 more everyday NER-household items as original icon + label shapes
(never photographs), each `{ id, icon, label }` with a unique id prefixed `reg_`:

`Gamosa (woven towel)`, `Xorai (offering tray)`, `Dhekia (fern greens)`, `Bamboo stool`,
`Clay water pot`, `Fishing net`, `Areca nut plate`, `Hand fan`.

If an icon does not exist yet, draw it in the same style as the current `IconTile` set (outline, 2 px
stroke, no fill dependence on colour). Do **not** ship an item without an icon.

### 1.2 Routines — raise to 5, each with 3–4 ordered steps
Existing morning / afternoon / evening stay. Add:
- `reg_prayer_routine` — "Evening prayer": light the lamp → sit down → say the prayer → put out the lamp.
- `reg_bath_routine` — "Bath time": fetch water → soap and wash → dry with the gamosa → change clothes.

Every step keeps `{ id, icon, label }` and every routine keeps the existing `note` that it is a generic
fallback to be replaced by the family's own routine.

### 1.3 Tea-sprig set for Saah Pat (F4)
Add a new block:

```json
"tea_sprigs": {
  "note": "Original line art drawn for this project. Targets are 'two leaves and a bud'; distractors differ in leaf count or shape, never only in colour.",
  "target": { "id": "sprig_two_leaves_bud", "icon": "sprig_target", "label": "Two leaves and a bud" },
  "distractors": [
    { "id": "sprig_three_leaves", "icon": "sprig_three", "label": "Three leaves" },
    { "id": "sprig_one_leaf", "icon": "sprig_one", "label": "One leaf" },
    { "id": "sprig_bud_only", "icon": "sprig_bud", "label": "Bud only" }
  ]
}
```

### 1.4 Sounds
Leave the existing `sounds.shipped: false` block and its explanation exactly as it is. Do not add audio.

---

## 2. Strings (`src/content/strings.ts` **and** the key list in `scripts/generate-audio.mjs`)

Add these keys (English text shown; Assamese comes from the pipeline). Keep the two lists in sync — add
the test in §5 below.

```
activity.saah_pat            Tea Leaf
activity.apon_mukh           Dear Faces
activity.saah_pat.intro      Tap only the sprigs with two leaves and a bud.
activity.apon_mukh.intro     Find the two pictures that match.
play.today_three             Today's three
play.all_activities          All activities

adapt.same                   Same pace as last time
adapt.gentler                A gentler round today
adapt.more                   A little more today
adapt.with_help              With a little help today

step.right                   That's right.
step.try_again               Let's look again.
step.moving_on               This one is the answer. Let's go on.
step.not_this_one            Not this one.

exit.skip_one                Skip this one
exit.end                     End

reminder.medicine            Medicine
reminder.hydration           Water
reminder.activity            Activity
reminder.appointment         Clinic visit
reminder.done                Done
reminder.not_now             Not now
reminder.due                 It is time.

rest.title                   Shall we rest for a while?
rest.rest_now                Rest now
rest.one_more                One more

circle.nudges                Circle nudges
circle.care_note             Add care note
circle.people                People on this device
circle.no_signal             No-Signal Mode
circle.sample_load           Load Aita's Day (sample)
circle.sample_clear          Clear sample data
circle.visit_card            Visit Card

status.sample                Sample
status.offline_simulated     Offline (demo)
display.text_size            Text size
```

**Care-note chips:** `note.meals`, `note.sleep`, `note.mood`, `note.fall` → "Meals", "Sleep", "Mood", "A fall".

---

## 3. Nudge and trend wording (fixed copy — do not paraphrase)

| Situation | Text |
| --- | --- |
| Medicine missed | "Medicine at {time} was not marked done." |
| Two quiet days | "No activities for two days." |
| Help pressed | "{Name} asked for help at {time}." |
| More help than usual | "Sessions needed more help than usual this week — worth a check-in with the health worker." |
| Not enough data for a trend | "Not enough comparable sessions yet." |
| Visit Card footer | "SAATH is a cognitive-stimulation and care-coordination aid. It does not diagnose or assess dementia." |

---

## 4. Aita's Day sample data generator (`src/lib/sampleData.ts`)

Deterministic (seeded) so screenshots are reproducible. Use a small seeded PRNG, not `Math.random()`.

```
person:    "Aita (sample)", language 'as', literacy 'non-literate', navigation 'visual',
           care_config { max_difficulty: 3, allowed_cues: ['none','repeat_audio','highlight'],
                         sensory_mode: 'both', source: 'caregiver_preference',
                         set_by: 'Sample data', clinical_stage_supplied: false },
           consent_ref 'SAMPLE-CONSENT-001', is_sample true

trials:    last 14 days, 2–3 sessions/day, across today_me, hear_find, sort_home, next_step,
           saah_pat, apon_mukh (skip together);
           difficulty mostly 2, occasionally 1 or 3;
           outcome 'completed' ~70%, 'not_completed' ~20%, 'skipped' ~10%;
           latency_ms 1500–6000, higher on days 8–9 (the dip Trend Lines will show);
           cue 'none' most days, 'highlight' more often on days 8–9;
           synthetic: true, is_sample: true

reminders: medicine 08:00 daily; water 09:00/11:00/13:00/15:00/17:00; activity 17:30;
           appointment next Tuesday 10:00 (care-plan text written as a caregiver would)

reminder_logs: 14 days; 2 'missed' (one medicine on day 3, one water on day 9), rest 'done'

members:   Rupa (family, Mon/Wed/Fri), Bhaskar (neighbour, Tue/Thu), Junali (asha, Sat/Sun); all consented

packs:     "Aita's kitchen" (object, approved), "Tea garden walk" (place, approved) — generated
           placeholder images drawn in-app, captions in English; no audio

care_notes: 3 entries over the last week (meals + a short note; sleep; mood)

nudges:    1 open 'medicine_missed' from day 3
```

Every generated row carries `is_sample: true`. `clearSample()` deletes them all, including blobs.

---

## 5. Content tests (`tests/content.test.ts`)

1. Every regional object / pattern / routine step has a non-empty `label`, a non-empty `icon`, a unique
   `id`, and no label equal to `...`.
2. Every routine has 3–4 steps and every step id is unique inside its routine.
3. `tea_sprigs` has exactly one target and at least three distractors.
4. Every key used by `t()` anywhere in `src/` exists in `STRINGS` (scan with a regex over the source).
5. The key list in `scripts/generate-audio.mjs` equals the key set in `strings.ts` (this is the sync test).
6. No file under `src/` contains the forbidden clinical words from `00_CONTEXT.md` §4 (case-insensitive),
   except inside comments that explain the rule.
