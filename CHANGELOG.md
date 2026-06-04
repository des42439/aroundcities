# Changelog

All notable changes to AroundCities should be documented here.

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
