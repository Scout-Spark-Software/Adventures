import { VALID_STATUSES, type Status } from "$lib/db/schemas";

/**
 * Check if the user has admin or moderator privileges.
 */
export function isPrivilegedUser(
  user: App.Locals["user"],
): boolean {
  return user?.role === "admin" || user?.role === "moderator";
}

/**
 * Type guard that validates a status string against the allowed enum values.
 */
function isValidStatus(value: string): value is Status {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

/**
 * Parse and validate a status query param. Returns the validated status,
 * coercing to "approved" for non-privileged users requesting restricted
 * statuses, and ignoring unrecognized values.
 */
export function parseStatusParam(
  status: string | null,
  privileged: boolean,
): Status | null {
  if (!status) return null;

  if (!isValidStatus(status)) {
    return null;
  }

  // Non-privileged users can only view approved content
  if (!privileged && status !== "approved") {
    return "approved";
  }

  return status;
}
