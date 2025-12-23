import { WorkOS } from "@workos-inc/node";
import { jwtVerify, createRemoteJWKSet } from "jose";
import {
  WORKOS_API_KEY,
  WORKOS_CLIENT_ID,
  WORKOS_ORGANIZATION_ID,
  WORKOS_COOKIE_PASSWORD,
} from "$env/static/private";

if (
  !WORKOS_API_KEY ||
  !WORKOS_CLIENT_ID ||
  !WORKOS_ORGANIZATION_ID ||
  !WORKOS_COOKIE_PASSWORD
) {
  throw new Error(
    "WorkOS environment variables are not set. " +
      "Please ensure WORKOS_API_KEY, WORKOS_CLIENT_ID, WORKOS_ORGANIZATION_ID, and WORKOS_COOKIE_PASSWORD are in your .env file.",
  );
}

// Initialize WorkOS client
export const workos = new WorkOS(WORKOS_API_KEY);

// Export config for easy access
export const workosConfig = {
  clientId: WORKOS_CLIENT_ID,
  organizationId: WORKOS_ORGANIZATION_ID,
  cookiePassword: WORKOS_COOKIE_PASSWORD,
};

// WorkOS User Management authentication methods
export const workosAuth = {
  // Sign up new user in the organization
  async signUp(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) {
    try {
      // Create user (email verification required)
      const user = await workos.userManagement.createUser({
        email,
        password,
        firstName,
        lastName,
        emailVerified: false, // Require email verification
      });

      // Add user to the organization as a member
      await workos.userManagement.createOrganizationMembership({
        userId: user.id,
        organizationId: workosConfig.organizationId,
      });

      return user;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to create user",
      );
    }
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    try {
      const authResponse = await workos.userManagement.authenticateWithPassword(
        {
          clientId: workosConfig.clientId,
          email,
          password,
        },
      );

      return {
        user: authResponse.user,
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Authentication failed",
      );
    }
  },

  // Verify session with access token
  async verifySession(accessToken: string) {
    try {
      // Create JWKS endpoint for WorkOS
      const JWKS = createRemoteJWKSet(
        new URL(`https://api.workos.com/sso/jwks/${workosConfig.clientId}`),
      );

      // Verify the JWT
      const { payload } = await jwtVerify(accessToken, JWKS, {
        issuer: `https://api.workos.com/user_management/${workosConfig.clientId}`,
      });

      // Extract user ID from the 'sub' claim
      const userId = payload.sub;

      if (!userId) {
        return null;
      }

      // Fetch the full user details
      const user = await workos.userManagement.getUser(userId);
      return user;
    } catch (error) {
      console.error("Session verification failed:", error);
      return null;
    }
  },

  // Refresh session
  async refreshSession(refreshToken: string) {
    try {
      const authResponse =
        await workos.userManagement.authenticateWithRefreshToken({
          clientId: workosConfig.clientId,
          refreshToken,
        });

      return {
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
      };
    } catch (error) {
      throw new Error("Failed to refresh session");
    }
  },

  // Update password
  async updatePassword(userId: string, newPassword: string) {
    try {
      await workos.userManagement.updateUser({
        userId,
        password: newPassword,
      });
      return true;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to update password",
      );
    }
  },

  // Get user by ID
  async getUser(userId: string) {
    try {
      const user = await workos.userManagement.getUser(userId);
      return user;
    } catch (error) {
      throw new Error("Failed to get user");
    }
  },

  // Sign out (invalidate session)
  async signOut(sessionId?: string) {
    if (sessionId) {
      try {
        await workos.userManagement.revokeSession({ sessionId });
      } catch (error) {
        console.error("Failed to revoke session:", error);
      }
    }
    // Session cleanup happens via cookie deletion
    return true;
  },

  // Send email verification code
  async sendVerificationEmail(userId: string) {
    try {
      await workos.userManagement.sendVerificationEmail({ userId });
      return true;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to send verification email",
      );
    }
  },

  // Verify email with code
  async verifyEmail(userId: string, code: string) {
    try {
      const response = await workos.userManagement.verifyEmail({
        userId,
        code,
      });
      return response.user;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to verify email",
      );
    }
  },

  // Get user by email
  async getUserByEmail(email: string) {
    try {
      const { data: users } = await workos.userManagement.listUsers({
        email,
        organizationId: workosConfig.organizationId,
      });

      if (users.length === 0) {
        return null;
      }

      return users[0];
    } catch (error) {
      console.error("Failed to get user by email:", error);
      return null;
    }
  },
};
