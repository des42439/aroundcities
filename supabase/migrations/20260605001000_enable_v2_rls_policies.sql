-- AroundCities V2 RLS policies.
-- Public anonymous access can read only published public content.
-- Admin/server writes use the service-role key, which bypasses RLS.

alter table public.places enable row level security;
alter table public.feeds enable row level security;
alter table public.photos enable row level security;
alter table public.feed_places enable row level security;
alter table public.feed_operating_hours enable row level security;
alter table public.sources enable row level security;
alter table public.admin_error_logs enable row level security;
alter table public.channels enable row level security;
alter table public.feed_sources enable row level security;
alter table public.source_screenshots enable row level security;
alter table public.feed_schedules enable row level security;

create policy "Public can read published feeds"
  on public.feeds
  for select
  to anon
  using (status = 'published');

create policy "Public can read places on published feeds"
  on public.places
  for select
  to anon
  using (
    exists (
      select 1
      from public.feeds
      where feeds.place_id = places.place_id
        and feeds.status = 'published'
    )
    or exists (
      select 1
      from public.feed_places
      join public.feeds
        on feeds.feed_id = feed_places.feed_id
      where feed_places.place_id = places.place_id
        and feeds.status = 'published'
    )
  );

create policy "Public can read photos on published feeds"
  on public.photos
  for select
  to anon
  using (
    exists (
      select 1
      from public.feeds
      where feeds.feed_id = photos.feed_id
        and feeds.status = 'published'
    )
  );

create policy "Public can read feed places on published feeds"
  on public.feed_places
  for select
  to anon
  using (
    exists (
      select 1
      from public.feeds
      where feeds.feed_id = feed_places.feed_id
        and feeds.status = 'published'
    )
  );

create policy "Public can read operating hours on published feeds"
  on public.feed_operating_hours
  for select
  to anon
  using (
    exists (
      select 1
      from public.feeds
      where feeds.feed_id = feed_operating_hours.feed_id
        and feeds.status = 'published'
    )
  );

create policy "Public can read schedules on published feeds"
  on public.feed_schedules
  for select
  to anon
  using (
    exists (
      select 1
      from public.feeds
      where feeds.feed_id = feed_schedules.feed_id
        and feeds.status = 'published'
    )
  );
