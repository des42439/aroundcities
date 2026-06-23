-- Centralize section evidence in public.sources.
-- The former public.sources table was the curator's manual review checklist.

alter table public.sources rename to source_checklist;

alter index if exists public.sources_last_checked_created_idx
  rename to source_checklist_last_checked_created_idx;

create table public.sources (
  source_id uuid primary key default gen_random_uuid(),
  section_type text not null check (section_type in ('history', 'feed')),
  section_id uuid not null,
  source_title text,
  source_url text,
  source_note text,
  source_screenshot_url text,
  screenshot_status text not null default 'pending'
    check (screenshot_status in ('pending', 'completed', 'failed')),
  screenshot_error text,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'reviewed', 'rejected')),
  sequence integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    source_url is not null
    or source_note is not null
    or source_screenshot_url is not null
  )
);

insert into public.sources (
  source_id,
  section_type,
  section_id,
  source_title,
  source_url,
  source_note,
  source_screenshot_url,
  screenshot_status,
  screenshot_error,
  review_status,
  sequence,
  created_at,
  updated_at
)
select
  history_source_id,
  'history',
  history_id,
  source_title,
  source_url,
  source_note,
  source_screenshot_url,
  screenshot_status,
  screenshot_error,
  source_status,
  sequence,
  created_at,
  updated_at
from public.history_sources;

insert into public.sources (
  source_id,
  section_type,
  section_id,
  source_title,
  source_url,
  source_note,
  source_screenshot_url,
  screenshot_status,
  screenshot_error,
  review_status,
  sequence,
  created_at,
  updated_at
)
select
  fs.source_id,
  'feed',
  fs.feed_id,
  c.name,
  coalesce(fs.source_url, c.url),
  concat_ws(
    E'\n\n',
    fs.source_note,
    case
      when screenshot.remarks is not null
        then 'Screenshot note: ' || screenshot.remarks
      else null
    end
  ),
  screenshot.screenshot_url,
  case when screenshot.screenshot_url is null then 'pending' else 'completed' end,
  null,
  'reviewed',
  coalesce(screenshot.sequence, 0),
  fs.created_at,
  greatest(fs.updated_at, coalesce(screenshot.updated_at, fs.updated_at))
from public.feed_sources fs
left join public.channels c on c.channel_id = fs.channel_id
left join lateral (
  select
    source_screenshots.screenshot_url,
    source_screenshots.remarks,
    source_screenshots.sequence,
    source_screenshots.updated_at
  from public.source_screenshots
  where source_screenshots.source_id = fs.source_id
  order by source_screenshots.sequence asc, source_screenshots.created_at asc
  limit 1
) screenshot on true;

insert into public.sources (
  section_type,
  section_id,
  source_url,
  review_status,
  created_at,
  updated_at
)
select
  'feed',
  feeds.feed_id,
  feeds.source_url,
  'reviewed',
  feeds.created_at,
  feeds.updated_at
from public.feeds
where feeds.source_url is not null
  and not exists (
    select 1
    from public.sources
    where sources.section_type = 'feed'
      and sources.section_id = feeds.feed_id
      and sources.source_url = feeds.source_url
  );

create index sources_section_sequence_idx
  on public.sources (section_type, section_id, sequence, created_at);

create index sources_review_status_idx
  on public.sources (review_status);

create index sources_screenshot_status_idx
  on public.sources (screenshot_status);

create unique index sources_history_url_key
  on public.sources (section_type, section_id, source_url)
  where section_type = 'history' and source_url is not null;

create trigger set_sources_updated_at
  before update on public.sources
  for each row
  execute function public.set_updated_at();

alter table public.sources enable row level security;

create policy "Allow anonymous read of published content sources"
  on public.sources
  for select
  to anon
  using (
    (
      section_type = 'feed'
      and exists (
        select 1
        from public.feeds
        where feeds.feed_id = sources.section_id
          and feeds.status = 'published'
      )
    )
    or (
      section_type = 'history'
      and exists (
        select 1
        from public.history_records
        where history_records.history_id = sources.section_id
          and history_records.status = 'published'
      )
    )
  );

create policy "Allow service role full access to content sources"
  on public.sources
  for all
  to service_role
  using (true)
  with check (true);

drop table public.source_screenshots;
drop table public.feed_sources;
drop table public.history_sources;
drop table public.channels;

update public.feeds set source_url = null where source_url is not null;
