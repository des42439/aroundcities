-- AroundCities V2: multi-photo public feed examples.
-- Adds feeds with more than four photos so the public feed grid and +N overlay can be tested.

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
    '30000000-0000-4000-8000-000000000014',
    'photo_walk',
    'five-photo-waterfront-evening-loop',
    'Five-photo Waterfront Evening Loop',
    'A short evening loop around the Waterfront, Carpenter Street, and the old court house area. This seed post has five photos so the public feed can show a 2x2 collage with a +1 overlay.',
    'A short evening loop around the Waterfront, Carpenter Street, and the old court house area.',
    '10000000-0000-4000-8000-000000000005',
    null,
    null,
    null,
    array['test-data','photo-walk','multi-photo'],
    '2026-06-05 12:20:00+08',
    'published',
    'seed',
    'seed'
  ),
  (
    '30000000-0000-4000-8000-000000000015',
    'food_visit',
    'six-photo-kopitiam-breakfast-notes',
    'Six-photo Kopitiam Breakfast Notes',
    'Breakfast stop notes with table details, shopfront, and a few nearby street views. This seed post has six photos so the public feed can show a 2x2 collage with a +2 overlay.',
    'Breakfast stop notes with table details, shopfront, and nearby street views.',
    '10000000-0000-4000-8000-000000000004',
    null,
    null,
    null,
    array['test-data','food','multi-photo'],
    '2026-06-05 12:30:00+08',
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
  ('30000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000005', true, 'Waterfront loop start', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000006', false, 'Nearby street stop', 'seed', 'seed'),
  ('30000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000004', true, 'Breakfast stop', 'seed', 'seed')
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
  ('70000000-0000-4000-8000-000000000014', '30000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000005', 'Waterfront River View', 'Sample multi-photo image 1 of 5.', 'https://placehold.co/1200x900/0f766e/f8fafc/png?text=Waterfront+Loop+1', 'Kuching Waterfront', '2026-06-05 17:20:00+08', 1.5598, 110.3443, true, 1, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000015', '30000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000005', 'Riverside Path', 'Sample multi-photo image 2 of 5.', 'https://placehold.co/1200x900/155e75/f8fafc/png?text=Waterfront+Loop+2', 'Kuching Waterfront', '2026-06-05 17:30:00+08', 1.5598, 110.3443, false, 2, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000016', '30000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000006', 'Carpenter Street Five-foot Way', 'Sample multi-photo image 3 of 5.', 'https://placehold.co/1200x900/1d4ed8/f8fafc/png?text=Waterfront+Loop+3', 'Carpenter Street', '2026-06-05 17:45:00+08', 1.5578, 110.3457, false, 3, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000017', '30000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000006', 'Old Shopfront Detail', 'Sample multi-photo image 4 of 5.', 'https://placehold.co/1200x900/4338ca/f8fafc/png?text=Waterfront+Loop+4', 'Carpenter Street', '2026-06-05 17:55:00+08', 1.5578, 110.3457, false, 4, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000018', '30000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000005', 'Evening Sky Over River', 'Sample multi-photo image 5 of 5.', 'https://placehold.co/1200x900/7c3aed/f8fafc/png?text=Waterfront+Loop+5', 'Kuching Waterfront', '2026-06-05 18:05:00+08', 1.5598, 110.3443, false, 5, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000019', '30000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000004', 'Kopitiam Table', 'Sample multi-photo image 1 of 6.', 'https://placehold.co/1200x900/a16207/fff7ed/png?text=Kopitiam+Breakfast+1', 'Lien Hin Kopitiam', '2026-06-05 08:05:00+08', 1.5532, 110.3563, true, 1, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000020', '30000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000004', 'Kolomee Bowl', 'Sample multi-photo image 2 of 6.', 'https://placehold.co/1200x900/be123c/fff7ed/png?text=Kopitiam+Breakfast+2', 'Lien Hin Kopitiam', '2026-06-05 08:10:00+08', 1.5532, 110.3563, false, 2, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000021', '30000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000004', 'Coffee Cup', 'Sample multi-photo image 3 of 6.', 'https://placehold.co/1200x900/c2410c/fff7ed/png?text=Kopitiam+Breakfast+3', 'Lien Hin Kopitiam', '2026-06-05 08:15:00+08', 1.5532, 110.3563, false, 3, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000022', '30000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000004', 'Shopfront Morning', 'Sample multi-photo image 4 of 6.', 'https://placehold.co/1200x900/15803d/f8fafc/png?text=Kopitiam+Breakfast+4', 'Lien Hin Kopitiam', '2026-06-05 08:25:00+08', 1.5532, 110.3563, false, 4, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000023', '30000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000004', 'Nearby Street Corner', 'Sample multi-photo image 5 of 6.', 'https://placehold.co/1200x900/0369a1/f8fafc/png?text=Kopitiam+Breakfast+5', 'Lien Hin Kopitiam', '2026-06-05 08:35:00+08', 1.5532, 110.3563, false, 5, 'seed', 'seed'),
  ('70000000-0000-4000-8000-000000000024', '30000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000004', 'Breakfast Crowd', 'Sample multi-photo image 6 of 6.', 'https://placehold.co/1200x900/6d28d9/f8fafc/png?text=Kopitiam+Breakfast+6', 'Lien Hin Kopitiam', '2026-06-05 08:45:00+08', 1.5532, 110.3563, false, 6, 'seed', 'seed')
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
