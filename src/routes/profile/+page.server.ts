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
  changePassword: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "Not authenticated" });
    }

    const formData = await request.formData();
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return fail(400, { error: "All fields are required" });
    }

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return fail(400, { error: "Invalid input" });
    }

    if (newPassword !== confirmPassword) {
      return fail(400, { error: "New passwords do not match" });
    }

    if (newPassword.length < 12) {
      return fail(400, {
        error: "Password must be at least 12 characters long",
      });
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return fail(400, {
        error: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      });
    }

    if (currentPassword === newPassword) {
      return fail(400, {
        error: "New password must be different from current password",
      });
    }

    try {
      // Step 1: Verify current password by attempting sign in
      // This is required because WorkOS updateUser doesn't verify the old password
      await workosAuth.signIn(locals.user.email, currentPassword);

      // Step 2: Update password
      await workosAuth.updatePassword(locals.user.id, newPassword);

      return { success: true, message: "Password updated successfully" };
    } catch (error) {
      console.error("Password change error:", error instanceof Error ? error.message : "unknown");
      return fail(400, { error: sanitizeAuthError(error) });
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
