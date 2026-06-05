-- AroundCities V2: seed dates for discovery-style public feed ordering.
-- Staggers published_at so recent, weekly, latest fallback, and older
-- rediscovery slots can all be observed without changing the schema.

with seed_feed_dates(feed_id, published_at) as (
  values
    ('30000000-0000-4000-8000-000000000017'::uuid, now() - interval '30 minutes'),
    ('30000000-0000-4000-8000-000000000016'::uuid, now() - interval '2 hours'),
    ('30000000-0000-4000-8000-000000000015'::uuid, now() - interval '1 day'),
    ('30000000-0000-4000-8000-000000000014'::uuid, now() - interval '2 days'),
    ('30000000-0000-4000-8000-000000000013'::uuid, now() - interval '4 days'),
    ('30000000-0000-4000-8000-000000000012'::uuid, now() - interval '5 days'),
    ('30000000-0000-4000-8000-000000000011'::uuid, now() - interval '6 days'),
    ('30000000-0000-4000-8000-000000000010'::uuid, now() - interval '8 days'),
    ('30000000-0000-4000-8000-000000000009'::uuid, now() - interval '10 days'),
    ('30000000-0000-4000-8000-000000000008'::uuid, now() - interval '20 days'),
    ('30000000-0000-4000-8000-000000000007'::uuid, now() - interval '35 days'),
    ('30000000-0000-4000-8000-000000000006'::uuid, now() - interval '45 days'),
    ('30000000-0000-4000-8000-000000000005'::uuid, now() - interval '60 days'),
    ('30000000-0000-4000-8000-000000000004'::uuid, now() - interval '90 days'),
    ('30000000-0000-4000-8000-000000000003'::uuid, now() - interval '120 days'),
    ('30000000-0000-4000-8000-000000000002'::uuid, now() - interval '150 days'),
    ('30000000-0000-4000-8000-000000000001'::uuid, now() - interval '180 days')
)
update public.feeds as feeds
set
  published_at = seed_feed_dates.published_at,
  updated_by = 'seed',
  updated_at = now()
from seed_feed_dates
where feeds.feed_id = seed_feed_dates.feed_id;
