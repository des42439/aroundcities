# AroundCities V2 Phase 1 Architecture

Last updated: 3 June 2026

Implementation status: Steps 1-5 are implemented.

## 1. Objective

AroundCities V2 is a greenfield rebuild.

The previous version has been archived and backed up. V2 should not preserve the old architecture, maintain backward compatibility, or carry forward the old Photo/Event-first model.

Phase 1 should create the smallest clean foundation for an independent local media platform answering:

> What is happening around Kuching?

## 2. Product Definition

AroundCities is a curator-driven local media platform.

It is not:

- An event portal
- A tourism website
- A business directory
- A social network

The product should feel like a local editorial feed: concise posts, useful context, strong photos, and clear links to places around Kuching.

## 3. Phase 1 Scope

Only three core entities should exist in Phase 1:

- Feed
- Photo
- Place

No comments, likes, followers, messaging, ratings, reviews, public contributor accounts, or business-directory workflows.

## 4. Core Entities

### Feed

A Feed is the main story/post unit.

Examples:

- Photo walk
- Food visit
- Event observation
- Local discovery

Fields:

- `feed_id`
- `feed_type` internal default
- `slug`
- `title`
- `content`
- `place_id` nullable
- `source_url` nullable
- `tags`
- `published_at`
- `status`
- `created_at`
- `updated_at`

Notes:

- `feed_type` is kept internally for now with a default value. It should not be shown during creation because tags/categories are a better long-term classification direction.
- `slug` should be unique and used for public feed URLs.
- `source_url` is optional and should be used only when a feed references an external source.
- `tags` is a simple `text[]` field for Phase 1. It avoids extra tag tables while still allowing lightweight categorization.
- `status` should support draft and published states at minimum.
- `published_at` controls public chronological ordering.
- `place_id` is nullable so not every feed needs a place. In the current implementation it remains the optional primary place for compatibility and simple public displays.

### Photo

A Photo is an asset attached to a feed.

Fields:

- `photo_id`
- `feed_id`
- `place_id` nullable
- `title`
- `description`
- `photo_url`
- `location_name`
- `captured_at`
- `featured`
- `created_at`
- `updated_at`

Notes:

- A feed can contain multiple photos.
- `featured` marks the preferred image for feed cards and previews.
- `place_id` should be optional on Photo.
- `location_name` allows a human-readable photo-specific location without requiring a full Place record.

Photo `place_id` evaluation:

- Recommended: support nullable `place_id` on photos.
- Reason: the feed-level `place_id` represents the main story location, while individual photos may be captured at nearby or more specific places.
- Example: a feed about a Kuching Waterfront walk may include one photo linked to the Darul Hana Bridge and another linked to the Chinese Museum.
- Keep it optional so normal feeds do not require repetitive place selection for every photo.
- In Phase 1 UI, default photo place to the feed place unless the curator chooses a different one.

### Place

A Place is a location that can be linked to many feeds.

Examples:

- Kuching Waterfront
- Carpenter Street
- Pending
- India Street

Fields:

- `place_id`
- `name`
- `slug`
- `description`
- `latitude` nullable
- `longitude` nullable
- `created_at`
- `updated_at`

Notes:

- `slug` should be unique.
- Coordinates are optional.
- A place page can list related published feeds.

## 5. Database Schema Proposal

```sql
-- AroundCities V2 Phase 1 schema proposal.
-- Review before running in production.

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

create table public.feed_places (
  feed_id uuid not null references public.feeds(feed_id) on delete cascade,
  place_id uuid not null references public.places(place_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (feed_id, place_id)
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

create index feed_places_place_id_idx
  on public.feed_places (place_id);

create index places_slug_idx
  on public.places (slug);
```

### Schema Rules

- Keep Feed as the primary content entity.
- Keep `feed_type` hidden/defaulted for now. Prefer flexible tags/categories for future content classification instead of forcing a single feed type during creation.
- Use `slug` for public feed URLs.
- Use `source_url` only for optional external references.
- Use `tags text[]` for simple Phase 1 tags without introducing tag entities or tag UI.
- Keep Photo attached directly to Feed.
- Keep Place optional on Feed.
- Keep Place optional on Photo.
- Use `feed_places` for multiple human-assigned feed-level places.
- Keep `feeds.place_id` temporarily as an optional primary place for route compatibility and simple displays.
- Do not add event-specific tables in Phase 1.
- Do not add user, account, comment, rating, or social tables in Phase 1.

## 6. Route Proposal

### `/`

Redirect to `/kch`.

Purpose:

- Keep the root simple.
- Make Kuching the default city for Phase 1.

### `/kch`

Latest feed.

Purpose:

- Main public homepage.
- Shows published feeds ordered by `published_at desc`.
- Each feed card should show title, content excerpt, featured photo, place name when available, and published date.

Phase 1 should avoid complex filtering.

### `/feed/[slug]`

Feed detail.

Purpose:

- Shows one published feed.
- Displays title, content, place link when available, published date, and all attached photos.
- Shows source link when `source_url` is available.

Use `slug` for public feed URLs because slugs are now part of the Phase 1 feed model.

### `/place/[slug]`

Place detail.

Purpose:

- Shows place name, description, optional map coordinates as plain text or a simple link, and related published feeds.
- Related feeds currently include feeds where `feeds.place_id` matches the place.
- After the `feed_places` migration is run, related feeds should also include feeds linked through `feed_places`.
- Later, the page can also include feeds that have photos linked to the place through `photos.place_id`.

Do not build an advanced map view in Phase 1.

## 7. Admin Workflow Proposal

Admin is for a single curator.

### Admin Routes

Suggested minimal routes:

- `/admin`
- `/admin/feeds`
- `/admin/feeds/new`
- `/admin/feeds/[feedId]`
- `/admin/places`
- `/admin/places/new`
- `/admin/places/[placeId]`

Photo management can live inside the feed editor during Phase 1.

### Curator Workflow

1. Create a draft Feed with title, content, and one or more Photos.
2. Post-process the draft later.
3. Optionally assign primary place and multiple feed places.
4. Optionally assign photo-level places.
5. Optionally edit slug, tags, source URL, and published time.
6. Choose a featured photo.
7. Publish when ready.

### Admin Principles

- Optimize for fast solo publishing.
- Keep forms short.
- Auto-generate slug from title, but allow manual editing.
- Default photo place to the selected feed place.
- Do not ask for feed type during creation.
- New feeds should be drafts by default.
- Places remain human-assigned only. Do not add GPS-to-place automation or reverse geocoding.
- Photo metadata such as captured dates or GPS, if available later, may be displayed only as curator reference. It should not automatically assign places.
- Avoid separate complex modules for events, registrations, or programs.
- Avoid dashboard analytics in Phase 1.
- Protect all admin routes before public launch.

## 8. Public UI Proposal

### Feed Card

Minimum card content:

- Featured photo if available
- Feed type label
- Feed title
- Short content preview
- Published date
- Place name/link if available
- Optional tags

### Feed Detail

Minimum detail content:

- Title
- Feed type label
- Published date
- Place link if available
- Full content
- Photo gallery for attached photos
- Source link if available
- Optional tags

### Place Detail

Minimum place content:

- Name
- Description
- Coordinates if available
- Related feed list

## 9. Implementation Roadmap

### Step 1: Reset Project Shape

- Remove old Photo/Event-first pages and helpers.
- Keep only the framework, styling baseline, and deployment configuration that still helps.
- Confirm environment variables needed for Supabase.

Status: implemented.

### Step 2: Create V2 Schema

- Create `places`, `feeds`, and `photos`.
- Include feed type, feed slug, optional feed source URL, simple feed tags, and optional photo place.
- Add only the indexes needed for latest feed, feed detail, feed type, and place pages.
- Avoid migration complexity from the archived version unless specifically requested.

Status: implemented.

### Step 3: Add Types and Data Helpers

- Define TypeScript types for Feed, Photo, and Place.
- Add simple query helpers:
  - latest published feeds
  - feed by slug with photos and place
  - place by slug with related feeds

Status: implemented.

### Step 4: Build Public Routes

- `/` redirect
- `/kch` latest feed
- `/feed/[slug]` feed detail
- `/place/[slug]` place detail

Status: implemented.

### Step 5: Build Minimal Admin

- Protect `/admin`.
- Add feed list/create/edit.
- Make new feed creation photo-first: title, content, photos, draft.
- Hide feed type from creation and default it internally.
- Add slug generation/editing during post-processing.
- Add optional source URL entry.
- Add place list/create/edit.
- Add photo attachment inside feed edit with optional photo-level place override.

Status: implemented with simple `ADMIN_PASSWORD` protection. Updated to photo-first draft creation and post-processing workflow.

Note: multiple feed-level places are implemented in code through `feed_places`, with migration SQL created but not executed by Codex for this task.

### Step 6: Seed Initial Content

- Add a few places such as Kuching Waterfront, Carpenter Street, Pending, and India Street.
- Add a small number of published feeds with photos.

### Step 7: Validate and Deploy

- Run lint/build.
- Check desktop and mobile views.
- Verify public routes.
- Verify admin is protected.
- Push to GitHub and deploy.

## 10. Future Considerations

Potential later features:

- Scheduled publishing
- Basic search
- Simple map view
- Multiple cities

Do not add these in Phase 1 unless the user explicitly expands scope.
