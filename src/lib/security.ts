/** Shared security utilities used across API endpoints. */

/**
 * Sanitizes a filename to prevent path traversal attacks.
 * Strips directory separators and restricts characters to alphanumerics, dots, dashes, underscores.
 */
export function sanitizeFilename(name: string): string {
  // Remove any directory traversal components
  const basename = name.replace(/^.*[\\/]/, "");
  // Replace unsafe characters with underscore
  return basename.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.{2,}/g, "_");
}

/**
 * Validates and sanitizes a full-text search query.
 * Returns the trimmed query, or throws a 400 if invalid.
 */
export function sanitizeSearchQuery(q: string): string {
  // Strip null bytes
  const cleaned = q.replace(/\0/g, "").trim();
  if (cleaned.length > 200) {
    return cleaned.slice(0, 200);
  }
  return cleaned;
}

/**
 * Parses and clamps a numeric query parameter.
 * Returns null if the value is missing or not a finite number.
 */
export function validateNumericParam(val: string | null, min: number, max: number): number | null {
  if (val === null || val === "") return null;
  const num = parseFloat(val);
  if (!isFinite(num)) return null;
  return Math.min(Math.max(num, min), max);
}

/**
 * Security headers applied to all responses.
 * CSP allows SvelteKit inline styles and Vercel Blob image CDN.
 */
export const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://unpkg.com",
    "img-src 'self' blob: data: https://files.adventurespark.org https://*.tile.openstreetmap.org https://pagead2.googlesyndication.com https://tpc.googlesyndication.com",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://pagead2.googlesyndication.com https://ep1.adtrafficquality.google",
    "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
    "font-src 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

/**
 * Maps internal/WorkOS error messages to safe user-facing strings.
 * Prevents leaking authentication implementation details to clients.
 */
export function sanitizeAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes("email") && (msg.includes("verif") || msg.includes("ownership"))) {
    return "Please verify your email address before logging in.";
  }
  if (
    msg.includes("password") ||
    msg.includes("credentials") ||
    msg.includes("invalid") ||
    msg.includes("not found") ||
    msg.includes("User not found") ||
    msg.includes("Unauthorized")
  ) {
    return "Invalid email or password.";
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Too many attempts. Please try again later.";
  }
  if (msg.includes("already exists") || msg.includes("already registered")) {
    return "An account with that email already exists.";
  }

  return "An unexpected error occurred. Please try again.";
}
