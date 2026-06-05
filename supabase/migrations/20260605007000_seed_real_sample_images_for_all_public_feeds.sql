-- AroundCities V2: make every public seed feed visually testable.
-- Reuses stable external sample images for older feeds that still had word-only placeholders.

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
) values (
  '70000000-0000-4000-8000-000000000025',
  '30000000-0000-4000-8000-000000000008',
  null,
  'Gawai Greeting Sample Photo',
  'Reusable sample scenery image for the Gawai greeting feed.',
  'https://loremflickr.com/1200/900/festival,people?lock=1608',
  null,
  null,
  null,
  null,
  true,
  1,
  'seed',
  'seed'
)
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

update public.photos
set
  photo_url = case photo_id
    when '70000000-0000-4000-8000-000000000001' then 'https://loremflickr.com/1200/900/market,craft?lock=1601'
    when '70000000-0000-4000-8000-000000000002' then 'https://loremflickr.com/1200/900/food,festival?lock=1602'
    when '70000000-0000-4000-8000-000000000003' then 'https://loremflickr.com/1200/900/stage,music?lock=1603'
    when '70000000-0000-4000-8000-000000000004' then 'https://loremflickr.com/1200/900/running,city?lock=1604'
    when '70000000-0000-4000-8000-000000000005' then 'https://loremflickr.com/1200/900/running,event?lock=1605'
    when '70000000-0000-4000-8000-000000000006' then 'https://loremflickr.com/1200/900/noodles,food?lock=1606'
    when '70000000-0000-4000-8000-000000000007' then 'https://loremflickr.com/1200/900/river,walk?lock=1607'
    when '70000000-0000-4000-8000-000000000008' then 'https://loremflickr.com/1200/900/old,street?lock=1608'
    when '70000000-0000-4000-8000-000000000009' then 'https://loremflickr.com/1200/900/alley,street?lock=1609'
    when '70000000-0000-4000-8000-000000000010' then 'https://loremflickr.com/1200/900/singing,stage?lock=1610'
    when '70000000-0000-4000-8000-000000000011' then 'https://loremflickr.com/1200/900/marathon,running?lock=1611'
    when '70000000-0000-4000-8000-000000000012' then 'https://loremflickr.com/1200/900/street-food?lock=1612'
    when '70000000-0000-4000-8000-000000000013' then 'https://loremflickr.com/1200/900/playground,kids?lock=1613'
    else photo_url
  end,
  updated_by = 'seed',
  updated_at = now()
where photo_id in (
  '70000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000002',
  '70000000-0000-4000-8000-000000000003',
  '70000000-0000-4000-8000-000000000004',
  '70000000-0000-4000-8000-000000000005',
  '70000000-0000-4000-8000-000000000006',
  '70000000-0000-4000-8000-000000000007',
  '70000000-0000-4000-8000-000000000008',
  '70000000-0000-4000-8000-000000000009',
  '70000000-0000-4000-8000-000000000010',
  '70000000-0000-4000-8000-000000000011',
  '70000000-0000-4000-8000-000000000012',
  '70000000-0000-4000-8000-000000000013'
);
