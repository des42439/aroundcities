# AroundCities Agent Guide

This file is the working guide for agents helping with AroundCities.

## Current Direction

AroundCities V2 is a greenfield rebuild.

The previous version has been archived and backed up. Do not preserve the old architecture, do not maintain backward compatibility, and do not extend the old Photo/Event-first implementation unless the user explicitly pauses the V2 rebuild.

## Product Vision

AroundCities is an independent local media platform focused on Kuching.

The primary question it answers is:

> What is happening around Kuching?

AroundCities is not:

- An event portal
- A tourism website
- A business directory
- A social network

AroundCities is curator-driven. It should feel like an independent local media feed, not an official information source.

## Phase 1 Scope

Build only the minimum foundation.

Core entities:

- Feed
- Photo
- Place

Do not introduce other entities unless absolutely required.

## Core Model

Feed represents a story or post.

Examples:

- Photo walk
- Food visit
- Event observation
- Local discovery

Photo represents an asset attached to a feed. A feed can contain multiple photos.

Place represents a location. A place can be linked to many feeds.

## Required Public Routes

Route proposals for V2:

- `/` redirects to `/kch`
- `/kch` shows the latest feed
- `/feed/[slug]` shows feed detail
- `/place/[slug]` shows place detail

Do not implement advanced features during Phase 1.

## Admin Direction

Admin should be optimized for a single curator.

Prefer a simple workflow:

- Create a draft feed from title, content, and photos
- Post-process slug, tags, source, places, and publishing later
- Add operating hours / schedule during post-processing when a feed needs it
- Keep a manual Sources checklist for useful Facebook pages/groups/websites to review for content leads
- Create missing places inline while editing feeds/photos
- Attach or edit photos inside the feed editor

Do not build complex management systems.

## Non-Goals

Do not introduce:

- Comments
- Likes
- Followers
- Messaging
- Ratings
- Reviews
- Social profiles
- Public contributor accounts
- Business directory workflows
- Event-portal complexity
- Source crawling, scraping, scheduled checking, Facebook automation, priority, or frequency systems

## Documentation Maintenance

Whenever making project changes:

- Update `CHANGELOG.md` for user-facing, admin, data, route, architecture, deployment, or behavior changes.
- Update `PROJECT_SUMMARY.md` when the current direction, architecture, known issues, or next steps change.
- Update `AGENTS.md` when product direction, working rules, or agent guidance changes.
- Update `V2_ARCHITECTURE.md` when the V2 foundation plan changes.

Keep documentation practical and current.

## Engineering Preferences

- Keep architecture simple.
- Prefer visible user-facing value.
- Avoid future social-network assumptions.
- Minimize recurring costs and external APIs.
- Do not preserve old implementation patterns by default.
- Do not add compatibility layers unless explicitly requested.
- Avoid unrelated refactors.
- Do not revert user changes unless explicitly asked.

## Current Implementation State

V2 Phase 1 Steps 1-5 are implemented:

- Project reset away from old V1 Photo/Event-first code.
- Database migration for `places`, `feeds`, and `photos`.
- TypeScript types and simple data helpers.
- Public routes for `/`, `/kch`, `/feed/[slug]`, and `/place/[slug]`.
- Minimal admin UI protected by `ADMIN_PASSWORD`.
- Photo-first draft creation for feeds.
- Places are no longer promoted as a main admin navigation item.
- `/admin/places` remains available as a direct maintenance route.
- Inline place creation is available from the feed editor.
- Multiple feed places supported in code through the proposed `feed_places` migration.
- Structured operating hours supported through `feed_operating_hours`.
- Feed delete support from the edit page with confirmation.
- Blocking admin form loading states for save, publish, upload, photo update, and delete actions.
- Inline admin action errors when feed/place/photo writes fail.
- `/admin/sources` is available as a simple manual curator checklist sorted by never checked first, then oldest checked first.
- Source creation uses `/admin/sources/new`; keep the main Sources page focused on the checklist list.
- Supabase Storage `photos` bucket is required for feed photo uploads.
- Admin action failures should be logged with an Error ID for troubleshooting.
- `20260605_schema_review_erd.md` reviews the final table design against the final V2 feed use cases and includes an ERD.
- `supabase/migrations/20260605000000_v2_use_case_schema_extensions.sql` is an additive migration script for parent feeds, source evidence, source screenshots, flexible feed schedules, feed-place metadata, photo ordering/coordinates, and audit fields.
- `supabase/migrations/20260605001000_enable_v2_rls_policies.sql` enables RLS with anonymous reads limited to published public feed content and related rows.
- `supabase/migrations/20260605002000_add_remaining_audit_fields.sql` adds missing audit fields to older support tables.
- `supabase/migrations/20260605003000_seed_phase3_test_data.sql` seeds Phase 3 test data for the requested sample feeds and their related places, photos, schedules, sources, screenshots, and parent-child links.
- Phase 2 database migrations are applied on linked Supabase project `fblhoxcdfnxnqzmuczkx`, and raw generated schema types are stored in `types/supabase.generated.ts`.
- Phase 3 seed data is also applied and verified on linked Supabase project `fblhoxcdfnxnqzmuczkx`.
- `supabase/migrations/20260605004000_seed_more_public_feed_styles.sql` adds richer public feed examples for browsing different feed styles.
- `supabase/migrations/20260605005000_seed_multi_photo_feed_examples.sql` adds public test feeds with five and six photos for multi-photo collage testing.
- `supabase/migrations/20260605006000_update_multi_photo_seed_image_urls.sql` replaces those multi-photo test feed placeholders with external food/scenery sample image URLs.
- `supabase/migrations/20260605007000_seed_real_sample_images_for_all_public_feeds.sql` gives every published seed feed at least one photo and replaces older word-only placeholders with external sample image URLs.
- `supabase/migrations/20260605008000_seed_long_description_feed_examples.sql` adds two published long-description feeds for testing the inline `more` link on `/kch`.
- `supabase/migrations/20260605009000_update_seed_feed_public_metadata.sql` normalizes seeded feed authors, created timestamps, and missing places for public metadata testing.
- Public `/kch` should stay compact and feed-first. Avoid large formal hero sections, official listing tone, and category-heavy card layouts.
- Feed cards should feel like relaxed local notes. Use simple display heuristics for visual-first versus information-first feeds; do not add a complex feed type system unless explicitly requested.
- Current public feed cards should show title, muted `Author · Relative Time`, a maximum two-line description with inline "more" only when truncated, then the photo block, optional muted place line, and a clear subtle divider. Do not add footer actions below the gallery. Any attached photos should render as a full-width social-feed image block.
- Multi-photo feed grids should feel like one substantial content block, not tiny thumbnails. Keep the 2-photo, 3-photo, and 4+ photo layouts visually close to the single-photo block size.
- The new schema-extension tables and fields are not yet wired into the admin or public UI unless explicitly implemented later.

Supabase Auth, search, maps, tags UI, and multiple cities are not implemented yet.

## Admin Workflow Guidance

Feed creation should be photo-first and draft-first:

- Ask only for title, content/description, and photos during creation.
- Hide feed type, slug, tags, source URL, place, status, and published time during creation.
- Treat operating hours as optional feed-level free text, not a full calendar or directory-hours system.
- Use `feeds.operating_hours` for public wording and `feed_operating_hours` for queryable schedule rows.
- Use the edit page for post-processing.
- Keep place assignment human-controlled only.
- Keep Places out of the main admin workflow; treat place routes as maintenance tools.
- Create missing places inline or nearby while editing a feed/photo.
- Do not add GPS-to-place automation or reverse geocoding.
- Keep `feed_type` hidden/defaulted unless the user explicitly reintroduces it as a curator-facing field.
- Treat `feeds.place_id` as the optional primary place and `feed_places` as the multiple-place path once its migration is applied.
- Keep destructive actions visually separated and confirm before deleting.
- Keep admin submit buttons visibly pending and disabled while server actions run.
- Do not redirect as if successful when feed creation, photo upload, or other admin writes fail.
- Admin photo uploads should use the server-side service-role Supabase client, not the public anon client.
- Error logs should avoid secrets and use minimal context such as action area, feed ID, or photo ID.
- New feed photo uploads should use signed Supabase Storage upload URLs so large photos do not pass through Vercel Server Action request bodies.
- Keep the feed edit page compact by showing optional feed fields only after the curator explicitly selects them.
- Keep feed photo editing thumbnail-first; open one photo-specific editor at a time instead of listing every photo edit form inline.
- Keep Sources manual-only: opening a source must not mark it checked, and marking checked should happen only when the curator clicks `Mark Checked`.
- Do not add source crawling, scraping, bot browsing, scheduled checking, Facebook login, priority, or frequency fields unless the user explicitly expands scope.
