import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { workosAuth } from "$lib/server/workos";

export const load: PageServerLoad = async ({ url, cookies }) => {
  // Generate a random state value to prevent login CSRF
  const state = crypto.randomUUID();
  cookies.set("oauth_state", state, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    maxAge: 300, // 5 minutes
  });

  const redirectUri = `${url.origin}/auth/callback`;
  const authUrl = await workosAuth.getAuthorizationUrl(redirectUri, state, "sign-up");
  throw redirect(302, authUrl);
};
