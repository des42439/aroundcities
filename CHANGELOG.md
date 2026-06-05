# Changelog

All notable changes to AroundCities should be documented here.

## 2026-06-05

### Added

- Added mobile-first admin workflow sections for `New Feed`, `Drafted Feeds`, and `Published Feeds`.
- Added `/admin/feeds/drafts` and `/admin/feeds/published` with thumbnail-first mobile lists.
- Added a compact feed editor that starts with title, description, photo thumbnails, save/publish/delete controls, and reveals optional Sources, Places, Schedules, and Parent Feed sections only after the curator adds them.
- Added admin UI/actions for feed source evidence rows, source screenshot URL evidence, simple feed schedule rows, parent feed selection, and published feed archiving.
- Added `20260605_schema_review_erd.md` reviewing the final table design against the final V2 feed use cases.
- Added an ERD covering feeds, photos, places, feed places, schedules, channels, feed sources, and source screenshots.
- Added `supabase/migrations/20260605000000_v2_use_case_schema_extensions.sql` as an additive migration script for parent feeds, source evidence, schedule windows, feed-place metadata, photo ordering, photo coordinates, and audit fields.
- Added `supabase/migrations/20260605001000_enable_v2_rls_policies.sql` to enable RLS for V2 app tables with anonymous read access limited to published public feed content.
- Added `supabase/migrations/20260605002000_add_remaining_audit_fields.sql` so older support tables also have created/updated audit user fields.
- Added `supabase/migrations/20260605003000_seed_phase3_test_data.sql` with Phase 3 sample records for DIY Sape Competition, Kuching Food Festival, Kuching Got Talent, Kuching Marathon, Registration Period, Food Sharing, Waterfront Walk, Seasonal Greeting, and Featured Photo.
- Added `supabase/migrations/20260605004000_seed_more_public_feed_styles.sql` with additional public browsing seed data for Singing Competition at The Spring, Kuching Marathon Route / Jersey Reveal, Kuching Food Festival Day 1 visit, and New Kids Playground at Boulevard.
- Added `supabase/migrations/20260605012000_remove_seed_test_data.sql` to remove rows marked with the seed audit marker after test-data review.
- Generated raw Supabase TypeScript schema types in `types/supabase.generated.ts`.

### Notes

- The Phase 2 database migrations were applied to the linked Supabase project `fblhoxcdfnxnqzmuczkx`.
- The Phase 3 seed migration was applied to the linked Supabase project and verified with 9 seeded feeds, 7 places, 9 photos, 9 feed-place links, 7 schedule rows, 5 feed sources, and 5 source screenshots.
- Seed/test rows were later removed from the linked Supabase project; verification showed 0 seed-marked rows and 0 published feeds remaining.
- The new admin source evidence field currently accepts screenshot URLs as private evidence records; direct private screenshot file upload can be added later if needed.

### Changed

- Typed Supabase clients with the generated schema and switched server-side data helpers to the service-role client so admin draft/source operations continue to work after RLS is enabled.
- Updated app-facing database types for parent feeds, source evidence, channels, source screenshots, feed schedules, audit fields, feed-place metadata, and photo ordering/coordinates.
- Reduced the public `/kch` homepage intro from a large hero into a compact feed header so feed content appears sooner.
- Changed feed cards to feel more like local discovery notes, with shorter previews, softer metadata, a "See more" link, and different visual treatment for visual-first versus information-first posts.
- Removed the remaining `/kch` feed heading section so feed items appear immediately after the city header.
- Changed public feed cards so text comes first, followed by full-width photo displays or multi-photo grids for every attached photo set.
- Refined public feed photo grids so single-photo and multi-photo cards use a similarly large visual block: 2 photos side-by-side, 3 photos with one large image plus two stacked images, and 4+ photos as a 2x2 grid with a `+N` overlay when needed.
- Removed the small public placeholder thumbnail treatment from `/kch` feed cards so seeded placeholder URLs also occupy the full feed image block.
- Added `supabase/migrations/20260605005000_seed_multi_photo_feed_examples.sql` with two published public test feeds containing five and six photos for collage and `+N` overlay testing.
- Changed the public feed listing order to place/date, title, photo block, two-line description, "See more", then divider.
- Changed homepage feed cards to keep description text above the photo gallery and render inline `See more` only when the description exceeds two displayed lines.
- Added `supabase/migrations/20260605006000_update_multi_photo_seed_image_urls.sql` to replace the multi-photo test feeds' text-only placeholder images with external food/scenery sample photos.
- Added `supabase/migrations/20260605007000_seed_real_sample_images_for_all_public_feeds.sql` so every published seed feed has at least one photo and older word-only placeholders use external sample images.
- Refined `/kch` feed cards into a clearer social-feed order: title, muted place/date, two-line description with inline `more`, photo gallery, small footer link, then the divider.
- Added `supabase/migrations/20260605008000_seed_long_description_feed_examples.sql` with two published long-description feeds for testing the inline `more` link on `/kch`.
- Removed the `/kch` feed footer action row and made the post divider brighter, thicker, and roomier so one post ends clearly before the next begins.
- Added `supabase/migrations/20260605009000_update_seed_feed_public_metadata.sql` to normalize seeded feed authors, created timestamps, and missing places for public metadata testing.
- Changed `/kch` feed metadata to show `Author · Relative Time`, with place shown as a small line below the photo gallery.
- Added `supabase/migrations/20260605010000_update_seed_feed_discovery_dates.sql` to stagger seeded `published_at` values for testing discovery ordering.
- Changed `/kch` from strict latest-first ordering to a discovery-style mixed feed with randomized recent slots, a latest fallback slot, chronological remaining posts, and optional older rediscovery inserts.
- Added `supabase/migrations/20260605011000_seed_100_discovery_timeframe_feeds.sql` with 100 published test feeds across varied timeframes for stress-testing `/kch` discovery ordering.
- Removed the place row and pin icon from public feed listing cards while keeping place data available on feed and place detail pages.
- Changed new feed creation to return to `/admin/feeds/drafts` after successful draft capture.
- Changed `/admin/feeds` into a simple mobile workflow hub instead of an all-feeds management list.
- Changed published feed management so `Archive` sets status to `archived`, leaving rows in the database and hiding them from public `/kch`.
- Changed feed photo management so the main editor shows compact thumbnails first, with add-photo upload and photo-detail editing opened from mobile-friendly overlays.

## 2026-06-04

### Added

- Added and then removed a temporary `codex_dummy_schema_test` database table via Supabase CLI migrations to verify schema-change access.
- Added a simple `/admin/sources` section for manually tracking useful Facebook pages, groups, and websites to check for possible AroundCities content.
- Added a `sources` table migration with name, URL, notes, last checked timestamp, and timestamps.
- Added Source TypeScript types, data helpers, create/edit/delete actions, and a manual "Mark Checked" action sorted by never checked first, then oldest checked first.
- Added inline admin errors and pending states for source create, update, delete, and mark checked actions.
- Changed Sources admin flow so `/admin/sources` focuses on the checklist list, with source creation moved to `/admin/sources/new`.
- Added Sources to the main admin landing panel for consistency with the top admin navigation.

### Notes

- Sources is a manual curator checklist only. It does not add Facebook automation, scraping, crawling, scheduled checking, priority, or frequency logic.

## 2026-06-03

### Added

- Added `V2_ARCHITECTURE.md` with the AroundCities V2 Phase 1 greenfield architecture, database schema proposal, route proposal, admin workflow proposal, public UI proposal, and implementation roadmap.
- Added V2 Phase 1 database migration for `places`, `feeds`, and `photos`.
- Added `feed_type`, `slug`, `source_url`, and simple `tags text[]` support on feeds.
- Added optional `place_id` support on photos.
- Added TypeScript database types for the V2 foundation schema.
- Added simple data helpers for feeds, places, and photos.
- Added public `/kch` latest feed page.
- Added public `/feed/[slug]` feed detail page.
- Added public `/place/[slug]` place detail page.
- Added shared public shell and feed card components.
- Added public formatting helpers for dates, feed type labels, content previews, and featured photo selection.
- Added password-protected `/admin` routes using `ADMIN_PASSWORD`.
- Added `/admin/login` for the simple Phase 1 admin password flow.
- Added feed list/create/edit admin pages.
- Added place list/create/edit admin pages.
- Added photo upload and attached-photo editing inside the feed editor.
- Added featured-photo handling that clears other featured photos in the same feed.
- Added photo-first feed creation that saves a draft with title, content, and multiple uploaded photos.
- Added `feed_places` migration SQL and helper code for multiple human-assigned places per feed.
- Hid feed type from feed creation and kept it internally defaulted.
- Moved slug, tags, source URL, place assignment, and publishing into feed post-processing.
- Added delete feed support on the feed edit page with confirmation.
- Added admin form loading/progress states for save, publish, upload, photo update, and delete actions.
- Added inline place creation from the feed editor.
- Added blocking admin submit overlays and inline error messages for failed admin actions.
- Changed new feed draft creation so insert/upload failures no longer redirect as if the save succeeded.
- Added a Supabase Storage migration for the public `photos` bucket.
- Switched admin photo uploads to the server-side service-role Supabase client.
- Added durable admin error logging with Error IDs, Supabase persistence, server console output, browser console output, and local JSONL fallback logs.
- Added admin photo upload size checks and raised the Server Action body limit to reduce opaque upload failure pages.
- Changed new feed creation to upload selected photos directly to Supabase Storage through signed upload URLs instead of sending files through a Server Action body.
- Added browser-side image compression for new feed photos, targeting less than 1MB per uploaded image.
- Changed new feed creation to return to the feed list after save.
- Added photo thumbnails to the admin feed list.
- Changed the feed edit page so optional fields are added through a field picker instead of expanding every advanced field at once.
- Changed feed photo editing to a thumbnail grid with one photo editor modal at a time, avoiding long inline photo forms on feeds with many photos.
- Added feed-level operating hours / schedule support as flexible free text for shops, clinics, festivals, and other time-bound local posts.
- Added structured `feed_operating_hours` support for queryable feed schedules tied back to feeds.
- Added `AGENTS.md` as the agent working guide for product direction, engineering preferences, current architecture, and documentation maintenance.
- Added `PROJECT_SUMMARY.md` with the current V2 direction, Phase 1 scope, planned routes, admin direction, and architecture source.
- Added `CHANGELOG.md` to track future project changes.
- Added Kuching local date/time beside the city title in the public city header.

### Changed

- Updated project direction to treat AroundCities V2 as a greenfield rebuild.
- Updated planning docs to stop preserving the old Photo/Event-first architecture.
- Reduced Phase 1 foundation scope to three core entities: Feed, Photo, and Place.
- Reset the active app foundation by removing old V1 public/admin routes, V1 components, and V1 Photo/Event helpers.
- Updated metadata and sitemap to remove old photo/event assumptions.
- Removed unused V1 photo upload dependencies and external Google font loading so the foundation builds cleanly without network access.
- Updated the sitemap to include `/kch`.
- Removed Places from the main admin navigation and dashboard while keeping place routes available directly as maintenance routes.

### Notes

- Supabase Auth, search, maps, tags UI, and multiple cities are not implemented yet.
- Place assignment remains human-controlled only; no GPS automation, reverse geocoding, or map-based location assignment was added.
- The `feed_places` migration was created for review and was not run by Codex.
