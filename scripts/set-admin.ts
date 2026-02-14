import "dotenv/config";
import { db } from "../src/lib/db/index.js";
import { userRoles } from "../src/lib/db/schemas/index.js";

// Get the user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error("Usage: npm run set-admin <user-id>");
  console.error("Example: npm run set-admin 123e4567-e89b-12d3-a456-426614174000");
  process.exit(1);
}

async function setAdmin() {
  try {
    await db
      .insert(userRoles)
      .values({ userId, role: "admin" })
      .onConflictDoUpdate({
        target: userRoles.userId,
        set: { role: "admin" },
      });

    console.log(`✅ Successfully set user ${userId} as admin`);
    process.exit(0);
  } catch (error) {
    console.error("Error setting admin role:", error);
    process.exit(1);
  }
}

setAdmin();
