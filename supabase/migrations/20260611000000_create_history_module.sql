create table if not exists public.history_records (
  history_id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_year integer not null,
  event_month integer not null check (event_month between 1 and 12),
  event_day integer not null check (event_day between 1 and 31),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  place_name text,
  location_note text,
  tags text[] not null default '{}',
  source_url text,
  source_note text,
  source_screenshot_url text,
  confidence text not null default 'medium' check (confidence in ('high', 'medium', 'low')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.history_photos (
  history_photo_id uuid primary key default gen_random_uuid(),
  history_id uuid not null references public.history_records(history_id) on delete cascade,
  photo_id uuid not null references public.photos(photo_id) on delete cascade,
  sequence integer not null default 0,
  note text,
  created_at timestamptz not null default now(),
  unique (history_id, photo_id)
);

create index if not exists history_records_status_idx
  on public.history_records(status);

create index if not exists history_records_event_date_idx
  on public.history_records(event_month, event_day, event_year);

create index if not exists history_photos_history_id_idx
  on public.history_photos(history_id, sequence, created_at);

alter table public.history_records enable row level security;
alter table public.history_photos enable row level security;

create policy "Allow anonymous read of published history records"
  on public.history_records
  for select
  to anon
  using (status = 'published');

create policy "Allow anonymous read of published history photos"
  on public.history_photos
  for select
  to anon
  using (
    exists (
      select 1
      from public.history_records
      where history_records.history_id = history_photos.history_id
        and history_records.status = 'published'
    )
  );

create policy "Allow service role full access to history records"
  on public.history_records
  for all
  to service_role
  using (true)
  with check (true);

create policy "Allow service role full access to history photos"
  on public.history_photos
  for all
  to service_role
  using (true)
  with check (true);
