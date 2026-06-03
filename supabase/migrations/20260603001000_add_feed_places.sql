-- AroundCities V2: support multiple human-assigned places per feed.
-- Keep feeds.place_id as the optional primary place for compatibility.

create table public.feed_places (
  feed_id uuid not null references public.feeds(feed_id) on delete cascade,
  place_id uuid not null references public.places(place_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (feed_id, place_id)
);

create index feed_places_place_id_idx
  on public.feed_places (place_id);
