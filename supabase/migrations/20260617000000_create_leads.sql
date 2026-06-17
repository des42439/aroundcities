-- AroundCities V2: internal curator inbox for potential future content ideas.
-- Leads are admin-only and are not public content, feeds, history records, or automation jobs.

create table public.leads (
  lead_id uuid primary key default gen_random_uuid(),
  title text not null,
  lead_content text,
  why_interesting text,
  source_name text,
  source_type text,
  source_url text,
  source_page text,
  source_section text,
  source_note text,
  lead_type text,
  place_name text,
  relevant_date date,
  tags text[] not null default '{}',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_status_check check (status in ('active', 'archived'))
);

create index leads_status_updated_idx
  on public.leads (status, updated_at desc);

create index leads_relevant_date_idx
  on public.leads (relevant_date);
