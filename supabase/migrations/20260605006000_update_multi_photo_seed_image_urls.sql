-- AroundCities V2: replace word-only multi-photo test placeholders with real sample images.
-- LoremFlickr lock values keep these external food/scenery test images stable enough for UI review.

update public.photos
set
  photo_url = case photo_id
    when '70000000-0000-4000-8000-000000000014' then 'https://loremflickr.com/1200/900/river,city?lock=1401'
    when '70000000-0000-4000-8000-000000000015' then 'https://loremflickr.com/1200/900/scenery?lock=1402'
    when '70000000-0000-4000-8000-000000000016' then 'https://loremflickr.com/1200/900/street,city?lock=1403'
    when '70000000-0000-4000-8000-000000000017' then 'https://loremflickr.com/1200/900/river,bridge?lock=1404'
    when '70000000-0000-4000-8000-000000000018' then 'https://loremflickr.com/1200/900/evening,city?lock=1405'
    when '70000000-0000-4000-8000-000000000019' then 'https://loremflickr.com/1200/900/food?lock=1501'
    when '70000000-0000-4000-8000-000000000020' then 'https://loremflickr.com/1200/900/breakfast?lock=1502'
    when '70000000-0000-4000-8000-000000000021' then 'https://loremflickr.com/1200/900/coffee?lock=1503'
    when '70000000-0000-4000-8000-000000000022' then 'https://loremflickr.com/1200/900/restaurant?lock=1504'
    when '70000000-0000-4000-8000-000000000023' then 'https://loremflickr.com/1200/900/street,market?lock=1505'
    when '70000000-0000-4000-8000-000000000024' then 'https://loremflickr.com/1200/900/cafe?lock=1506'
    else photo_url
  end,
  updated_by = 'seed',
  updated_at = now()
where photo_id in (
  '70000000-0000-4000-8000-000000000014',
  '70000000-0000-4000-8000-000000000015',
  '70000000-0000-4000-8000-000000000016',
  '70000000-0000-4000-8000-000000000017',
  '70000000-0000-4000-8000-000000000018',
  '70000000-0000-4000-8000-000000000019',
  '70000000-0000-4000-8000-000000000020',
  '70000000-0000-4000-8000-000000000021',
  '70000000-0000-4000-8000-000000000022',
  '70000000-0000-4000-8000-000000000023',
  '70000000-0000-4000-8000-000000000024'
);
