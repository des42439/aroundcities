-- AroundCities V2: remove public/admin seed test data.
-- Keeps real curator-created rows by deleting only rows marked with the
-- seed audit marker used by the previous test-data migrations.

delete from public.source_screenshots
where created_by = 'seed' or updated_by = 'seed';

delete from public.feed_sources
where created_by = 'seed' or updated_by = 'seed';

delete from public.feed_schedules
where created_by = 'seed' or updated_by = 'seed';

delete from public.feed_operating_hours
where created_by = 'seed' or updated_by = 'seed';

delete from public.feed_places
where created_by = 'seed' or updated_by = 'seed';

delete from public.photos
where created_by = 'seed' or updated_by = 'seed';

delete from public.feeds
where created_by = 'seed' or updated_by = 'seed';

delete from public.channels
where created_by = 'seed' or updated_by = 'seed';

delete from public.places
where created_by = 'seed' or updated_by = 'seed';

delete from public.sources
where created_by = 'seed' or updated_by = 'seed';
