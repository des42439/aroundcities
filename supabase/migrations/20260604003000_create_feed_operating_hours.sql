-- Structured, queryable operating hours / schedule rows tied to feeds.
-- Keep feeds.operating_hours as the human-readable display note.

create table if not exists public.feed_operating_hours (
  operating_hour_id uuid primary key default gen_random_uuid(),
  feed_id uuid not null references public.feeds(feed_id) on delete cascade,
  schedule_type text not null
    check (schedule_type in ('weekly', 'date_range')),
  days_of_week int[],
  date_start date,
  date_end date,
  time_start time,
  time_end time,
  closed boolean not null default false,
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (
      schedule_type = 'weekly'
      and days_of_week is not null
      and cardinality(days_of_week) > 0
      and days_of_week <@ array[0,1,2,3,4,5,6]
    )
    or (
      schedule_type = 'date_range'
      and date_start is not null
      and date_end is not null
    )
  ),
  check (
    closed
    or (time_start is not null and time_end is not null)
  )
);

create index if not exists feed_operating_hours_feed_id_idx
  on public.feed_operating_hours (feed_id, sort_order);

create index if not exists feed_operating_hours_days_idx
  on public.feed_operating_hours using gin (days_of_week);

create index if not exists feed_operating_hours_date_range_idx
  on public.feed_operating_hours (date_start, date_end);
