import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { workosAuth } from "$lib/server/workos";
import { setUserRole } from "$lib/auth";

export const load: PageServerLoad = async ({ url, cookies }) => {
  const email = url.searchParams.get("email");
  const userId = url.searchParams.get("userId");

  if (!email || !userId) {
    throw redirect(303, "/signup");
  }

  return {
    email,
    userId,
  };
};

export const actions: Actions = {
  verify: async ({ request, url, cookies }) => {
    const formData = await request.formData();
    const code = formData.get("code")?.toString();
    const userId = url.searchParams.get("userId");
    const email = url.searchParams.get("email");

    if (!code || !userId || !email) {
      return fail(400, {
        error: "Missing verification code or user information",
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return fail(400, { error: "Verification code must be 6 digits" });
    }

    try {
      // Verify the email with WorkOS
      await workosAuth.verifyEmail(userId, code);

      // Create default role in local database
      try {
        await setUserRole(userId, "user");
      } catch (dbError) {
        console.error("Database error creating role:", dbError);
        // Role creation failed, but email is verified
        // Still redirect to login - role can be created on first login
      }

      // Email verified successfully - redirect to login
      throw redirect(303, "/login?verified=true");
    } catch (error) {
      // SvelteKit redirects throw a special object
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        "location" in error
      ) {
        throw error;
      }

      console.error("Verification error:", error);

      return fail(400, {
        error:
          error instanceof Error
            ? error.message
            : "Invalid verification code. Please try again.",
      });
    }
  },

  resend: async ({ url }) => {
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return fail(400, { error: "Missing user information" });
    }

    try {
      await workosAuth.sendVerificationEmail(userId);
      return {
        success: true,
        message: "Verification code sent! Check your email.",
      };
    } catch (error) {
      return fail(500, {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send verification code",
      });
    }
  },
};
