-- SAATH — initial schema. Mirrors src/lib/db.ts (Dexie) field-for-field so
-- sync.ts's upsert-by-id is a straight mapping. Run against a Supabase
-- project once NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are
-- available (see .env.local.example).

create table persons (
  id uuid primary key,
  display_name text not null,
  language text not null,
  literacy text not null,
  navigation text not null,
  care_config jsonb not null default '{}',
  consent_ref text,
  created_at timestamptz not null default now()
);

create table circle_members (
  id uuid primary key,
  person_id uuid references persons(id) on delete cascade,
  name text not null,
  role text not null,
  phone text,
  consented boolean not null default false,
  on_call_days int[] not null default '{}',
  device_id text,
  lan_url text,
  load_count int not null default 0,
  last_on_call timestamptz
);

create table content_packs (
  id uuid primary key,
  person_id uuid references persons(id) on delete cascade,
  version int not null,
  kind text not null,
  title text not null,
  is_current_location boolean not null default false,
  media jsonb not null,
  recorded_by uuid,
  language text not null,
  approved_by text,
  approved_at timestamptz,
  review_by date,
  state text not null,
  permitted_uses text[] not null,
  unique (id, version)
);

create table trials (
  id uuid primary key, -- client-generated: idempotency key
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
  received_at timestamptz not null default now()
);

create table followups (
  id uuid primary key,
  person_id uuid references persons(id) on delete cascade,
  origin text not null,
  state text not null,
  target_member_id uuid,
  attempts int not null default 0,
  created_at timestamptz not null,
  expires_at timestamptz not null,
  acknowledged_by uuid,
  acknowledged_at timestamptz,
  resolved_by uuid,
  history jsonb not null default '[]'
);

create table reminders (
  id uuid primary key,
  person_id uuid references persons(id) on delete cascade,
  category text not null,
  care_plan_text text not null,
  hour int not null,
  minute int not null,
  period text not null,
  audio_pack_id uuid,
  version int not null,
  device_activated boolean not null default false,
  native_notification_id int
);

create table handoffs (
  id uuid primary key,
  person_id uuid references persons(id) on delete cascade,
  from_member uuid not null,
  to_member uuid not null,
  pack_versions jsonb not null default '{}',
  state text not null,
  sent_at timestamptz not null,
  received_at timestamptz,
  accepted_at timestamptz
);

create table audit (
  id uuid primary key,
  actor text not null,
  action text not null,
  scope text not null,
  at timestamptz not null default now()
);

-- Row level security: a circle member sees only their circle's people.
alter table persons        enable row level security;
alter table circle_members enable row level security;
alter table content_packs  enable row level security;
alter table trials         enable row level security;
alter table followups      enable row level security;
alter table reminders      enable row level security;
alter table handoffs       enable row level security;

create policy circle_read_persons on persons for select
  using (exists (
    select 1 from circle_members m
    where m.person_id = persons.id and m.id = auth.uid()::uuid
  ));

create policy circle_read_packs on content_packs for select
  using (exists (
    select 1 from circle_members m
    where m.person_id = content_packs.person_id and m.id = auth.uid()::uuid
  ));
create policy circle_write_packs on content_packs for insert
  with check (exists (
    select 1 from circle_members m
    where m.person_id = content_packs.person_id and m.id = auth.uid()::uuid
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

create policy circle_read_followups on followups for select
  using (exists (
    select 1 from circle_members m
    where m.person_id = followups.person_id and m.id = auth.uid()::uuid
  ));

create policy circle_read_reminders on reminders for select
  using (exists (
    select 1 from circle_members m
    where m.person_id = reminders.person_id and m.id = auth.uid()::uuid
  ));

create policy circle_read_handoffs on handoffs for select
  using (exists (
    select 1 from circle_members m
    where m.person_id = handoffs.person_id and m.id = auth.uid()::uuid
  ));
