# Slug-Only URLs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove all UUID fallback logic from URL routing so every page exclusively uses slugs.

**Architecture:** Every `[id]` route currently accepts both UUIDs and slugs via a `UUID_RE` conditional. We strip that conditional and always query by `eq(table.slug, params.id)`. The detail page loaders also do a UUID→slug redirect that becomes dead code — remove it. The `/admin/featured` page passes `entity.id` (UUID) to toggle calls; switch it to `entity.slug`.

**Tech Stack:** SvelteKit 2, Drizzle ORM (Neon/PostgreSQL), TypeScript

---

### Task 1: API GET handlers — hikes, camping-sites, backpacking

**Files:**
- Modify: `src/routes/api/hikes/[id]/+server.ts`
- Modify: `src/routes/api/camping-sites/[id]/+server.ts`
- Modify: `src/routes/api/backpacking/[id]/+server.ts`

Each file has this pattern at the top of GET:

```ts
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// ...
const isUuid = UUID_RE.test(params.id);
// ...
.where(isUuid ? eq(hikes.id, params.id) : eq(hikes.slug, params.id))
```

**Step 1: Remove UUID_RE and always query by slug in the GET handler of `api/hikes/[id]/+server.ts`**

Delete the `const UUID_RE` line entirely. Change the `.where(...)` to:

```ts
.where(eq(hikes.slug, params.id))
```

Also remove the `const isUuid = UUID_RE.test(params.id);` line.

**Step 2: Run dev server and manually verify `/api/hikes/some-slug` returns 200**

```bash
npm run dev
curl http://localhost:5173/api/hikes/<a-real-slug>
```

Expected: JSON response with hike data.

**Step 3: Repeat for `api/camping-sites/[id]/+server.ts` GET**

```ts
.where(eq(campingSites.slug, params.id))
```

Remove `UUID_RE` const and `isUuid` variable from GET.

**Step 4: Repeat for `api/backpacking/[id]/+server.ts` GET**

```ts
.where(eq(backpacking.slug, params.id))
```

Remove `UUID_RE` const and `isUuid` variable from GET.

**Step 5: Commit**

```bash
git add src/routes/api/hikes/[id]/+server.ts \
        src/routes/api/camping-sites/[id]/+server.ts \
        src/routes/api/backpacking/[id]/+server.ts
git commit -m "refactor: GET API handlers accept slug only, remove UUID fallback"
```

---

### Task 2: API PUT/DELETE handlers — hikes, camping-sites, backpacking

**Files:**
- Modify: `src/routes/api/hikes/[id]/+server.ts`
- Modify: `src/routes/api/camping-sites/[id]/+server.ts`
- Modify: `src/routes/api/backpacking/[id]/+server.ts`

Each PUT and DELETE currently has:

```ts
const isUuid = UUID_RE.test(event.params.id);
const hike = await db.query.hikes.findFirst({
  where: isUuid ? eq(hikes.id, event.params.id) : eq(hikes.slug, event.params.id),
});
```

**Step 1: Simplify PUT in `api/hikes/[id]/+server.ts`**

Remove the `const isUuid = UUID_RE.test(event.params.id);` line in PUT. Change the `findFirst` to:

```ts
const hike = await db.query.hikes.findFirst({
  where: eq(hikes.slug, event.params.id),
});
```

Also remove `UUID_RE` const entirely from the file if no other handlers reference it (it won't after Task 1 + this task).

**Step 2: Simplify DELETE in `api/hikes/[id]/+server.ts`**

Same change — remove `isUuid` and use:

```ts
const hike = await db.query.hikes.findFirst({
  where: eq(hikes.slug, event.params.id),
});
```

**Step 3: Repeat PUT and DELETE simplification for `api/camping-sites/[id]/+server.ts`**

```ts
const campingSite = await db.query.campingSites.findFirst({
  where: eq(campingSites.slug, event.params.id),
});
```

**Step 4: Repeat PUT and DELETE simplification for `api/backpacking/[id]/+server.ts`**

```ts
const entry = await db.query.backpacking.findFirst({
  where: eq(backpacking.slug, event.params.id),
});
```

**Step 5: Commit**

```bash
git add src/routes/api/hikes/[id]/+server.ts \
        src/routes/api/camping-sites/[id]/+server.ts \
        src/routes/api/backpacking/[id]/+server.ts
git commit -m "refactor: PUT/DELETE API handlers accept slug only, remove UUID fallback"
```

---

### Task 3: API featured handlers — hikes, camping-sites, backpacking

**Files:**
- Modify: `src/routes/api/hikes/[id]/featured/+server.ts`
- Modify: `src/routes/api/camping-sites/[id]/featured/+server.ts`
- Modify: `src/routes/api/backpacking/[id]/featured/+server.ts`

These files still use `eq(table.id, params.id)` unconditionally (they never got the slug treatment).

**Step 1: Fix `api/hikes/[id]/featured/+server.ts`**

Current:
```ts
const whereCondition = featured
  ? and(eq(hikes.id, params.id), eq(hikes.status, "approved"))
  : eq(hikes.id, params.id);
// ...
const exists = await db.query.hikes.findFirst({ where: eq(hikes.id, params.id) });
```

Replace all three occurrences of `eq(hikes.id, params.id)` with `eq(hikes.slug, params.id)`:

```ts
const whereCondition = featured
  ? and(eq(hikes.slug, params.id), eq(hikes.status, "approved"))
  : eq(hikes.slug, params.id);
// ...
const exists = await db.query.hikes.findFirst({ where: eq(hikes.slug, params.id) });
```

**Step 2: Fix `api/camping-sites/[id]/featured/+server.ts`**

Replace all three occurrences of `eq(campingSites.id, params.id)` with `eq(campingSites.slug, params.id)`:

```ts
const whereCondition = featured
  ? and(eq(campingSites.slug, params.id), eq(campingSites.status, "approved"))
  : eq(campingSites.slug, params.id);
// ...
const exists = await db.query.campingSites.findFirst({ where: eq(campingSites.slug, params.id) });
```

**Step 3: Fix `api/backpacking/[id]/featured/+server.ts`**

This file uses a two-step lookup — look up by id, then update by id. Replace both `eq(backpacking.id, params.id)` with `eq(backpacking.slug, params.id)`:

```ts
const entry = await db.query.backpacking.findFirst({
  where: eq(backpacking.slug, params.id),
});
// ...
.where(eq(backpacking.id, entry.id))   // keep using entry.id for the UPDATE (already resolved UUID)
```

Note: for the UPDATE `.where()` use `entry.id` (the resolved UUID) since we've already fetched the record.

**Step 4: Commit**

```bash
git add src/routes/api/hikes/[id]/featured/+server.ts \
        src/routes/api/camping-sites/[id]/featured/+server.ts \
        src/routes/api/backpacking/[id]/featured/+server.ts
git commit -m "refactor: featured API handlers accept slug only"
```

---

### Task 4: Admin featured page — pass slug instead of UUID

**Files:**
- Modify: `src/routes/admin/featured/+page.svelte`

The `toggleFeatured` function receives an `id: string` and calls `/api/${apiPath}/${id}/featured`. The template passes `hike.id`, `campingSite.id`, `route.id` — all UUIDs.

**Step 1: Change the three `on:click` calls to pass `.slug` instead of `.id`**

Find these three lines (around lines 151, 220, 291):

```svelte
on:click={() => toggleFeatured("hike", hike.id, hike.featured)}
on:click={() => toggleFeatured("camping_site", campingSite.id, campingSite.featured)}
on:click={() => toggleFeatured("backpacking", route.id, route.featured)}
```

Change to:

```svelte
on:click={() => toggleFeatured("hike", hike.slug, hike.featured)}
on:click={() => toggleFeatured("camping_site", campingSite.slug, campingSite.featured)}
on:click={() => toggleFeatured("backpacking", route.slug, route.featured)}
```

**Step 2: Verify the admin featured page data includes slug**

Check `src/routes/admin/featured/+page.server.ts` — confirm the query selects `slug` for all three entity types. If `slug` is missing from the select, add it.

**Step 3: Commit**

```bash
git add src/routes/admin/featured/+page.svelte
git commit -m "refactor: admin featured page passes slug to API instead of UUID"
```

---

### Task 5: Detail page loaders — remove UUID redirect

**Files:**
- Modify: `src/routes/hikes/[id]/+page.server.ts`
- Modify: `src/routes/camping/[id]/+page.server.ts`
- Modify: `src/routes/backpacking/[id]/+page.server.ts`

These loaders do:

```ts
const UUID_RE = /^[0-9a-f]{8}-...-[0-9a-f]{12}$/i;
// ...
if (UUID_RE.test(params.id) && data.hike?.slug && data.hike.slug !== params.id) {
  throw redirect(301, `/hikes/${data.hike.slug}`);
}
```

Since we no longer accept UUIDs in URLs, this redirect is dead code. Remove it.

**Step 1: Clean up `src/routes/hikes/[id]/+page.server.ts`**

Remove:
- The `const UUID_RE = ...` line
- The entire `if (UUID_RE.test(...)) { throw redirect(...) }` block
- The `redirect` import if it's no longer used

Result should be:

```ts
import { loadDetailPage } from "$lib/server/detail-page-loader";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
  return loadDetailPage({
    entityId: params.id,
    entityType: "hike",
    apiEndpoint: `/api/hikes/${params.id}`,
    locals,
    fetch,
  });
};
```

**Step 2: Clean up `src/routes/camping/[id]/+page.server.ts`**

Same removal. Result:

```ts
import { loadDetailPage } from "$lib/server/detail-page-loader";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
  return loadDetailPage({
    entityId: params.id,
    entityType: "camping_site",
    apiEndpoint: `/api/camping-sites/${params.id}`,
    locals,
    fetch,
  });
};
```

**Step 3: Clean up `src/routes/backpacking/[id]/+page.server.ts`**

Same removal. Result:

```ts
import { loadDetailPage } from "$lib/server/detail-page-loader";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
  return loadDetailPage({
    entityId: params.id,
    entityType: "backpacking",
    apiEndpoint: `/api/backpacking/${params.id}`,
    locals,
    fetch,
  });
};
```

**Step 4: Commit**

```bash
git add src/routes/hikes/[id]/+page.server.ts \
        src/routes/camping/[id]/+page.server.ts \
        src/routes/backpacking/[id]/+page.server.ts
git commit -m "refactor: remove UUID→slug redirect from detail page loaders"
```

---

### Task 6: Edit page loaders — slug only

**Files:**
- Modify: `src/routes/hikes/[id]/edit/+page.server.ts`
- Modify: `src/routes/camping/[id]/edit/+page.server.ts`
- Modify: `src/routes/backpacking/[id]/edit/+page.server.ts`

These files have `UUID_RE` + `isUuid`/`isUuidInAction` conditional queries scattered throughout both `load` and `actions`. Strip all the conditionals and always use `eq(table.slug, ...)`.

**Step 1: Fix `src/routes/hikes/[id]/edit/+page.server.ts`**

Remove the `const UUID_RE = ...` line.

In `load`, change:
```ts
const isUuid = UUID_RE.test(event.params.id);
const hike = await db.query.hikes.findFirst({
  where: isUuid ? eq(hikes.id, event.params.id) : eq(hikes.slug, event.params.id),
});
```
To:
```ts
const hike = await db.query.hikes.findFirst({
  where: eq(hikes.slug, event.params.id),
});
```

In `delete` action, change:
```ts
const response = await event.fetch(`/api/hikes/${encodeURIComponent(event.params.id)}`, {
```
To:
```ts
const response = await event.fetch(`/api/hikes/${event.params.id}`, {
```
(No encoding needed — slugs are URL-safe.)

In `updateField` location block, change:
```ts
const isUuidInAction = UUID_RE.test(event.params.id);
const hike = await db.query.hikes.findFirst({
  where: isUuidInAction ? eq(hikes.id, event.params.id) : eq(hikes.slug, event.params.id),
});
```
To:
```ts
const hike = await db.query.hikes.findFirst({
  where: eq(hikes.slug, event.params.id),
});
```

In `updateField` admin PUT call, change:
```ts
const response = await event.fetch(`/api/hikes/${encodeURIComponent(event.params.id)}`, {
```
To:
```ts
const response = await event.fetch(`/api/hikes/${event.params.id}`, {
```

In `updateField` non-admin alteration block, change:
```ts
const isUuidInAction = UUID_RE.test(event.params.id);
const hike = await db.query.hikes.findFirst({
  where: isUuidInAction ? eq(hikes.id, event.params.id) : eq(hikes.slug, event.params.id),
});
```
To:
```ts
const hike = await db.query.hikes.findFirst({
  where: eq(hikes.slug, event.params.id),
});
```

**Step 2: Repeat for `src/routes/camping/[id]/edit/+page.server.ts`**

Same changes with `campingSites` / `camping-sites`:
- Remove `UUID_RE` const
- All `findFirst` queries: `eq(campingSites.slug, event.params.id)`
- API fetch URLs: `/api/camping-sites/${event.params.id}` (no `encodeURIComponent`)

**Step 3: Repeat for `src/routes/backpacking/[id]/edit/+page.server.ts`**

Same changes with `backpacking`:
- Remove `UUID_RE` const
- All `findFirst` queries: `eq(backpacking.slug, event.params.id)`
- API fetch URLs: `/api/backpacking/${event.params.id}` (no `encodeURIComponent`)

**Step 4: Commit**

```bash
git add src/routes/hikes/[id]/edit/+page.server.ts \
        src/routes/camping/[id]/edit/+page.server.ts \
        src/routes/backpacking/[id]/edit/+page.server.ts
git commit -m "refactor: edit page servers accept slug only, remove UUID fallback"
```

---

### Task 7: Smoke test the full flow

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test hike detail page**

Navigate to `/hikes/<a-real-slug>` — page should load correctly.

**Step 3: Test camping detail page**

Navigate to `/camping/<a-real-slug>` — page should load correctly.

**Step 4: Test backpacking detail page**

Navigate to `/backpacking/<a-real-slug>` — page should load correctly.

**Step 5: Test edit pages (as admin)**

Navigate to `/hikes/<slug>/edit`, `/camping/<slug>/edit`, `/backpacking/<slug>/edit` — should load the edit form with correct data.

**Step 6: Test UUID URLs now return 404**

Navigate to `/hikes/<a-real-uuid>` — should return 404 (no redirect, no data).

**Step 7: Test featured toggle in admin**

Go to `/admin/featured`, toggle a hike/camping/backpacking — verify it works without errors.

**Step 8: Run type check**

```bash
npm run check
```

Expected: no TypeScript errors.

**Step 9: Final commit if any cleanup needed**

```bash
git add -p
git commit -m "chore: final cleanup after slug-only URL migration"
```
