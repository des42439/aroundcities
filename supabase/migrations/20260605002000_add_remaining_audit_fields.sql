-- Add audit user fields to older Phase 1 support tables.
-- The 2026-06-05 schema review requires created/updated user and datetime
-- fields across app tables.

alter table public.feed_operating_hours
  add column if not exists created_by text,
  add column if not exists updated_by text;

alter table public.sources
  add column if not exists created_by text,
  add column if not exists updated_by text;

alter table public.admin_error_logs
  add column if not exists created_by text,
  add column if not exists updated_by text,
  add column if not exists updated_at timestamptz not null default now();
