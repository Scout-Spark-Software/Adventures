# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scouts Adventures Platform - A SvelteKit application for scouts to discover, submit, and manage hiking trails and camping sites.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Type check with svelte-check
npm run lint         # Run prettier + eslint
npm run format       # Auto-format with prettier

# Database
npm run db:migrate   # Push schema changes to database (drizzle-kit push)
npm run db:generate  # Generate migration files
npm run db:studio    # Open Drizzle Studio GUI

# Admin utilities
npm run set-admin <user-id>  # Grant admin role to a user
npm run seed:hikes           # Seed hikes from CSV
npm run seed:camping         # Seed camping sites from CSV
```

## Architecture

### Tech Stack
- **Framework**: SvelteKit 2 with TypeScript
- **Database**: Neon Serverless PostgreSQL with Drizzle ORM
- **Auth**: WorkOS User Management (password auth with JWT sessions)
- **Storage**: Vercel Blob for file uploads
- **Styling**: Tailwind CSS with forms/typography plugins
- **Deployment**: Vercel (adapter-vercel)

### Key Directories
- `src/lib/db/schemas/` - Drizzle schema definitions (hikes, camping-sites, addresses, ratings, etc.)
- `src/lib/server/workos.ts` - WorkOS authentication wrapper
- `src/lib/auth/middleware.ts` - Auth guards: `requireAuth()`, `requireAdmin()`, `requireModerator()`
- `src/lib/storage/blob.ts` - Vercel Blob file upload utilities
- `src/lib/moderation.ts` - Content moderation queue helpers

### Data Model
Two main content types share common patterns:
- **Hikes**: Trails with difficulty, distance, duration, elevation, features
- **Camping Sites**: Sites with amenities, facilities, policies, costs

Both use:
- Linked `addresses` table for location data (lat/lng, city, state)
- `status` field for moderation workflow (pending → approved/rejected)
- `featured` boolean for homepage display
- `ratingAggregates` for cached ratings

### Authentication Flow
- Session tokens stored in httpOnly cookies (`workos_access_token`, `workos_refresh_token`)
- `hooks.server.ts` validates JWT and populates `event.locals.user`
- User roles: `admin`, `moderator`, `user`
- Protected routes use auth middleware from `$lib/auth/middleware.ts`

### API Pattern
REST endpoints in `src/routes/api/` follow SvelteKit conventions:
- `+server.ts` files export `GET`, `POST`, `PUT`, `DELETE` handlers
- Always join hikes/camping-sites with addresses table for location data
- New submissions go through moderation queue (status: "pending")

## Environment Variables

Required in `.env` (see `.env.example`):
- `DATABASE_URL` - Neon PostgreSQL connection string
- `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `WORKOS_ORGANIZATION_ID`, `WORKOS_COOKIE_PASSWORD` - Auth
- `VERCEL_BLOB_TOKEN` - File storage

## Conventions

- Schema files export type aliases: `type Hike = typeof hikes.$inferSelect`
- Components in `src/lib/components/` with subdirectories for domain-specific (hikes/, camping/, icons/)
- Form submissions create entities with `status: "pending"` and add to moderation queue
