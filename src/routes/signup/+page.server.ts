import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { workosAuth } from "$lib/server/workos";
import { sanitizeAuthError } from "$lib/security";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";

zxcvbnOptions.setOptions({
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
});

const MIN_STRENGTH = 3;

// 30-minute window for the verification flow
const VERIFICATION_COOKIE_MAX_AGE = 30 * 60;

export const load: PageServerLoad = async ({ url, cookies }) => {
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

      // Bind the userId server-side so verify/resend actions don't trust form data
      cookies.set("pending_verification_user_id", user.id, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: VERIFICATION_COOKIE_MAX_AGE,
      });

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
  signup: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!name || !email || !password || !confirmPassword) {
      return fail(400, { error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return fail(400, { error: "Passwords do not match" });
    }

    if (password.length < 12) {
      return fail(400, { error: "Password must be at least 12 characters long" });
    }

    const { score } = zxcvbn(password);
    if (score < MIN_STRENGTH) {
      return fail(400, {
        error: "Password is too weak. Try using a more unique phrase or mixing unrelated words.",
      });
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

      // Bind the userId server-side so verify/resend actions don't trust form data
      cookies.set("pending_verification_user_id", user.id, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: url.protocol === "https:",
        maxAge: VERIFICATION_COOKIE_MAX_AGE,
      });

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
      console.error("Signup error:", error instanceof Error ? error.message : "unknown");
      return fail(400, { error: sanitizeAuthError(error) });
    }
  },

  verify: async ({ request, cookies }) => {
    const formData = await request.formData();
    const code = formData.get("code")?.toString();
    const email = formData.get("email")?.toString();

    // Read userId from the server-set cookie, not from form data
    const userId = cookies.get("pending_verification_user_id");

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

      // Clear the verification cookie
      cookies.delete("pending_verification_user_id", { path: "/" });

      // Email verified successfully - redirect to login
      throw redirect(303, "/login?verified=true");
    } catch (error) {
      // SvelteKit redirects throw a special object
      if (typeof error === "object" && error !== null && "status" in error && "location" in error) {
        throw error;
      }

      console.error("Verification error:", error instanceof Error ? error.message : "unknown");

      return fail(400, {
        needsVerification: true,
        email,
        userId,
        error: "Invalid or expired verification code. Please try again.",
      });
    }
  },

  resend: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();

    // Read userId from the server-set cookie, not from form data
    const userId = cookies.get("pending_verification_user_id");

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
      console.error("Resend error:", error instanceof Error ? error.message : "unknown");
      return fail(500, {
        needsVerification: true,
        email,
        userId,
        error: "Failed to send verification code. Please try again.",
      });
    }
  },
};
