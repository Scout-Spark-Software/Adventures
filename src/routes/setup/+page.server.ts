import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { requireAuth } from "$lib/auth/middleware";
import { db } from "$lib/db";
import { userProfiles, councils } from "$lib/db/schemas";
import { asc } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
  requireAuth(event);

  const allCouncils = await db.query.councils.findMany({
    orderBy: asc(councils.name),
  });

  return { councils: allCouncils };
};

export const actions: Actions = {
  saveProfile: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "Not authenticated" });
    }

    const formData = await request.formData();
    const councilId = formData.get("councilId");
    const unitType = formData.get("unitType");
    const unitNumber = formData.get("unitNumber");

    const validUnitTypes = ["Pack", "Troop", "Crew", "Ship", "Post", ""];
    if (unitType && !validUnitTypes.includes(String(unitType))) {
      return fail(400, { error: "Invalid unit type" });
    }

    if (unitNumber && String(unitNumber).length > 10) {
      return fail(400, { error: "Unit number too long (max 10 characters)" });
    }

    await db
      .insert(userProfiles)
      .values({
        userId: locals.user.id,
        councilId: councilId ? String(councilId) : null,
        unitType: unitType ? String(unitType) : null,
        unitNumber: unitNumber ? String(unitNumber).trim() : null,
        showUnitInfo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          councilId: councilId ? String(councilId) : null,
          unitType: unitType ? String(unitType) : null,
          unitNumber: unitNumber ? String(unitNumber).trim() : null,
          updatedAt: new Date(),
        },
      });

    throw redirect(303, "/?welcome=1");
  },
};
