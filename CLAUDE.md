# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scouts Adventures Platform - A SvelteKit application for scouts to discover, submit, and manage hiking trails, camping sites, and backpacking trips.

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
- **Storage**: Cloudflare R2 for file uploads
- **Styling**: Tailwind CSS with forms/typography plugins
- **Maps**: Leaflet for interactive maps and location picking
- **Icons**: `lucide-svelte`
- **Deployment**: Cloudflare Pages (adapter-cloudflare)

### Key Directories

- `src/lib/db/schemas/` - Drizzle schema definitions (see Data Model below)
- `src/lib/server/workos.ts` - WorkOS authentication wrapper
- `src/lib/auth/middleware.ts` - Auth guards: `requireAuth()`, `requireAdmin()`, `requireModerator()`
- `src/lib/auth/helpers.ts` - `isPrivilegedUser()`, `parseStatusParam()`
- `src/lib/storage/blob.ts` - R2 storage utilities: `uploadFile()`, `deleteFile()`, `listFiles()`, `validateFile()`
- `src/lib/moderation.ts` - Content moderation queue helpers
- `src/lib/allowed-fields.ts` - Allowlists for alteration proposals (prevents altering `status`, `featured`, etc.)
- `src/lib/server/detail-page-loader.ts` - Shared server utility for hike/camping detail pages
- `src/lib/server/slug.ts` - `generateUniqueSlug()` helper for creating unique slugs on all three content types
- `src/lib/utils/pagination.ts` - `parseLimit()`, `parseOffset()` for list endpoints
- `src/lib/utils/detail-page-helpers.ts` - `buildHikeBadges()`, `buildHikeStats()`, `buildCampingBadges()`, `buildCampingStats()`
- `src/lib/utils/profanity-filter.ts` - `checkProfanity()`, `sanitizeReview()` using the `obscenity` package
- `src/lib/utils/slugify.ts` - `toSlug()`, `hasProfanityInSlug()` utilities

### Data Model

Three main content types share common patterns:

- **Hikes**: Trails with difficulty, distance, duration, elevation, trail type, features
- **Camping Sites**: Sites with amenities, facilities, policies, costs, pet/fire policies
- **Backpacking**: Multi-day trips (schema mirrors hikes/camping patterns)

All three use:

- Linked `addresses` table for location data (lat/lng, city, state, `searchVector` tsvector)
- `slug` column (NOT NULL) — generated on create/update via `generateUniqueSlug()`; all public URLs and API routes use slug only (no UUID fallback)
- `status` field for moderation workflow (pending → approved/rejected)
- `featured` boolean for homepage display
- `searchVector` tsvector column for PostgreSQL full-text search
- `ratingAggregates` for cached ratings (denormalized)

#### Schema Files (`src/lib/db/schemas/`)

- `enums.ts` - All shared pg enums: `statusEnum`, `entityTypeEnum`, `fileEntityTypeEnum`, `fileTypeEnum`, `difficultyEnum`, `trailTypeEnum`, `petPolicyEnum`, `firePolicyEnum`, `siteTypeEnum`, plus label maps `SITE_TYPE_LABELS`, `TRAIL_TYPE_LABELS`, `VALID_STATUSES`
- `addresses.ts` - Location table with geocoordinates and `searchVector`
- `hikes.ts` - Hike schema with `searchVector`, `slug`
- `camping-sites.ts` - Camping schema with `searchVector`, `slug`, `baseFee`, `operatingSeasonStart/End`, `petPolicy`, `firePolicy`, `siteType`
- `backpacking.ts` - Backpacking schema with `searchVector`, `slug`
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
- `[id]` path segments in API routes are **slugs only** — UUID fallback has been removed
- Delete handlers also delete related `moderationQueue` rows to avoid orphans

#### API Endpoints

```
GET/POST          /api/hikes
GET/PUT/DELETE    /api/hikes/[id]                 - [id] is slug
PUT               /api/hikes/[id]/featured        - Admin toggle featured

GET/POST          /api/camping-sites
GET/PUT/DELETE    /api/camping-sites/[id]          - [id] is slug
PUT               /api/camping-sites/[id]/featured

GET/POST          /api/backpacking
GET/PUT/DELETE    /api/backpacking/[id]            - [id] is slug

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

POST              /api/upload                     - Upload to Cloudflare R2 + save record

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
/hikes/[slug]          - Hike detail
/hikes/[slug]/edit     - Edit hike (creator or admin)
/camping               - Camping listing with filters
/camping/[slug]        - Camping detail
/camping/[slug]/edit   - Edit camping site (creator or admin)
/backpacking           - Backpacking listing with filters
/backpacking/[slug]    - Backpacking detail
/backpacking/[slug]/edit - Edit backpacking trip (creator or admin)
/favorites             - User's saved favorites
/submit                - Submit new hike, camping site, or backpacking trip
/essentials            - Static "Six Essentials" scout gear guide
/admin                 - Admin dashboard
/admin/moderation      - Moderation queue
/admin/featured        - Feature/unfeature content
/admin/image-flags     - Review user-reported image flags
/admin/types           - Manage feature/amenity/facility/trail types
/admin/users           - User management + role assignment
```

Note: `[id]` route segments use **slugs** in the URL. Visiting a UUID-based URL redirects to the slug equivalent.

## Environment Variables

Required in `.env` (see `.env.example`):

- `DATABASE_URL` - Neon PostgreSQL connection string
- `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `WORKOS_ORGANIZATION_ID`, `WORKOS_COOKIE_PASSWORD` - Auth
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ACCOUNT_ID` - Cloudflare R2 storage
- `CRON_SECRET` - Shared secret between the app and the scheduler Worker (generate with `openssl rand -base64 32`)
- `NODE_ENV` - Environment

## CI/CD

- `.github/workflows/deploy-preview.yml` — triggers on `preview` branch; builds and deploys to Cloudflare Pages with `--branch preview`
- `.github/workflows/deploy-prod.yml` — triggers on `main`; runs `migrate` job first, then deploys (deploy blocked if migrate fails); also deploys the scheduler Worker (`workers/scheduler/`)

### Scheduler Worker secrets

The `adventures-scheduler` Cloudflare Worker (`workers/scheduler/`) requires two secrets set via Wrangler — these are **not** `.env` variables and must be configured once per environment:

```bash
npx wrangler secret put APP_URL --config workers/scheduler/wrangler.toml
# e.g. https://www.adventurespark.org

npx wrangler secret put CRON_SECRET --config workers/scheduler/wrangler.toml
# Must match CRON_SECRET in the app's Cloudflare Pages environment variables
```

## Conventions

- Schema files export type aliases: `type Hike = typeof hikes.$inferSelect`
- Components in `src/lib/components/` with subdirectories: `hikes/`, `camping/`, `detail-pages/`, `ratings/`
- Form submissions create entities with `status: "pending"` and add to moderation queue
- Delete operations on hikes/camping/backpacking also cascade-delete all associated R2 files and `moderationQueue` rows
- Alteration proposals are validated against per-entity allowlists in `src/lib/allowed-fields.ts`
- All content types generate a unique slug on create/update; slugs are the canonical URL identifier
- SEO metadata, `sitemap.xml`, and `robots.txt` are generated by the app
- Error page at `src/routes/+error.svelte` shows contextual 404 messages based on current section
