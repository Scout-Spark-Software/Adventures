import type { PageServerLoad } from "./$types";
import { requireAdmin } from "$lib/auth/middleware";

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);

  const [featureRes, amenityRes, facilityRes] = await Promise.all([
    event.fetch("/api/feature-types"),
    event.fetch("/api/amenity-types"),
    event.fetch("/api/facility-types"),
  ]);

  return {
    featureTypes: featureRes.ok ? await featureRes.json() : [],
    amenityTypes: amenityRes.ok ? await amenityRes.json() : [],
    facilityTypes: facilityRes.ok ? await facilityRes.json() : [],
  };
};
