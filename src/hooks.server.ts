import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { workosAuth } from "$lib/server/workos";

const authHandle: Handle = async ({ event, resolve }) => {
  // Get the access token from cookies
  const accessToken = event.cookies.get("workos_access_token");
  const refreshToken = event.cookies.get("workos_refresh_token");

  if (accessToken) {
    try {
      // Validate the session with WorkOS
      const user = await workosAuth.verifySession(accessToken);

      if (user) {
        // Get role from WorkOS
        const userRole = user.role || "user";

        // Set user info in locals for use throughout the app
        event.locals.user = {
          id: user.id,
          email: user.email,
          name: user.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user.email,
          role: userRole,
        };
        event.locals.userId = user.id;
      } else {
        // Invalid or expired session
        event.locals.user = null;
        event.locals.userId = null;
      }
    } catch (error) {
      // Session validation failed - check if we have a refresh token to try
      console.error("Session validation error:", error);

      // If this is a transient network error (e.g. JWKS timeout), don't
      // invalidate the session — just skip auth for this request.
      const isTransientError =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error.code === "ERR_JWKS_TIMEOUT" ||
          error.code === "ERR_JWKS_NO_MATCHING_KEY");

      if (isTransientError) {
        console.warn("Transient JWKS error, skipping auth for this request");
        event.locals.user = null;
        event.locals.userId = null;
        return resolve(event);
      }

      // If token is expired and we have a refresh token, try to refresh
      const isExpiredToken =
        (error instanceof Error &&
          (error.message.includes("expired") ||
            error.message.includes("exp"))) ||
        (typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "ERR_JWT_EXPIRED");

      if (refreshToken && isExpiredToken) {
        try {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await workosAuth.refreshSession(refreshToken);

          // Set new cookies
          const cookieOptions = {
            path: "/",
            httpOnly: true,
            sameSite: "lax" as const,
            secure: process.env.NODE_ENV === "production",
          };

          event.cookies.set("workos_access_token", newAccessToken, {
            ...cookieOptions,
            maxAge: 60 * 60, // 1 hour
          });

          event.cookies.set("workos_refresh_token", newRefreshToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });

          // Verify new access token and set user
          const user = await workosAuth.verifySession(newAccessToken);
          if (user) {
            // Get role from WorkOS
            const userRole = user.role || "user";

            event.locals.user = {
              id: user.id,
              email: user.email,
              name: user.firstName
                ? `${user.firstName} ${user.lastName || ""}`.trim()
                : user.email,
              role: userRole,
            };
            event.locals.userId = user.id;
          } else {
            event.locals.user = null;
            event.locals.userId = null;
          }
        } catch (refreshError) {
          // Refresh failed, clear cookies
          console.error("Session refresh error:", refreshError);
          event.cookies.delete("workos_access_token", { path: "/" });
          event.cookies.delete("workos_refresh_token", { path: "/" });
          event.locals.user = null;
          event.locals.userId = null;
        }
      } else {
        event.locals.user = null;
        event.locals.userId = null;
      }
    }
  } else if (refreshToken) {
    // No access token but have refresh token - try to refresh
    try {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await workosAuth.refreshSession(refreshToken);

      // Set new cookies
      const cookieOptions = {
        path: "/",
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
      };

      event.cookies.set("workos_access_token", newAccessToken, {
        ...cookieOptions,
        maxAge: 60 * 60, // 1 hour
      });

      event.cookies.set("workos_refresh_token", newRefreshToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      // Verify new access token and set user
      const user = await workosAuth.verifySession(newAccessToken);
      if (user) {
        // Get role from WorkOS
        const userRole = user.role || "user";

        event.locals.user = {
          id: user.id,
          email: user.email,
          name: user.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user.email,
          role: userRole,
        };
        event.locals.userId = user.id;
      } else {
        event.locals.user = null;
        event.locals.userId = null;
      }
    } catch (error) {
      // Refresh failed, clear cookies
      console.error("Session refresh error:", error);
      event.cookies.delete("workos_access_token", { path: "/" });
      event.cookies.delete("workos_refresh_token", { path: "/" });
      event.locals.user = null;
      event.locals.userId = null;
    }
  } else {
    // No session tokens
    event.locals.user = null;
    event.locals.userId = null;
  }

  return resolve(event);
};

export const handle: Handle = sequence(authHandle);
