import "dotenv/config";
import { WorkOS } from "@workos-inc/node";

const userId = process.argv[2];

if (!userId) {
  console.error("Usage: npm run set-admin <user-id>");
  console.error("Example: npm run set-admin user_01ABC123...");
  process.exit(1);
}

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const organizationId = process.env.WORKOS_ORGANIZATION_ID!;

async function setAdmin() {
  try {
    const memberships = await workos.userManagement.listOrganizationMemberships({
      userId,
      organizationId,
    });

    if (memberships.data.length === 0) {
      console.error(`User ${userId} is not a member of this organization`);
      process.exit(1);
    }

    const membershipId = memberships.data[0].id;

    await workos.userManagement.updateOrganizationMembership(membershipId, {
      roleSlug: "admin",
    });

    console.log(`Successfully set user ${userId} as admin`);
    process.exit(0);
  } catch (error) {
    console.error("Error setting admin role:", error);
    process.exit(1);
  }
}

setAdmin();
