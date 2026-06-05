-- AroundCities V2: public metadata seed updates.
-- Uses existing audit fields as the public author/createdAt source for demo feeds.

with seed_feed_metadata(feed_id, created_at) as (
  values
    ('30000000-0000-4000-8000-000000000017'::uuid, now() - interval '30 seconds'),
    ('30000000-0000-4000-8000-000000000016'::uuid, now() - interval '5 minutes'),
    ('30000000-0000-4000-8000-000000000015'::uuid, now() - interval '1 hour'),
    ('30000000-0000-4000-8000-000000000014'::uuid, now() - interval '1 day'),
    ('30000000-0000-4000-8000-000000000013'::uuid, now() - interval '3 days'),
    ('30000000-0000-4000-8000-000000000012'::uuid, now() - interval '2 weeks'),
    ('30000000-0000-4000-8000-000000000011'::uuid, now() - interval '3 months'),
    ('30000000-0000-4000-8000-000000000010'::uuid, now() - interval '6 months'),
    ('30000000-0000-4000-8000-000000000009'::uuid, now() - interval '9 months'),
    ('30000000-0000-4000-8000-000000000008'::uuid, now() - interval '1 year'),
    ('30000000-0000-4000-8000-000000000007'::uuid, now() - interval '13 months'),
    ('30000000-0000-4000-8000-000000000006'::uuid, now() - interval '14 months'),
    ('30000000-0000-4000-8000-000000000005'::uuid, now() - interval '15 months'),
    ('30000000-0000-4000-8000-000000000004'::uuid, now() - interval '16 months'),
    ('30000000-0000-4000-8000-000000000003'::uuid, now() - interval '17 months'),
    ('30000000-0000-4000-8000-000000000002'::uuid, now() - interval '18 months'),
    ('30000000-0000-4000-8000-000000000001'::uuid, now() - interval '19 months')
)
update public.feeds as feeds
set
  created_by = 'AroundCities',
  created_at = seed_feed_metadata.created_at,
  updated_by = 'seed',
  updated_at = now()
from seed_feed_metadata
where feeds.feed_id = seed_feed_metadata.feed_id;

update public.feeds
set
  place_id = '10000000-0000-4000-8000-000000000005',
  updated_by = 'seed',
  updated_at = now()
where feed_id in (
  '30000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000003',
  '30000000-0000-4000-8000-000000000004',
  '30000000-0000-4000-8000-000000000005',
  '30000000-0000-4000-8000-000000000006',
  '30000000-0000-4000-8000-000000000007',
  '30000000-0000-4000-8000-000000000008',
  '30000000-0000-4000-8000-000000000009',
  '30000000-0000-4000-8000-000000000010',
  '30000000-0000-4000-8000-000000000011',
  '30000000-0000-4000-8000-000000000012',
  '30000000-0000-4000-8000-000000000013',
  '30000000-0000-4000-8000-000000000014',
  '30000000-0000-4000-8000-000000000015',
  '30000000-0000-4000-8000-000000000016',
  '30000000-0000-4000-8000-000000000017'
)
and place_id is null;

insert into public.feed_places (
  feed_id,
  place_id,
  is_primary,
  location_note,
  created_by,
  updated_by
)
select
  feeds.feed_id,
  feeds.place_id,
  true,
  'Primary public feed place',
  'seed',
  'seed'
from public.feeds
as feeds
where feeds.feed_id in (
  '30000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000003',
  '30000000-0000-4000-8000-000000000004',
  '30000000-0000-4000-8000-000000000005',
  '30000000-0000-4000-8000-000000000006',
  '30000000-0000-4000-8000-000000000007',
  '30000000-0000-4000-8000-000000000008',
  '30000000-0000-4000-8000-000000000009',
  '30000000-0000-4000-8000-000000000010',
  '30000000-0000-4000-8000-000000000011',
  '30000000-0000-4000-8000-000000000012',
  '30000000-0000-4000-8000-000000000013',
  '30000000-0000-4000-8000-000000000014',
  '30000000-0000-4000-8000-000000000015',
  '30000000-0000-4000-8000-000000000016',
  '30000000-0000-4000-8000-000000000017'
)
and feeds.place_id is not null
on conflict (feed_id, place_id) do update set
  is_primary = excluded.is_primary,
  updated_by = excluded.updated_by,
  updated_at = now();
