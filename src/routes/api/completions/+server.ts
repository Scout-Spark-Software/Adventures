import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { tripCompletions, hikes, campingSites, backpacking } from "$lib/db/schemas";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { parseLimit, parseOffset } from "$lib/utils/pagination";
import { recomputeCompletionStats } from "$lib/server/completions";
import { requireExactlyOneEntityRef } from "$lib/server/entity-refs";
import { isValidUuid } from "$lib/utils/uuid";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Parses the optional "day the trip actually happened" from the request body,
// defaulting to today and rejecting future dates (users can't log a trip
// before they've taken it). Local-date comparison is fine here since the
// column is a plain SQL date with no time component.
function parseCompletedAt(value: unknown): string {
  const today = new Date().toISOString().slice(0, 10);
  if (value === undefined || value === null || value === "") {
    return today;
  }
  if (typeof value !== "string" || !ISO_DATE_RE.test(value)) {
    throw error(400, "completedAt must be a date in YYYY-MM-DD format");
  }
  if (value > today) {
    throw error(400, "completedAt cannot be in the future");
  }
  return value;
}

// Users may override the snapshot distance copied from the listing (e.g. they
// hiked a spur trail or turned back early). Returns null when not provided,
// so the caller falls back to the listing's own distance.
function parseDistanceOverride(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw error(400, "distance must be a positive number");
  }
  return parsed.toString();
}

// POST /api/completions - Log a hike, camping site, or backpacking trip as completed
export const POST: RequestHandler = async ({ request, locals, url }) => {
  const user = requireAuth({ locals, url } as any);

  const body = await request.json();
  const { hikeId, campingSiteId, backpackingId, nights } = body;

  const exactlyOneMessage = "Exactly one of hikeId, campingSiteId, or backpackingId is required";
  requireExactlyOneEntityRef(
    { hikeId, campingSiteId, backpackingId },
    { missing: exactlyOneMessage, tooMany: exactlyOneMessage }
  );

  if (hikeId && !isValidUuid(hikeId)) {
    throw error(400, "hikeId must be a valid UUID");
  }
  if (campingSiteId && !isValidUuid(campingSiteId)) {
    throw error(400, "campingSiteId must be a valid UUID");
  }
  if (backpackingId && !isValidUuid(backpackingId)) {
    throw error(400, "backpackingId must be a valid UUID");
  }

  const completedAt = parseCompletedAt(body.completedAt);
  const distanceOverride = parseDistanceOverride(body.distance);

  let distance: string | null = null;
  let distanceUnit: "miles" | "kilometers" | null = null;
  let duration: string | null = null;
  let durationUnit: "minutes" | "hours" | null = null;
  let elevation: string | null = null;
  let elevationUnit: "feet" | "meters" | null = null;
  let validatedNights: number | null = null;

  if (hikeId) {
    const listing = await db.query.hikes.findFirst({ where: eq(hikes.id, hikeId) });
    if (!listing) throw error(404, "Hike not found");
    distance = distanceOverride ?? listing.distance;
    distanceUnit = listing.distanceUnit;
    duration = listing.duration;
    durationUnit = listing.durationUnit;
    elevation = listing.elevation;
    elevationUnit = listing.elevationUnit;
  } else if (backpackingId) {
    const listing = await db.query.backpacking.findFirst({
      where: eq(backpacking.id, backpackingId),
    });
    if (!listing) throw error(404, "Backpacking trip not found");
    distance = distanceOverride ?? listing.distance;
    distanceUnit = listing.distanceUnit;
    duration = listing.duration;
    durationUnit = listing.durationUnit;
    elevation = listing.elevation;
    elevationUnit = listing.elevationUnit;
  } else if (campingSiteId) {
    const listing = await db.query.campingSites.findFirst({
      where: eq(campingSites.id, campingSiteId),
    });
    if (!listing) throw error(404, "Camping site not found");
    if (!Number.isInteger(nights) || nights < 1 || nights > 90) {
      throw error(
        400,
        "nights is required for camping completions and must be an integer between 1 and 90"
      );
    }
    validatedNights = nights;
  }

  const [result] = await db
    .insert(tripCompletions)
    .values({
      userId: user.id,
      hikeId: hikeId || null,
      campingSiteId: campingSiteId || null,
      backpackingId: backpackingId || null,
      distance,
      distanceUnit,
      duration,
      durationUnit,
      elevation,
      elevationUnit,
      nights: validatedNights,
      completedAt,
    })
    .returning();

  await recomputeCompletionStats(user.id);

  return json(result, { status: 201 });
};

// GET /api/completions - List the caller's own completion log entries.
// Optional entity filters narrow to one listing; with no filter, returns the
// caller's full history (paginated), newest first, joined to each entity's name.
export const GET: RequestHandler = async ({ url, locals }) => {
  const user = requireAuth({ locals, url } as any);

  const hikeId = url.searchParams.get("hike_id");
  const campingSiteId = url.searchParams.get("camping_site_id");
  const backpackingId = url.searchParams.get("backpacking_id");
  const countOnly = url.searchParams.get("count_only") === "true";
  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));

  if (hikeId && !isValidUuid(hikeId)) {
    throw error(400, "hike_id must be a valid UUID");
  }
  if (campingSiteId && !isValidUuid(campingSiteId)) {
    throw error(400, "camping_site_id must be a valid UUID");
  }
  if (backpackingId && !isValidUuid(backpackingId)) {
    throw error(400, "backpacking_id must be a valid UUID");
  }

  const conditions = [eq(tripCompletions.userId, user.id)];
  if (hikeId) conditions.push(eq(tripCompletions.hikeId, hikeId));
  if (campingSiteId) conditions.push(eq(tripCompletions.campingSiteId, campingSiteId));
  if (backpackingId) conditions.push(eq(tripCompletions.backpackingId, backpackingId));

  if (countOnly) {
    const [row] = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(tripCompletions)
      .where(and(...conditions));
    return json({ count: row?.count ?? 0 }, { headers: { "Cache-Control": "no-store" } });
  }

  const results = await db.query.tripCompletions.findMany({
    where: and(...conditions),
    orderBy: [desc(tripCompletions.completedAt), desc(tripCompletions.createdAt)],
    limit,
    offset,
    with: {
      hike: { columns: { name: true, slug: true } },
      campingSite: { columns: { name: true, slug: true } },
      backpacking: { columns: { name: true, slug: true } },
    },
  });

  const withEntity = results.map((r) => {
    const entity = r.hike || r.campingSite || r.backpacking || null;
    const { hike: _hike, campingSite: _campingSite, backpacking: _backpacking, ...rest } = r;
    return {
      ...rest,
      entityName: entity?.name ?? null,
      entitySlug: entity?.slug ?? null,
    };
  });

  return json({ completions: withEntity }, { headers: { "Cache-Control": "no-store" } });
};
