-- AroundCities V2 Phase 3 seed test data.
-- Uses deterministic UUIDs so related sample records stay stable.

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
    '10000000-0000-4000-8000-000000000001',
    'AEON Mall Kuching Central',
    'aeon-mall-kuching-central',
    'Shopping mall along Jalan Tun Datuk Patinggi Haji Ahmad Zaidi Adruce.',
    1.5392,
    110.3381,
    'seed',
    'seed'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'MBKS',
    'mbks',
    'Kuching South City Council area used for major public events and festivals.',
    1.5407,
    110.3651,
    'seed',
    'seed'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Padang Merdeka',
    'padang-merdeka',
    'Open field in central Kuching often used as a gathering and event point.',
    1.5586,
    110.3437,
    'seed',
    'seed'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Lien Hin Kopitiam',
    'lien-hin-kopitiam',
    'Local kopitiam used as a sample food-sharing place.',
    1.5532,
    110.3563,
    'seed',
    'seed'
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Kuching Waterfront',
    'kuching-waterfront',
    'Riverside public walkway facing the Sarawak River.',
    1.5598,
    110.3443,
    'seed',
    'seed'
  ),
  (
    '10000000-0000-4000-8000-000000000006',
    'Carpenter Street',
    'carpenter-street',
    'Historic street near Kuching Waterfront with food, shops, and old shophouses.',
    1.5578,
    110.3457,
    'seed',
    'seed'
  ),
  (
    '10000000-0000-4000-8000-000000000007',
    'Old Court House',
    'old-court-house',
    'Historic civic building near the Kuching Waterfront area.',
    1.5589,
    110.3448,
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
    '20000000-0000-4000-8000-000000000001',
    'AEON Mall Kuching Central',
    'https://www.facebook.com/aeonmallkuchingcentral',
    'https://placehold.co/1200x800/png?text=AEON+Mall+Source',
    'Sample channel for mall announcements.',
    '2026-06-05 09:00:00+08',
    'seed',
    'seed'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'Kuching Food Festival',
    'https://www.facebook.com/kuchingfoodfestival',
    'https://placehold.co/1200x800/png?text=Kuching+Food+Festival+Source',
    'Sample channel for festival announcements.',
    '2026-06-05 09:15:00+08',
    'seed',
    'seed'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    'Kuching Marathon',
    'https://www.marathonkuching.com',
    'https://placehold.co/1200x800/png?text=Kuching+Marathon+Source',
    'Sample channel for marathon updates and registration.',
    '2026-06-05 09:30:00+08',
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
    '30000000-0000-4000-8000-000000000001',
    'event_observation',
    'diy-sape-competition',
    'DIY Sape Competition',
    'A one-day DIY sape competition discovered from AEON Mall Kuching Central. This sample feed shows a simple event with one place, one schedule, a source channel, and private source evidence.',
    'A one-day DIY sape competition discovered from AEON Mall Kuching Central.',
    '10000000-0000-4000-8000-000000000001',
    null,
    'https://www.facebook.com/aeonmallkuchingcentral/posts/diy-sape-competition-sample',
    '7 June 2026, 3:00 PM',
    array['event','music','mall'],
    '2026-06-05 10:00:00+08',
    'published',
    'seed',
    'seed'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    'event_observation',
    'kuching-food-festival',
    'Kuching Food Festival',
    'A major Kuching food festival sample feed. It acts as a parent feed for smaller activities and experience posts.',
    'A major Kuching food festival sample feed.',
    '10000000-0000-4000-8000-000000000002',
    null,
    'https://www.facebook.com/kuchingfoodfestival/posts/festival-sample',
    '22 June to 20 August 2026, daily 5:00 PM - 11:00 PM',
    array['event','festival','food'],
    '2026-06-05 10:10:00+08',
    'published',
    'seed',
    'seed'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    'event_observation',
    'kuching-got-talent',
    'Kuching Got Talent',
    'A sub-event inside Kuching Food Festival. This sample feed shows how a smaller programme links back to a major event parent feed.',
    'A sub-event inside Kuching Food Festival.',
    '10000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000002',
    'https://www.facebook.com/kuchingfoodfestival/posts/kuching-got-talent-sample',
    '23-25 June 2026, 7:00 PM - 11:00 PM',
    array['event','festival','performance'],
    '2026-06-05 10:20:00+08',
    'published',
    'seed',
    'seed'
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    'event_observation',
    'kuching-marathon',
    'Kuching Marathon',
    'A sample event-day feed for Kuching Marathon. It can act as the parent for registration periods and announcements.',
    'A sample event-day feed for Kuching Marathon.',
    '10000000-0000-4000-8000-000000000003',
    null,
    'https://www.marathonkuching.com/event-day-sample',
    '22 September 2026, 4:00 AM',
    array['event','sports','marathon'],
    '2026-06-05 10:30:00+08',
    'published',
    'seed',
    'seed'
  ),
  (
    '30000000-0000-4000-8000-000000000005',
    'event_observation',
    'kuching-marathon-registration-period',
    'Kuching Marathon Registration Period',
    'A registration window linked to the Kuching Marathon parent feed. Place is intentionally optional for this sample.',
    'A registration window linked to the Kuching Marathon parent feed.',
    null,
    '30000000-0000-4000-8000-000000000004',
    'https://www.marathonkuching.com/registration-sample',
    'Registration opens 1 July 2026 and closes 31 August 2026',
    array['registration','sports','marathon'],
    '2026-06-05 10:40:00+08',
    'published',
    'seed',
    'seed'
  ),
  (
    '30000000-0000-4000-8000-000000000006',
    'food_visit',
    'food-sharing-lien-hin-kopitiam',
    'Food Sharing at Lien Hin Kopitiam',
    'A casual food sharing sample post from a local kopitiam. It has photos and a place, but no source and no schedule.',
    'A casual food sharing sample post from a local kopitiam.',
    '10000000-0000-4000-8000-000000000004',
    null,
    null,
    null,
    array['food','kopitiam','sharing'],
    '2026-06-05 10:50:00+08',
    'published',
    'seed',
    'seed'
  ),
  (
    '30000000-0000-4000-8000-000000000007',
    'photo_walk',
    'waterfront-walk',
    'Waterfront Walk',
    'A photo-walk sample connecting Kuching Waterfront, Carpenter Street, and the Old Court House.',
    'A photo-walk sample connecting several nearby Kuching places.',
    '10000000-0000-4000-8000-000000000005',
    null,
    null,
    null,
    array['walk','photo','city'],
    '2026-06-05 11:00:00+08',
    'published',
    'seed',
    'seed'
  ),
  (
    '30000000-0000-4000-8000-000000000008',
    'local_discovery',
    'selamat-hari-gawai',
    'Selamat Hari Gawai',
    'A seasonal greeting sample feed with no place, source, schedule, or photos required.',
    'A seasonal greeting sample feed.',
    null,
    null,
    null,
    null,
    array['greeting','community'],
    '2026-06-05 11:10:00+08',
    'published',
    'seed',
    'seed'
  ),
  (
    '30000000-0000-4000-8000-000000000009',
    'photo_walk',
    'featured-photo-carpenter-street-alley',
    'Featured Photo: Carpenter Street Alley',
    'A featured-photo sample derived from the Waterfront Walk parent feed.',
    'A featured-photo sample derived from the Waterfront Walk parent feed.',
    '10000000-0000-4000-8000-000000000006',
    '30000000-0000-4000-8000-000000000007',
    null,
    null,
    array['featured-photo','carpenter-street'],
    '2026-06-05 11:20:00+08',
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
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', true, 'Mall activity area', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', true, 'Festival grounds', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', true, 'Festival performance area', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000003', true, 'Start area', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000004', true, 'Main kopitiam dining area', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000005', true, 'Riverfront walkway', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000006', false, 'Side walk through old shophouses', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000007', false, 'Nearby heritage stop', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000006', true, 'Alley view', 'seed', 'seed')
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
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'occurrence', '2026-06-07', null, null, null, '15:00', null, 'DIY Sape Competition starts at 3:00 PM.', 'seed', 'seed'),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', 'date_range', null, '2026-06-22', '2026-08-20', array[0,1,2,3,4,5,6], '17:00', '23:00', 'Daily festival operating window.', 'seed', 'seed'),
  ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', 'occurrence', '2026-06-23', null, null, null, '19:00', '23:00', 'Kuching Got Talent night 1.', 'seed', 'seed'),
  ('40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000003', 'occurrence', '2026-06-24', null, null, null, '19:00', '23:00', 'Kuching Got Talent night 2.', 'seed', 'seed'),
  ('40000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000003', 'occurrence', '2026-06-25', null, null, null, '19:00', '23:00', 'Kuching Got Talent night 3.', 'seed', 'seed'),
  ('40000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000004', 'occurrence', '2026-09-22', null, null, null, '04:00', null, 'Kuching Marathon event day starts at 4:00 AM.', 'seed', 'seed'),
  ('40000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000005', 'registration', null, '2026-07-01', '2026-08-31', null, null, null, 'Registration period for Kuching Marathon.', 'seed', 'seed')
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
  ('50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'https://www.facebook.com/aeonmallkuchingcentral/posts/diy-sape-competition-sample', '20000000-0000-4000-8000-000000000001', 'Sample source record for the DIY Sape Competition poster.', 'seed', 'seed'),
  ('50000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', 'https://www.facebook.com/kuchingfoodfestival/posts/festival-sample', '20000000-0000-4000-8000-000000000002', 'Sample source record for festival dates.', 'seed', 'seed'),
  ('50000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', 'https://www.facebook.com/kuchingfoodfestival/posts/kuching-got-talent-sample', '20000000-0000-4000-8000-000000000002', 'Sample source record for a sub-event programme.', 'seed', 'seed'),
  ('50000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000004', 'https://www.marathonkuching.com/event-day-sample', '20000000-0000-4000-8000-000000000003', 'Sample source record for event-day details.', 'seed', 'seed'),
  ('50000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000005', 'https://www.marathonkuching.com/registration-sample', '20000000-0000-4000-8000-000000000003', 'Sample source record for registration dates.', 'seed', 'seed')
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
  ('60000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'https://placehold.co/1200x800/png?text=DIY+Sape+Source+Screenshot', 1, 'Private evidence screenshot for DIY Sape Competition.', 'seed', 'seed'),
  ('60000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000002', 'https://placehold.co/1200x800/png?text=Kuching+Food+Festival+Screenshot', 1, 'Private evidence screenshot for festival dates.', 'seed', 'seed'),
  ('60000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000003', 'https://placehold.co/1200x800/png?text=Kuching+Got+Talent+Screenshot', 1, 'Private evidence screenshot for sub-event programme.', 'seed', 'seed'),
  ('60000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000004', 'https://placehold.co/1200x800/png?text=Kuching+Marathon+Screenshot', 1, 'Private evidence screenshot for marathon event day.', 'seed', 'seed'),
  ('60000000-0000-4000-8000-000000000005', '50000000-0000-4000-8000-000000000005', 'https://placehold.co/1200x800/png?text=Registration+Period+Screenshot', 1, 'Private evidence screenshot for marathon registration period.', 'seed', 'seed')
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
  ('70000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'DIY Sape Competition Poster', 'Sample promotional poster image.', 'https://placehold.co/1200x1600/png?text=DIY+Sape+Competition', 'AEON Mall Kuching Central', null, 1.5392, 110.3381, true, 1, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Kuching Food Festival Poster', 'Sample festival poster image.', 'https://placehold.co/1200x1600/png?text=Kuching+Food+Festival', 'MBKS', null, 1.5407, 110.3651, true, 1, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'Kuching Got Talent Programme', 'Sample sub-event programme image.', 'https://placehold.co/1200x1600/png?text=Kuching+Got+Talent', 'MBKS', null, 1.5407, 110.3651, true, 1, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000003', 'Kuching Marathon Poster', 'Sample marathon event-day poster.', 'https://placehold.co/1200x1600/png?text=Kuching+Marathon', 'Padang Merdeka', null, 1.5586, 110.3437, true, 1, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000005', null, 'Kuching Marathon Registration Notice', 'Sample registration notice image.', 'https://placehold.co/1200x1600/png?text=Registration+Period', null, null, null, null, true, 1, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000004', 'Kolomee Table', 'Sample food sharing image.', 'https://placehold.co/1200x900/png?text=Food+Sharing', 'Lien Hin Kopitiam', '2026-06-05 08:30:00+08', 1.5532, 110.3563, true, 1, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000005', 'Waterfront Walkway', 'Sample waterfront walk image.', 'https://placehold.co/1200x900/png?text=Waterfront+Walk', 'Kuching Waterfront', '2026-06-05 17:30:00+08', 1.5598, 110.3443, true, 1, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000006', 'Carpenter Street Corner', 'Sample second photo from the same walk.', 'https://placehold.co/1200x900/png?text=Carpenter+Street', 'Carpenter Street', '2026-06-05 18:00:00+08', 1.5578, 110.3457, false, 2, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000009', '30000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000006', 'Alley in Carpenter Street', 'Sample featured photo derived from the Waterfront Walk feed.', 'https://placehold.co/1200x900/png?text=Featured+Photo', 'Carpenter Street', '2026-06-05 18:10:00+08', 1.5578, 110.3457, true, 1, 'seed', 'seed')
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
