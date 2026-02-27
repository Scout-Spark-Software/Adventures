// src/lib/server/attribution.ts
import { db } from "$lib/db";
import { userProfiles, councils } from "$lib/db/schemas";
import { workosAuth } from "$lib/server/workos";
import { eq } from "drizzle-orm";

export interface Attribution {
  displayName: string | null;
  unitLabel: string | null;
}

export async function getAttribution(userId: string): Promise<Attribution> {
  const rows = await db
    .select({
      showUnitInfo: userProfiles.showUnitInfo,
      unitType: userProfiles.unitType,
      unitNumber: userProfiles.unitNumber,
      councilName: councils.name,
    })
    .from(userProfiles)
    .leftJoin(councils, eq(userProfiles.councilId, councils.id))
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const profile = rows[0] ?? null;

  if (!profile || profile.showUnitInfo === false) {
    return { displayName: null, unitLabel: null };
  }

  let displayName: string | null = null;
  try {
    const wUser = await workosAuth.getUser(userId);
    const first = wUser.firstName ?? "";
    const last = wUser.lastName ?? "";
    if (first || last) {
      displayName = last ? `${first} ${last.charAt(0).toUpperCase()}.` : first;
    }
  } catch {
    // WorkOS lookup failed — omit name gracefully
  }

  const parts: string[] = [];
  if (profile.unitType && profile.unitNumber) {
    parts.push(`${profile.unitType} ${profile.unitNumber}`);
  } else if (profile.unitType) {
    parts.push(profile.unitType);
  }
  if (profile.councilName) {
    parts.push(profile.councilName);
  }
  const unitLabel = parts.length > 0 ? parts.join(" · ") : null;

  return { displayName, unitLabel };
}

export async function getAttributions(userIds: string[]): Promise<Map<string, Attribution>> {
  const unique = [...new Set(userIds)];
  const results = await Promise.all(
    unique.map((id) => getAttribution(id).then((a) => [id, a] as const))
  );
  return new Map(results);
}
