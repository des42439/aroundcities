-- AroundCities V2 use-case schema extensions.
-- Additive migration for the 2026-06-05 final table design and use cases.
-- This keeps current Phase 1 app columns/tables intact while adding the
-- relationships and fields needed for parent feeds, source evidence, schedules,
-- feed-place metadata, photo ordering, and audit fields.

alter table public.feeds
  add column if not exists description text,
  add column if not exists parent_feed_id uuid,
  add column if not exists created_by text,
  add column if not exists updated_by text;

update public.feeds
set description = content
where description is null
  and content is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'feeds_parent_feed_id_fkey'
      and conrelid = 'public.feeds'::regclass
  ) then
    alter table public.feeds
      add constraint feeds_parent_feed_id_fkey
      foreign key (parent_feed_id)
      references public.feeds(feed_id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'feeds_parent_not_self_check'
      and conrelid = 'public.feeds'::regclass
  ) then
    alter table public.feeds
      add constraint feeds_parent_not_self_check
      check (parent_feed_id is null or parent_feed_id <> feed_id);
  end if;
end $$;

alter table public.places
  add column if not exists created_by text,
  add column if not exists updated_by text;

alter table public.photos
  add column if not exists longitude double precision,
  add column if not exists latitude double precision,
  add column if not exists sequence integer not null default 0,
  add column if not exists created_by text,
  add column if not exists updated_by text;

alter table public.feed_places
  add column if not exists is_primary boolean not null default false,
  add column if not exists location_note text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists created_by text,
  add column if not exists updated_by text;

create table if not exists public.channels (
  channel_id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  screenshot_url text,
  remarks text,
  last_checked_at timestamptz,
  created_by text,
  created_at timestamptz not null default now(),
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists public.feed_sources (
  source_id uuid primary key default gen_random_uuid(),
  feed_id uuid not null references public.feeds(feed_id) on delete cascade,
  source_url text,
  channel_id uuid references public.channels(channel_id) on delete set null,
  source_note text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_by text,
  updated_at timestamptz not null default now(),
  check (
    source_url is not null
    or channel_id is not null
    or source_note is not null
  )
);

create table if not exists public.source_screenshots (
  screenshot_id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.feed_sources(source_id) on delete cascade,
  screenshot_url text not null,
  sequence integer not null default 0,
  remarks text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists public.feed_schedules (
  schedule_id uuid primary key default gen_random_uuid(),
  feed_id uuid not null references public.feeds(feed_id) on delete cascade,
  schedule_type text not null default 'occurrence'
    check (schedule_type in (
      'occurrence',
      'date_range',
      'registration',
      'operating_hours',
      'other'
    )),
  schedule_date date,
  start_date date,
  end_date date,
  days_of_week int[],
  start_time time,
  end_time time,
  remarks text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_by text,
  updated_at timestamptz not null default now(),
  check (
    schedule_date is not null
    or (start_date is not null and end_date is not null)
  ),
  check (
    start_date is null
    or end_date is null
    or start_date <= end_date
  ),
  check (
    days_of_week is null
    or days_of_week <@ array[0,1,2,3,4,5,6]
  ),
  check (
    start_time is null
    or end_time is null
    or start_time <= end_time
  )
);

create unique index if not exists channels_url_key
  on public.channels (url);

create index if not exists feeds_parent_feed_id_idx
  on public.feeds (parent_feed_id);

create index if not exists photos_feed_sequence_idx
  on public.photos (feed_id, sequence);

with ranked_featured_photos as (
  select
    photo_id,
    row_number() over (
      partition by feed_id
      order by created_at asc, photo_id asc
    ) as featured_rank
  from public.photos
  where featured
)
update public.photos
set featured = false
where photo_id in (
  select photo_id
  from ranked_featured_photos
  where featured_rank > 1
);

create unique index if not exists photos_one_featured_per_feed_idx
  on public.photos (feed_id)
  where featured;

create unique index if not exists feed_places_one_primary_per_feed_idx
  on public.feed_places (feed_id)
  where is_primary;

create index if not exists feed_sources_feed_id_idx
  on public.feed_sources (feed_id);

create index if not exists feed_sources_channel_id_idx
  on public.feed_sources (channel_id);

create index if not exists source_screenshots_source_sequence_idx
  on public.source_screenshots (source_id, sequence);

create index if not exists feed_schedules_feed_date_idx
  on public.feed_schedules (feed_id, schedule_date);

create index if not exists feed_schedules_date_range_idx
  on public.feed_schedules (start_date, end_date);

create index if not exists feed_schedules_days_idx
  on public.feed_schedules using gin (days_of_week);

create index if not exists channels_last_checked_idx
  on public.channels (last_checked_at asc nulls first, created_at asc);
