import { error } from "@sveltejs/kit";

const VALID_STATUSES = ["pending", "approved", "rejected"] as const;
type Status = (typeof VALID_STATUSES)[number];

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
 * Parse and validate a status query param. Returns the validated status or
 * throws 400 for invalid values / 403 for non-privileged access to
 * pending/rejected.
 */
export function parseStatusParam(
  status: string | null,
  privileged: boolean,
): Status | null {
  if (!status) return null;

  if (!isValidStatus(status)) {
    throw error(400, "Invalid status value");
  }

  // Non-privileged users may only request approved content explicitly
  if (!privileged && status !== "approved") {
    throw error(403, "Not authorized to filter by this status");
  }

  return status;
}
