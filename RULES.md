# AroundCities Rules

This document is the shared source of truth for AroundCities UI behavior, workflow behavior, navigation behavior, import/export behavior, upload behavior, and future section consistency.

RULES.md is a long-term living document. Future AroundCities sections should follow these rules by default unless the user explicitly overrides them.

## Global Rules

- Consistency is preferred over inventing new UI patterns.
- If a page does not have specific requirements, follow the pattern already used elsewhere in AroundCities.
- New sections should reuse existing workflows whenever possible.
- RULES.md takes precedence for workflow and UI behavior.

## User Page Rules

### Feed Navigation

- Whenever a user clicks a feed and navigation is required, show a loading/progress bar immediately.
- The user must receive instant visual feedback that the click was accepted.
- While loading, user interaction should be blocked.

### Detail Page Behavior

- Feed detail should appear on top of the main page experience.
- Returning from detail should not reload the entire main page.
- Scroll position should be preserved.

### Return Navigation

Detail pages should contain:

- Return to Main Page button at the top.
- Return to Main Page button at the bottom.

### Photo Display

Multi-photo feed:

- Show all feed photos in the detail page.

Single-photo feed:

- Show only the single photo.
- Do not show the entire album.

### Sources

Only these content types should show sources:

- History
- Event
- Registration
- Other factual/reference-based content

Source section location:

- After description.
- Before photos.

### Loading

Any user action that requires waiting must show the global loading/progress indicator.

Examples:

- Navigation
- Feed opening
- Page transitions
- Data loading
- Future async actions

Loading should block additional interaction until complete.

## Admin CRUD Rules

Apply these rules to:

- Photos
- History
- Learninglets
- Positives
- Stories
- Greetings
- Events
- Registrations
- Future sections

### Main Page Layout

Main page should contain:

1. Create New button
2. Optional Import button
3. Optional Export button
4. Status filter
5. Search box
6. Item listing

### Create Button Naming

Default:

```text
Create New {Section Name}
```

Overrides are allowed.

Example:

```text
Photos -> Create New Album
```

### Status Filter

Each section should have a status dropdown.

Examples:

- Drafted
- Published
- Archived
- Daily Task
- Other section-specific statuses

### Search

- Search should filter items already loaded on the page.
- Do not query the database for every keypress.

### Listing Actions

Each item should contain:

```text
Edit
```

only.

Delete belongs inside the edit page.

### Edit Page

Edit page should contain:

- Save
- Publish

Behavior:

Save:

- Save changes only.
- Remain on current edit page.

Publish:

- Save changes.
- Change status to published.
- Redirect to section main page.

### Delete

Delete button:

- Always located at bottom of edit page.
- Visually separated from normal actions.
- Requires confirmation.

### Create Page

After successful creation:

- Redirect to section main page.

Do not remain on create page.

## Import Rules

- Import button should not exist unless explicitly requested.

Import page layout:

- Large JSON textarea
- Preview button

After preview:

- Show parsed items.
- Show Save button.

Save behavior:

- Insert records, or
- Update records,
- Depending on import type.

After successful save:

- Redirect to section main page.

Do not remain on import page.

Import page should support:

- New record imports
- Update imports

Typical workflow:

```text
Export -> Research/Edit -> Import back
```

## Export Rules

Export page should contain:

### Filter Dropdown

Examples:

- Daily Task
- Drafted
- Published
- Archived
- Show All
- Section-specific filters

### Maximum Items

Numeric textbox.

Rules:

```text
-1 = Unlimited
```

## Upload Rules

Applies to:

- Photos
- Source screenshots
- History screenshots
- Album covers
- Future image uploads

Requirements:

1. Extract metadata first.
2. Compress image afterward.
3. Target image size less than 1MB.
4. Upload to Supabase Storage.
5. Store only URL in database.
6. When image is deleted, also delete storage object when possible.

## Navigation Rules

All navigation requiring waiting should show loading feedback.

Examples:

- Menu navigation
- Opening records
- Returning from detail pages
- Import pages
- Export pages

## Loading Rules

Every loading action must use the shared global loading system.

No exceptions.

Examples:

- Navigation
- Save
- Publish
- Delete
- Import
- Export
- Upload
- Preview
- Database operations

Requirements:

- Show top loading/progress bar immediately.
- Block user interaction.
- Prevent duplicate clicks.
- Hide loading state only after operation completes.

## Future Section Rules

Any future section should follow RULES.md by default unless explicitly overridden.

Examples:

- History
- Learninglets
- Positives
- Stories
- Greetings
- Events
- Registrations
- Future content modules

## Exceptions

- Exceptions are allowed only when the user explicitly requests a different workflow or when a rule conflicts with a more specific product requirement.
- Document meaningful exceptions in the relevant project documentation when they affect future implementation.
- Do not treat existing inconsistent behavior as a new pattern unless the user confirms it should become standard.
