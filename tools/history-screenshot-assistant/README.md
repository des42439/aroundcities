# History Screenshot Assistant

Standalone internal CLI for capturing evidence screenshots for reviewed History sources.

This is not an admin page, public page, background job, or deploy-time automation. Run it manually from a terminal when researched History records are ready for screenshot capture.

## What It Does

1. Queries Supabase for eligible `history_sources`.
2. Opens each `source_url` in headless Chromium through Playwright.
3. Captures a full-page screenshot.
4. Optimizes the screenshot to JPEG with `sharp`.
5. Uploads it to the existing Supabase Storage `photos` bucket.
6. Saves the public screenshot URL on `history_sources.source_screenshot_url`.
7. Sets `history_sources.screenshot_status` to `completed`.
8. Marks failed captures as `failed` with `screenshot_error`.
9. Moves parent `history_records.status` from `researched` to `pending_review` when all reviewed sources have screenshots.

## Required Environment

The tool reads the same environment variables used by AroundCities:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

It loads `.env` and `.env.local` from the repo root when run through the root npm script.

Optional environment variables:

- `HISTORY_SCREENSHOT_BUCKET`, default `photos`
- `HISTORY_SCREENSHOT_TIMEOUT_MS`, default `30000`
- `HISTORY_SCREENSHOT_MAX_WIDTH`, default `1600`

## Install

From the repo root:

```bash
npm install --prefix tools/history-screenshot-assistant
npx --prefix tools/history-screenshot-assistant playwright install chromium
```

## Run

From the repo root:

```bash
npm run history:screenshot
```

Useful options:

```bash
npm run history:screenshot -- --dry-run
npm run history:screenshot -- --limit 5
npm run history:screenshot -- --history-id <uuid>
npm run history:screenshot -- --force
```

`--dry-run` lists eligible sources without opening pages, uploading screenshots, or updating Supabase.

`--force` allows recapturing sources even when `source_screenshot_url` already exists. Without `--force`, the tool only processes sources with no screenshot URL and `screenshot_status` of `pending` or `failed`.

## Source Eligibility

The default query only processes sources where:

- Parent `history_records.status = researched`
- `history_sources.source_status = reviewed`
- `history_sources.source_screenshot_url is null`
- `history_sources.screenshot_status` is `pending` or `failed`

The tool does not process pending or rejected sources.

## Status Updates

On success, the tool updates `history_sources`:

- `source_screenshot_url = uploaded public URL`
- `screenshot_status = completed`
- `screenshot_error = null`
- `updated_at = now`

On failure, the tool updates `history_sources`:

- `screenshot_status = failed`
- `screenshot_error = readable error`
- `updated_at = now`

It never changes:

- `source_status`
- `source_url`
- `source_title`
- `source_note`

It never publishes History records. It only moves `history_records.status` from `researched` to `pending_review` when all reviewed sources are satisfied. Published and archived records are ignored.

## Storage Path

Screenshots are uploaded to:

```text
history-sources/{history_id}/{history_source_id}.jpg
```

inside the configured bucket, defaulting to the existing `photos` bucket.

## Known Limitations

- Some websites block Playwright or headless browsers.
- Some pages require login.
- Some pages may show cookie banners or overlays.
- Full-page screenshots can be very tall.
- Very long pages may still produce files larger than 1MB after optimization.
- Failed captures are marked as failed and can be retried later.
