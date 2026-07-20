import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { requireAuth } from "$lib/auth/middleware";
import { workosAuth } from "$lib/server/workos";
import { db } from "$lib/db";
import { userProfiles, councils } from "$lib/db/schemas";
import { eq, asc } from "drizzle-orm";
import { env } from "$env/dynamic/private";

export const load: PageServerLoad = async (event) => {
  const user = requireAuth(event);

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  const allCouncils = await db.query.councils.findMany({
    orderBy: asc(councils.name),
  });

  return {
    user,
    profile: profile ?? null,
    councils: allCouncils,
  };
};

export const actions: Actions = {
  requestPasswordReset: async ({ locals, url }) => {
    if (!locals.user) {
      return fail(401, { resetError: "Not authenticated" });
    }

    try {
      const origin = env.ORIGIN || url.origin;
      const resetPasswordUrl = new URL("/reset-password", origin).toString();
      await workosAuth.sendPasswordResetEmail(locals.user.email, resetPasswordUrl);
      return { resetSuccess: true };
    } catch (err) {
      console.error("Password reset error:", err instanceof Error ? err.message : "unknown");
      return fail(500, { resetError: "Unable to send password reset email. Please try again." });
    }
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
