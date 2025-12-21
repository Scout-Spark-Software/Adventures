# Filter Components Implementation Plan

## Overview
Add filter components to hikes and camping sites pages, matching the provided screenshot design. Components will be separate (not shared) and implement **server-side filtering** with URL state management for scalability.

## Approach

### Filtering Strategy
- **Server-side filtering**: API handles all filtering logic to future-proof for large datasets
- **50-item pagination**: Initial page load limited to 50 items
- **URL state sync**: Filters persist in query parameters for shareability and page refresh
- **Button-click filtering**: User selects filters, then clicks "Apply Filters" to submit
- **Mobile-responsive**: Sidebar on desktop, drawer/modal on mobile

### Component Structure
Two separate filter components with similar UI patterns but different filter fields:
1. `HikeFilters.svelte` - For hikes page
2. `CampingFilters.svelte` - For camping sites page

## Database Changes Required

### 1. Create Trail Types Table
New database table for trail types (similar to feature-types, amenity-types):
- **File**: `/src/lib/db/schemas/trail-types.ts`
- **Table**: `trail_types` with fields: id, name, key, description, icon, displayOrder, active
- **Migration**: Create migration script to add table and seed with common trail types:
  - Loop
  - Out & Back
  - Point to Point
  - Lollipop
  - Other

### 2. Create API Endpoint for Trail Types
- **File**: `/src/routes/api/trail-types/+server.ts`
- GET endpoint to fetch all active trail types (ordered by displayOrder)
- POST endpoint for admin to add new trail types

## Files to Create

### 1. `/src/lib/components/HikeFilters.svelte`
Filter component for hikes page with:
- Search input (text search on name/description/location)
- Difficulty dropdown (All Levels, Easy, Moderate, Hard, Very Hard)
- Trail Type dropdown (loaded from database via API)
- Distance range inputs (Min/Max in miles)
- Trail Features multi-select buttons (loaded from feature-types API)
- Apply Filters button (green, triggers URL update and page reload)
- Clear All button (gray, clears all filters)

**Props:**
- `featureTypes` - Array of FeatureType from database
- `trailTypes` - Array of TrailType from database
- `currentFilters` - Current filter values from URL params

**Behavior:**
- Manages filter state internally
- On "Apply Filters" click: updates URL with query params and triggers page navigation
- On "Clear All" click: navigates to base URL without params
- Responsive: sidebar on desktop (300px width), drawer on mobile

### 2. `/src/lib/components/CampingFilters.svelte`
Filter component for camping sites page with:
- Search input (text search on name/description/location)
- Site Type dropdown (Public, Private, Public-Private Partnership)
- Pet Policy dropdown (Allowed, Not Allowed, Restricted)
- Fire Policy dropdown (Allowed, Not Allowed, Fire Pits Only, Seasonal)
- Cost Range inputs (Min/Max per night in dollars)
- Amenities multi-select buttons (loaded from amenity-types API)
- Facilities multi-select buttons (loaded from facility-types API)
- Reservation Required checkbox
- Apply Filters button (green)
- Clear All button (gray)

**Props:**
- `amenityTypes` - Array of AmenityType from database
- `facilityTypes` - Array of FacilityType from database
- `currentFilters` - Current filter values from URL params

**Behavior:**
- Same as HikeFilters: manages state, updates URL on Apply, clears on Clear All
- Responsive layout matching HikeFilters

## Files to Modify

### 1. `/src/routes/api/hikes/+server.ts`
Enhance GET handler to support additional query parameters:
- `search` - Text search on name, description, and location (case-insensitive, uses ILIKE)
- `difficulty` - Filter by difficulty level
- `trailType` - Filter by trail type ID or name
- `minDistance` / `maxDistance` - Distance range filter
- `features` - Array of feature IDs (hike must have all selected features)
- `dogFriendly` - Boolean filter

Current implementation already has:
- `status` - Filter by status
- `featured` - Show only featured items
- `limit` - Default 50
- `offset` - For pagination

**Changes needed:**
- Add Drizzle ORM conditions for new filter params
- Handle array parsing for features (comma-separated)
- Add text search using `ilike` for name/description
- Join with addresses table for location search

### 2. `/src/routes/api/camping-sites/+server.ts`
Enhance GET handler to support additional query parameters:
- `search` - Text search on name, description, and location
- `siteType` - Filter by site type
- `petPolicy` - Filter by pet policy
- `firePolicy` - Filter by fire policy
- `minCost` / `maxCost` - Cost per night range filter
- `amenities` - Array of amenity IDs (comma-separated)
- `facilities` - Array of facility IDs (comma-separated)
- `reservationRequired` - Boolean filter

**Changes needed:**
- Add Drizzle ORM conditions for new filter params
- Handle array parsing for amenities/facilities
- Add text search using `ilike`
- Join with addresses table for location search

### 3. `/src/routes/hikes/+page.server.ts`
Update load function to:
- Parse URL search params and pass ALL filter params to API
- Fetch feature types from `/api/feature-types`
- Fetch trail types from `/api/trail-types`
- Ensure limit=50 for initial load
- Return: `{ hikes, featureTypes, trailTypes, currentFilters }`

### 4. `/src/routes/camping/+page.server.ts`
Update load function to:
- Parse URL search params and pass ALL filter params to API
- Fetch amenity types from `/api/amenity-types`
- Fetch facility types from `/api/facility-types`
- Ensure limit=50 for initial load
- Return: `{ campingSites, amenityTypes, facilityTypes, currentFilters }`

### 5. `/src/routes/hikes/+page.svelte`
- Update layout to two-column grid (sidebar + content)
- Import and render `HikeFilters` component in left sidebar
- Pass `data.featureTypes`, `data.trailTypes`, `data.currentFilters` as props
- Display `data.hikes` in right content area (existing grid)
- Add mobile drawer toggle for filters
- Show filter count/active filters indicator

### 6. `/src/routes/camping/+page.svelte`
- Update layout to two-column grid (sidebar + content)
- Import and render `CampingFilters` component in left sidebar
- Pass `data.amenityTypes`, `data.facilityTypes`, `data.currentFilters` as props
- Display `data.campingSites` in right content area (existing grid)
- Add mobile drawer toggle for filters
- Show filter count/active filters indicator

## UI Design (Based on Screenshot)

### Layout
```
┌─────────────────────────────────────┐
│ Search & Filter                     │
│                                     │
│ [Search input........................]│
│                                     │
│ Difficulty: [All Levels ▼]         │
│ Trail Type: [All Types ▼]          │
│ Distance (miles): [Min] [Max]      │
│                                     │
│ Trail Features:                     │
│ [Waterfall] [Lake] [River]         │
│ [Mountain Views] [Wildlife]        │
│ [Wildflowers] [Historic Site]      │
│ [Camping] [Swimming]               │
│ [Rock Scrambling] [Forest]         │
│ [Desert] [Beach] [Dog Friendly]    │
│                                     │
│ [  Apply Filters  ] [ Clear All ]  │
└─────────────────────────────────────┘
```

### Styling
- White background card with padding
- Rounded corners and subtle shadow
- Green primary button (#10B981 or similar)
- Gray secondary button
- Pill-style buttons for multi-select features
- Consistent spacing and typography

## Server-Side Filter Logic (API Layer)

### Hike Filters (in `/src/routes/api/hikes/+server.ts`)
Using Drizzle ORM conditions:
1. **search**: `or(ilike(hikes.name, %search%), ilike(hikes.description, %search%), ilike(addresses.city, %search%))`
2. **difficulty**: `eq(hikes.difficulty, difficulty)`
3. **trailType**: `eq(hikes.trailType, trailType)` 
4. **minDistance/maxDistance**: `gte(hikes.distance, min)` and `lte(hikes.distance, max)`
5. **features**: JSONB array contains query - `hikes.features @> [selectedFeatureIds]`
6. **dogFriendly**: `eq(hikes.dogFriendly, true)`

### Camping Site Filters (in `/src/routes/api/camping-sites/+server.ts`)
Using Drizzle ORM conditions:
1. **search**: `or(ilike(campingSites.name, %search%), ilike(campingSites.description, %search%), ilike(addresses.city, %search%))`
2. **siteType**: `eq(campingSites.siteType, siteType)`
3. **petPolicy**: `eq(campingSites.petPolicy, petPolicy)`
4. **firePolicy**: `eq(campingSites.firePolicy, firePolicy)`
5. **minCost/maxCost**: `gte(campingSites.costPerNight, min)` and `lte(campingSites.costPerNight, max)`
6. **amenities**: JSONB array contains - `campingSites.amenities @> [selectedAmenityIds]`
7. **facilities**: JSONB array contains - `campingSites.facilities @> [selectedFacilityIds]`
8. **reservationRequired**: `eq(campingSites.reservationRequired, true)`

## Implementation Steps

### Phase 1: Database Setup
1. Create trail-types schema file
2. Create Drizzle migration for trail_types table
3. Run migration and seed with initial trail types
4. Create API endpoint for trail types

### Phase 2: API Enhancement
5. Update `/api/hikes/+server.ts` with all filter parameters
6. Update `/api/camping-sites/+server.ts` with all filter parameters
7. Add address table joins for location search
8. Test API endpoints with various query parameter combinations

### Phase 3: Component Development
9. Build `HikeFilters.svelte` component with all filter UI
10. Build `CampingFilters.svelte` component with all filter UI
11. Implement URL state management (query params)
12. Add mobile responsive drawer/modal

### Phase 4: Page Integration
13. Update `/routes/hikes/+page.server.ts` to load filter data
14. Update `/routes/camping/+page.server.ts` to load filter data
15. Update `/routes/hikes/+page.svelte` with two-column layout
16. Update `/routes/camping/+page.svelte` with two-column layout

### Phase 5: Polish
17. Add loading states during filter application
18. Add "X results found" counter
19. Add accessibility attributes (ARIA labels, keyboard navigation)
20. Test responsive design on mobile/tablet/desktop
21. Add filter persistence (restore from URL on page load)

## Critical Files Summary

**New Files:**
- `/src/lib/db/schemas/trail-types.ts` - Trail types schema
- `/src/routes/api/trail-types/+server.ts` - Trail types API endpoint
- `/src/lib/components/HikeFilters.svelte` - Hike filter component
- `/src/lib/components/CampingFilters.svelte` - Camping filter component
- Migration file for trail_types table

**Modified Files:**
- `/src/routes/api/hikes/+server.ts` - Add filter query params
- `/src/routes/api/camping-sites/+server.ts` - Add filter query params
- `/src/routes/hikes/+page.server.ts` - Load filter data
- `/src/routes/camping/+page.server.ts` - Load filter data
- `/src/routes/hikes/+page.svelte` - Integrate filter UI
- `/src/routes/camping/+page.svelte` - Integrate filter UI

## Technical Details

### URL Query Parameter Format
```
/hikes?search=mountain&difficulty=moderate&minDistance=5&maxDistance=10&features=uuid1,uuid2&dogFriendly=true

/camping?search=lake&siteType=public&petPolicy=allowed&minCost=20&maxCost=50&amenities=uuid1,uuid2&facilities=uuid3
```

### Mobile Responsive Behavior
- **Desktop (≥1024px)**: Fixed sidebar (300px width) on left, scrollable content on right
- **Tablet (768px-1023px)**: Collapsible sidebar, toggle button at top
- **Mobile (<768px)**: Drawer/modal overlay, filter button in header shows count badge
