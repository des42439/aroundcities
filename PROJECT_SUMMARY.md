# AroundCities Project Summary

Last updated: 6 June 2026

## Current Direction

AroundCities V2 is a greenfield rebuild.

The previous version has been archived and backed up. The old Photo/Event-first architecture should not be preserved, extended, or kept backward compatible unless the user explicitly changes direction.

## Product Vision

AroundCities is an independent local media platform focused on Kuching.

The primary question it answers is:

> What is happening around Kuching?

AroundCities is curator-driven. It is not an event portal, tourism website, business directory, or social network.

## Phase 1 Foundation

Phase 1 should introduce only the minimum foundation:

- Feed
- Photo
- Place

No comments, likes, followers, messaging, ratings, reviews, or social-network assumptions.

## Public Routes

- `/` redirects to `/kch`
- `/kch` shows a discovery-style mixed feed
- `/feed/[slug]` shows feed detail
- `/photo/[photoId]` shows a single public photo page
- `/place/[slug]` shows place detail

These public routes are implemented for Phase 1.

## Admin Direction

Admin should be optimized for a single curator.

Implemented mobile-first workflow:

- `/admin/feeds/new` is the fast capture screen. It asks only for photos, title, and description, then creates a draft.
- `/admin/feeds/import-events` accepts pasted `aroundcities_event_import_v1` JSON, previews event feed drafts, and saves valid imports as draft feeds without requiring photos.
- `/admin` shows total counts for Drafted Feeds, Published Feeds, and Sources on the workflow cards.
- `/admin/feeds/drafts` lists drafted feeds with thumbnail, title, relative updated time, and Draft label.
- `/admin/feeds/published` lists published feeds with thumbnail, title, relative published time, and Published label.
- `/admin/stats` lists feed and photo click counts from highest to lowest.
- The feed editor starts with title, description, photo thumbnails, Add Section, save/publish/archive/delete controls.
- Photo order is controlled by `photos.sequence`, with smaller positive numbers displayed first.
- Photos marked `Show as photo feed` can appear as standalone Photo feed cards in the public `/kch` discovery stream.
- Optional Sources, Places, Schedules, and Parent Feed sections appear only when added or when existing data is present.
- Source evidence, feed schedules, parent feed selection, and feed-place metadata are wired into admin as compact refinement sections.
- Published feeds can be archived without deleting their database rows.

Admin must be protected before public launch.

## Architecture Source

The V2 foundation plan is documented in:

- `V2_ARCHITECTURE.md`

That document currently contains:

- Product definition
- Core entity definitions
- Database schema proposal
- Route proposal
- Admin workflow proposal
- Public UI proposal
- Implementation roadmap

## Implemented Foundation

The V2 Phase 1 foundation now includes:

- Project reset removing old V1 public/admin routes, V1 components, and V1 Photo/Event helpers.
- Database migration for `places`, `feeds`, and `photos`.
- Feed fields: `feed_type`, `slug`, `title`, `content`, nullable `place_id`, nullable `source_url`, nullable `operating_hours`, `tags`, `published_at`, `status`, timestamps.
- Feed fields also include `click_count` for public feed click tracking.
- Photo fields: `feed_id`, nullable `place_id`, title, description, URL, location name, captured timestamp, latitude, longitude, featured flag, numeric sequence, click count, timestamps.
- Place fields: name, slug, description, optional coordinates, timestamps.
- TypeScript database types for the V2 schema.
- Simple data helpers for feeds, places, and photos.
- Public routes for `/`, `/kch`, `/feed/[slug]`, `/photo/[photoId]`, and `/place/[slug]`.
- Shared public shell and feed card components.
- Formatting helpers for feed type labels, dates, content previews, and photo sequence ordering.
- Password-protected admin routes for feed, place, and photo management.
- Photo-first feed creation: title, content, multiple photos, save draft.
- Post-processing feed edit flow for slug, tags, source URL, operating hours / schedule, places, photo order, featured flag, and publishing.
- Places are no longer promoted as a main admin navigation item. `/admin/places` remains available directly as a maintenance route.
- Inline place creation from the feed editor so missing places can be added without leaving the draft.
- Multiple feed places are supported in code through the proposed `feed_places` join table migration while keeping `feeds.place_id` as an optional primary place.
- Structured feed operating hours are supported through `feed_operating_hours` rows tied to a feed.
- Feed edit includes a separated delete action with confirmation. Deleting a feed relies on the schema cascade to remove attached photo records and does not delete places.
- Admin save, publish, upload, photo update, and delete forms show blocking overlay feedback, disable duplicate submissions while pending, and display inline errors when server actions fail.
- New feed draft creation uses a unique generated slug and does not redirect as if successful when feed insert or photo upload fails.
- Feed photo uploads use the Supabase Storage `photos` bucket and the server-side `SUPABASE_SERVICE_ROLE_KEY`.
- The `photos` storage bucket has been created remotely and is also documented in a migration.
- Admin action failures are logged with an Error ID. Logs are written to `admin_error_logs` in Supabase when available, printed to server logs, and appended to `.logs/admin-errors.jsonl` locally when the filesystem allows it.
- New feed photo creation uploads directly from the browser to Supabase Storage using signed upload URLs, avoiding Vercel Server Action body limits for initial feed creation.
- New feed photos are compressed in the browser before upload, targeting less than 1MB per photo with a 1600px longest-side resize.
- New feed creation returns to `/admin/feeds/drafts` after save.
- Event JSON import is available from New Feed through `/admin/feeds/import-events`. It validates pasted JSON, forces all imported feeds to `draft`, creates or reuses places and source channels, links feed places with location notes, creates simple feed schedule rows, and stores feed source evidence without creating photos or uploading screenshots.
- Admin feed management is split into New Feed, Drafted Feeds, and Published Feeds instead of one desktop-style all-feeds list.
- Drafted and published feed lists show the first sequenced photo as a thumbnail.
- Feed editing is mobile-first and keeps optional refinement sections hidden until the curator explicitly adds Sources, Places, Schedules, or Parent Feed.
- Feed sources, source screenshot URL evidence, simple schedule rows, feed-place metadata, and parent feeds are wired into the admin editor.
- Published feed editing supports archiving, which sets status to `archived` and hides the feed from public `/kch`.
- Feed photo editing uses a thumbnail grid and opens one photo-specific editor at a time instead of rendering every photo form inline.
- Feed photo upload from the editor opens from an Add Photos overlay so the main editor stays thumbnail-first and compact on iPhone.
- Feed photo editing lets the curator open the full-size image in a new tab by clicking the preview image.
- Feed photo editing includes a numeric Photo order field backed by `photos.sequence`; public galleries and admin thumbnails display photos from smallest positive sequence to largest.
- Feed photo editing allows multiple photos to be marked `Show as photo feed`; those photos are shuffled into `/kch` as single-photo cards linked back to the parent feed.
- Feed photo editing includes confirmed photo deletion; deleting a photo removes the row and best-effort removes the Supabase Storage object.
- Uploaded photos are not marked `Show as photo feed` automatically; the curator must select that manually while editing a photo.
- Admin photo uploads now read JPEG EXIF metadata when available and store photo capture datetime, latitude, and longitude. The photo editor shows those metadata fields and an Open Map button for coordinates.
- Public feed clicks increment `feeds.click_count`; public photo clicks increment `photos.click_count`.
- Standalone Photo feed images open the single-photo page, while the Photo feed title opens the original feed detail.
- Admin can review feed and photo click counts from `/admin/stats`.
- The admin photo editor no longer shows photo-specific Place or Location name fields; existing database columns remain untouched for now.
- Admin includes `/admin/sources`, a compact manual checklist for useful Facebook pages, groups, and websites the curator may review for possible AroundCities content.
- Sources can be created from `/admin/sources/new`, edited, deleted, opened in a new tab, and manually marked checked. The list is sorted with never checked sources first, then oldest checked first.
- Existing feed photo uploads are still guarded at roughly 4MB total per submit until that editor flow is also moved to direct uploads.
- Supabase CLI schema-change access was verified by creating and then removing temporary table `codex_dummy_schema_test` with dedicated migrations.

Simple tags are implemented as `feeds.tags text[]` to avoid a separate tag entity or tag UI in Phase 1.

Operating hours use two layers:

- `feeds.operating_hours` is the curator-written public display note.
- `feed_operating_hours` stores structured queryable rows for weekly schedules, date ranges, time windows, closed days, and notes.

This intentionally avoids a full calendar or recurrence engine while making future open-now queries possible.

Sources are intentionally manual. They are not a crawler, scraper, scheduled job queue, Facebook automation layer, priority system, or frequency system.

`feed_type` is kept internally with a `local_discovery` default for compatibility, but it is hidden from the creation workflow. Future classification should lean on flexible tags/categories instead.

The `feed_places` migration SQL has been created but not run by Codex. Until that migration is applied to Supabase, multiple feed-level place assignment will remain a prepared schema/code path rather than active production data.

## 2026-06-05 Schema Review

The final table design and final feed use cases were reviewed in:

- `20260605_schema_review_erd.md`

The review identified missing support for parent-child feed relationships, feed-tied source evidence, source screenshots, date-window schedules, feed-place metadata, photo ordering, optional photo coordinates, and audit user fields.

Additive migration scripts were produced and applied to the linked Supabase project `fblhoxcdfnxnqzmuczkx`:

- `supabase/migrations/20260605000000_v2_use_case_schema_extensions.sql`
- `supabase/migrations/20260605001000_enable_v2_rls_policies.sql`
- `supabase/migrations/20260605002000_add_remaining_audit_fields.sql`
- `supabase/migrations/20260605003000_seed_phase3_test_data.sql`
- `supabase/migrations/20260605012000_remove_seed_test_data.sql`
- `supabase/migrations/20260606001000_add_feed_photo_click_counts.sql`
- `supabase/migrations/20260606002000_keep_click_counts_from_touching_updated_at.sql`

These scripts keep the current app-facing schema intact while adding the tables and columns needed by the reviewed use cases.

Phase 2 database status:

- Remote migration history is aligned with local migrations through `20260605002000`.
- `channels`, `feed_sources`, `source_screenshots`, and `feed_schedules` now exist in Supabase.
- Foreign keys and indexes for parent feeds, feed sources, source screenshots, schedules, photos, places, and feed-place links are in place.
- RLS is enabled on V2 app tables. Anonymous reads are limited to published feed content and related public rows. Admin/server writes use the service-role client.
- Raw generated Supabase types are stored in `types/supabase.generated.ts`.
- Existing app-facing types in `types/database.ts` were updated for the new schema.
- Phase 3 seed data was applied and verified for the requested sample feeds, then removed from the linked Supabase project after testing.
- The seed data covered places, photos, feed-place links, parent-child feed links, schedules, source channels, feed sources, source screenshots, multi-photo feeds, long descriptions, and discovery-ordering volume.
- Seed/test cleanup was verified on the linked Supabase project with 0 seed-marked rows remaining across feed/source/photo/place support tables and 0 published feeds.
- Two long-description public seed feeds were added so the `/kch` two-line preview and inline `more` link can be tested reliably.
- The `/kch` public feed now uses a compact header instead of a large hero and adapts feed cards between visual-first local discovery posts and information-first announcement posts.
- The `/kch` page now shows feed items immediately after the city header. Feed cards use a social-feed order: title, `Author · Relative Time`, a two-line description preview with inline `more` only when truncated, the photo gallery, then a clear subtle divider with breathing room before the next post. Place data remains available on feed and place detail pages, but is hidden from the feed listing.
- Seeded public feeds previously used `created_by = AroundCities`, staggered `created_at` values, and populated places for author, relative-time, and place rendering tests before cleanup.
- The `/kch` public feed uses discovery-style ordering instead of pure latest-first: a randomized recent lead, randomized weekly posts, a latest fallback around slot 6, latest remaining posts, and occasional older rediscovery inserts when older posts exist.
- Seeded public feeds previously had staggered `published_at` values and a 100-feed discovery ordering volume set for testing before cleanup.
- Public feed photo blocks keep roughly the same large footprint for single and multi-photo feeds, avoiding tiny thumbnail previews on mobile.

Admin UI and data-helper wiring now exists for `channels`, `feed_sources`, `source_screenshots`, and `feed_schedules` as compact optional refinement sections. Source screenshots currently accept screenshot URLs as evidence records rather than direct private file uploads.

## Current Repo Note

The repository may still contain archive files, notes, and backup artifacts, but the active app/lib/types foundation has been reset away from the old Photo/Event-first implementation.

## Not Implemented Yet

- Supabase Auth
- Search
- Maps
- Tags UI
- Multiple cities

## Admin Protection

Admin routes are protected by a simple Phase 1 password flow:

- `ADMIN_PASSWORD` is read from environment variables.
- `SUPABASE_SERVICE_ROLE_KEY` is required for server-side admin photo uploads.
- `SUPABASE_SERVICE_ROLE_KEY` is also used for durable admin error logging.
- `/admin/login` accepts the password.
- Successful login stores an httpOnly admin session cookie scoped to `/admin`.
- Middleware redirects unauthenticated `/admin/*` requests to `/admin/login`.

This intentionally avoids Supabase Auth and role management for Phase 1.

## Location Policy

Places are assigned by the curator. AroundCities does not perform GPS-to-place automation, reverse geocoding, or map-based auto assignment in Phase 1.

Places remain a core entity for public place pages and feed/photo assignment, but they are not a primary daily admin workflow.
