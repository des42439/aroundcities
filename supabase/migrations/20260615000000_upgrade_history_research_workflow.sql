alter table public.history_records
  drop constraint if exists history_records_status_check;

update public.history_records
set status = 'drafted'
where status = 'draft';

alter table public.history_records
  alter column status set default 'drafted';

alter table public.history_records
  add constraint history_records_status_check
  check (status in ('drafted', 'researched', 'pending_review', 'published', 'archived'));

create table if not exists public.history_sources (
  history_source_id uuid primary key default gen_random_uuid(),
  history_id uuid not null references public.history_records(history_id) on delete cascade,
  source_url text not null,
  source_title text,
  source_note text,
  source_status text not null default 'pending' check (source_status in ('pending', 'reviewed', 'rejected')),
  source_screenshot_url text,
  screenshot_status text not null default 'pending' check (screenshot_status in ('pending', 'completed', 'failed')),
  screenshot_error text,
  sequence integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (history_id, source_url)
);

create index if not exists history_sources_history_id_idx
  on public.history_sources(history_id, sequence, created_at);

create index if not exists history_sources_source_status_idx
  on public.history_sources(source_status);

create index if not exists history_sources_screenshot_status_idx
  on public.history_sources(screenshot_status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_history_sources_updated_at on public.history_sources;

create trigger set_history_sources_updated_at
  before update on public.history_sources
  for each row
  execute function public.set_updated_at();

alter table public.history_sources enable row level security;

create policy "Allow service role full access to history sources"
  on public.history_sources
  for all
  to service_role
  using (true)
  with check (true);
