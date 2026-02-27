import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/db";
import { userProfiles } from "$lib/db/schemas";
import { eq } from "drizzle-orm";
import { requireAuth } from "$lib/auth/middleware";

const VALID_UNIT_TYPES = ["Pack", "Troop", "Crew", "Ship", "Post", ""];

// GET /api/profile - Returns the current user's profile row, or null if none exists
export const GET: RequestHandler = async ({ locals }) => {
  const user = requireAuth({ locals } as any);

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  return json(profile ?? null);
};

// PUT /api/profile - Upserts the current user's profile
export const PUT: RequestHandler = async ({ request, locals }) => {
  const user = requireAuth({ locals } as any);

  const body = await request.json();
  const { councilId, unitType, unitNumber, showUnitInfo } = body;

  // Validate unitType
  if (unitType !== undefined && !VALID_UNIT_TYPES.includes(unitType)) {
    throw error(
      400,
      `unitType must be one of: ${VALID_UNIT_TYPES.map((t) => (t === "" ? '""' : t)).join(", ")}`
    );
  }

  // Validate unitNumber length
  if (unitNumber !== undefined && typeof unitNumber === "string" && unitNumber.length > 10) {
    throw error(400, "unitNumber must be 10 characters or fewer");
  }

  const now = new Date();

  const values: typeof userProfiles.$inferInsert = {
    userId: user.id,
    updatedAt: now,
  };

  if (councilId !== undefined) values.councilId = councilId || null;
  if (unitType !== undefined) values.unitType = unitType || null;
  if (unitNumber !== undefined) values.unitNumber = unitNumber || null;
  if (showUnitInfo !== undefined) values.showUnitInfo = Boolean(showUnitInfo);

  const [profile] = await db
    .insert(userProfiles)
    .values(values)
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        ...(councilId !== undefined && { councilId: councilId || null }),
        ...(unitType !== undefined && { unitType: unitType || null }),
        ...(unitNumber !== undefined && { unitNumber: unitNumber || null }),
        ...(showUnitInfo !== undefined && { showUnitInfo: Boolean(showUnitInfo) }),
        updatedAt: now,
      },
    })
    .returning();

  return json(profile);
};
