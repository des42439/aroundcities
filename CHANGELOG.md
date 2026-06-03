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

### Notes

- Supabase Auth, search, maps, tags UI, and multiple cities are not implemented yet.
- Place assignment remains human-controlled only; no GPS automation, reverse geocoding, or map-based location assignment was added.
- The `feed_places` migration was created for review and was not run by Codex.
