# User Profile: Council, Unit & Attribution Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users select their Scout council and unit (type + number) in their profile, display submitter attribution on detail pages and reviews, and respect a per-user privacy toggle that hides/shows that info.

**Architecture:** Add a `user_profiles` table keyed by WorkOS `userId` to store council, unit type, unit number, and a `showUnitInfo` boolean. The ratings API and detail-page APIs will join against this table to fetch display names for submitters and reviewers. All display is conditional on the `showUnitInfo` flag — when it's off, names and unit info are omitted everywhere they would have appeared.

**Tech Stack:** SvelteKit 2 / Svelte 5, Drizzle ORM, Neon Postgres, WorkOS (user identity), Tailwind CSS

**Key files to understand before touching anything:**

- `src/lib/db/schemas/` — all Drizzle schema files
- `src/lib/server/workos.ts` — `workosAuth.getUser(userId)` returns `{ firstName, lastName, email, … }`
- `src/lib/server/detail-page-loader.ts` — shared loader for hike/camping/backpacking detail pages
- `src/routes/api/ratings/+server.ts` — GET returns `ratings` array; we will add `submitterName` and `submitterUnit` fields
- `src/routes/api/hikes/[id]/+server.ts` — GET returns full hike; we will add `submitterName` and `submitterUnit`
- `src/routes/api/camping-sites/[id]/+server.ts` — same pattern as hikes
- `src/routes/api/backpacking/[id]/+server.ts` — same pattern
- `src/routes/profile/+page.svelte` — profile UI (tabs: Profile, Security, Notes)
- `src/routes/profile/+page.server.ts` — server load + form actions
- `src/lib/components/ratings/ReviewsTab.svelte` — renders review list (add submitter attribution here)
- `src/lib/components/CouncilSelect.svelte` — existing council picker (reuse in profile)

---

## Overview of Changes

1. **New DB table** `user_profiles` — stores `userId`, `councilId`, `unitType`, `unitNumber`, `showUnitInfo`
2. **New API** `GET/PUT /api/profile` — read and update the user profile record
3. **Profile UI** — add council picker + unit fields + privacy toggle to Profile tab
4. **Attribution helper** — server-side function that resolves a userId → display name + unit info
5. **Detail pages** — show "Submitted by X. Y, Troop 42, Council Name" if user has opted in
6. **Reviews** — show "F. L., Pack 7" next to each review if the reviewer has opted in

---

## Task 1: Create `user_profiles` Drizzle Schema

**Files:**

- Create: `src/lib/db/schemas/user-profiles.ts`
- Modify: `src/lib/db/schemas/index.ts`

**Step 1: Create the schema file**

```typescript
// src/lib/db/schemas/user-profiles.ts
import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { councils } from "./councils";

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id").primaryKey(), // WorkOS user ID
  councilId: uuid("council_id").references(() => councils.id),
  unitType: text("unit_type"), // "Pack", "Troop", "Crew", "Ship", "Post"
  unitNumber: text("unit_number"), // e.g. "42" (store as text, can have leading zeros)
  showUnitInfo: boolean("show_unit_info").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
```

**Step 2: Export from barrel**

Add to `src/lib/db/schemas/index.ts`:

```typescript
export * from "./user-profiles";
```

**Step 3: Push schema to DB**

```bash
npm run db:migrate
```

Expected: Drizzle pushes the new `user_profiles` table. No errors.

**Step 4: Commit**

```bash
git add src/lib/db/schemas/user-profiles.ts src/lib/db/schemas/index.ts
git commit -m "feat: add user_profiles schema for council, unit, and privacy settings"
```

---

## Task 2: Create `GET/PUT /api/profile` Endpoint

**Files:**

- Create: `src/routes/api/profile/+server.ts`

This endpoint reads and writes the current user's profile row.

**Step 1: Create the route handler**

```typescript
// src/routes/api/profile/+server.ts
import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { userProfiles } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";

export const GET: RequestHandler = async ({ locals }) => {
  const user = requireAuth({ locals } as any);

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
    with: { council: true },
  });

  return json(profile ?? null);
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  const user = requireAuth({ locals } as any);

  const body = await request.json();
  const { councilId, unitType, unitNumber, showUnitInfo } = body;

  // Validate unitType if provided
  const validUnitTypes = ["Pack", "Troop", "Crew", "Ship", "Post", null, ""];
  if (unitType !== undefined && !validUnitTypes.includes(unitType)) {
    throw error(400, "Invalid unit type");
  }

  // Validate unitNumber length
  if (unitNumber && String(unitNumber).length > 10) {
    throw error(400, "Unit number too long");
  }

  const values = {
    userId: user.id,
    councilId: councilId || null,
    unitType: unitType || null,
    unitNumber: unitNumber ? String(unitNumber).trim() : null,
    showUnitInfo: typeof showUnitInfo === "boolean" ? showUnitInfo : true,
    updatedAt: new Date(),
  };

  await db
    .insert(userProfiles)
    .values({ ...values, createdAt: new Date() })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        councilId: values.councilId,
        unitType: values.unitType,
        unitNumber: values.unitNumber,
        showUnitInfo: values.showUnitInfo,
        updatedAt: values.updatedAt,
      },
    });

  return json({ success: true });
};
```

> **Note on `with: { council: true }`:** This requires a `relations` definition in Drizzle. Add it to the schema file (see step below).

**Step 2: Add Drizzle relation to user-profiles schema**

In `src/lib/db/schemas/user-profiles.ts`, add at the bottom:

```typescript
import { relations } from "drizzle-orm";
import { councils } from "./councils"; // already imported above

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  council: one(councils, {
    fields: [userProfiles.councilId],
    references: [councils.id],
  }),
}));
```

> **Note:** Also check `src/lib/db/index.ts` — it imports `* as schema`. The relation will be picked up automatically as long as it's exported from `index.ts`.

**Step 3: Test endpoint manually**

```bash
# In dev: curl -b <cookie> http://localhost:5173/api/profile
# Should return null for a new user, or the profile row
```

**Step 4: Commit**

```bash
git add src/routes/api/profile/+server.ts src/lib/db/schemas/user-profiles.ts
git commit -m "feat: add GET/PUT /api/profile endpoint for user profile data"
```

---

## Task 3: Update Profile Page Server — Load Profile Data + Save Action

**Files:**

- Modify: `src/routes/profile/+page.server.ts`

The server load currently returns just `user`. We need to also return the user's profile row and the list of councils (for the picker).

**Step 1: Read the current file first** (already done — it's 74 lines). Then replace:

```typescript
// src/routes/profile/+page.server.ts
import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { requireAuth } from "$lib/auth/middleware";
import { workosAuth } from "$lib/server/workos";
import { sanitizeAuthError } from "$lib/security";
import { db } from "$lib/db";
import { userProfiles, councils } from "$lib/db/schemas";
import { eq, asc } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
  const user = requireAuth(event);

  const [profile, allCouncils] = await Promise.all([
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    }),
    db.select().from(councils).orderBy(asc(councils.name)),
  ]);

  return {
    user,
    profile: profile ?? null,
    councils: allCouncils,
  };
};

export const actions: Actions = {
  changePassword: async ({ request, locals }) => {
    // ... keep existing changePassword action unchanged ...
  },

  saveProfile: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { profileError: "Not authenticated" });
    }

    const formData = await request.formData();
    const councilId = formData.get("councilId");
    const unitType = formData.get("unitType");
    const unitNumber = formData.get("unitNumber");
    const showUnitInfo = formData.get("showUnitInfo") === "on";

    const validUnitTypes = ["Pack", "Troop", "Crew", "Ship", "Post", ""];
    if (unitType && !validUnitTypes.includes(String(unitType))) {
      return fail(400, { profileError: "Invalid unit type" });
    }

    if (unitNumber && String(unitNumber).length > 10) {
      return fail(400, { profileError: "Unit number too long (max 10 characters)" });
    }

    await db
      .insert(userProfiles)
      .values({
        userId: locals.user.id,
        councilId: councilId ? String(councilId) : null,
        unitType: unitType ? String(unitType) : null,
        unitNumber: unitNumber ? String(unitNumber).trim() : null,
        showUnitInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          councilId: councilId ? String(councilId) : null,
          unitType: unitType ? String(unitType) : null,
          unitNumber: unitNumber ? String(unitNumber).trim() : null,
          showUnitInfo,
          updatedAt: new Date(),
        },
      });

    return { profileSuccess: true };
  },
};
```

> **Important:** The `changePassword` action body is preserved verbatim. Only the imports and `load` function change.

**Step 2: Commit**

```bash
git add src/routes/profile/+page.server.ts
git commit -m "feat: load council/unit profile data in profile page server"
```

---

## Task 4: Update Profile UI — Add Profile Settings Tab Content

**Files:**

- Modify: `src/routes/profile/+page.svelte`

The profile tab currently shows Email and Display Name in a 2-column grid, then a sign-out button. We'll add a form below the existing cards with: council picker, unit type select, unit number input, and privacy toggle.

**Step 1: Add imports and reactive bindings at top of `<script>`**

After the existing imports, add:

```svelte
import CouncilSelect from "$lib/components/CouncilSelect.svelte"; import {Shield} from "lucide-svelte";
let isSavingProfile = false; // Reactive bindings to track current profile values for the form $: profileCouncilId
= data.profile?.councilId ?? ""; $: profileUnitType = data.profile?.unitType ?? ""; $: profileUnitNumber
= data.profile?.unitNumber ?? ""; $: profileShowUnitInfo = data.profile?.showUnitInfo ?? true;
```

**Step 2: Add the profile form inside the profile tab**

After the existing 2-column grid (the email + display name cards) and before the sign-out section, insert:

```svelte
<!-- Scout Unit Information -->
<div class="pt-4 border-t border-stone-100">
  <h3 class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Scout Unit</h3>

  {#if form?.profileSuccess}
    <div
      class="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3"
    >
      <div
        class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
      >
        <Check size={13} class="text-white" />
      </div>
      <p class="text-sm font-semibold text-emerald-800">Unit info saved!</p>
    </div>
  {/if}
  {#if form?.profileError}
    <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
      <div class="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
        <CircleAlertIcon size={13} class="text-white" />
      </div>
      <p class="text-sm font-semibold text-red-800">{form.profileError}</p>
    </div>
  {/if}

  <form
    method="POST"
    action="?/saveProfile"
    use:enhance={() => {
      isSavingProfile = true;
      return async ({ update }) => {
        await update();
        isSavingProfile = false;
      };
    }}
    class="space-y-4"
  >
    <!-- Council picker -->
    <div>
      <label
        for="councilId"
        class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Council</label
      >
      <CouncilSelect
        id="councilId"
        name="councilId"
        value={profileCouncilId}
        councils={data.councils}
        placeholder="Select your council..."
        variant="form"
      />
    </div>

    <!-- Unit type + number on one row -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label
          for="unitType"
          class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2"
          >Unit Type</label
        >
        <select
          id="unitType"
          name="unitType"
          value={profileUnitType}
          class="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all outline-none"
        >
          <option value="">Select type...</option>
          <option value="Pack">Pack (Cub Scouts)</option>
          <option value="Troop">Troop (Scouts BSA)</option>
          <option value="Crew">Crew (Venturing)</option>
          <option value="Ship">Ship (Sea Scouts)</option>
          <option value="Post">Post (Exploring)</option>
        </select>
      </div>
      <div>
        <label
          for="unitNumber"
          class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2"
          >Unit Number</label
        >
        <input
          type="text"
          id="unitNumber"
          name="unitNumber"
          value={profileUnitNumber}
          maxlength="10"
          placeholder="e.g. 42"
          class="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all outline-none"
        />
      </div>
    </div>

    <!-- Privacy toggle -->
    <div class="rounded-xl p-4 bg-stone-50 border border-stone-100 flex items-start gap-4">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <Shield size={13} class="text-stone-400" />
          <p class="text-xs font-bold text-stone-500 uppercase tracking-widest">
            Display Unit Info Publicly
          </p>
        </div>
        <p class="text-xs text-stone-400">
          When on, your name and unit appear on submissions and reviews. Toggle off to hide this
          info from all your past and future posts.
        </p>
      </div>
      <label class="relative inline-flex items-center cursor-pointer mt-0.5">
        <input
          type="checkbox"
          name="showUnitInfo"
          class="sr-only peer"
          checked={profileShowUnitInfo}
        />
        <div
          class="w-10 h-6 bg-stone-200 peer-focus:ring-2 peer-focus:ring-emerald-400 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
        ></div>
      </label>
    </div>

    <div class="pt-2">
      <button
        type="submit"
        disabled={isSavingProfile}
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-stone-950 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style="background: linear-gradient(135deg, #86efac, #34d399);"
      >
        {isSavingProfile ? "Saving..." : "Save Unit Info"}
      </button>
    </div>
  </form>
</div>
```

**Step 3: Commit**

```bash
git add src/routes/profile/+page.svelte
git commit -m "feat: add council/unit/privacy fields to profile UI"
```

---

## Task 5: Attribution Helper Function

**Files:**

- Create: `src/lib/server/attribution.ts`

This server-side helper resolves a WorkOS `userId` → display string like `"Mike T."` and optional unit string like `"Troop 42 · Council Name"`. It respects `showUnitInfo`. It's used by both detail-page APIs and the ratings API.

**Step 1: Create the helper**

```typescript
// src/lib/server/attribution.ts
import { db } from "$lib/db";
import { userProfiles, councils } from "$lib/db/schemas";
import { workosAuth } from "$lib/server/workos";
import { eq } from "drizzle-orm";

export interface Attribution {
  displayName: string | null; // "Mike T." — first name + last initial; null if user opted out
  unitLabel: string | null; // "Troop 42 · Silicon Valley Monterey Bay Council" — null if opted out or not set
}

/**
 * Resolve attribution info for a single userId.
 * Returns null display info when the user has opted out of public display.
 */
export async function getAttribution(userId: string): Promise<Attribution> {
  // Fetch profile (includes council info via join)
  const profile = await db
    .select({
      showUnitInfo: userProfiles.showUnitInfo,
      unitType: userProfiles.unitType,
      unitNumber: userProfiles.unitNumber,
      councilName: councils.name,
    })
    .from(userProfiles)
    .leftJoin(councils, eq(userProfiles.councilId, councils.id))
    .where(eq(userProfiles.userId, userId))
    .limit(1)
    .then((r) => r[0] ?? null);

  // If user has opted out (or has no profile with showUnitInfo=false), return nulls
  if (!profile || profile.showUnitInfo === false) {
    return { displayName: null, unitLabel: null };
  }

  // Fetch name from WorkOS
  let displayName: string | null = null;
  try {
    const wUser = await workosAuth.getUser(userId);
    const first = wUser.firstName ?? "";
    const last = wUser.lastName ?? "";
    if (first || last) {
      // "Mike T." or "Mike" if no last name
      displayName = last ? `${first} ${last.charAt(0).toUpperCase()}.` : first;
    }
  } catch {
    // WorkOS lookup failed — omit name gracefully
  }

  // Build unit label
  let unitLabel: string | null = null;
  const parts: string[] = [];
  if (profile.unitType && profile.unitNumber) {
    parts.push(`${profile.unitType} ${profile.unitNumber}`);
  } else if (profile.unitType) {
    parts.push(profile.unitType);
  }
  if (profile.councilName) {
    parts.push(profile.councilName);
  }
  if (parts.length > 0) {
    unitLabel = parts.join(" · ");
  }

  return { displayName, unitLabel };
}

/**
 * Batch resolve attributions for multiple userIds.
 * Returns a Map<userId, Attribution>.
 */
export async function getAttributions(userIds: string[]): Promise<Map<string, Attribution>> {
  const unique = [...new Set(userIds)];
  const results = await Promise.all(
    unique.map((id) => getAttribution(id).then((a) => [id, a] as const))
  );
  return new Map(results);
}
```

**Step 2: Commit**

```bash
git add src/lib/server/attribution.ts
git commit -m "feat: add attribution helper to resolve userId to display name and unit"
```

---

## Task 6: Add Attribution to Detail Page APIs

For each of the three entity types, modify the GET handler for the single-item endpoint (`/api/hikes/[id]`, `/api/camping-sites/[id]`, `/api/backpacking/[id]`) to look up and attach submitter attribution.

**Files:**

- Modify: `src/routes/api/hikes/[id]/+server.ts`
- Modify: `src/routes/api/camping-sites/[id]/+server.ts`
- Modify: `src/routes/api/backpacking/[id]/+server.ts`

**Step 1: Modify hike detail GET**

In `src/routes/api/hikes/[id]/+server.ts`, import and call the helper:

```typescript
// Add import at top
import { getAttribution } from "$lib/server/attribution";
```

After the existing `result` object is built (around line 87-99), add:

```typescript
// Resolve submitter attribution
const attribution = await getAttribution(hike.createdBy);

return json({
  ...result,
  submitterName: attribution.displayName,
  submitterUnit: attribution.unitLabel,
});
```

> Replace the existing `return json(result)` with the above.

**Step 2: Apply same pattern to camping-sites and backpacking**

Read each file first to find the exact location of the final `return json(...)`, then insert the same two lines before the return. The pattern is identical.

**Step 3: Commit**

```bash
git add src/routes/api/hikes/[id]/+server.ts src/routes/api/camping-sites/[id]/+server.ts src/routes/api/backpacking/[id]/+server.ts
git commit -m "feat: add submitter attribution fields to detail page APIs"
```

---

## Task 7: Add Attribution to Ratings GET API

**Files:**

- Modify: `src/routes/api/ratings/+server.ts`

The GET returns `{ ratings, aggregate }`. We need to attach `submitterName` and `submitterUnit` to each rating object. Since a review list may have many users, use the batch helper.

**Step 1: Import helper**

```typescript
import { getAttributions } from "$lib/server/attribution";
```

**Step 2: After fetching `results`, resolve attributions in batch and merge**

Replace:

```typescript
return json(
  {
    ratings: results,
    aggregate: ...
  },
  ...
);
```

With:

```typescript
// Batch-resolve attribution for all reviewers
const userIds = results.map((r) => r.userId);
const attributionMap = userIds.length > 0 ? await getAttributions(userIds) : new Map();

const ratingsWithAttribution = results.map((r) => {
  const attr = attributionMap.get(r.userId);
  return {
    ...r,
    submitterName: attr?.displayName ?? null,
    submitterUnit: attr?.unitLabel ?? null,
  };
});

return json(
  {
    ratings: ratingsWithAttribution,
    aggregate: aggregate || {
      averageRating: null,
      totalRatings: 0,
      totalReviews: 0,
    },
  },
  {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  }
);
```

**Step 3: Commit**

```bash
git add src/routes/api/ratings/+server.ts
git commit -m "feat: add submitter attribution to ratings API response"
```

---

## Task 8: Show Attribution on Detail Pages

Add submitter attribution to the hike, camping, and backpacking detail pages. The data is already in the page load (comes from the API response via `detail-page-loader.ts`).

**Files:**

- Modify: `src/routes/hikes/[id]/+page.svelte`
- Modify: `src/routes/camping/[id]/+page.svelte`
- Modify: `src/routes/backpacking/[id]/+page.svelte`

**Step 1: Find where to add attribution on the hike detail page**

Read the full `src/routes/hikes/[id]/+page.svelte`. Find the hero / top section where the hike name and details appear. Add a "Submitted by" line after the hike name, gated on `data.hike.submitterName`:

```svelte
{#if data.hike.submitterName}
  <p class="text-sm text-stone-500 mt-1">
    Submitted by <span class="font-semibold text-stone-700">{data.hike.submitterName}</span>
    {#if data.hike.submitterUnit}
      · <span class="text-stone-500">{data.hike.submitterUnit}</span>
    {/if}
  </p>
{/if}
```

Place it right after the hike title (the `<h1>` element). Find the `<h1>` that displays `data.hike.name` and add the block immediately after.

**Step 2: Apply same pattern to camping and backpacking detail pages**

Use `data.campingSite.submitterName` / `data.campingSite.submitterUnit` and `data.backpacking.submitterName` / `data.backpacking.submitterUnit` respectively.

**Step 3: Commit**

```bash
git add src/routes/hikes/[id]/+page.svelte src/routes/camping/[id]/+page.svelte src/routes/backpacking/[id]/+page.svelte
git commit -m "feat: display submitter attribution on detail pages"
```

---

## Task 9: Show Attribution on Reviews

**Files:**

- Modify: `src/lib/components/ratings/ReviewsTab.svelte`

Each review card currently shows rating stars and date. Add submitter name + unit below the date.

**Step 1: Update the type at the top of the script**

Change:

```typescript
type RatingWithUser = Rating & { userName?: string };
```

To:

```typescript
type RatingWithUser = Rating & { submitterName?: string | null; submitterUnit?: string | null };
```

**Step 2: Add attribution display inside the review card loop**

Find the `{#each reviews as review}` block. Inside the review card, after the date line, add:

```svelte
{#if review.submitterName}
  <p class="text-xs text-gray-400 mt-0.5">
    {review.submitterName}
    {#if review.submitterUnit}
      · {review.submitterUnit}
    {/if}
  </p>
{/if}
```

Place this right below:

```svelte
<p class="text-sm text-gray-500 mt-1">
  {formatDate(String(review.createdAt))} ...
</p>
```

**Step 3: Commit**

```bash
git add src/lib/components/ratings/ReviewsTab.svelte
git commit -m "feat: display submitter attribution on review cards"
```

---

## Task 10: Wire Up CouncilSelect in Profile — Verify It Works

The `CouncilSelect` component expects a `value` prop and groups councils by `headquartersState`. Verify the existing component works with a string `value` bound to a form field named `councilId`.

**Files:**

- Read: `src/lib/components/CouncilSelect.svelte`

**Step 1: Check existing component's prop contract**

Read the file. Confirm:

- It accepts `value: string` and `name: string`
- `variant="form"` renders with appropriate styling
- The `<select>` emits the council UUID as the form field value

If the component doesn't use `name` as the `<select name>` attribute (some older versions use a different pattern), update it to forward `name` to the underlying `<select>` so the form action can read `formData.get("councilId")`.

**Step 2: Test profile save end-to-end**

```bash
npm run dev
# Visit /profile
# Select a council, pick a unit type, enter a unit number
# Toggle showUnitInfo
# Submit the form
# Reload the page — fields should be pre-populated with saved values
```

**Step 3: Commit any CouncilSelect fixes**

```bash
git add src/lib/components/CouncilSelect.svelte
git commit -m "fix: ensure CouncilSelect forwards name attribute for form submission"
```

---

## Task 11: Smoke Test Full Flow

**Step 1: Dev server check**

```bash
npm run dev
```

Walk through:

1. **Profile page** — log in, go to `/profile`, select council + unit, set showUnitInfo=on, save. Reload — fields should persist.
2. **Detail page attribution** — go to a hike you submitted. If `showUnitInfo` is on, see "Submitted by Mike T. · Troop 42 · Council Name" under the title.
3. **Review attribution** — leave a review on a hike. In the reviews list, see your name + unit under the date.
4. **Privacy off** — go to profile, toggle `showUnitInfo` off, save. Reload the hike detail — your name should be gone. Reload the review — your name should be gone too.
5. **Privacy back on** — toggle `showUnitInfo` back on — attribution reappears.

**Step 2: Type check**

```bash
npm run check
```

Fix any TypeScript errors.

**Step 3: Lint**

```bash
npm run lint
```

Auto-fix:

```bash
npm run lint:fix
```

**Step 4: Final commit**

```bash
git add -p  # stage any remaining changes
git commit -m "fix: type check and lint cleanup for council/unit attribution feature"
```

---

## Implementation Notes & Gotchas

**WorkOS `getUser()` rate limits:** The attribution helper calls WorkOS per userId. For busy review lists this could be slow. Mitigation: the ratings API already caches responses (`s-maxage=60`). If performance is an issue later, cache WorkOS lookups in a DB table (e.g., `user_name_cache`). YAGNI for now.

**`showUnitInfo` defaults to `true`:** A new user with no profile row shows no attribution (because we return `null` when no profile exists — see Task 5). This is intentional — users must opt in by saving their profile once. If you want attribution for users who never visit their profile, change the helper to default to `true` for missing profiles. Discuss with product.

**Form checkbox behavior:** HTML checkboxes only send their value when checked. The `saveProfile` action uses `formData.get("showUnitInfo") === "on"` which correctly handles the unchecked case (returns `false`).

**Council join in profile load:** Task 3 loads `councils` from the DB separately from the profile. This is correct — we need the full list for the picker. The profile row only stores `councilId`.

**Detail page data flow:** The `detail-page-loader.ts` fetches the entity from the API endpoint (`/api/hikes/[id]`). Since attribution is added to the API response (Task 6), it flows through automatically via `entity.submitterName` / `entity.submitterUnit`. You reference it in the page as `data.hike.submitterName` etc.

**Privacy is real-time:** Because attribution is computed on each API call (not cached in the entity row), toggling `showUnitInfo` takes effect immediately on the next page load — no backfill needed.
