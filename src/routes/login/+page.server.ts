import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { workosAuth } from "$lib/server/workos";

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return fail(400, { error: "Email and password are required" });
    }

    try {
      // Sign in with WorkOS
      const { user, accessToken, refreshToken } = await workosAuth.signIn(
        email,
        password,
      );

      // Set cookie options
      const cookieOptions = {
        path: "/",
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
      };

      // Set the access token cookie (1 hour)
      cookies.set("workos_access_token", accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60, // 1 hour
      });

      // Set the refresh token cookie (7 days)
      cookies.set("workos_refresh_token", refreshToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      // Redirect to home or dashboard
      throw redirect(303, "/");
    } catch (error) {
      // SvelteKit redirects throw a special Redirect object with a status property
      // We need to re-throw it so SvelteKit can handle the redirect
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        "location" in error
      ) {
        throw error;
      }

      console.error("Login error:", error);

      // Check if error is about email verification
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("Email ownership must be verified") ||
        errorMessage.includes("email verification") ||
        errorMessage.includes("verify")
      ) {
        // Get user ID to send verification email
        // We need to fetch the user by email to get their ID
        try {
          // Since we can't sign in, we need to handle this differently
          // Redirect to signup page which will show verification form
          throw redirect(
            303,
            `/signup?email=${encodeURIComponent(email)}&needsVerification=true`,
          );
        } catch (redirectError) {
          // Re-throw redirect
          if (
            typeof redirectError === "object" &&
            redirectError !== null &&
            "status" in redirectError
          ) {
            throw redirectError;
          }
        }
      }

      return fail(500, {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    }
  },
};
