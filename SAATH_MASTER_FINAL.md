# SAATH — Complete Build Guide

> **Sept 2026 fix pass:** Handoff (F11), the Voice Legacy screen and Failure Theatre were
> removed — see `CHANGELOG.md` Phase 2 (R1–R3). Recording export moved into Memory Garden and
> simulated offline became caregiver-facing **No-Signal Mode** in Circle. The history sections
> below are left as they were written.

## SIH26003 · AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in NER
### Ministry of Development of North Eastern Region (MDoNER) · Software · MedTech/BioTech/HealthTech

**Built against the official problem statement text. Start: 9 September 2026.**

---

# PART 1 — THE WINNING FRAME

## 1.1 What every other team will build
"Brain training games for old people, with an AI that makes it harder when you do well." A features list. No clinical grounding. No answer when a doctor on the jury asks *"why would this work?"*

## 1.2 What you build instead

**SAATH is a digital delivery vehicle for culturally-adapted Cognitive Stimulation Therapy (CST) for the North Eastern Region.**

CST is not something we invented. It is a named psychosocial intervention with real evidence:

- A Cochrane systematic review of 15 RCTs (718 participants) found **consistent significant benefit to cognitive function following treatment, over and above medication effects, sustained at follow-up up to three months.** Secondary analyses showed benefits to quality of life, well-being, communication and social interaction. (Aguirre, Woods, Spector & Orrell, *Ageing Research Reviews*, 2013; Cochrane CD005562)
- A 2024 systematic review and meta-analysis of the **original 14-session CST protocol** found strong evidence of positive treatment effects for global cognition, language and quality of life, with the conclusion that CST should be delivered routinely for mild-to-moderate dementia.
- **Official guidelines exist for adapting CST to other cultures** (Aguirre, Spector & Orrell) — meaning cultural adaptation for NER is a documented, legitimate methodology, not our improvisation.
- A 2025 systematic review aiming at personalization found **personalized activities are associated with greater engagement and adherence, making the experience more meaningful and empowering**, and that a culturally and psychologically personalized CST programme enhanced engagement and symptom acceptance.
- NICE NG97 recommends offering group cognitive stimulation to people with mild-to-moderate dementia.

**Why this wins:** when a jury member asks "what's your evidence base?", every other team says "studies show games help." You name the intervention, the Cochrane review, the 14-session protocol, and the official cultural-adaptation guidelines you followed. Then you say the honest thing: *"CST has evidence. Our digital delivery of it does not yet — that is what a pilot would test."* That combination of grounded and honest is extremely rare in a hackathon room.

## 1.3 The three product mechanisms

**A. One approved content pack, two contexts.** A family member photographs a familiar object and its usual place and records a short prompt in their own voice. That single pack powers both a cognitive activity and a practical everyday reminder. One approval record, one version history.

**B. Bounded local AI.** A small Bayesian model recommends the next difficulty and assistance cue from observed outcomes. Constraints sit outside the model. Judges can inspect the arithmetic.

**C. The Circle.** Care is routed to a *circle* of nearby consented people (family, neighbour, volunteer, ASHA) — not a single distant guardian. This matches how Indian dementia care actually works: the Odisha caregiver study found families treat it as **collective responsibility with task-sharing**, and Indian research identifies **task-sharing through mobile technology by community workers** as the scalable model. NER uniquely has dense village-level institutions to plug into (Young Mizo Association: 805 branches; Mizoram Upa Pawl for elders; Dorbar Shnong in Meghalaya; namghar in Assam).

## 1.4 One-line pitch
> "SAATH delivers culturally-adapted Cognitive Stimulation Therapy offline, in the patient's own dialect, in the voices of their own family — and routes help to the neighbours who are actually there."

---

# PART 2 — OFFICIAL REQUIREMENT → FEATURE MAP

Every letter below is verbatim from the official PS. Nothing invented, nothing missed.

| PS req | Official wording | Feature | How you demo it |
|---|---|---|---|
| **a.1** | Memory improvement | **Familiar Pairs** — match approved familiar objects from the household's own pack | Play a round; show trial record with full context |
| **a.2** | Attention and concentration | **Sound & Sight** — match a reviewed sound/spoken cue to an image; visual-only mode available | Toggle visual-only mode to show hearing loss isn't penalised |
| **a.3** | Daily routine recall | **My Next Step** — arrange a caregiver-approved low-risk routine sequence | Show routine preview, cue, skip/stop |
| **a.4** | Pattern and object recognition | **Pattern Garden** — continue a shape/object sequence using shape+contrast, never colour alone | Show adjustable complexity |
| **a.5** | Emotional and mental engagement | **Together Moment** — shared reminiscence/conversation activity a circle member joins. No score, no streak. | Show exit + content-removal in two taps |
| **b** | AI/ML adapts difficulty based on patient performance and cognitive condition | **Bayesian assistance & difficulty engine** + care-config bounds. "Cognitive condition" = documented care-team configuration constraining difficulty, NOT an inferred disease stage | Open **Evidence Inspector**: posterior ranking, sample size, learned-vs-baseline mode, what it changed |
| **c** | Multilingual and voice-assisted interaction | Bhashini-generated Assamese system audio (cached offline) + family-recorded dialect audio for all personal content. Full voice-guided navigation mode | Play a prompt in airplane mode; switch to voice-guided nav and operate eyes-closed |
| **d** | Culturally familiar themes, visuals, sounds, regional language support | **Pack Studio** — content comes from the household itself, plus optional reviewed regional asset library. Sounds are timbrally distinct (gong/wood/flute), never adjacent sine tones | Create a pack live in 60 seconds |
| **e** | Reminders: medicines, hydration, daily activities, medical appointments | All four categories via native Android alarms (Capacitor). Care-plan text only — never AI-generated dosing | Fire each category; show one surviving a reboot |
| **f** | Caregivers and healthcare workers monitor progress through dashboards and activity levels | **Circle Board** — observations, activity levels, assistance used, data freshness, on-call member, pending handoffs | Show "No data received since Tuesday" ≠ "No activity since Tuesday" |
| **g** | Work in low-connectivity environments with offline functionality support | Everything above runs offline. Opportunistic idempotent sync. Explicit pending states | Airplane-mode cold start; reconnect twice, prove no duplicate |
| **h** | Mobile/tablet, simple elderly-friendly interface | Three-screen model, 3 literacy tiers, 56px+ targets, 18px+ text, analog clock, no timers | Switch literacy tier live and show the same screen re-weight |
| **Expected** | Caregiver monitoring **and alert system** | Circle alert routing with explicit state machine (see Part 6) | Second phone receives a help request offline over LAN |
| **Expected** | Secure patient data management system | Encrypted local store, per-profile isolation, consent records, retention/deletion, DPDP-aligned | Switch profiles and show zero leakage; delete and show it gone |
| **Expected** | Support early cognitive intervention | CST framing: engagement and stimulation, delivered early and sustained. **Not** diagnosis or screening | Say it precisely; see Part 11 language rules |

---

# PART 3 — COMPLETE FEATURE LIST

## 3.1 Person-facing (the elder)

**F1 — Three-screen home.** Only three choices ever: **Play** (an activity), **Help** (a prompt), **Today** (reminders). Each a full-width card with icon + large label + audio button.

**F2 — Five CST activity families.** As mapped in Part 2. Each: starts offline, supports Help/Skip/Pause, has a safe easiest configuration, logs full context, no timer, no score shown to the person.

**F3 — Literacy-adaptive rendering.** One component tree, three weightings:
- `non-literate`: icon 96px dominant, analog clock, huge audio button, text as small muted caption
- `basic`: icon 64px, text equal weight, analog clock, medium audio button
- `fluent`: icon 40px anchor, text primary, digital time, small optional audio

**F4 — Voice-guided navigation mode.** Global gesture contract when enabled: single tap = repeat current item; swipe right/left = next/previous; double-tap = select; long-press 1.5s = home. Auto-announce on every screen change. Usable with eyes closed.

**F5 — Familiar-voice prompts.** Every personal prompt plays in a family member's recorded voice. System scaffolding plays in Bhashini-generated Assamese.

**F6 — Always-available exit.** Pause, Skip, Stop on every activity screen. Distress ends the activity. A person may reject any memory permanently in two taps.

## 3.2 Circle-facing (family / neighbour / ASHA / worker)

**F7 — Pack Studio.** Pick template (object / place / routine / reminiscence) → photo → record prompt (manual start/stop) → preview in both Play and Help → approve with version. Mark `is_current_location` for things that can go stale.

**F8 — Circle roster.** 3–6 consented members with role, on-call days, and optional device ID for local-network alerts.

**F9 — Circle Board.** Per person: activities attempted/completed/skipped, activity level trend, assistance offered, session context, **data freshness**, content review status, pending handoffs, today's on-call member.

**F10 — Reminder scheduler.** Four categories. Care-plan text pasted, never generated. Analog clock picker. Version + device-activation state.

**F11 — Handoff.** Worker configures → sends → household device receives → **explicitly accepts**. Three distinct states, all visible.

**F12 — Alert routing.** Help request → nearest on-call circle member's device (LAN if offline, server if online) → explicit human acknowledgment → resolution with named owner.

## 3.3 Jury-facing (this is your secret weapon)

**F13 — Evidence Inspector.** A hidden-route screen showing: current policy mode (learned/baseline), the full posterior ranking with sample sizes, which choice the model actually changed vs the fixed baseline, model/policy/pack versions, event lifecycle timeline, and synthetic-vs-real data labels.

**F14 — CST Protocol Map.** A screen mapping each activity family to its CST session theme and citing the evidence base. Lets you answer "why would this work?" by tapping, not talking.

**F15 — Failure Theatre.** A demo-mode panel with buttons: *Go offline*, *Expire a location pack*, *Simulate lost provider response*, *Simulate duplicate sync*. Lets you demonstrate honest failure handling on demand — the single most memorable thing you can show.

---

# PART 4 — UI / UX SPECIFICATION

## 4.1 Design tokens

```css
/* globals.css */
:root {
  /* High contrast for cataract/macular degeneration. WCAG AAA target. */
  --bg:            #FFFFFF;
  --surface:       #FFFFFF;
  --border:        #0F2419;   /* hard borders, not shadows */
  --text:          #0F2419;
  --text-muted:    #4B5563;
  --accent:        #065F46;   /* single actionable colour */
  --accent-press:  #043D2E;
  --warn:          #B45309;
  --alert:         #9F1239;
  --ok:            #065F46;

  --text-body:     18px;
  --text-action:   26px;
  --text-title:    32px;
  --touch-min:     56px;
  --radius:        16px;
  --border-w:      3px;
}
```

**Rules, non-negotiable:**
1. **Hard 3px borders, never drop shadows.** Cataract-affected vision resolves edges, not gradients.
2. **Minimum 56px touch targets**, 72px for primary actions.
3. **Body text never below 18px**; action text 26px+.
4. **Never colour alone** to convey state — always colour + icon + text.
5. **No countdowns, no timers, no scores shown to the person, no streaks, no leaderboards, no cartoon characters.**
6. **One primary action per screen.**
7. Analog clock face for time in non-literate/basic tiers.

## 4.2 Screen inventory

```
/                      Person home — Play / Help / Today
/play                  Activity picker (5 cards, audio-labelled)
/play/[activity]        Activity runner
/help                  Prompt cards + one big "I need someone"
/today                 Reminder list with analog clocks
/circle                Circle Board (auth)
/circle/packs          Pack Studio (auth)
/circle/roster         Circle roster (auth)
/circle/reminders      Reminder scheduler (auth)
/circle/handoff        Handoff sender/receiver (auth)
/login                 Authorised login
/inspector             Evidence Inspector (auth, jury view)
/inspector/cst         CST Protocol Map (auth, jury view)
/inspector/theatre     Failure Theatre (auth, demo only)
```

## 4.3 Person home markup (reference)

```tsx
// src/app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePerson } from '@/lib/usePerson';
import { announce } from '@/lib/voiceNav';
import BigChoice from '@/components/ui/BigChoice';

export default function PersonHome() {
  const router = useRouter();
  const { person, loading } = usePerson();

  useEffect(() => {
    if (person?.navigation === 'voice-guided') {
      announce('home_intro', person.language);
    }
  }, [person]);

  if (loading || !person) return <Splash />;

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-5">
      <header className="pb-2">
        <h1 style={{ fontSize: 'var(--text-title)' }} className="font-black text-[var(--text)]">
          {person.display_name}
        </h1>
      </header>

      <BigChoice
        icon="play"
        labelKey="home.play"
        subKey="home.play.sub"
        person={person}
        onSelect={() => router.push('/play')}
      />
      <BigChoice
        icon="help"
        labelKey="home.help"
        subKey="home.help.sub"
        person={person}
        onSelect={() => router.push('/help')}
      />
      <BigChoice
        icon="today"
        labelKey="home.today"
        subKey="home.today.sub"
        person={person}
        onSelect={() => router.push('/today')}
      />
    </main>
  );
}
```

```tsx
// src/components/ui/BigChoice.tsx
'use client';
import { Person } from '@/lib/db';
import { playCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import Icon from './Icon';

const SIZES = {
  'non-literate': { icon: 96, label: 30, sub: 0 },
  'basic':        { icon: 64, label: 26, sub: 16 },
  'fluent':       { icon: 40, label: 22, sub: 15 },
} as const;

export default function BigChoice({ icon, labelKey, subKey, person, onSelect }: {
  icon: string; labelKey: string; subKey: string; person: Person; onSelect: () => void;
}) {
  const s = SIZES[person.literacy];
  return (
    <div
      className="flex items-center gap-5 bg-[var(--surface)] p-5"
      style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)' }}
    >
      <Icon name={icon} size={s.icon} />
      <div className="flex-1">
        <div style={{ fontSize: s.label }} className="font-black text-[var(--text)]">
          {t(labelKey, person.language)}
        </div>
        {s.sub > 0 && (
          <div style={{ fontSize: s.sub }} className="text-[var(--text-muted)] mt-1">
            {t(subKey, person.language)}
          </div>
        )}
      </div>

      {/* Audio first for non-literate: hear before choosing */}
      <button
        onClick={(e) => { e.stopPropagation(); playCue(labelKey, person.language); }}
        aria-label={t('a11y.listen', person.language)}
        style={{ minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)',
                 border: 'var(--border-w) solid var(--accent)', borderRadius: 'var(--radius)' }}
        className="text-[var(--accent)] font-black px-4"
      >
        ►
      </button>

      <button
        onClick={onSelect}
        aria-label={t(labelKey, person.language)}
        style={{ minHeight: 72, background: 'var(--accent)', borderRadius: 'var(--radius)' }}
        className="text-white font-black px-7 text-xl active:opacity-80"
      >
        {t('common.open', person.language)}
      </button>
    </div>
  );
}
```

---

# PART 5 — ARCHITECTURE & PROJECT SETUP

## 5.1 Stack decision

| Layer | Choice | Why |
|---|---|---|
| App shell | **Next.js 15 static export + Capacitor Android** | Web speed of development; native alarms and non-evictable storage. Browser-only background sync has limited availability (MDN) and browser storage is evictable (MDN) — Capacitor solves both without a rewrite |
| Local store | **Dexie (IndexedDB)** + Capacitor Preferences for keys | Simple typed schema, works offline, survives in the native shell |
| Local AI | **Beta-Binomial estimator in TypeScript** | Runs offline, sub-millisecond, fully inspectable. No model weights to ship |
| Backend | **Supabase** (Postgres + RLS + Edge Functions) | Auth, row-level isolation, serverless functions, generous free tier |
| Reminders | **@capacitor/local-notifications** | Real Android AlarmManager scheduling |
| Language | **Bhashini** at build time → cached audio | Government of India (MeitY) sovereign language infra; AI4Bharat open-sourced SOTA TTS for Assamese, Bodo, Manipuri on Bhashini |
| Alerts | **LAN (offline) + Twilio (online)** | Circle-first routing works without internet |

## 5.2 Setup commands

```powershell
npx create-next-app@latest saath --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
cd saath

npm install dexie @supabase/supabase-js uuid
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/local-notifications @capacitor/preferences @capacitor/network @capacitor/camera
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @playwright/test

npx cap init "SAATH" "in.saath.app" --web-dir=out
npx cap add android
```

`next.config.ts`:
```ts
import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
};
export default nextConfig;
```

`package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "android": "next build && npx cap sync android && npx cap open android",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  }
}
```

## 5.3 Folder structure

```
src/
  app/
    page.tsx  play/  help/  today/  circle/  login/  inspector/
  components/
    ui/            BigChoice, Icon, AnalogClock, AudioButton, ExitBar
    play/          FamiliarPairs, SoundAndSight, PatternGarden, MyNextStep, TogetherMoment
    help/          HelpBoard, NeedSomeone
    circle/        CircleBoard, PackStudio, Roster, ReminderScheduler, Handoff
    inspector/     EvidenceInspector, CstProtocolMap, FailureTheatre
  lib/
    db.ts          Dexie schema
    model.ts       Bayesian engine + 3-layer policy
    events.ts      Event queue + state machine
    audio.ts       Record / play / cached cues
    voiceNav.ts    Gesture contract + TTS announce
    reminders.ts   Capacitor notifications
    sync.ts        Idempotent Supabase sync
    alerts.ts      LAN + Twilio routing
    i18n.ts        String tables
    usePerson.ts   Person context hook
  content/
    lang/as/  lang/en/       generated audio + strings
    packs/regional/          optional reviewed asset library
    cst/protocol.json        CST session-theme map
scripts/
  generate-audio.mjs         Bhashini build-time TTS
supabase/
  migrations/001_init.sql
  functions/report/  functions/alert/  functions/checkin/
tests/
  model.test.ts  events.test.ts  db.test.ts  e2e/
```

---

# PART 6 — DATA LAYER

## 6.1 Local schema — `src/lib/db.ts`

```typescript
import Dexie, { Table } from 'dexie';

export type Lang = 'as' | 'en';
export type Literacy = 'non-literate' | 'basic' | 'fluent';
export type Nav = 'visual' | 'voice-guided';
export type CueType = 'none' | 'repeat_audio' | 'highlight' | 'reduce_choices' | 'demonstrate';
export type Activity = 'familiar_pairs' | 'sound_sight' | 'pattern_garden' | 'my_next_step' | 'together';
export type Difficulty = 1 | 2 | 3 | 4;

export interface Person {
  id: string;
  display_name: string;
  language: Lang;
  literacy: Literacy;
  navigation: Nav;
  care_config: {
    max_difficulty: Difficulty;
    allowed_cues: CueType[];
    excluded_pack_ids: string[];
    sensory_mode: 'both' | 'visual_only' | 'audio_supported';
  };
  consent_ref: string;
  created_at: string;
}

export interface CircleMember {
  id: string;
  person_id: string;
  name: string;
  role: 'family' | 'neighbour' | 'volunteer' | 'asha' | 'worker';
  phone?: string;
  consented: boolean;
  on_call_days: number[];           // 0=Sun..6=Sat
  device_id?: string;               // LAN alert target
  lan_url?: string;                 // e.g. http://192.168.1.42:3000
}

export interface ContentPack {
  id: string;
  person_id: string;
  version: number;
  kind: 'object' | 'place' | 'routine' | 'reminiscence';
  title: string;
  is_current_location: boolean;     // can go stale
  media: { photo?: string; place_photo?: string; audio_key: string };
  recorded_by: string;              // circle member id
  language: Lang;
  approved_by?: string;
  approved_at?: string;
  review_by?: string;               // ISO date
  state: 'draft' | 'approved' | 'stale' | 'withdrawn';
  permitted_uses: ('play' | 'help' | 'together')[];
}

export interface TrialEvent {
  id: string;
  person_id: string;
  activity: Activity;
  activity_version: string;
  difficulty: Difficulty;
  cue: CueType;
  pack_id?: string;
  recorded_by?: string;
  outcome: 'completed' | 'not_completed' | 'skipped' | 'withdrawn' | 'interrupted';
  latency_ms?: number;
  perseverative_errors?: number;
  policy_mode: 'baseline' | 'learned';
  model_version: string;
  synthetic: boolean;
  created_at: string;
  synced_at?: string;
}

export type FollowupState =
  | 'stored_locally' | 'circle_notified_local' | 'eligible' | 'submitting'
  | 'submitted' | 'submission_unknown' | 'delivered'
  | 'acknowledged' | 'resolved' | 'cancelled' | 'expired';

export interface FollowupItem {
  id: string;
  person_id: string;
  origin: 'help_request' | 'missed_checkin';
  state: FollowupState;
  target_member_id?: string;
  attempts: number;
  created_at: string;
  expires_at: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  history: { state: FollowupState; at: string; note?: string }[];
}

export interface Reminder {
  id: string;
  person_id: string;
  category: 'medicine' | 'hydration' | 'activity' | 'appointment';
  care_plan_text: string;           // pasted from care plan; NEVER generated
  hour: number;                     // 1-12
  minute: number;
  period: 'AM' | 'PM';
  audio_pack_id?: string;
  version: number;
  device_activated: boolean;
  native_notification_id?: number;
}

export interface Handoff {
  id: string;
  person_id: string;
  from_member: string;
  to_member: string;
  pack_versions: Record<string, number>;
  state: 'sent' | 'received' | 'accepted';
  sent_at: string;
  received_at?: string;
  accepted_at?: string;
}

export interface AuditRecord {
  id: string;
  actor: string;
  action: string;
  scope: string;
  at: string;
}

export class SaathDB extends Dexie {
  persons!: Table<Person>;
  members!: Table<CircleMember>;
  packs!: Table<ContentPack>;
  trials!: Table<TrialEvent>;
  followups!: Table<FollowupItem>;
  reminders!: Table<Reminder>;
  handoffs!: Table<Handoff>;
  audit!: Table<AuditRecord>;
  blobs!: Table<{ key: string; blob: Blob; at: string }>;

  constructor() {
    super('saath_v1');
    this.version(1).stores({
      persons:   'id',
      members:   'id, person_id',
      packs:     'id, person_id, state',
      trials:    'id, person_id, activity, synced_at',
      followups: 'id, person_id, state',
      reminders: 'id, person_id, category',
      handoffs:  'id, person_id, state',
      audit:     'id, at',
      blobs:     'key',
    });
  }
}

export const db = new SaathDB();
```

## 6.2 Backend schema — `supabase/migrations/001_init.sql`

```sql
create table persons (
  id uuid primary key,
  display_name text not null,
  language text not null,
  literacy text not null,
  navigation text not null,
  care_config jsonb not null default '{}',
  consent_ref text,
  created_at timestamptz default now()
);

create table circle_members (
  id uuid primary key,
  person_id uuid references persons(id) on delete cascade,
  name text not null,
  role text not null,
  phone text,
  consented boolean default false,
  on_call_days int[] default '{}',
  device_id text
);

create table trials (
  id uuid primary key,              -- client-generated: idempotency key
  person_id uuid references persons(id) on delete cascade,
  activity text not null,
  activity_version text not null,
  difficulty int not null,
  cue text not null,
  pack_id uuid,
  recorded_by uuid,
  outcome text not null,
  latency_ms int,
  perseverative_errors int,
  policy_mode text not null,
  model_version text not null,
  synthetic boolean not null default false,
  created_at timestamptz not null,
  received_at timestamptz default now()
);

create table followups (
  id uuid primary key,
  person_id uuid references persons(id) on delete cascade,
  origin text not null,
  state text not null,
  target_member_id uuid,
  attempts int default 0,
  provider_sid text,
  created_at timestamptz not null,
  expires_at timestamptz not null,
  acknowledged_by uuid,
  acknowledged_at timestamptz,
  resolved_by uuid,
  history jsonb default '[]'
);

create table content_packs (
  id uuid primary key,
  person_id uuid references persons(id) on delete cascade,
  version int not null,
  kind text not null,
  title text not null,
  is_current_location boolean default false,
  recorded_by uuid,
  language text not null,
  state text not null,
  review_by date,
  permitted_uses text[] not null,
  unique (id, version)
);

-- Row level security: a member sees only their circle's people
alter table persons        enable row level security;
alter table circle_members enable row level security;
alter table trials         enable row level security;
alter table followups      enable row level security;
alter table content_packs  enable row level security;

create policy circle_read_persons on persons for select
  using (exists (
    select 1 from circle_members m
    where m.person_id = persons.id and m.id = auth.uid()::uuid
  ));

create policy circle_read_trials on trials for select
  using (exists (
    select 1 from circle_members m
    where m.person_id = trials.person_id and m.id = auth.uid()::uuid
  ));

create policy circle_insert_trials on trials for insert
  with check (exists (
    select 1 from circle_members m
    where m.person_id = trials.person_id and m.id = auth.uid()::uuid
  ));
```

---

# PART 7 — THE AI ENGINE (full implementation)

## 7.1 `src/lib/model.ts`

```typescript
import { db, CueType, Activity, Difficulty, TrialEvent } from './db';

export const MODEL_VERSION = 'saath-bb-1.0';

/** Predeclared experimental configuration. Record these WITH the model version. */
export const CONFIG = {
  PRIOR_A: 1,            // Beta prior alpha — engineering choice, NOT a clinical norm
  PRIOR_B: 1,            // Beta prior beta
  MIN_EVIDENCE: 3,       // minimum comparable trials before a cue is "supported"
  TIE_TOLERANCE: 0.05,   // posterior means within this are a tie -> use preference
  TARGET_LOW: 0.60,      // engineering target band for supported completion
  TARGET_HIGH: 0.85,
} as const;

export interface CueEstimate {
  cue: CueType;
  posteriorMean: number;
  n: number;
  completions: number;
  supported: boolean;
}

export interface Decision {
  mode: 'baseline' | 'learned';
  chosenCue: CueType;
  chosenDifficulty: Difficulty;
  ranking: CueEstimate[];
  changedFromBaseline: boolean;
  baselineCue: CueType;
  reason: string;
  modelVersion: string;
  config: typeof CONFIG;
}

/**
 * An eligible outcome is a completed or non-completed trial with full context.
 * Skips, withdrawals and interruptions are recorded but NEVER counted as
 * cognitive failure. Synthetic trials never inform a real recommendation.
 */
function isEligible(t: TrialEvent): boolean {
  return (t.outcome === 'completed' || t.outcome === 'not_completed') && !t.synthetic;
}

function posteriorMean(s: number, f: number): number {
  return (CONFIG.PRIOR_A + s) / (CONFIG.PRIOR_A + CONFIG.PRIOR_B + s + f);
}

export async function decide(opts: {
  personId: string;
  activity: Activity;
  difficulty: Difficulty;
  allowedCues: CueType[];       // Layer 1: care-config bound
  maxDifficulty: Difficulty;    // Layer 1: care-config bound
  preferredCue?: CueType;
  explicitHelpRequested?: boolean;
  includeSynthetic?: boolean;   // demo/test only
}): Promise<Decision> {

  const {
    personId, activity, difficulty, allowedCues,
    maxDifficulty, preferredCue, explicitHelpRequested, includeSynthetic,
  } = opts;

  const baselineCue = preferredCue ?? allowedCues[0] ?? 'none';

  // ---- LAYER 1: explicit human intent always wins -------------------------
  if (explicitHelpRequested) {
    const helpCue = allowedCues.includes('repeat_audio') ? 'repeat_audio' : baselineCue;
    return {
      mode: 'baseline', chosenCue: helpCue, chosenDifficulty: difficulty,
      ranking: [], changedFromBaseline: false, baselineCue,
      reason: 'Explicit help request — human intent overrides the model.',
      modelVersion: MODEL_VERSION, config: CONFIG,
    };
  }

  // ---- Gather comparable evidence ----------------------------------------
  const all = await db.trials.where({ person_id: personId, activity }).toArray();
  const comparable = all.filter(t =>
    t.difficulty === difficulty && (includeSynthetic ? true : isEligible(t))
  );

  const ranking: CueEstimate[] = allowedCues.map(cue => {
    const rel = comparable.filter(t => t.cue === cue);
    const s = rel.filter(t => t.outcome === 'completed').length;
    const f = rel.filter(t => t.outcome === 'not_completed').length;
    return {
      cue, completions: s, n: s + f,
      posteriorMean: posteriorMean(s, f),
      supported: (s + f) >= CONFIG.MIN_EVIDENCE,
    };
  });

  const supported = ranking.filter(r => r.supported);

  // ---- LAYER 2: transparent cold-start fallback --------------------------
  if (supported.length === 0) {
    return {
      mode: 'baseline', chosenCue: baselineCue, chosenDifficulty: difficulty,
      ranking, changedFromBaseline: false, baselineCue,
      reason: `Insufficient comparable evidence (need ${CONFIG.MIN_EVIDENCE} per cue at this difficulty). Using conservative baseline.`,
      modelVersion: MODEL_VERSION, config: CONFIG,
    };
  }

  // ---- LAYER 3: learned ranking, bounded --------------------------------
  supported.sort((a, b) => b.posteriorMean - a.posteriorMean);
  let chosenCue = supported[0].cue;

  // Break near-ties with the person's configured preference
  if (preferredCue) {
    const top = supported[0].posteriorMean;
    const tied = supported.filter(r => top - r.posteriorMean <= CONFIG.TIE_TOLERANCE);
    const pref = tied.find(r => r.cue === preferredCue);
    if (pref) chosenCue = pref.cue;
  }

  // Difficulty: only adjacent, only with comparable history, respecting bounds
  let chosenDifficulty: Difficulty = difficulty;
  const best = supported.find(r => r.cue === chosenCue)!;
  if (best.posteriorMean > CONFIG.TARGET_HIGH && difficulty < maxDifficulty) {
    chosenDifficulty = (difficulty + 1) as Difficulty;   // caregiver confirms increases in pilot
  } else if (best.posteriorMean < CONFIG.TARGET_LOW && difficulty > 1) {
    chosenDifficulty = (difficulty - 1) as Difficulty;
  }

  return {
    mode: 'learned',
    chosenCue,
    chosenDifficulty,
    ranking,
    changedFromBaseline: chosenCue !== baselineCue || chosenDifficulty !== difficulty,
    baselineCue,
    reason: `Ranked ${supported.length} supported cue option(s) by posterior mean supported-completion probability at difficulty ${difficulty}.`,
    modelVersion: MODEL_VERSION,
    config: CONFIG,
  };
}
```

## 7.2 Why this survives interrogation

- **"Is it really AI?"** It's Bayesian inference with a Beta-Binomial conjugate prior, updating from observed data, producing a decision that demonstrably differs from the fixed baseline. The Inspector shows `changedFromBaseline`.
- **"Why not deep learning?"** Sparse per-person data. A neural net on 20 trials overfits and can't be inspected. This is the statistically appropriate model, and it runs offline in microseconds on a cheap tablet.
- **"Where are the thresholds from?"** They're predeclared engineering configuration recorded with the model version — explicitly *not* clinical cutoffs. Saying this before being asked is worth a lot.

---

# PART 8 — BHASHINI AUDIO PIPELINE

## 8.1 Build-time generation — `scripts/generate-audio.mjs`

Generate once, ship the files, play offline forever.

```javascript
// node scripts/generate-audio.mjs
import fs from 'node:fs/promises';
import path from 'node:path';

const API_KEY  = process.env.BHASHINI_API_KEY;
const USER_ID  = process.env.BHASHINI_USER_ID;
const PIPELINE = process.env.BHASHINI_PIPELINE_ID;

// Every fixed system string the app ever speaks.
const STRINGS = {
  'home_intro':      'This is your memory companion. Choose Play, Help, or Today.',
  'home.play':       'Play a familiar activity',
  'home.help':       'Get help with something',
  'home.today':      'Today\u2019s reminders',
  'play.pairs.intro':'Find the two pictures that are the same. Take your time.',
  'play.sound.intro':'Listen to the sound, then choose the matching picture.',
  'play.pattern.intro':'Look at the shapes and choose what comes next.',
  'play.step.intro': 'Put the steps of your routine in order.',
  'play.together.intro':'Let us look at this picture together.',
  'cue.repeat':      'Let me say that again.',
  'cue.highlight':   'Look here.',
  'cue.reduce':      'Let us try with fewer choices.',
  'cue.demonstrate': 'Watch how it is done, then you try.',
  'common.pause':    'Paused. Tap to continue, or choose Stop.',
  'common.stop':     'We can stop here. That is completely fine.',
  'common.open':     'Open',
  'a11y.listen':     'Listen',
  'help.need':       'I need someone',
  'help.sent_local': 'Your family has been told on this network.',
  'help.stored':     'Saved on this device. It will be sent when there is a connection.',
  'remind.medicine': 'It is time for your medicine.',
  'remind.hydration':'Time for a glass of water.',
  'remind.activity': 'Time for your daily activity.',
  'remind.appointment':'You have a clinic appointment.',
};

async function tts(text, lang) {
  const res = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
    body: JSON.stringify({
      pipelineTasks: [{
        taskType: 'tts',
        config: { language: { sourceLanguage: lang }, gender: 'female', samplingRate: 16000 },
      }],
      inputData: { input: [{ source: text }] },
    }),
  });
  if (!res.ok) throw new Error(`Bhashini ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const b64 = json.pipelineResponse?.[0]?.audio?.[0]?.audioContent;
  if (!b64) throw new Error('No audio returned');
  return Buffer.from(b64, 'base64');
}

async function main() {
  // Assamese via Bhashini; English via the same pipeline for consistency.
  for (const lang of ['as', 'en']) {
    const dir = path.join('src', 'content', 'lang', lang);
    await fs.mkdir(dir, { recursive: true });
    const manifest = {};
    for (const [key, en] of Object.entries(STRINGS)) {
      const text = lang === 'en' ? en : await translate(en, lang);
      const wav = await tts(text, lang);
      const file = `${key.replace(/\./g, '_')}.wav`;
      await fs.writeFile(path.join(dir, file), wav);
      manifest[key] = { file, text };
      console.log(`  ${lang}/${file}`);
      await new Promise(r => setTimeout(r, 300)); // be polite to the API
    }
    await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  }
}

async function translate(text, target) {
  if (target === 'en') return text;
  const res = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
    body: JSON.stringify({
      pipelineTasks: [{
        taskType: 'translation',
        config: { language: { sourceLanguage: 'en', targetLanguage: target } },
      }],
      inputData: { input: [{ source: text }] },
    }),
  });
  const json = await res.json();
  return json.pipelineResponse?.[0]?.output?.[0]?.target ?? text;
}

main().catch(e => { console.error(e); process.exit(1); });
```

**Register at bhashini.gov.in → generate API key → set `BHASHINI_API_KEY`, `BHASHINI_USER_ID`, `BHASHINI_PIPELINE_ID`.** Endpoint shapes change; if a call fails, check the current ULCA/Dhruva pipeline docs and adjust the payload — the *strategy* (generate once, cache, ship) is what matters.

**The honest caveat, say it before you're asked:** synthetic Assamese has not been comprehension-tested with elderly non-literate users. That's why all *personal* content is human-recorded, and the synthetic layer is scaffolding only.

## 8.2 Playback — `src/lib/audio.ts`

```typescript
import { db, Lang } from './db';

const manifests: Partial<Record<Lang, Record<string, { file: string }>>> = {};

async function manifest(lang: Lang) {
  if (!manifests[lang]) {
    manifests[lang] = await fetch(`/content/lang/${lang}/manifest.json`).then(r => r.json());
  }
  return manifests[lang]!;
}

/** Fixed system cue: cached Bhashini audio. Works fully offline. */
export async function playCue(key: string, lang: Lang) {
  const m = await manifest(lang);
  const entry = m[key];
  if (!entry) return;
  const a = new Audio(`/content/lang/${lang}/${entry.file}`);
  await a.play().catch(() => {});
}

/** Personal content: the family member's own recorded voice. */
export async function playPackAudio(audioKey: string) {
  const rec = await db.blobs.get(audioKey);
  if (!rec) return;
  const url = URL.createObjectURL(rec.blob);
  const a = new Audio(url);
  a.onended = () => URL.revokeObjectURL(url);
  await a.play().catch(() => {});
}

/** Manual start/stop recording. No fixed timeout. */
export class VoiceRecorder {
  private rec?: MediaRecorder;
  private chunks: Blob[] = [];
  private stream?: MediaStream;

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
      .find(t => MediaRecorder.isTypeSupported(t)) || '';
    this.rec = new MediaRecorder(this.stream, mime ? { mimeType: mime } : {});
    this.chunks = [];
    this.rec.ondataavailable = e => { if (e.data.size) this.chunks.push(e.data); };
    this.rec.start();
  }

  async stopAndSave(audioKey: string): Promise<void> {
    return new Promise(resolve => {
      if (!this.rec) return resolve();
      this.rec.onstop = async () => {
        this.stream?.getTracks().forEach(t => t.stop());
        const blob = new Blob(this.chunks, { type: this.rec!.mimeType || 'audio/webm' });
        await db.blobs.put({ key: audioKey, blob, at: new Date().toISOString() });
        resolve();
      };
      this.rec.stop();
    });
  }
}
```

---

# PART 9 — EVENTS, ALERTS, REMINDERS, SYNC

## 9.1 State machine — `src/lib/events.ts`

```typescript
import { db, FollowupItem, FollowupState } from './db';
import { v4 as uuid } from 'uuid';

const LEGAL: Record<FollowupState, FollowupState[]> = {
  stored_locally:       ['circle_notified_local', 'eligible', 'cancelled', 'expired'],
  circle_notified_local:['acknowledged', 'eligible', 'cancelled', 'expired'],
  eligible:             ['submitting', 'cancelled', 'expired'],
  submitting:           ['submitted', 'submission_unknown'],
  submitted:            ['delivered', 'acknowledged', 'submission_unknown'],
  submission_unknown:   ['submitted', 'delivered', 'acknowledged'],  // never back to eligible
  delivered:            ['acknowledged'],
  acknowledged:         ['resolved'],
  resolved:             [],
  cancelled:            [],
  expired:              [],
};

export async function createHelpRequest(personId: string, ttlMinutes = 120) {
  const now = new Date();
  const item: FollowupItem = {
    id: uuid(),
    person_id: personId,
    origin: 'help_request',
    state: 'stored_locally',
    attempts: 0,
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + ttlMinutes * 60000).toISOString(),
    history: [{ state: 'stored_locally', at: now.toISOString() }],
  };
  await db.followups.put(item);
  return item;
}

export async function transition(id: string, next: FollowupState, note?: string) {
  const item = await db.followups.get(id);
  if (!item) throw new Error('followup not found');

  // Idempotent: repeating an accepted transition is a no-op, not a duplicate effect.
  if (item.state === next) return item;

  if (!LEGAL[item.state].includes(next)) {
    throw new Error(`Illegal transition ${item.state} -> ${next}`);
  }

  item.state = next;
  item.history.push({ state: next, at: new Date().toISOString(), note });
  if (next === 'submitting') item.attempts += 1;
  await db.followups.put(item);
  return item;
}

export async function expireStale() {
  const now = Date.now();
  const open = await db.followups
    .where('state').anyOf('stored_locally', 'circle_notified_local', 'eligible').toArray();
  for (const i of open) {
    if (new Date(i.expires_at).getTime() < now) await transition(i.id, 'expired', 'ttl');
  }
}
```

## 9.2 Circle-first alerts — `src/lib/alerts.ts`

```typescript
import { db } from './db';
import { transition } from './events';
import { Network } from '@capacitor/network';

/** On-call member for today, preferring one reachable on the local network. */
async function pickTarget(personId: string) {
  const today = new Date().getDay();
  const members = await db.members.where({ person_id: personId }).toArray();
  const onCall = members.filter(m => m.consented && m.on_call_days.includes(today));
  return onCall.find(m => !!m.lan_url) ?? onCall[0] ?? members.find(m => m.consented);
}

export async function routeHelpRequest(followupId: string, personId: string) {
  const target = await pickTarget(personId);
  if (!target) return;

  // 1) Try the local network first — works with no internet at all.
  if (target.lan_url) {
    try {
      const res = await fetch(`${target.lan_url}/api/circle-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followupId, personId, at: new Date().toISOString() }),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        await transition(followupId, 'circle_notified_local', `LAN -> ${target.name}`);
        return;
      }
    } catch { /* fall through — genuinely offline or member away */ }
  }

  // 2) Otherwise queue for the server. Only mark eligible if we actually have a path.
  const status = await Network.getStatus();
  if (status.connected) {
    await transition(followupId, 'eligible', 'queued for server');
  }
  // If neither, it stays stored_locally — and the UI says exactly that.
}
```

## 9.3 Reminders — `src/lib/reminders.ts`

```typescript
import { LocalNotifications } from '@capacitor/local-notifications';
import { db, Reminder } from './db';

export async function ensurePermission(): Promise<boolean> {
  const p = await LocalNotifications.requestPermissions();
  return p.display === 'granted';
}

function nextOccurrence(hour12: number, minute: number, period: 'AM' | 'PM') {
  const h = period === 'PM' ? (hour12 % 12) + 12 : hour12 % 12;
  const d = new Date();
  d.setHours(h, minute, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

export async function scheduleReminder(r: Reminder) {
  const id = r.native_notification_id ?? Math.floor(Math.random() * 2_000_000_000);
  await LocalNotifications.schedule({
    notifications: [{
      id,
      title: titleFor(r.category),
      body: r.care_plan_text,             // care-plan text only, never generated
      schedule: { at: nextOccurrence(r.hour, r.minute, r.period), repeats: true, every: 'day' },
      sound: 'default',
      extra: { reminderId: r.id, personId: r.person_id, category: r.category },
    }],
  });
  await db.reminders.put({ ...r, native_notification_id: id, device_activated: true });
}

function titleFor(c: Reminder['category']) {
  return { medicine: 'Medicine', hydration: 'Water', activity: 'Activity', appointment: 'Clinic' }[c];
}

/** Re-arm everything after a reboot or app cold start. */
export async function rearmAll(personId: string) {
  const rs = await db.reminders.where({ person_id: personId }).toArray();
  for (const r of rs) await scheduleReminder(r);
}
```

## 9.4 Idempotent sync — `src/lib/sync.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { db } from './db';
import { Network } from '@capacitor/network';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function syncTrials(): Promise<{ pushed: number; skipped: number }> {
  const status = await Network.getStatus();
  if (!status.connected) return { pushed: 0, skipped: 0 };

  const pending = await db.trials.filter(t => !t.synced_at).toArray();
  if (!pending.length) return { pushed: 0, skipped: 0 };

  // Client-generated UUIDs are the idempotency key.
  // upsert + ignoreDuplicates => repeated sync never double-applies.
  const { error } = await sb.from('trials')
    .upsert(pending.map(({ synced_at, ...t }) => t), {
      onConflict: 'id',
      ignoreDuplicates: true,
    });

  if (error) return { pushed: 0, skipped: pending.length };

  const now = new Date().toISOString();
  await db.transaction('rw', db.trials, async () => {
    for (const t of pending) await db.trials.update(t.id, { synced_at: now });
  });
  return { pushed: pending.length, skipped: 0 };
}

export async function pendingCount() {
  return db.trials.filter(t => !t.synced_at).count();
}

export async function lastSyncedAt(): Promise<string | null> {
  const rows = await db.trials.filter(t => !!t.synced_at).toArray();
  return rows.length ? rows.map(r => r.synced_at!).sort().at(-1)! : null;
}
```

---

# PART 10 — TESTING (this is where you beat teams that "just built it")

## 10.1 Unit — `tests/model.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import { decide, CONFIG, MODEL_VERSION } from '@/lib/model';
import { v4 as uuid } from 'uuid';

async function seed(cue: any, outcomes: ('completed'|'not_completed')[]) {
  for (const o of outcomes) {
    await db.trials.put({
      id: uuid(), person_id: 'p1', activity: 'familiar_pairs',
      activity_version: '1', difficulty: 1, cue, outcome: o,
      policy_mode: 'baseline', model_version: MODEL_VERSION,
      synthetic: false, created_at: new Date().toISOString(),
    } as any);
  }
}

describe('Bayesian assistance engine', () => {
  beforeEach(async () => { await db.trials.clear(); });

  it('falls back to baseline below the evidence threshold', async () => {
    await seed('highlight', ['completed', 'completed']);   // n=2 < MIN_EVIDENCE=3
    const d = await decide({
      personId: 'p1', activity: 'familiar_pairs', difficulty: 1,
      allowedCues: ['none', 'highlight'], maxDifficulty: 4, preferredCue: 'none',
    });
    expect(d.mode).toBe('baseline');
    expect(d.chosenCue).toBe('none');
  });

  it('switches to learned once evidence crosses the threshold', async () => {
    await seed('highlight', ['completed', 'completed', 'completed']);
    await seed('none',      ['not_completed', 'not_completed', 'not_completed']);
    const d = await decide({
      personId: 'p1', activity: 'familiar_pairs', difficulty: 1,
      allowedCues: ['none', 'highlight'], maxDifficulty: 4, preferredCue: 'none',
    });
    expect(d.mode).toBe('learned');
    expect(d.chosenCue).toBe('highlight');
    expect(d.changedFromBaseline).toBe(true);
  });

  it('computes the posterior mean correctly', async () => {
    await seed('highlight', ['completed','completed','completed','not_completed']);
    const d = await decide({
      personId: 'p1', activity: 'familiar_pairs', difficulty: 1,
      allowedCues: ['highlight'], maxDifficulty: 4,
    });
    const e = d.ranking.find(r => r.cue === 'highlight')!;
    // (1+3)/(1+1+3+1) = 4/6
    expect(e.posteriorMean).toBeCloseTo(4/6, 6);
  });

  it('NEVER proposes a cue outside care config', async () => {
    await seed('demonstrate', ['completed','completed','completed','completed','completed']);
    const d = await decide({
      personId: 'p1', activity: 'familiar_pairs', difficulty: 1,
      allowedCues: ['none', 'highlight'],   // demonstrate excluded by care team
      maxDifficulty: 4,
    });
    expect(d.chosenCue).not.toBe('demonstrate');
  });

  it('never exceeds max difficulty', async () => {
    await seed('none', Array(10).fill('completed'));
    const d = await decide({
      personId: 'p1', activity: 'familiar_pairs', difficulty: 2,
      allowedCues: ['none'], maxDifficulty: 2,
    });
    expect(d.chosenDifficulty).toBeLessThanOrEqual(2);
  });

  it('does not treat a voluntary skip as cognitive failure', async () => {
    await db.trials.put({
      id: uuid(), person_id: 'p1', activity: 'familiar_pairs', activity_version: '1',
      difficulty: 1, cue: 'none', outcome: 'skipped', policy_mode: 'baseline',
      model_version: MODEL_VERSION, synthetic: false, created_at: new Date().toISOString(),
    } as any);
    const d = await decide({
      personId: 'p1', activity: 'familiar_pairs', difficulty: 1,
      allowedCues: ['none'], maxDifficulty: 4,
    });
    expect(d.ranking.find(r => r.cue === 'none')!.n).toBe(0);
  });

  it('lets an explicit help request override the model', async () => {
    await seed('none', Array(10).fill('completed'));
    const d = await decide({
      personId: 'p1', activity: 'familiar_pairs', difficulty: 1,
      allowedCues: ['none', 'repeat_audio'], maxDifficulty: 4,
      explicitHelpRequested: true,
    });
    expect(d.chosenCue).toBe('repeat_audio');
  });

  it('excludes synthetic trials from real recommendations', async () => {
    for (let i = 0; i < 5; i++) {
      await db.trials.put({
        id: uuid(), person_id: 'p1', activity: 'familiar_pairs', activity_version: '1',
        difficulty: 1, cue: 'highlight', outcome: 'completed', policy_mode: 'baseline',
        model_version: MODEL_VERSION, synthetic: true, created_at: new Date().toISOString(),
      } as any);
    }
    const d = await decide({
      personId: 'p1', activity: 'familiar_pairs', difficulty: 1,
      allowedCues: ['none','highlight'], maxDifficulty: 4,
    });
    expect(d.mode).toBe('baseline');
  });
});
```

## 10.2 State machine — `tests/events.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import { createHelpRequest, transition, expireStale } from '@/lib/events';

describe('follow-up state machine', () => {
  beforeEach(async () => { await db.followups.clear(); });

  it('never returns submission_unknown to eligible (duplicate-call guard)', async () => {
    const i = await createHelpRequest('p1');
    await transition(i.id, 'eligible');
    await transition(i.id, 'submitting');
    await transition(i.id, 'submission_unknown');
    await expect(transition(i.id, 'eligible')).rejects.toThrow(/Illegal/);
  });

  it('is idempotent — repeating a transition is a no-op', async () => {
    const i = await createHelpRequest('p1');
    await transition(i.id, 'eligible');
    const before = (await db.followups.get(i.id))!.history.length;
    await transition(i.id, 'eligible');
    const after = (await db.followups.get(i.id))!.history.length;
    expect(after).toBe(before);
  });

  it('does not treat delivery as acknowledgment', async () => {
    const i = await createHelpRequest('p1');
    await transition(i.id, 'eligible');
    await transition(i.id, 'submitting');
    await transition(i.id, 'submitted');
    await transition(i.id, 'delivered');
    expect((await db.followups.get(i.id))!.state).toBe('delivered');
    await expect(transition(i.id, 'resolved')).rejects.toThrow(/Illegal/);
  });

  it('expires stale items instead of escalating them', async () => {
    const i = await createHelpRequest('p1', -1);   // already expired
    await expireStale();
    expect((await db.followups.get(i.id))!.state).toBe('expired');
  });

  it('records a full audit history', async () => {
    const i = await createHelpRequest('p1');
    await transition(i.id, 'circle_notified_local', 'LAN -> Bina');
    await transition(i.id, 'acknowledged', 'Bina pressed acknowledge');
    const f = (await db.followups.get(i.id))!;
    expect(f.history.map(h => h.state))
      .toEqual(['stored_locally','circle_notified_local','acknowledged']);
  });
});
```

## 10.3 Manual test matrix (print this; tick every box before the demo)

| # | Test | Pass condition |
|---|---|---|
| 1 | Airplane-mode cold start | App opens, activity plays with audio, trial logs. Zero network calls |
| 2 | Network drops mid-session | Session continues; event stays `stored_locally`; UI says so |
| 3 | Reconnect once | Event syncs; pending count → 0 |
| 4 | Reconnect twice (20 cycles) | No duplicate rows server-side; no second contact |
| 5 | Reboot the tablet | Reminders re-arm; all four categories still fire |
| 6 | Deny notification permission | App states reminders are unavailable — does not silently pretend |
| 7 | Battery optimisation on | Document the observed behaviour honestly |
| 8 | Time zone change | Reminder fires at correct local time |
| 9 | Profile switch (2 synthetic people) | Zero leakage of prior person's media, packs, or trials |
| 10 | Withdraw a pack | Disappears from Play AND Help simultaneously |
| 11 | Expire a location pack | Withheld or flagged — never asserted as current |
| 12 | Literacy tier switch | Same screen re-weights; nothing breaks |
| 13 | Voice-guided nav, eyes closed | Full journey completable by gesture + audio alone |
| 14 | Visual-only sensory mode | Sound & Sight fully playable with no audio |
| 15 | Skip/stop mid-activity | Logged as `skipped`/`withdrawn`, NOT `not_completed` |
| 16 | Model decision latency | Under 500ms on the named target device (measure, don't assume) |
| 17 | Delete a person's data | Local records gone; remote deletion behaviour demonstrated |
| 18 | LAN alert to second phone | Arrives with no internet; explicit acknowledge works |
| 19 | Inspector accuracy | Ranking + sample sizes match the DB by hand-check |
| 20 | Every UI string | Audited against the prohibited-language list (Part 11) |

## 10.4 E2E — `tests/e2e/offline-journey.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('complete offline journey', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /play/i }).click();
  await page.getByText(/familiar pairs/i).click();

  await context.setOffline(true);                       // go offline mid-activity

  await page.getByTestId('card-0').click();
  await page.getByTestId('card-1').click();
  await expect(page.getByTestId('trial-logged')).toBeVisible();

  await page.goto('/help');
  await page.getByRole('button', { name: /need someone/i }).click();
  await expect(page.getByText(/saved on this device/i)).toBeVisible();  // honest state

  await context.setOffline(false);
  await page.getByRole('button', { name: /sync/i }).click();
  await expect(page.getByTestId('pending-count')).toHaveText('0');

  await page.getByRole('button', { name: /sync/i }).click();            // sync twice
  await expect(page.getByTestId('duplicate-count')).toHaveText('0');    // no duplicates
});
```

---

# PART 11 — LANGUAGE DISCIPLINE

## Permitted
engagement · memory assistance · cognitive stimulation · approved routine prompts · observed assistance · caregiver support · experimental personalisation · early cognitive intervention (as *stimulation delivered early*, never as detection)

## Prohibited — audit every string, slide and label
- "dementia detected" · "early decline proven" · "cognitive age" · "clinical accuracy"
- "treatment success" · "disease reversal" · "memory improved"
- "patient is safe because the call was answered"
- "medicine taken because the reminder was acknowledged"
- "No activity since Tuesday" when the truth is "**No data received** since Tuesday"

NICE NG97 distinguishes cognitive stimulation from cognitive training offered as *treatment*. **A game is not automatically therapy.** Alzheimer's Society guidance notes reminiscence can cause distress — hence mandatory exit and content rejection.

---

# PART 12 — DEMO SCRIPT (3 minutes)

| Time | Beat |
|---|---|
| **0:00–0:20** | "SIH26003 asks for cognitive gaming and memory assistance for elderly dementia patients in the Northeast. We built a digital delivery vehicle for Cognitive Stimulation Therapy — an intervention with Cochrane-level evidence and published guidelines for cultural adaptation." |
| **0:20–0:50** | **One pack, two uses.** Create a pack live: photo, record a prompt, approve. Show it appear in Play *and* in Help. State: the app does not know where the object is right now. |
| **0:50–1:30** | **Airplane mode on.** Run Familiar Pairs. Request help. A cue changes. Open the **Evidence Inspector**: posterior ranking, sample size, learned-vs-baseline, and exactly what the model changed. |
| **1:30–1:55** | **Failure Theatre.** Expire a location pack — watch it be withheld, not asserted. Press "I need someone" — it says *saved on this device*, not "sent". |
| **1:55–2:30** | **The Circle.** Second phone, same Wi-Fi, no internet: the neighbour's device receives the request and acknowledges. Reconnect, sync twice, show zero duplicates. |
| **2:30–3:00** | **Evidence and limits.** "CST has evidence. Our digital delivery of it does not yet — a pilot with ARDSI Guwahati would test that. Here is what we measured, on this device, with this method." |

**Backup:** identical build on a second charged device, preinstalled content, plus a truthful screen recording. If the network dies live, finish offline and show the pending state — don't hide it.

---

# PART 13 — [SUPERSEDED — see Part 23]

The schedule originally here did not yet account for encryption, the Engagement Ledger, Voice Legacy, Trend Analytics, Circle Rotation, and the other additions in Parts 15–22. **Use Part 23 instead.** Left as a marker only so nothing downstream in this document loses its numbering.

---

# PART 15 — SECURITY: REAL ENCRYPTION

## A.1 Why this was a real hole

The PS demands a "secure patient data management system." Plain IndexedDB stores everything in cleartext — anyone with a rooted device or a backup can read the database file directly. Saying "encrypted local storage" without implementing it is exactly the kind of unsupported claim that gets a team dismantled in Q&A.

## A.2 The fix: SQLCipher + hardware-backed key

`@capacitor-community/sqlite` uses SQLCipher, which adds **256-bit AES encryption of database files**, enabled by setting `androidIsEncryption: true` in the Capacitor config.

**The critical part most teams get wrong:** a 256-bit AES database is only as secure as the key guarding it — a predictable key derived from a password or device ID, or a key stored in plaintext, undermines the encryption regardless of algorithm strength. So the key must live in the **Android Keystore** via Capacitor Secure Preferences, never in code and never derived from something guessable.

### Install

```powershell
npm install @capacitor-community/sqlite
npm install @capawesome-team/capacitor-secure-preferences
npx cap sync android
```

### `capacitor.config.ts`

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.saath.app',
  appName: 'SAATH',
  webDir: 'out',
  plugins: {
    CapacitorSQLite: {
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth: false,   // keep false: an elderly user must never be locked out
      },
    },
  },
};
export default config;
```

### `src/lib/secureStore.ts`

```typescript
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SecurePreferences } from '@capawesome-team/capacitor-secure-preferences';

const DB_NAME = 'saath_secure';
const KEY_ID   = 'saath_db_key_v1';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let conn: SQLiteDBConnection | null = null;

/** 256-bit key, generated on-device by WebCrypto, stored in the Android Keystore. */
async function getOrCreateKey(): Promise<string> {
  const existing = await SecurePreferences.get({ key: KEY_ID });
  if (existing.value) return existing.value;

  const bytes = new Uint8Array(32);              // 256 bits
  crypto.getRandomValues(bytes);                 // CSPRNG, not derived from anything guessable
  const key = btoa(String.fromCharCode(...bytes));

  await SecurePreferences.set({ key: KEY_ID, value: key });
  return key;
}

export async function openSecureDb(): Promise<SQLiteDBConnection> {
  if (conn) return conn;

  const key = await getOrCreateKey();
  await CapacitorSQLite.setEncryptionSecret({ passphrase: key });

  conn = await sqlite.createConnection(DB_NAME, true, 'secret', 1, false);
  await conn.open();
  await migrate(conn);
  return conn;
}

async function migrate(db: SQLiteDBConnection) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS persons (
      id TEXT PRIMARY KEY, display_name TEXT NOT NULL, language TEXT NOT NULL,
      literacy TEXT NOT NULL, navigation TEXT NOT NULL, care_config TEXT NOT NULL,
      consent_ref TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS trials (
      id TEXT PRIMARY KEY, person_id TEXT NOT NULL, activity TEXT NOT NULL,
      activity_version TEXT NOT NULL, difficulty INTEGER NOT NULL, cue TEXT NOT NULL,
      pack_id TEXT, recorded_by TEXT, outcome TEXT NOT NULL, latency_ms INTEGER,
      perseverative_errors INTEGER, policy_mode TEXT NOT NULL, model_version TEXT NOT NULL,
      synthetic INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, synced_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_trials_person ON trials(person_id, activity, difficulty);
    CREATE TABLE IF NOT EXISTS packs (
      id TEXT PRIMARY KEY, person_id TEXT NOT NULL, version INTEGER NOT NULL,
      kind TEXT NOT NULL, title TEXT NOT NULL, is_current_location INTEGER NOT NULL DEFAULT 0,
      media TEXT NOT NULL, recorded_by TEXT, language TEXT NOT NULL,
      approved_by TEXT, approved_at TEXT, review_by TEXT, state TEXT NOT NULL,
      permitted_uses TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY, person_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL,
      phone TEXT, consented INTEGER NOT NULL DEFAULT 0, on_call_days TEXT NOT NULL,
      device_id TEXT, lan_url TEXT, last_on_call TEXT, load_count INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS followups (
      id TEXT PRIMARY KEY, person_id TEXT NOT NULL, origin TEXT NOT NULL, state TEXT NOT NULL,
      target_member_id TEXT, attempts INTEGER DEFAULT 0, created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL, acknowledged_by TEXT, acknowledged_at TEXT,
      resolved_by TEXT, history TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY, person_id TEXT NOT NULL, category TEXT NOT NULL,
      care_plan_text TEXT NOT NULL, hour INTEGER NOT NULL, minute INTEGER NOT NULL,
      period TEXT NOT NULL, audio_pack_id TEXT, version INTEGER NOT NULL,
      device_activated INTEGER NOT NULL DEFAULT 0, native_notification_id INTEGER,
      ack_log TEXT DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS audit (
      id TEXT PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL,
      scope TEXT NOT NULL, at TEXT NOT NULL
    );
  `);
}

/** Verifiable deletion — the PS asks for secure data management, which includes removal. */
export async function deletePerson(personId: string) {
  const db = await openSecureDb();
  for (const t of ['trials','packs','members','followups','reminders']) {
    await db.run(`DELETE FROM ${t} WHERE person_id = ?`, [personId]);
  }
  await db.run(`DELETE FROM persons WHERE id = ?`, [personId]);
  await db.run(
    `INSERT INTO audit (id, actor, action, scope, at) VALUES (?,?,?,?,?)`,
    [crypto.randomUUID(), 'system', 'delete_person', personId, new Date().toISOString()]
  );
}
```

### Media blobs — separate AES-GCM layer

Photos and voice recordings are files, not rows, so they need their own encryption:

```typescript
// src/lib/secureMedia.ts
import { Filesystem, Directory } from '@capacitor/filesystem';
import { SecurePreferences } from '@capawesome-team/capacitor-secure-preferences';

const MEDIA_KEY_ID = 'saath_media_key_v1';

async function mediaKey(): Promise<CryptoKey> {
  let raw = (await SecurePreferences.get({ key: MEDIA_KEY_ID })).value;
  if (!raw) {
    const k = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt','decrypt']);
    const exported = await crypto.subtle.exportKey('raw', k);
    raw = btoa(String.fromCharCode(...new Uint8Array(exported)));
    await SecurePreferences.set({ key: MEDIA_KEY_ID, value: raw });
  }
  const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt','decrypt']);
}

export async function saveEncrypted(key: string, blob: Blob) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = await blob.arrayBuffer();
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await mediaKey(), plain);

  // Prepend IV so decryption is self-contained.
  const out = new Uint8Array(iv.length + cipher.byteLength);
  out.set(iv, 0); out.set(new Uint8Array(cipher), iv.length);

  await Filesystem.writeFile({
    path: `media/${key}.enc`,
    data: btoa(String.fromCharCode(...out)),
    directory: Directory.Data,
    recursive: true,
  });
}

export async function loadDecrypted(key: string, mime: string): Promise<Blob | null> {
  try {
    const f = await Filesystem.readFile({ path: `media/${key}.enc`, directory: Directory.Data });
    const all = Uint8Array.from(atob(f.data as string), c => c.charCodeAt(0));
    const iv = all.slice(0, 12);
    const cipher = all.slice(12);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, await mediaKey(), cipher);
    return new Blob([plain], { type: mime });
  } catch { return null; }
}
```

## A.3 Two obligations most teams will miss — and one directly matches SIH guidance

**1. License attribution is mandatory.** Enabling SQLCipher means your application takes on SQLCipher Community Edition BSD-style license obligations, and **you must reproduce the copyright notice and license text in a user-accessible location — typically an "About" or "Licensing" screen.**

This dovetails exactly with the post-SIH guidelines you have: teams are advised to *"use verified open-source components only and acknowledge them appropriately,"* and are told they are **solely responsible** for plagiarism/IP/copyright conflicts. So build the screen:

```
/about/licenses  →  every dependency, its license, its copyright notice
```

**Say this on a slide.** "We ship an open-source licence register because the ministry will need a clean IP position before funding deployment." Almost no student team will have thought about IP hygiene. It signals you're thinking about the 6–12 month implementation phase the guidelines describe, not just the demo.

**2. Key-loss recovery.** Best practice calls for designing a backup or recovery strategy specifically for key-loss scenarios, rather than assuming secure storage never fails. Your policy, stated honestly: **if the device key is lost, local data is unrecoverable by design; the authoritative record is the last successful server sync.** The Circle Board shows sync freshness so a caregiver always knows the exposure window. Note that `changeEncryptionKey()` exists for rotation without export/reimport.

---

# PART 16 — ENGAGEMENT LEDGER
### Closes: "long-term cognitive engagement" + requirement f's "activity levels"

## B.1 Why this matters more than a streak

The PS asks the platform to *"encourage long-term cognitive engagement."* We deliberately removed streaks, scores and leaderboards (they shame people with dementia). But we replaced them with nothing — a real gap.

The fix is grounded: **CST's evidence base rests on sustained, repeated sessions** — the original 14-session protocol. So the right metric isn't "days in a row," it's **participation continuity**, measured without pressure and shown to the caregiver, never to the person.

## B.2 `src/lib/engagement.ts`

```typescript
import { openSecureDb } from './secureStore';

export type ActivityLevel = 'no_data' | 'low' | 'steady' | 'high';

export interface EngagementLedger {
  personId: string;
  sessionsThisWeek: number;
  sessionsLast4Weeks: number;
  weeksWithAnyParticipation: number;   // continuity, NOT consecutive days
  distinctActivityFamilies: number;    // breadth across CST domains
  cstSessionEquivalents: number;       // sessions toward the 14-session protocol shape
  activityLevel: ActivityLevel;
  lastParticipation: string | null;
  dataFreshAsOf: string | null;        // never conflate with participation
}

const WEEK = 7 * 864e5;

export async function computeLedger(personId: string): Promise<EngagementLedger> {
  const db = await openSecureDb();
  const res = await db.query(
    `SELECT activity, created_at, outcome, synced_at FROM trials
     WHERE person_id = ? AND synthetic = 0 ORDER BY created_at ASC`, [personId]
  );
  const rows = (res.values ?? []) as { activity: string; created_at: string; outcome: string; synced_at?: string }[];

  if (!rows.length) {
    return { personId, sessionsThisWeek: 0, sessionsLast4Weeks: 0, weeksWithAnyParticipation: 0,
             distinctActivityFamilies: 0, cstSessionEquivalents: 0,
             activityLevel: 'no_data', lastParticipation: null, dataFreshAsOf: null };
  }

  const now = Date.now();

  // A "session" = trials grouped within a 45-minute window (not one tap = one session).
  const sessions: number[] = [];
  let last = -Infinity;
  for (const r of rows) {
    const t = new Date(r.created_at).getTime();
    if (t - last > 45 * 60_000) sessions.push(t);
    last = t;
  }

  const sessionsThisWeek   = sessions.filter(t => now - t <= WEEK).length;
  const sessionsLast4Weeks = sessions.filter(t => now - t <= 4 * WEEK).length;

  const weekKeys = new Set(sessions.map(t => Math.floor((now - t) / WEEK)));
  const weeksWithAnyParticipation = [...weekKeys].filter(k => k < 12).length;

  const distinctActivityFamilies = new Set(rows.map(r => r.activity)).size;

  // Engineering bands. NOT clinical thresholds — say this out loud.
  let activityLevel: ActivityLevel = 'no_data';
  if (sessionsThisWeek >= 3)      activityLevel = 'high';
  else if (sessionsThisWeek >= 1) activityLevel = 'steady';
  else if (sessionsLast4Weeks > 0) activityLevel = 'low';

  const syncedRows = rows.filter(r => r.synced_at);

  return {
    personId,
    sessionsThisWeek,
    sessionsLast4Weeks,
    weeksWithAnyParticipation,
    distinctActivityFamilies,
    cstSessionEquivalents: sessions.length,
    activityLevel,
    lastParticipation: new Date(sessions.at(-1)!).toISOString(),
    dataFreshAsOf: syncedRows.length ? syncedRows.map(r => r.synced_at!).sort().at(-1)! : null,
  };
}
```

## B.3 Presentation rules — these are the point

- **The person never sees any of this.** No number, no badge, no level.
- **A missed day is neutral.** The word "streak" appears nowhere in the codebase.
- The caregiver view reads: *"Steady participation — 2 sessions this week, across 3 activity types, 7 of the last 12 weeks."*
- **Never say "12 weeks of engagement" when you mean "12 weeks of received data."** `dataFreshAsOf` is separate from `lastParticipation` for exactly this reason.

---

# PART 17 — VOICE LEGACY
### Closes: "emotional well-being" · This is your most memorable feature

## C.1 The idea

Every prompt a family member records for a pack accumulates into a permanent, exportable **audio library that belongs to the family** — the grandson explaining where the glasses live, the daughter's voice on the morning tablet, a neighbour describing the walk to the namghar.

It outlives the pilot, the tablet, and the app.

## C.2 Why it wins

- **Cost to build: near zero.** You already store and encrypt these blobs. This is a listing view plus an export.
- **Emotional weight: maximum.** When you play a granddaughter's recorded voice in the demo and then say "this family now owns thirty of these, forever," the room goes quiet. That's the moment they remember at scoring time.
- **Zero over-claim.** You aren't claiming a therapeutic effect. You're stating a fact: the recordings exist and the family keeps them.
- **It's the honest inverse of voice cloning.** Every other team reaching for "personalised voice" will synthesise it. You collected real ones. Say that contrast explicitly — it's an ethics *and* engineering differentiator.
- It gives the elder's own social world a durable artefact, which is what "emotional well-being and social interaction" in the PS actually points at.

## C.3 `src/lib/voiceLegacy.ts`

```typescript
import { openSecureDb } from './secureStore';
import { loadDecrypted } from './secureMedia';

export interface LegacyEntry {
  packId: string;
  title: string;
  recordedByName: string;
  recordedByRole: string;
  language: string;
  approvedAt?: string;
  audioKey: string;
  kind: string;
}

export async function listLegacy(personId: string): Promise<LegacyEntry[]> {
  const db = await openSecureDb();
  const res = await db.query(
    `SELECT p.id, p.title, p.media, p.language, p.approved_at, p.kind,
            m.name AS member_name, m.role AS member_role
     FROM packs p LEFT JOIN members m ON m.id = p.recorded_by
     WHERE p.person_id = ? AND p.state != 'withdrawn'
     ORDER BY p.approved_at DESC`, [personId]
  );
  return (res.values ?? []).map((r: any) => ({
    packId: r.id,
    title: r.title,
    recordedByName: r.member_name ?? 'Family',
    recordedByRole: r.member_role ?? 'family',
    language: r.language,
    approvedAt: r.approved_at,
    kind: r.kind,
    audioKey: JSON.parse(r.media).audio_key,
  }));
}

/** Export the family's own recordings. Their content, their property. */
export async function exportLegacy(personId: string): Promise<Blob> {
  const entries = await listLegacy(personId);
  const manifest = entries.map(e => ({
    title: e.title, recorded_by: e.recordedByName, role: e.recordedByRole,
    language: e.language, approved_at: e.approvedAt, file: `${e.audioKey}.webm`,
  }));

  // Minimal store-only ZIP (no dependency needed) — or use JSZip if already installed.
  const files: { name: string; data: Uint8Array }[] = [
    { name: 'manifest.json', data: new TextEncoder().encode(JSON.stringify(manifest, null, 2)) },
  ];
  for (const e of entries) {
    const blob = await loadDecrypted(e.audioKey, 'audio/webm');
    if (blob) files.push({ name: `${e.audioKey}.webm`, data: new Uint8Array(await blob.arrayBuffer()) });
  }
  return buildStoreZip(files);
}
```

## C.4 UI

Route: `/circle/legacy` — a simple chronological list: who recorded it, when, what it was for, and a large play button. One "Give the family a copy" export button.

**One-line pitch:** *"Every prompt recorded in SAATH becomes part of a family's permanent voice archive. We don't synthesise a relative's voice. We help families keep the real one."*

---

# PART 18 — TREND ANALYTICS
### Closes: "cognitive performance tracking and analytics dashboard"

## D.1 The trap to avoid

Naive trend charts blend outcomes across changed difficulty and assistance conditions, producing a line that looks like decline or improvement but is really just a configuration change. That is the single easiest way for a domain judge to destroy your dashboard.

## D.2 The rule: only compare within identical conditions

```typescript
// src/lib/analytics.ts
import { openSecureDb } from './secureStore';
import { Activity, CueType, Difficulty } from './types';

export interface TrendPoint {
  weekStart: string;
  supportedCompletionRate: number | null;
  n: number;
  medianLatencyMs: number | null;
}

export interface ConditionSeries {
  activity: Activity;
  difficulty: Difficulty;
  cue: CueType;
  points: TrendPoint[];
  interpretable: boolean;       // false => show "insufficient comparable data"
  note: string;
}

const MIN_PER_POINT = 3;

export async function conditionTrends(personId: string, weeks = 8): Promise<ConditionSeries[]> {
  const db = await openSecureDb();
  const res = await db.query(
    `SELECT activity, difficulty, cue, outcome, latency_ms, created_at
     FROM trials
     WHERE person_id = ? AND synthetic = 0 AND outcome IN ('completed','not_completed')
     ORDER BY created_at ASC`, [personId]
  );
  const rows = (res.values ?? []) as any[];

  // Group by the FULL condition triple — never merge across it.
  const groups = new Map<string, any[]>();
  for (const r of rows) {
    const k = `${r.activity}|${r.difficulty}|${r.cue}`;
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(r);
  }

  const out: ConditionSeries[] = [];
  for (const [k, rs] of groups) {
    const [activity, difficulty, cue] = k.split('|');
    const byWeek = new Map<string, any[]>();
    for (const r of rs) {
      const d = new Date(r.created_at);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0,0,0,0);
      const wk = d.toISOString().slice(0,10);
      (byWeek.get(wk) ?? byWeek.set(wk, []).get(wk)!).push(r);
    }

    const points: TrendPoint[] = [...byWeek.entries()]
      .sort(([a],[b]) => a.localeCompare(b))
      .slice(-weeks)
      .map(([weekStart, w]) => {
        const done = w.filter(x => x.outcome === 'completed').length;
        const lat = w.map(x => x.latency_ms).filter((x): x is number => typeof x === 'number').sort((a,b)=>a-b);
        return {
          weekStart,
          n: w.length,
          supportedCompletionRate: w.length >= MIN_PER_POINT ? done / w.length : null,
          medianLatencyMs: lat.length ? lat[Math.floor(lat.length/2)] : null,
        };
      });

    const usable = points.filter(p => p.supportedCompletionRate !== null).length;
    out.push({
      activity: activity as Activity,
      difficulty: Number(difficulty) as Difficulty,
      cue: cue as CueType,
      points,
      interpretable: usable >= 3,
      note: usable >= 3
        ? `${usable} weeks with at least ${MIN_PER_POINT} comparable trials.`
        : `Insufficient comparable data — fewer than 3 weeks meet the minimum of ${MIN_PER_POINT} trials at this exact activity, difficulty and assistance level.`,
    });
  }
  return out.sort((a,b) => Number(b.interpretable) - Number(a.interpretable));
}
```

## D.3 Dashboard rules

- Every chart is **labelled with its exact condition**: "Familiar Pairs · difficulty 2 · highlight cue."
- Non-interpretable series render as a **grey "insufficient comparable data" card**, not a misleading line.
- A **configuration-change marker** on the x-axis whenever difficulty or cue changed, so no one reads a step change as decline.
- Nowhere does the word "improving," "declining," "cognitive age," or "progress score" appear.
- Header, always: *"These are activity observations under stated conditions. They are not a clinical measure."*

**Judge-facing line:** *"Most dashboards blend outcomes across changed conditions and produce a trend that is an artefact of configuration. Ours refuses to plot anything it can't compare. Here's a chart it declined to draw, and why."*

---

# PART 19 — CIRCLE ROTATION
### Closes: the caregiver-burnout problem your own research identifies

## E.1 Why

Indian caregiver research reports burnout with **no shared caregiving arrangements** and identifies **task-sharing** as the scalable model. Every competing team will build for one exhausted caregiver. You build the software that stops one person carrying everything.

## E.2 `src/lib/rotation.ts`

```typescript
import { openSecureDb } from './secureStore';

export interface OnCall {
  memberId: string;
  name: string;
  role: string;
  reachableOnLan: boolean;
  loadCount: number;
  lastOnCall?: string;
}

/**
 * Least-recently-loaded consented member available today.
 * Load is measured in acknowledged follow-ups, i.e. actual work done.
 */
export async function pickOnCall(personId: string): Promise<OnCall | null> {
  const db = await openSecureDb();
  const today = new Date().getDay();

  const res = await db.query(
    `SELECT id, name, role, on_call_days, lan_url, last_on_call, load_count
     FROM members WHERE person_id = ? AND consented = 1`, [personId]
  );
  const all = (res.values ?? []) as any[];

  const availableToday = all.filter(m => JSON.parse(m.on_call_days).includes(today));
  const pool = availableToday.length ? availableToday : all;
  if (!pool.length) return null;

  pool.sort((a, b) =>
    (a.load_count ?? 0) - (b.load_count ?? 0) ||
    (a.last_on_call ?? '').localeCompare(b.last_on_call ?? '')
  );

  const m = pool[0];
  return {
    memberId: m.id, name: m.name, role: m.role,
    reachableOnLan: !!m.lan_url,
    loadCount: m.load_count ?? 0,
    lastOnCall: m.last_on_call,
  };
}

export async function recordLoad(memberId: string) {
  const db = await openSecureDb();
  await db.run(
    `UPDATE members SET load_count = COALESCE(load_count,0) + 1, last_on_call = ? WHERE id = ?`,
    [new Date().toISOString(), memberId]
  );
}

/** Burden fairness — surfaced to the whole circle, not hidden in a log. */
export async function burdenReport(personId: string) {
  const db = await openSecureDb();
  const res = await db.query(
    `SELECT name, role, COALESCE(load_count,0) AS load_count FROM members
     WHERE person_id = ? AND consented = 1 ORDER BY load_count DESC`, [personId]
  );
  const rows = (res.values ?? []) as any[];
  const total = rows.reduce((s, r) => s + r.load_count, 0) || 1;
  return rows.map(r => ({
    name: r.name, role: r.role, load: r.load_count,
    share: Math.round((r.load_count / total) * 100),
  }));
}
```

## E.3 The Circle Board panel

```
WHO IS CARRYING THIS
  Bina (daughter)      ████████████░░░  62%   ← flagged
  Rupam (neighbour)    ████░░░░░░░░░░░  23%
  Jyoti (YMA)          ██░░░░░░░░░░░░░  15%

  On call today: Rupam
  "Bina has handled most requests this month. Consider rebalancing."
```

**This single panel is a stronger answer to "caregiver support" than any dashboard chart**, because it addresses the documented problem rather than a feature checkbox. Put it on a slide.

---

# PART 20 — REGIONAL ASSET LIBRARY
### Closes: requirement d when a household has no photos

## F.1 The gap

Pack Studio is strong when a family can photograph their own things. But some households can't — no camera comfort, no suitable objects, or an ASHA worker setting up on a first visit. Requirement d ("culturally familiar visuals, sounds") then has no fallback.

## F.2 The fix, done without stereotyping

A small **reviewed** starter library, shipped offline, deliberately generic-but-regional and explicitly labelled as a fallback:

```
src/content/packs/regional/
  objects/    steel_tumbler, kerosene_lamp, bamboo_basket, gamosa_cloth,
              betel_leaf_box, wooden_stool, tea_kettle, umbrella
  places/     courtyard, doorway, kitchen_shelf, veranda
  sounds/     temple_bell.wav, wooden_clapper.wav, bamboo_flute.wav,
              rain_on_tin_roof.wav, morning_birds.wav
  patterns/   gamosa_border_motif, bamboo_weave, river_curve
  manifest.json   # source, licence, reviewer, permitted uses, review date
```

**Rules that keep this defensible:**
1. **Every asset carries provenance** in the manifest: source, licence, who reviewed it, review date. This also satisfies the SIH guideline on acknowledging open-source components.
2. **Sounds are timbrally distinct** (bell / wood / flute), never adjacent sine tones — presbycusis makes close frequencies indistinguishable on cheap tablet speakers.
3. **Patterns use shape and contrast, never colour alone.**
4. **The UI labels these as "general" and prompts to replace them**: *"Using a general picture. Add one of [name]'s own things when you can."*
5. **Never presented as "what NER people recognise."** A familiar object is whatever the household approves — this library is scaffolding for day one, not a claim about a region.

**Say the rule out loud in the pitch:** *"We ship a small reviewed fallback library, but the app actively nags the family to replace it with their own things — because personalised content is what the CST personalisation literature associates with engagement and adherence, and because we're not going to guess what a Meghalaya household keeps on its shelf."*

---

# PART 21 — VOICE-GUIDED NAVIGATION (full implementation)
### Closes: requirement c, fully implemented

```typescript
// src/lib/voiceNav.ts
import { playCue } from './audio';
import { Lang } from './types';

type Handlers = {
  onNext: () => void;
  onPrev: () => void;
  onSelect: () => void;
  onRepeat: () => void;
  onHome: () => void;
};

const SWIPE_MIN_PX = 60;
const LONG_PRESS_MS = 1500;
const DOUBLE_TAP_MS = 400;

export function attachVoiceNav(root: HTMLElement, h: Handlers) {
  let sx = 0, sy = 0, st = 0;
  let lastTap = 0;
  let longTimer: number | undefined;

  const start = (e: TouchEvent) => {
    const t = e.touches[0];
    sx = t.clientX; sy = t.clientY; st = Date.now();
    longTimer = window.setTimeout(() => { longTimer = undefined; h.onHome(); }, LONG_PRESS_MS);
  };

  const end = (e: TouchEvent) => {
    if (longTimer) { clearTimeout(longTimer); longTimer = undefined; } else return; // long press fired

    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;

    if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) {
      dx > 0 ? h.onNext() : h.onPrev();
      return;
    }
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20 && Date.now() - st < 500) {
      const now = Date.now();
      if (now - lastTap < DOUBLE_TAP_MS) { lastTap = 0; h.onSelect(); }
      else { lastTap = now; setTimeout(() => { if (lastTap) { lastTap = 0; h.onRepeat(); } }, DOUBLE_TAP_MS); }
    }
  };

  root.addEventListener('touchstart', start, { passive: true });
  root.addEventListener('touchend', end, { passive: true });
  return () => {
    root.removeEventListener('touchstart', start);
    root.removeEventListener('touchend', end);
  };
}

/** Auto-announce on every screen change. Cached audio => works offline. */
export async function announce(cueKey: string, lang: Lang) {
  await playCue(cueKey, lang);
}
```

**Gesture contract (identical on every screen):** single tap = repeat · swipe right = next · swipe left = previous · double-tap = select · long-press 1.5s = home.

**Test it by operating the entire app with your eyes closed.** If you can't complete a full journey, it isn't done.

---

# PART 22 — INTERPRETING "COGNITIVE CONDITION"
### Requirement b, second clause — the interpretation risk

The PS says the AI should adapt *"based on patient performance **and cognitive condition**."*

**Our implementation:** `care_config` is a documented, professional-supplied configuration that bounds what the model may propose — maximum difficulty, permitted cue types, sensory mode, excluded content. It is **not** a disease stage inferred from gameplay.

```typescript
export interface CareConfig {
  max_difficulty: 1|2|3|4;
  allowed_cues: CueType[];
  sensory_mode: 'both' | 'visual_only' | 'audio_supported';
  excluded_pack_ids: string[];
  // Provenance is mandatory — this is what makes it defensible.
  source: 'clinician' | 'trained_worker' | 'caregiver_preference' | 'not_assessed';
  set_by: string;
  set_at: string;
  clinical_stage_supplied: boolean;   // true ONLY if a professional supplied one
}
```

**Say this before you're asked:** *"We interpret 'cognitive condition' as care-team-supplied configuration constraining difficulty — never a stage we infer from a game. The field records who set it and whether a professional supplied a clinical stage. If the sponsor requires a formal staging field, it must come from a clinician and we map it to reviewed activity bounds."*

**Action item:** confirm this reading with your college SPOC. It's the one requirement where our interpretation could diverge from the sponsor's intent.

---

# PART 23 — REVISED BUILD ORDER (supersedes Part 13)

## Tier 1 — foundational (Sep 10–12)
1. **Secure store first** (Part 15) — everything writes through it; retrofitting encryption later means migrating every table
2. Pack Studio + regional fallback library (Part 20)
3. Familiar Pairs + Bayesian engine (Part 7) + 8 passing tests
4. Help screen with staleness
5. Engagement Ledger (Part 16) — cheap once trials exist
6. Airplane-mode cold start

## Tier 2 — requirement completion (Sep 13–15)
7. Remaining four activity families
8. Four reminder categories, native alarms
9. Voice-guided navigation (Part 21) + eyes-closed test
10. Circle Board: ledger + trend analytics (Part 18) + rotation panel (Part 19)
11. Bhashini audio generated and cached (Part 8)

## Tier 3 — the differentiators (Sep 16–17)
12. **Voice Legacy** (Part 17) — highest emotional return per hour of work
13. Evidence Inspector + CST Protocol Map + Failure Theatre
14. LAN alert to second phone
15. **About/Licences screen** (Part 15.3) — small, and no competitor will have it
16. Supabase sync + RLS + idempotency test (Part 9.4)

## Sep 18–19 — break it, then rehearse
All 20 manual tests. 20 reconnect cycles. Reboot. Permission denial. Profile switch. Language audit. Measure real latency. Rehearse ten times.

---

# PART 24 — THE FINAL PITCH FRAME

## Six claims, each with its evidence and its limit

| Claim | Evidence | Honest limit |
|---|---|---|
| Grounded in a real intervention | CST: Cochrane review, 15 RCTs, benefit over and above medication, sustained 3 months; original 14-session protocol; published cultural-adaptation guidelines | CST has evidence. **Our digital delivery of it does not yet.** |
| Personalisation matters | Personalisation literature associates personalised activities with greater engagement and adherence | Association, not proof for our build |
| Real, inspectable AI | Beta-Binomial engine, Evidence Inspector showing posterior + sample size + what it changed vs baseline | Sparse data; thresholds are engineering config, not clinical cutoffs |
| Genuinely offline | Airplane-mode cold start; native alarms; idempotent sync; explicit pending states | Android platform restrictions apply; measured on one named device |
| Genuinely secure | SQLCipher 256-bit AES; key in Android Keystore; AES-GCM media; verifiable deletion; licence register | Not certified or legally reviewed; key loss means local data is unrecoverable by design |
| Addresses the actual problem | Indian research: burnout, no shared care, task-sharing as the scalable model → Circle rotation + burden fairness | No community partnership secured; NER institutions named as design targets, not collaborators |

## The 30-second close

> "Cognitive Stimulation Therapy has Cochrane-level evidence, and published guidelines for adapting it to other cultures. Nobody has delivered it offline, in an NER dialect, in the voices of a family's own people, with the caregiving load shared across a village circle instead of crushing one daughter. That's SAATH. We'll turn the internet off and show you. We'll also show you the chart our dashboard refused to draw, and the message it refused to claim it sent. CST works. Whether our delivery of it works is what a six-month pilot would find out — and the guidelines say that's exactly what happens after this."

---

---

# PART 14 — SOURCES

**Cognitive Stimulation Therapy — your evidence base**
- Aguirre E, Woods RT, Spector A, Orrell M. "Cognitive stimulation for dementia: a systematic review of the evidence of effectiveness from randomised controlled trials." *Ageing Res Rev* 2013 — https://pubmed.ncbi.nlm.nih.gov/22889599/
- Cochrane CD005562, "Can cognitive stimulation benefit people with dementia?" — https://www.cochrane.org/evidence/CD005562_can-cognitive-stimulation-benefit-people-dementia
- Systematic review & meta-analysis of the original 14-session CST protocol, 2024 — https://www.sciencedirect.com/science/article/pii/S1568163724001302
- Predictors of CST response / personalization review, 2025 — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12382844/
- Digital CST systematic review & meta-analysis, 2026 — https://pubmed.ncbi.nlm.nih.gov/41942923/
- NICE NG97 — https://www.nice.org.uk/guidance/ng97/chapter/recommendations

**India / NER context**
- Lee et al., "Prevalence of dementia in India," *Alzheimer's & Dementia* 2023 (7.4% at 60+; ~8.8M; higher rural; cross-state variation) — https://alz-journals.onlinelibrary.wiley.com/doi/10.1002/alz.12928
- Community-based dementia care in India: narrative review, 2024 — https://pubmed.ncbi.nlm.nih.gov/38726806/
- Community-based dementia care models in India: scoping review, 2025 (task-sharing via mobile tech) — https://alz-journals.onlinelibrary.wiley.com/doi/10.1002/alz70858_099759
- MYNAH caregiver study (burnout, no shared care, no community services) — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5131085/
- Odisha caregiver study (collective responsibility, task-sharing) — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10227469/
- CSDD/DEF NER connectivity brief 2023 — https://www.defindia.org/wp-content/uploads/2023/07/The-State-of-Access-Digital-Connectivity-and-Inclusion-in-North-Eastern-Region-of-India-2023_PRINT-1.pdf
- Census India, Meghalaya mother tongue — https://censusindia.gov.in/nada/index.php/catalog/10214

**Language technology**
- AI4Bharat Indic-TTS (SOTA TTS for 13 languages incl. Assamese, Bodo, Manipuri; open-sourced on Bhashini) — https://github.com/AI4Bharat/Indic-TTS
- Rasa expressive TTS dataset, funded by Bhashini/MeitY (Assamese: 25.8h female, 28.55h male) — https://huggingface.co/datasets/ai4bharat/Rasa
- Bhashini client SDK — https://pypi.org/project/bhashini-client-sdk/

**Platform constraints**
- Android scheduled alarms — https://developer.android.com/develop/background-work/services/alarms
- MDN Background Synchronization (limited availability) — https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
- MDN storage quotas & eviction — https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- Twilio outbound voice — https://www.twilio.com/docs/voice/tutorials/how-to-make-outbound-phone-calls
- Twilio Gather — https://www.twilio.com/docs/voice/twiml/gather

**Prior art — acknowledge, don't claim novelty over**
- Memory Lane Games — https://co.memorylanegames.com/in-home-care/
- MapHabit — https://maphabit.com/pages/how-it-works ; JMIR Aging feasibility study — https://pmc.ncbi.nlm.nih.gov/articles/PMC8564643/
- COACH adaptive prompting, BMC Geriatrics 2008 — https://link.springer.com/article/10.1186/1471-2318-8-28

**Possible review contacts — no outreach made, no partnership exists, do not display logos**
- ARDSI Guwahati Chapter — https://www.ardsiguwahati.com/
- down town hospital Guwahati, Geriatric Medicine — https://downtownhospitals.in/VFZSQk5BPT0=/departments-and-clinics/department-of-geriatric-medicine.ghtml

**On competition numbers:** no source publishes per-problem-statement team counts for SIH 2026. Any specific figure claiming otherwise is fabricated. Do not use one.

---

## Start here

```powershell
npx create-next-app@latest saath --typescript --tailwind --app --src-dir --import-alias "@/*"
```

Then paste `db.ts`, `model.ts`, and `tests/model.test.ts`. Get all eight tests green today. Everything else is downstream of that.

## Additional sources (encryption)
**Encryption**
- Capacitor SQLite database encryption (SQLCipher, 256-bit AES, `androidIsEncryption`) — https://github.com/capacitor-community/sqlite/blob/master/docs/DatabaseEncryption.md
- Encrypting Capacitor SQLite + key management via Secure Preferences / Android Keystore; key-loss recovery guidance — https://capawesome.io/blog/encrypting-capacitor-sqlite-database/
- SQLCipher Community Edition BSD licence obligations and the user-accessible attribution requirement — https://capawesome.io/plugins/sqlite

**Everything else** — see SAATH_COMPLETE_BUILD_GUIDE.md Part 14 (CST evidence base, LASI-DAD prevalence, Indian caregiver research, Bhashini/AI4Bharat, Android/MDN platform constraints, prior art).


---

## Start here

Install the secure store (Part 15) and get it writing encrypted trials today — every other feature in this document sits on top of it. Then work Part 23's build order top to bottom.
