-- AroundCities V2: allow multiple featured photos per feed.
-- Featured photos are now candidates for standalone photo feed cards.

drop index if exists public.photos_one_featured_per_feed_idx;
