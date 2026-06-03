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

- Admin UI, authentication, search, maps, tags UI, and multiple cities are not implemented yet.
