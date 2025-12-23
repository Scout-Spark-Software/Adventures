import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { workosAuth } from "$lib/server/workos";
import { getUserRole, setUserRole } from "$lib/auth";

const authHandle: Handle = async ({ event, resolve }) => {
  // Get the access token from cookies
  const accessToken = event.cookies.get("workos_access_token");
  const refreshToken = event.cookies.get("workos_refresh_token");

  if (accessToken) {
    try {
      // Validate the session with WorkOS
      let user = await workosAuth.verifySession(accessToken);

      if (user) {
        // Set user info in locals for use throughout the app
        event.locals.user = {
          id: user.id,
          email: user.email,
          name: user.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user.email,
        };
        event.locals.userId = user.id;

        // Ensure user has a role in the database (auto-create if missing)
        try {
          const role = await getUserRole(user.id);
          if (!role) {
            // If no role exists, create default user role
            await setUserRole(user.id, "user");
          }
        } catch (roleError) {
          console.error("Error ensuring user role:", roleError);
          // Don't fail the request if role creation fails - user can still use the app
          // The role will be created on next successful call
        }
      } else {
        // Invalid or expired session
        event.locals.user = null;
        event.locals.userId = null;
      }
    } catch (error) {
      // Session validation failed - check if we have a refresh token to try
      console.error("Session validation error:", error);

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
            event.locals.user = {
              id: user.id,
              email: user.email,
              name: user.firstName
                ? `${user.firstName} ${user.lastName || ""}`.trim()
                : user.email,
            };
            event.locals.userId = user.id;

            // Ensure user has a role in the database
            try {
              const role = await getUserRole(user.id);
              if (!role) {
                await setUserRole(user.id, "user");
              }
            } catch (roleError) {
              console.error("Error ensuring user role:", roleError);
            }
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
        event.locals.user = {
          id: user.id,
          email: user.email,
          name: user.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user.email,
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
