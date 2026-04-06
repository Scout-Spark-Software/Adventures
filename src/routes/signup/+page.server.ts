import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { workosAuth } from "$lib/server/workos";

export const load: PageServerLoad = async ({ url }) => {
  const redirectUri = `${url.origin}/auth/callback`;
  const authUrl = await workosAuth.getAuthorizationUrl(redirectUri, "sign-up");
  throw redirect(302, authUrl);
};
