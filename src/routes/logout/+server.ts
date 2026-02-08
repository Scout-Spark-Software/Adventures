import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { workosAuth } from "$lib/server/workos";

export const POST: RequestHandler = async ({ cookies }) => {
  const accessToken = cookies.get("workos_access_token");

  if (accessToken) {
    try {
      const sessionId = await workosAuth.extractSessionId(accessToken);
      await workosAuth.signOut(sessionId);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Clear both session cookies
  cookies.delete("workos_access_token", { path: "/" });
  cookies.delete("workos_refresh_token", { path: "/" });

  // Redirect to home page
  throw redirect(303, "/");
};
