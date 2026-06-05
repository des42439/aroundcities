-- AroundCities V2: click counters should not change content edit timestamps.

create or replace function public.increment_feed_click_count(
  p_feed_id uuid
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.feeds
  set click_count = click_count + 1
  where feed_id = p_feed_id
    and status = 'published';
$$;

create or replace function public.increment_photo_click_count(
  p_photo_id uuid
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.photos
  set click_count = click_count + 1
  where photo_id = p_photo_id
    and exists (
      select 1
      from public.feeds
      where feeds.feed_id = photos.feed_id
        and feeds.status = 'published'
    );
$$;
