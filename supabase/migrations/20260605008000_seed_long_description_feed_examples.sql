-- AroundCities V2: long-description public feed examples.
-- Adds published seed posts with deliberately long descriptions so the /kch
-- two-line preview and inline "more" link can be tested.

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
    '30000000-0000-4000-8000-000000000016',
    'local_discovery',
    'long-note-carpenter-street-rainy-afternoon',
    'Long Note: Carpenter Street After Rain',
    'A slow rainy-afternoon note from Carpenter Street, written long enough to test the compact public feed preview. The five-foot ways were still wet, the old shophouse fronts had that darker post-rain colour, and the small details around the lane felt easier to notice when fewer people were rushing through. This is not meant to be a formal attraction listing, just the sort of local observation AroundCities should be able to carry in the feed.',
    'A slow rainy-afternoon note from Carpenter Street, written long enough to test the compact public feed preview. The five-foot ways were still wet, the old shophouse fronts had that darker post-rain colour, and the small details around the lane felt easier to notice when fewer people were rushing through. This is not meant to be a formal attraction listing, just the sort of local observation AroundCities should be able to carry in the feed.',
    '10000000-0000-4000-8000-000000000006',
    null,
    null,
    null,
    array['test-data','long-description','street-note'],
    '2026-06-05 12:40:00+08',
    'published',
    'seed',
    'seed'
  ),
  (
    '30000000-0000-4000-8000-000000000017',
    'food_visit',
    'long-note-satay-smoke-evening-stop',
    'Long Note: Satay Smoke Evening Stop',
    'Evening food stop notes with enough description to force the inline more link on the public feed card. The stall area had that familiar mix of smoke, quick orders, plastic stools, and people deciding whether to eat there or bring packets home. The point of this sample is to make sure a casual browsing card still feels attached to its photo gallery even when the curator writes a longer field note about the mood, the queue, and the small table details.',
    'Evening food stop notes with enough description to force the inline more link on the public feed card. The stall area had that familiar mix of smoke, quick orders, plastic stools, and people deciding whether to eat there or bring packets home. The point of this sample is to make sure a casual browsing card still feels attached to its photo gallery even when the curator writes a longer field note about the mood, the queue, and the small table details.',
    '10000000-0000-4000-8000-000000000004',
    null,
    null,
    null,
    array['test-data','long-description','food'],
    '2026-06-05 12:50:00+08',
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
  ('30000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000006', true, 'Rainy afternoon street note', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000017', '10000000-0000-4000-8000-000000000004', true, 'Evening food stop note', 'seed', 'seed')
on conflict (feed_id, place_id) do update set
  is_primary = excluded.is_primary,
  location_note = excluded.location_note,
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
  (
    '70000000-0000-4000-8000-000000000026',
    '30000000-0000-4000-8000-000000000016',
    '10000000-0000-4000-8000-000000000006',
    'Carpenter Street After Rain',
    'Sample long-description street note image.',
    'https://loremflickr.com/1200/900/kuching,street,rain?lock=1701',
    'Carpenter Street',
    '2026-06-05 16:20:00+08',
    1.5578,
    110.3457,
    true,
    1,
    'seed',
    'seed'
  ),
  (
    '70000000-0000-4000-8000-000000000027',
    '30000000-0000-4000-8000-000000000017',
    '10000000-0000-4000-8000-000000000004',
    'Satay Smoke',
    'Sample long-description food note image 1 of 3.',
    'https://loremflickr.com/1200/900/satay,street-food?lock=1702',
    'Lien Hin Kopitiam',
    '2026-06-05 18:30:00+08',
    1.5532,
    110.3563,
    true,
    1,
    'seed',
    'seed'
  ),
  (
    '70000000-0000-4000-8000-000000000028',
    '30000000-0000-4000-8000-000000000017',
    '10000000-0000-4000-8000-000000000004',
    'Evening Food Table',
    'Sample long-description food note image 2 of 3.',
    'https://loremflickr.com/1200/900/food-table,kuching?lock=1703',
    'Lien Hin Kopitiam',
    '2026-06-05 18:40:00+08',
    1.5532,
    110.3563,
    false,
    2,
    'seed',
    'seed'
  ),
  (
    '70000000-0000-4000-8000-000000000029',
    '30000000-0000-4000-8000-000000000017',
    '10000000-0000-4000-8000-000000000004',
    'Food Stall Queue',
    'Sample long-description food note image 3 of 3.',
    'https://loremflickr.com/1200/900/food-stall,queue?lock=1704',
    'Lien Hin Kopitiam',
    '2026-06-05 18:50:00+08',
    1.5532,
    110.3563,
    false,
    3,
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
