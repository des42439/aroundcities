-- AroundCities V2: 100 discovery-ordering test feeds.
-- Uses stable IDs and deterministic pseudo-random time buckets so /kch has
-- enough volume to show recent slots, latest fallback, and older rediscovery.

with generated_feeds as (
  select
    series.feed_number,
    ('31000000-0000-4000-8000-' || lpad(series.feed_number::text, 12, '0'))::uuid as feed_id,
    (array[
      '10000000-0000-4000-8000-000000000001'::uuid,
      '10000000-0000-4000-8000-000000000002'::uuid,
      '10000000-0000-4000-8000-000000000003'::uuid,
      '10000000-0000-4000-8000-000000000004'::uuid,
      '10000000-0000-4000-8000-000000000005'::uuid,
      '10000000-0000-4000-8000-000000000006'::uuid,
      '10000000-0000-4000-8000-000000000007'::uuid,
      '10000000-0000-4000-8000-000000000008'::uuid,
      '10000000-0000-4000-8000-000000000009'::uuid
    ])[((series.feed_number - 1) % 9) + 1] as place_id,
    case
      when series.feed_number <= 20 then make_interval(hours => ((series.feed_number * 11) % 72), mins => ((series.feed_number * 7) % 60))
      when series.feed_number <= 45 then interval '3 days' + make_interval(hours => ((series.feed_number * 13) % 96), mins => ((series.feed_number * 5) % 60))
      when series.feed_number <= 70 then interval '8 days' + make_interval(days => ((series.feed_number * 7) % 22), hours => ((series.feed_number * 3) % 24))
      else interval '31 days' + make_interval(days => ((series.feed_number * 13) % 334), hours => ((series.feed_number * 2) % 24))
    end as age_interval
  from generate_series(1, 100) as series(feed_number)
)
insert into public.feeds (
  feed_id,
  feed_type,
  slug,
  title,
  content,
  description,
  place_id,
  parent_feed_id,
  source_url,
  operating_hours,
  tags,
  published_at,
  status,
  created_by,
  created_at,
  updated_by,
  updated_at
)
select
  generated_feeds.feed_id,
  (array['photo_walk', 'food_visit', 'event_observation', 'local_discovery'])[((generated_feeds.feed_number - 1) % 4) + 1],
  'discovery-timeframe-test-' || lpad(generated_feeds.feed_number::text, 3, '0'),
  'Discovery Timeframe Test #' || lpad(generated_feeds.feed_number::text, 3, '0'),
  'Seeded discovery ordering test post #' || generated_feeds.feed_number || '. This record is intentionally spread across a different published_at timeframe so the /kch homepage can feel less like a strict timeline and more like a mixed local discovery feed.',
  'Seeded discovery ordering test post #' || generated_feeds.feed_number || ' with a varied published time for checking the mixed /kch feed order.',
  generated_feeds.place_id,
  null,
  null,
  null,
  array['test-data', 'discovery-ordering', 'timeframe'],
  now() - generated_feeds.age_interval,
  'published',
  'AroundCities',
  now() - generated_feeds.age_interval - interval '20 minutes',
  'seed',
  now()
from generated_feeds
on conflict (feed_id) do update set
  feed_type = excluded.feed_type,
  slug = excluded.slug,
  title = excluded.title,
  content = excluded.content,
  description = excluded.description,
  place_id = excluded.place_id,
  parent_feed_id = excluded.parent_feed_id,
  source_url = excluded.source_url,
  operating_hours = excluded.operating_hours,
  tags = excluded.tags,
  published_at = excluded.published_at,
  status = excluded.status,
  created_by = excluded.created_by,
  created_at = excluded.created_at,
  updated_by = excluded.updated_by,
  updated_at = excluded.updated_at;

with generated_feeds as (
  select
    series.feed_number,
    ('31000000-0000-4000-8000-' || lpad(series.feed_number::text, 12, '0'))::uuid as feed_id,
    (array[
      '10000000-0000-4000-8000-000000000001'::uuid,
      '10000000-0000-4000-8000-000000000002'::uuid,
      '10000000-0000-4000-8000-000000000003'::uuid,
      '10000000-0000-4000-8000-000000000004'::uuid,
      '10000000-0000-4000-8000-000000000005'::uuid,
      '10000000-0000-4000-8000-000000000006'::uuid,
      '10000000-0000-4000-8000-000000000007'::uuid,
      '10000000-0000-4000-8000-000000000008'::uuid,
      '10000000-0000-4000-8000-000000000009'::uuid
    ])[((series.feed_number - 1) % 9) + 1] as place_id
  from generate_series(1, 100) as series(feed_number)
)
insert into public.feed_places (
  feed_id,
  place_id,
  is_primary,
  location_note,
  created_by,
  updated_by
)
select
  generated_feeds.feed_id,
  generated_feeds.place_id,
  true,
  'Discovery ordering test place',
  'seed',
  'seed'
from generated_feeds
on conflict (feed_id, place_id) do update set
  is_primary = excluded.is_primary,
  location_note = excluded.location_note,
  updated_by = excluded.updated_by,
  updated_at = now();

with generated_feeds as (
  select
    series.feed_number,
    ('31000000-0000-4000-8000-' || lpad(series.feed_number::text, 12, '0'))::uuid as feed_id,
    ('71000000-0000-4000-8000-' || lpad(series.feed_number::text, 12, '0'))::uuid as photo_id,
    (array[
      '10000000-0000-4000-8000-000000000001'::uuid,
      '10000000-0000-4000-8000-000000000002'::uuid,
      '10000000-0000-4000-8000-000000000003'::uuid,
      '10000000-0000-4000-8000-000000000004'::uuid,
      '10000000-0000-4000-8000-000000000005'::uuid,
      '10000000-0000-4000-8000-000000000006'::uuid,
      '10000000-0000-4000-8000-000000000007'::uuid,
      '10000000-0000-4000-8000-000000000008'::uuid,
      '10000000-0000-4000-8000-000000000009'::uuid
    ])[((series.feed_number - 1) % 9) + 1] as place_id
  from generate_series(1, 100) as series(feed_number)
)
insert into public.photos (
  photo_id,
  feed_id,
  place_id,
  title,
  description,
  photo_url,
  location_name,
  captured_at,
  latitude,
  longitude,
  featured,
  sequence,
  created_by,
  updated_by
)
select
  generated_feeds.photo_id,
  generated_feeds.feed_id,
  generated_feeds.place_id,
  'Discovery Test Photo #' || lpad(generated_feeds.feed_number::text, 3, '0'),
  'Sample image for discovery ordering test feed #' || generated_feeds.feed_number || '.',
  'https://loremflickr.com/1200/900/kuching,street,food?lock=' || (1800 + generated_feeds.feed_number),
  'Kuching',
  null,
  null,
  null,
  true,
  1,
  'seed',
  'seed'
from generated_feeds
on conflict (photo_id) do update set
  feed_id = excluded.feed_id,
  place_id = excluded.place_id,
  title = excluded.title,
  description = excluded.description,
  photo_url = excluded.photo_url,
  location_name = excluded.location_name,
  captured_at = excluded.captured_at,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  featured = excluded.featured,
  sequence = excluded.sequence,
  updated_by = excluded.updated_by,
  updated_at = now();
