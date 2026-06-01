# AroundCities Project Context (June 2026)

## Project Overview

AroundCities is a personal city-photography website focused on Kuching (currently `/kch`).

Tech stack:

* Next.js App Router
* TypeScript
* Tailwind CSS
* Supabase (Database + Storage)
* Vercel deployment
* Domain: aroundcities.my

Goal:

* Showcase authentic city photos and local scenes.
* Focus on storytelling through photos.
* Minimal admin workflow.
* Auto-extract as much information as possible from uploaded photos.

---

# Current Database Design

## photos table

Key columns:

```sql
photo_id uuid primary key

photo_url text

title text
description text
location text

latitude double precision
longitude double precision

captured_date timestamptz

captured_by text

status text
photo_type text

created_at timestamptz
updated_at timestamptz
```

Important:

* `captured_date` is now TIMESTAMPTZ (stores date + time).
* No separate morning/afternoon/evening column.
* Future time-of-day logic should derive automatically from `captured_date`.

Example:

```ts
const hour =
  new Date(photo.captured_date).getHours();
```

---

# Photo Upload System

Current status:

## EXIF extraction working

Auto extracts:

* Capture date/time
* GPS coordinates

Current behavior:

* Reads EXIF from uploaded image.

* Stores GPS into:

  * latitude
  * longitude

* Stores timestamp into:

  * captured_date

---

## Location handling

Current approach:

* No Google Maps API.
* No OpenStreetMap API.
* No reverse geocoding.

If EXIF contains only coordinates:

```text
latitude
longitude
```

Store coordinates only.

Location name can be entered manually later.

Reason:

* Keep costs at zero.
* Avoid external API dependency.

---

# Homepage (/kch)

Current status:

## Hero Photo

Implemented.

Homepage now displays:

```text
Greeting
Hero Photo
Hero Title
Hero Description

Latest Photos
```

Hero photo comes from:

```ts
getRandomAtmospherePhoto()
```

from:

```text
lib/homepage.ts
```

---

## Random Photo Display

Implemented.

Homepage photo grid:

```ts
.sort(() => Math.random() - 0.5)
```

Photos appear in different order on refresh.

---

## Multiple Photos

Implemented.

Previously showed very few photos.

Now:

```ts
const MAX_PHOTOS = 20;
```

and displays many photos.

---

# Photo Pages

Implemented.

Route:

```text
/photo/[photoId]
```

Features:

* Full-size image
* Title
* Description
* Location
* Capture date
* Capture by
* GPS coordinates
* Back to Kuching

---

# Previous / Next Navigation

Implemented.

File:

```text
lib/photos.ts
```

Contains:

```ts
getPhotoNavigation()
```

Photo pages now support:

```text
← Previous Photo

Back to Kuching

Next Photo →
```

---

# Discoverability Improvements

Implemented.

## robots.txt

File:

```text
app/robots.ts
```

---

## sitemap.xml

File:

```text
app/sitemap.ts
```

Includes:

```text
/
/kch
/photo/<uuid>
```

generated from active photos.

---

## Global Metadata

Improved in:

```text
app/layout.tsx
```

Includes:

* metadataBase
* OpenGraph
* Twitter metadata
* robots configuration

---

# Important Architectural Decisions

## Decision: No manual Morning/Afternoon/Evening tags

Rejected approach:

```sql
display_period
```

Reason:

* Manual data entry.
* Easy to make mistakes.

Accepted approach:

Use:

```ts
captured_date
```

to derive:

```text
Morning
Afternoon
Evening
Night
```

automatically.

---

## Decision: No location APIs

Rejected:

* Google Maps API
* OpenStreetMap reverse geocoding

Reason:

* Cost
* Dependency
* Complexity

Current approach:

* Store GPS coordinates.
* Manually edit location if needed.

---

## Decision: UUID Photo URLs

Current route:

```text
/photo/<uuid>
```

Accepted.

Reason:

* Simple.
* No slug column needed.
* Can add slugs later if desired.

---

# Known Future Ideas

## High Priority

### Dynamic Photo Metadata

Current photo pages still use mostly global metadata.

Future:

```text
Photo Title | AroundCities
```

instead of generic:

```text
AroundCities
```

---

### Time-aware Homepage

Using:

```ts
captured_date
```

prioritize photos matching current time.

Example:

```text
8am
→ Morning photos

3pm
→ Afternoon photos

8pm
→ Evening photos
```

No new database columns required.

---

### Better Photo Layout

Current homepage uses fixed grid.

Possible future improvement:

* Masonry layout
* Pinterest-style layout
* Better handling of portrait photos

---

## Lower Priority

### Map View

Only consider after:

```text
50+
100+
photos
```

Uses existing:

```text
latitude
longitude
```

data.

---

# User Preferences For This Project

Very important:

* Prefer complete files, not snippets.
* Prefer copy-paste-ready TypeScript.
* Avoid partial edits.
* Minimize external APIs.
* Minimize recurring costs.
* Keep architecture simple.
* Prefer practical improvements over theoretical improvements.
* Focus on visible user-facing value first.
* When proposing changes, identify the single highest-value next step rather than offering many options.

---

# Current Project Status

Completed:

✅ Photo uploads

✅ EXIF timestamp extraction

✅ GPS extraction

✅ Hero photo

✅ Random homepage photos

✅ Multiple homepage photos

✅ Photo detail pages

✅ Previous/Next navigation

✅ Sitemap

✅ Robots.txt

✅ Global metadata improvements

Next likely focus:

1. Dynamic metadata for photo pages
2. Time-aware homepage photo prioritization
3. Better photo gallery layout
4. Map view (much later)
