import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { workosAuth } from "$lib/server/workos";

export const load: PageServerLoad = async ({ url }) => {
  const passwordReset = url.searchParams.get("passwordReset") === "true";
  const authError = url.searchParams.get("error");

  // If there's a flash message to show, return it and let the page render briefly
  if (passwordReset || authError) {
    return { passwordReset, authError };
  }

  // Otherwise redirect directly to WorkOS AuthKit hosted UI
  const redirectUri = `${url.origin}/auth/callback`;
  const authUrl = await workosAuth.getAuthorizationUrl(redirectUri, "sign-in");
  throw redirect(302, authUrl);
};
