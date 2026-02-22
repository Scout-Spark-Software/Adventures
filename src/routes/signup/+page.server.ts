import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { workosAuth } from "$lib/server/workos";


export const load: PageServerLoad = async ({ url }) => {
  const email = url.searchParams.get("email");
  const needsVerification = url.searchParams.get("needsVerification") === "true";

  if (needsVerification && email) {
    // User came from login with unverified email
    // Try to get their user ID
    const user = await workosAuth.getUserByEmail(email);

    if (user) {
      // Resend verification email
      try {
        await workosAuth.sendVerificationEmail(user.id);
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }

      return {
        needsVerification: true,
        email,
        userId: user.id,
      };
    }
  }

  return {};
};

export const actions: Actions = {
  signup: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!name || !email || !password) {
      return fail(400, { error: "Name, email, and password are required" });
    }

    try {
      // Parse name into firstName and lastName
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || undefined;

      // Create user in WorkOS
      const user = await workosAuth.signUp(email, password, firstName, lastName);

      // Send verification email
      await workosAuth.sendVerificationEmail(user.id);

      // Return data to show verification form on same page
      return {
        needsVerification: true,
        email,
        userId: user.id,
      };
    } catch (error) {
      // SvelteKit redirects throw a special Redirect object with a status property
      // We need to re-throw it so SvelteKit can handle the redirect
      if (typeof error === "object" && error !== null && "status" in error && "location" in error) {
        throw error;
      }
      return fail(500, {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  },

  verify: async ({ request }) => {
    const formData = await request.formData();
    const code = formData.get("code")?.toString();
    const userId = formData.get("userId")?.toString();
    const email = formData.get("email")?.toString();

    if (!code || !userId || !email) {
      return fail(400, {
        needsVerification: true,
        email,
        userId,
        error: "Missing verification code or user information",
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return fail(400, {
        needsVerification: true,
        email,
        userId,
        error: "Verification code must be 6 digits",
      });
    }

    try {
      // Verify the email with WorkOS
      await workosAuth.verifyEmail(userId, code);

      // Email verified successfully - redirect to login
      throw redirect(303, "/login?verified=true");
    } catch (error) {
      // SvelteKit redirects throw a special object
      if (typeof error === "object" && error !== null && "status" in error && "location" in error) {
        throw error;
      }

      console.error("Verification error:", error);

      return fail(400, {
        needsVerification: true,
        email,
        userId,
        error:
          error instanceof Error ? error.message : "Invalid verification code. Please try again.",
      });
    }
  },

  resend: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get("userId")?.toString();
    const email = formData.get("email")?.toString();

    if (!userId) {
      return fail(400, {
        needsVerification: true,
        email,
        userId,
        error: "Missing user information",
      });
    }

    try {
      await workosAuth.sendVerificationEmail(userId);
      return {
        needsVerification: true,
        email,
        userId,
        success: true,
        message: "Verification code sent! Check your email.",
      };
    } catch (error) {
      return fail(500, {
        needsVerification: true,
        email,
        userId,
        error: error instanceof Error ? error.message : "Failed to send verification code",
      });
    }
  },
};
