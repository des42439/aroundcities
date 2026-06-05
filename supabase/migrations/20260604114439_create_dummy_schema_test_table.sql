create table if not exists public.codex_dummy_schema_test (
  dummy_id uuid primary key default gen_random_uuid(),
  note text not null default 'Codex schema test table',
  created_at timestamptz not null default now()
);
