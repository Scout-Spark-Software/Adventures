import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { workosAuth } from "$lib/server/workos";
import { sanitizeAuthError } from "$lib/security";

// Best-effort rate limiting per IP. Not globally consistent across Cloudflare
// isolates — use Cloudflare WAF rate-limit rules for a production-grade solution.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

function checkRateLimit(ip: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now >= entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { limited: true, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { limited: false, retryAfterSeconds: 0 };
}

function clearRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

export const actions: Actions = {
  login: async ({ request, cookies, url }) => {
    const ip = getClientIp(request);
    const { limited, retryAfterSeconds } = checkRateLimit(ip);

    if (limited) {
      return fail(429, {
        error: `Too many login attempts. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
      });
    }

    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return fail(400, { error: "Email and password are required" });
    }

    try {
      // Sign in with WorkOS
      const { user: _user, accessToken, refreshToken } = await workosAuth.signIn(email, password);

      // Successful login — clear the rate-limit counter for this IP
      clearRateLimit(ip);

      // Set cookie options
      const cookieOptions = {
        path: "/",
        httpOnly: true,
        sameSite: "lax" as const,
        secure: url.protocol === "https:",
      };

      // Set the access token cookie (1 hour)
      cookies.set("workos_access_token", accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60, // 1 hour
      });

      // Set the refresh token cookie (7 days)
      cookies.set("workos_refresh_token", refreshToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      // Redirect to home or dashboard
      throw redirect(303, "/");
    } catch (error) {
      // SvelteKit redirects throw a special Redirect object with a status property
      // We need to re-throw it so SvelteKit can handle the redirect
      if (typeof error === "object" && error !== null && "status" in error && "location" in error) {
        throw error;
      }

      console.error("Login error:", error instanceof Error ? error.message : "unknown");

      // Check if error is about email verification
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("Email ownership must be verified") ||
        errorMessage.includes("email verification") ||
        errorMessage.includes("verify")
      ) {
        try {
          throw redirect(303, `/signup?email=${encodeURIComponent(email)}&needsVerification=true`);
        } catch (redirectError) {
          if (
            typeof redirectError === "object" &&
            redirectError !== null &&
            "status" in redirectError
          ) {
            throw redirectError;
          }
        }
      }

      return fail(401, { error: sanitizeAuthError(error) });
    }
  },
};
