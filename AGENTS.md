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

- Create or edit a place
- Create a feed
- Attach photos to the feed
- Publish or draft the feed

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

V2 Phase 1 Steps 1-4 are implemented:

- Project reset away from old V1 Photo/Event-first code.
- Database migration for `places`, `feeds`, and `photos`.
- TypeScript types and simple data helpers.
- Public routes for `/`, `/kch`, `/feed/[slug]`, and `/place/[slug]`.

Admin UI, authentication, search, maps, tags UI, and multiple cities are not implemented yet.
