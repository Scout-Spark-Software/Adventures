/**
 * Test-only endpoint: exchanges email+password for WorkOS session cookies.
 * Only available when NODE_ENV !== "production".
 */
import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { workosAuth } from "$lib/server/workos";
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ request, cookies, url }) => {
  if (env.NODE_ENV === "production") {
    throw error(404, "Not found");
  }

  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    throw error(400, "email and password are required");
  }

  const { accessToken, refreshToken } = await workosAuth.signIn(body.email, body.password);

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

  return json({ ok: true });
};
