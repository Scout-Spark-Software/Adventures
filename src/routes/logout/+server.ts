import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { workosAuth } from "$lib/server/workos";

export const POST: RequestHandler = async ({ cookies }) => {
  // Get the access token (optional for signOut)
  const accessToken = cookies.get("workos_access_token");

  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const sessionId = payload.sid;
      await workosAuth.signOut(sessionId);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Clear both session cookies
  cookies.delete("workos_access_token", { path: "/" });
  cookies.delete("workos_refresh_token", { path: "/" });

  // Redirect to login page
  throw redirect(303, "/login");
};
