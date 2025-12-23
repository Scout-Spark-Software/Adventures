import { db } from "../db";
import { userRoles } from "../db/schemas";
import { eq } from "drizzle-orm";

export type UserRole = "admin" | "moderator" | "user";

export async function getUserRole(userId: string): Promise<UserRole> {
  const role = await db.query.userRoles.findFirst({
    where: eq(userRoles.userId, userId),
  });
  return (role?.role as UserRole) || "user";
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "admin";
}

export async function isModerator(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "admin" || role === "moderator";
}

export async function setUserRole(
  userId: string,
  role: UserRole,
): Promise<void> {
  try {
    await db.insert(userRoles).values({ userId, role }).onConflictDoUpdate({
      target: userRoles.userId,
      set: { role },
    });
  } catch (error) {
    console.error("Error setting user role:", error);
    throw error;
  }
}
