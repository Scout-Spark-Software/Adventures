import { redirect, error } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

/**
 * Ensures the user is authenticated. Use this for routes that require any logged-in user.
 * For API routes (fetch calls), returns 401. For page routes, redirects to /login.
 * @returns The authenticated user object
 */
export function requireAuth(event: RequestEvent) {
  if (!event.locals.user || !event.locals.userId) {
    const isApiRoute = event.url?.pathname.startsWith("/api/");
    if (isApiRoute) {
      throw error(401, "Unauthorized");
    }
    throw redirect(302, "/login");
  }
  return event.locals.user;
}

/**
 * Ensures the user is authenticated and has admin role.
 * Use this for admin-only routes and API endpoints.
 * Redirects to /login if not authenticated, or to / if not an admin.
 * @returns The authenticated admin user object
 */
export function requireAdmin(event: RequestEvent) {
  const user = requireAuth(event);
  if (user.role !== "admin") {
    throw redirect(302, "/");
  }
  return user;
}

/**
 * Ensures the user is authenticated and has admin role.
 * Use this for moderation routes and API endpoints.
 * Redirects to /login if not authenticated, or to / if not an admin.
 * @returns The authenticated admin user object
 */
export function requireModerator(event: RequestEvent) {
  const user = requireAuth(event);
  if (user.role !== "admin") {
    throw redirect(302, "/");
  }
  return user;
}
