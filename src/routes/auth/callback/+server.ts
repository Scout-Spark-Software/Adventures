import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { workosAuth } from "$lib/server/workos";

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const returnedState = url.searchParams.get("state");
  const expectedState = cookies.get("oauth_state");

  // Validate state to prevent login CSRF
  cookies.delete("oauth_state", { path: "/" });
  if (!returnedState || !expectedState || returnedState !== expectedState) {
    throw redirect(303, "/login?error=auth_failed");
  }

  if (error || !code) {
    throw redirect(303, "/login?error=auth_failed");
  }

  try {
    const { accessToken, refreshToken } = await workosAuth.authenticateWithCode(code);

    const cookieOptions = {
      path: "/",
      httpOnly: true,
      sameSite: "lax" as const,
      secure: url.protocol === "https:",
    };

    cookies.set("workos_access_token", accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60, // 1 hour
    });

    cookies.set("workos_refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    throw redirect(303, "/");
  } catch (err) {
    // Re-throw SvelteKit redirects
    if (typeof err === "object" && err !== null && "status" in err && "location" in err) {
      throw err;
    }
    console.error("Auth callback error:", err instanceof Error ? err.message : "unknown");
    throw redirect(303, "/login?error=auth_failed");
  }
};
