# AroundCities V2 Phase 1 Architecture

Last updated: 5 June 2026

Implementation status: Steps 1-5 are implemented, plus a simple manual admin Sources checklist. Phase 2 database migrations for the final feed use cases have been produced and applied to Supabase, but the new source evidence, channel, screenshot, and feed schedule UI/data-helper wiring is not implemented yet.

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

Supporting tables may exist for feed-place links, structured operating hours, storage, admin diagnostics, and manual admin source checklists. Do not treat these as new public product entities.

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
- `operating_hours` nullable
- `tags`
- `published_at`
- `status`
- `created_at`
- `updated_at`

Notes:

- `feed_type` is kept internally for now with a default value. It should not be shown during creation because tags/categories are a better long-term classification direction.
- `slug` should be unique and used for public feed URLs.
- `source_url` is optional and should be used only when a feed references an external source.
- `operating_hours` is optional free text for human-entered schedules, such as shop hours, clinic sessions, or temporary festival dates and times.
- Structured queryable schedules belong in `feed_operating_hours`; keep `operating_hours` as the readable curator note.
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
  operating_hours text,
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

create table public.feed_operating_hours (
  operating_hour_id uuid primary key default gen_random_uuid(),
  feed_id uuid not null references public.feeds(feed_id) on delete cascade,
  schedule_type text not null
    check (schedule_type in ('weekly', 'date_range')),
  days_of_week int[],
  date_start date,
  date_end date,
  time_start time,
  time_end time,
  closed boolean not null default false,
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_error_logs (
  log_id uuid primary key default gen_random_uuid(),
  error_id text not null unique,
  area text not null,
  message text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.sources (
  source_id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  notes text,
  last_checked_at timestamptz,
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

create index feed_operating_hours_feed_id_idx
  on public.feed_operating_hours (feed_id, sort_order);

create index feed_operating_hours_days_idx
  on public.feed_operating_hours using gin (days_of_week);

create index feed_operating_hours_date_range_idx
  on public.feed_operating_hours (date_start, date_end);

create index photos_feed_id_idx
  on public.photos (feed_id);

create index photos_place_id_idx
  on public.photos (place_id);

create index feed_places_place_id_idx
  on public.feed_places (place_id);

create index places_slug_idx
  on public.places (slug);

create index admin_error_logs_created_at_idx
  on public.admin_error_logs (created_at desc);

create index sources_last_checked_created_idx
  on public.sources (last_checked_at asc nulls first, created_at asc);
```

Storage:

- Supabase Storage bucket `photos` stores uploaded feed images.
- The bucket should be public for image delivery through public URLs.
- Admin uploads should use the server-side `SUPABASE_SERVICE_ROLE_KEY`, not the public anon key.

Admin error logging:

- Admin action failures should generate an Error ID.
- The Error ID should be shown in the admin UI and printed in the browser console.
- Server-side logs should be written to `admin_error_logs` in Supabase when available.
- Local development may also append JSONL entries to `.logs/admin-errors.jsonl`.
- Logs must avoid secrets and only include minimal troubleshooting context.

Sources:

- `sources` stores a simple manual checklist of useful Facebook pages, groups, and websites for content discovery.
- Sources are sorted by `last_checked_at asc nulls first`, then `created_at asc`, so never checked and oldest checked items rise to the top.
- Opening a source should not mark it checked. The curator manually clicks `Mark Checked` after review.
- Sources must not become a crawler, scraper, scheduled checker, Facebook automation system, priority queue, or frequency system during Phase 1.

2026-06-05 use-case schema review:

- Review document: `20260605_schema_review_erd.md`.
- Additive migrations:
  - `supabase/migrations/20260605000000_v2_use_case_schema_extensions.sql`
  - `supabase/migrations/20260605001000_enable_v2_rls_policies.sql`
  - `supabase/migrations/20260605002000_add_remaining_audit_fields.sql`
  - `supabase/migrations/20260605003000_seed_phase3_test_data.sql`
  - `supabase/migrations/20260605004000_seed_more_public_feed_styles.sql`
  - `supabase/migrations/20260605005000_seed_multi_photo_feed_examples.sql`
  - `supabase/migrations/20260605006000_update_multi_photo_seed_image_urls.sql`
  - `supabase/migrations/20260605007000_seed_real_sample_images_for_all_public_feeds.sql`
  - `supabase/migrations/20260605008000_seed_long_description_feed_examples.sql`
- The reviewed final use cases need `feeds.parent_feed_id`, feed-tied source evidence, source screenshots, flexible feed schedules, `feed_places.is_primary`, `feed_places.location_note`, photo sequence/coordinates, and audit user fields.
- These migrations have been applied to linked Supabase project `fblhoxcdfnxnqzmuczkx`.
- RLS is enabled on app tables. Anonymous reads are limited to published public feed content and related rows. Admin/server writes use the service-role client.
- Raw generated Supabase types live in `types/supabase.generated.ts`; app-facing aliases remain in `types/database.ts`.
- Phase 3 seed data has been applied and verified for nine sample feeds covering events, major event parent feeds, sub-events, registration periods, food sharing, multi-place walks, seasonal greetings, and featured photos.
- Public test seed data includes five-photo and six-photo feeds for verifying the 4+ photo grid and `+N` overlay.
- The latest multi-photo test feeds use external food/scenery sample image URLs rather than word-only placeholder images.
- Every published seed feed has at least one photo so the public feed listing can be tested consistently.
- Long-description test feeds exist so the `/kch` two-line preview and inline `more` link can be verified.
- Public feed browsing should feel compact, relaxed, and local. The `/kch` page avoids a large hero and feed cards should read like local notes, not official listings.
- Use simple display heuristics for now: information-first feeds should still lead with title and short copy, but any attached photos should render as a full-width social-feed image block.
- The current `/kch` feed shows items immediately after the city header. Cards should show title, muted place/date, a compact two-line description preview with inline `more` only when truncated, photos as the primary block, a small muted footer link, then the divider.
- Multi-photo grids should occupy a similar visual footprint to a single-photo block: 2 photos side-by-side, 3 photos with one large image and two stacked images, and 4+ photos as 2x2 with a `+N` overlay when needed.
- Keep the current `sources` table as a manual curator checklist. Use `channels`, `feed_sources`, and `source_screenshots` for evidence tied to a specific feed when that workflow is implemented.
- Keep the current app-facing `feeds.content`, `feeds.source_url`, `feed_operating_hours`, and `sources` surfaces until the application is intentionally migrated to the reviewed final schema.

### Schema Rules

- Keep Feed as the primary content entity.
- Keep `feed_type` hidden/defaulted for now. Prefer flexible tags/categories for future content classification instead of forcing a single feed type during creation.
- Use `slug` for public feed URLs.
- Use `source_url` only for optional external references.
- Use `operating_hours` as flexible free text for public schedule wording.
- Use `feed_operating_hours` for structured rows when open-now or date/time queries are needed.
- Do not introduce a full calendar, recurrence engine, or business-directory operating-hours model in Phase 1.
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
- Shows operating hours / schedule when `operating_hours` is available.

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
- `/admin/places` maintenance route
- `/admin/places/new` maintenance route
- `/admin/places/[placeId]` maintenance route
- `/admin/sources`
- `/admin/sources/new`
- `/admin/sources/[sourceId]`

Photo management can live inside the feed editor during Phase 1.
Place management routes should remain available directly for maintenance, but Places should not appear as a main admin navigation item.
Sources may appear as a main admin item because they support the curator's manual discovery workflow.

### Curator Workflow

1. Create a draft Feed with title, content, and one or more Photos.
2. Post-process the draft later.
3. Optionally assign primary place and multiple feed places.
4. Optionally assign photo-level places.
5. Create a missing place inline from the feed editor when needed.
6. Optionally edit slug, tags, source URL, operating hours / schedule, and published time.
7. Add structured operating-hour rows only when the feed needs date/time querying later.
8. Choose a featured photo.
9. Publish when ready.
10. Delete the feed only from the separated delete area when it is no longer needed.
11. Review saved Sources manually, open useful pages in a new tab, and click `Mark Checked` only after review.

### Admin Principles

- Optimize for fast solo publishing.
- Keep forms short.
- Auto-generate slug from title, but allow manual editing.
- Default photo place to the selected feed place.
- Do not promote Places as a daily admin section. The normal admin workflow should be feed-first and photo-first.
- Place creation should happen inline or nearby while editing a feed or photo.
- Keep `/admin/places` available as a maintenance route for cleanup and corrections.
- Do not ask for feed type during creation.
- New feeds should be drafts by default.
- Places remain human-assigned only. Do not add GPS-to-place automation or reverse geocoding.
- Photo metadata such as captured dates or GPS, if available later, may be displayed only as curator reference. It should not automatically assign places.
- Save, publish, upload, photo update, and delete actions should show blocking pending overlays and prevent duplicate submissions.
- Admin write failures should stay on the form and show a clear error instead of redirecting as if successful.
- Feed deletion must require confirmation, redirect back to `/admin/feeds`, and must not delete unrelated places.
- Avoid separate complex modules for events, registrations, or programs.
- Avoid dashboard analytics in Phase 1.
- Keep Sources compact and manual. Do not add source crawling, scraping, bot browsing, Facebook login, scheduled checking, priority, or frequency fields.
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
- Optional operating hours / schedule

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
- Optional operating hours / schedule

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
- Keep place list/create/edit as maintenance routes, not main admin navigation.
- Add inline place creation from the feed editor.
- Add photo attachment inside feed edit with optional photo-level place override.
- Add a separated delete feed action with confirmation.
- Add loading/progress feedback for admin form submissions.

Status: implemented with simple `ADMIN_PASSWORD` protection. Updated to photo-first draft creation, post-processing workflow, maintenance-only place routes, inline place creation, delete feed support, and form loading states.

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
