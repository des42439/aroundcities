-- AroundCities V2: simple manual source checklist for curator discovery.
-- This is not a crawler, scraper, scheduler, or automation queue.

create table public.sources (
  source_id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  notes text,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sources_last_checked_created_idx
  on public.sources (last_checked_at asc nulls first, created_at asc);
