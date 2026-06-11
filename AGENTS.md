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

History records are standalone archive records.

History records are not feeds and must not be stored in the feeds table.

History photos reuse the existing photos table through `history_photos`.

## Required Public Routes

Route proposals for V2:

- `/` redirects to `/kch`
- `/kch` shows a discovery-style mixed feed
- `/feed/[slug]` shows feed detail
- `/photo/[photoId]` shows a single public photo page
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
- Public history discovery features during History Phase 1
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
- When the user asks for a project change, deploy after making and verifying the change unless the user explicitly says not to deploy.

## Current Implementation State

V2 Phase 1 Steps 1-5 are implemented:

- Project reset away from old V1 Photo/Event-first code.
- Database migration for `places`, `feeds`, and `photos`.
- TypeScript types and simple data helpers.
- Public routes for `/`, `/kch`, `/feed/[slug]`, `/photo/[photoId]`, and `/place/[slug]`.
- `/` and `/kch` are temporarily protected by a lightweight public password lock while content is being prepared. Public lock settings live in `lib/public-lock.ts`; disable by setting `LOCK_USER_PAGE` to `false` and redeploying.
- Minimal admin UI protected by `ADMIN_PASSWORD`.
- Mobile-first admin workflow is split into `/admin/feeds/new`, `/admin/feeds/drafts`, and `/admin/feeds/published`.
- The `/admin` workflow hub shows counts for Drafted Feeds, Published Feeds, and Sources.
- The `/admin` workflow hub also links to History.
- `/admin/history`, `/admin/history/new`, `/admin/history/[historyId]`, and `/admin/history/import` support Phase 1 standalone history record management.
- `/admin/history/export` exports draft history records for research as `aroundcities_history_research_export_v1`, defaulting to exclude records tagged `research:done`.
- History records are stored in `history_records`, and history-photo links are stored in `history_photos`.
- History JSON import uses `aroundcities_history_import_v1`, validates month/day/confidence, and always creates draft records.
- History update import uses `aroundcities_history_update_v1`, updates existing records by `history_id`, never creates records, preserves existing tags, and adds `research:done` after successful updates.
- History records can link existing feed photos using a client-side feed-title picker.
- History-only uploads use browser image compression, Supabase Storage, normal `photos` rows, and an archived feed used only as a photo container.
- Do not integrate History into `/kch`, create Story Of The Day, generate feeds from history records, add history recommendation/search/analytics, or build related-content features during History Phase 1.
- `/admin/stats` shows feed and photo click counts sorted from highest to lowest.
- Photo-first draft creation for feeds asks only for photos, title, and description, then returns to Drafted Feeds.
- Event JSON import is available from `/admin/feeds/import-events`; it previews `aroundcities_event_import_v2` JSON, keeps v1 JSON compatible, and saves imported items as draft event observation feeds without photos or screenshot uploads.
- Event imports and feed saves keep titles timeless by stripping dynamic prefixes such as `Happening Today:`; public timing labels are computed from schedules.
- Optional structured event details are stored on `feed_event_details` as support metadata attached to Feed, not as a separate Event entity.
- Public feed detail pages should keep structured event detail labels hidden for now, while still showing dynamic timing labels and Source/Channel links when available.
- Feed editing starts compact with title, description, photo thumbnails, Add Section, save/publish/archive/delete controls.
- Feed editor photo uploads open from an Add Photos overlay; keep the main editor thumbnail-first.
- Photos use `photos.sequence` for display order. Smaller positive sequence numbers appear first; unsequenced `0` photos fall behind manually ordered photos.
- Admin feed thumbnails should use the first photo by sequence, not the featured flag.
- Photo `featured` is now a multi-photo curator flag surfaced as `Show as photo feed`; marked photos may appear as standalone Photo feed cards on `/kch`.
- Public feed clicks increment `feeds.click_count`; public photo clicks increment `photos.click_count`.
- Standalone Photo feed cards should open the original feed from the title and the single-photo page from the image.
- Uploaded photos must not be auto-marked as `Show as photo feed`; this is a manual admin choice only.
- Photo uploads extract JPEG EXIF capture datetime, longitude, and latitude when available.
- Feed photo editing shows capture datetime, longitude, latitude, and an Open Map button when coordinates exist.
- Feed photo editing lets the curator open the full-size image from the preview and delete a photo with confirmation.
- Photo-specific Place and Location name fields are hidden in admin photo editing; leave the underlying database columns untouched for now.
- Optional Sources, Places, Schedules, and Parent Feed sections appear only after the curator adds them or when existing data is present.
- Places are no longer promoted as a main admin navigation item.
- `/admin/places` remains available as a direct maintenance route.
- Inline place creation is available from the feed editor.
- Feed linked places are managed with a searchable add/remove picker, not a full checkbox list.
- Multiple feed places supported in code through the proposed `feed_places` migration.
- Structured operating hours supported through `feed_operating_hours`.
- Feed delete support from the edit page with confirmation.
- Blocking admin form loading states for save, publish, upload, photo update, and delete actions.
- Inline admin action errors when feed/place/photo writes fail.
- `/admin/sources` is available as a simple manual curator checklist. It defaults to Pending, showing sources never checked or not checked in the past 3 days; a dropdown `Show all` view reveals the full list.
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
- `supabase/migrations/20260605010000_update_seed_feed_discovery_dates.sql` staggers seeded `published_at` values so recent, weekly, latest fallback, and older rediscovery feed ordering can be tested.
- `supabase/migrations/20260605011000_seed_100_discovery_timeframe_feeds.sql` adds 100 published test feeds across varied timeframes for stress-testing `/kch` discovery ordering.
- `supabase/migrations/20260605012000_remove_seed_test_data.sql` removes rows marked with the seed audit marker after test-data review.
- `supabase/migrations/20260606001000_add_feed_photo_click_counts.sql` adds feed/photo click counters and atomic increment functions.
- `supabase/migrations/20260606002000_keep_click_counts_from_touching_updated_at.sql` keeps click counter increments from changing edit timestamps.
- Live Supabase seed/test data has been deleted and verified: 0 seed-marked rows remain and there are currently 0 published feeds.
- Public `/kch` should stay compact and feed-first. Avoid large formal hero sections, official listing tone, and category-heavy card layouts.
- Public `/kch` ordering should feel like discovery, not a strict latest-first timeline: randomized recent slots first, latest fallback near slot 6, then latest remaining feeds with occasional older rediscovery when available.
- Feed cards should feel like relaxed local notes. Use simple display heuristics for visual-first versus information-first feeds; do not add a complex feed type system unless explicitly requested.
- Current public feed cards should show title, muted `Author · Relative Time`, a maximum two-line description with inline `more` only when truncated, then the photo block and a clear subtle divider. Inline `more` expands the full description on the card; only the separate `More details` link navigates. Do not render a place row, pin icon, or footer actions below the gallery. Any attached photos should render as a full-width social-feed image block.
- Scheduled event observation feeds should drop out of public `/kch` after their schedule expires. If a schedule has `start_time` but no `end_time`, infer a 1-hour duration; date-only schedules stay visible for that day without showing `Happening Now`.
- Non-expired event observation feeds scheduled for today should appear in the first one to three `/kch` feed slots, ordered by earliest schedule time, before ordinary visit/photo-style discovery posts.
- Multi-photo feed grids should feel like one substantial content block, not tiny thumbnails. Keep the 2-photo, 3-photo, and 4+ photo layouts visually close to the single-photo block size.
- The schema-extension tables for feed sources, source screenshots, feed schedules, event details, parent feeds, and feed-place metadata are wired into the admin editor as optional refinement sections.

Supabase Auth, search, maps, tags UI, and multiple cities are not implemented yet.

## Admin Workflow Guidance

Feed creation should be photo-first and draft-first:

- Ask only for title, content/description, and photos during creation.
- Hide feed type, slug, tags, source URL, place, status, and published time during creation.
- Route new draft capture through `/admin/feeds/new`, draft management through `/admin/feeds/drafts`, and live feed management through `/admin/feeds/published`.
- Keep admin mobile-first. Avoid tables and desktop-heavy CMS screens.
- Only show required fields first. Optional editor sections should appear only after the curator selects `Add Section` or when saved data already exists.
- Treat operating hours as optional feed-level free text, not a full calendar or directory-hours system.
- Use `feeds.operating_hours` for public wording and `feed_operating_hours` for queryable schedule rows.
- Use the edit page for post-processing.
- Keep place assignment human-controlled only.
- Keep Places out of the main admin workflow; treat place routes as maintenance tools.
- Create missing places inline or nearby while editing a feed/photo.
- Use a searchable add/remove picker for feed linked places; do not render every place as a checkbox in the editor.
- Do not add GPS-to-place automation or reverse geocoding.
- Keep `feed_type` hidden/defaulted unless the user explicitly reintroduces it as a curator-facing field.
- Treat `feeds.place_id` as the optional primary place and `feed_places` as the multiple-place path once its migration is applied.
- Keep destructive actions visually separated and confirm before deleting.
- Keep admin submit buttons visibly pending and disabled while server actions run.
- Do not redirect as if successful when feed creation, photo upload, or other admin writes fail.
- Admin photo uploads should use the server-side service-role Supabase client, not the public anon client.
- Error logs should avoid secrets and use minimal context such as action area, feed ID, or photo ID.
- New feed photo uploads should use signed Supabase Storage upload URLs so large photos do not pass through Vercel Server Action request bodies.
- Event JSON imports must force draft status, create no photos, upload no screenshots, and preserve the pasted textarea content when preview validation fails.
- Event JSON import should reset the textarea and preview after a fully successful save, while preserving pasted content for validation or per-event save errors.
- Event JSON imports may include optional `event_details`; save it to `feed_event_details` and keep imported descriptions as curator/editorial wording without forcing an official tone.
- Keep the feed edit page compact by showing optional feed fields only after the curator explicitly selects them.
- Keep feed photo editing thumbnail-first; open one photo-specific editor at a time instead of listing every photo edit form inline.
- Keep photo deletion confirmed and visually separated from ordinary save controls.
- Keep photo order numeric and curator-controlled through `photos.sequence`; do not let `featured` override sequence ordering for public galleries or admin thumbnails.
- Allow multiple photos per feed to be marked for Photo feed cards. Do not reintroduce a one-featured-photo-per-feed clearing workflow.
- Keep feed/photo click tracking lightweight and non-blocking for public navigation.
- Do not auto-select Photo feed candidates during upload. The curator should mark them manually in the photo editor.
- Keep photo metadata as curator reference only. Extract EXIF captured datetime/GPS when available, but do not use it to assign places automatically.
- Use a searchable modal/picker for parent feed selection; do not use a huge plain dropdown.
- Use the optional Event Details section only for event feeds that need structured details: entry type, registration type, public/ticket/lucky-draw flags, dress code, organizer, and event notes.
- Archive published feeds by setting status to `archived`; archived feeds remain in the database and stay hidden from public `/kch`.
- Source evidence is feed-specific and admin-only. Source screenshots are saved as URL records after the admin picker uploads the selected image to Supabase Storage.
- Feed source evidence screenshots should use the admin picker/upload flow, not manual URL entry: compress the selected image client-side, upload it to Supabase Storage, and save the generated URL in `source_screenshots`.
- Keep Sources manual-only: opening a source must not mark it checked, and marking checked should happen only when the curator clicks `Mark Checked`.
- Keep `/admin/sources` defaulted to the Pending filter so daily review focuses on sources that are stale or never checked.
- Do not add source crawling, scraping, bot browsing, scheduled checking, Facebook login, priority, or frequency fields unless the user explicitly expands scope.
