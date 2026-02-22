import type { PageServerLoad } from "./$types";
import { requireAdmin } from "$lib/auth/middleware";
import { workos, workosConfig } from "$lib/server/workos";

export const load: PageServerLoad = async (event) => {
  const currentUser = requireAdmin(event);

  // Fetch all users and memberships from WorkOS in parallel
  const [usersResponse, membershipsResponse] = await Promise.all([
    workos.userManagement.listUsers({
      organizationId: workosConfig.organizationId,
    }),
    workos.userManagement.listOrganizationMemberships({
      organizationId: workosConfig.organizationId,
    }),
  ]);

  // Build a map of userId -> role from memberships
  const roleMap = new Map<string, string>();
  for (const membership of membershipsResponse.data) {
    roleMap.set(membership.userId, membership.role?.slug || "member");
  }

  const users = usersResponse.data.map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: roleMap.get(user.id) || "member",
    createdAt: user.createdAt,
  }));

  return {
    users,
    currentUserId: currentUser.id,
  };
};
