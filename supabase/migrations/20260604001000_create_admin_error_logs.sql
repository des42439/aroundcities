-- AroundCities V2: durable admin troubleshooting logs.
-- Used by server actions to persist admin workflow failures with an Error ID.

create table public.admin_error_logs (
  log_id uuid primary key default gen_random_uuid(),
  error_id text not null unique,
  area text not null,
  message text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index admin_error_logs_created_at_idx
  on public.admin_error_logs (created_at desc);

create index admin_error_logs_area_idx
  on public.admin_error_logs (area);
