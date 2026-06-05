-- AroundCities V2: richer public-feed seed data.
-- Adds more browsing examples without changing the schema.

insert into public.places (
  place_id,
  name,
  slug,
  description,
  latitude,
  longitude,
  created_by,
  updated_by
) values
  (
    '10000000-0000-4000-8000-000000000008',
    'The Spring',
    'the-spring',
    'Shopping mall in Kuching used for events, food, and weekend visits.',
    1.5339,
    110.3575,
    'seed',
    'seed'
  ),
  (
    '10000000-0000-4000-8000-000000000009',
    'Boulevard Shopping Mall',
    'boulevard-shopping-mall',
    'Large shopping mall along Jalan Datuk Tawi Sli.',
    1.5266,
    110.3377,
    'seed',
    'seed'
  )
on conflict (place_id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  updated_by = excluded.updated_by,
  updated_at = now();

insert into public.channels (
  channel_id,
  name,
  url,
  screenshot_url,
  remarks,
  last_checked_at,
  created_by,
  updated_by
) values
  (
    '20000000-0000-4000-8000-000000000004',
    'The Spring Kuching',
    'https://www.facebook.com/thespringkuching',
    'https://placehold.co/1200x800/243b53/f8fafc/png?text=The+Spring+Source',
    'Sample channel for mall event leads.',
    '2026-06-05 12:00:00+08',
    'seed',
    'seed'
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    'Boulevard Shopping Mall',
    'https://www.facebook.com/boulevardshoppingmallkuching',
    'https://placehold.co/1200x800/365314/f8fafc/png?text=Boulevard+Source',
    'Sample channel for local discovery leads.',
    '2026-06-05 12:10:00+08',
    'seed',
    'seed'
  )
on conflict (url) do update set
  name = excluded.name,
  screenshot_url = excluded.screenshot_url,
  remarks = excluded.remarks,
  last_checked_at = excluded.last_checked_at,
  updated_by = excluded.updated_by,
  updated_at = now();

update public.feeds
set
  content = 'AEON Mall is hosting a DIY Recycled Sape Competition on 7 June, starting 3PM. Good one to keep on the weekend radar if you are nearby.',
  description = 'AEON Mall is hosting a DIY Recycled Sape Competition on 7 June, starting 3PM.',
  updated_by = 'seed',
  updated_at = now()
where feed_id = '30000000-0000-4000-8000-000000000001';

update public.feeds
set
  content = 'Kuching Food Festival is back at MBKS. This is the main festival post; smaller notes and visits can sit under it later.',
  description = 'Kuching Food Festival is back at MBKS. Saving this as the main festival post.',
  updated_by = 'seed',
  updated_at = now()
where feed_id = '30000000-0000-4000-8000-000000000002';

update public.feeds
set
  content = 'Kuching Got Talent is one of the smaller things happening inside Kuching Food Festival. Evening crowd, stage lights, and probably a noisy MBKS night.',
  description = 'Kuching Got Talent is one of the smaller things happening inside Kuching Food Festival.',
  updated_by = 'seed',
  updated_at = now()
where feed_id = '30000000-0000-4000-8000-000000000003';

update public.feeds
set
  content = 'Kuching Marathon is set for 22 September, with the early 4AM start from Padang Merdeka.',
  description = 'Kuching Marathon is set for 22 September, with the early 4AM start from Padang Merdeka.',
  updated_by = 'seed',
  updated_at = now()
where feed_id = '30000000-0000-4000-8000-000000000004';

update public.feeds
set
  slug = 'kuching-marathon-registration',
  title = 'Kuching Marathon Registration',
  content = 'Kuching Marathon registration is open. Check the official page for the details before signing up.',
  description = 'Kuching Marathon registration is open. Check the official page for details.',
  updated_by = 'seed',
  updated_at = now()
where feed_id = '30000000-0000-4000-8000-000000000005';

update public.feeds
set
  slug = 'nice-kolomee-lien-hin-kopitiam',
  title = 'Nice Kolomee at Lien Hin Kopitiam',
  content = 'Quick food sharing: nice kolomee at Lien Hin Kopitiam. Nothing fancy, just the kind of breakfast stop worth remembering.',
  description = 'Quick food sharing: nice kolomee at Lien Hin Kopitiam.',
  updated_by = 'seed',
  updated_at = now()
where feed_id = '30000000-0000-4000-8000-000000000006';

update public.feeds
set
  slug = 'kuching-waterfront-afternoon-walk',
  title = 'Kuching Waterfront Afternoon Walk',
  content = 'Slow afternoon walk from Kuching Waterfront towards Carpenter Street and the Old Court House. Small corners look different when the light is softer.',
  description = 'Slow afternoon walk from Kuching Waterfront towards Carpenter Street and the Old Court House.',
  updated_by = 'seed',
  updated_at = now()
where feed_id = '30000000-0000-4000-8000-000000000007';

update public.feeds
set
  content = 'Selamat Hari Gawai. Keeping this as a simple community greeting in the feed.',
  description = 'Selamat Hari Gawai. A simple greeting for the feed.',
  updated_by = 'seed',
  updated_at = now()
where feed_id = '30000000-0000-4000-8000-000000000008';

update public.feeds
set
  title = 'Featured Photo: Carpenter Street Alley',
  content = 'Found this hidden alley while walking around Carpenter Street.',
  description = 'Found this hidden alley while walking around Carpenter Street.',
  parent_feed_id = '30000000-0000-4000-8000-000000000007',
  updated_by = 'seed',
  updated_at = now()
where feed_id = '30000000-0000-4000-8000-000000000009';

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
  updated_by
) values
  (
    '30000000-0000-4000-8000-000000000010',
    'event_observation',
    'singing-competition-at-the-spring',
    'Singing Competition at The Spring',
    'The Spring has a singing competition running over a few days. Looks like the sort of mall event you might catch while passing through.',
    'The Spring has a singing competition running over a few days.',
    '10000000-0000-4000-8000-000000000008',
    null,
    'https://www.facebook.com/thespringkuching/posts/singing-competition-sample',
    '7-9 June 2026, 12:00 PM - 7:00 PM',
    array['event','mall','music'],
    '2026-06-05 11:30:00+08',
    'published',
    'seed',
    'seed'
  ),
  (
    '30000000-0000-4000-8000-000000000011',
    'event_observation',
    'kuching-marathon-route-jersey-reveal',
    'Kuching Marathon Route / Jersey Reveal',
    'Kuching Marathon dropped the route and jersey reveal. Useful update if you are running or just planning around road closures.',
    'Kuching Marathon dropped the route and jersey reveal.',
    '10000000-0000-4000-8000-000000000003',
    '30000000-0000-4000-8000-000000000004',
    'https://www.marathonkuching.com/route-jersey-sample',
    null,
    array['update','sports','marathon'],
    '2026-06-05 11:40:00+08',
    'published',
    'seed',
    'seed'
  ),
  (
    '30000000-0000-4000-8000-000000000012',
    'photo_walk',
    'visit-to-kuching-food-festival-day-1',
    'Visit to Kuching Food Festival Day 1',
    'Dropped by Kuching Food Festival on day one. Still early, but the food rows were already starting to feel busy.',
    'Dropped by Kuching Food Festival on day one.',
    '10000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000002',
    null,
    null,
    array['visit','festival','food'],
    '2026-06-05 11:50:00+08',
    'published',
    'seed',
    'seed'
  ),
  (
    '30000000-0000-4000-8000-000000000013',
    'local_discovery',
    'new-kids-playground-at-boulevard',
    'New Kids Playground at Boulevard',
    'Spotted a new kids playground at Boulevard. Handy to know if you are bringing children along for errands.',
    'Spotted a new kids playground at Boulevard.',
    '10000000-0000-4000-8000-000000000009',
    null,
    'https://www.facebook.com/boulevardshoppingmallkuching/posts/kids-playground-sample',
    null,
    array['discovery','family','mall'],
    '2026-06-05 12:00:00+08',
    'published',
    'seed',
    'seed'
  )
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
  updated_by = excluded.updated_by,
  updated_at = now();

insert into public.feed_places (
  feed_id,
  place_id,
  is_primary,
  location_note,
  created_by,
  updated_by
) values
  ('30000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000008', true, 'Mall event area', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000003', true, 'Marathon start area', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000002', true, 'Food rows', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000009', true, 'Second Floor, Old Wing', 'seed', 'seed')
on conflict (feed_id, place_id) do update set
  is_primary = excluded.is_primary,
  location_note = excluded.location_note,
  updated_by = excluded.updated_by,
  updated_at = now();

insert into public.feed_schedules (
  schedule_id,
  feed_id,
  schedule_type,
  schedule_date,
  start_date,
  end_date,
  days_of_week,
  start_time,
  end_time,
  remarks,
  created_by,
  updated_by
) values
  ('40000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000010', 'occurrence', '2026-06-07', null, null, null, '12:00', '19:00', 'Singing competition day 1.', 'seed', 'seed'),
  ('40000000-0000-4000-8000-000000000009', '30000000-0000-4000-8000-000000000010', 'occurrence', '2026-06-08', null, null, null, '12:00', '19:00', 'Singing competition day 2.', 'seed', 'seed'),
  ('40000000-0000-4000-8000-000000000010', '30000000-0000-4000-8000-000000000010', 'occurrence', '2026-06-09', null, null, null, '12:00', '19:00', 'Singing competition day 3.', 'seed', 'seed')
on conflict (schedule_id) do update set
  feed_id = excluded.feed_id,
  schedule_type = excluded.schedule_type,
  schedule_date = excluded.schedule_date,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  days_of_week = excluded.days_of_week,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  remarks = excluded.remarks,
  updated_by = excluded.updated_by,
  updated_at = now();

insert into public.feed_sources (
  source_id,
  feed_id,
  source_url,
  channel_id,
  source_note,
  created_by,
  updated_by
) values
  ('50000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000010', 'https://www.facebook.com/thespringkuching/posts/singing-competition-sample', '20000000-0000-4000-8000-000000000004', 'Sample source for The Spring singing competition.', 'seed', 'seed'),
  ('50000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000011', 'https://www.marathonkuching.com/route-jersey-sample', '20000000-0000-4000-8000-000000000003', 'Sample source for route and jersey reveal.', 'seed', 'seed'),
  ('50000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000013', 'https://www.facebook.com/boulevardshoppingmallkuching/posts/kids-playground-sample', '20000000-0000-4000-8000-000000000005', 'Sample source for playground discovery.', 'seed', 'seed')
on conflict (source_id) do update set
  feed_id = excluded.feed_id,
  source_url = excluded.source_url,
  channel_id = excluded.channel_id,
  source_note = excluded.source_note,
  updated_by = excluded.updated_by,
  updated_at = now();

insert into public.source_screenshots (
  screenshot_id,
  source_id,
  screenshot_url,
  sequence,
  remarks,
  created_by,
  updated_by
) values
  ('60000000-0000-4000-8000-000000000006', '50000000-0000-4000-8000-000000000006', 'https://placehold.co/1200x800/243b53/f8fafc/png?text=Singing+Competition+Screenshot', 1, 'Private evidence screenshot for singing competition.', 'seed', 'seed'),
  ('60000000-0000-4000-8000-000000000007', '50000000-0000-4000-8000-000000000007', 'https://placehold.co/1200x800/334155/f8fafc/png?text=Route+Jersey+Screenshot', 1, 'Private evidence screenshot for route and jersey reveal.', 'seed', 'seed'),
  ('60000000-0000-4000-8000-000000000008', '50000000-0000-4000-8000-000000000008', 'https://placehold.co/1200x800/365314/f8fafc/png?text=Kids+Playground+Screenshot', 1, 'Private evidence screenshot for playground discovery.', 'seed', 'seed')
on conflict (screenshot_id) do update set
  source_id = excluded.source_id,
  screenshot_url = excluded.screenshot_url,
  sequence = excluded.sequence,
  remarks = excluded.remarks,
  updated_by = excluded.updated_by,
  updated_at = now();

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
) values
  ('70000000-0000-4000-8000-000000000010', '30000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000008', 'Singing Competition Poster', 'Sample poster image.', 'https://placehold.co/1200x1600/243b53/f8fafc/png?text=Singing+Competition', 'The Spring', null, 1.5339, 110.3575, true, 1, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000011', '30000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000003', 'Route and Jersey Reveal', 'Sample update poster.', 'https://placehold.co/1200x1600/334155/f8fafc/png?text=Route+%2F+Jersey+Reveal', 'Padang Merdeka', null, 1.5586, 110.3437, true, 1, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000012', '30000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000002', 'Food Festival Day 1', 'Sample visit photo.', 'https://placehold.co/1200x900/7c2d12/fff7ed/png?text=Food+Festival+Day+1', 'MBKS', '2026-06-22 19:15:00+08', 1.5407, 110.3651, true, 1, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000013', '30000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000009', 'Kids Playground', 'Sample playground discovery image.', 'https://placehold.co/1200x900/365314/f8fafc/png?text=Kids+Playground', 'Boulevard Shopping Mall', null, 1.5266, 110.3377, true, 1, 'seed', 'seed')
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
