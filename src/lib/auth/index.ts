import { workos, workosConfig } from "../server/workos";

export type UserRole = "admin" | "member";

/**
 * Gets the user role from WorkOS organization membership.
 *
 * Note: In route handlers, the role is already available in `event.locals.user.role`
 * populated by hooks.server.ts. Only use this function if you need to fetch the role
 * outside of a request context.
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    // Get role from organization membership for the specific organization
    const memberships = await workos.userManagement.listOrganizationMemberships({
      userId: userId,
      organizationId: workosConfig.organizationId,
    });
    console.log("Memberships:", memberships?.data);
    if (memberships.data.length > 0) {
      const role = memberships.data[0].role?.slug || "member";
      return role as UserRole;
    }

    return "member";
  } catch (error) {
    console.error("Error getting user role from WorkOS:", error);
    return "member";
  }
}

/**
 * @deprecated Use `event.locals.user.role === 'admin'` in route handlers instead.
 * For route-level checks, use `requireAdmin()` from `$lib/auth/middleware`.
 *
 * This function makes an async call to WorkOS which is unnecessary since the role
 * is already available in `event.locals.user.role`.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  console.log("Is Admin: ", role);
  return role === "admin";
}

/**
 * @deprecated Use `event.locals.user.role === 'admin'`
 * in route handlers instead. For route-level checks, use `requireAdmin()` from `$lib/auth/middleware`.
 */
export async function isModerator(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "admin";
}

