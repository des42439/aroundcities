# AroundCities Project Summary

Last updated: 5 June 2026

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
- `/kch` shows the latest feed
- `/feed/[slug]` shows feed detail
- `/place/[slug]` shows place detail

These public routes are implemented for Phase 1.

## Planned Admin Direction

Admin should be optimized for a single curator.

Minimum workflow:

- Create or edit feeds
- Attach photos to feeds
- Assign or create places while editing feeds/photos
- Mark one photo as featured
- Manually check saved sources for possible content leads
- Save draft or publish

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
- Photo fields: `feed_id`, nullable `place_id`, title, description, URL, location name, captured timestamp, featured flag, timestamps.
- Place fields: name, slug, description, optional coordinates, timestamps.
- TypeScript database types for the V2 schema.
- Simple data helpers for feeds, places, and photos.
- Public routes for `/`, `/kch`, `/feed/[slug]`, and `/place/[slug]`.
- Shared public shell and feed card components.
- Formatting helpers for feed type labels, dates, content previews, and featured photo selection.
- Password-protected admin routes for feed, place, and photo management.
- Photo-first feed creation: title, content, multiple photos, save draft.
- Post-processing feed edit flow for slug, tags, source URL, operating hours / schedule, places, featured photo, and publishing.
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
- New feed creation returns to `/admin/feeds` after save.
- Admin feed list shows the featured photo or first attached photo as a thumbnail.
- Feed editing uses an optional-field picker so slug, places, publishing time, source URL, operating hours / schedule, and tags can be added only when needed.
- Feed photo editing uses a thumbnail grid and opens one photo-specific editor at a time instead of rendering every photo form inline.
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

These scripts keep the current app-facing schema intact while adding the tables and columns needed by the reviewed use cases.

Phase 2 database status:

- Remote migration history is aligned with local migrations through `20260605002000`.
- `channels`, `feed_sources`, `source_screenshots`, and `feed_schedules` now exist in Supabase.
- Foreign keys and indexes for parent feeds, feed sources, source screenshots, schedules, photos, places, and feed-place links are in place.
- RLS is enabled on V2 app tables. Anonymous reads are limited to published feed content and related public rows. Admin/server writes use the service-role client.
- Raw generated Supabase types are stored in `types/supabase.generated.ts`.
- Existing app-facing types in `types/database.ts` were updated for the new schema.
- Phase 3 seed data is applied and verified for the requested sample feeds: DIY Sape Competition, Kuching Food Festival, Kuching Got Talent, Kuching Marathon, Registration Period, Food Sharing, Waterfront Walk, Seasonal Greeting, and Featured Photo.
- The seed data includes places, photos, feed-place links, parent-child feed links, schedules, source channels, feed sources, and source screenshots.
- Additional public-browsing seed data was added for Singing Competition at The Spring, Kuching Marathon Route / Jersey Reveal, Visit to Kuching Food Festival Day 1, and New Kids Playground at Boulevard.
- Additional multi-photo public test feeds were added for a five-photo Waterfront loop and a six-photo Kopitiam breakfast note so the `/kch` collage and `+N` overlay states can be tested.
- The multi-photo public test feeds now use external food/scenery sample photos instead of word-only placeholder images.
- Every published seed feed now has at least one photo, and older word-only placeholder seed photos have been replaced with external sample image URLs.
- Two long-description public seed feeds were added so the `/kch` two-line preview and inline `more` link can be tested reliably.
- The `/kch` public feed now uses a compact header instead of a large hero and adapts feed cards between visual-first local discovery posts and information-first announcement posts.
- The `/kch` page now shows feed items immediately after the city header. Feed cards use a social-feed order: title, muted place/date, a two-line description preview with inline `more` only when truncated, the photo gallery, then a clear subtle divider with breathing room before the next post.
- Public feed photo blocks now keep roughly the same large footprint for single and multi-photo feeds, including seeded placeholder image URLs, avoiding tiny thumbnail previews on mobile.

UI and data-helper wiring for the new `channels`, `feed_sources`, `source_screenshots`, and `feed_schedules` workflows is not implemented yet.

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
