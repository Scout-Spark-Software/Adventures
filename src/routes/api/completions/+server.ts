import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { tripCompletions, hikes, backpacking } from "$lib/db/schemas";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";
import { parseLimit, parseOffset } from "$lib/utils/pagination";
import { recomputeCompletionStats } from "$lib/server/completions";

// POST /api/completions - Log a hike, camping site, or backpacking trip as completed
export const POST: RequestHandler = async ({ request, locals }) => {
  const user = requireAuth({ locals } as any);

  const body = await request.json();
  const { hikeId, campingSiteId, backpackingId, nights } = body;

  const entityCount = [hikeId, campingSiteId, backpackingId].filter(Boolean).length;
  if (entityCount !== 1) {
    throw error(400, "Exactly one of hikeId, campingSiteId, or backpackingId is required");
  }

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
    distance = listing.distance;
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
    distance = listing.distance;
    distanceUnit = listing.distanceUnit;
    duration = listing.duration;
    durationUnit = listing.durationUnit;
    elevation = listing.elevation;
    elevationUnit = listing.elevationUnit;
  } else if (campingSiteId) {
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
    })
    .returning();

  await recomputeCompletionStats(user.id);

  return json(result, { status: 201 });
};

// GET /api/completions - List the caller's own completion log entries.
// Optional entity filters narrow to one listing; with no filter, returns the
// caller's full history (paginated), newest first, joined to each entity's name.
export const GET: RequestHandler = async ({ url, locals }) => {
  const user = requireAuth({ locals } as any);

  const hikeId = url.searchParams.get("hike_id");
  const campingSiteId = url.searchParams.get("camping_site_id");
  const backpackingId = url.searchParams.get("backpacking_id");
  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));

  const conditions = [eq(tripCompletions.userId, user.id)];
  if (hikeId) conditions.push(eq(tripCompletions.hikeId, hikeId));
  if (campingSiteId) conditions.push(eq(tripCompletions.campingSiteId, campingSiteId));
  if (backpackingId) conditions.push(eq(tripCompletions.backpackingId, backpackingId));

  const results = await db.query.tripCompletions.findMany({
    where: and(...conditions),
    orderBy: [desc(tripCompletions.createdAt)],
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
