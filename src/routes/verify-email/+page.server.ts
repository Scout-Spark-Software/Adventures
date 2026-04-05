import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { workosAuth } from "$lib/server/workos";

const VERIFICATION_COOKIE_MAX_AGE = 30 * 60;

export const load: PageServerLoad = async ({ url, cookies }) => {
  const email = url.searchParams.get("email");
  const userId = url.searchParams.get("userId");

  if (!email || !userId) {
    throw redirect(303, "/signup");
  }

  // Bind the userId server-side so verify/resend actions don't trust URL params
  cookies.set("pending_verification_user_id", userId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    maxAge: VERIFICATION_COOKIE_MAX_AGE,
  });

  return {
    email,
    userId,
  };
};

export const actions: Actions = {
  verify: async ({ request, url, cookies }) => {
    const formData = await request.formData();
    const code = formData.get("code")?.toString();
    const email = url.searchParams.get("email");

    // Read userId from the server-set cookie, not from URL/form params
    const userId = cookies.get("pending_verification_user_id");

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

      // Clear the verification cookie
      cookies.delete("pending_verification_user_id", { path: "/" });

      // Email verified successfully - redirect to login
      throw redirect(303, "/login?verified=true");
    } catch (error) {
      // SvelteKit redirects throw a special object
      if (typeof error === "object" && error !== null && "status" in error && "location" in error) {
        throw error;
      }

      console.error("Verification error:", error);

      return fail(400, {
        error:
          error instanceof Error ? error.message : "Invalid verification code. Please try again.",
      });
    }
  },

  resend: async ({ cookies }) => {
    // Read userId from the server-set cookie, not from URL params
    const userId = cookies.get("pending_verification_user_id");

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
        error: error instanceof Error ? error.message : "Failed to send verification code",
      });
    }
  },
};
