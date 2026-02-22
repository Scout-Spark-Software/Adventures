import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireAdmin } from "$lib/auth/middleware";
import { workos, workosConfig } from "$lib/server/workos";

const VALID_ROLES = ["admin", "member"];

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  await requireAdmin({ locals } as any);

  const { role } = await request.json();

  if (!role || !VALID_ROLES.includes(role)) {
    throw error(400, `role must be one of: ${VALID_ROLES.join(", ")}`);
  }

  const userId = params.id;

  // Find the user's organization membership
  const memberships = await workos.userManagement.listOrganizationMemberships({
    userId,
    organizationId: workosConfig.organizationId,
  });

  if (memberships.data.length === 0) {
    throw error(404, "User is not a member of this organization");
  }

  const membershipId = memberships.data[0].id;

  // Update the membership role
  await workos.userManagement.updateOrganizationMembership(membershipId, {
    roleSlug: role,
  });

  return json({ success: true });
};
