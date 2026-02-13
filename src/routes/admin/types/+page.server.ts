import type { PageServerLoad } from "./$types";
import { requireAdmin } from "$lib/auth/middleware";

export const load: PageServerLoad = async (event) => {
  await requireAdmin(event);

  const [featureTypes, amenityTypes, facilityTypes] = await Promise.all([
    event.fetch("/api/feature-types").then((r) => r.json()),
    event.fetch("/api/amenity-types").then((r) => r.json()),
    event.fetch("/api/facility-types").then((r) => r.json()),
  ]);

  return {
    featureTypes,
    amenityTypes,
    facilityTypes,
  };
};
