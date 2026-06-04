-- Add flexible feed-level operating hours / schedule notes.
-- This supports recurring shop or clinic hours as well as date-limited events.

alter table public.feeds
  add column if not exists operating_hours text;
