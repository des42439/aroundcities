# AroundCities V2 Phase 1 Architecture

Last updated: 15 June 2026

Implementation status: Steps 1-5 are implemented, plus a photo-first admin workflow through Photo Album Admin v1. Feed workflows remain in the codebase and are reachable by direct URL, but they are hidden from the main admin navigation for now. Phase 2 database migrations for the final feed use cases have been produced and applied to Supabase, and the admin editor now wires parent feeds, source evidence, uploaded screenshot URL records, feed schedules, event details, and feed-place metadata as compact optional sections. A temporary public homepage lock protects `/` and `/kch` during content preparation and can be disabled from `lib/public-lock.ts`. The standalone History module is implemented as an admin-only archive and research pipeline, with no public discovery integration.

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

Temporary pre-launch note:

- The public homepage may be hidden behind a simple password gate while content is being prepared.
- This lock is not a user authentication system and does not change the admin auth model.
- Future public launch should only require setting `LOCK_USER_PAGE` to `false` in `lib/public-lock.ts` and redeploying.

## 3. Phase 1 Scope

The public product foundation still centers on three core entities:

- Feed
- Photo
- Place

Supporting tables may exist for feed-place links, structured operating hours, storage, admin diagnostics, and manual admin source checklists. Do not treat these as new public product entities.

Admin is moving photo-first. `photo_albums` is the current organization layer for reusable photo library assets. Photos can be tagged for future reuse across History, Learning, Greetings, Discovery, Positive Messages, and generated homepage cards. No public homepage integration for albums or tags exists yet.

History is a standalone admin-only archive module. It is intentionally not a feed type and is stored in dedicated history tables. Public history discovery should wait until a substantial library exists.

No comments, likes, followers, messaging, ratings, reviews, public contributor accounts, or business-directory workflows.

## 3A. History Module

Purpose:

- Store historical records about Kuching and Sarawak.
- Manage drafted, researched, pending-review, published, and archived history records from admin.
- Import records from `aroundcities_history_import_v1` JSON.
- Assign a small daily research batch by tagging up to 10 oldest drafted records with `daily-task:YYYYMMDD` on the first `/admin/history` visit of each Kuching day.
- Export records through `aroundcities_history_research_export_v1` JSON for research using Daily Tasks, Show All, Drafted, Researched, Pending Review, Published, and Archived filters.
- Update existing records through `aroundcities_history_update_v1` JSON using `history_id`; successful updates add the `research:done` tag.
- Import researched updates through `aroundcities_history_research_update_v2`; this updates existing records, marks them `researched`, and inserts or updates multiple source rows by URL.
- Review linked sources in admin before publishing. Records with `history_sources` require at least one reviewed source; legacy records using only old source fields remain compatible.
- Run the manual `tools/history-screenshot-assistant` CLI after source review to capture screenshots for reviewed sources and move fully evidenced researched records to `pending_review`.
- Link records to reusable photos from the existing photo library.
- Upload a single source screenshot from the edit page using the existing browser compression and signed Supabase Storage upload flow, then store the generated URL in `history_records.source_screenshot_url`.

Tables:

- `history_records`
- `history_sources`
- `history_photos`

History records are not feeds and must not be stored in `feeds`.

History photos reuse `photos`. History-only uploads create ordinary photo rows attached to an archived feed used solely as a photo container, then link those photos through `history_photos`.

`history_sources` is the preferred multi-source storage for new research workflow data. The legacy `history_records.source_url`, `source_note`, and `source_screenshot_url` fields remain for existing records and compatibility.

Daily research tasks reuse `history_records.tags`. Starting a new Kuching day removes only old tags beginning with `daily-task:` so unfinished drafted records can be reassigned later without deleting ordinary tags such as source, slug, or `research:done` tags.

Admin routes:

- `/admin/history`
- `/admin/history/new`
- `/admin/history/[historyId]`
- `/admin/history/import`
- `/admin/history/export`

Deferred:

- Homepage history cards
- Story Of The Day
- Today In Kuching History
- Feed generation from history records
- Recommendation, ranking, search, analytics, translation, scheduling, and related-content features
- Automatic screenshot jobs or deploy-time screenshot processing

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
- `click_count`
- `created_at`
- `updated_at`

Notes:

- `feed_type` is kept internally for now with a default value. It should not be shown during creation because tags/categories are a better long-term classification direction.
- `slug` should be unique and used for public feed URLs.
- `source_url` is optional and should be used only when a feed references an external source.
- `operating_hours` is optional free text for human-entered schedules, such as shop hours, clinic sessions, or temporary festival dates and times.
- Structured queryable schedules belong in `feed_operating_hours`; keep `operating_hours` as the readable curator note.
- Event timing labels such as `Happening Today` should be computed from schedule rows at display time and should not be stored in `feeds.title`.
- `tags` is a simple `text[]` field for Phase 1. It avoids extra tag tables while still allowing lightweight categorization.
- `status` should support draft and published states at minimum.
- `published_at` controls public chronological ordering.
- `place_id` is nullable so not every feed needs a place. In the current implementation it remains the optional primary place for compatibility and simple public displays.

### Photo

A Photo is an asset attached to a feed.

Fields:

- `photo_id`
- `feed_id`
- `album_id`
- `place_id` nullable
- `title`
- `description`
- `photo_url`
- `location_name`
- `location_note`
- `captured_at`
- `latitude`
- `longitude`
- `featured`
- `is_album_cover`
- `sequence`
- `status`
- `tags`
- `click_count`
- `created_at`
- `updated_at`

Notes:

- A feed can contain multiple photos.
- A photo can belong to one photo album through `photos.album_id`.
- `photo_albums` stores album title, description, status, and timestamps.
- `is_album_cover` marks the album thumbnail; only one cover should be selected per album during admin editing, but an album may temporarily have no cover.
- Photo `status` supports `drafted`, `published`, and `archived` for the photo library workflow.
- Photo tags are simple `text[]` chips for future reuse; there is no separate tag management page.
- `featured` is a multi-photo curator flag surfaced as `Show as photo feed`; it makes photos eligible for standalone Photo feed cards on `/kch`.
- `featured` should not override sequence ordering for feed cards, previews, or galleries.
- `sequence` controls the photo display order within a feed. Smaller positive numbers appear first; unsequenced `0` values fall behind manually ordered photos.
- `click_count` tracks public photo clicks.
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
  click_count integer not null default 0,
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
  latitude double precision,
  longitude double precision,
  featured boolean not null default false,
  sequence integer not null default 0,
  click_count integer not null default 0,
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
- `/admin/sources` defaults to a Pending view that shows sources never checked or not checked in the past 3 days, with a dropdown `Show all` filter for the full list.
- Sources are sorted by `last_checked_at asc nulls first`, then `created_at asc`, so never checked and oldest checked items rise to the top in whichever view is active.
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
  - `supabase/migrations/20260605009000_update_seed_feed_public_metadata.sql`
  - `supabase/migrations/20260605010000_update_seed_feed_discovery_dates.sql`
  - `supabase/migrations/20260605011000_seed_100_discovery_timeframe_feeds.sql`
  - `supabase/migrations/20260605012000_remove_seed_test_data.sql`
  - `supabase/migrations/20260606001000_add_feed_photo_click_counts.sql`
  - `supabase/migrations/20260606002000_keep_click_counts_from_touching_updated_at.sql`
- The reviewed final use cases need `feeds.parent_feed_id`, feed-tied source evidence, source screenshots, flexible feed schedules, `feed_places.is_primary`, `feed_places.location_note`, photo sequence/coordinates, and audit user fields.
- These migrations have been applied to linked Supabase project `fblhoxcdfnxnqzmuczkx`.
- RLS is enabled on app tables. Anonymous reads are limited to published public feed content and related rows. Admin/server writes use the service-role client.
- Raw generated Supabase types live in `types/supabase.generated.ts`; app-facing aliases remain in `types/database.ts`.
- Phase 3 seed data was applied and verified for nine sample feeds covering events, major event parent feeds, sub-events, registration periods, food sharing, multi-place walks, seasonal greetings, and featured photos.
- Public test seed data covered five-photo and six-photo feeds, long descriptions, real sample image URLs, staggered public metadata, and a 100-feed discovery ordering volume set.
- Seed/test data has since been removed from the linked Supabase project with `supabase/migrations/20260605012000_remove_seed_test_data.sql` and a service-role cleanup. Verification showed 0 seed-marked rows and 0 published feeds remaining.
- Public feed browsing should feel compact, relaxed, and local. The `/kch` page avoids a large hero and feed cards should read like local notes, not official listings.
- Public feed clicks should increment `feeds.click_count`, and public photo clicks should increment `photos.click_count` without blocking navigation or changing content edit timestamps.
- Standalone Photo feed cards should split behavior: title opens the original feed detail, image opens the single-photo page.
- `/kch` should use discovery-style ordering rather than strict latest-first ordering: randomized recent lead, randomized weekly follow-up slots, latest fallback near slot 6, then latest remaining posts with occasional older rediscovery inserts.
- Use simple display heuristics for now: information-first feeds should still lead with title and short copy, but any attached photos should render as a full-width social-feed image block.
- The current `/kch` feed shows items immediately after the city header. Cards should show title, muted `Author · Relative Time`, a compact two-line description preview with inline `more` only when truncated, photos as the primary block, then a clear subtle divider with enough breathing room to mark the end of the post. Inline `more` expands the full description on the same card; only the separate `More details` link navigates to feed detail. Do not render a place row, pin icon, or footer actions below the gallery.
- Multi-photo grids should occupy a similar visual footprint to a single-photo block: 2 photos side-by-side, 3 photos with one large image and two stacked images, and 4+ photos as 2x2 with a `+N` overlay when needed.
- Keep the current `sources` table as a manual curator checklist. Use `channels`, `feed_sources`, and `source_screenshots` for evidence tied to a specific feed inside the optional admin Sources section. Source screenshots are selected as image files in the feed editor, compressed in the browser, uploaded to Supabase Storage under `source-screenshots/`, and saved as generated screenshot URL evidence records.
- Use optional `feed_event_details` rows for structured event metadata. Do not create a separate public Event entity during Phase 1.
- Public feed detail pages currently hide structured event details, but may show dynamic timing labels and external `Source` / `Channel` links.
- Scheduled event observation feeds should leave the `/kch` discovery stream once their schedule has expired. A schedule with `start_time` and no `end_time` uses a 1-hour inferred duration; date-only schedules remain visible for the day but do not show `Happening Now`.
- Non-expired event observation feeds scheduled for today should be promoted into the first one to three `/kch` feed slots, ordered by earliest schedule time, before the regular mixed discovery order resumes.
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
- Exception: `feed_event_details` is a support table for optional structured metadata attached to Feed, not a separate public Event entity.
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
- Each feed card should show title, author, relative time, content excerpt, and attached photos. Place data should remain hidden from the feed listing.

Phase 1 should avoid complex filtering.

### `/feed/[slug]`

Feed detail.

Purpose:

- Shows one published feed.
- Displays title, content, place link when available, published date, and all attached photos.
- Shows source link when `source_url` is available.
- Shows operating hours / schedule when `operating_hours` is available.

Use `slug` for public feed URLs because slugs are now part of the Phase 1 feed model.

### `/photo/[photoId]`

Photo detail.

Purpose:

- Shows one published photo from a published feed.
- Displays the photo title, description, capture date when available, and a link back to the original feed.
- Public feed detail and Photo feed image clicks should route here instead of opening the raw image file in a new tab.

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
- `/admin/photos`
- `/admin/photos/new`
- `/admin/photos/[albumId]`
- `/admin/photos/photo/[photoId]`
- `/admin/feeds`
- `/admin/feeds/new`
- `/admin/feeds/import-events`
- `/admin/feeds/drafts`
- `/admin/feeds/published`
- `/admin/feeds/[feedId]`
- `/admin/places` maintenance route
- `/admin/places/new` maintenance route
- `/admin/places/[placeId]` maintenance route
- `/admin/sources`
- `/admin/sources/new`
- `/admin/sources/[sourceId]`
- `/admin/stats`

`/admin/photos` is the primary current admin workflow. `/admin/feeds` and feed edit routes remain available by direct URL, but feed workflow links are hidden from the main admin navigation for now.
`/admin/feeds/import-events` supports pasting ChatGPT-generated `aroundcities_event_import_v2` JSON, keeps v1 JSON compatible, previews multiple event observations, and saves them as draft feeds without photos or screenshot uploads.
Photo management can live inside the feed editor during Phase 1.
Place management routes should remain available directly for maintenance, but Places should not appear as a main admin navigation item.
Sources may appear as a main admin item because they support the curator's manual discovery workflow.
Stats may appear as a main admin item for lightweight feed and photo click-count review.

### Curator Workflow

1. Capture a draft Feed from `/admin/feeds/new` with only photos, title, and description.
2. For batches of external event leads, paste reviewed JSON into `/admin/feeds/import-events`, preview it, and save it as draft event observation feeds. Imported events must never publish automatically.
   Fully successful saves should reset the import textarea and preview; validation or per-event save errors should keep the pasted JSON available for correction.
3. Return to `/admin/feeds/drafts` and open the draft when ready to refine it.
4. Keep the draft editor compact: title, description, photo thumbnails, Add Section, Save Draft, Publish, Delete.
5. Keep photo upload and photo-detail editing in overlays opened from the thumbnail area so the main editor stays compact. Photo detail editing should let the curator open the full-size image and delete the photo with confirmation.
6. Add optional Sources, Places, Schedules, or Parent Feed sections only when the feed needs them.
7. Optionally assign primary place and multiple feed places with a location note. Linked places should use a searchable add/remove picker instead of a full checkbox list.
8. Optionally assign photo-level places from the photo thumbnail editor.
9. Add source URL/channel/note and uploaded screenshot evidence as admin-only feed evidence.
10. Add simple schedule rows when the feed needs dated schedule data.
11. Add Event Details only when the feed needs structured event metadata such as entry type, registration type, public/ticket flags, lucky draw, dress code, organizer, or notes.
12. Use a searchable picker for parent feed selection and exclude the current feed.
13. Publish when ready, or archive a published feed from `/admin/feeds/published` when it should leave public `/kch`.
14. Review saved Sources manually, open useful pages in a new tab, and click `Mark Checked` only after review.

### Admin Principles

- Optimize for fast solo publishing.
- Admin must be mobile-first and usable on iPhone.
- Keep forms short.
- Show required fields first and hide optional sections until the curator adds them or existing data is present.
- Auto-generate slug from title, but allow manual editing.
- Default photo place to the selected feed place.
- Do not promote Places as a daily admin section. The normal admin workflow should be feed-first and photo-first.
- Place creation should happen inline or nearby while editing a feed or photo.
- Keep `/admin/places` available as a maintenance route for cleanup and corrections.
- Feed linked places should be edited with a searchable add/remove picker so the editor remains compact as places grow.
- Do not ask for feed type during creation.
- New feeds should be drafts by default.
- Event JSON imports should create draft feeds only. They may create/reuse places, feed-place links, schedules, channels, and feed source rows, but should not create photos, upload screenshots, or introduce a separate event entity.
- Event JSON import should reset to a fresh input state after a fully successful save, but preserve pasted content when preview validation or per-event save errors occur.
- Event JSON imports may include an optional `event_details` object. Imported titles must stay timeless; strip dynamic prefixes like `Happening Today:` before storing the feed title.
- Places remain human-assigned only. Do not add GPS-to-place automation or reverse geocoding.
- Photo order should stay numeric and curator-controlled through `photos.sequence`; do not let the featured flag override sequence ordering for public galleries or admin thumbnails.
- Multiple photos in one feed may be marked as Photo feed candidates. Do not enforce one featured photo per feed.
- Uploading photos must not automatically mark them as Photo feed candidates; this is a manual admin decision in the photo editor.
- Photo metadata such as captured dates or GPS should be extracted from JPEG EXIF data when available and displayed as curator reference only. It must not automatically assign places.
- Keep photo-specific Place and Location name hidden in the admin photo editor unless explicitly reintroduced.
- Save, publish, upload, photo update, and delete actions should show blocking pending overlays and prevent duplicate submissions.
- Photo delete should remove the photo row and best-effort clean up the Supabase Storage object.
- Admin write failures should stay on the form and show a clear error instead of redirecting as if successful.
- Feed deletion must require confirmation, redirect back to `/admin/feeds`, and must not delete unrelated places.
- Published feed archive must set status to `archived`, keep the row in the database, and hide the feed from public `/kch`.
- Avoid separate complex modules for events, registrations, or programs.
- Avoid dashboard analytics in Phase 1.
- Keep Sources compact and manual. Do not add source crawling, scraping, bot browsing, Facebook login, scheduled checking, priority, or frequency fields.
- Protect all admin routes before public launch.

## 8. Public UI Proposal

### Feed Card

Minimum card content:

- First photo by sequence if available
- Standalone Photo feed cards for selected photos when available
- Feed type label
- Feed title
- Short content preview
- Published date
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
- `/kch` discovery feed
- `/feed/[slug]` feed detail
- `/photo/[photoId]` photo detail
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
