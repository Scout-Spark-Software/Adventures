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
npm run check:watch  # Type check in watch mode
npm run lint         # Run prettier + eslint
npm run lint:fix     # Auto-fix lint issues
npm run format       # Auto-format with prettier

# Database
npm run db:migrate   # Push schema changes to database (drizzle-kit push)
npm run db:generate  # Generate migration files (drizzle-kit generate:pg)
npm run db:studio    # Open Drizzle Studio GUI
npm run migrate      # Run migration scripts via tsx

# Admin utilities
npm run set-admin <user-id>  # Grant admin role to a user
npm run seed:hikes           # Seed hikes from CSV
npm run seed:camping         # Seed camping sites from CSV
```

## Architecture

### Tech Stack

- **Framework**: SvelteKit 2 with TypeScript, Svelte 5
- **Database**: Neon Serverless PostgreSQL with Drizzle ORM
- **Auth**: WorkOS User Management (password auth with JWT sessions)
- **Storage**: Vercel Blob for file uploads
- **Styling**: Tailwind CSS with forms/typography plugins
- **Maps**: Leaflet for interactive maps and location picking
- **Icons**: `lucide-svelte`
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel (adapter-vercel)

### Key Directories

- `src/lib/db/schemas/` - Drizzle schema definitions (see Data Model below)
- `src/lib/server/workos.ts` - WorkOS authentication wrapper
- `src/lib/auth/middleware.ts` - Auth guards: `requireAuth()`, `requireAdmin()`, `requireModerator()`
- `src/lib/auth/helpers.ts` - `isPrivilegedUser()`, `parseStatusParam()`
- `src/lib/storage/blob.ts` - Vercel Blob utilities: `uploadFile()`, `deleteFile()`, `listFiles()`, `validateFile()`
- `src/lib/moderation.ts` - Content moderation queue helpers
- `src/lib/allowed-fields.ts` - Allowlists for alteration proposals (prevents altering `status`, `featured`, etc.)
- `src/lib/server/detail-page-loader.ts` - Shared server utility for hike/camping detail pages
- `src/lib/utils/pagination.ts` - `parseLimit()`, `parseOffset()` for list endpoints
- `src/lib/utils/detail-page-helpers.ts` - `buildHikeBadges()`, `buildHikeStats()`, `buildCampingBadges()`, `buildCampingStats()`
- `src/lib/utils/profanity-filter.ts` - `checkProfanity()`, `sanitizeReview()` using the `obscenity` package

### Data Model

Two main content types share common patterns:

- **Hikes**: Trails with difficulty, distance, duration, elevation, trail type, features
- **Camping Sites**: Sites with amenities, facilities, policies, costs, pet/fire policies

Both use:

- Linked `addresses` table for location data (lat/lng, city, state, `searchVector` tsvector)
- `status` field for moderation workflow (pending → approved/rejected)
- `featured` boolean for homepage display
- `searchVector` tsvector column for PostgreSQL full-text search
- `ratingAggregates` for cached ratings (denormalized)

#### Schema Files (`src/lib/db/schemas/`)

- `enums.ts` - All shared pg enums: `statusEnum`, `entityTypeEnum`, `fileEntityTypeEnum`, `fileTypeEnum`, `difficultyEnum`, `trailTypeEnum`, `petPolicyEnum`, `firePolicyEnum`, `siteTypeEnum`, plus label maps `SITE_TYPE_LABELS`, `TRAIL_TYPE_LABELS`, `VALID_STATUSES`
- `addresses.ts` - Location table with geocoordinates and `searchVector`
- `hikes.ts` - Hike schema with `searchVector`
- `camping-sites.ts` - Camping schema with `searchVector`, `baseFee`, `operatingSeasonStart/End`, `petPolicy`, `firePolicy`, `siteType`
- `files.ts` - File/image tracking: `entityType`, `entityId`, `isBanner`, `fileUrl`, `uploadedBy`
- `image-flags.ts` - User-reportable image flags (linked to `files`, cascade delete)
- `favorites.ts` - User favorites for hikes and camping sites (unique per user per entity)
- `notes.ts` - Private per-user notes on hikes or camping sites
- `alterations.ts` - Field-level change proposals: `fieldName`, `oldValue`, `newValue`, `reason`
- `ratings.ts` - Ratings (1.0–5.0 half-star) with optional `reviewText`, unique per user per entity
- `rating-aggregates.ts` - Denormalized: `averageRating`, `totalRatings`, `totalReviews`
- `moderation-queue.ts` - Queue entries with `entityType` (hike/camping_site/alteration)
- `amenity-types.ts` - Admin-managed camping amenity options
- `facility-types.ts` - Admin-managed camping facility options
- `feature-types.ts` - Admin-managed hike feature options
- `trail-types.ts` - Admin-managed trail type definitions

### Authentication Flow

- Session tokens stored in httpOnly cookies (`workos_access_token`, `workos_refresh_token`)
- `hooks.server.ts` validates JWT and populates `event.locals.user`
- User roles: `admin`, `moderator`, `user` (in practice only `admin` is checked separately)
- Protected routes use auth middleware from `$lib/auth/middleware.ts`
- Email verification: `/verify-email` handles 6-digit code post-signup

### API Pattern

REST endpoints in `src/routes/api/` follow SvelteKit conventions:

- `+server.ts` files export `GET`, `POST`, `PUT`, `DELETE` handlers
- Always join hikes/camping-sites with addresses table for location data
- New submissions go through moderation queue (status: "pending")
- List endpoints use `parseLimit()`/`parseOffset()` from `$lib/utils/pagination.ts`
- Approved public endpoints set `Cache-Control` headers (e.g. `s-maxage=300, stale-while-revalidate=600`)
- Review text is sanitized via `sanitizeReview()` before storage

#### API Endpoints

```
GET/POST          /api/hikes
GET/PUT/DELETE    /api/hikes/[id]
PUT               /api/hikes/[id]/featured        - Admin toggle featured

GET/POST          /api/camping-sites
GET/PUT/DELETE    /api/camping-sites/[id]
PUT               /api/camping-sites/[id]/featured

GET/POST          /api/alterations                - Field-level change proposals
GET/PUT/DELETE    /api/alterations/[id]

GET/POST          /api/favorites
GET/DELETE        /api/favorites/[id]

GET/POST          /api/notes
GET/PUT/DELETE    /api/notes/[id]

GET/POST/DELETE   /api/ratings                    - Upsert with profanity filtering
GET               /api/ratings/my-rating

GET/POST          /api/files
GET/DELETE        /api/files/[id]
POST/DELETE       /api/files/[id]/flag            - Flag or unflag an image

GET/PUT           /api/admin/image-flags          - Admin review (approve deletes from Blob)

POST              /api/upload                     - Upload to Vercel Blob + save record

GET/POST          /api/amenity-types
PUT/DELETE        /api/amenity-types/[id]

GET/POST          /api/facility-types
PUT/DELETE        /api/facility-types/[id]

GET/POST          /api/feature-types
PUT/DELETE        /api/feature-types/[id]

GET               /api/trail-types

GET/POST          /api/moderation

GET               /api/stats                      - Public stats, cached 5 min

PUT               /api/users/[id]/role            - Admin role assignment
```

#### Pages

```
/                      - Homepage (featured hikes + camping, stats)
/login                 - Login
/signup                - Signup
/verify-email          - Email verification (6-digit code)
/logout                - Server logout
/profile               - User profile + change password
/hikes                 - Hike listing with filters
/hikes/[id]            - Hike detail
/hikes/[id]/edit       - Edit hike (creator or admin)
/camping               - Camping listing with filters
/camping/[id]          - Camping detail
/camping/[id]/edit     - Edit camping site (creator or admin)
/favorites             - User's saved favorites
/submit                - Submit new hike or camping site
/essentials            - Static "Six Essentials" scout gear guide
/admin                 - Admin dashboard
/admin/moderation      - Moderation queue
/admin/featured        - Feature/unfeature content
/admin/image-flags     - Review user-reported image flags
/admin/types           - Manage feature/amenity/facility/trail types
/admin/users           - User management + role assignment
```

## Environment Variables

Required in `.env` (see `.env.example`):

- `DATABASE_URL` - Neon PostgreSQL connection string
- `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `WORKOS_ORGANIZATION_ID`, `WORKOS_COOKIE_PASSWORD` - Auth
- `VERCEL_BLOB_TOKEN` - File storage (code reads `BLOB_READ_WRITE_TOKEN`)
- `VERCEL_BLOB_STORE_ID` - Blob store ID
- `NODE_ENV` - Environment

## Conventions

- Schema files export type aliases: `type Hike = typeof hikes.$inferSelect`
- Components in `src/lib/components/` with subdirectories: `hikes/`, `camping/`, `detail-pages/`, `ratings/`
- Form submissions create entities with `status: "pending"` and add to moderation queue
- Delete operations on hikes/camping sites also cascade-delete all associated Vercel Blob files
- Alteration proposals are validated against per-entity allowlists in `src/lib/allowed-fields.ts`
