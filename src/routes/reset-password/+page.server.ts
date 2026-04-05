import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { workosAuth } from "$lib/server/workos";
import { sanitizeAuthError } from "$lib/security";
import { MIN_PASSWORD_LENGTH } from "$lib/utils/consts";

export const load: PageServerLoad = async ({ url }) => {
  const token = url.searchParams.get("token");
  return { token };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const token = formData.get("token")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!token) {
      return fail(400, { error: "Reset token is missing. Please use the link from your email.", token: "" });
    }

    if (!password || !confirmPassword) {
      return fail(400, { error: "Please fill in all fields", token });
    }

    if (password !== confirmPassword) {
      return fail(400, { error: "Passwords do not match", token });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return fail(400, { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`, token });
    }

    try {
      await workosAuth.resetPassword(token, password);
      throw redirect(303, "/login?passwordReset=true");
    } catch (error) {
      if (typeof error === "object" && error !== null && "status" in error && "location" in error) {
        throw error;
      }

      console.error("Reset password error:", error instanceof Error ? error.message : "unknown");
      return fail(400, { error: sanitizeAuthError(error), token });
    }
  },
};
