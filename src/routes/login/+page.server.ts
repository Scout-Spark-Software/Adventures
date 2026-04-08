import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { workosAuth } from "$lib/server/workos";

export const load: PageServerLoad = async ({ url, cookies }) => {
  const passwordReset = url.searchParams.get("passwordReset") === "true";
  const authError = url.searchParams.get("error");

  // If there's a flash message to show, return it and let the page render briefly
  if (passwordReset || authError) {
    return { passwordReset, authError };
  }

  // Generate a random state value to prevent login CSRF
  const state = crypto.randomUUID();
  cookies.set("oauth_state", state, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    maxAge: 300, // 5 minutes
  });

  // Redirect directly to WorkOS AuthKit hosted UI
  const redirectUri = `${url.origin}/auth/callback`;
  const authUrl = await workosAuth.getAuthorizationUrl(redirectUri, state, "sign-in");
  throw redirect(302, authUrl);
};
