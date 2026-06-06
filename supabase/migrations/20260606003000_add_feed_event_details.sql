-- AroundCities V2: optional structured event details for feed-based event posts.
-- Keeps events as Feed records while allowing lightweight event metadata.

create table if not exists public.feed_event_details (
  detail_id uuid primary key default gen_random_uuid(),
  feed_id uuid not null unique references public.feeds(feed_id) on delete cascade,
  entry_type text not null default 'unknown'
    check (entry_type in ('free', 'paid', 'unknown')),
  registration_type text not null default 'unknown'
    check (registration_type in (
      'free_registration',
      'registration_required',
      'walk_in',
      'unknown'
    )),
  open_to_public boolean,
  ticket_required boolean,
  lucky_draw boolean,
  dress_code text,
  organizer text,
  event_notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_by text,
  updated_at timestamptz not null default now()
);

create index if not exists feed_event_details_feed_id_idx
  on public.feed_event_details (feed_id);

alter table public.feed_event_details enable row level security;

drop policy if exists "Public can read event details on published feeds"
  on public.feed_event_details;

create policy "Public can read event details on published feeds"
  on public.feed_event_details
  for select
  using (
    exists (
      select 1
      from public.feeds
      where feeds.feed_id = feed_event_details.feed_id
        and feeds.status = 'published'
    )
  );

update public.feeds
set
  title = btrim(regexp_replace(
    title,
    '^happening\s+(now|today|tomorrow|this weekend|next weekend|next month)\s*:?\s*',
    '',
    'i'
  )),
  updated_at = now()
where title ~* '^happening\s+(now|today|tomorrow|this weekend|next weekend|next month)\s*:?\s*'
  and btrim(regexp_replace(
    title,
    '^happening\s+(now|today|tomorrow|this weekend|next weekend|next month)\s*:?\s*',
    '',
    'i'
  )) <> '';
