import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { workosAuth } from "$lib/server/workos";
import { env } from "$env/dynamic/private";

export const actions: Actions = {
  default: async ({ request, url }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();

    if (!email) {
      return fail(400, { error: "Email is required" });
    }

    try {
      const origin = env.ORIGIN || url.origin;
      const passwordResetUrl = `${origin}/reset-password`;

      await workosAuth.sendPasswordResetEmail(email, passwordResetUrl);

      return { success: true };
    } catch (error) {
      console.error("Forgot password error:", error instanceof Error ? error.message : "unknown");
      // Always return success to avoid leaking whether an email exists
      return { success: true };
    }
  },
};
