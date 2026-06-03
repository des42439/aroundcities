-- AroundCities V2 Phase 1 foundation schema.
-- Core entities only: places, feeds, photos.

create table public.places (
  place_id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.feeds (
  feed_id uuid primary key default gen_random_uuid(),
  feed_type text not null
    check (feed_type in (
      'photo_walk',
      'food_visit',
      'event_observation',
      'local_discovery'
    )),
  slug text not null unique,
  title text not null,
  content text,
  place_id uuid references public.places(place_id),
  source_url text,
  tags text[] not null default '{}',
  published_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.photos (
  photo_id uuid primary key default gen_random_uuid(),
  feed_id uuid not null references public.feeds(feed_id) on delete cascade,
  place_id uuid references public.places(place_id),
  title text,
  description text,
  photo_url text not null,
  location_name text,
  captured_at timestamptz,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index feeds_status_published_at_idx
  on public.feeds (status, published_at desc);

create index feeds_feed_type_idx
  on public.feeds (feed_type);

create index feeds_slug_idx
  on public.feeds (slug);

create index feeds_place_id_idx
  on public.feeds (place_id);

create index feeds_tags_idx
  on public.feeds using gin (tags);

create index photos_feed_id_idx
  on public.photos (feed_id);

create index photos_place_id_idx
  on public.photos (place_id);

create index places_slug_idx
  on public.places (slug);
